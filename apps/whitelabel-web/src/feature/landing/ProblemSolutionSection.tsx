export function ProblemSolutionSection() {
	return (
		<section className="min-h-[90vh] py-20 bg-white flex items-center">
			<div className="max-w-7xl mx-auto px-6 w-full">
				<div className="grid lg:grid-cols-2 gap-16 items-start">
					{/* Problem Side */}
					<div>
						<div className="mb-8">
							<span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full mb-4">
								The Problem
							</span>
							<h2 className="text-4xl font-bold text-gray-950 mb-4">Building Yield Infrastructure is Complex</h2>
						</div>

						<div className="space-y-6">
							{/* Problem 1 */}
							<div className="border-l-2 border-gray-200 pl-6">
								<h3 className="text-lg font-semibold text-gray-950 mb-2">Infrastructure Complexity</h3>
								<p className="text-gray-700">
									Even if businesses understand StableCoin advantages, implementation requires deep expertise across
									different financial layers—custody, compliance, treasury management.
								</p>
							</div>

							{/* Problem 2 */}
							<div className="border-l-2 border-gray-200 pl-6">
								<h3 className="text-lg font-semibold text-gray-950 mb-2">Regulatory Compliance</h3>
								<p className="text-gray-700">
									Expanding into StableCoin infrastructure means navigating complex regulations. In Singapore alone:{" "}
									<strong className="text-gray-950">MPIL + CMS licenses</strong> (~$550K-650K).
								</p>
							</div>

							{/* Problem 3 */}
							<div className="border-l-2 border-gray-200 pl-6">
								<h3 className="text-lg font-semibold text-gray-950 mb-2">Enterprise-Grade Requirements</h3>
								<p className="text-gray-700">
									Building in-house requires resources for custody infrastructure, regulatory compliance, and
									institutional-grade treasury management.
								</p>
							</div>
						</div>
					</div>

					{/* Solution Side */}
					<div>
						<div className="mb-8">
							<span className="inline-block px-3 py-1 bg-accent/10 text-accent text-sm font-medium rounded-full mb-4">
								The Solution
							</span>
							<h2 className="text-4xl font-bold text-gray-950 mb-4">Quirk Handles Everything</h2>
						</div>

						<div className="bg-white/90 backdrop-blur-md border border-gray-150 rounded-xl p-8 mb-6">
							<div className="flex items-start gap-4 mb-6">
								<div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
									<span className="text-xl">🏢</span>
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-950 mb-2">B2B: Earn-as-a-Service</h3>
									<p className="text-gray-700">
										White-label infrastructure allowing any business to offer Earn-in-App, access DeFi yield, and
										treasury management—
										<strong className="text-gray-950">without building infrastructure or handling compliance</strong>.
									</p>
								</div>
							</div>

							<div className="flex items-start gap-4">
								<div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
									<span className="text-xl">👥</span>
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-950 mb-2">B2B2C: Earn Anywhere</h3>
									<p className="text-gray-700">
										Enable users to have a savings account earning yield{" "}
										<strong className="text-gray-950">anywhere</strong>. Eliminate the barrier that earning must stay in
										banking or investment apps.
									</p>
								</div>
							</div>
						</div>

						{/* Key Benefits */}
						<div className="grid grid-cols-2 gap-4">
							<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
								<div className="text-2xl mb-2">⚡</div>
								<div className="text-sm font-medium text-gray-950">Instant Integration</div>
								<div className="text-xs text-gray-600 mt-1">SDK-first approach</div>
							</div>
							<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
								<div className="text-2xl mb-2">🔒</div>
								<div className="text-sm font-medium text-gray-950">Compliant by Default</div>
								<div className="text-xs text-gray-600 mt-1">We handle licensing</div>
							</div>
							<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
								<div className="text-2xl mb-2">🤖</div>
								<div className="text-sm font-medium text-gray-950">AI-Powered Strategies</div>
								<div className="text-xs text-gray-600 mt-1">Optimized yield allocation</div>
							</div>
							<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
								<div className="text-2xl mb-2">🏛️</div>
								<div className="text-sm font-medium text-gray-950">Institutional Grade</div>
								<div className="text-xs text-gray-600 mt-1">Privy MPC custody</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
