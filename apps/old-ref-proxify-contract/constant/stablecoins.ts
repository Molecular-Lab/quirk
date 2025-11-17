export const STABLECOINS = {
  USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
} as const;

export const TESTNET_STABLECOINS = {
  SEPOLIA_USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
} as const;

export type StablecoinSymbol = keyof typeof STABLECOINS;
export type TestnetStablecoinSymbol = keyof typeof TESTNET_STABLECOINS;
