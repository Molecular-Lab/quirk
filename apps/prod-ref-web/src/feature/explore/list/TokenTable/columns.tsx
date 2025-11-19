import { useMemo } from "react"
import { Link } from "react-router-dom"

import { type ColumnDef } from "@tanstack/react-table"
import { ArrowLeftRight } from "lucide-react"
import qs from "qs"

import { Button, Skeleton } from "@rabbitswap/ui/basic"
import { ClipboardCopy } from "@rabbitswap/ui/components"

import { PercentChange } from "@/components/PercentChange"
import { TokenIcon } from "@/components/TokenIcon"
import { TokenData } from "@/feature/explore/list/hooks/useTokenData"
import { useNavigate } from "@/router"
import { formatDisplayNumber, formatFiatValue } from "@/utils/number"

export const useColumn = (isLoading: boolean) => {
	const navigate = useNavigate()

	const columns = useMemo<ColumnDef<TokenData | undefined>[]>(
		() => [
			{
				id: "index",
				header: "#",
				cell: ({ row }) => {
					return <div className="!text-xs text-gray-500">{row.index + 1}</div>
				},
				enableSorting: false,
				size: 20,
			},
			{
				id: "token-name",
				accessorKey: "token",
				header: "Token name",
				cell: ({ row }) => {
					const token = row.original?.token
					return (
						<div className="flex items-center gap-2 truncate lg:gap-3">
							<TokenIcon token={token} className="size-6 lg:size-8" />
							<Skeleton className="text-sm lg:text-base" width={40}>
								{token?.symbol}
							</Skeleton>
							<Skeleton className="-ml-1 truncate text-xs text-gray-500 lg:text-sm" width={80}>
								{token?.name}
							</Skeleton>
							{token?.address && <ClipboardCopy text={token.address} className="size-4" />}
						</div>
					)
				},
				enableSorting: false,
				size: 200,
			},
			{
				accessorKey: "price",
				header: "Price",
				cell: ({ row }) => {
					const price = row.original?.price
					return (
						<Skeleton isLoading={isLoading} width={60} className="text-right">
							{price ? `$${formatDisplayNumber(price, { precision: 3 })}` : "-"}
						</Skeleton>
					)
				},
				size: 100,
			},
			{
				accessorKey: "change1h",
				header: "1 hour",
				cell: ({ row }) => {
					const change1h = row.original?.change1h
					return (
						<PercentChange
							value={change1h ? change1h * 100 : undefined}
							className="justify-end text-right"
							isLoading={isLoading}
						/>
					)
				},
				size: 100,
			},
			{
				accessorKey: "change24h",
				header: "1 day",
				cell: ({ row }) => {
					const change24h = row.original?.change24h
					return (
						<PercentChange
							value={change24h ? change24h * 100 : undefined}
							className="justify-end text-right"
							isLoading={isLoading}
						/>
					)
				},
				size: 100,
			},
			{
				accessorKey: "fdv",
				header: "FDV",
				cell: ({ row }) => {
					const fdv = row.original?.fdv
					return (
						<Skeleton isLoading={isLoading} width={60} className="text-right">
							{fdv ? formatFiatValue(fdv, { minPrecision: 0 }) : "-"}
						</Skeleton>
					)
				},
				size: 100,
			},
			{
				accessorKey: "volume",
				header: "Volume (24H)",
				cell: ({ row }) => {
					const volume = row.original?.volume
					return (
						<Skeleton isLoading={isLoading} width={60} className="text-right">
							{volume ? formatFiatValue(volume, { minPrecision: 0 }) : "-"}
						</Skeleton>
					)
				},
				size: 140,
			},
			{
				id: "action",
				accessorKey: "pool",
				header: "",
				cell: ({ row }) => {
					const token = row.original?.token
					return (
						<div className="-my-3 flex items-center justify-end">
							<Link
								to={`https://www.geckoterminal.com/tomochain/tokens/${token?.address}?utm_source=rabbitswap&utm_medium=referral&utm_campaign=token_selector`}
								target="_blank"
								onClick={(e) => {
									e.stopPropagation()
								}}
							>
								<Button className="p-1.5 disabled:opacity-50 disabled:grayscale" buttonType="text" disabled={isLoading}>
									<img
										src="https://static.coingecko.com/s/geckoterminal-icon-86db215163ec2ffec923d11057d05e13e69205779c438ba51c58bf03a9dcd349.svg"
										alt="geckoterminal icon"
										className="size-4"
									/>
								</Button>
							</Link>
							{/* <Link
								to={`https://www.dextools.io/app/en/viction/pair-explorer/${token?.address}`}
								target="_blank"
								onClick={(e) => {
									e.stopPropagation()
								}}
							>
								<Button className="p-1.5 disabled:opacity-50 disabled:grayscale" buttonType="text" disabled={isLoading}>
									<img src="/logo/dextools-logo.svg" alt="dextools icon" className="size-4" />
								</Button>
							</Link> */}
							<Button
								size="sm"
								className="ml-1 p-1.5"
								disabled={isLoading}
								onClick={() => {
									if (!token?.address) return
									void navigate({
										pathname: `/swap`,
										search: qs.stringify({
											tokenOut: token.address,
										}),
									})
								}}
							>
								<ArrowLeftRight className="size-3.5" />
							</Button>
						</div>
					)
				},
				size: 120,
				enableSorting: false,
			},
		],
		[isLoading, navigate],
	)

	return columns
}
