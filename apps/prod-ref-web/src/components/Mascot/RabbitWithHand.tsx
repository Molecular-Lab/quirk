import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

export const RabbitWithHand: React.FC<PropsWithClassName<{ rabbitSrc?: string }>> = ({
	rabbitSrc = "/images/rabbit-500.svg",
	className,
}) => {
	return (
		<div className={cn("relative", className)}>
			<img src={rabbitSrc} className="absolute left-1/2 top-0 translate-x-[-48%] translate-y-[calc(-100%+20px)]" />
			<img src="/images/rabbit-hand.svg" className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2" />
		</div>
	)
}
