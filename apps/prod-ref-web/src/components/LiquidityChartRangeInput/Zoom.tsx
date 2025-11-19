import { RefreshCcw, ZoomIn, ZoomOut } from "lucide-react"

import { Button } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { DEFAULT_ZOOM_LEVEL, UseZoomReturn } from "@/components/LiquidityChartRangeInput/hooks/useZoom"

export const Zoom: React.FC<{
	resetBrush: () => void
	showResetButton: boolean
	zoomFn: UseZoomReturn
}> = ({ resetBrush, showResetButton, zoomFn }) => {
	return (
		<div
			className={cn(
				"absolute right-1 top-1 grid gap-1.5",
				`grid-cols-[repeat(${(showResetButton ? 3 : 2).toString()}, 1fr)]`,
			)}
		>
			{showResetButton && (
				<Button
					buttonColor="gray"
					className="size-8 p-0"
					onClick={() => {
						resetBrush()
						zoomFn.zoomTo(DEFAULT_ZOOM_LEVEL)
					}}
				>
					<RefreshCcw className="size-4" />
				</Button>
			)}
			<Button
				buttonColor="gray"
				className="size-8 p-0"
				onClick={() => {
					zoomFn.zoomBy(2)
				}}
			>
				<ZoomIn className="size-4" />
			</Button>
			<Button
				buttonColor="gray"
				className="size-8 p-0"
				onClick={() => {
					zoomFn.zoomBy(0.5)
				}}
			>
				<ZoomOut className="size-4" />
			</Button>
		</div>
	)
}
