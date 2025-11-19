import { getChainIcon, solana } from "@particle-network/connectkit/chains"
import { mainnet, viction } from "viem/chains"

import { EVM_NATIVE_TOKEN_ADDRESS } from "@/types/tokens/constant"
import { EvmToken } from "@/types/tokens/evm"
import { SolanaToken } from "@/types/tokens/solana"
import { Token } from "@/types/tokens/token"

export const VIC = new EvmToken({
	chainId: viction.id,
	address: EVM_NATIVE_TOKEN_ADDRESS,
	decimals: 18,
	symbol: "VIC",
	name: "Viction",
	iconURL: "/logo/viction-icon-yellow.png",
	isStable: false,
})

export const WVIC = new EvmToken({
	chainId: viction.id,
	address: "0xc054751bdbd24ae713ba3dc9bd9434abe2abc1ce",
	decimals: 18,
	symbol: "WVIC",
	name: "Wrapped Viction",
	iconURL: "/logo/viction-icon-yellow.png",
	isStable: false,
})

export const CUSD_VICTION = new EvmToken({
	chainId: viction.id,
	address: "0xb3008e7156ae2312b49b5200c3e1c3e80e529feb",
	decimals: 6,
	symbol: "CUSD",
	name: "CUSD",
	iconURL: "https://tokenlist.dojoswap.xyz/images/0xb3008e7156ae2312b49b5200c3e1c3e80e529feb.png",
	isStable: true,
})

export const USDV_VICTION = new EvmToken({
	chainId: viction.id,
	address: "0x323665443cef804a3b5206103304bd4872ea4253",
	decimals: 18,
	symbol: "USDV",
	name: "USDV",
	iconURL: "https://tokenlist.dojoswap.xyz/images/0x323665443cef804a3b5206103304bd4872ea4253.png",
	isStable: true,
})

export const USDT_VICTION = new EvmToken({
	chainId: viction.id,
	address: "0x69B946132B4a6C74cd29Ba3ff614cEEA1eF9fF2B",
	decimals: 6,
	symbol: "USDT",
	name: "USDT",
	iconURL: "https://tether.to/images/logoCircle.png",
	isStable: true,
})

export const ETH_MAINNET = new EvmToken({
	chainId: mainnet.id,
	address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
	decimals: 18,
	symbol: "ETH",
	name: "ETH",
	iconURL: "https://ethereum.org/images/assets/svgs/eth-diamond-black-gray.svg",
	isStable: false,
})

export const WETH_MAINNET = new EvmToken({
	chainId: mainnet.id,
	address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
	decimals: 18,
	symbol: "WETH",
	name: "WETH",
	iconURL: "https://ethereum.org/images/assets/svgs/eth-diamond-black-gray.svg",
	isStable: false,
})

export const USDT_MAINNET = new EvmToken({
	chainId: mainnet.id,
	address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
	decimals: 6,
	symbol: "USDT",
	name: "USDT",
	iconURL: "https://tether.to/images/logoCircle.png",
	isStable: true,
})

export const C98_VICTION = new EvmToken({
	chainId: viction.id,
	address: "0x0fd0288aaae91eaf935e2ec14b23486f86516c8c",
	decimals: 18,
	symbol: "C98",
	name: "C98",
	iconURL: "https://tokenlist.dojoswap.xyz/images/0x0fd0288aaae91eaf935e2ec14b23486f86516c8c.png",
	isStable: false,
})

export const RABBIT_VICTION = new EvmToken({
	chainId: viction.id,
	address: "0x2C664910222BE7b7e203753C59A9667cBe282828",
	decimals: 18,
	symbol: "RABBIT",
	name: "RabbitSwap",
	iconURL:
		"https://raw.githubusercontent.com/BuildOnViction/tokens/master/tokens/0x2c664910222be7b7e203753c59a9667cbe282828.png",
	isStable: false,
})

export const SAROS_VICTION = new EvmToken({
	chainId: viction.id,
	address: "0xb786d9c8120d311b948cf1e5aa48d8fbacf477e2",
	decimals: 18,
	symbol: "SAROS",
	name: "Saros",
	iconURL: "https://rabbitswap.xyz/images/tokens/88-0xb786d9c8120d311b948cf1e5aa48d8fbacf477e2.png",
	isStable: false,
})

export const ETER_VICTION = new EvmToken({
	chainId: viction.id,
	address: "0xa7fb873eb775408fb0a24e3163f94f138e448089",
	decimals: 18,
	symbol: "ETER",
	name: "Eternals",
	iconURL:
		"https://raw.githubusercontent.com/BuildOnViction/tokens/master/tokens/0xa7fb873eb775408fb0a24e3163f94f138e448089.png",
	isStable: false,
})

export const DADA_VICTION = new EvmToken({
	chainId: viction.id,
	address: "0x193fcbb7f9eea67cac0d5a94ec7ccf2141c867ec",
	decimals: 18,
	symbol: "DADA",
	name: "Dagora",
	iconURL: "https://rabbitswap.xyz/images/tokens/88-0x193fCbB7f9EeA67CAc0D5A94ec7ccf2141c867ec.png",
	isStable: false,
})

