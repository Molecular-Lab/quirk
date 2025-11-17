export const SUPPORTED_PROTOCOLS = {
  AAVE_POOL: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
  COMPOUND_USDC: "0xc3d688B66703497DAA19211EEdff47f25384cdc3",
} as const;

export const TESTNET_PROTOCOLS = {
  SEPOLIA_AAVE_POOL: "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951",
} as const;

export type SupportedProtocolKey = keyof typeof SUPPORTED_PROTOCOLS;
export type TestnetProtocolKey = keyof typeof TESTNET_PROTOCOLS;
