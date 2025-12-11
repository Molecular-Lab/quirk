import { Zap, Shield, LayoutDashboard, Bot } from "lucide-react";

export function CustomizeEarnSection() {
	return (
		<section className="py-32 bg-white">
			<div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full">
				<div className="grid lg:grid-cols-2 gap-20 items-start">
					{/* Left Column: Text Content */}
					<div className="flex flex-col space-y-12 max-w-2xl">
						<h2 className="text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]">
							Customize Earn Solution At Scale
						</h2>
						<p className="text-xl text-gray-600 leading-relaxed max-w-xl">
							Build your own yield product with our institutional-grade infrastructure.
						</p>
					</div>

					{/* Right Column: Feature Cards Grid */}
					<div className="grid sm:grid-cols-2 gap-x-12 gap-y-16">
						<div className="group flex flex-col items-start space-y-6 border-l border-gray-200 pl-8">
							<div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-2">
								<Zap className="w-7 h-7 text-gray-900" strokeWidth={1.5} />
							</div>
							<div className="space-y-4">
								<h3 className="text-3xl font-normal text-gray-900">
									Fast Integration
								</h3>
								<p className="text-gray-500 text-lg leading-relaxed">
									Embed our SDK in minutes. Start offering yield without complex
									infrastructure.
								</p>
							</div>
						</div>

						<div className="group flex flex-col items-start space-y-6 border-l border-gray-200 pl-8">
							<div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-2">
								<Shield className="w-7 h-7 text-gray-900" strokeWidth={1.5} />
							</div>
							<div className="space-y-4">
								<h3 className="text-3xl font-normal text-gray-900">
									Secure Custody
								</h3>
								<p className="text-gray-500 text-lg leading-relaxed">
									Institutional-grade MPC custody powered by Privy. Funds are
									always protected.
								</p>
							</div>
						</div>

						<div className="group flex flex-col items-start space-y-6 border-l border-gray-200 pl-8">
							<div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-2">
								<LayoutDashboard
									className="w-7 h-7 text-gray-900"
									strokeWidth={1.5}
								/>
							</div>
							<div className="space-y-4">
								<h3 className="text-3xl font-normal text-gray-900">
									White-Label Dashboard
								</h3>
								<p className="text-gray-500 text-lg leading-relaxed">
									Fully branded analytics and portfolio tracking for your clients.
								</p>
							</div>
						</div>

						<div className="group flex flex-col items-start space-y-6 border-l border-gray-200 pl-8">
							<div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-2">
								<Bot className="w-7 h-7 text-gray-900" strokeWidth={1.5} />
							</div>
							<div className="space-y-4">
								<h3 className="text-3xl font-normal text-gray-900">
									Agent Analytics
								</h3>
								<p className="text-gray-500 text-lg leading-relaxed">
									AI-powered market insights and predictive modeling to optimize
									yield.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
