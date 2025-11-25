import dayjs from "dayjs"

interface Data {
	date: string
	value: number
}

function roundToStartOf(date: string, duration: plugin.Duration): dayjs.Dayjs {
	const utcOffsetMs = dayjs(date).utcOffset() * 60 * 1000
	const dayWithUtcOffset = dayjs(date).valueOf() + utcOffsetMs
	return dayjs(dayWithUtcOffset - (dayWithUtcOffset % duration.asMilliseconds()) - utcOffsetMs)
}

export const filterByTimeDistance = <T extends Data = Data>(data: T[], duration: plugin.Duration): T[] => {
	const sortedData = data.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))

	const filteredData: T[] = []

	for (const item of sortedData) {
		if (filteredData.length === 0) {
			filteredData.push({ ...item })
			continue
		}
		const roundedCurrDate: dayjs.Dayjs = roundToStartOf(item.date, duration)
		const roundedPrevDate: dayjs.Dayjs = roundToStartOf(filteredData[filteredData.length - 1]!.date, duration)
		if (!roundedCurrDate.isSame(roundedPrevDate)) {
			filteredData.push({ ...item })
		}
	}

	return filteredData
}

export const aggregateByTime = <T extends Data = Data>(data: T[], duration: plugin.Duration): T[] => {
	const sortedData = data.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))

	const aggregatedData: T[] = []

	for (const item of sortedData) {
		if (aggregatedData.length === 0) {
			aggregatedData.push({ ...item })
			continue
		}
		const roundedCurrDate: dayjs.Dayjs = roundToStartOf(item.date, duration)
		const roundedPrevDate: dayjs.Dayjs = roundToStartOf(aggregatedData[aggregatedData.length - 1]!.date, duration)
		if (roundedCurrDate.isSame(roundedPrevDate)) {
			aggregatedData[aggregatedData.length - 1]!.value += item.value
		} else {
			aggregatedData.push({ ...item })
		}
	}

	return aggregatedData
}
