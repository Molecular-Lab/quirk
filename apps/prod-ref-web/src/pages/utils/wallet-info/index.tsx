import { useMemo, useRef, useState } from "react"

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Address, isAddress } from "viem"

import { Container, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { TransactionTabItem } from "@/components/AccountDrawer/DrawerOption/TransactionTab/TransactionTabItem"
import { Layout } from "@/components/layout"
import { TokenIcon } from "@/components/TokenIcon"
import { DevModeAuthGuard } from "@/feature/dev/DevModeAuthGuard"
import { useColumn as useLimitOrderColumn } from "@/feature/swap/limit/components/LimitOrders/columns"
import { useLimitOrders } from "@/feature/swap/limit/hooks/useLimitOrders"
import { LimitOrderItem } from "@/feature/swap/limit/types"
import { useMyTokens } from "@/hooks/token/useMyTokens"
import { useWalletAllTxHistory } from "@/hooks/wallet/useWalletTxHistory"

const Index: React.FC = () => {
	const [_address, setAddress] = useState<string>("")

	const address = useMemo<Address | undefined>(() => {
		if (!isAddress(_address)) return undefined
		return _address
	}, [_address])

	return (
		<Layout>
			<DevModeAuthGuard>
				<Container>
					<h1 className="mb-6 text-xl font-semibold lg:text-2xl">Wallet Info</h1>
					<Input
						placeholder="address: 0x..."
						value={address}
						onChange={(e) => {
							setAddress(e.target.value)
						}}
					/>
					{_address && !address && <div className="text-red-500">Invalid address</div>}
				</Container>
				{address && (
					<>
						<TokenBalances address={address} />
						<LimitOrders address={address} />
						<TransactionHistory address={address} />
					</>
				)}
			</DevModeAuthGuard>
		</Layout>
	)
}

const TokenBalances: React.FC<{ address: Address }> = ({ address }) => {
	const { data: myTokensData, isLoading: isLoadingMyTokens } = useMyTokens({
		balanceWallet: address,
	})

	return (
		<Container className="mt-8 flex w-full flex-col items-start gap-2">
			<h2 className="w-full text-center text-xl font-semibold">Token Balances</h2>
			{isLoadingMyTokens && <div>Loading...</div>}
			{!isLoadingMyTokens && myTokensData.myBalances.length === 0 && <div>No token balances</div>}
			{myTokensData.myBalances.map((e) => {
				return (
					<div key={e.token.currencyId} className="flex items-center gap-2">
						<TokenIcon token={e.token} className="size-6" />
						{e.toFormat({ withUnit: true })}
					</div>
				)
			})}
		</Container>
	)
}

const LimitOrders: React.FC<{ address: Address }> = ({ address }) => {
	const { data: limitOrdersData, isLoading: isLoadingLimitOrders } = useLimitOrders(address)
	const columns = useLimitOrderColumn({ isLoading: isLoadingLimitOrders, orderState: "inactive" })
	const table = useReactTable<LimitOrderItem>({
		data: limitOrdersData?.all ?? [],
		columns: columns,
		getCoreRowModel: getCoreRowModel(),
	})

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const rows = useMemo(() => table.getRowModel().rows, [limitOrdersData?.all])
	const containerRef = useRef<HTMLDivElement>(null)
	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		estimateSize: () => 56,
		getScrollElement: () => containerRef.current,
		measureElement:
			typeof window !== "undefined" && !navigator.userAgent.includes("Firefox")
				? (element) => element.getBoundingClientRect().height
				: undefined,
		overscan: 2,
	})

	return (
		<Container className="mt-8 flex w-full flex-col gap-2 lg:max-w-[auto]">
			<h2 className="text-xl font-semibold">Limit Orders</h2>
			{isLoadingLimitOrders && <div>Loading...</div>}
			<div className="overflow-x-auto rounded-[20px] border border-gray-100 bg-background font-medium dark:border-gray-800 dark:bg-background-dark">
				<div className="max-h-[360px] min-w-fit overflow-y-auto" ref={containerRef}>
					<Table>
						<TableHeader className="sticky top-0 z-[1] w-full">
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id} className="flex w-full overflow-hidden px-2">
									{headerGroup.headers.map((header) => (
										<TableHead
											key={header.id}
											align="left"
											className="flex shrink-0 grow items-center whitespace-nowrap px-2"
											style={{
												width: header.column.getSize(),
											}}
										>
											{flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									))}
								</TableRow>
							))}
						</TableHeader>
						{rows.length === 0 && (
							<TableBody className="flex w-full justify-center py-10 text-center text-gray-300 dark:text-gray-700">
								<div className="flex flex-col items-center gap-2">No Orders</div>
							</TableBody>
						)}
						{rows.length > 0 && (
							<div
								style={{
									height: `${rowVirtualizer.getTotalSize()}px`,
									position: "relative",
								}}
							>
								{rowVirtualizer.getVirtualItems().map((virtualRow) => {
									const row = rows[virtualRow.index]
									if (row === undefined) return <></>
									return (
										<TableRow
											key={row.id}
											className="absolute flex h-14 w-full items-center px-2"
											style={{
												top: virtualRow.start,
											}}
										>
											{row.getVisibleCells().map((cell) => {
												return (
													<TableCell
														key={cell.id}
														style={{
															width: cell.column.getSize(),
														}}
														className={cn("flex shrink-0 grow")}
													>
														{flexRender(cell.column.columnDef.cell, cell.getContext())}
													</TableCell>
												)
											})}
										</TableRow>
									)
								})}
							</div>
						)}
					</Table>
				</div>
			</div>
		</Container>
	)
}

const TransactionHistory: React.FC<{ address: Address }> = ({ address }) => {
	const { txs, isLoadingCoreTxs, isLoadingLimitOrderTxs } = useWalletAllTxHistory(address)

	return (
		<Container className="mt-8 flex w-full flex-col gap-2">
			<h2 className="text-xl font-semibold">Transaction History</h2>
			{txs?.length === 0 && <div>No transaction history</div>}
			{txs?.map((tx, i) => {
				return <TransactionTabItem key={i} tx={tx} className="w-full" />
			})}
			{/* some is loading */}
			{(isLoadingCoreTxs || isLoadingLimitOrderTxs) && (
				<>
					{Array.from({ length: 5 }).map((_, i) => (
						<TransactionTabItem key={i} tx={undefined} isLoading className="w-full" />
					))}
				</>
			)}
		</Container>
	)
}

export default Index
