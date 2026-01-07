import { useResponsive } from "@/hooks/useResponsive"

import { HowItWorksMobile } from "./HowItWorksMobile"
import { HowItWorksWeb } from "./HowItWorksWeb"

export function HowItWorksSection() {
	const { isMd } = useResponsive()
	return isMd ? <HowItWorksWeb /> : <HowItWorksMobile />
}
