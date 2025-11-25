import { useState } from "react"

import { ArrowRightLeft } from "lucide-react"

import { Badge, Button, Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { ChainIcon } from "@/components/ChainIcon"
import { TokenIcon } from "@/components/TokenIcon"
import { SUPPORTED_BRIDGE_CHAINS } from "@/constants/chain"
import { ETH_MAINNET, SOL, SOLANA_USDT, USDT_MAINNET, USDT_VICTION, VIC } from "@/constants/token"
import { Token, TokenAmount } from "@/types/tokens"

import { useBridgeStore } from "../form/store/bridgeStore"

interface SwapChainProps {
	disabled?: boolean
	showChainName?: boolean
}

interface OpenModal {
	status: "open" | "close"
	action: ChainSide
}

type ChainSide = "source" | "destination" | undefined

export const SwapChain: React.FC<SwapChainProps> = ({ disabled = false, showChainName }) => {
	const { sourceToken, destToken, setSourceToken, setDestToken, switchSides } = useBridgeStore()
	const [openModalState, setOpenModal] = useState<OpenModal>({
		status: "close",
		action: undefined,
	})

	function setTokenAmount(chainId: number, action: string) {
		let token: Token
		switch (chainId) {
			case VIC.chainId:
				token = USDT_VICTION
				break
			case ETH_MAINNET.chainId:
				token = USDT_MAINNET
				break
			case SOL.chainId:
				token = SOLANA_USDT
				break
			default:
				token = USDT_MAINNET
				break
		}

		const currentTokenAmont = new TokenAmount({ token: token })
		if (action === "source") {
			setSourceToken(() => currentTokenAmont)
		} else {
			setDestToken(() => currentTokenAmont)
		}
	}

	return (
		<>
			<div className="flex items-center justify-between gap-3 lg:gap-5">
				<div className="flex w-full flex-col gap-2 lg:gap-3">
					<div className="text-sm font-medium lg:text-base">From</div>
					<Button
						className={cn("flex h-12 w-full items-center justify-center gap-2 rounded-full px-4")}
						buttonColor="gray"
						buttonType="filled"
						onClick={() => {
							setOpenModal({
								status: "open",
								action: "source",
							})
						}}
					>
						<ChainIcon className="size-6 justify-center" chainId={sourceToken.token.chainId} />
						{showChainName && (
							<div className={cn("text-sm font-medium")}>
								{SUPPORTED_BRIDGE_CHAINS[sourceToken.token.chainId]?.name}
							</div>
						)}
					</Button>
				</div>
				<Button
					buttonType="text"
					buttonColor="gray"
					disabled={disabled}
					onClick={switchSides}
					className={cn("mt-6 h-full items-center justify-center rounded-full p-0 lg:mt-7")}
				>
					<ArrowRightLeft className="size-5" />
				</Button>
				<div className="flex w-full flex-col gap-2 lg:gap-3">
					<div className="text-sm font-medium lg:text-base">To</div>
					<Button
						className={cn("flex h-12 w-full items-center justify-center gap-2 rounded-full px-4")}
						buttonColor="gray"
						buttonType="filled"
						onClick={() => {
							setOpenModal({
								status: "open",
								action: "destination",
							})
						}}
					>
						<ChainIcon className="size-6 justify-center" chainId={destToken.token.chainId} />
						{showChainName && (
							<div className={cn("text-sm font-medium")}>{SUPPORTED_BRIDGE_CHAINS[destToken.token.chainId]?.name}</div>
						)}
					</Button>
				</div>
			</div>
			{openModalState.status === "open" && (
				<Modal
					open
					onOpenChange={(open) => {
						if (open) {
							setOpenModal({
								status: "open",
								action: openModalState.action,
							})
						} else {
							setOpenModal({
								status: "close",
								action: openModalState.action,
							})
						}
					}}
				>
					<ModalContent className="mb-12 px-6 lg:pb-6">
						<ModalHeader>
							<ModalTitle className="text-center">
								{openModalState.action === "source" ? "Source" : "Destination"} Network
							</ModalTitle>
							<ModalDescription className="my-3 text-center text-sm text-gray-500">Avaliable network</ModalDescription>
						</ModalHeader>
						<div className="flex flex-col gap-2">
							{Object.entries(SUPPORTED_BRIDGE_CHAINS).map(([_, chain]) => {
								let token: Token
								const oppositeChain =
									openModalState.action !== "source" ? sourceToken.token.chainId : destToken.token.chainId
								const badgeInfo = oppositeChain === chain.id ? "Selected" : undefined

								switch (chain.id) {
									case VIC.chainId:
										token = VIC
										break
									case ETH_MAINNET.chainId:
										token = ETH_MAINNET
										break
									case SOL.chainId:
										token = SOL
										break
									default:
										token = VIC
										break
								}
								return (
									<Button
										key={chain.id}
										disabled={chain.id === oppositeChain}
										buttonColor="gray"
										buttonType="solid"
										className={cn(
											"flex justify-between gap-3 rounded-xl border px-4 py-3",
											"border-gray-100 bg-transparent hover:bg-gray-50 active:bg-gray-100/80 dark:border-gray-800",
											"cursor-pointer",
											token.chainId === oppositeChain && "opacity-70",
										)}
										onClick={() => {
											setTokenAmount(chain.id, openModalState.action!)
											setOpenModal({
												status: "close",
												action: openModalState.action,
											})
										}}
									>
										<div className="flex items-center gap-3">
											<TokenIcon token={token} />
											<div className="flex items-center">{chain.name}</div>
										</div>
										{badgeInfo && (
											<Badge type="translucent" variant="primary">
												<div className="w-10 text-2xs text-gray-600">{badgeInfo}</div>
											</Badge>
										)}
									</Button>
								)
							})}
						</div>
					</ModalContent>
				</Modal>
			)}
		</>
	)
}
