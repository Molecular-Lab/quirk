/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { useCallback, useEffect, useRef, useState } from "react"

import { BrushBehavior, D3BrushEvent, ScaleLinear, brushX, select } from "d3"

import { usePrevious } from "@/utils/usePrevious"

import { BRUSH_EXTENT_MARGIN_PX, FLIP_HANDLE_THRESHOLD_PX } from "./constants"
import { Handle, HandleAccent } from "./Handle"
import { OffScreenHandle, brushHandleAccentPath, brushHandlePath } from "./svg"
import { brushAreaEqual } from "./util"

export const Brush: React.FC<{
	id: string
	xScale: ScaleLinear<number, number>
	brushLabelValue: (d: "w" | "e", x: number) => string
	brushExtent: [number, number]
	setBrushExtent: (extent: [number, number], mode: D3BrushEvent<unknown>["mode"]) => void
	innerWidth: number
	innerHeight: number
	colors: {
		area: {
			selection: string
		}
		label: {
			background: string
		}
		handle: { west: string; east: string; bar: string }
		arrow: { west: string; east: string }
	}
}> = ({ id, xScale, brushLabelValue, brushExtent, setBrushExtent, innerWidth, innerHeight, colors }) => {
	const brushRef = useRef<SVGGElement | null>(null)
	const brushBehavior = useRef<BrushBehavior<SVGGElement> | null>(null)

	// only used to drag the handles on brush for performance
	const [localBrushExtent, setLocalBrushExtent] = useState<[number, number] | null>(brushExtent)
	const [showLabels, setShowLabels] = useState(false)
	const [hovering, setHovering] = useState(false)

	const previousBrushExtent = usePrevious(brushExtent)

	const brushed = useCallback(
		(event: D3BrushEvent<unknown>) => {
			const { type, selection, mode } = event

			if (!selection) {
				setLocalBrushExtent(null)
				return
			}

			const scaled = (selection as [number, number]).map((v) => xScale.invert(v)) as [number, number]

			// avoid infinite render loop by checking for change
			if (type === "end" && !brushAreaEqual(brushExtent, scaled, xScale)) {
				setBrushExtent(scaled, mode)
			}

			setLocalBrushExtent(scaled)
		},
		[xScale, brushExtent, setBrushExtent],
	)

	// keep local and external brush extent in sync
	// i.e. snap to ticks on brush end
	useEffect(() => {
		setLocalBrushExtent(brushExtent)
	}, [brushExtent])

	// initialize the brush
	useEffect(() => {
		if (!brushRef.current) return

		brushBehavior.current = brushX<SVGGElement>()
			.extent([
				[Math.max(0 + BRUSH_EXTENT_MARGIN_PX, xScale(0)), 0],
				[innerWidth - BRUSH_EXTENT_MARGIN_PX, innerHeight],
			])
			.handleSize(30)
			.on("brush end", brushed)

		brushBehavior.current(select(brushRef.current))

		if (previousBrushExtent && brushAreaEqual(brushExtent, previousBrushExtent, xScale)) {
			select(brushRef.current)
				.transition()
				.call(
					brushBehavior.current.move as any,
					brushExtent.map((v) => xScale(v)),
				)
		}

		// brush linear gradient
		select(brushRef.current)
			.selectAll(".selection")
			.attr("stroke", "none")
			.attr("fill-opacity", "0.6")
			.attr("fill", `url(#${id}-gradient-selection)`)
	}, [brushExtent, brushed, id, innerHeight, innerWidth, previousBrushExtent, xScale])

	// respond to xScale changes only
	useEffect(() => {
		if (!brushRef.current || !brushBehavior.current) return

		brushBehavior.current.move(select(brushRef.current) as any, brushExtent.map((v) => xScale(v)) as any)
	}, [brushExtent, xScale])

	// show labels when local brush changes
	useEffect(() => {
		setShowLabels(true)
		const timeout = setTimeout(() => {
			setShowLabels(false)
		}, 1500)
		return () => {
			clearTimeout(timeout)
		}
	}, [localBrushExtent])

	// variables to help render the SVGs
	const flipWestHandle = localBrushExtent && xScale(localBrushExtent[0]) > FLIP_HANDLE_THRESHOLD_PX
	const flipEastHandle = localBrushExtent && xScale(localBrushExtent[1]) > innerWidth - FLIP_HANDLE_THRESHOLD_PX

	const showWestArrow = localBrushExtent && (xScale(localBrushExtent[0]) < 0 || xScale(localBrushExtent[1]) < 0)
	const showEastArrow =
		localBrushExtent && (xScale(localBrushExtent[0]) > innerWidth || xScale(localBrushExtent[1]) > innerWidth)

	const westHandleInView =
		localBrushExtent && xScale(localBrushExtent[0]) >= 0 && xScale(localBrushExtent[0]) <= innerWidth
	const eastHandleInView =
		localBrushExtent && xScale(localBrushExtent[1]) >= 0 && xScale(localBrushExtent[1]) <= innerWidth

	return (
		<>
			<defs>
				<linearGradient id={`${id}-gradient-selection`} x1="0%" y1="100%" x2="100%" y2="100%">
					<stop stopColor={colors.area.selection} />
					<stop stopColor={colors.area.selection} offset="1" />
				</linearGradient>

				{/* clips at exactly the svg area */}
				<clipPath id={`${id}-brush-clip`}>
					<rect x="0" y="0" width={innerWidth} height={innerHeight} />
				</clipPath>
			</defs>

			{/* will host the d3 brush */}
			<g
				ref={brushRef}
				clipPath={`url(#${id}-brush-clip)`}
				onMouseEnter={() => {
					setHovering(true)
				}}
				onMouseLeave={() => {
					setHovering(false)
				}}
			/>

			{/* custom brush handles */}
			{localBrushExtent && (
				<>
					{/* west handle */}
					{westHandleInView ? (
						<g
							transform={`translate(${Math.max(0, xScale(localBrushExtent[0]))}, 0), scale(${
								flipWestHandle ? "-1" : "1"
							}, 1)`}
						>
							<g>
								<Handle color={colors.handle.west} d={brushHandlePath(innerHeight)} />
								<HandleAccent d={brushHandleAccentPath()} stroke={colors.handle.bar} />
							</g>

							<g
								opacity={showLabels || hovering ? "1" : "0"}
								transform={`translate(50,0), scale(${flipWestHandle ? "1" : "-1"}, 1)`}
							>
								{/* label */}
								<rect y="0" x="-30" height="30" width="60" rx="8" fill={colors.label.background} />
								<text transform="scale(-1, 1)" y="15" dominantBaseline="middle" textAnchor="middle" fontSize="12px">
									{brushLabelValue("w", localBrushExtent[0])}
								</text>
							</g>
						</g>
					) : null}

					{/* east handle */}
					{eastHandleInView ? (
						<g transform={`translate(${xScale(localBrushExtent[1])}, 0), scale(${flipEastHandle ? "-1" : "1"}, 1)`}>
							<g>
								<Handle color={colors.handle.east} d={brushHandlePath(innerHeight)} />
								<HandleAccent d={brushHandleAccentPath()} stroke={colors.handle.bar} />
							</g>

							<g
								opacity={showLabels || hovering ? "1" : "0"}
								transform={`translate(50,0), scale(${flipEastHandle ? "-1" : "1"}, 1)`}
							>
								{/* label */}
								<rect y="0" x="-30" height="30" width="60" rx="8" fill={colors.label.background} />
								<text y="15" dominantBaseline="middle" textAnchor="middle" fontSize="12px">
									{brushLabelValue("e", localBrushExtent[1])}
								</text>
							</g>
						</g>
					) : null}

					{/* arrow */}
					{showWestArrow && (
						<>
							<OffScreenHandle color={colors.arrow.west} />
						</>
					)}
					{showEastArrow && (
						<g transform={`translate(${innerWidth}, 0) scale(-1, 1)`}>
							<OffScreenHandle color={colors.arrow.east} />
						</g>
					)}
				</>
			)}
		</>
	)
}
