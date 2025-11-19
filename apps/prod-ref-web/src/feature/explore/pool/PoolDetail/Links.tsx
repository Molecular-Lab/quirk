import { Link } from "react-router-dom"

import { type Address } from "viem"

import { Button, ShapeSkeleton } from "@rabbitswap/ui/basic"
import { ClipboardCopy } from "@rabbitswap/ui/components"
import { BlockSearch } from "@rabbitswap/ui/icons"
import { shortenText } from "@rabbitswap/ui/utils"

import { TokenIcon } from "@/components/TokenIcon"
import { getExplorerLink } from "@/constants/explorer"
import { Pool } from "@/types/pool"
import { getChainEvmToken } from "@/utils/token"

export const LinkSection: React.FC<{
	isLoading: boolean
	pool: Pool | undefined
	poolAddress: Address
}> = ({ isLoading: _isLoading, poolAddress, pool }) => {
	const isLoading = _isLoading || !pool
	return (
		<div className="flex flex-col gap-5 lg:gap-6">
			<div className="text-xl font-medium lg:text-2xl">Links</div>
			<div className="flex flex-col gap-3">
				<Row
					isLoading={isLoading}
					icon={<TokenIcon className="size-6" token={[pool?.display0, pool?.display1]} />}
					title={pool ? `${pool.display0.symbol} / ${pool.display1.symbol}` : ""}
					address={poolAddress}
					chainId={pool?.chainId}
				/>
				<Row
					isLoading={isLoading}
					icon={<TokenIcon className="size-6" token={pool?.display0} />}
					title={pool?.display0.symbol ?? ""}
					address={pool?.display0.address}
					chainId={pool?.display0.chainId}
				/>
				<Row
					isLoading={isLoading}
					icon={<TokenIcon className="size-6" token={pool?.display1} />}
					title={pool?.display1.symbol ?? ""}
					address={pool?.display1.address}
					chainId={pool?.display1.chainId}
				/>
			</div>
		</div>
	)
}

const Row: React.FC<{
	icon: React.ReactNode
	title: string
	address: Address | undefined
	chainId: number | undefined
	isLoading: boolean
}> = ({ icon, title, address: _address, chainId, isLoading }) => {
	const { native, wrapped } = getChainEvmToken(chainId)
	const address = _address !== native.address ? _address : wrapped.address

	if (isLoading) {
		return <ShapeSkeleton className="h-8 rounded-full" />
	}

	return (
		<div className="flex items-center justify-between gap-3">
			<div className="flex items-center gap-3">
				{icon}
				<span className="text-base lg:text-[18px]">{title}</span>
			</div>
			{address !== undefined && (
				<div className="flex max-h-8 min-h-8 items-center gap-3">
					<div className="flex min-w-[120px] items-center justify-between gap-1 rounded-full bg-gray-50 px-3 py-2 dark:bg-gray-800">
						<span className="text-sm">{shortenText({ text: address })}</span>
						<ClipboardCopy text={address} />
					</div>
					{chainId !== undefined && (
						<Link to={getExplorerLink(chainId, address, "address")} target="_blank" rel="noreferrer">
							<Button buttonColor="gray" className="p-2">
								<BlockSearch />
							</Button>
						</Link>
					)}
				</div>
			)}
		</div>
	)
}
