import {
	C98_VICTION,
	CARROT_VICTION,
	DADA_VICTION,
	DEF_VICTION,
	ETER_VICTION,
	HONEY_VICTION,
	ONEID_VICTION,
	RABBIT_VICTION,
	SAROS_VICTION,
	STARBASE_VICTION,
	USDT_VICTION,
	VIC,
	VIKTO_VICTION,
	WHEEE_VICTION,
} from "@/constants/token"
import { EvmToken } from "@/types/tokens"
import { sortDisplayTokens } from "@/utils/token"

export const LIMIT_ORDER_TOKEN_PAIRS: [EvmToken, EvmToken][] = [
	[VIC, USDT_VICTION],
	[C98_VICTION, VIC],
	[C98_VICTION, USDT_VICTION],
	[RABBIT_VICTION, C98_VICTION],
	[RABBIT_VICTION, USDT_VICTION],
	[DADA_VICTION, C98_VICTION],
	[DADA_VICTION, USDT_VICTION],
	[ETER_VICTION, C98_VICTION],
	[ETER_VICTION, USDT_VICTION],
	[WHEEE_VICTION, C98_VICTION],
	[WHEEE_VICTION, USDT_VICTION],
	[SAROS_VICTION, C98_VICTION],
	[SAROS_VICTION, USDT_VICTION],
	[ONEID_VICTION, C98_VICTION],
	[ONEID_VICTION, USDT_VICTION],
	[DEF_VICTION, C98_VICTION],
	[DEF_VICTION, USDT_VICTION],
	[STARBASE_VICTION, C98_VICTION],
	[VIKTO_VICTION, C98_VICTION],
	[VIKTO_VICTION, VIC],
	[CARROT_VICTION, C98_VICTION],
	[HONEY_VICTION, C98_VICTION],
]

export function isAllowedLimitOrderTokenPair([tokenA, tokenB]: [EvmToken | undefined, EvmToken | undefined]) {
	const [left, right] = sortDisplayTokens([tokenA, tokenB])
	return LIMIT_ORDER_TOKEN_PAIRS.some(([_a, _b]) => {
		const [a, b] = sortDisplayTokens([_a, _b])
		return a.equals(left) && b.equals(right)
	})
}
