import { Price } from "@/types/price"

export type RouteName = "rabbitswap" | "arken"

export interface RoutePriceItem {
	price: Price | undefined
	isLoading: boolean
}
