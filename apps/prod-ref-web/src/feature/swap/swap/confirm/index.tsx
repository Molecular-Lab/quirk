import { useEffect, useMemo, useState } from "react"

import { Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle } from "@rabbitswap/ui/basic"

import { AnimateChangeInHeight } from "@/components/Animate/AnimateChangeInHeight"
import { usePriceImpact } from "@/feature/swap/hooks/usePriceImpact"
import { SwapReview } from "@/feature/swap/swap/components/SwapReview"
import { useAccount } from "@/hooks/useAccount"
import { useSwapChainId } from "@/hooks/useChainId"
import { usePrevious } from "@/utils/usePrevious"

import { useSwapAllowance } from "../hooks/useSwapAllowance"
import { useSwapQuote } from "../hooks/useSwapQuote"
import { useSwapProcessStore } from "../store/swapProcessStore"
import { useSwapStore } from "../store/swapStore"

import { PriceImpact } from "./components/PriceImpact"
import { SwapProcess } from "./components/SwapProcess"
import { useConfirmMutation } from "./hooks/useConfirmMutation"
import { useQuoteDiffers } from "./hooks/useQuoteDiffers"

const PRICE_IMPACT_THRESHOLD = -15 // -15%

export const ConfirmSwapModal: React.FC<{
	onClose: () => void
	open: boolean
}> = ({ open, onClose }) => {
	const { amountIn, amountOut, routeName } = useSwapStore()
	const { reset, type, process } = useSwapProcessStore()

	const { isLoading: quoteLoading, data: quote } = useSwapQuote()

	// =================== Account & Chain ===================
	const { address, chainId } = useAccount()
	const supportedChain = useSwapChainId()
	const prevAccount = usePrevious(address)

	// Close modal when account or chain changes
	useEffect(() => {
		if (!open) return
		if ((prevAccount && !address) || address !== prevAccount) onClose()
		if (chainId !== supportedChain) onClose()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, chainId, prevAccount, supportedChain])

	// =================== Price Impact ===================
	const { data: priceImpact } = usePriceImpact({
		amountIn: quote?.amountIn,
		amountOut: quote?.amountOut,
	})
	const [acceptImpact, setAcceptImpact] = useState(false)

	// =================== Allowance ===================
	const { isLoading: allowanceLoading, isAllowed } = useSwapAllowance(routeName)

	// =================== Differs ====================
	const differs = useQuoteDiffers({ quote })
	const [quoteChanged, setQuoteChanged] = useState(false)
	useEffect(() => {
		if (open && differs) setQuoteChanged(true)
		if (!open) setQuoteChanged(false)
	}, [differs, open])

	// =================== Content ===================
	const content = useMemo(() => {
		// if user already start to swap, don't show these
		if (process === "REVIEWING") {
			// if impact < PRICE_IMPACT_THRESHOLD, show impact modal
			if (!acceptImpact && priceImpact.priceImpact?.lte(PRICE_IMPACT_THRESHOLD))
				return (
					<PriceImpact
						onConfirm={() => {
							setAcceptImpact(true)
						}}
						onCancel={onClose}
					/>
				)

			if (allowanceLoading || quoteLoading)
				return (
					<SwapReview.Button
						amountIn={amountIn}
						amountOut={amountOut}
						buttonProps={{
							loading: true,
							disabled: true,
							children: "Loading",
						}}
					/>
				)

			if (quoteChanged)
				return (
					<SwapReview.Change
						amountIn={amountIn}
						amountOut={amountOut}
						onAccept={() => {
							setQuoteChanged(false)
						}}
					/>
				)
		}

		// use single type when the token is allowed
		if (type === "single" || (!type && isAllowed)) return <OnlySwap />
		return <StepSwap />
	}, [
		acceptImpact,
		allowanceLoading,
		amountIn,
		amountOut,
		isAllowed,
		onClose,
		priceImpact.priceImpact,
		process,
		quoteChanged,
		quoteLoading,
		type,
	])

	// reset when modal is closed
	useEffect(() => {
		if (!open) {
			reset()
			setAcceptImpact(false)
		}
	}, [open, reset])

	if (!amountIn || !amountOut) return null

	return (
		<Modal open={open} onOpenChange={onClose}>
			<ModalContent
				className="overflow-visible md:p-0"
				hideCloseButton={process === "SWAP_SIGNING" || process === "APPROVE_SIGNING"}
			>
				<AnimateChangeInHeight className="flex flex-col">
					<ModalHeader className="m-0 space-y-0 p-0">
						<ModalTitle />
						<ModalDescription />
					</ModalHeader>
					<div className="flex flex-col gap-6 md:px-5 md:py-6">{content}</div>
				</AnimateChangeInHeight>
			</ModalContent>
		</Modal>
	)
}

const OnlySwap: React.FC = () => {
	const { swap } = useConfirmMutation()
	const { process, swapTx, setType, setRouteName } = useSwapProcessStore()
	const { amountIn, amountOut, routeName } = useSwapStore()

	switch (process) {
		case "SWAP_SIGNING": {
			return <SwapProcess.Pending />
		}
		case "SWAP_SUBMITTED": {
			return <SwapProcess.Submit tx={swapTx!} />
		}
		case "SWAP_SUCCESS": {
			return <SwapProcess.Success tx={swapTx!} />
		}
		default: {
			return (
				<SwapReview.Button
					amountIn={amountIn}
					amountOut={amountOut}
					buttonProps={{
						onClick: () => {
							setType("single")
							setRouteName(routeName)
							swap()
						},
						children: "Confirm Swap",
					}}
				/>
			)
		}
	}
}

export const StepSwap: React.FC = () => {
	const { approve, swap } = useConfirmMutation()
	const { process, swapTx, setType, routeName: processingRouteName, setRouteName } = useSwapProcessStore()
	const { amountIn, amountOut, routeName } = useSwapStore()

	const { isAllowed } = useSwapAllowance(processingRouteName ?? routeName)

	useEffect(() => {
		if (process === "APPROVE_SUBMITTED" && isAllowed)
			// after the approve tx, if tx is successful, trigger the swap
			swap()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAllowed])

	switch (process) {
		case "APPROVE_SIGNING": {
			return <SwapReview.Step stepProps={{ approve: "signing" }} amountIn={amountIn} amountOut={amountOut} />
		}
		case "APPROVE_SUBMITTED": {
			return <SwapReview.Step stepProps={{ approve: "pending" }} amountIn={amountIn} amountOut={amountOut} />
		}
		case "SWAP_SIGNING": {
			return <SwapReview.Step stepProps={{ swap: "signing" }} amountIn={amountIn} amountOut={amountOut} />
		}
		case "SWAP_SUBMITTED": {
			return <SwapProcess.Submit tx={swapTx!} />
		}
		case "SWAP_SUCCESS": {
			return <SwapProcess.Success tx={swapTx!} />
		}
		default: {
			return (
				<SwapReview.Button
					amountIn={amountIn}
					amountOut={amountOut}
					buttonProps={{
						onClick: () => {
							setType("steps")
							setRouteName(routeName)
							approve()
						},
						children: "Confirm Swap",
					}}
				/>
			)
		}
	}
}
