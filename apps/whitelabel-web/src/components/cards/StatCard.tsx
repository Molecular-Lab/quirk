import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

interface StatCardProps {
	title: string
	value: string | number
	change?: number
	icon?: LucideIcon
	trend?: 'up' | 'down' | 'neutral'
	className?: string
}

export function StatCard({
	title,
	value,
	change,
	icon: Icon,
	trend = 'neutral',
	className,
}: StatCardProps) {
	const trendColors = {
		up: 'text-green-600',
		down: 'text-red-600',
		neutral: 'text-gray-600',
	}

	const trendBg = {
		up: 'bg-green-50',
		down: 'bg-red-50',
		neutral: 'bg-gray-50',
	}

	return (
		<div
			className={cn(
				'rounded-lg border border-gray-200 bg-white p-6 shadow-sm',
				className
			)}
		>
			<div className="flex items-start justify-between">
				<div>
					<p className="text-sm font-medium text-gray-600">{title}</p>
					<p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
					{change !== undefined && (
						<div className="mt-2 flex items-center gap-1">
							<span className={cn('text-sm font-medium', trendColors[trend])}>
								{change > 0 ? '+' : ''}
								{change}%
							</span>
							<span className="text-sm text-gray-500">vs last period</span>
						</div>
					)}
				</div>
				{Icon && (
					<div
						className={cn('rounded-lg p-3', trendBg[trend])}
					>
						<Icon className={cn('h-6 w-6', trendColors[trend])} />
					</div>
				)}
			</div>
		</div>
	)
}
