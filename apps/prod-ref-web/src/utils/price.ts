import BigNumber from "bignumber.js"

import { Price } from "@/types/price"
import { EvmToken } from "@/types/tokens"

export function priceMultiply(a: Price, b: Price): Price {
	const newB = a.quoteCurrency.equals(b.baseCurrency) ? b : b.invert()
	if (!a.quoteCurrency.equals(newB.baseCurrency)) {
		// eslint-disable-next-line no-console
		console.warn(`Wrong pair input to be multiply (a: ${a.toStringWithUnit()}, b: ${b.toStringWithUnit()})`)
		return a
	}
	return new Price({
		base: a.baseCurrency,
		quote: newB.quoteCurrency,
		value: a.value?.multipliedBy(newB.value ?? 0),
	})
}

export function priceArrayConvert(priceList: Price[], initToken: EvmToken): Price {
	const reduced = priceList.reduce(
		(prevPrice, currPrice) => {
			const newPrice = priceMultiply(prevPrice, currPrice)
			return newPrice
		},
		new Price({
			base: initToken,
			quote: initToken,
			value: new BigNumber(1),
		}),
	)

	if (reduced.baseCurrency.equals(initToken)) return reduced
	return reduced.invert()
}
