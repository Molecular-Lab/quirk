import { Theme } from "@rabbitswap/ui/providers"

export const resolveColor = <T1 extends string = string, T2 extends string = string>(
	theme: Theme,
	light: T1,
	dark: T2,
): T1 | T2 => (theme === "dark" ? dark : light)
