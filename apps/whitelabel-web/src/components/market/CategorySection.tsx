/**
 * CategorySection - Collapsible container for protocol categories
 */

import { useState } from "react"

interface CategorySectionProps {
	id: string
	title: string
	description: string
	defaultExpanded?: boolean
	children: React.ReactNode
}

export function CategorySection({ title, description, defaultExpanded = true, children }: CategorySectionProps) {
	const [isExpanded, setIsExpanded] = useState(defaultExpanded)

	return (
		<div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
			{/* Header - Clickable to expand/collapse */}
			<button
				onClick={() => {
					setIsExpanded(!isExpanded)
				}}
				className="w-full p-6 border-b border-gray-200 flex justify-between items-center hover:bg-gray-50 transition-colors text-left"
			>
				<div>
					<div className="flex items-center gap-2">
						<h2 className="text-xl font-bold text-gray-900">{title}</h2>
						{/* Arrow indicator */}
						<span className={`text-gray-500 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}>
							▶
						</span>
					</div>
					<p className="text-sm text-gray-600 mt-1">{description}</p>
				</div>
			</button>

			{/* Content - Collapsible */}
			{isExpanded && <div className="p-6">{children}</div>}
		</div>
	)
}
