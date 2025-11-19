import { mainnet, viction } from "viem/chains"

import { ChainIcon } from "@/components/ChainIcon"
import { DoubleTokenIcon, TokenIcon, TokenIconWithChain } from "@/components/TokenIcon"
import { RabbitSwapPfp } from "@/components/Wallet/RabbitSwapPfp"
import { CUSD_VICTION, USDT_MAINNET, VIC } from "@/constants/token"
import { useAllTokens } from "@/hooks/token/useAllTokens"
import { EvmToken } from "@/types/tokens"
import { useTokenColor } from "@/utils/token"

export const SectionCustomComponents: React.FC = () => {
	const { data: tokens } = useAllTokens(viction.id)
	return (
		<>
			<div>Chain icons</div>
			<div className="flex items-center gap-2">
				<ChainIcon chainId={undefined} />
				<ChainIcon chainId={viction.id} />
				<ChainIcon chainId={mainnet.id} />
			</div>
			<div>Token icons</div>
			<div className="text-xs">Single token</div>
			<div className="flex items-center gap-2">
				<TokenIcon token={undefined} />
				<TokenIcon token={CUSD_VICTION} />
				<TokenIconWithChain token={CUSD_VICTION} />
				<TokenIconWithChain token={CUSD_VICTION} className="size-4" />
				<TokenIconWithChain token={CUSD_VICTION} className="size-10" />
				<TokenIconWithChain showChainIcon={false} token={CUSD_VICTION} />
			</div>
			<div className="text-xs">Double token</div>
			<div className="flex items-center gap-2">
				<TokenIcon token={[undefined, undefined]} />
				<TokenIcon token={[VIC, CUSD_VICTION]} />
				{/* same chain */}
				<TokenIconWithChain token={[VIC, CUSD_VICTION]} />
				<TokenIconWithChain showChainIcon={false} token={[VIC, CUSD_VICTION]} />
				{/* diff chain */}
				<TokenIconWithChain token={[VIC, USDT_MAINNET]} />
				<TokenIconWithChain showChainIcon={false} token={[VIC, USDT_MAINNET]} />
			</div>
			<div className="flex items-center gap-2">
				<DoubleTokenIcon token={[undefined, undefined]} />
				<DoubleTokenIcon token={[VIC, CUSD_VICTION]} />
			</div>
			<div className="text-xs">Token color</div>
			<div className="flex items-center gap-1 text-center text-xs">
				<span className="w-6">Icon</span>
				<span className="w-10">Raw</span>
				<span className="w-10">Light</span>
				<span className="w-10">Dark</span>
			</div>
			<div className="flex flex-col text-xs">
				{tokens?.map((token, i) => {
					return <TokenColor key={i} token={token} />
				})}
			</div>
			<div className="mt-12">RabbitSwapPfp</div>
			<div className="flex items-center gap-2">
				<RabbitSwapPfp imgIndex={0} />
				<RabbitSwapPfp imgIndex={1} />
				<RabbitSwapPfp imgIndex={2} />
				<RabbitSwapPfp imgIndex={3} />
				<RabbitSwapPfp imgIndex={4} />
				<RabbitSwapPfp imgIndex={5} />
				<RabbitSwapPfp imgIndex={6} />
				<RabbitSwapPfp imgIndex={7} />
				<RabbitSwapPfp imgIndex={8} />
				<RabbitSwapPfp imgIndex={9} />
				<RabbitSwapPfp imgIndex={10} />
				<RabbitSwapPfp imgIndex={11} />
				<RabbitSwapPfp imgIndex={12} />
			</div>
			<div className="mt-4 flex items-center gap-2">
				<RabbitSwapPfp imgIndex={0} className="size-16" />
				<RabbitSwapPfp imgIndex={1} className="size-16" />
				<RabbitSwapPfp imgIndex={2} className="size-16" />
			</div>
		</>
	)
}

const TokenColor: React.FC<{ token: EvmToken }> = ({ token }) => {
	const { rawColor: tokenColor, themeColor: lightThemeColor } = useTokenColor(token, "light")
	const { themeColor: darkThemeColor } = useTokenColor(token, "dark")
	return (
		<div className="flex items-center gap-1">
			<TokenIcon token={token} className="size-6" />
			<div className="h-6 w-10" style={{ background: tokenColor }} />
			<div className="h-6 w-10" style={{ background: lightThemeColor }} />
			<div className="h-6 w-10" style={{ background: darkThemeColor }} />
			<div>{token.symbol}</div>
		</div>
	)
}
