import { create } from "zustand"

import { USDT_MAINNET, USDT_VICTION } from "@/constants/token"
import { getOFTAddress } from "@/feature/bridge/form/hook/utils"
import { TokenAmount } from "@/types/tokens"

export type TabValue = "deposit" | "withdraw"
export type SupportedChain = "viction" | "ethereum" | "solana"
interface BridgeData {
	tab: TabValue
	sourceToken: TokenAmount
	destToken: TokenAmount
	customAddr: string
}

interface BridgeStore extends BridgeData {
	setTab: (tab: TabValue) => void
	setSourceToken: <T extends TokenAmount>(f: (prev: T) => T) => void
	setDestToken: <T extends TokenAmount>(f: (prev: T) => T) => void
	setSourceTokenAmount: <T extends TokenAmount>(f: (prev: T) => T) => void
	setDestTokenAmount: <T extends TokenAmount>(f: (prev: T) => T) => void
	setCustomAddr: (addr: string) => void
	switchSides: () => void
	reset: () => void
	computed: {
		oftAddress: string | undefined
	}
}

const defaultState: BridgeData = {
	tab: "deposit",
	sourceToken: new TokenAmount({ token: USDT_MAINNET }),
	destToken: new TokenAmount({ token: USDT_VICTION }),
	customAddr: "",
}

export const useBridgeStore = create<BridgeStore>((set, get) => ({
	...defaultState,
	setTab: (tab) => {
		set({ tab })
	},
	setSourceToken: <T extends TokenAmount>(f: (prev: T) => T) => {
		const sourceToken = get().sourceToken as T
		const newToken = f(sourceToken)
		if (newToken.token.chainId !== sourceToken.token.chainId) {
			set({ sourceToken: newToken })
		}
	},
	setDestToken: <T extends TokenAmount>(f: (prev: T) => T) => {
		const destToken = get().destToken as T
		const newToken = f(destToken)
		if (newToken.token.chainId !== destToken.token.chainId) {
			set({ destToken: newToken })
		}
	},
	setSourceTokenAmount: <T extends TokenAmount>(f: (prev: T) => T) => {
		const sourceToken = get().sourceToken as T
		const newToken = f(sourceToken)
		set({ sourceToken: newToken })
	},
	setDestTokenAmount: <T extends TokenAmount>(f: (prev: T) => T) => {
		const destToken = get().destToken as T
		const newToken = f(destToken)
		set({ destToken: newToken })
	},
	setCustomAddr: (addr) => {
		set({ customAddr: addr })
	},
	reset: () => {
		set((state) => ({
			sourceToken: state.sourceToken.newAmountString(),
			destToken: state.destToken.newAmountString(),
		}))
	},
	switchSides: () => {
		set((state) => ({
			sourceToken: state.destToken,
			destToken: state.sourceToken,
			tab: state.tab === "deposit" ? "withdraw" : "deposit",
		}))
	},

	computed: {
		get oftAddress() {
			return getOFTAddress(get().sourceToken.token.chainId)
		},
	},
}))
