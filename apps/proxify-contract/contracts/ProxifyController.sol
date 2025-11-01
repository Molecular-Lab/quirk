// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IProxify.sol";
import "./interfaces/IProxifyClientRegistry.sol";
import "./interfaces/IProxifyController.sol";

/**
 * @title ProxifyController
 * @author DeFAI Protocol
 * @notice Controller contract for Proxify with dynamic risk tier support
 * @dev Supports tier-specific operations and batch processing
 */
contract ProxifyController is IProxifyController, AccessControl, Pausable {
    using SafeERC20 for IERC20;

    // ============ Constants ============

    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");

    uint256 public constant MAX_BATCH_SIZE = 100;

    // ============ State Variables ============

    IProxify public proxify;
    IProxifyClientRegistry public clientRegistry;

    mapping(address => bool) public whitelistedProtocols;
    mapping(address => bool) public supportedTokens;

    // Track tier-to-protocol assignments (for transparency)
    mapping(bytes32 => address[]) public tierProtocols;
    mapping(bytes32 => mapping(address => bool)) public isTierProtocol;

    // ============ Constructor ============

    /**
     * @notice Initialize the controller
     * @param _proxify Address of Proxify contract
     * @param _clientRegistry Address of ProxifyClientRegistry contract
     * @param _adminMultisig Address of admin multisig
     * @param _guardian Address of guardian (for emergency pause)
     * @param _oracle Address of oracle
     */
    constructor(
        address _proxify,
        address _clientRegistry,
        address _adminMultisig,
        address _guardian,
        address _oracle
    ) {
        require(_proxify != address(0), "Invalid Proxify address");
        require(_clientRegistry != address(0), "Invalid registry address");
        require(_adminMultisig != address(0), "Invalid admin address");
        require(_guardian != address(0), "Invalid guardian address");
        require(_oracle != address(0), "Invalid oracle address");

        proxify = IProxify(_proxify);
        clientRegistry = IProxifyClientRegistry(_clientRegistry);

        _grantRole(DEFAULT_ADMIN_ROLE, _adminMultisig);
        _grantRole(GUARDIAN_ROLE, _guardian);
        _grantRole(ORACLE_ROLE, _oracle);
    }

    // ============ Core Oracle Functions ============

    /// @inheritdoc IProxifyController
    function executeTransfer(
        address token,
        address protocol,
        uint256 amount,
        bytes32 tierId,
        string calldata tierName
    )
        external
        onlyRole(ORACLE_ROLE)
        whenNotPaused
    {
        require(supportedTokens[token], "Token not supported");
        require(whitelistedProtocols[protocol], "Protocol not whitelisted");
        require(amount > 0, "Amount must be > 0");
        require(proxify.isTierInitialized(token, tierId), "Tier not initialized");

        // Transfer from Proxify to protocol
        IERC20(token).safeTransferFrom(address(proxify), protocol, amount);

        // Update staked amount tracking
        proxify.updateStaked(token, amount, true);

        emit TransferExecuted(token, protocol, amount, tierId, tierName, block.timestamp);
    }

    /// @inheritdoc IProxifyController
    function staking(
        address token,
        uint256 amount,
        address to
    )
        external
        onlyRole(ORACLE_ROLE)
        whenNotPaused
    {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be > 0");
        require(to != address(0), "Invalid recipient");
        
        proxify.staking(token, amount, to);
    }

    /// @inheritdoc IProxifyController
    function confirmUnstake(address token, uint256 amount)
        external
        onlyRole(ORACLE_ROLE)
        whenNotPaused
    {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be > 0");

        proxify.updateStaked(token, amount, false);

        emit UnstakedFromProtocol(token, amount, block.timestamp);
    }

    // ============ Tier Index Management ============

    /// @inheritdoc IProxifyController
    function updateTierIndex(
        address token,
        bytes32 tierId,
        uint256 newIndex
    )
        external
        onlyRole(ORACLE_ROLE)
        whenNotPaused
    {
        require(supportedTokens[token], "Token not supported");

        (uint256 oldIndex,) = proxify.getTierIndexWithTimestamp(token, tierId);

        proxify.updateTierIndex(token, tierId, newIndex);

        emit TierIndexUpdated(token, tierId, oldIndex, newIndex, block.timestamp);
    }

    /// @inheritdoc IProxifyController
    function batchUpdateTierIndices(
        address token,
        bytes32[] calldata tierIds,
        uint256[] calldata newIndices
    )
        external
        onlyRole(ORACLE_ROLE)
        whenNotPaused
    {
        require(supportedTokens[token], "Token not supported");
        require(tierIds.length == newIndices.length, "Array length mismatch");
        require(tierIds.length > 0, "Empty arrays");

        proxify.batchUpdateTierIndices(token, tierIds, newIndices);

        emit BatchTierIndicesUpdated(token, tierIds.length, block.timestamp);
    }

    /// @inheritdoc IProxifyController
    function initializeTier(
        address token,
        bytes32 tierId
    )
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(supportedTokens[token], "Token not supported");

        proxify.initializeTier(token, tierId);

        emit TierInitialized(token, tierId, 1e18, block.timestamp);
    }

    /// @inheritdoc IProxifyController
    function batchInitializeTiers(
        address token,
        bytes32[] calldata tierIds
    )
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(supportedTokens[token], "Token not supported");
        require(tierIds.length > 0, "Empty array");

        for (uint i = 0; i < tierIds.length; i++) {
            proxify.initializeTier(token, tierIds[i]);
            emit TierInitialized(token, tierIds[i], 1e18, block.timestamp);
        }
    }

    // ============ Batch Withdrawal ============

    /// @inheritdoc IProxifyController
    function batchWithdraw(IProxify.WithdrawalExecution[] calldata executions)
        external
        onlyRole(ORACLE_ROLE)
        whenNotPaused
        returns (uint256 batchId)
    {
        require(executions.length > 0, "Empty batch");
        require(executions.length <= MAX_BATCH_SIZE, "Batch size exceeded");

        // Validate all requests use same token
        address token = executions[0].token;
        require(supportedTokens[token], "Token not supported");

        for (uint i = 0; i < executions.length; i++) {
            require(executions[i].token == token, "All withdrawals must use same token");
        }

        // Generate batch ID
        batchId = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.number,
            executions.length
        )));

        // Execute batch through Proxify
        proxify.batchWithdraw(executions);

        // Calculate totals for event
        uint256 totalAmount = 0;
        uint256 totalServiceFees = 0;
        uint256 totalGasFees = 0;

        for (uint i = 0; i < executions.length; i++) {
            totalAmount += executions[i].netAmount;
            totalServiceFees += executions[i].serviceFee;
            totalGasFees += executions[i].gasFeeShare;
        }

        emit BatchWithdrawalExecuted(
            batchId,
            token,
            executions.length,
            totalAmount,
            totalServiceFees,
            totalGasFees,
            block.timestamp
        );

        return batchId;
    }

    // ============ Fee Management ============

    /// @inheritdoc IProxifyController
    function claimOperationFee(
        address token,
        address to,
        uint256 amount
    )
        external
        onlyRole(ORACLE_ROLE)
        whenNotPaused
    {
        require(supportedTokens[token], "Token not supported");
        proxify.claimOperationFee(token, to, amount);
    }

    /// @inheritdoc IProxifyController
    function claimProtocolRevenue(
        address token,
        address to,
        uint256 amount
    )
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(supportedTokens[token], "Token not supported");
        proxify.claimProtocolRevenue(token, to, amount);
    }

    /// @inheritdoc IProxifyController
    function claimClientRevenue(
        bytes32 clientId,
        address token,
        address to,
        uint256 amount
    )
        external
        onlyRole(ORACLE_ROLE)
        whenNotPaused
    {
        require(supportedTokens[token], "Token not supported");
        proxify.claimClientRevenue(clientId, token, to, amount);
    }

    // ============ Protocol & Tier Management ============

    /// @inheritdoc IProxifyController
    function assignProtocolToTier(
        bytes32 tierId,
        address protocol
    )
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(whitelistedProtocols[protocol], "Protocol not whitelisted");
        require(!isTierProtocol[tierId][protocol], "Already assigned");

        tierProtocols[tierId].push(protocol);
        isTierProtocol[tierId][protocol] = true;

        emit TierProtocolAssigned(tierId, protocol, block.timestamp);
    }

    /// @inheritdoc IProxifyController
    function removeProtocolFromTier(
        bytes32 tierId,
        address protocol
    )
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(isTierProtocol[tierId][protocol], "Not assigned");

        // Remove from array
        address[] storage protocols = tierProtocols[tierId];
        for (uint i = 0; i < protocols.length; i++) {
            if (protocols[i] == protocol) {
                protocols[i] = protocols[protocols.length - 1];
                protocols.pop();
                break;
            }
        }

        isTierProtocol[tierId][protocol] = false;

        emit TierProtocolRemoved(tierId, protocol, block.timestamp);
    }

    /// @inheritdoc IProxifyController
    function addWhitelistedProtocol(address protocol)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(protocol != address(0), "Invalid protocol address");
        require(!whitelistedProtocols[protocol], "Already whitelisted");

        whitelistedProtocols[protocol] = true;

        emit ProtocolWhitelisted(protocol, block.timestamp);
    }

    /// @inheritdoc IProxifyController
    function removeWhitelistedProtocol(address protocol)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(whitelistedProtocols[protocol], "Not whitelisted");

        whitelistedProtocols[protocol] = false;

        emit ProtocolRemovedFromWhitelist(protocol, block.timestamp);
    }

    // ============ Token Management ============

    /// @inheritdoc IProxifyController
    function addSupportedToken(address token)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(token != address(0), "Invalid token address");
        require(!supportedTokens[token], "Already supported");

        supportedTokens[token] = true;
        proxify.addSupportedToken(token);

        emit TokenAdded(token, block.timestamp);
    }

    /// @inheritdoc IProxifyController
    function removeSupportedToken(address token)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(supportedTokens[token], "Not supported");
        require(proxify.getTotalDeposits(token) == 0, "Token has active deposits");

        supportedTokens[token] = false;
        proxify.removeSupportedToken(token);

        emit TokenRemoved(token, block.timestamp);
    }

    // ============ Configurable Limit Management ============

    /// @inheritdoc IProxifyController
    function updateMaxBatchSize(uint256 _newMax)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        proxify.updateMaxBatchSize(_newMax);
    }

    /// @inheritdoc IProxifyController
    function updateMaxGasFeePerUser(uint256 _newMax)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        proxify.updateMaxGasFeePerUser(_newMax);
    }

    /// @inheritdoc IProxifyController
    function updateMaxIndexGrowth(uint256 _newMax)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        proxify.updateMaxIndexGrowth(_newMax);
    }

    // ============ Emergency Functions ============

    /// @inheritdoc IProxifyController
    function emergencyPause() external onlyRole(GUARDIAN_ROLE) {
        _pause();
        emit EmergencyPaused(msg.sender, block.timestamp);
    }

    /// @inheritdoc IProxifyController
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
        emit EmergencyUnpaused(msg.sender, block.timestamp);
    }

    // ============ View Functions ============

    /// @inheritdoc IProxifyController
    function getTierProtocols(bytes32 tierId) external view returns (address[] memory) {
        return tierProtocols[tierId];
    }

    /// @inheritdoc IProxifyController
    function isProtocolWhitelisted(address protocol) external view returns (bool) {
        return whitelistedProtocols[protocol];
    }

    /// @inheritdoc IProxifyController
    function isTokenSupported(address token) external view returns (bool) {
        return supportedTokens[token];
    }

    /// @inheritdoc IProxifyController
    function isPaused() external view returns (bool) {
        return paused();
    }

    /// @inheritdoc IProxifyController
    function getOperationFeeBalance(address token) external view returns (uint256) {
        return proxify.getOperationFeeBalance(token);
    }

    /// @inheritdoc IProxifyController
    function getProtocolRevenueBalance(address token) external view returns (uint256) {
        return proxify.getProtocolRevenueBalance(token);
    }

    /// @inheritdoc IProxifyController
    function getClientRevenueBalance(bytes32 clientId, address token) external view returns (uint256) {
        return proxify.getClientRevenueBalance(clientId, token);
    }
}
