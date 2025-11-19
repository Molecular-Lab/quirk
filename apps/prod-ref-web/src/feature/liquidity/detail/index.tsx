import { useEffect, useMemo, useState } from "react"

import { BigNumber } from "@ethersproject/bignumber"
import { ArrowLeft } from "lucide-react"

import { Button, RadioButtonGroup, RadioOption } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { InfoTooltip } from "@/components/InfoTooltip"
import { PoolTitle } from "@/components/PoolTitle"
import { RangeBadge } from "@/components/RangeBadge"
import { ConnectEvmWalletButton } from "@/components/Wallet/connectWallet/evmBtn"
import { PriceRangeCard, UnsupportedContent } from "@/feature/liquidity/components"
import { OwnershipWarningIcon } from "@/feature/liquidity/components/OwnershipWarningBox"
import { usePositionAndFee } from "@/hooks/liquidity/usePositionAndFee"
import { useAccount } from "@/hooks/useAccount"
import { useIsSwapChainId, useSwapChainId } from "@/hooks/useChainId"
import { Link } from "@/router"
import { RangeBy } from "@/types/position"
import { EvmToken, TokenAmount } from "@/types/tokens"
import { getUnwrapped } from "@/utils/token"

import { DecreaseLiquidity } from "./components/DecreaseLiquidity"
import { IncreaseLiquidity } from "./components/IncreaseLiquidity"
import { LiquidityCard } from "./components/LiquidityCard"
import { Loading } from "./components/Loading"
import { UnclaimedFeeCard } from "./components/UnclaimFeeCard"

interface LiquidityDetailPageProps {
	tokenId: BigNumber
}

export const LiquidityDetailPage: React.FC<LiquidityDetailPageProps> = ({ tokenId }) => {
	const { address } = useAccount()
	const chainId = useSwapChainId()
	const isSupportedChain = useIsSwapChainId(chainId)
	const [rangeBy, setRangeBy] = useState<RangeBy>("sorted")

	const { position, fee, isLoading } = usePositionAndFee(tokenId, chainId)
	useEffect(() => {
		if (position) setRangeBy(position.pool.displayInverted ? "unsorted" : "sorted")
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [position?.pool.address])

	const [currencyQuote, currencyBase] = useMemo<[EvmToken | undefined, EvmToken | undefined]>(() => {
		if (rangeBy === "sorted") {
			return [position?.quote, position?.base]
		}
		return [position?.base, position?.quote]
	}, [position?.base, position?.quote, rangeBy])

	const [feeQuote, feeBase] = useMemo<[TokenAmount | undefined, TokenAmount | undefined]>(() => {
		return rangeBy === "sorted" ? fee : [fee[1], fee[0]]
	}, [rangeBy, fee])

	const isPositionOwner = useMemo<boolean>(() => {
		return position?.isOwner(address) ?? false
	}, [address, position])

	const [quoteAmount, baseAmount] =
		rangeBy === "sorted" ? [position?.amountQuote, position?.amountBase] : [position?.amountBase, position?.amountQuote]

	// ================== return components =====================

	if (!isSupportedChain) {
		return <UnsupportedContent />
	}

	if (isLoading) {
		return <Loading />
	}

	if (!currencyBase || !currencyQuote || !position) {
		return <></>
	}

	return (
		<div className="flex w-full flex-col items-start gap-4 lg:gap-6">
			<Link to="/pools">
				<Button buttonType="text" buttonColor="gray" size="sm" className="p-0 leading-none">
					<ArrowLeft className="size-3" /> Back to pool
				</Button>
			</Link>
			<div className="flex w-full flex-col gap-6 lg:gap-9">
				<div
					className={cn(
						"flex w-full flex-col items-center justify-center gap-3 md:flex-row md:justify-between",
						!isPositionOwner && address && "flex-row",
					)}
				>
					<div className="flex w-full items-center gap-2">
						<PoolTitle
							currencyQuote={getUnwrapped(currencyQuote)}
							currencyBase={getUnwrapped(currencyBase)}
							iconClassName="size-9 md:size-10"
							titleClassName="md:text-lg md:mb-1"
							feeRate={position.pool.fee}
						/>
						<RangeBadge positionState={position.positionState} />
					</div>
					{!address && (
						<div className="flex w-full items-center gap-2 md:w-auto">
							<ConnectEvmWalletButton className="w-full md:w-auto" />
							<InfoTooltip>Connect your wallet to manage your position</InfoTooltip>
						</div>
					)}
					{isPositionOwner && (
						<div className="flex w-full flex-col items-center gap-3 xs:flex-row lg:w-auto lg:gap-2">
							<IncreaseLiquidity position={position} />
							{position.positionState !== "removed" && <DecreaseLiquidity position={position} />}
						</div>
					)}
					{!isPositionOwner && address && <OwnershipWarningIcon ownerAddress={position.position.ownerAddress} />}
				</div>
				<div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-5">
					<LiquidityCard
						showFiatValue
						quote={quoteAmount}
						base={baseAmount}
						quoteRatio={position.ratioOf(currencyQuote)}
						hideFeeTier
					/>
					<UnclaimedFeeCard quote={feeQuote} base={feeBase} isPositionOwner={isPositionOwner} position={position} />
				</div>
				<PriceRangeCard
					positionState={position.positionState}
					minPrice={position.tickLowerPriceDisplay(currencyBase)}
					maxPrice={position.tickUpperPriceDisplay(currencyBase)}
					currentPrice={position.tickCurrentPriceDisplay(currencyBase)}
					rangeBySelector={
						<RadioButtonGroup
							value={rangeBy}
							onValueChange={(v) => {
								setRangeBy(v as RangeBy)
							}}
							options={[{ token: getUnwrapped(position.display0) }, { token: getUnwrapped(position.display1) }].map<
								RadioOption<string>
							>((e, i) => {
								return {
									label: e.token.symbol,
									value: (i === 0) !== position.pool.displayInverted ? "unsorted" : "sorted",
								}
							})}
						/>
					}
					rangeBy={rangeBy}
					token0={getUnwrapped(position.base)}
					token1={getUnwrapped(position.quote)}
				/>
			</div>
		</div>
	)
}
