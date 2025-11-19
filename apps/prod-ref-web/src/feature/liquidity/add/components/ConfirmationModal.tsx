import { useCallback, useMemo } from "react"

import { Button, ModalContent, ModalDescription, ModalHeader, ModalTitle } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { AnimateChangeInHeight } from "@/components/Animate/AnimateChangeInHeight"
import { TransactionConfirmed, TransactionPending, TransactionSubmitted } from "@/components/Transaction"
import { Pool } from "@/types/pool"
import { Position } from "@/types/position"
import { EvmToken, TokenAmount } from "@/types/tokens"
import { Transaction } from "@/types/transaction"

import { useAddLiquidityMutation } from "../hooks/mutation"
import { useAddLiquidityState } from "../hooks/useAddLiquidityState"
import { useNewPosition } from "../hooks/useNewPosition"
import { useAddLiquidityStore } from "../store/useAddLiquidityStore"

import { LiquidityDetail } from "./LiquidityDetail"

interface ConfirmationModalProps {
	tokenA: EvmToken | undefined
	position: Position | undefined
	pool: Pool | null | undefined

	addTx: Transaction<[TokenAmount, TokenAmount]> | undefined
	onSubmitted: (tx: Transaction<[TokenAmount, TokenAmount]>) => void
	onSuccess: (tx: Transaction<[TokenAmount, TokenAmount]>) => void

	onClose: () => void
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
	tokenA,
	addTx,
	onClose,
	position: _position,
	pool: _pool,
	onSubmitted,
	onSuccess,
}) => {
	const { token0Amount, token1Amount, rangeBy } = useAddLiquidityStore()
	const { tickCurrent } = useAddLiquidityState()

	const position = useNewPosition(_pool, _position, tickCurrent)

	const tokenId = useMemo(
		() => (position?.position.tokenId.eq(0) ? undefined : position?.position.tokenId),
		[position?.position.tokenId],
	)

	const { isPendingTxSubmit: isPending, mutateAsync: addLiquidity } = useAddLiquidityMutation(tokenId)
	const noLiquidity = _pool === null || _pool === undefined

	const handleAdd = useCallback(async () => {
		if (!token0Amount || !token1Amount || !position) return
		await addLiquidity(
			{
				amount0: token0Amount.newAmount(position.amount0.amount),
				amount1: token1Amount.newAmount(position.amount1.amount),
				fee: position.position.fee,
				tick: [position.position.tickLower, position.position.tickUpper],
				sqrtPriceX96: BigInt(position.tickCurrentPrice(position.pool.token0).sqrtRatioX96.toString()),
				needPoolInit: noLiquidity,
			},
			{
				onSubmitted: ({ tx }) => {
					onSubmitted(tx)
				},
				onSuccess: ({ tx }) => {
					onSuccess(tx)
				},
			},
		)
	}, [addLiquidity, noLiquidity, onSubmitted, onSuccess, position, token0Amount, token1Amount])

	const inner = useMemo(() => {
		if (addTx !== undefined) {
			if (addTx.status === "success") {
				return (
					<TransactionConfirmed className="my-3" tx={addTx} onClose={onClose}>
						<div>
							Supplied {addTx.data[0].toFormat({ decimalPlaces: 2, withUnit: true })} and{" "}
							{addTx.data[1].toFormat({ decimalPlaces: 2, withUnit: true })}
						</div>
					</TransactionConfirmed>
				)
			}
			return (
				<TransactionSubmitted className="my-3" tx={addTx} onClose={onClose}>
					<div>
						Supplied {addTx.data[0].toFormat({ decimalPlaces: 2, withUnit: true })} and{" "}
						{addTx.data[1].toFormat({ decimalPlaces: 2, withUnit: true })}
					</div>
				</TransactionSubmitted>
			)
		}
		if (isPending) {
			return (
				<TransactionPending className="my-6" title="Add liquidity">
					<div>
						Supplying {token0Amount?.toFormat({ decimalPlaces: 2, withUnit: true })} and{" "}
						{token1Amount?.toFormat({ decimalPlaces: 2, withUnit: true })}
					</div>
				</TransactionPending>
			)
		}
		return (
			<div className="flex flex-col gap-3">
				<LiquidityDetail position={position} isLoading={position === undefined} tokenA={tokenA} rangeBy={rangeBy} />
				<Button onClick={handleAdd} loading={isPending} disabled={isPending} className="mt-2 py-4">
					Add
				</Button>
			</div>
		)
	}, [addTx, handleAdd, isPending, onClose, position, rangeBy, token0Amount, token1Amount, tokenA])

	const hideTitle = addTx !== undefined || isPending

	return (
		<ModalContent
			className="overflow-visible"
			onOpenAutoFocus={(e) => {
				e.preventDefault()
			}}
			hideCloseButton={isPending}
		>
			<AnimateChangeInHeight className="flex flex-col">
				<ModalHeader className={cn(hideTitle && "m-0 space-y-0 p-0")}>
					<ModalTitle>{hideTitle ? undefined : "Add liquidity"}</ModalTitle>
					<ModalDescription />
				</ModalHeader>
				{inner}
			</AnimateChangeInHeight>
		</ModalContent>
	)
}
