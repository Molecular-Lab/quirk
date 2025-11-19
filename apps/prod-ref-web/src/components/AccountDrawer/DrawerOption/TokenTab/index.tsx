import { AccountDrawerTabSkeleton } from "@/components/AccountDrawer/AccountDrawerTabSkeleton"
import { useMyTokens } from "@/hooks/token/useMyTokens"

import { Empty } from "./Empty"
import { TokenTabItem } from "./TokenTabItem"

interface TokenTabProps {}
export const TokenTab: React.FC<TokenTabProps> = () => {
	const { data, isLoading } = useMyTokens()

	if (isLoading) {
		return (
			<div className="h-full flex-1 overflow-y-auto">
				{Array.from({ length: 5 }).map((_, i) => (
					<AccountDrawerTabSkeleton key={i} />
				))}
			</div>
		)
	}

	return (
		<div className="flex h-full flex-1 flex-col overflow-y-auto">
			{data.myTokens.length === 0 ? (
				<Empty />
			) : (
				data.myTokens.map((token, i) => {
					return <TokenTabItem key={i} token={token} />
				})
			)}
		</div>
	)
}
