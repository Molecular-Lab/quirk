import { Button } from "@rabbitswap/ui/basic"
import { X } from "@rabbitswap/ui/icons"
import { cn } from "@rabbitswap/ui/utils"

import { RabbitDefaultHead, RabbitHand } from "@/components/RabbitMascot"
import { usePhisingWarning } from "@/feature/security/phising-warning/context"

export const PhisingWarningBox: React.FC = () => {
	const { hideBanner, setHideBanner } = usePhisingWarning()

	return (
		<div
			className={cn(
				["fixed", "bottom-0 left-0", "lg:bottom-6 lg:left-auto lg:right-6 lg:top-auto"],
				"bg-primary-10 dark:bg-primary-25 dark:text-gray-800",
				"w-full lg:h-fit lg:max-h-[158px] lg:w-[270px] lg:rounded-xl",
				"overflow-visible",
				"shadow-lg",
				"flex flex-col",
				hideBanner && "hidden",
			)}
		>
			{/* rabbit mascot */}
			<div className="absolute left-2">
				<RabbitDefaultHead className="absolute left-1 top-[-72px] w-[68px] text-primary-10 dark:text-primary-25" />
				<RabbitHand className="absolute -top-6 left-1.5 w-[60px] text-primary-10 dark:text-primary-25" />
			</div>

			{/* cloud bg */}
			<img
				src="/images/cloud-bottom-right.png"
				className="absolute bottom-0 right-0 hidden lg:block lg:rounded-br-xl"
			/>

			{/* content */}
			<div className={cn("z-10 p-3 pr-8 lg:p-4 lg:pr-3", "text-sm/[18px] lg:flex lg:flex-col lg:gap-y-1.5")}>
				<span className="font-semibold text-primary-900 dark:text-primary-800 lg:text-base">Phishing Warning</span>
				<span className="font-semibold text-primary-900 dark:text-primary-800 lg:hidden lg:text-base">: </span>
				<span>
					Please ensure you&apos;re on{" "}
					<span className="text-primary-900 dark:text-primary-800">https://rabbitswap.xyz</span>.{" "}
					<br className="hidden lg:inline" /> Always check the URL to stay safe!
				</span>
				<Button
					className="hidden w-fit px-8 lg:flex"
					buttonColor="secondary"
					onClick={() => {
						setHideBanner(true)
					}}
				>
					Got it
				</Button>
			</div>

			{/* close button */}
			<div className="absolute right-2.5 top-2.5 z-20 lg:right-4 lg:top-4">
				<Button
					buttonType="text"
					buttonColor="gray"
					className="p-0"
					onClick={() => {
						setHideBanner(true)
					}}
				>
					<X className="size-4 lg:size-5" />
				</Button>
			</div>
		</div>
	)
}
