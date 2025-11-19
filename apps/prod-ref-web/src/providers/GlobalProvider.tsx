import { PropsWithChildren } from "react"

import SafeProvider from "@safe-global/safe-apps-react-sdk"

import { ToasterProvider, TooltipProvider } from "@rabbitswap/ui/basic"

import { PhisingWarningProvider } from "@/feature/security/phising-warning/context"
import { AccountModeProvider } from "@/feature/sub-account/context"
import { AccountDrawerProvider } from "@/hooks/useAccountDrawer"
import { ParticleProvider } from "@/providers/ParticleProvider"
import { QueryProvider } from "@/providers/QueryProvider"
import { SolanaWalletProvider } from "@/providers/SolanaWalletProvider"

export const GlobalProvider: React.FC<PropsWithChildren> = ({ children }) => {
	return (
		<SafeProvider>
			<ParticleProvider>
				<AccountModeProvider>
					<SolanaWalletProvider>
						<TooltipProvider delayDuration={200}>
							<ToasterProvider>
								<QueryProvider>
									<PhisingWarningProvider>
										<AccountDrawerProvider>{children}</AccountDrawerProvider>
									</PhisingWarningProvider>
								</QueryProvider>
							</ToasterProvider>
						</TooltipProvider>
					</SolanaWalletProvider>
				</AccountModeProvider>
			</ParticleProvider>
		</SafeProvider>
	)
}
