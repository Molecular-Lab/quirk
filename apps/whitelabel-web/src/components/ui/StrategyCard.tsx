interface StrategyCardProps {
	title: string
	description: string
	targetAudience: string
	features: string[]
	platforms: string
	collateral: string
	lockup?: string
	className?: string
}

export function StrategyCard({
	title,
	description,
	targetAudience,
	features,
	platforms,
	collateral,
	lockup,
	className = '',
}: StrategyCardProps) {
	return (
		<div className={`bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:border-gray-200 transition-colors ${className}`}>
			{/* Title */}
			<h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>

			{/* Description */}
			<p className="text-gray-700 leading-relaxed mb-6">{description}</p>

			{/* Target Audience */}
			<div className="mb-6">
				<h4 className="text-sm font-semibold text-gray-900 mb-2">Target Audience</h4>
				<p className="text-gray-600 text-sm leading-relaxed">{targetAudience}</p>
			</div>

			{/* Features */}
			<div className="mb-6">
				<h4 className="text-sm font-semibold text-gray-900 mb-3">Strategy Features</h4>
				<ul className="space-y-2">
					{features.map((feature, idx) => (
						<li key={idx} className="text-gray-600 text-sm leading-relaxed flex items-start">
							<span className="text-gray-400 mr-2">•</span>
							<span>{feature}</span>
						</li>
					))}
				</ul>
			</div>

			{/* Footer Info */}
			<div className="pt-6 border-t border-gray-200 space-y-2">
				<div className="flex items-center justify-between text-sm">
					<span className="text-gray-500">Platforms</span>
					<span className="text-gray-900 font-medium">{platforms}</span>
				</div>
				<div className="flex items-center justify-between text-sm">
					<span className="text-gray-500">Collateral</span>
					<span className="text-gray-900 font-medium">{collateral}</span>
				</div>
				{lockup && (
					<div className="flex items-center justify-between text-sm">
						<span className="text-gray-500">Lock-up</span>
						<span className="text-gray-900 font-medium">{lockup}</span>
					</div>
				)}
			</div>
		</div>
	)
}
