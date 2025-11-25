import { useCallback } from "react"

import { QueryKey, useQueryClient } from "@tanstack/react-query"

export const useRefetch = () => {
	const queryClient = useQueryClient()

	const refetch = useCallback(
		(queryKeys: QueryKey[]) => {
			for (const queryKey of queryKeys) {
				void queryClient.refetchQueries({ queryKey })
			}
		},
		[queryClient],
	)

	return refetch
}

export const useInvalidate = () => {
	const queryClient = useQueryClient()

	return useCallback(
		(queryKeys: QueryKey[]) => {
			for (const queryKey of queryKeys) {
				void queryClient.invalidateQueries({ queryKey })
			}
		},
		[queryClient],
	)
}
