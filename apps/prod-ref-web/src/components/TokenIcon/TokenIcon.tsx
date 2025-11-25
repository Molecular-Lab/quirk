import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { EvmToken } from "@/types/tokens"

import { BaseIcon } from "./BaseIcon"

export interface TokenIconProps extends PropsWithClassName {
	token: EvmToken | [EvmToken | undefined, EvmToken | undefined] | undefined
	symbolLength?: number
}

/**
 * Display of a token icon
 *
 * If token is pair, it will display two tokens in two half circles,
 * otherwise, it will display one circle icon
 */
export const TokenIcon: React.FC<TokenIconProps> = ({ token, className, symbolLength }) => {
	const isDouble = Array.isArray(token)

	return (
		<div
			className={cn(
				"pointer-events-none flex size-8 shrink-0 select-none justify-between overflow-hidden rounded-full text-xs font-bold",
				"bg-background dark:bg-background-dark",
				className,
			)}
		>
			{isDouble ? (
				!token[0] || !token[1] ? (
					<BaseIcon symbolLength={symbolLength} />
				) : (
					<>
						<BaseIcon token={token[0]} className="w-[calc(50%-1px)] object-left" symbolLength={1} />
						<BaseIcon token={token[1]} className="w-[calc(50%-1px)] object-right" symbolLength={1} />
					</>
				)
			) : (
				<BaseIcon token={token} symbolLength={symbolLength} />
			)}
		</div>
	)
}
