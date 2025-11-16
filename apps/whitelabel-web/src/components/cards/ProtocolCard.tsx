import { cn } from '@/utils/cn'
import type { ProtocolName } from '@/types'

interface ProtocolCardProps {
	protocol: ProtocolName
	name: string
	allocation: number
	amountDeployed: number
	currentValue: number
	apy: number
	riskLevel: 'low' | 'moderate' | 'high'
	isActive: boolean
	className?: string
}

const protocolColors: Record<ProtocolName, string> = {
	aave: 'bg-purple-100 text-purple-700 border-purple-200',
	compound: 'bg-green-100 text-green-700 border-green-200',
	curve: 'bg-blue-100 text-blue-700 border-blue-200',
	uniswap: 'bg-pink-100 text-pink-700 border-pink-200',
}

const riskColors = {
	low: 'bg-green-100 text-green-700',
	moderate: 'bg-yellow-100 text-yellow-700',
	high: 'bg-red-100 text-red-700',
}

export function ProtocolCard({
	protocol,
	name,
	allocation,
	amountDeployed,
	currentValue,
	apy,
	riskLevel,
	isActive,
	className,
}: ProtocolCardProps) {
	const profit = currentValue - amountDeployed
	const profitPercent = amountDeployed > 0 ? (profit / amountDeployed) * 100 : 0

	return (
		<div
			className={cn(
				'rounded-lg border bg-white p-6 shadow-sm',
				!isActive && 'opacity-60',
				className
			)}
		>
			<div className="flex items-start justify-between">
				<div>
					<div className="flex items-center gap-2">
						<span
							className={cn(
								'rounded px-2 py-1 text-xs font-medium uppercase border',
								protocolColors[protocol]
							)}
						>
							{name}
						</span>
						<span
							className={cn(
								'rounded px-2 py-1 text-xs font-medium',
								riskColors[riskLevel]
							)}
						>
							{riskLevel} risk
						</span>
					</div>
					{!isActive && (
						<span className="mt-2 inline-block text-xs text-gray-500">
							Inactive
						</span>
					)}
				</div>
				<div className="text-right">
					<p className="text-lg font-bold text-gray-900">{allocation}%</p>
					<p className="text-xs text-gray-500">allocation</p>
				</div>
			</div>

			<div className="mt-4 grid grid-cols-2 gap-4">
				<div>
					<p className="text-xs text-gray-500">Deployed</p>
					<p className="mt-1 text-sm font-semibold text-gray-900">
						${amountDeployed.toLocaleString()}
					</p>
				</div>
				<div>
					<p className="text-xs text-gray-500">Current Value</p>
					<p className="mt-1 text-sm font-semibold text-gray-900">
						${currentValue.toLocaleString()}
					</p>
				</div>
				<div>
					<p className="text-xs text-gray-500">APY</p>
					<p className="mt-1 text-sm font-semibold text-green-600">{apy}%</p>
				</div>
				<div>
					<p className="text-xs text-gray-500">Profit</p>
					<p
						className={cn(
							'mt-1 text-sm font-semibold',
							profit >= 0 ? 'text-green-600' : 'text-red-600'
						)}
					>
						{profit >= 0 ? '+' : ''}${profit.toFixed(2)} ({profitPercent.toFixed(2)}%)
					</p>
				</div>
			</div>
		</div>
	)
}
