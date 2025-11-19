import { useEffect, useMemo } from "react"

import { Coins, History, Search, Star } from "lucide-react"
import { Address } from "viem"

import { Input, Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle, Skeleton } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { useSelectTokenModal } from "@/components/TokenSelector/hooks/useSelectTokenModal"
import { useTokenList } from "@/components/TokenSelector/hooks/useTokenList"
import { TokenItem, TokenItemProps } from "@/components/TokenSelector/TokenItem"
import { EvmToken } from "@/types/tokens"

export const TokenListModal: React.FC = () => {
	const { isOpen, close, onSelect, balanceWallet } = useSelectTokenModal()
	const { query, tokens, isSearching, handleSelect, isLoading } = useTokenList({
		onSelect: onSelect,
		onClose: close,
		balanceWallet: balanceWallet,
	})

	// Reset query when modal is closed
	useEffect(() => {
		if (!isOpen) query.setValue("")
	}, [isOpen, query])

	const sections = useMemo(() => {
		if (isLoading) {
			return <TokenSection isLoading />
		}
		if (isSearching) {
			return (
				<TokenSection
					title="Search Results"
					icon={<Search className="size-4" strokeWidth={3} />}
					tokens={tokens.search}
					onSelect={handleSelect}
					notFoundPlaceholder={
						<div className="py-4 text-center text-sm text-gray-300">
							No results found for <span className="text-gray-950">{query.debounced}</span>
						</div>
					}
					balanceWallet={balanceWallet}
					itemProps={{ showAddress: true }}
				/>
			)
		}
		return (
			<>
				<TokenSection
					title="Recent searches"
					icon={<History className="size-4" />}
					tokens={tokens.recentSearch}
					onSelect={handleSelect}
					balanceWallet={balanceWallet}
				/>
				<TokenSection
					title="Your tokens"
					icon={<Coins className="size-4" />}
					tokens={tokens.my}
					onSelect={handleSelect}
					balanceWallet={balanceWallet}
				/>
				<TokenSection
					title="Tokens"
					icon={<Star className="size-4 fill-current" />}
					tokens={tokens.normal}
					onSelect={handleSelect}
					balanceWallet={balanceWallet}
				/>
			</>
		)
	}, [
		balanceWallet,
		handleSelect,
		isLoading,
		isSearching,
		query.debounced,
		tokens.my,
		tokens.normal,
		tokens.recentSearch,
		tokens.search,
	])

	return (
		<Modal open={isOpen} onOpenChange={close}>
			<ModalContent className="flex h-[600px] max-h-[90vh] flex-col px-0 pb-0">
				<ModalHeader className="h-fit py-0">
					<ModalTitle className="hidden items-center justify-between px-6 text-xl md:flex">Select a token</ModalTitle>
					<ModalDescription />
				</ModalHeader>
				<div className="flex grow flex-col gap-6 overflow-hidden">
					<Input
						placeholder="Search tokens"
						addonBefore={<Search className="text-gray-300" />}
						className="mx-4 h-12 text-base font-medium md:mx-6"
						value={query.value}
						onChange={(e) => {
							query.setValue(e.target.value)
						}}
					/>
					<div
						className={cn(
							"no-scrollbar flex grow flex-col gap-4 overflow-scroll pb-4",
							!isLoading && "overflow-y-auto",
						)}
					>
						{sections}
					</div>
				</div>
			</ModalContent>
		</Modal>
	)
}

const TokenSection: React.FC<{
	title?: string
	icon?: React.ReactNode
	tokens?: EvmToken[]
	onSelect?: (token: EvmToken) => void
	notFoundPlaceholder?: React.ReactNode
	itemProps?: Partial<TokenItemProps>
	isLoading?: boolean
	balanceWallet?: Address
}> = ({ icon, title, tokens, onSelect, notFoundPlaceholder, itemProps, isLoading, balanceWallet }) => {
	if ((!tokens || tokens.length === 0) && !notFoundPlaceholder && !isLoading) return null

	return (
		<div className="flex flex-col">
			<div className="sticky top-0 bg-background px-4 py-1.5 text-base font-medium text-gray-400 dark:bg-background-dark dark:text-gray-700 md:px-6">
				<Skeleton width={150} isLoading={isLoading} className="flex items-center gap-2">
					{icon}
					{title}
				</Skeleton>
			</div>
			{isLoading && Array.from({ length: 8 }).map((_, i) => <TokenItem key={i} />)}
			{tokens?.length === 0 && notFoundPlaceholder}
			{tokens?.map((token) => (
				<TokenItem
					key={token.address}
					token={token}
					onClick={() => onSelect?.(token)}
					balanceWallet={balanceWallet}
					{...itemProps}
				/>
			))}
		</div>
	)
}