export const WHEEE_VICTION = new EvmToken({
	chainId: viction.id,
	address: "0x4ade201e7a66c3c9210bab9002522c8fdbc6d1d7",
	decimals: 18,
	symbol: "WHEEE",
	name: "Wheester",
	iconURL:
		"https://raw.githubusercontent.com/BuildOnViction/tokens/master/tokens/0x4ade201e7a66c3c9210bab9002522c8fdbc6d1d7.png",
	isStable: false,
})

export const ONEID_VICTION = new EvmToken({
	chainId: viction.id,
	address: "0x4359647fE0EF8B1eE201D5bc2bb5AB872C395F04",
	decimals: 18,
	symbol: "ONEID",
	name: "OneID",
	iconURL:
		"https://raw.githubusercontent.com/BuildOnViction/tokens/master/tokens/0x4359647fe0ef8b1ee201d5bc2bb5ab872c395f04.png",
	isStable: false,
})

export const DEF_VICTION = new EvmToken({
	chainId: viction.id,
	address: "0xAa6F3E52cb0571b88E58A93FD1Cc0744254909D2",
	symbol: "DEF",
	name: "deFusion",
	decimals: 18,
	iconURL:
		"https://raw.githubusercontent.com/BuildOnViction/tokens/master/tokens/0xaa6f3e52cb0571b88e58a93fd1cc0744254909d2.png",
	isStable: false,
})

export const STARBASE_VICTION = new EvmToken({
	chainId: viction.id,
	address: "0xa959Fa5a859365b440367A7b0C41e1c4D3424242",
	symbol: "STARBASE",
	name: "STARBASE",
	decimals: 18,
	iconURL:
		"https://raw.githubusercontent.com/BuildOnViction/tokens/master/tokens/0xa959fa5a859365b440367a7b0c41e1c4d3424242.png",
	isStable: false,
})

export const VIKTO_VICTION = new EvmToken({
	chainId: viction.id,
	address: "0x1f4E8d4dA48Bf094565092EaE0004b82D420304b",
	symbol: "VIKTO",
	name: "Vikto",
	decimals: 18,
	iconURL:
		"https://raw.githubusercontent.com/BuildOnViction/tokens/master/tokens/0x1f4e8d4da48bf094565092eae0004b82d420304b.png",
	isStable: false,
})

export const CARROT_VICTION = new Token({
	chainId: viction.id,
	address: "0xF9955CBc7aEF687C8A4B22806a9246f2fC428428",
	symbol: "CARROT",
	name: "CARROT",
	decimals: 18,
	iconURL:
		"https://raw.githubusercontent.com/BuildOnViction/tokens/master/tokens/0xf9955cbc7aef687c8a4b22806a9246f2fc428428.png",
	isStable: false,
})

export const HONEY_VICTION = new Token({
	chainId: viction.id,
	address: "0x02bfEF1211740c595B3dF9304a191CD76525A14a",
	symbol: "HONEY",
	name: "Honey",
	decimals: 18,
	iconURL:
		"https://raw.githubusercontent.com/BuildOnViction/tokens/master/tokens/0x02bfef1211740c595b3df9304a191cd76525a14a.png",
	isStable: false,
})

export const WUSD_VICTION = new Token({
	chainId: viction.id,
	address: "0xBA73E59F11597c1c13B0D9114688Efb6A6D430F6",
	symbol: "WUSD",
	name: "Worldwide USD",
	decimals: 18,
	iconURL: "https://rabbitswap.xyz/images/tokens/88-0xba73e59f11597c1c13b0d9114688efb6a6d430f6.png",
	isStable: true,
})

export const SAVEDOG_VICTION = new Token({
	chainId: viction.id,
	address: "0xBdD91045C5a994b8f7d8c747d06185BcfC5335b5",
	symbol: "SAVEDOG",
	name: "Doge Draw",
	decimals: 18,
	iconURL:
		"https://raw.githubusercontent.com/BuildOnViction/tokens/master/tokens/0xbdd91045c5a994b8f7d8c747d06185bcfc5335b5.png",
	isStable: false,
})

export const VICTION_MAIN_TOKENS: Token[] = [C98_VICTION, RABBIT_VICTION]

export const SOLANA_USDC = new SolanaToken({
	chainId: solana.id,
	address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
	decimals: 6,
	symbol: "USDC",
	name: "USD Coin",
	iconURL: "https://dojo.trading/images/tokens/usdc.svg",
	isStable: true,
})

export const SOLANA_USDT = new SolanaToken({
	chainId: solana.id,
	address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
	decimals: 6,
	symbol: "USDT",
	name: "USD Tether",
	iconURL: "https://tether.to/images/logoCircle.png",
	isStable: true,
})

export const SOL = new SolanaToken({
	chainId: solana.id,
	address: "So11111111111111111111111111111111111111111",
	decimals: 9,
	symbol: "SOL",
	name: "SOLANA",
	iconURL: getChainIcon(solana),
	isStable: true,
})

export const WSOL = new SolanaToken({
	chainId: solana.id,
	address: "So11111111111111111111111111111111111111112",
	decimals: 9,
	symbol: "wSol",
	name: "wSOLANA",
	iconURL: getChainIcon(solana),
	isStable: true,
})

export const VICTION_MAIN_TOKENS: EvmToken[] = [C98_VICTION, RABBIT_VICTION]

export const MAIN_TOKENS: Record<number, Token[]> = {
	[viction.id]: VICTION_MAIN_TOKENS,
}
