import { Theme } from "@rabbitswap/ui/providers"

import { resolveColor as resolve } from "@/utils/color"

export const chartStyles = (theme: Theme) => ({
	liquidity: {
		token0: "#E9D33333",
		token0Active: "#E9D333",
		token1: "#4970D533",
		token1Active: "#4970D5",
		activeBarBg: resolve(theme, "#FFFFFF15", "#00000015"),
	},
	price: {
		reference: {
			lineColor: resolve(theme, "#00000015", "#FFFFFF15"),
			lineWidthMinMax: 1.2,
			lineWidthCurrent: 2,
			labelText: resolve(theme, "#262626", "#FFFFFF"),
			labelBg: resolve(theme, "#DDDDDD", "#262626"),
			Buy: {
				lineColor: "#40B66B",
				labelText: "#FFFFFF",
				labelBg: "#40B66B",
			},
			Sell: {
				lineColor: "#FF5F52",
				labelText: "#FFFFFF",
				labelBg: "#FF5F52",
			},
		},
		activeDot: {
			innerColor: "#3098EB",
			innerSize: "3",
			outerColor: "#3098EB66",
			outerSize: "6",
		},
		fill: "transparent",
		strokeColor: "#3098EB",
		stokeWidth: 1.2,
	},
	volume: {
		bar: {
			radius: 4,
			dimmedColor: "#E9D33333",
			normalColor: "#E9D333AA",
			activeColor: "#E9D333",
		},
		activeBarBg: resolve(theme, "#00000015", "#FFFFFF15"),
	},
	tvl: {
		overlay: {
			gradientLeftColor: resolve(theme, "#FFFFFF00", "#1F1F2100"),
			gradientRightColor: resolve(theme, "#FFFFFFB4", "#1F1F21B4"),
		},
		reference: {
			lineColor: resolve(theme, "#00000015", "#FFFFFF15"),
			labelText: resolve(theme, "#262626", "#FFFFFF"),
			labelBg: resolve(theme, "#DDDDDD", "#262626"),
		},
		activeDot: {
			innerColor: "#3098EB",
			innerSize: "3",
			outerColor: "#3098EB66",
			outerSize: "6",
		},
		fill: resolve(theme, "#AED8FB88", "#097AD488"),
		strokeColor: "#3098EB",
		stokeWidth: 1.7,
	},
})
