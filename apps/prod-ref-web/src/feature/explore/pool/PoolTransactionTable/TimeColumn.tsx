import { useEffect, useState } from "react"

import TimeAgo from "javascript-time-ago"
import en from "javascript-time-ago/locale/en"

import { Skeleton } from "@rabbitswap/ui/basic"

import { unixTimeStampToDate } from "@/utils/date"

TimeAgo.addDefaultLocale(en)
TimeAgo.addLocale(en)
const timeAgo = new TimeAgo("en-US")

const REFRESH_DISPLAY_MS = 1000 // 1 sec

export const TimeColumn: React.FC<{
	timestamp: number // unix
}> = ({ timestamp }) => {
	const [displayText, setDisplayText] = useState<string>(
		timestamp ? `${timeAgo.format(unixTimeStampToDate(timestamp), "mini")} ago` : "",
	)

	useEffect(() => {
		if (!timestamp) return

		setDisplayText(`${timeAgo.format(unixTimeStampToDate(timestamp), "mini")} ago`)
		const interval = setInterval(() => {
			setDisplayText(`${timeAgo.format(unixTimeStampToDate(timestamp), "mini")} ago`)
		}, REFRESH_DISPLAY_MS)

		return () => {
			clearInterval(interval)
		}
	}, [timestamp])

	return (
		<Skeleton width={50} className="font-normal text-gray-500">
			{displayText === "" ? undefined : displayText}
		</Skeleton>
	)
}
