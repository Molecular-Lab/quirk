// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IProxify.sol";

/**
 * @title IProxifyController
 * @author DeFAI Protocol
 * @notice Interface for ProxifyController with dynamic risk tier support
 * @dev Orchestrates operations between oracle, Proxify vault, and protocol integrations
 */
interface IProxifyController {

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
    ) external;

    /**
     * @notice Withdraw funds from Proxify vault to staking executor wallet
     * @dev Oracle manages tier allocation and protocol staking off-chain, then updates indices based on yields
     * @param token Token address to withdraw
     * @param amount Amount to withdraw from stakeable balance
     * @param to Staking executor wallet address
     */
    function staking(
        address token,
        uint256 amount,
        address to
    ) external;

    /**
     * @notice Confirm unstaking from protocols (when funds return to Proxify)
     * @param token Token address
     * @param amount Amount unstaked
     */
    function confirmUnstake(address token, uint256 amount) external;

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
    ) external;

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
    ) external;

    /**
     * @notice Initialize a new tier for a token
     * @param token Token address
     * @param tierId Tier identifier
     */
    function initializeTier(
        address token,
        bytes32 tierId
    ) external;

    /**
     * @notice Batch initialize multiple tiers for a token
     * @param token Token address
     * @param tierIds Array of tier identifiers to initialize
     */
    function batchInitializeTiers(
        address token,
        bytes32[] calldata tierIds
    ) external;

    // ============ Batch Withdrawal ============

    /**
     * @notice Execute batch withdrawals (oracle pre-calculates all values)
     * @dev This is the gas-efficient way to process multiple withdrawals
     * @param executions Array of withdrawal executions with pre-calculated values
     * @return batchId Unique identifier for this batch
     */
    function batchWithdraw(IProxify.WithdrawalExecution[] calldata executions)
        external
        returns (uint256 batchId);

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
    ) external;

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
    ) external;

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
    ) external;

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
    ) external;

    /**
     * @notice Remove protocol from tier assignment
     * @param tierId Tier identifier
     * @param protocol Protocol address
     */
    function removeProtocolFromTier(
        bytes32 tierId,
        address protocol
    ) external;

    /**
     * @notice Add protocol to whitelist
     * @param protocol Protocol address
     */
    function addWhitelistedProtocol(address protocol) external;

    /**
     * @notice Remove protocol from whitelist
     * @param protocol Protocol address
     */
    function removeWhitelistedProtocol(address protocol) external;

    // ============ Token Management ============

    /**
     * @notice Add supported token
     * @param token Token address
     */
    function addSupportedToken(address token) external;

    /**
     * @notice Remove supported token
     * @param token Token address
     */
    function removeSupportedToken(address token) external;

    // ============ Configurable Limit Management ============

    /**
     * @notice Update maximum batch size for withdrawals
     * @dev Admin can adjust this based on gas limits and network conditions
     * @param _newMax New maximum batch size (1-1000)
     */
    function updateMaxBatchSize(uint256 _newMax) external;

    /**
     * @notice Update maximum gas fee per user (deprecated - no-op)
     * @dev This function is kept for interface compatibility but does nothing
     *      Gas fee validation removed because different tokens have different decimals
     *      Oracle is trusted to calculate reasonable gas fees per withdrawal
     * @param _newMax Ignored parameter
     */
    function updateMaxGasFeePerUser(uint256 _newMax) external;

    /**
     * @notice Update maximum index growth multiplier
     * @dev Admin can adjust APY growth safety limits
     * @param _newMax New maximum growth multiplier (2x-100x)
     */
    function updateMaxIndexGrowth(uint256 _newMax) external;

    // ============ Emergency Functions ============

    /**
     * @notice Emergency pause (guardian only)
     */
    function emergencyPause() external;

    /**
     * @notice Unpause (admin only)
     */
    function unpause() external;

    // ============ View Functions ============

    /**
     * @notice Get protocols assigned to a tier
     * @param tierId Tier identifier
     * @return Array of protocol addresses
     */
    function getTierProtocols(bytes32 tierId) external view returns (address[] memory);

    /**
     * @notice Check if protocol is whitelisted
     * @param protocol Protocol address
     * @return bool True if whitelisted
     */
    function isProtocolWhitelisted(address protocol) external view returns (bool);

    /**
     * @notice Check if token is supported
     * @param token Token address
     * @return bool True if supported
     */
    function isTokenSupported(address token) external view returns (bool);

    /**
     * @notice Check if contract is paused
     * @return bool True if paused
     */
    function isPaused() external view returns (bool);

    /**
     * @notice Get operation fee balance for a token
     * @param token Token address
     * @return Balance available for oracle to claim
     */
    function getOperationFeeBalance(address token) external view returns (uint256);

    /**
     * @notice Get protocol revenue balance for a token
     * @param token Token address
     * @return Balance available for protocol to claim
     */
    function getProtocolRevenueBalance(address token) external view returns (uint256);

    /**
     * @notice Get client revenue balance
     * @param clientId Client identifier
     * @param token Token address
     * @return Balance available for client to claim
     */
    function getClientRevenueBalance(bytes32 clientId, address token) external view returns (uint256);
}
