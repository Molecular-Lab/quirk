import { useEffect, useState } from "react"

const getWindowDimensions = () => {
	const { innerWidth: width, innerHeight: height } = window
	return {
		width,
		height,
	}
}

export const useWindowDimensions = () => {
	const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions())
	useEffect(() => {
		let tl: NodeJS.Timeout
		function handleResize() {
			clearTimeout(tl)
			tl = setTimeout(() => {
				setWindowDimensions(getWindowDimensions())
			}, 120)
		}

		window.addEventListener("resize", handleResize)
		return () => {
			window.removeEventListener("resize", handleResize)
		}
	}, [])

	return windowDimensions
}

export const useResponsive = () => {
	const { width } = useWindowDimensions()

	return {
		isMd: width >= 768,
		isLg: width >= 1024,
		isXl: width >= 1280,
	}
}

export const useNavbarHeight = () => {
	const { isMd } = useResponsive()

	return isMd ? 65 : 49
}
