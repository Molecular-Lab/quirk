import { type Address } from "viem"

import { TokenAmount } from "@/types/tokens"

import { ExploreQueryKeys } from "./explore"
import { OrderQueryKeys } from "./order"
import { PoolQueryKeys, PositionQueryKeys } from "./pool"
import { QuoteQueryKeys } from "./quote"
import { TokenBalanceQueryKeys, TokenQueryKeys } from "./token"
import { WalletQueryKeys } from "./wallet"

/**
 * to keep all query keys in the same format / type
 */
export const QueryKeys = {
	pool: PoolQueryKeys,
	position: PositionQueryKeys,
	token: TokenQueryKeys,
	tokenBalance: TokenBalanceQueryKeys,
	allowance: (walletAddress: Address | undefined, currencyId: string | undefined, spender: Address | undefined) => [
		"allowance",
		walletAddress,
		currencyId,
		spender,
	],
	quote: QuoteQueryKeys,
	explore: ExploreQueryKeys,
	lzFee: (sourceToken: TokenAmount | undefined, destToken: TokenAmount | undefined, address: string | undefined) => [
		"lzFee",
		sourceToken?.string,
		sourceToken?.token.currencyId,
		destToken?.token.currencyId,
		address,
	],
	wallet: WalletQueryKeys,
	order: OrderQueryKeys,
} as const
