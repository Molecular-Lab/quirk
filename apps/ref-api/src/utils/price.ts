import dayjs from "dayjs"
import { Duration } from "dayjs/plugin/duration"

/**
 * Calculate the price change in a given duration
 */
export const priceChangeInDuration = (
	data: {
		timestamp: number
		priceUSD: number
		open: number
	}[],
	duration: Duration,
) => {
	const start = dayjs().subtract(duration)

	const priceBeforeStartOfDuration = data.filter((e) => e.timestamp < start.unix())
	const priceAfterStartOfDuration = data.filter((e) => e.timestamp >= start.unix())

	let priceBefore = priceBeforeStartOfDuration[priceBeforeStartOfDuration.length - 1]?.priceUSD

	if (priceBeforeStartOfDuration.length > 0) {
		// use price of the data point before the duration
		priceBefore = priceBeforeStartOfDuration[priceBeforeStartOfDuration.length - 1]?.priceUSD
	} else {
		// if there is no data before the duration, use the open price of the first data point in the duration
		priceBefore = priceAfterStartOfDuration[0]?.open
	}

	const currentPrice = data[data.length - 1]?.priceUSD

	if (!currentPrice || !priceBefore) {
		return 0
	}

	return (currentPrice - priceBefore) / priceBefore
}
