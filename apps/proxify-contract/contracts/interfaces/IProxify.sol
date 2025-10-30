// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IProxify
 * @author DeFAI Protocol
 * @notice Interface for Proxify with dynamic risk tier support
 * @dev Supports unlimited custom risk tiers and batch withdrawals
 */
interface IProxify {

    // ============ Structs ============

    /**
     * @notice User account information per risk tier
     * @dev Tracks per-user, per-tier, per-token position in the vault
     * @param balance Balance units (at entry index, not current token value)
     * @param entryIndex Vault index at time of deposit - used to calculate yield earned
     * @param depositedAt Block timestamp of first deposit (for fee calculation)
     */
    struct Account {
        uint256 balance;
        uint256 entryIndex;
        uint256 depositedAt;
    }

    /**
     * @notice Withdrawal execution data for batch processing
     * @dev Oracle calculates all values off-chain, contract validates and executes
     * @param clientId The B2B client's identifier
     * @param userId The end user's identifier
     * @param token Token address being withdrawn
     * @param to Recipient address for withdrawn funds
     * @param tierIds Array of risk tier identifiers to withdraw from
     * @param tierReductions Array of balance units to reduce per tier (must match tierIds length)
     * @param grossAmount Total token value before fees (after applying growth indices)
     * @param serviceFee Service fee amount (percentage of yield)
     * @param gasFeeShare User's share of batch gas cost
     * @param netAmount Net amount user receives (gross - serviceFee - gasFeeShare)
     */
    struct WithdrawalExecution {
        bytes32 clientId;
        bytes32 userId;
        address token;
        address to;
        bytes32[] tierIds;
        uint256[] tierReductions;
        uint256 grossAmount;
        uint256 serviceFee;
        uint256 gasFeeShare;
        uint256 netAmount;
    }

    // ============ Events ============

    /**
     * @notice Emitted when a user deposits funds
     * @param clientId The B2B client's identifier
     * @param userId The end user's identifier within that client's system
     * @param token Address of the deposited token
     * @param amount Amount of tokens deposited
     * @param tierIds Array of tier identifiers showing which tiers received funds
     * @param tierAmounts Array of amounts allocated to each tier (matches tierIds array)
     * @param timestamp Block timestamp of the deposit
     */
    event Deposited(
        bytes32 indexed clientId,
        bytes32 indexed userId,
        address indexed token,
        uint256 amount,
        bytes32[] tierIds,
        uint256[] tierAmounts,
        uint256 timestamp
    );

    /**
     * @notice Emitted when a user withdraws funds (individual withdrawal)
     * @param clientId The B2B client's identifier
     * @param userId The end user's identifier
     * @param token Address of the withdrawn token
     * @param amount Net amount withdrawn (after fees)
     * @param recipient Address receiving the withdrawn tokens
     * @param timestamp Block timestamp of the withdrawal
     */
    event Withdrawn(
        bytes32 indexed clientId,
        bytes32 indexed userId,
        address indexed token,
        uint256 amount,
        address recipient,
        uint256 timestamp
    );

    /**
     * @notice Emitted for each withdrawal in a batch with detailed fee breakdown
     * @param clientId Client identifier
     * @param userId User identifier
     * @param token Token address
     * @param grossAmount Amount before fees
     * @param serviceFee Service fee charged (from yield)
     * @param gasFeeShare User's share of batch gas cost
     * @param netAmount Net amount to user
     * @param timestamp Block timestamp
     */
    event WithdrawnWithFee(
        bytes32 indexed clientId,
        bytes32 indexed userId,
        address indexed token,
        uint256 grossAmount,
        uint256 serviceFee,
        uint256 gasFeeShare,
        uint256 netAmount,
        uint256 timestamp
    );

    /**
     * @notice Emitted when batch withdrawal completes
     * @param executionCount Number of withdrawals in batch
     * @param totalServiceFees Total service fees collected
     * @param totalGasFees Total gas fees collected
     * @param timestamp Block timestamp
     */
    event BatchWithdrawalExecuted(
        uint256 executionCount,
        uint256 totalServiceFees,
        uint256 totalGasFees,
        uint256 timestamp
    );

