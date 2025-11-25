import { useEffect, useMemo } from "react"

import { useAccount } from "@particle-network/connectkit"

import { Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle } from "@rabbitswap/ui/basic"

import { AnimateChangeInHeight } from "@/components/Animate/AnimateChangeInHeight"
import { LimitOrderReview } from "@/feature/swap/limit/components/LimitOrderReview"
import { LimitOrderProcess } from "@/feature/swap/limit/confirm/LimitOrderProcess"
import { useConfirmMutation } from "@/feature/swap/limit/hooks/useConfirmMutation"
import { useLimitOrderAllowance } from "@/feature/swap/limit/hooks/useLimitOrderAllowance"
import { useLimitOrderQuote } from "@/feature/swap/limit/hooks/useLimitOrderQuote"
import { useLimitProcessStore } from "@/feature/swap/limit/store/limitProcessStore"
import { useLimitStore } from "@/feature/swap/limit/store/limitStore"
import { useSwapChainId } from "@/hooks/useChainId"
import { usePrevious } from "@/utils/usePrevious"

export const LimitConfirmModal: React.FC<{
	onClose: () => void
	open: boolean
}> = ({ open, onClose }) => {
	const {
		computed: { amountIn, amountOut },
	} = useLimitStore()
	const { reset, type, process } = useLimitProcessStore()

	const { isLoading: quoteLoading } = useLimitOrderQuote()

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

	// =================== Allowance ===================
	const { isLoading: allowanceLoading, isAllowed } = useLimitOrderAllowance()

	// =================== Content ===================
	const content = useMemo(() => {
		// if user already start to swap, don't show these
		if (process === "REVIEWING" && (allowanceLoading || quoteLoading))
			return (
				<LimitOrderReview.Button
					amountIn={amountIn}
					amountOut={amountOut}
					buttonProps={{
						loading: true,
						disabled: true,
						children: "Loading",
					}}
				/>
			)

		// use single type when the token is allowed
		if (type === "single" || (!type && isAllowed)) {
			return <OnlySwap onClose={onClose} />
		}
		return <StepSwap onClose={onClose} />
	}, [allowanceLoading, amountIn, amountOut, isAllowed, onClose, process, quoteLoading, type])

	// reset when modal is closed
	useEffect(() => {
		if (!open) {
			reset()
		}
	}, [open, reset])

	if (!amountIn || !amountOut) return null

	return (
		<Modal open={open} onOpenChange={onClose}>
			<ModalContent
				className="overflow-visible md:p-0"
				hideCloseButton={process === "ORDER_SIGNING" || process === "APPROVE_SIGNING"}
			>
				<AnimateChangeInHeight className="flex flex-col">
					<ModalHeader className="m-0 space-y-0 p-0">
						<ModalTitle />
						<ModalDescription />
					</ModalHeader>
					<div className="flex flex-col gap-4 md:px-5 md:py-6 lg:gap-6">{content}</div>
				</AnimateChangeInHeight>
			</ModalContent>
		</Modal>
	)
}

const OnlySwap: React.FC<{ onClose: () => void }> = ({ onClose }) => {
	const {
		computed: { amountIn, amountOut },
	} = useLimitStore()
	const { placeOrder } = useConfirmMutation()
	const { process, createOrderTx, setType } = useLimitProcessStore()

	switch (process) {
		case "ORDER_SIGNING": {
			return <LimitOrderProcess.Pending />
		}
		case "ORDER_SUBMITTED": {
			return <LimitOrderProcess.Submit tx={createOrderTx} onClose={onClose} />
		}
		case "ORDER_SUCCESS": {
			return <LimitOrderProcess.Success tx={createOrderTx} onClose={onClose} />
		}
		case "ORDER_FAILED": {
			return <LimitOrderProcess.Failed tx={createOrderTx} />
		}
		default: {
			return (
				<LimitOrderReview.Button
					amountIn={amountIn}
					amountOut={amountOut}
					buttonProps={{
						onClick: () => {
							setType("single")
							placeOrder()
						},
						children: "Placing Limit Order",
					}}
				/>
			)
		}
	}
}

const StepSwap: React.FC<{
	onClose: () => void
}> = ({ onClose }) => {
	const { approve, placeOrder } = useConfirmMutation()
	const { process, createOrderTx, setType } = useLimitProcessStore()
	const {
		computed: { amountIn, amountOut },
	} = useLimitStore()

	const { isAllowed } = useLimitOrderAllowance()

	useEffect(() => {
		if (process === "APPROVE_SUBMITTED" && isAllowed)
			// after the approve tx, if tx is successful, trigger the swap
			placeOrder()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAllowed])

	switch (process) {
		case "APPROVE_SIGNING": {
			return <LimitOrderReview.Step stepProps={{ approve: "signing" }} amountIn={amountIn} amountOut={amountOut} />
		}
		case "APPROVE_SUBMITTED": {
			return <LimitOrderReview.Step stepProps={{ approve: "pending" }} amountIn={amountIn} amountOut={amountOut} />
		}
		case "ORDER_SIGNING": {
			return <LimitOrderReview.Step stepProps={{ swap: "signing" }} amountIn={amountIn} amountOut={amountOut} />
		}
		case "ORDER_SUBMITTED": {
			return <LimitOrderProcess.Submit tx={createOrderTx} onClose={onClose} />
		}
		case "ORDER_SUCCESS": {
			return <LimitOrderProcess.Success tx={createOrderTx} onClose={onClose} />
		}
		case "ORDER_FAILED": {
			return <LimitOrderProcess.Failed tx={createOrderTx} />
		}
		default: {
			return (
				<LimitOrderReview.Button
					amountIn={amountIn}
					amountOut={amountOut}
					buttonProps={{
						onClick: () => {
							setType("steps")
							approve()
						},
						children: "Confirm Place Order",
					}}
				/>
			)
		}
	}
}
