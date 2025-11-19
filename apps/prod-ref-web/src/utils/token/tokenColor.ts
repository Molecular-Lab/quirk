import { useCallback, useEffect, useState } from "react"

import { extractColors } from "extract-colors"
import { darken, getContrast, lighten } from "polished"

import { Theme } from "@rabbitswap/ui/providers"

import { EvmToken } from "@/types/tokens"

// ccyId -> color
const tokenColorConfig: Record<string, string | undefined> = {
	"88-0x111111267109489dc6f350608d5113B10c0C5cd7": "#bb7fff", // CEC
	"88-0x69B946132B4a6C74cd29Ba3ff614cEEA1eF9fF2B": "#449192", // USDT
}

/**
 * @returns hex of the best color for token in the theme
 */
async function getTokenColor(
	token: EvmToken | undefined,
	theme: Theme = "light",
): Promise<{ rawColor: string | undefined; themeColor: string | undefined }> {
	if (token === undefined) {
		return { rawColor: undefined, themeColor: undefined }
	}
	if (token.iconURL === undefined) {
		return { rawColor: undefined, themeColor: undefined }
	}

	let selectedColor: string | undefined = tokenColorConfig[token.currencyId]
	if (selectedColor === undefined) {
		try {
			/**
			 * list of colors in picture, sorted by area desc, selected the first one
			 */
			const extractedColors = await extractColors(token.iconURL)
			const colors = extractedColors.sort((a, b) => b.area - a.area)
			selectedColor = colors[0]?.hex
		} catch {
			selectedColor = undefined
		}
	}

	if (selectedColor !== undefined) {
		const themeBg: string = theme === "dark" ? "#1F1F21" : "#FFFFFF"

		// get best color in the theme
		// best color means to has Contrast Ratio at least 3:1
		// ref: WCAG 2 (https://www.w3.org/TR/WCAG20)
		const contrastRatio = getContrast(selectedColor, themeBg)
		if (contrastRatio >= 3) {
			return { rawColor: selectedColor, themeColor: selectedColor }
		}

		// if cannot find the best color from the image
		// returns darken or lighten color0
		// loop until the darken is valid
		const GAP_SIZE = 0.1
		for (let gap = GAP_SIZE; gap < 1; gap = gap + GAP_SIZE) {
			const newColor: string = theme === "dark" ? lighten(gap, selectedColor) : darken(gap, selectedColor)
			const contrastRatio = getContrast(newColor, themeBg)
			if (contrastRatio >= 3) {
				return { rawColor: selectedColor, themeColor: newColor }
			}
		}
	}

	// return default color
	return theme === "dark"
		? { rawColor: "#FFFFFF", themeColor: "#FFFFFF" }
		: { rawColor: "#000000", themeColor: "#000000" }
}

export const useTokenColor = (
	token: EvmToken | undefined,
	theme: Theme = "light",
): { rawColor: string; themeColor: string } => {
	const [rawColor, setRawColor] = useState<string>("#888888")
	const [themeColor, setThemeColor] = useState<string>("#888888")

	const getColors = useCallback(async () => {
		if (!token) {
			return
		}
		const { rawColor: rawCl, themeColor: themeCl } = await getTokenColor(token, theme)
		setRawColor(rawCl ?? "#888888")
		setThemeColor(themeCl ?? "#888888")
	}, [theme, token])

	useEffect(() => {
		void getColors()
	}, [getColors])

	return {
		rawColor: rawColor,
		themeColor: themeColor,
	}
}
