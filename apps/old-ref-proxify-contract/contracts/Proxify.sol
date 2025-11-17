// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IProxify.sol";
import "./interfaces/IProxifyClientRegistry.sol";

/**
 * @title Proxify
 * @author DeFAI Protocol
 * @notice Core vault contract with dynamic risk tier support and batch withdrawals
 * @dev Unlimited tiers, off-chain calculation, on-chain validation
 */
contract Proxify is IProxify, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Constants ============
    uint256 public constant INITIAL_INDEX = 1e18; // 1.0 with 18 decimals

    // ============ Configurable Limits ============
    uint256 public maxBatchSize = 100; // Maximum withdrawals per batch
    uint256 public maxIndexGrowth = 5; // Max 400% growth per update (5x) - allows multi-year recovery

    // ============ State Variables ============
    address public controller;
    IProxifyClientRegistry public clientRegistry;

    // 4-level nested mapping: clientId => userId => tierId => token => Account
    mapping(bytes32 => mapping(bytes32 => mapping(bytes32 => mapping(address => Account))))
        private accounts;

    // Tier vault indices: tierId => token => index
    mapping(bytes32 => mapping(address => uint256)) public tierVaultIndices;
    mapping(bytes32 => mapping(address => uint256)) public tierVaultIndexUpdatedAt;

    // Track which tiers are initialized per token
    mapping(bytes32 => mapping(address => bool)) public isTierInitializedMap;

    // Active tiers tracking: clientId => userId => token => tierIds[]
    mapping(bytes32 => mapping(bytes32 => mapping(address => bytes32[])))
        private userActiveTiers;

    // Global counters
    mapping(address => uint256) public totalDeposits;
    mapping(address => uint256) public totalStaked;
    mapping(address => bool) public supportedTokens;

    // Fee vaults
    mapping(address => uint256) public operationFeeVault;
    mapping(address => uint256) public protocolRevenueVault;
    mapping(bytes32 => mapping(address => uint256)) public clientRevenueVault;
    mapping(address => uint256) public totalClientRevenues;

    // ============ Modifiers ============

    modifier onlyController() {
        require(msg.sender == controller, "Only controller");
        _;
    }

    modifier onlyActiveClient(bytes32 clientId) {
        require(
            address(clientRegistry) != address(0) && clientRegistry.isClientActive(clientId),
            "Client not active"
        );
        _;
    }

    // ============ Constructor ============

    /**
     * @notice Initialize the Proxify contract
     * @param _controller Address of the ProxifyController contract
     * @param _clientRegistry Address of the ProxifyClientRegistry contract
     */
    constructor(address _controller, address _clientRegistry) {
        require(_controller != address(0), "Invalid controller");
        require(_clientRegistry != address(0), "Invalid registry");

        controller = _controller;
        clientRegistry = IProxifyClientRegistry(_clientRegistry);
    }

    // ============ Deposit Functions ============

    /// @inheritdoc IProxify
    function deposit(
        bytes32 clientId,
        bytes32 userId,
        address token,
        uint256 amount,
        address from
    )
        external
        onlyActiveClient(clientId)
        nonReentrant
    {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be > 0");
        require(from != address(0), "Invalid from address");

        // Get client's risk tier configuration
        IProxifyClientRegistry.RiskTier[] memory riskTiers = clientRegistry.getClientRiskTiers(clientId);
        require(riskTiers.length > 0, "Client has no risk tiers configured");

        // Arrays for event emission
        bytes32[] memory tierIds = new bytes32[](riskTiers.length);
        uint256[] memory tierAmounts = new uint256[](riskTiers.length);

        // Split deposit across tiers and update accounts
        for (uint i = 0; i < riskTiers.length; i++) {
            IProxifyClientRegistry.RiskTier memory tier = riskTiers[i];

            if (!tier.isActive) continue;

            // Calculate tier amount
            uint256 tierAmount = (amount * tier.allocationBps) / 10000;
            if (tierAmount == 0) continue;

            // Ensure tier is initialized
            require(isTierInitializedMap[tier.tierId][token], "Tier not initialized");

            // Deposit to tier
            _depositToTier(clientId, userId, token, tier.tierId, tierAmount);

            tierIds[i] = tier.tierId;
            tierAmounts[i] = tierAmount;
        }

        // Update global counter
        totalDeposits[token] += amount;

        // Transfer tokens
        IERC20(token).safeTransferFrom(from, address(this), amount);

        emit Deposited(clientId, userId, token, amount, tierIds, tierAmounts, block.timestamp);
    }

    /// @inheritdoc IProxify
    function depositFrom(
        bytes32 clientId,
        bytes32 userId,
        address token,
        uint256 amount
    )
        external
        onlyActiveClient(clientId)
        nonReentrant
    {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be > 0");

        // Get client's risk tier configuration
        IProxifyClientRegistry.RiskTier[] memory riskTiers = clientRegistry.getClientRiskTiers(clientId);
        require(riskTiers.length > 0, "Client has no risk tiers configured");

        // Arrays for event emission
        bytes32[] memory tierIds = new bytes32[](riskTiers.length);
        uint256[] memory tierAmounts = new uint256[](riskTiers.length);

        // Split deposit across tiers
        for (uint i = 0; i < riskTiers.length; i++) {
            IProxifyClientRegistry.RiskTier memory tier = riskTiers[i];

            if (!tier.isActive) continue;

            uint256 tierAmount = (amount * tier.allocationBps) / 10000;
            if (tierAmount == 0) continue;

            require(isTierInitializedMap[tier.tierId][token], "Tier not initialized");

            _depositToTier(clientId, userId, token, tier.tierId, tierAmount);

            tierIds[i] = tier.tierId;
            tierAmounts[i] = tierAmount;
        }

        totalDeposits[token] += amount;

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        emit Deposited(clientId, userId, token, amount, tierIds, tierAmounts, block.timestamp);
    }

    // ============ Withdrawal Functions ============

    /// @inheritdoc IProxify
    function batchWithdraw(WithdrawalExecution[] calldata executions)
        external
        onlyController
        nonReentrant
    {
        require(executions.length > 0, "Empty batch");
        require(executions.length <= maxBatchSize, "Batch too large");

        uint256 totalServiceFees = 0;
        uint256 totalGasFees = 0;

        for (uint i = 0; i < executions.length; i++) {
            WithdrawalExecution calldata exec = executions[i];

            require(supportedTokens[exec.token], "Token not supported");
            require(exec.to != address(0), "Invalid recipient");
            require(exec.tierIds.length == exec.tierReductions.length, "Array length mismatch");
            // Note: gasFeeShare validation removed - oracle is trusted to calculate reasonable fees

            uint256 totalReduction = 0;

            // Validate and reduce tier balances
            for (uint j = 0; j < exec.tierIds.length; j++) {
                bytes32 tierId = exec.tierIds[j];
                uint256 reduction = exec.tierReductions[j];

                Account storage account = accounts[exec.clientId][exec.userId][tierId][exec.token];

                require(account.balance >= reduction, "Insufficient tier balance");

                // Update balance
                account.balance -= reduction;
                totalReduction += reduction;

                // Remove from active tiers if balance is now zero
                if (account.balance == 0) {
                    _removeFromActiveTiers(exec.clientId, exec.userId, exec.token, tierId);
                }
            }

            // Update global counter
            totalDeposits[exec.token] -= totalReduction;

            // Accumulate fees
            totalServiceFees += exec.serviceFee;
            totalGasFees += exec.gasFeeShare;

            // Read client's fee configuration
            IProxifyClientRegistry.ClientInfo memory clientInfo = clientRegistry.getClientInfo(exec.clientId);
            
            // Calculate fee split based on client's configured share (default: 5% client, 95% protocol)
            // clientFeeBps is in basis points (e.g., 500 = 5%)
            uint256 clientShare = (exec.serviceFee * clientInfo.clientFeeBps) / 10000;
            uint256 protocolShare = exec.serviceFee - clientShare;

            // Allocate fees
            protocolRevenueVault[exec.token] += protocolShare;
            clientRevenueVault[exec.clientId][exec.token] += clientShare;
            totalClientRevenues[exec.token] += clientShare;
            operationFeeVault[exec.token] += exec.gasFeeShare;

            // Transfer to user
            IERC20(exec.token).safeTransfer(exec.to, exec.netAmount);

            emit WithdrawnWithFee(
                exec.clientId,
                exec.userId,
                exec.token,
                exec.grossAmount,
                exec.serviceFee,
                exec.gasFeeShare,
                exec.netAmount,
                block.timestamp
            );

            emit Withdrawn(
                exec.clientId,
                exec.userId,
                exec.token,
                exec.netAmount,
                exec.to,
                block.timestamp
            );
        }

        emit BatchWithdrawalExecuted(executions.length, totalServiceFees, totalGasFees, block.timestamp);
    }

    /// @inheritdoc IProxify
    function withdraw(
        bytes32 clientId,
        bytes32 userId,
        address token,
        bytes32[] calldata tierIds,
        uint256[] calldata tierReductions,
        address to
    )
        external
        onlyController
        nonReentrant
    {
        require(supportedTokens[token], "Token not supported");
        require(to != address(0), "Invalid recipient");
        require(tierIds.length == tierReductions.length, "Array length mismatch");

        uint256 totalReduction = 0;
        uint256 totalValue = 0;

        // Calculate total value and reduce balances
        for (uint i = 0; i < tierIds.length; i++) {
            bytes32 tierId = tierIds[i];
            uint256 reduction = tierReductions[i];

            Account storage account = accounts[clientId][userId][tierId][token];
            require(account.balance >= reduction, "Insufficient tier balance");

            // Calculate value before reduction
            uint256 currentIndex = tierVaultIndices[tierId][token];
            uint256 tierValue = (account.balance * currentIndex) / account.entryIndex;
            totalValue += tierValue;

            // Reduce balance
            account.balance -= reduction;
            totalReduction += reduction;

            if (account.balance == 0) {
                _removeFromActiveTiers(clientId, userId, token, tierId);
            }
        }

        totalDeposits[token] -= totalReduction;

        // Transfer tokens (oracle should pre-calculate fees off-chain)
        uint256 amountToTransfer = totalValue; // Simplified, fees handled elsewhere
        IERC20(token).safeTransfer(to, amountToTransfer);

        emit Withdrawn(clientId, userId, token, amountToTransfer, to, block.timestamp);
    }

    /// @inheritdoc IProxify
    function staking(
        address token,
        uint256 amount,
        address stakingExecutor
    )
        external
        onlyController
        nonReentrant
    {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be greater than zero");
        require(stakingExecutor != address(0), "Invalid staking executor address");

        // Verify sufficient unstaked funds available (excludes fee vaults)
        uint256 stakeableBalance = this.getStakeableBalance(token);
        require(stakeableBalance >= amount, "Insufficient stakeable balance");

        // Transfer tokens to staking executor wallet
        IERC20(token).safeTransfer(stakingExecutor, amount);

        emit StakingExecuted(token, amount, stakingExecutor, block.timestamp);
    }

    // ============ Tier Index Management ============

    /// @inheritdoc IProxify
    function updateTierIndex(address token, bytes32 tierId, uint256 newIndex)
        external
        onlyController
    {
        require(supportedTokens[token], "Token not supported");
        require(isTierInitializedMap[tierId][token], "Tier not initialized");

        uint256 currentIndex = tierVaultIndices[tierId][token];
        require(newIndex >= currentIndex, "Index cannot decrease");
        require(newIndex <= currentIndex * maxIndexGrowth, "Index growth too high");

        tierVaultIndices[tierId][token] = newIndex;
        tierVaultIndexUpdatedAt[tierId][token] = block.timestamp;

        emit TierIndexUpdated(token, tierId, currentIndex, newIndex, block.timestamp);
    }

    /// @inheritdoc IProxify
    function batchUpdateTierIndices(
        address token,
        bytes32[] calldata tierIds,
        uint256[] calldata newIndices
    )
        external
        onlyController
    {
        require(supportedTokens[token], "Token not supported");
        require(tierIds.length == newIndices.length, "Array length mismatch");

        for (uint i = 0; i < tierIds.length; i++) {
            bytes32 tierId = tierIds[i];
            uint256 newIndex = newIndices[i];

            require(isTierInitializedMap[tierId][token], "Tier not initialized");

            uint256 currentIndex = tierVaultIndices[tierId][token];
            require(newIndex >= currentIndex, "Index cannot decrease");
            require(newIndex <= currentIndex * maxIndexGrowth, "Index growth too high");

            tierVaultIndices[tierId][token] = newIndex;
            tierVaultIndexUpdatedAt[tierId][token] = block.timestamp;

            emit TierIndexUpdated(token, tierId, currentIndex, newIndex, block.timestamp);
        }
    }

    /// @inheritdoc IProxify
    function initializeTier(address token, bytes32 tierId)
        external
        onlyController
    {
        require(supportedTokens[token], "Token not supported");
        require(!isTierInitializedMap[tierId][token], "Tier already initialized");

        tierVaultIndices[tierId][token] = INITIAL_INDEX;
        tierVaultIndexUpdatedAt[tierId][token] = block.timestamp;
        isTierInitializedMap[tierId][token] = true;

        emit TierInitialized(token, tierId, INITIAL_INDEX);
    }

    // ============ Admin Functions ============

    /// @inheritdoc IProxify
    function setController(address _controller) external onlyController {
        require(_controller != address(0), "Invalid controller");
        controller = _controller;
    }

    /// @inheritdoc IProxify
    function setClientRegistry(address _registry) external onlyController {
        require(_registry != address(0), "Invalid registry");
        clientRegistry = IProxifyClientRegistry(_registry);
    }

    /// @inheritdoc IProxify
    function addSupportedToken(address token) external onlyController {
        require(token != address(0), "Invalid token");
        require(!supportedTokens[token], "Token already supported");
        supportedTokens[token] = true;
    }

    /// @inheritdoc IProxify
    function removeSupportedToken(address token) external onlyController {
        require(supportedTokens[token], "Token not supported");
        require(totalDeposits[token] == 0, "Token has active deposits");
        supportedTokens[token] = false;
    }

    /// @inheritdoc IProxify
    function updateStaked(address token, uint256 amount, bool isStaking) external onlyController {
        if (isStaking) {
            totalStaked[token] += amount;
        } else {
            totalStaked[token] -= amount;
        }
    }

    // ============ Configurable Limit Management ============

    /// @inheritdoc IProxify
    function updateMaxBatchSize(uint256 _newMax) external onlyController {
        require(_newMax > 0 && _newMax <= 1000, "Invalid range");
        uint256 oldMax = maxBatchSize;
        maxBatchSize = _newMax;
        emit MaxBatchSizeUpdated(oldMax, _newMax, block.timestamp);
    }

    /// @inheritdoc IProxify
    function updateMaxIndexGrowth(uint256 _newMax) external onlyController {
        require(_newMax >= 2 && _newMax <= 100, "Invalid range"); // 2x-100x (allows extreme recovery scenarios)
        uint256 oldMax = maxIndexGrowth;
        maxIndexGrowth = _newMax;
        emit MaxIndexGrowthUpdated(oldMax, _newMax, block.timestamp);
    }

    /// @inheritdoc IProxify
    function updateMaxGasFeePerUser(uint256 _newMax) external onlyController {
        // No-op: Gas fee validation removed because different tokens have different decimals
        // Oracle is trusted to calculate reasonable gas fees per withdrawal
        emit MaxGasFeePerUserUpdated(0, _newMax, block.timestamp);
    }

    // ============ Internal Helper Functions ============

    /**
     * @dev Deposit amount to a specific tier with weighted average entry index
     */
    function _depositToTier(
        bytes32 clientId,
        bytes32 userId,
        address token,
        bytes32 tierId,
        uint256 amount
    ) internal {
        if (amount == 0) return;

        Account storage account = accounts[clientId][userId][tierId][token];
        uint256 currentIndex = tierVaultIndices[tierId][token];

        if (account.balance > 0) {
            // Weighted average entry index for multiple deposits
            uint256 oldValue = account.balance * account.entryIndex;
            uint256 newValue = amount * currentIndex;
            account.entryIndex = (oldValue + newValue) / (account.balance + amount);
        } else {
            // First deposit to this tier
            account.entryIndex = currentIndex;
            account.depositedAt = block.timestamp;

            // Add to active tiers
            _addToActiveTiers(clientId, userId, token, tierId);
        }

        account.balance += amount;
    }

    /**
     * @dev Add tier to user's active tiers list
     */
    function _addToActiveTiers(
        bytes32 clientId,
        bytes32 userId,
        address token,
        bytes32 tierId
    ) internal {
        bytes32[] storage activeTiers = userActiveTiers[clientId][userId][token];

        // Check if already exists
        for (uint i = 0; i < activeTiers.length; i++) {
            if (activeTiers[i] == tierId) {
                return; // Already in list
            }
        }

        activeTiers.push(tierId);
    }

    /**
     * @dev Remove tier from user's active tiers list
     */
    function _removeFromActiveTiers(
        bytes32 clientId,
        bytes32 userId,
        address token,
        bytes32 tierId
    ) internal {
        bytes32[] storage activeTiers = userActiveTiers[clientId][userId][token];

        for (uint i = 0; i < activeTiers.length; i++) {
            if (activeTiers[i] == tierId) {
                // Replace with last element and pop
                activeTiers[i] = activeTiers[activeTiers.length - 1];
                activeTiers.pop();
                return;
            }
        }
    }

    // ============ View Functions - Account Information ============

    /// @inheritdoc IProxify
    function getAccount(
        bytes32 clientId,
        bytes32 userId,
        bytes32 tierId,
        address token
    ) external view returns (Account memory account) {
        return accounts[clientId][userId][tierId][token];
    }

    /// @inheritdoc IProxify
    function getUserActiveTiers(
        bytes32 clientId,
        bytes32 userId,
        address token
    ) external view returns (bytes32[] memory tierIds) {
        return userActiveTiers[clientId][userId][token];
    }

    /// @inheritdoc IProxify
    function getTotalValue(
        bytes32 clientId,
        bytes32 userId,
        address token
    ) external view returns (uint256 totalValue) {
        bytes32[] memory activeTiers = userActiveTiers[clientId][userId][token];

        for (uint i = 0; i < activeTiers.length; i++) {
            totalValue += this.getTierValue(clientId, userId, activeTiers[i], token);
        }

        return totalValue;
    }

    /// @inheritdoc IProxify
    function getTierValue(
        bytes32 clientId,
        bytes32 userId,
        bytes32 tierId,
        address token
    ) external view returns (uint256 tierValue) {
        Account memory account = accounts[clientId][userId][tierId][token];
        if (account.balance == 0) return 0;

        uint256 currentIndex = tierVaultIndices[tierId][token];
        return (account.balance * currentIndex) / account.entryIndex;
    }

    /// @inheritdoc IProxify
    function getAccruedYield(
        bytes32 clientId,
        bytes32 userId,
        address token
    ) external view returns (uint256 yieldAmount) {
        bytes32[] memory activeTiers = userActiveTiers[clientId][userId][token];
        uint256 totalValue = 0;
        uint256 totalBalance = 0;

        for (uint i = 0; i < activeTiers.length; i++) {
            Account memory account = accounts[clientId][userId][activeTiers[i]][token];
            uint256 currentIndex = tierVaultIndices[activeTiers[i]][token];

            if (account.balance > 0) {
                totalBalance += account.balance;
                totalValue += (account.balance * currentIndex) / account.entryIndex;
            }
        }

        return totalValue > totalBalance ? totalValue - totalBalance : 0;
    }

    /// @inheritdoc IProxify
    function getUserAccountSummary(
        bytes32 clientId,
        bytes32 userId,
        address token
    ) external view returns (
        uint256 totalBalance,
        uint256 totalValue,
        uint256 accruedYield,
        uint256 activeTierCount
    ) {
        bytes32[] memory activeTiers = userActiveTiers[clientId][userId][token];
        activeTierCount = activeTiers.length;

        for (uint i = 0; i < activeTiers.length; i++) {
            Account memory account = accounts[clientId][userId][activeTiers[i]][token];
            uint256 currentIndex = tierVaultIndices[activeTiers[i]][token];

            if (account.balance > 0) {
                totalBalance += account.balance;
                totalValue += (account.balance * currentIndex) / account.entryIndex;
            }
        }

        accruedYield = totalValue > totalBalance ? totalValue - totalBalance : 0;
    }

    // ============ View Functions - Tier Indices ============

    /// @inheritdoc IProxify
    function getTierIndex(address token, bytes32 tierId) external view returns (uint256 index) {
        return tierVaultIndices[tierId][token];
    }

    /// @inheritdoc IProxify
    function getTierIndexWithTimestamp(
        address token,
        bytes32 tierId
    ) external view returns (uint256 index, uint256 updatedAt) {
        index = tierVaultIndices[tierId][token];
        updatedAt = tierVaultIndexUpdatedAt[tierId][token];
    }

    /// @inheritdoc IProxify
    function isTierInitialized(address token, bytes32 tierId) external view returns (bool) {
        return isTierInitializedMap[tierId][token];
    }

    // ============ View Functions - Global State ============

    /// @inheritdoc IProxify
    function getTotalDeposits(address token) external view returns (uint256) {
        return totalDeposits[token];
    }

    /// @inheritdoc IProxify
    function getTotalStaked(address token) external view returns (uint256) {
        return totalStaked[token];
    }

    /// @inheritdoc IProxify
    function isSupportedToken(address token) external view returns (bool) {
        return supportedTokens[token];
    }

    /// @inheritdoc IProxify
    function getContractBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    /// @inheritdoc IProxify
    function getStakeableBalance(address token) external view returns (uint256) {
        uint256 contractBalance = IERC20(token).balanceOf(address(this));
        uint256 reserved = operationFeeVault[token] + protocolRevenueVault[token] + totalClientRevenues[token];
        return contractBalance > reserved ? contractBalance - reserved : 0;
    }

    // ============ View Functions - Fee Vaults ============

    /// @inheritdoc IProxify
    function getOperationFeeBalance(address token) external view returns (uint256) {
        return operationFeeVault[token];
    }

    /// @inheritdoc IProxify
    function getProtocolRevenueBalance(address token) external view returns (uint256) {
        return protocolRevenueVault[token];
    }

    /// @inheritdoc IProxify
    function getClientRevenueBalance(bytes32 clientId, address token) external view returns (uint256) {
        return clientRevenueVault[clientId][token];
    }

    /// @inheritdoc IProxify
    function getTotalClientRevenues(address token) external view returns (uint256) {
        return totalClientRevenues[token];
    }

    // ============ Fee Claiming Functions ============

    /// @inheritdoc IProxify
    function claimOperationFee(address token, address to, uint256 amount) external onlyController {
        require(operationFeeVault[token] >= amount, "Insufficient operation fees");
        operationFeeVault[token] -= amount;
        IERC20(token).safeTransfer(to, amount);
    }

    /// @inheritdoc IProxify
    function claimProtocolRevenue(address token, address to, uint256 amount) external onlyController {
        require(protocolRevenueVault[token] >= amount, "Insufficient protocol revenue");
        protocolRevenueVault[token] -= amount;
        IERC20(token).safeTransfer(to, amount);
    }

    /// @inheritdoc IProxify
    function claimClientRevenue(bytes32 clientId, address token, address to, uint256 amount) external onlyController {
        require(clientRevenueVault[clientId][token] >= amount, "Insufficient client revenue");
        clientRevenueVault[clientId][token] -= amount;
        totalClientRevenues[token] -= amount;
        IERC20(token).safeTransfer(to, amount);
    }
}
