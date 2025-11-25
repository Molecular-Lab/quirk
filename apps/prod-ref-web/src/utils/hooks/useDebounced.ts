import { useEffect, useState } from "react"

export const useDebounced = <T>(defaultValue: T, debounceTime = 500) => {
	const [value, setValue] = useState(defaultValue)
	const debounced = useDebouncedValue(value, debounceTime)

	return {
		value,
		setValue,
		debounced,
	}
}

export const useDebouncedValue = <T>(value: T, debounceTime = 300) => {
	const [debounced, setDebounced] = useState<T>(value)

	useEffect(() => {
		const timeout = setTimeout(() => {
			setDebounced(value)
		}, debounceTime)

		return () => {
			clearTimeout(timeout)
		}
	}, [debounceTime, value])

	return debounced
}

export const useDebouncedSet = <T>(defaultValue: T, setDebouncedValue: (value: T) => void, debounceTime = 300) => {
	const [value, setValue] = useState(defaultValue)

	useEffect(() => {
		const timeout = setTimeout(() => {
			setDebouncedValue(value)
		}, debounceTime)

		return () => {
			clearTimeout(timeout)
		}
	}, [debounceTime, setDebouncedValue, value])

	return [value, setValue] as const
}
