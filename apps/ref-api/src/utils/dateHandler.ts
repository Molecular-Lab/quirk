/* eslint-disable @typescript-eslint/no-extraneous-class */
import dayjs from "dayjs"

import { PoolDataTimeframe, ProtocolChartTimeframe } from "@rabbitswap/api-core"

import { factoryDeployedDate } from "../constants/quote"

export const secondInOneDay: number = 24 * 60 * 60
export const secondInOneWeek: number = secondInOneDay * 7
export const secondInOneMonth: number = secondInOneDay * 30

export class DateHandler {
	/**
	 * Cannot be constructed.
	 */
	private constructor() {}

	public static poolHourDataIdToDate = (id: string) => {
		const [_, hourIndex] = id.split("-")
		return dayjs.unix(Number(hourIndex) * 3600)
	}

	public static getFactoryDeployedDate(timeframe: PoolDataTimeframe): dayjs.Dayjs {
		switch (timeframe) {
			case "H": {
				return factoryDeployedDate.startOf("hour")
			}
			case "D": {
				return factoryDeployedDate.startOf("day")
			}
			case "W": {
				return factoryDeployedDate.startOf("week")
			}
			case "M": {
				return factoryDeployedDate.startOf("month")
			}
			case "Y": {
				return factoryDeployedDate.startOf("year")
			}
		}
	}

	/**
	 * Return the start and end date of the date range for the volume graph
	 * Use in protocol volume graph
	 */
	public static getDateRangeVolumeGraph(timeframe: ProtocolChartTimeframe): {
		startDate: dayjs.Dayjs
		endDate: dayjs.Dayjs
		duration: plugin.Duration
	} {
		const today = dayjs().utcOffset(0).startOf("day")
		let startDate: dayjs.Dayjs
		let duration: plugin.Duration
		const factoryDeployedDate = this.getFactoryDeployedDate(timeframe)

		switch (timeframe) {
			case "D": {
				startDate = today.subtract(29, "day")
				duration = dayjs.duration(1, "day")
				break
			}
			case "W": {
				startDate = today.subtract(51, "week").utcOffset(0).startOf("week")
				duration = dayjs.duration(7, "day")
				break
			}
			case "M": {
				startDate = factoryDeployedDate
				duration = dayjs.duration(1, "month")
				break
			}
		}

		return {
			startDate: factoryDeployedDate.isAfter(startDate) ? factoryDeployedDate : startDate,
			endDate: today,
			duration: duration,
		}
	}
}
