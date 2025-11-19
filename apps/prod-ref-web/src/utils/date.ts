export function unixTimeStampToDate(timestamp: number): Date {
	return new Date(timestamp * 1000)
}

export function dateToUnixTimestamp(date: Date): number {
	return date.getTime() / 1000
}
