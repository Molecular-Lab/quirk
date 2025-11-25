import { useCallback } from "react"

import { AxiosError } from "axios"
import { type TransactionReceipt } from "viem"

import { useTxStore } from "@/store/txStore"
import { Transaction } from "@/types/transaction"
import { getPublicClient } from "@/utils/publicClient"

import { MutationAction, UseTxMutationOptions, useTxMutation } from "./useTxMutation"

const TX_STATUS_START_BUFFER_MS = 5000 // 5 secs
const TX_STATUS_CHECK_INTERVAL_MS = 3000 // 3 secs

const waitForChainTxSuccess = <T extends { tx: Transaction }>(res: T) => {
	const { tx } = res

	return new Promise<{ receipt: TransactionReceipt } & T>((resolve, reject) => {
		const publicClient = getPublicClient(tx.chainId)

		const checkStatus = async () => {
			try {
				const receipt = await publicClient.getTransactionReceipt({
					hash: tx.hash,
				})
				switch (receipt.status) {
					case "success": {
						resolve({ ...res, receipt })
						return
					}
					case "reverted": {
						reject(new Error("Transaction reverted"))
						return
					}
					default: {
						setTimeout(checkStatus, TX_STATUS_CHECK_INTERVAL_MS)
						return
					}
				}
			} catch (error) {
				if (error instanceof Error) {
					// it transaction is not found, wait before checking again
					if (error.name === "TransactionReceiptNotFoundError") {
						setTimeout(checkStatus, TX_STATUS_CHECK_INTERVAL_MS)
						return
					}
				}
				if (error instanceof AxiosError) {
					if (error.response?.status === 404) {
						setTimeout(checkStatus, TX_STATUS_CHECK_INTERVAL_MS)
						return
					}
				}
				if (error instanceof Error) reject(error)
			}
		}

		// wait before start checking
		setTimeout(checkStatus, TX_STATUS_START_BUFFER_MS)
	})
}

export const useChainTxMutation = <Params, Response extends { tx: Transaction }>(
	options: UseTxMutationOptions<Params, Response, { receipt: TransactionReceipt } & Response>,
) => {
	const txStore = useTxStore()
	const { mutateAsync: _mutateAsync, ...rest } = useTxMutation(({ resp }) => waitForChainTxSuccess(resp), {
		...options,
		onSubmitted: (data, variables, context) => {
			options.onSubmitted?.(data, variables, context)
			txStore.setTransaction(data.tx)
		},
		onSuccess: (res) => {
			const newTx = res.tx.newStatus("success")
			const newRes = { ...res, tx: newTx }
			options.onSuccess?.(newRes)
			txStore.setTransaction(newTx)
		},
		onTxError: (error, res) => {
			const newTx = res.resp.tx.newStatus("failed")
			options.onTxError?.(error, { ...res, resp: { ...res.resp, tx: newTx } })
			txStore.setTransaction(newTx)
		},
	})

	const mutateAsync = useCallback(
		(params: Params, actions?: MutationAction<Params, Response, { receipt: TransactionReceipt } & Response>) =>
			_mutateAsync(params, {
				...actions,
				onSuccess: (res) => {
					actions?.onSuccess?.({ ...res, tx: res.tx.newStatus("success") })
				},
				onTxError: (error, res) => {
					const newTx = res.resp.tx.newStatus("failed")
					actions?.onTxError?.(error, { ...res, resp: { ...res.resp, tx: newTx } })
				},
			}),
		[_mutateAsync],
	)

	return { mutateAsync, ...rest }
}
