import { AccountDrawer } from "@/components/AccountDrawer"
import { DepositModal } from "@/components/Deposit"
import { TokenPairListModal } from "@/components/TokenPairSelector/TokenPairListModal"
import { TokenListModal } from "@/components/TokenSelector/TokenListModal"
import { UnlistedTokenModal } from "@/components/UnlistedTokenModal"
import { AcknowledgementModal } from "@/feature/sub-account/components/AcknowledgementModal"
import { DepositEthWarningModal } from "@/feature/sub-account/components/DepositEthWarningModal"

export const GlobalModal: React.FC = () => {
	return (
		<>
			<TokenListModal />
			<TokenPairListModal />
			<AccountDrawer />
			<AcknowledgementModal />
			<UnlistedTokenModal />
			<DepositEthWarningModal />
			<DepositModal />
		</>
	)
}
