/* eslint-disable @typescript-eslint/no-extraneous-class */
import JSBI from "jsbi"

import { Q96 } from "@/constants/jsbi"

export abstract class SqrtPriceMath {
	/**
	 * Cannot be constructed.
	 */
	private constructor() {}

	public static getAmount0Delta(sqrtRatioAX96: JSBI, sqrtRatioBX96: JSBI, liquidity: JSBI): JSBI {
		if (JSBI.greaterThan(sqrtRatioAX96, sqrtRatioBX96)) {
			;[sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96]
		}

		const numerator1 = JSBI.leftShift(liquidity, JSBI.BigInt(96))
		const numerator2 = JSBI.subtract(sqrtRatioBX96, sqrtRatioAX96)

		// numerator1 * numerator2 / sqrtRatioBX96 / sqrtRatioAX96
		return JSBI.divide(JSBI.divide(JSBI.multiply(numerator1, numerator2), sqrtRatioBX96), sqrtRatioAX96)
	}

	public static getAmount1Delta(sqrtRatioAX96: JSBI, sqrtRatioBX96: JSBI, liquidity: JSBI): JSBI {
		if (JSBI.greaterThan(sqrtRatioAX96, sqrtRatioBX96)) {
			;[sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96]
		}

		return JSBI.divide(JSBI.multiply(liquidity, JSBI.subtract(sqrtRatioBX96, sqrtRatioAX96)), Q96)
	}
}
