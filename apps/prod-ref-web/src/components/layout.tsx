import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import Navbar from "@/components/Navbar"

export const AppBackground: React.FC<{ className?: string }> = ({ className }) => {
	return (
		<div
			id="app-background"
			className={cn(
				"pointer-events-none fixed flex h-screen min-h-[432px] w-screen select-none justify-between opacity-80 md:flex lg:min-h-[720px]",
				className,
			)}
		>
			<img
				src="/images/bg-left.png"
				alt="background image"
				className="absolute bottom-0 left-0 max-w-[183px] object-contain lg:max-w-[366px]"
			/>
			<img
				src="/images/bg-right.png"
				alt="background image"
				className="absolute right-0 top-0 max-w-[375px] object-contain lg:max-w-[750px]"
			/>
		</div>
	)
}

type LayoutProps = PropsWithClassName<
	React.PropsWithChildren<{
		navbarClassName?: string
		showIconOnly?: boolean
	}>
>

export const Layout: React.FC<LayoutProps> = ({ children, navbarClassName, showIconOnly = false, className }) => {
	return (
		<div className="relative min-h-screen overflow-auto">
			<Navbar className={navbarClassName} showIconOnly={showIconOnly} showSolanaConnect={showSolanaConnect} />
			<div
				id="app-background-color"
				className={cn(
					"pointer-events-none fixed flex h-screen min-h-[432px] w-screen select-none justify-between md:flex lg:min-h-[720px]",
					"bg-background dark:bg-background-dark",
				)}
			/>
			<AppBackground />
			<main
				className={cn(
					"flex grow flex-col items-center",
					"mt-[56px] md:mt-[72px]", // keep it same as navbar height
					"py-7 sm:py-8 md:py-10",
					className,
				)}
			>
				{children}
			</main>
		</div>
	)
}
