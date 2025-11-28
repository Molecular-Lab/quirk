import { Users, Building2 } from 'lucide-react'

export function RegulatorySection() {
	return (
		<section className="py-24 px-6 bg-gray-50">
			<div className="max-w-7xl mx-auto">
				<div className="text-center mb-16">
					<h2 className="text-5xl font-bold text-gray-900 mb-4">
						Regulatory Ready
					</h2>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						Proxify meets you where you are—with options for full compliance coverage or direct control. FATF, MICA, SEC-aligned.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{/* Proxify Faces the Client */}
					<div className="bg-gradient-to-br from-navy-950 to-blue-950 rounded-2xl p-10 text-white relative overflow-hidden">
						<div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
						<div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

						<div className="relative z-10">
							<div className="bg-white/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
								<Users className="w-8 h-8 text-white" />
							</div>
							<h3 className="text-2xl font-bold mb-4">
								Proxify Faces<br />the Client
							</h3>
							<ul className="space-y-3 text-gray-200">
								<li>• Fintech startups without licenses</li>
								<li>• MVPs or pilots launching fast</li>
								<li>• Platforms avoiding risk exposure</li>
								<li>• Offload KYC/KYB duties</li>
							</ul>
						</div>
					</div>

					{/* Partner Faces the Client */}
					<div className="bg-gradient-to-br from-navy-950 to-blue-950 rounded-2xl p-10 text-white relative overflow-hidden">
						<div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
						<div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />

						<div className="relative z-10">
							<div className="bg-white/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
								<Building2 className="w-8 h-8 text-white" />
							</div>
							<h3 className="text-2xl font-bold mb-4">
								Partner Faces<br />the Client
							</h3>
							<ul className="space-y-3 text-gray-200">
								<li>• Regulated wallets, exchanges</li>
								<li>• Enterprises with legal teams</li>
								<li>• Brands that want full control</li>
								<li>• Already have KYB flows and disclosures</li>
							</ul>
						</div>
					</div>
				</div>

				<div className="mt-12 text-center">
					<p className="text-gray-600 mb-6">
						<strong>Regulatory Structure</strong>
						<br />
						Built with legal frameworks and KYB processes across multiple jurisdictions.
					</p>
					<p className="text-gray-600">
						<strong>Client-Facing Terms</strong>
						<br />
						Proxify can face your users with built-in TOS & compliance stack.
					</p>
				</div>
			</div>
		</section>
	)
}
