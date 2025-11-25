import { Link } from "react-router-dom"

import { ChevronRight } from "lucide-react"

import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

export const BridgeBanner: React.FC<PropsWithClassName> = ({ className }) => {
	return (
		<Link to="https://arken.ag/bridge" className="w-full" target="_blank" rel="noreferrer">
			<div
				className={cn(
					"flex items-center gap-3",
					"py-4 pl-5 pr-3",
					"w-full rounded-2xl bg-arken/15 text-arken dark:text-arken-dark",
					className,
				)}
			>
				<img src="/logo/arken-logo.png" className="size-9" />
				<div className="flex flex-col gap-1">
					<div className="text-base font-semibold">Arken Token Bridge</div>
					<div className="text-xs">Deposit Token to the Viction Network</div>
				</div>
				<div className="grow" />
				<ChevronRight className="size-6" strokeWidth={2.5} />
			</div>
		</Link>
	)
}
