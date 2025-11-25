import { useEffect, useState } from "react"

import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { ConnectSolanaWalletButton } from "@/components/Wallet/connectWallet/solanaBtn"

import { NavConnectWalletButton } from "./section/ConnectWalletButton"
import { LinksSection } from "./section/Links"
import { NavBarLogo } from "./section/logo"
import { MobileMenu } from "./section/MobileMenu"
import { NavContainer } from "./section/NavContainer"

interface NavBarProps extends PropsWithClassName {
	showIconOnly?: boolean
	showSolanaConnect?: boolean
}
const Navbar: React.FC<NavBarProps> = ({ className, showIconOnly = false, showSolanaConnect }) => {
	const [scrollY, setScrollY] = useState(0)
	useEffect(() => {
		const handleScroll = () => {
			setScrollY(window.scrollY)
		}
		window.addEventListener("scroll", handleScroll)
		return () => {
			window.removeEventListener("scroll", handleScroll)
		}
	}, [])
	return (
		<NavContainer
			className={cn(
				"fixed z-10 w-full items-center border-b border-transparent bg-transparent transition-colors",
				scrollY > 10 && "border-gray-50 bg-background dark:border-gray-900 dark:bg-background-dark",
				className,
			)}
		>
			{showIconOnly ? (
				<NavBarLogo className="mr-3 lg:mr-8" />
			) : (
				<>
					<NavBarLogo className="mr-3 lg:mr-8" />
					<div className={cn("hidden justify-between", showSolanaConnect ? "xl:flex xl:flex-1" : "lg:flex lg:flex-1")}>
						<LinksSection isMobile={false} />
					</div>
					<div className="grow" />
					<div className="flex gap-2">
						{showSolanaConnect ? <ConnectSolanaWalletButton /> : undefined}
						<NavConnectWalletButton />
					</div>
					<MobileMenu className="lg:hidden" triggerClassName="lg:hidden ml-3" />
				</>
			)}
		</NavContainer>
	)
}

export default Navbar
