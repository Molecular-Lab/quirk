import { useState, useRef } from 'react'
import type { TouchEvent } from 'react'

interface Card {
	currency: string
	balance: string
	usdValue: string
	change: string
	isPositive: boolean
	bgGradient: string
}

const cards: Card[] = [
	{
		currency: 'THB',
		balance: '2,127.03',
		usdValue: '63.24',
		change: '+2.5%',
		isPositive: true,
		bgGradient: 'from-green-700 to-green-900',
	},
	{
		currency: 'USD',
		balance: '458.92',
		usdValue: '458.92',
		change: '+1.8%',
		isPositive: true,
		bgGradient: 'from-blue-700 to-blue-900',
	},
	{
		currency: 'EUR',
		balance: '312.45',
		usdValue: '341.87',
		change: '-0.3%',
		isPositive: false,
		bgGradient: 'from-purple-700 to-purple-900',
	},
]

export function BalanceCard() {
	const [currentIndex, setCurrentIndex] = useState(0)
	const [touchStart, setTouchStart] = useState(0)
	const [touchEnd, setTouchEnd] = useState(0)
	const containerRef = useRef<HTMLDivElement>(null)

	const minSwipeDistance = 50

	const onTouchStart = (e: TouchEvent) => {
		setTouchEnd(0)
		setTouchStart(e.targetTouches[0].clientX)
	}

	const onTouchMove = (e: TouchEvent) => {
		setTouchEnd(e.targetTouches[0].clientX)
	}

	const onTouchEnd = () => {
		if (!touchStart || !touchEnd) return

		const distance = touchStart - touchEnd
		const isLeftSwipe = distance > minSwipeDistance
		const isRightSwipe = distance < -minSwipeDistance

		if (isLeftSwipe && currentIndex < cards.length - 1) {
			setCurrentIndex(currentIndex + 1)
		}

		if (isRightSwipe && currentIndex > 0) {
			setCurrentIndex(currentIndex - 1)
		}
	}

	return (
		<div className="px-6 mb-6">
			<div
				ref={containerRef}
				className="relative overflow-hidden"
				onTouchStart={onTouchStart}
				onTouchMove={onTouchMove}
				onTouchEnd={onTouchEnd}
			>
				{/* Card Container */}
				<div
					className="flex transition-transform duration-300 ease-out"
					style={{
						transform: `translateX(-${currentIndex * 100}%)`,
					}}
				>
					{cards.map((card) => (
						<div
							key={card.currency}
							className="min-w-full px-1"
							style={{ width: '100%' }}
						>
							<div
								className={`bg-gradient-to-br ${card.bgGradient} rounded-3xl p-6 shadow-lg`}
							>
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center gap-2">
										<div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
											<span className="text-xl font-bold text-white">
												{card.currency.charAt(0)}
											</span>
										</div>
										<span className="text-white text-lg font-semibold">
											{card.currency}
										</span>
									</div>
									<div className="text-right">
										<p className="text-white/70 text-xs">USD Value</p>
										<p className="text-white text-sm font-medium">
											${card.usdValue}
										</p>
									</div>
								</div>

								<div className="mb-4">
									<p className="text-white/70 text-sm mb-1">Balance</p>
									<p className="text-white text-4xl font-bold">
										{card.balance}
									</p>
								</div>

								<div className="flex items-center justify-between">
									<div
										className={`flex items-center gap-1 px-3 py-1 rounded-full ${
											card.isPositive
												? 'bg-green-500/20 text-green-300'
												: 'bg-red-500/20 text-red-300'
										}`}
									>
										<span className="text-xs font-medium">{card.change}</span>
										<span className="text-xs">
											{card.isPositive ? '↗' : '↘'}
										</span>
									</div>
									<button className="text-white/70 hover:text-white transition-colors">
										<span className="text-xl">⋯</span>
									</button>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Pagination Dots */}
				<div className="flex items-center justify-center gap-2 mt-4">
					{cards.map((_card, idx) => (
						<button
							key={idx}
							onClick={() => setCurrentIndex(idx)}
							className={`h-2 rounded-full transition-all ${
								idx === currentIndex
									? 'w-8 bg-green-400'
									: 'w-2 bg-gray-600'
							}`}
						/>
					))}
				</div>
			</div>
		</div>
	)
}
