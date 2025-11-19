import { ComponentProps, useCallback, useMemo, useState } from "react"

import { getAddress } from "viem"

import { Button } from "@rabbitswap/ui/basic"
import { Spinner } from "@rabbitswap/ui/icons"

import { useBridgeStore } from "@/feature/bridge/form/store/bridgeStore"
import { useAllowance } from "@/hooks/token/useAllowance"
import { useApproveMutation } from "@/hooks/token/useApproveMutation"
import { TokenAmount } from "@/types/tokenAmount"

type ApproveButtonState = "IDLE" | "LOADING" | "APPROVING" | ""

export const useBridgeApproveBtnProps = (): Partial<ComponentProps<typeof Button> | null> => {
	const [btnState, setBtnState] = useState<ApproveButtonState>("IDLE")

	const {
		sourceToken,
		computed: { oftAddress: spender },
	} = useBridgeStore()
	const { mutateAsync: approveMutation } = useApproveMutation()

	const sourceAllowance = useAllowance({
		spender: getAddress(spender ?? "0x"),
		amount: sourceToken,
	})

	const getLoadingText = useCallback(
		(token: TokenAmount | undefined) => {
			if (!token) return ""
			switch (btnState) {
				case "LOADING": {
					return `Approving ${token.token.symbol} ...`
				}
				case "APPROVING": {
					return `Confirming ${token.token.symbol} approval ...`
				}
				default: {
					return ""
				}
			}
		},
		[btnState],
	)

	const handleApproveToken = useCallback(async () => {
		try {
			await approveMutation(
				{
					token: sourceToken.token,
					spender: getAddress(spender ?? "0x"),
				},
				{
					onInit: () => {
						setBtnState("LOADING")
					},
					onSubmitted: () => {
						setBtnState("APPROVING")
					},
					onError: () => {
						setBtnState("IDLE")
					},
					onTxError: () => {
						setBtnState("IDLE")
					},
					onSuccess: () => {
						setBtnState("IDLE")
					},
				},
			)
		} catch {
			setBtnState("IDLE")
		}
	}, [approveMutation, sourceToken, spender])

	const buttonProps = useMemo<Partial<ComponentProps<typeof Button>> | null>(() => {
		const isLoading = btnState === "LOADING" || btnState === "APPROVING"

		const isSourceTokenAllow = sourceAllowance.isAllowed ?? false
		if (!isSourceTokenAllow) {
			return {
				disabled: isLoading,
				children: isLoading ? (
					<div className="flex items-center gap-2">
						<Spinner size="sm" />
						{getLoadingText(sourceToken)}
					</div>
				) : (
					`Approve ${sourceToken.token.symbol ?? "Source Token"}`
				),
				onClick: () => {
					void handleApproveToken()
				},
				className: "w-full",
				variant: "primary",
			}
		}

		return null
	}, [btnState, sourceAllowance.isAllowed, getLoadingText, sourceToken, handleApproveToken])

	return buttonProps
}