    /**
     * @notice Emitted when tier vault index is updated (yield accrual)
     * @param token Token whose index was updated
     * @param tierId Risk tier identifier
     * @param oldIndex Previous vault index value
     * @param newIndex New vault index value (always >= oldIndex)
     * @param timestamp Block timestamp of the update
     */
    event TierIndexUpdated(
        address indexed token,
        bytes32 indexed tierId,
        uint256 oldIndex,
        uint256 newIndex,
        uint256 timestamp
    );

    /**
     * @notice Emitted when a new tier is initialized for a token
     * @param token Token address
     * @param tierId Risk tier identifier
     * @param initialIndex Starting index (typically 1e18)
     */
    event TierInitialized(
        address indexed token,
        bytes32 indexed tierId,
        uint256 initialIndex
    );

    /**
     * @notice Emitted when max batch size is updated
     * @param oldMax Previous maximum
     * @param newMax New maximum
     * @param timestamp Block timestamp
     */
    event MaxBatchSizeUpdated(
        uint256 oldMax,
        uint256 newMax,
        uint256 timestamp
    );

    /**
     * @notice Emitted when max gas fee per user is updated
     * @param oldMax Previous maximum
     * @param newMax New maximum
     * @param timestamp Block timestamp
     */
    event MaxGasFeePerUserUpdated(
        uint256 oldMax,
        uint256 newMax,
        uint256 timestamp
    );

    /**
     * @notice Emitted when max index growth is updated
     * @param oldMax Previous maximum
     * @param newMax New maximum
     * @param timestamp Block timestamp
     */
    event MaxIndexGrowthUpdated(
        uint256 oldMax,
        uint256 newMax,
        uint256 timestamp
    );

    // ============ Deposit Functions ============

    /**
     * @notice Deposit tokens with automatic tier splitting based on client configuration
     * @dev Reads client's risk tiers from ClientRegistry and splits deposit accordingly
     * @param clientId B2B client identifier (must be registered and active)
     * @param userId End user identifier
     * @param token Token contract address (must be whitelisted)
     * @param amount Amount of tokens to deposit (in token's decimals)
     * @param from Address to transfer tokens from (must have approved this contract)
     */
    function deposit(
        bytes32 clientId,
        bytes32 userId,
        address token,
        uint256 amount,
        address from
    ) external;

    /**
     * @notice Direct deposit from msg.sender with tier splitting
     * @dev Convenience function for non-custodial wallets
     * @param clientId B2B client identifier
     * @param userId End user identifier
     * @param token Token address
     * @param amount Amount to deposit
     */
    function depositFrom(
        bytes32 clientId,
        bytes32 userId,
        address token,
        uint256 amount
    ) external;

    // ============ Withdrawal Functions ============

    /**
     * @notice Batch withdraw for multiple users (oracle-driven)
     * @dev Oracle calculates tier reductions and fees off-chain, contract validates and executes
     * @param executions Array of WithdrawalExecution structs
     */
    function batchWithdraw(WithdrawalExecution[] calldata executions) external;

    /**
     * @notice Individual withdrawal (for emergency or manual processing)
     * @dev Less gas-efficient than batch, but available for single-user withdrawals
     * @param clientId Client identifier
     * @param userId User identifier
     * @param token Token address
     * @param tierIds Array of tier identifiers to withdraw from
     * @param tierReductions Array of balance units to reduce per tier
     * @param to Recipient address
     */
    function withdraw(
        bytes32 clientId,
        bytes32 userId,
        address token,
        bytes32[] calldata tierIds,
        uint256[] calldata tierReductions,
        address to
    ) external;

    // ============ Tier Index Management ============

    /**
     * @notice Update the vault index for a specific tier and token
     * @dev Can only be called by controller. Index must increase monotonically.
     * @param token Token whose index to update
     * @param tierId Risk tier identifier
     * @param newIndex New vault index value (1e18 = 1.0, must be >= current index)
     */
    function updateTierIndex(address token, bytes32 tierId, uint256 newIndex) external;

