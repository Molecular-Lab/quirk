import { useCallback, useEffect, useRef } from "react"

import { ScaleLinear, ZoomBehavior, ZoomTransform, select, zoom } from "d3"

import { ZoomLevels } from "@/components/LiquidityChartRangeInput/types"

interface UseZoomProps {
	svg: SVGElement | null
	xScale: ScaleLinear<number, number>
	setZoom: (transform: ZoomTransform) => void
	width: number
	height: number
	zoomLevels: ZoomLevels
}

export interface UseZoomReturn {
	zoomBy: (multiplier: number) => void
	zoomTo: (multiplier: number) => void
}

export const DEFAULT_ZOOM_LEVEL = 0.5

export const useZoom = ({ svg, xScale, setZoom, width, height, zoomLevels }: UseZoomProps) => {
	const zoomBehavior = useRef<ZoomBehavior<Element, unknown>>()

	const zoomTo = useCallback(
		(multiplier: number) => {
			if (!svg || !zoomBehavior.current) return
			select(svg as Element)
				.transition()
				.call((selection) => zoomBehavior.current?.scaleTo(selection, multiplier))
		},
		[svg],
	)

	const zoomBy = useCallback(
		(multiplier: number) => {
			if (!svg || !zoomBehavior.current) return

			select(svg as Element)
				.transition()
				.call((selection) => zoomBehavior.current?.scaleBy(selection, multiplier))
		},
		[svg],
	)

	useEffect(() => {
		if (!svg) return

		zoomBehavior.current = zoom()
			.scaleExtent([zoomLevels.min, zoomLevels.max])
			.extent([
				[0, 0],
				[width, height],
			])
			.on("zoom", ({ transform }: { transform: ZoomTransform }) => {
				setZoom(transform)
			})

		select(svg as Element).call(zoomBehavior.current)
	}, [height, width, svg, xScale, zoomBehavior, zoomLevels, zoomLevels.max, zoomLevels.min, setZoom])

	// Initialize the zoom to 0.5
	const initialized = useRef(false)
	useEffect(() => {
		if (!svg || !zoomBehavior.current || initialized.current) return
		zoomTo(DEFAULT_ZOOM_LEVEL)
		initialized.current = true
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [svg, zoomTo, zoomBehavior.current])

	return {
		zoomBy,
		zoomTo,
	}
}
