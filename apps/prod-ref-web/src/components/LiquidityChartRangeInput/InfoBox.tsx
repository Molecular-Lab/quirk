export const InfoBox: React.FC<{
	message?: React.ReactNode
	icon: React.ReactNode
}> = ({ message, icon }) => {
	return (
		<div className="flex w-full flex-col items-center justify-center">
			{icon}
			{message && <div className="mt-5 p-2.5 text-center text-xs text-gray-400 lg:text-sm">{message}</div>}
		</div>
	)
}
