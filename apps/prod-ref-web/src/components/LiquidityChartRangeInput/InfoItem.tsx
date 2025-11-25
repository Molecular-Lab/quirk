import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

export const InfoItem: React.FC<
	PropsWithClassName<{
		label: string
		value: React.ReactNode
	}>
> = ({ label, value, className }) => {
	return (
		<div className={cn("flex flex-col justify-start gap-2 text-base lg:text-[18px]", className)}>
			<div className="text-xs text-gray-600 dark:text-gray-500">{label}:</div>
			<div className="text-sm text-rabbit-black dark:text-rabbit-white ">{value}</div>
		</div>
	)
}