    /**
     * @notice Batch update tier indices for a token
     * @dev More gas-efficient than individual updates
     * @param token Token address
     * @param tierIds Array of tier identifiers
     * @param newIndices Array of new index values (must match tierIds length)
     */
    function batchUpdateTierIndices(
        address token,
        bytes32[] calldata tierIds,
        uint256[] calldata newIndices
    ) external;

    /**
     * @notice Initialize a new tier for a token
     * @dev Sets initial index to 1e18 (1.0). Can only be called once per tier-token pair.
     * @param token Token address
     * @param tierId Tier identifier
     */
    function initializeTier(address token, bytes32 tierId) external;

    // ============ Admin Functions ============

    /**
     * @notice Set the controller contract address
     * @dev Can only be called by admin
     * @param controller Address of the ProxifyController contract
     */
    function setController(address controller) external;

    /**
     * @notice Set the client registry contract address
     * @dev Can only be called by admin
     * @param registry Address of the ProxifyClientRegistry contract
     */
    function setClientRegistry(address registry) external;

    /**
     * @notice Add a supported token
     * @dev Can only be called by controller
     * @param token Token address to add
     */
    function addSupportedToken(address token) external;

    /**
     * @notice Remove a supported token
     * @dev Can only be called by controller. Requires zero active deposits.
     * @param token Token address to remove
     */
    function removeSupportedToken(address token) external;

    /**
     * @notice Update staked amount tracking
     * @dev Called by controller when funds are staked/unstaked
     * @param token Token address
     * @param amount Amount being staked or unstaked
     * @param isStaking True if staking, false if unstaking
     */
    function updateStaked(address token, uint256 amount, bool isStaking) external;

    // ============ Configurable Limit Management ============

    /**
     * @notice Update maximum batch size for withdrawals
     * @dev Can only be called by controller
     * @param _newMax New maximum (must be between 1 and 1000)
     */
    function updateMaxBatchSize(uint256 _newMax) external;

    /**
     * @notice Update maximum gas fee per user
     * @dev Can only be called by controller
     * @param _newMax New maximum (must be between $10 and $1000, in 6 decimals)
     */
    function updateMaxGasFeePerUser(uint256 _newMax) external;

    /**
     * @notice Update maximum index growth multiplier
     * @dev Can only be called by controller
     * @param _newMax New maximum (must be between 2x and 10x)
     */
    function updateMaxIndexGrowth(uint256 _newMax) external;

    // ============ View Functions - Account Information ============

    /**
     * @notice Get user's account info for a specific tier
     * @param clientId Client identifier
     * @param userId User identifier
     * @param tierId Tier identifier
     * @param token Token address
     * @return account Account struct with balance, entryIndex, depositedAt
     */
    function getAccount(
        bytes32 clientId,
        bytes32 userId,
        bytes32 tierId,
        address token
    ) external view returns (Account memory account);

    /**
     * @notice Get all active tiers for a user's token position
     * @param clientId Client identifier
     * @param userId User identifier
     * @param token Token address
     * @return tierIds Array of tier identifiers user has funds in
     */
    function getUserActiveTiers(
        bytes32 clientId,
        bytes32 userId,
        address token
    ) external view returns (bytes32[] memory tierIds);

    /**
     * @notice Get user's total value across all tiers (including yield)
     * @param clientId Client identifier
     * @param userId User identifier
     * @param token Token address
     * @return totalValue Sum of all tier values in token units
     */
    function getTotalValue(
        bytes32 clientId,
        bytes32 userId,
        address token
    ) external view returns (uint256 totalValue);

    /**
     * @notice Get user's value for a specific tier
     * @param clientId Client identifier
     * @param userId User identifier
     * @param tierId Tier identifier
     * @param token Token address
     * @return tierValue Current value in token units (balance × currentIndex / entryIndex)
     */
    function getTierValue(
        bytes32 clientId,
        bytes32 userId,
        bytes32 tierId,
        address token
    ) external view returns (uint256 tierValue);

    /**
     * @notice Get user's total accrued yield across all tiers
     * @param clientId Client identifier
     * @param userId User identifier
     * @param token Token address
     * @return yieldAmount Total yield in token units (totalValue - totalBalance)
     */
    function getAccruedYield(
        bytes32 clientId,
        bytes32 userId,
        address token
    ) external view returns (uint256 yieldAmount);

