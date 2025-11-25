import { ArkenLogo } from "@/components/Logo"

export const PowerByBanner: React.FC = () => {
	return (
		<div className="flex flex-col items-center gap-1">
			<div className="text-base font-medium text-gray-300 lg:text-[18px]/6">Powered by</div>
			<div className="flex items-center gap-3">
				<ArkenLogo className="h-9 w-fit text-gray-300" />
				<img src="/logo/layer-zero-logo.png" className="h-7" />
			</div>
		</div>
	)
}
