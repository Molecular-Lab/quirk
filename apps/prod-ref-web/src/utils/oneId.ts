import { LinkedID, LinkedWallet, OneID } from "@oneid-xyz/inspect"
import { Address, isAddress } from "viem"

export const walletToLinksId = async (walletAddress: Address): Promise<LinkedID[]> => {
	if (!isAddress(walletAddress)) {
		throw new Error(`Invalid wallet address`)
	}
	const oneid = new OneID()
	await oneid.systemConfig.initConfig()
	const linkIds: LinkedID[] = await oneid.getLinkedIDs(walletAddress)
	return linkIds
}

export const linkIdToWallets = async (linkId: string): Promise<LinkedWallet[]> => {
	const oneid = new OneID()
	await oneid.systemConfig.initConfig()
	const wallets = await oneid.getWalletsByID(linkId)
	return wallets
}

export const modWalletAddress = (walletAddress: Address, k: number): number => {
	if (!isAddress(walletAddress) || k <= 0) {
		throw new Error(`Invalid wallet address`)
	}
	const num = BigInt(walletAddress)
	return Number(num % BigInt(k))
}
