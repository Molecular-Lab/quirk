import { ComponentProps } from "react"

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import "./solanaBtn.css"

// className is not supported for this button
type ConnectSolanaWalletButtonProps = Omit<ComponentProps<typeof WalletMultiButton>, "className">

export const ConnectSolanaWalletButton: React.FC<ConnectSolanaWalletButtonProps> = (props) => {
	return <WalletMultiButton {...props} />
}
