import usdcLogo from "@/assets/usd-coin-usdc-logo.png"
import usdtLogo from "@/assets/tether-usdt-logo.png"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"

export function SupportedAssetsSection() {
	const { ref, isVisible } = useScrollAnimation({ threshold: 0.15 })
	const protocols = [
		{
			name: "USDC",
			logo: usdcLogo,
		},
		{
			name: "USDT",
			logo: usdtLogo,
		},
		{
			name: "More",
			icon: "+",
			description: "More stablecoins coming soon",
		},
	]

	return (
		<section className="pt-20 pb-32 bg-white">
			<div
				ref={ref as React.RefObject<HTMLDivElement>}
				className={`max-w-7xl mx-auto px-6 transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
					}`}
			>
				<div className="text-center mb-12">
					<h3 className="text-5xl font-bold text-gray-950 mb-4">Supported Assets</h3>
				</div>

				{/* Draggable Protocol Carousel */}
				<div className="flex gap-6 justify-center pb-4">
					{protocols.map((protocol, idx) => (
						<div
							key={idx}
							className="flex-shrink-0 w-[240px] bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg hover:border-blue-300 transition-all flex items-center justify-center"
						>
							<div className="flex flex-col items-center justify-center gap-4 w-full">
								<div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-200 shadow-sm">
									{protocol.logo ? (
										<img src={protocol.logo} alt={protocol.name} className="w-14 h-14" />
									) : protocol.icon === "+" ? (
										<span className="text-4xl font-bold text-gray-500">{protocol.icon}</span>
									) : (
										<span className="text-4xl">{protocol.icon}</span>
									)}
								</div>
								<div className="text-center">
									<span className="block text-xl font-bold text-gray-950">{protocol.name}</span>
									{protocol.description && (
										<span className="text-sm text-gray-600 mt-1 block">{protocol.description}</span>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
