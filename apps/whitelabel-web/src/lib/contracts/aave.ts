import { Address, parseAbi } from "viem"

/**
 * AAVE V3 Pool Contract Address (Sepolia Testnet)
 * @see https://docs.aave.com/developers/deployed-contracts/v3-testnet-addresses
 */
export const AAVE_POOL_ADDRESS: Address = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951"

/**
 * AAVE V3 Pool ABI - Essential functions for supply/withdraw
 */
export const AAVE_POOL_ABI = parseAbi([
    // Supply function
    "function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external",

    // Withdraw function
    "function withdraw(address asset, uint256 amount, address to) external returns (uint256)",

    // View functions
    "function getUserAccountData(address user) external view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)",

    // Get reserve data
    "function getReserveData(address asset) external view returns (tuple(uint256 configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))",
])

/**
 * USDC Token Address (Sepolia Testnet)
 */
export const USDC_SEPOLIA_ADDRESS: Address = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8"

/**
 * aUSDC Token Address (AAVE interest-bearing USDC)
 * This is the token you receive when you supply USDC to AAVE
 */
export const AUSDC_SEPOLIA_ADDRESS: Address = "0x16dA4541aD1807f4443d92D26044C1147406EB80"

/**
 * ERC20 ABI for token operations (approve, balance, etc.)
 */
export const ERC20_ABI = parseAbi([
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function decimals() external view returns (uint8)",
    "function symbol() external view returns (string)",
    "function name() external view returns (string)",
])

/**
 * Helper function to build AAVE supply operation
 */
export function buildAAVESupplyOperation(
    tokenAddress: Address,
    amount: bigint,
    onBehalfOf: Address
) {
    return {
        target: AAVE_POOL_ADDRESS,
        callData: {
            functionName: "supply",
            args: [tokenAddress, amount, onBehalfOf, 0],
        },
    }
}

/**
 * Helper function to build AAVE withdraw operation
 */
export function buildAAVEWithdrawOperation(tokenAddress: Address, amount: bigint, to: Address) {
    return {
        target: AAVE_POOL_ADDRESS,
        callData: {
            functionName: "withdraw",
            args: [tokenAddress, amount, to],
        },
    }
}
