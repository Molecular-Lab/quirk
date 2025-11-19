import { useEffect, useMemo } from "react"

import BigNumber from "bignumber.js"

import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { useSwapStore } from "@/feature/swap/swap/store/swapStore"
import { useArkenQuote } from "@/hooks/swap/arken/useArkenQuote"
import { useQuote } from "@/hooks/swap/useQuote"

import { RouteSelector } from "./RouteSelector"
import { RouteName, RoutePriceItem } from "./type"

export const SwapRouterBox: React.FC<PropsWithClassName> = () => {
	const {
		amountIn,
		amountOut,
		type,
		routeName,
		setRouteName,
		computed: { typing },
	} = useSwapStore()

	const disabled = typing

	const rabbitswapQuote = useQuote({ amountIn, amountOut, type, disabled })
	const arkenQuote = useArkenQuote({ amountIn, amountOut, type, disabled })

	const routePrice = useMemo<Record<RouteName, RoutePriceItem>>(() => {
		return {
			rabbitswap: {
				price: rabbitswapQuote.data?.quotePrice,
				isLoading: rabbitswapQuote.isLoading,
			},
			arken: {
				price: arkenQuote.data?.quotePrice,
				isLoading: arkenQuote.isLoading,
			},
		}
	}, [arkenQuote.data?.quotePrice, arkenQuote.isLoading, rabbitswapQuote.data?.quotePrice, rabbitswapQuote.isLoading])

	const bestRoute = useMemo<RouteName | undefined>(() => {
		const routes = Object.entries(routePrice).map<[RouteName, BigNumber]>(([k, v]) => [
			k as RouteName,
			v.price?.value ?? BigNumber(0),
		])

		// sort in descending order
		const sortedRoutes = routes.sort(([_, a], [__, b]) => {
			return -(a.comparedTo(b) ?? 0)
		})

		return sortedRoutes[0]?.[0]
	}, [routePrice])

	/**
	 * default select best route
	 */
	useEffect(() => {
		setRouteName(bestRoute ?? "rabbitswap")
	}, [bestRoute, setRouteName])

	return (
		<RouteSelector
			className={cn((!amountIn || !amountOut) && "hidden")}
			selectedRoute={routeName}
			onSelect={setRouteName}
			bestRoute={bestRoute}
			routePrice={routePrice}
		/>
	)
}
