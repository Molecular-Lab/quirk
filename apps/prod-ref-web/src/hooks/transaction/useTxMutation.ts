import { useCallback } from "react"

import { useMutation } from "@tanstack/react-query"

import type { UseMutationOptions, UseMutationResult } from "@tanstack/react-query"

export interface MutationAction<Params, SubmitResponse, TxResult> {
	/**
	 * before the mutation is called
	 */
	onInit?: (data: Params) => void
	/**
	 * after the mutation is called (tx is submitted)
	 */
	onSubmitted?: UseMutationOptions<SubmitResponse, Error, Params>["onSuccess"]
	/**
	 * after the tx is confirmed
	 */
	onSuccess?: (GetTransactionResponse: TxResult) => void
	/**
	 * on error before the tx is submitted
	 */
	onError?: UseMutationOptions<SubmitResponse, Error, Params>["onError"]
	/**
	 * on error after the tx is submitted (tx reverted)
	 */
	onTxError?: (error: Error, data: { params: Params; resp: SubmitResponse }) => void
}

export type UseTxMutationOptions<Params, SubmitResponse, TxResult> = MutationAction<
	Params,
	SubmitResponse,
	TxResult
> & {
	mutationFn: (data: Params) => Promise<SubmitResponse>
}

interface UseTxMutationResult<Params, SubmitResponse, TxResult> {
	mutateAsync: (data: Params, action?: MutationAction<Params, SubmitResponse, TxResult>) => Promise<void>
	isPendingTxSubmit: UseMutationResult<SubmitResponse, Error, Params>["isPending"]
	txSubmitError: UseMutationResult<SubmitResponse, Error, Params>["error"]
	mutationStatus: UseMutationResult<SubmitResponse, Error, Params>["status"]
	isPendingTxConfirm: UseMutationResult<SubmitResponse, Error, Params>["isPending"]
	txConfirmError: UseMutationResult<SubmitResponse, Error, Params>["error"]
	txMutationStatus: UseMutationResult<SubmitResponse, Error, Params>["status"]
	isPending: UseMutationResult<SubmitResponse, Error, Params>["isPending"]
}

export const useTxMutation = <Params, SubmitResponse, TxResult>(
	waitForTxSuccess: (data: { params: Params; resp: SubmitResponse }) => Promise<TxResult>,
	{
		mutationFn,
		onInit,
		onSubmitted,
		onSuccess,
		onError,
		onTxError,
	}: UseTxMutationOptions<Params, SubmitResponse, TxResult>,
): UseTxMutationResult<Params, SubmitResponse, TxResult> => {
	const mutation = useMutation<SubmitResponse, Error, Params>({
		mutationFn: mutationFn,
		onMutate: onInit,
		onSuccess: onSubmitted,
		onError: onError,
	})

	const txMutation = useMutation<TxResult, Error, { params: Params; resp: SubmitResponse }>({
		mutationFn: waitForTxSuccess,
		onError: onTxError,
		onSuccess: onSuccess,
	})

	/**
	 * @param data data that been used in mutationFn
	 * @param action additional action than when useTxMutation defined
	 */
	const mutateAsync = useCallback(
		async (params: Params, action?: MutationAction<Params, SubmitResponse, TxResult>) => {
			action?.onInit?.(params)
			const resp = await mutation.mutateAsync(params, {
				onSuccess: action?.onSubmitted,
				onError: action?.onError,
			})
			await txMutation.mutateAsync(
				{ params: params, resp: resp },
				{
					onSuccess: action?.onSuccess,
					onError: action?.onTxError,
				},
			)
		},
		[mutation, txMutation],
	)

	return {
		mutateAsync: mutateAsync,

		isPendingTxSubmit: mutation.isPending,
		txSubmitError: mutation.error,
		mutationStatus: mutation.status,

		isPendingTxConfirm: txMutation.isPending,
		txConfirmError: txMutation.error,
		txMutationStatus: txMutation.status,

		isPending: mutation.isPending || txMutation.isPending,
	}
}
