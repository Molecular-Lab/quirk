import { PropsWithChildren, useMemo } from "react"

import qs from "qs"
import { Address } from "viem"
import { viction } from "viem/chains"

import { useTheme } from "@rabbitswap/ui/providers"
import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { RabbitWithHand } from "@/components/Mascot/RabbitWithHand"
import { isAllowedLimitOrderTokenPair } from "@/feature/swap/limit/condition"
import { useRepresentativePool } from "@/hooks/liquidity/useRepresentativePool"
import { useSwapChainId } from "@/hooks/useChainId"
import { EvmToken } from "@/types/tokens"

export const GeckoTerminalChart: React.FC<{
	tokenA: EvmToken | undefined
	tokenB: EvmToken | undefined
}> = ({ tokenA, tokenB }) => {
	const { theme } = useTheme()
	const chainId = useSwapChainId()

	const { data: pool } = useRepresentativePool({ tokenA, tokenB })

	const poolAddress = useMemo<Address | undefined>(() => {
		return pool?.address
	}, [pool?.address])

	const path = useMemo(() => {
		if (chainId !== viction.id) return ""
		if (!poolAddress) return ""
		const baseUrl = "https://www.geckoterminal.com/tomochain/pools"
		const query = qs.stringify({
			embed: 1,
			info: 0,
			swaps: 0,
			grayscale: 0,
			light_chart: theme === "light" ? 1 : 0,
			chart_type: "price",
			resolution: "15m",
		})
		return `${baseUrl}/${poolAddress.toLowerCase()}?${query}`
	}, [chainId, poolAddress, theme])

	if (!tokenA || !tokenB) {
		return (
			<ChartContainer>
				<div className="relative mt-48 size-full rounded-2xl bg-gray-50 px-10 py-8 dark:bg-gray-900">
					<RabbitWithHand rabbitSrc="/images/rabbit-404.svg" className="-top-9 lg:-top-8" />
					<div className="h-full content-center text-xl font-semibold text-blue-300 md:text-2xl">
						Select a token to display chart
					</div>
				</div>
			</ChartContainer>
		)
	}

	if (!isAllowedLimitOrderTokenPair([tokenA, tokenB])) {
		return (
			<ChartContainer>
				<div className="relative mt-48 size-full rounded-2xl bg-gray-50 px-10 py-8 dark:bg-gray-900">
					<RabbitWithHand rabbitSrc="/images/rabbit-500.svg" className="-top-9 lg:-top-8" />
					<div className="h-full content-center text-xl font-semibold text-blue-300 md:text-2xl">
						Token pair is not supported
					</div>
				</div>
			</ChartContainer>
		)
	}

	if (!path) {
		return (
			<ChartContainer>
				<div className="relative mt-48 size-full rounded-2xl bg-gray-50 px-10 py-8 dark:bg-gray-900">
					<RabbitWithHand rabbitSrc="/images/rabbit-404.svg" className="-top-9 lg:-top-8" />
					<div className="h-full content-center text-xl font-semibold text-blue-300 md:text-2xl">
						Chart is not available
					</div>
				</div>
			</ChartContainer>
		)
	}

	return (
		<ChartContainer>
			<iframe
				className="size-full min-h-96"
				id="geckoterminal-embed"
				title="GeckoTerminal Embed"
				src={path}
				allow="clipboard-write"
				allowFullScreen
			/>
		</ChartContainer>
	)
}

const ChartContainer: React.FC<PropsWithClassName<PropsWithChildren>> = ({ children, className }) => {
	return (
		<div
			className={cn(
				"max-h-96 min-h-96 w-full rounded-lg text-center",
				"flex flex-col items-center justify-center gap-3 lg:justify-end",
				className,
			)}
		>
			{children}
		</div>
	)
}
