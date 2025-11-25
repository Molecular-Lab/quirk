import { PropsWithChildren } from "react"

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"

import { solanaEndpoint, solanaWallets } from "./config"

export const SolanaWalletProvider: React.FC<PropsWithChildren> = ({ children }) => {
	return (
		<ConnectionProvider endpoint={solanaEndpoint}>
			<WalletProvider wallets={solanaWallets} autoConnect>
				<WalletModalProvider>{children} </WalletModalProvider>
			</WalletProvider>
		</ConnectionProvider>
	)
}
