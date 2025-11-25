interface StatItem {
	from: number
	to: number | null
}

/**
 * This is a timer class to measure the time of a function
 */
export class Timer {
	private _stats: Record<string, StatItem> = {}

	constructor() {
		this._stats = {}
	}

	start = (key: string) => {
		const now = Date.now()
		this._stats[key] = {
			from: now,
			to: null,
		}
	}

	stop = (key: string) => {
		const now = Date.now()
		if (this._stats[key]) {
			this._stats[key].to = now
		}
	}

	get stats(): Record<string, number> {
		return Object.fromEntries(
			Object.entries(this._stats).map(([key, value]) => {
				const duration = value.to ? value.to - value.from : -1
				return [key, duration]
			}),
		)
	}
}
