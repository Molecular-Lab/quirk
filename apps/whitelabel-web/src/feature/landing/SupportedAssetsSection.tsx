import usdcLogo from "@/assets/usd-coin-usdc-logo.png"
import usdtLogo from "@/assets/tether-usdt-logo.png"

export function SupportedAssetsSection() {
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
		<section className="py-20 bg-white">
			<div className="max-w-7xl mx-auto px-6">
				<div className="text-center mb-12">
					<h3 className="text-4xl font-bold text-gray-950 mb-2">Supported Assets</h3>
				</div>

				{/* Draggable Protocol Carousel */}
				<div className="flex gap-6 justify-center pb-4">
					{protocols.map((protocol, idx) => (
						<div
							key={idx}
							className="flex-shrink-0 w-[200px] bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all flex items-center justify-center"
						>
							<div className="flex flex-col items-center justify-center gap-3 w-full">
								<div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-200 shadow-sm">
									{protocol.logo ? (
										<img src={protocol.logo} alt={protocol.name} className="w-12 h-12" />
									) : protocol.icon === "+" ? (
										<span className="text-3xl font-bold text-gray-500">{protocol.icon}</span>
									) : (
										<span className="text-3xl">{protocol.icon}</span>
									)}
								</div>
								<div className="text-center">
									<span className="block text-lg font-bold text-gray-950">{protocol.name}</span>
									{protocol.description && (
										<span className="text-xs text-gray-600 mt-1 block">{protocol.description}</span>
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
