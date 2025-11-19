import { ComponentProps, useMemo } from "react"

import { useWallet } from "@solana/wallet-adapter-react"

import { Button } from "@rabbitswap/ui/basic"

import { SUPPORTED_BRIDGE_CHAINS } from "@/constants/chain"
import { useInsufficientBalance } from "@/hooks/token/useInsufficientBalance"
import { useAccount } from "@/hooks/useAccount"
import { useConnectWallet } from "@/hooks/wallet/useConnectWallet"
import { useSwitchChain } from "@/hooks/wallet/useSwitchChain"

import { useBridgeStore } from "../store/bridgeStore"

import { useBridgeApproveBtnProps } from "./useBridgeApproveBtnProps"
import { useEstimateLzFee } from "./useEstimateLzFee"
import { solana } from "@particle-network/auth-core"

export const usePreBridgeBtnProps = (): Partial<ComponentProps<typeof Button>> | null => {
	const { address, chainId } = useAccount()
	const solanaAccount = useWallet()
	const connect = useConnectWallet()
	const { switchChain } = useSwitchChain()

	const { sourceToken, destToken } = useBridgeStore()
	const approveBtnProps = useBridgeApproveBtnProps()
	const insufficientBtnProps = useInsufficientDstGasBtnProps()

	const isAmountEntered = useMemo(() => {
		return !sourceToken.bigNumber.isZero()
	}, [sourceToken])

	const buttonProps = useMemo<Partial<ComponentProps<typeof Button>> | null>(() => {
		if (!address) {
			return {
				children: "Connect Wallet",
				onClick: connect,
			}
		}

		if (chainId !== sourceToken.token.chainId && sourceToken.token.chainId !== solana.id) {
			return {
				children: `Switch Network to ${SUPPORTED_BRIDGE_CHAINS[sourceToken.token.chainId]?.name}`,
				onClick: () => {
					switchChain(sourceToken.token.chainId)
				},
			}
		}

		if (!isAmountEntered) {
			return {
				disabled: true,
				children: "Enter an amount",
			}
		}
		if (approveBtnProps) return approveBtnProps

		if (destToken.amount === undefined) {
			return {
				disabled: true,
				loading: true,
				children: "Loading",
			}
		}

		if (insufficientBtnProps) return insufficientBtnProps

		return null
	}, [
		sourceToken.token.chainId,
		destToken.token.chainId,
		destToken.amount,
		address,
		chainId,
		isAmountEntered,
		approveBtnProps,
		insufficientBtnProps,
		solanaAccount,
		connect,
		switchChain,
	])

	return buttonProps
}

/**
 * check if the wallet's balance is sufficient for destination gas or not
 */
const useInsufficientDstGasBtnProps = (): Partial<ComponentProps<typeof Button>> | null => {
	const { sourceToken } = useBridgeStore()

	const { data } = useEstimateLzFee()

	const { value: insuffSource, isLoading: isBalanceSrcLoading } = useInsufficientBalance({
		amount: sourceToken.token.equals(data?.nativeFee.token)
			? sourceToken.newAmount(
					sourceToken.amount !== undefined ? sourceToken.amount + (data?.nativeFee.amount ?? 0n) : undefined,
				)
			: sourceToken,
	})

	const { value: insuffGas, isLoading: isBalanceGasLoading } = useInsufficientBalance({
		amount: data?.nativeFee,
	})

	const buttonProps = useMemo<Partial<ComponentProps<typeof Button>> | null>(() => {
		if (isBalanceGasLoading || isBalanceSrcLoading) {
			return {
				disabled: true,
				loading: true,
				children: "Loading",
			}
		}

		if (insuffSource) {
			return {
				disabled: true,
				children: `Insufficient ${sourceToken.token.symbol} balance`,
			}
		}

		if (insuffGas) {
			return {
				disabled: true,
				children: `Insufficient gas balance (${data?.nativeFee.toFormat({ decimalPlaces: 3, withUnit: true })})`,
			}
		}

		return null
	}, [isBalanceGasLoading, isBalanceSrcLoading, insuffSource, insuffGas, sourceToken.token.symbol, data?.nativeFee])

	return buttonProps
}
