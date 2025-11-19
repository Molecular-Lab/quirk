import { Container } from "@rabbitswap/ui/basic"

import { Error } from "@/components/Error/Error"
import { ConnectEvmWalletButton } from "@/components/Wallet/connectWallet/evmBtn"
import { useAccount } from "@/hooks/useAccount"

import { ALLOWED_DEV_ADDRESSES } from "./constants"

export const DevModeAuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { mainAddress } = useAccount()

	if (!mainAddress) {
		return (
			<Container>
				<ConnectEvmWalletButton />
			</Container>
		)
	}

	if (!ALLOWED_DEV_ADDRESSES.includes(mainAddress)) {
		return (
			<Error title="Not Authorized" code={403}>
				You are not authorized to access this page. Please return to the homepage.
			</Error>
		)
	}

	return children
}
