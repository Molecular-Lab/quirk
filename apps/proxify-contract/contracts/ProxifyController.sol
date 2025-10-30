// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IProxify.sol";
import "./interfaces/IProxifyClientRegistry.sol";

/**
 * @title ProxifyController
 * @author DeFAI Protocol
 * @notice Controller contract for Proxify with dynamic risk tier support
 * @dev Supports tier-specific operations and batch processing
 */
contract ProxifyController is AccessControl, Pausable {
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

    // ============ Events ============

    event TransferExecuted(
        address indexed token,
        address indexed protocol,
        uint256 amount,
        bytes32 indexed tierId,
        string tierName,
        uint256 timestamp
    );

    event TierIndexUpdated(
        address indexed token,
        bytes32 indexed tierId,
        uint256 oldIndex,
        uint256 newIndex,
        uint256 timestamp
    );

    event BatchTierIndicesUpdated(
        address indexed token,
        uint256 tierCount,
        uint256 timestamp
    );

    event TierInitialized(
        address indexed token,
        bytes32 indexed tierId,
        uint256 initialIndex,
        uint256 timestamp
    );

    event TierProtocolAssigned(
        bytes32 indexed tierId,
        address indexed protocol,
        uint256 timestamp
    );

    event TierProtocolRemoved(
        bytes32 indexed tierId,
        address indexed protocol,
        uint256 timestamp
    );

    event BatchWithdrawalExecuted(
        uint256 indexed batchId,
        address indexed token,
        uint256 requestCount,
        uint256 totalAmount,
        uint256 totalServiceFees,
        uint256 totalGasFees,
        uint256 timestamp
    );

    event UnstakedFromProtocol(
        address indexed token,
        uint256 amount,
        uint256 timestamp
    );

    event ProtocolWhitelisted(
        address indexed protocol,
        uint256 timestamp
    );

    event ProtocolRemovedFromWhitelist(
        address indexed protocol,
        uint256 timestamp
    );

    event TokenAdded(
        address indexed token,
        uint256 timestamp
    );

    event TokenRemoved(
        address indexed token,
        uint256 timestamp
    );

    event EmergencyPaused(
        address indexed guardian,
        uint256 timestamp
    );

    event EmergencyUnpaused(
        address indexed admin,
        uint256 timestamp
    );

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

    /**
     * @notice Execute transfer to protocol for a specific tier
     * @dev Oracle specifies which tier this transfer belongs to (for tracking and transparency)
     * @param token Token address
     * @param protocol Protocol address (must be whitelisted)
     * @param amount Amount to transfer
     * @param tierId Risk tier identifier
     * @param tierName Human-readable tier name (for events)
     */
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

    /**
     * @notice Confirm unstaking from protocols (when funds return to Proxify)
     * @param token Token address
     * @param amount Amount unstaked
     */
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

    /**
     * @notice Update vault index for a single tier
     * @param token Token address
     * @param tierId Tier identifier
     * @param newIndex New index value
     */
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

    /**
     * @notice Batch update tier indices (gas-efficient for daily updates)
     * @dev Oracle calculates new indices off-chain based on protocol yields
     * @param token Token address
     * @param tierIds Array of tier identifiers
     * @param newIndices Array of new index values
     */
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

    /**
     * @notice Initialize a new tier for a token
     * @param token Token address
     * @param tierId Tier identifier
     */
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

    /**
     * @notice Batch initialize multiple tiers for a token
     * @param token Token address
     * @param tierIds Array of tier identifiers to initialize
     */
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

    /**
     * @notice Execute batch withdrawals (oracle pre-calculates all values)
     * @dev This is the gas-efficient way to process multiple withdrawals
     * @param executions Array of withdrawal executions with pre-calculated values
     * @return batchId Unique identifier for this batch
     */
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

    /**
     * @notice Oracle claims accumulated operation fees
     * @param token Token address
     * @param to Recipient address
     * @param amount Amount to claim
     */
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

    /**
     * @notice Admin claims accumulated protocol revenue
     * @param token Token address
     * @param to Recipient address (protocol treasury)
     * @param amount Amount to claim
     */
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

    /**
     * @notice Client claims their accumulated revenue
     * @param clientId Client identifier
     * @param token Token address
     * @param to Recipient address (client wallet)
     * @param amount Amount to claim
     */
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

    /**
     * @notice Assign a protocol to a tier (for tracking purposes)
     * @dev This helps track which protocols belong to which risk tier
     * @param tierId Tier identifier
     * @param protocol Protocol address
     */
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

    /**
     * @notice Remove protocol from tier assignment
     * @param tierId Tier identifier
     * @param protocol Protocol address
     */
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

    /**
     * @notice Add protocol to whitelist
     * @param protocol Protocol address
     */
    function addWhitelistedProtocol(address protocol)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(protocol != address(0), "Invalid protocol address");
        require(!whitelistedProtocols[protocol], "Already whitelisted");

        whitelistedProtocols[protocol] = true;

        emit ProtocolWhitelisted(protocol, block.timestamp);
    }

    /**
     * @notice Remove protocol from whitelist
     * @param protocol Protocol address
     */
    function removeWhitelistedProtocol(address protocol)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(whitelistedProtocols[protocol], "Not whitelisted");

        whitelistedProtocols[protocol] = false;

        emit ProtocolRemovedFromWhitelist(protocol, block.timestamp);
    }

    // ============ Token Management ============

    /**
     * @notice Add supported token
     * @param token Token address
     */
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

    /**
     * @notice Remove supported token
     * @param token Token address
     */
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

    /**
     * @notice Update maximum batch size for withdrawals
     * @dev Admin can adjust this based on gas limits and network conditions
     * @param _newMax New maximum batch size (1-1000)
     */
    function updateMaxBatchSize(uint256 _newMax)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        proxify.updateMaxBatchSize(_newMax);
    }

    /**
     * @notice Update maximum gas fee per user (deprecated - no-op)
     * @dev This function is kept for interface compatibility but does nothing
     *      Gas fee validation removed because different tokens have different decimals
     *      Oracle is trusted to calculate reasonable gas fees per withdrawal
     * @param _newMax Ignored parameter
     */
    function updateMaxGasFeePerUser(uint256 _newMax)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        proxify.updateMaxGasFeePerUser(_newMax);
    }

    /**
     * @notice Update maximum index growth multiplier
     * @dev Admin can adjust APY growth safety limits
     * @param _newMax New maximum growth multiplier (2x-10x)
     */
    function updateMaxIndexGrowth(uint256 _newMax)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        proxify.updateMaxIndexGrowth(_newMax);
    }

    // ============ Emergency Functions ============

    /**
     * @notice Emergency pause (guardian only)
     */
    function emergencyPause() external onlyRole(GUARDIAN_ROLE) {
        _pause();
        emit EmergencyPaused(msg.sender, block.timestamp);
    }

    /**
     * @notice Unpause (admin only)
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
        emit EmergencyUnpaused(msg.sender, block.timestamp);
    }

    // ============ View Functions ============

    /**
     * @notice Get protocols assigned to a tier
     * @param tierId Tier identifier
     * @return Array of protocol addresses
     */
    function getTierProtocols(bytes32 tierId) external view returns (address[] memory) {
        return tierProtocols[tierId];
    }

    /**
     * @notice Check if protocol is whitelisted
     * @param protocol Protocol address
     * @return bool True if whitelisted
     */
    function isProtocolWhitelisted(address protocol) external view returns (bool) {
        return whitelistedProtocols[protocol];
    }

    /**
     * @notice Check if token is supported
     * @param token Token address
     * @return bool True if supported
     */
    function isTokenSupported(address token) external view returns (bool) {
        return supportedTokens[token];
    }

    /**
     * @notice Check if contract is paused
     * @return bool True if paused
     */
    function isPaused() external view returns (bool) {
        return paused();
    }

    /**
     * @notice Get operation fee balance for a token
     * @param token Token address
     * @return Balance available for oracle to claim
     */
    function getOperationFeeBalance(address token) external view returns (uint256) {
        return proxify.getOperationFeeBalance(token);
    }

    /**
     * @notice Get protocol revenue balance for a token
     * @param token Token address
     * @return Balance available for protocol to claim
     */
    function getProtocolRevenueBalance(address token) external view returns (uint256) {
        return proxify.getProtocolRevenueBalance(token);
    }

    /**
     * @notice Get client revenue balance
     * @param clientId Client identifier
     * @param token Token address
     * @return Balance available for client to claim
     */
    function getClientRevenueBalance(bytes32 clientId, address token) external view returns (uint256) {
        return proxify.getClientRevenueBalance(clientId, token);
    }
}
