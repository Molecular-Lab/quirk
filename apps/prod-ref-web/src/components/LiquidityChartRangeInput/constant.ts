import { ChartColors } from "@/components/LiquidityChartRangeInput/Chart"
import { ZoomLevels } from "@/components/LiquidityChartRangeInput/types"
import { FeeAmount } from "@/constants/dex"

export const ZOOM_LEVELS: Record<FeeAmount, ZoomLevels> = {
	[100]: {
		// 1%
		initialMin: 0.99,
		initialMax: 1.01,
		min: 0.00001,
		max: 1000,
	},
	[500]: {
		// 10%
		initialMin: 0.9,
		initialMax: 1.1,
		min: 0.00001,
		max: 1000,
	},
	[3000]: {
		// 15%
		initialMin: 0.85,
		initialMax: 1.15,
		min: 0.00001,
		max: 1000,
	},
	[10000]: {
		// 20%
		initialMin: 0.8,
		initialMax: 1.2,
		min: 0.00001,
		max: 1000,
	},
}

export const chartColors: ChartColors = {
	area: {
		liquidity: {
			west: "#FFF842",
			east: "#FFF842",
		},
		selection: "#C1E2FD",
	},
	brush: {
		label: "#F6F5F4",
		handle: {
			west: "#2560B9",
			east: "#2560B9",
			bar: "#080808",
		},
		arrow: {
			west: "#2560B9",
			east: "#2560B9",
		},
	},
	axis: {
		line: "#E7E7E7",
		centerLine: "#6D6D6D",
		text: "#9D9D9D",
	},
}
