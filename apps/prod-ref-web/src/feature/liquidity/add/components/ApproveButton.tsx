import { useCallback, useMemo, useState } from "react"

import { Button } from "@rabbitswap/ui/basic"

import { NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } from "@/constants/dex"
import { useApproveMutation } from "@/hooks/token/useApproveMutation"
import { TokenAmount } from "@/types/tokenAmount"

type ApproveButtonState = "IDLE" | "LOADING" | "APPROVING"

export const ApproveButton: React.FC<{
	tokenAmount: TokenAmount | undefined
}> = ({ tokenAmount }) => {
	const [state, setState] = useState<ApproveButtonState>("IDLE")
	const { mutateAsync: approveMutation } = useApproveMutation()
	const handleApprove = useCallback(async () => {
		if (!tokenAmount) {
			return
		}
		const { token } = tokenAmount
		const spenderAddr = NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[token.chainId]
		if (!spenderAddr) {
			return
		}
		await approveMutation(
			{
				token: token,
				spender: spenderAddr,
			},
			{
				onInit: () => {
					setState("LOADING")
				},
				onSubmitted: () => {
					setState("APPROVING")
				},
				onError: () => {
					setState("IDLE")
				},
				onTxError: () => {
					setState("IDLE")
				},
				onSuccess: () => {
					setState("IDLE")
				},
			},
		)
	}, [approveMutation, tokenAmount])

	const buttonTitle = useMemo<string>(() => {
		switch (state) {
			case "IDLE":
			case "LOADING": {
				return `Approve ${tokenAmount?.token.symbol}`
			}
			case "APPROVING": {
				return "Approving"
			}
			default: {
				return "Approve"
			}
		}
	}, [state, tokenAmount?.token.symbol])

	return (
		<Button
			className="w-full py-4"
			disabled={tokenAmount === undefined || state === "APPROVING"}
			onClick={handleApprove}
			loading={state !== "IDLE"}
		>
			{buttonTitle}
		</Button>
	)
}
