import { useMemo, useState } from "react"

import { Button, Modal, ModalTrigger } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { SwitchChainButton } from "@/components/SwitchChainButton"
import { ConnectEvmWalletButton } from "@/components/Wallet/connectWallet/evmBtn"
import { OwnershipWarningBox } from "@/feature/liquidity/components/OwnershipWarningBox"
import { useAccount } from "@/hooks/useAccount"
import { useSwapChainId } from "@/hooks/useChainId"
import { useNavigate } from "@/router"
import { Pool } from "@/types/pool"
import { Position } from "@/types/position"
import { EvmToken, TokenAmount } from "@/types/tokens"
import { Transaction } from "@/types/transaction"

import { ApproveButton, ConfirmationModal } from "../../components"
import { AddLiquidityFormState } from "../../hooks/useAddLiquidityState"
import { useAddLiquidityStore } from "../../store/useAddLiquidityStore"

import { DepositAmountSection } from "./DepositAmountSection"
import { DepositRatio } from "./DepositRatio"
import { Title } from "./title"

export const StepEnterDepositAmt: React.FC<{
	position: Position | undefined
	tokenA: EvmToken | undefined
	enabledLiquidityAmount: boolean
	enabledButtons: boolean
	dimSectionClassName: string
	tickCurrent: number | undefined
	invalidRange: boolean
	formState: AddLiquidityFormState
	pool: Pool | null | undefined
	customTitle?: React.ReactNode
}> = ({
	position,
	tokenA,
	enabledLiquidityAmount,
	enabledButtons,
	dimSectionClassName,
	tickCurrent,
	invalidRange,
	formState,
	pool,
	customTitle,
}) => {
	const { address } = useAccount()
	const chainId = useSwapChainId()
	const navigate = useNavigate()

	const { token0Amount, setToken0Amount, token1Amount, setToken1Amount, tickLower, tickUpper, priceCurrent } =
		useAddLiquidityStore()

	const [modalOpen, setModalOpen] = useState(false)
	const [addTx, setAddTx] = useState<Transaction<[TokenAmount, TokenAmount]> | undefined>()

	const handleModalOpenChange = (v: boolean) => {
		setModalOpen(v)
		// clear txHash on open
		if (v) {
			setAddTx(undefined)
		}
	}

	const handleOnSubmitted = (tx: Transaction<[TokenAmount, TokenAmount]>) => {
		setAddTx(tx)
		// clear token amount on add success
		setToken0Amount((prev) => prev?.newAmount())
		setToken1Amount((prev) => prev?.newAmount())
	}

	const handleOnSuccess = (tx: Transaction<[TokenAmount, TokenAmount]>) => {
		setAddTx(tx)
	}

	const handleOnModalClose = () => {
		setModalOpen(false)
		if (addTx?.status === "success" || addTx?.status === "pending") {
			if (position) {
				void navigate("/pools/:tokenId", { params: { tokenId: position.position.tokenId.toString() } })
			} else {
				void navigate("/pools")
			}
		}
	}

	const disabledPreviewButton = useMemo<boolean>(() => {
		// no range
		if (tickLower === undefined || tickUpper === undefined || tickCurrent === undefined || invalidRange) {
			return true
		}

		// no token amounts
		if (tickLower < tickCurrent && (token1Amount?.amount === undefined || token1Amount.amount === 0n)) {
			return true
		}
		if (tickCurrent < tickUpper && (token0Amount?.amount === undefined || token0Amount.amount === 0n)) {
			return true
		}

		// init pool
		const noLiquidity = pool === null || pool === undefined
		if (noLiquidity) {
			if (priceCurrent?.value === undefined || priceCurrent.value.eq(0)) {
				return true
			}
		}

		return false
	}, [invalidRange, pool, priceCurrent, tickCurrent, tickLower, tickUpper, token0Amount?.amount, token1Amount?.amount])

	return (
		<div
			className={cn(
				"flex flex-col gap-4 p-4 lg:p-5",
				"h-fit w-full rounded-2xl",
				"border border-gray-100 dark:border-gray-900",
				"backdrop-blur-sm",
				!enabledLiquidityAmount && dimSectionClassName,
			)}
		>
			{customTitle ?? <Title />}
			<DepositAmountSection tickCurrent={tickCurrent} tokenA={tokenA} />
			<DepositRatio token0Amount={token0Amount} token1Amount={token1Amount} />
			{position !== undefined && !position.isOwner(address) && (
				<OwnershipWarningBox ownerAddress={position.position.ownerAddress} />
			)}
			<div className={cn("flex w-full flex-col gap-2", !enabledButtons && dimSectionClassName)}>
				{/* buttons area */}
				{formState === "connect-wallet" && <ConnectEvmWalletButton className="py-4" />}
				{formState === "loading" && (
					<Button disabled className="w-full py-4">
						Loading ...
					</Button>
				)}
				{formState === "insufficient-token0" && (
					<Button disabled className="w-full py-4">
						Insufficient {token0Amount?.token.symbol}
					</Button>
				)}
				{formState === "insufficient-token1" && (
					<Button disabled className="w-full py-4">
						Insufficient {token1Amount?.token.symbol}
					</Button>
				)}
				{formState === "switch-chain" && <SwitchChainButton toChainId={chainId} className="w-full py-4" />}
				{formState === "approve-token0" && <ApproveButton tokenAmount={token0Amount} />}
				{formState === "approve-token1" && <ApproveButton tokenAmount={token1Amount} />}
				{formState === "preview" && (
					<Modal open={modalOpen} onOpenChange={handleModalOpenChange}>
						<ModalTrigger>
							<Button className={cn("w-full py-4")} disabled={disabledPreviewButton}>
								Preview
							</Button>
						</ModalTrigger>
						<ConfirmationModal
							tokenA={tokenA}
							addTx={addTx}
							onClose={handleOnModalClose}
							position={position}
							pool={pool}
							onSubmitted={handleOnSubmitted}
							onSuccess={handleOnSuccess}
						/>
					</Modal>
				)}
			</div>
		</div>
	)
}
