import { type Address, type Hex, encodePacked, getAddress, isAddress, isAddressEqual, parseEther } from "viem"

import { BridgeTokenList, GasAmountMapper, NativeForDstMapper } from "@/constants/bridge"
import { ETH_MAINNET, SOL, SOLANA_USDT, USDT_MAINNET, USDT_VICTION, VIC } from "@/constants/token"

export function getAdapterParams(destChainId: number, receipient: Address): Hex | undefined {
	const version = 2
	const gasAmount = GasAmountMapper[destChainId]
	const nativeForDst = NativeForDstMapper[destChainId]
	if (!gasAmount || !nativeForDst) {
		return undefined
	}
	return encodePacked(
		["uint16", "uint", "uint", "address"],
		[version, BigInt(gasAmount), parseEther(nativeForDst), receipient],
	)
}

export const getOFTAddress = (chain: number): string | undefined => {
	switch (chain) {
		case VIC.chainId:
			return getEvmOFTAddress(USDT_VICTION.chainId, getAddress(USDT_VICTION.address))
		case ETH_MAINNET.chainId:
			return getEvmOFTAddress(USDT_MAINNET.chainId, getAddress(USDT_MAINNET.address))
		case SOL.chainId:
			return getSolanaOFTAddress(SOLANA_USDT.chainId, SOLANA_USDT.address)
		default:
			return getEvmOFTAddress(USDT_VICTION.chainId, getAddress(USDT_VICTION.address))
	}
}

const getEvmOFTAddress = (chainId: number, desTokenAddress: Address) => {
	return BridgeTokenList[chainId]?.find((t) =>
		isAddress(t.tokenAddress) ? isAddressEqual(t.tokenAddress, desTokenAddress) : undefined,
	)?.oftAddress
}

const getSolanaOFTAddress = (chainId: number, desTokenAddress: string) => {
	return BridgeTokenList[chainId]?.find((t) => t.tokenAddress === desTokenAddress)?.oftAddress
}
