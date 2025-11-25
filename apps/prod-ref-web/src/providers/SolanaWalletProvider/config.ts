import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { ParticleAdapter, PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { clusterApiUrl } from "@solana/web3.js"

const solanaNetwork: WalletAdapterNetwork = (() => {
	switch (import.meta.env.VITE_SOLANA_NETWORK) {
		case "devnet":
			return WalletAdapterNetwork.Devnet
		case "testnet":
			return WalletAdapterNetwork.Testnet
		default:
			return WalletAdapterNetwork.Mainnet
	}
})()

export const solanaEndpoint: string = (() => {
	if (solanaNetwork === WalletAdapterNetwork.Mainnet) {
		return "https://virulent-fluent-shard.solana-mainnet.quiknode.pro/62dbb99c3670686b58958053df317eac977ecc62"
	}
	return clusterApiUrl(solanaNetwork)
})()

export const solanaWallets = [new PhantomWalletAdapter(), new ParticleAdapter(), new SolflareWalletAdapter()]
