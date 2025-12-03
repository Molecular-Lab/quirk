import type { ReactNode } from "react"

interface FeatureCardProps {
	icon?: ReactNode
	title: string
	description: string
	className?: string
}

export function FeatureCard({ icon, title, description, className = "" }: FeatureCardProps) {
	return (
		<div className={`bg-gray-50 rounded-3xl p-8 border border-gray-100 ${className}`}>
			{icon && (
				<div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 border border-gray-100">
					{icon}
				</div>
			)}
			<h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
			<p className="text-gray-600 leading-relaxed">{description}</p>
		</div>
	)
}