    /**
     * @notice Get comprehensive account summary for a user
     * @dev Combines multiple view calls for convenience
     * @param clientId Client identifier
     * @param userId User identifier
     * @param token Token address
     * @return totalBalance Sum of balance units across all tiers
     * @return totalValue Current value including yield
     * @return accruedYield Unrealized yield amount
     * @return activeTierCount Number of tiers with non-zero balance
     */
    function getUserAccountSummary(
        bytes32 clientId,
        bytes32 userId,
        address token
    ) external view returns (
        uint256 totalBalance,
        uint256 totalValue,
        uint256 accruedYield,
        uint256 activeTierCount
    );

    // ============ View Functions - Tier Indices ============

    /**
     * @notice Get current vault index for a tier
     * @param token Token address
     * @param tierId Tier identifier
     * @return index Current vault index (1e18 precision)
     */
    function getTierIndex(address token, bytes32 tierId) external view returns (uint256 index);

    /**
     * @notice Get tier index with timestamp
     * @param token Token address
     * @param tierId Tier identifier
     * @return index Current vault index
     * @return updatedAt Timestamp of last update
     */
    function getTierIndexWithTimestamp(
        address token,
        bytes32 tierId
    ) external view returns (uint256 index, uint256 updatedAt);

    /**
     * @notice Check if a tier is initialized for a token
     * @param token Token address
     * @param tierId Tier identifier
     * @return bool True if tier is initialized, false otherwise
     */
    function isTierInitialized(address token, bytes32 tierId) external view returns (bool);

    // ============ View Functions - Global State ============

    /**
     * @notice Get total deposits across all users for a token
     * @param token Token address
     * @return Total balance units deposited
     */
    function getTotalDeposits(address token) external view returns (uint256);

    /**
     * @notice Get total staked amount for a token (across all protocols)
     * @param token Token address
     * @return Total amount currently staked
     */
    function getTotalStaked(address token) external view returns (uint256);

    /**
     * @notice Check if a token is supported
     * @param token Token address
     * @return bool True if token is whitelisted
     */
    function isSupportedToken(address token) external view returns (bool);

    /**
     * @notice Get contract's token balance
     * @param token Token address
     * @return Contract's current token balance
     */
    function getContractBalance(address token) external view returns (uint256);

    /**
     * @notice Calculate stakeable balance for a token
     * @param token Token address
     * @return Amount available to stake in protocols
     */
    function getStakeableBalance(address token) external view returns (uint256);

    // ============ View Functions - Fee Vaults ============

    /**
     * @notice Get operation fee vault balance
     * @param token Token address
     * @return Balance of accumulated operation fees (gas reimbursement)
     */
    function getOperationFeeBalance(address token) external view returns (uint256);

    /**
     * @notice Get protocol revenue vault balance
     * @param token Token address
     * @return Balance of accumulated protocol revenue
     */
    function getProtocolRevenueBalance(address token) external view returns (uint256);

    /**
     * @notice Get client revenue vault balance
     * @param clientId Client identifier
     * @param token Token address
     * @return Balance of accumulated client revenue
     */
    function getClientRevenueBalance(bytes32 clientId, address token) external view returns (uint256);

    /**
     * @notice Get total client revenues (all clients aggregated)
     * @param token Token address
     * @return Total accumulated client revenues
     */
    function getTotalClientRevenues(address token) external view returns (uint256);

    // ============ Fee Claiming Functions ============

    /**
     * @notice Oracle claims accumulated operation fees
     * @param token Token address
     * @param to Recipient address
     * @param amount Amount to claim
     */
    function claimOperationFee(address token, address to, uint256 amount) external;

    /**
     * @notice Protocol claims accumulated revenue
     * @param token Token address
     * @param to Recipient address (protocol treasury)
     * @param amount Amount to claim
     */
    function claimProtocolRevenue(address token, address to, uint256 amount) external;

    /**
     * @notice Client claims their accumulated revenue
     * @param clientId Client identifier
     * @param token Token address
     * @param to Recipient address (client wallet)
     * @param amount Amount to claim
     */
    function claimClientRevenue(bytes32 clientId, address token, address to, uint256 amount) external;
}
