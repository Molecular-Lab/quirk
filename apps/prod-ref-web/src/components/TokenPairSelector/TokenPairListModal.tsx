import { useCallback, useMemo, useState } from "react"

import { Search, Star } from "lucide-react"

import {
	Modal,
	ModalContent,
	ModalDescription,
	ModalHeader,
	ModalTitle,
	RadioButtonGroup,
	Skeleton,
} from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { TokenIcon } from "@/components/TokenIcon"
import { TokenItem } from "@/components/TokenSelector/TokenItem"
import { EvmToken } from "@/types/tokens"

import { useSelectTokenPairModal } from "./hooks/useSelectTokenPairModal"
import { TokenPairItem, TokenPairItemProps } from "./TokenPairItem"

export const TokenPairListModal: React.FC = () => {
	const [filteredToken, setFilteredToken] = useState<EvmToken | undefined>()
	const { isOpen, close, optionItems: _optionItems, onSelect } = useSelectTokenPairModal()

	const tokens = useMemo<EvmToken[]>(() => {
		const _tokens = _optionItems.flatMap((tokenPair) => [tokenPair[0], tokenPair[1]])
		const uniqueTokens = new Set(_tokens)
		return Array.from(uniqueTokens)
	}, [_optionItems])

	const optionItems = useMemo(() => {
		if (!filteredToken) return _optionItems
		return _optionItems.filter((tokenPair) => {
			return tokenPair[0].equals(filteredToken) || tokenPair[1].equals(filteredToken)
		})
	}, [_optionItems, filteredToken])

	const handleSelect = useCallback(
		(tokenPair: [EvmToken, EvmToken]) => {
			onSelect(tokenPair)
			close()
		},
		[onSelect, close],
	)

	const sections = useMemo(() => {
		if (filteredToken !== undefined) {
			return (
				<TokenPairSection
					title="Search Results"
					icon={<Search className="size-4" strokeWidth={3} />}
					options={optionItems}
					onSelect={handleSelect}
					notFoundPlaceholder={
						<div className="py-4 text-center text-sm text-gray-300">
							No results found for <span className="text-gray-950">{filteredToken.symbol}</span>
						</div>
					}
				/>
			)
		}
		return (
			<>
				<TokenPairSection
					title="Token Pairs"
					icon={<Star className="size-4 fill-current" />}
					options={optionItems}
					onSelect={handleSelect}
				/>
			</>
		)
	}, [filteredToken, handleSelect, optionItems])

	return (
		<Modal open={isOpen} onOpenChange={close}>
			<ModalContent className="flex h-[600px] max-h-[90vh] flex-col px-0 pb-0">
				<ModalHeader className="h-fit py-0">
					<ModalTitle className="flex items-center justify-between px-6 text-xl">Select a token pair</ModalTitle>
					<ModalDescription />
				</ModalHeader>
				<div className="flex grow flex-col gap-6 overflow-hidden">
					<div className="no-scrollbar shrink-0 overflow-x-scroll px-5 py-0.5">
						<RadioButtonGroup
							value={filteredToken?.currencyId ?? ""}
							buttonColor="gray"
							buttonStyle="outline"
							groupingStyle="gap"
							size="sm"
							className="md:gap-1.5"
							itemClassName="px-2 py-1"
							options={tokens.map((token) => ({
								value: token.currencyId,
								label: (
									<div className="flex items-center gap-2">
										<TokenIcon token={token} className="size-5" />
										{token.symbol}
									</div>
								),
								onClick: () => {
									setFilteredToken((prev) => {
										if (prev === undefined) return token
										// clear filtered token if the selected token is the same as the filtered token
										if (prev.equals(token)) return undefined
										return token
									})
								},
							}))}
						/>
					</div>
					<div className={cn("no-scrollbar flex grow flex-col gap-4 overflow-scroll overflow-y-auto pb-4")}>
						{sections}
					</div>
				</div>
			</ModalContent>
		</Modal>
	)
}

const TokenPairSection: React.FC<{
	title?: string
	icon?: React.ReactNode
	options?: [EvmToken, EvmToken][]
	onSelect?: (tokenPair: [EvmToken, EvmToken]) => void
	notFoundPlaceholder?: React.ReactNode
	itemProps?: Partial<TokenPairItemProps>
	isLoading?: boolean
}> = ({ icon, title, options, onSelect, notFoundPlaceholder, itemProps, isLoading }) => {
	if ((!options || options.length === 0) && !notFoundPlaceholder && !isLoading) return null

	return (
		<div className="flex flex-col">
			<div className="sticky top-0 z-50 bg-background px-4 py-1.5 text-base font-medium text-gray-400 dark:bg-background-dark dark:text-gray-700 md:px-6">
				<Skeleton width={150} isLoading={isLoading} className="flex items-center gap-2">
					{icon}
					{title}
				</Skeleton>
			</div>
			{isLoading && Array.from({ length: 8 }).map((_, i) => <TokenItem key={i} />)}
			{options?.length === 0 && notFoundPlaceholder}
			{options?.map((tokenPair) => (
				<TokenPairItem
					key={`${tokenPair[0].address}-${tokenPair[1].address}`}
					tokenPair={tokenPair}
					onClick={() => onSelect?.(tokenPair)}
					className={cn(
						"hover:bg-gray-50 dark:hover:bg-gray-950",
						"px-4 py-3 md:px-6",
						"cursor-pointer",
						itemProps?.className,
					)}
					{...itemProps}
				/>
			))}
		</div>
	)
}
