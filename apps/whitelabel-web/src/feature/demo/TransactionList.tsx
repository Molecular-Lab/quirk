interface Transaction {
	id: string
	type: 'deposit' | 'withdraw' | 'interest' | 'exchange'
	title: string
	subtitle: string
	amount: string
	isPositive: boolean
	icon: string
	timestamp: string
}

const transactions: Transaction[] = [
	{
		id: '1',
		type: 'interest',
		title: 'Interest Earned',
		subtitle: 'AAVE Lending Pool',
		amount: '+5.42 THB',
		isPositive: true,
		icon: '💰',
		timestamp: '2 hours ago',
	},
	{
		id: '2',
		type: 'deposit',
		title: 'Deposit',
		subtitle: 'Bank Transfer',
		amount: '+500.00 THB',
		isPositive: true,
		icon: '📥',
		timestamp: 'Yesterday',
	},
	{
		id: '3',
		type: 'exchange',
		title: 'Exchange',
		subtitle: 'USD → THB',
		amount: '-50.00 USD',
		isPositive: false,
		icon: '💱',
		timestamp: '2 days ago',
	},
	{
		id: '4',
		type: 'interest',
		title: 'Interest Earned',
		subtitle: 'Curve Pool',
		amount: '+2.18 THB',
		isPositive: true,
		icon: '💰',
		timestamp: '3 days ago',
	},
	{
		id: '5',
		type: 'withdraw',
		title: 'Withdrawal',
		subtitle: 'To Bank Account',
		amount: '-200.00 THB',
		isPositive: false,
		icon: '📤',
		timestamp: '1 week ago',
	},
	{
		id: '6',
		type: 'deposit',
		title: 'Deposit',
		subtitle: 'Mobile Banking',
		amount: '+1,000.00 THB',
		isPositive: true,
		icon: '📥',
		timestamp: '1 week ago',
	},
]

export function TransactionList() {
	return (
		<div className="px-6 mb-6">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-white font-semibold text-lg">
					Recent Transactions
				</h3>
				<button className="text-green-400 text-sm font-medium">View All</button>
			</div>

			<div className="space-y-3">
				{transactions.map((tx) => (
					<div
						key={tx.id}
						className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-colors"
					>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
								<span className="text-lg">{tx.icon}</span>
							</div>

							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between gap-2">
									<p className="text-white text-sm font-medium truncate">
										{tx.title}
									</p>
									<p
										className={`text-sm font-semibold flex-shrink-0 ${
											tx.isPositive ? 'text-green-400' : 'text-gray-400'
										}`}
									>
										{tx.amount}
									</p>
								</div>
								<div className="flex items-center justify-between gap-2 mt-1">
									<p className="text-gray-500 text-xs truncate">
										{tx.subtitle}
									</p>
									<p className="text-gray-600 text-xs flex-shrink-0">
										{tx.timestamp}
									</p>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>

			<button className="w-full mt-4 py-3 bg-gray-900 hover:bg-gray-800 rounded-xl text-gray-400 text-sm font-medium border border-gray-800 transition-colors">
				Load More Transactions
			</button>
		</div>
	)
}
