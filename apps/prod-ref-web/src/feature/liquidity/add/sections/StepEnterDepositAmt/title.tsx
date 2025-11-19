export const Title: React.FC = () => {
	return (
		<div className="flex items-center gap-3">
			<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-center font-medium text-rabbit-black">
				2
			</div>
			<div className="flex flex-col gap-1">
				<div className="text-base font-normal text-primary-300 dark:text-primary-50">Deposit Tokens</div>
				<div className="text-xs text-gray-400 dark:text-gray-600">
					Specify the token amounts for your liquidity contribution.
				</div>
			</div>
		</div>
	)
}
