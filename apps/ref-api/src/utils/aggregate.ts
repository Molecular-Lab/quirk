import dayjs, { Dayjs } from "dayjs"
import duration from "dayjs/plugin/duration"
import utc from "dayjs/plugin/utc"

import { ChartData } from "@rabbitswap/api-core"

dayjs.extend(duration)
dayjs.extend(utc)

/**
 * This function rounds a date to the start of an interval.
 * It takes a date and an interval and returns the date rounded to the start of the interval.
 */
export const roundToStartOf = (date: dayjs.Dayjs, interval: plugin.Duration): dayjs.Dayjs => {
	const day = date.valueOf()
	return dayjs(day - (day % interval.asMilliseconds()))
}

/**
 * This function aggregates data by time interval.
 * It takes an array of objects, an interval, a date field, and a date range.
 * It returns an array of objects with the aggregated data.
 */
export const aggregateByInterval = <T extends string>(
	data: (Record<T, number> & {
		timestamp: number
	})[],
	interval: plugin.Duration,
	dateField: T,
	dateRange: [dayjs.Dayjs, dayjs.Dayjs],
	getSlotTime = roundToStartOf,
): ChartData[] => {
	const aggregatedMap = new Map<number, number>()
	const [startDate, endDate] = dateRange

	// initialize the aggregated map with the time slots
	let currentDate = getSlotTime(startDate, interval)
	while (!currentDate.isAfter(endDate)) {
		aggregatedMap.set(currentDate.unix(), 0)
		currentDate = currentDate.add(interval)
	}

	// loop through the items and aggregate the data
	for (const item of data) {
		const val = item[dateField]
		const slotTime = getSlotTime(dayjs.unix(item.timestamp), interval).unix()

		if (aggregatedMap.has(slotTime)) {
			aggregatedMap.set(slotTime, (aggregatedMap.get(slotTime) ?? 0) + val)
		}
	}

	// return the aggregated data
	return Array.from(aggregatedMap, ([timestamp, data]) => ({
		data,
		timestamp,
	}))
}

/**
 * This function takes irregular time series data and formats it into regular intervals,
 * filling any gaps with the most recently known value.
 */
export const formatByInterval = <T>(
	items: { timestamp: number; data: T }[],
	startTime: Dayjs,
	interval: plugin.Duration,
): { timestamp: number; data: T }[] => {
	const formattedData: { timestamp: number; data: T }[] = []
	let currTime = roundToStartOf(startTime, interval)
	let prevData: T | undefined

	// loop through the items
	for (const item of items) {
		// while the time not reached current data point's timestamp, fill the time with the previous data
		while (currTime.isBefore(dayjs.unix(item.timestamp))) {
			if (prevData !== undefined) {
				formattedData.push({ timestamp: currTime.unix(), data: prevData })
			}
			currTime = currTime.add(interval)
		}

		// update the previous data
		prevData = item.data
	}

	// fill the rest of the time with the last data
	while (currTime.isBefore(dayjs()) && prevData !== undefined) {
		formattedData.push({ timestamp: currTime.unix(), data: prevData })
		currTime = currTime.add(interval)
	}

	return formattedData
}
