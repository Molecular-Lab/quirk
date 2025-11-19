/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */

export const popupCenter = ({
	url,
	title,
	w,
	h,
}: {
	url: string
	title: string
	w: number
	h: number
}): Promise<Window> => {
	// Fixes dual-screen position                             Most browsers      Firefox
	const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX
	const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY

	const width = window.innerWidth
		? window.innerWidth
		: document.documentElement.clientWidth
			? document.documentElement.clientWidth
			: screen.width
	const height = window.innerHeight
		? window.innerHeight
		: document.documentElement.clientHeight
			? document.documentElement.clientHeight
			: screen.height

	const systemZoom = width / window.screen.availWidth
	const left = (width - w) / 2 / systemZoom + dualScreenLeft
	const top = (height - h) / 2 / systemZoom + dualScreenTop
	let newWindow: Window

	return new Promise((resolve, reject) => {
		try {
			setTimeout(() => {
				newWindow = window.open(
					url,
					title,
					`
            scrollbars=yes,
            width=${w / systemZoom}, 
            height=${h / systemZoom}, 
            top=${top}, 
            left=${left}
            `,
				)!
				resolve(newWindow)
			}, 0)
		} catch (error) {
			if (error instanceof Error) reject(error)
		}
	})
}
