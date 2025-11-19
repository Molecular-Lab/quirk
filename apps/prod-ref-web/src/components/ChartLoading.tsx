import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

export const AreaChartLoading: React.FC<PropsWithClassName> = ({ className }) => {
	return (
		<div className={cn("size-full animate-pulse text-gray-100 dark:text-gray-700", className)}>
			<svg className="size-full" viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg" fill="none">
				<path d="M0,25 Q25,0 50,25 T100,25 Q125,0 150,25 T200,25" stroke="currentColor" strokeWidth="2" fill="none" />
			</svg>
		</div>
	)
}

const barHeight: number[] = [88, 16, 50, 96, 90, 42, 43, 14, 88, 82, 62, 35, 15, 85, 50, 64, 84, 23, 12, 32]
export const BarChartLoading: React.FC<PropsWithClassName> = ({ className }) => {
	return (
		<div className={cn("flex size-full animate-pulse items-end gap-1 text-gray-100 dark:text-gray-700", className)}>
			{barHeight.map((height, idx) => (
				<div
					className="w-[10%] rounded bg-gray-100 dark:bg-gray-700"
					style={{
						height: `${height}%`,
					}}
					key={idx}
				/>
			))}
		</div>
	)
}
