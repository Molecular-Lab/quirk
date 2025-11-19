import { PropsWithChildren } from "react"

interface RabbitTextBoxProps extends PropsWithChildren {
	rabbitSrc?: string
}

export const RabbitTextBox: React.FC<RabbitTextBoxProps> = ({ rabbitSrc = "/images/rabbit-500.svg", children }) => {
	return (
		<div className="relative">
			<img
				src={rabbitSrc}
				alt={rabbitSrc}
				className="absolute left-1/2 top-0 translate-x-[-48%] translate-y-[calc(-100%+20px)]"
			/>
			<div className="relative z-10 mb-6 rounded-2xl bg-gray-50 px-10 py-8 dark:bg-gray-900">{children}</div>
			<img src="/images/rabbit-hand.svg" className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2" />
		</div>
	)
}
