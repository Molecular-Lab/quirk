import { useQuery } from "@tanstack/react-query"

import apiClient from "@/api/core"

export const useSystemInfo = () => {
	const query = useQuery({
		queryKey: ["system-info"],
		queryFn: async () => {
			const sysInfo = await apiClient.systemRouter.getSystemInfo()
			return sysInfo
		},
	})
	return query
}
