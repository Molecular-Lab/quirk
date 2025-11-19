import { ShapeSkeleton } from "@rabbitswap/ui/basic"
import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

export const LoadingBars: React.FC<PropsWithClassName> = ({ className }) => {
	return (
		<div className={cn("flex size-full items-end justify-center gap-3", className)}>
			{[10, 20, 45, 70, 80, 55, 30, 15].map((h) => {
				return (
					<ShapeSkeleton
						key={h}
						className="w-full"
						style={{
							height: `${h}%`,
							minHeight: `${h * 2}px`,
						}}
					/>
				)
			})}
		</div>
	)
}
