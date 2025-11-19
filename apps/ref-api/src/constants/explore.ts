import dayjs from "dayjs"

export const POOL_VOLUME_GRAPH_CONFIG = {
	H: {
		duration: dayjs.duration(1, "hour"),
		interval: dayjs.duration(5, "minutes"),
	},
	D: {
		duration: dayjs.duration(1, "day"),
		interval: dayjs.duration(1, "hour"),
	},
	W: {
		duration: dayjs.duration(1, "week"),
		interval: dayjs.duration(6, "hour"),
	},
	M: {
		duration: dayjs.duration(1, "month"),
		interval: dayjs.duration(1, "day"),
	},
	Y: {
		duration: dayjs.duration(1, "year"),
		interval: dayjs.duration(7, "day"),
	},
}

export const POOL_PRICE_GRAPH_CONFIG = {
	// 12 data points
	H: {
		duration: dayjs.duration(1, "hour"),
		interval: dayjs.duration(5, "minutes"),
	},
	// 288 data points
	D: {
		duration: dayjs.duration(1, "day"),
		interval: dayjs.duration(5, "minutes"),
	},
	// 168 data points
	W: {
		duration: dayjs.duration(1, "week"),
		interval: dayjs.duration(1, "hour"),
	},
	// 180 data points
	M: {
		duration: dayjs.duration(1, "month"),
		interval: dayjs.duration(4, "hour"),
	},
	// 365 data points
	Y: {
		duration: dayjs.duration(1, "year"),
		interval: dayjs.duration(1, "day"),
	},
}
