import { Address } from "../../entity"

import { ArkenQuoteResponse, ArkenTradeRouteStruct, DexConfig, GetDexConfigResponse, Protocol } from "./dto"

export class RouteProtocols {
	dexConfig: GetDexConfigResponse
	note: Record<string, number>

	constructor(dexConfig: GetDexConfigResponse) {
		this.dexConfig = dexConfig
		this.note = {}
	}

	partToPercent = (part: number): number => {
		return Math.floor(part * 1000000)
	}

	getDexConfig = (dexName: string, chain: string): DexConfig | undefined => {
		const dexConfig = this.dexConfig[chain.toLowerCase()]?.[dexName.toLowerCase()]
		return dexConfig
	}

	getPartPool = (currentProtocol: Protocol, nextProtocol: Protocol): number => {
		if (currentProtocol.partPool) {
			return currentProtocol.partPool
		}
		if (!this.note[currentProtocol.fromTokenAddress]) {
			this.note[currentProtocol.fromTokenAddress] = 100 - currentProtocol.part
			return currentProtocol.part
		}

		const nextSwap = nextProtocol
		if ((this.note[nextSwap.fromTokenAddress] ?? 0) <= 0) {
			const partPool = 100
			this.note[currentProtocol.fromTokenAddress] = 0
			return partPool
		}

		const current = this.note[currentProtocol.fromTokenAddress] ?? 0
		const partPool = Number((((currentProtocol.part * 1.0) / (current * 1.0)) * 100).toFixed(2))
		this.note[currentProtocol.fromTokenAddress] =
			(this.note[currentProtocol.fromTokenAddress] ?? 0) - currentProtocol.part

		return partPool
	}

	isUseLPAddress = (dexName: string): boolean => {
		return ["curve", "acryptos"].includes(dexName)
	}

	getTradeRoute = (bestRateData: ArkenQuoteResponse): ArkenTradeRouteStruct[] | null => {
		this.note = {}
		const tradeRoutes = bestRateData.protocols.flatMap((protocolItem) =>
			protocolItem.map<ArkenTradeRouteStruct>((protocol, index) => {
				const partPool = this.getPartPool(protocol, protocolItem[index + 1]!)
				const dexConfig = this.getDexConfig(protocol.dexName.toLowerCase(), protocol.chain.toLowerCase())
				const dexInterface = dexConfig?.dexInterface ?? 0
				const dexAddress = dexConfig?.dexAddress ?? ""

				const tradeRoutes: ArkenTradeRouteStruct = {
					routerAddress: (this.isUseLPAddress(protocol.dexName) ? protocol.lpAddress : dexAddress) as Address,
					lpAddress: protocol.lpAddress as Address,
					fromToken: protocol.fromTokenAddress as Address,
					toToken: protocol.toTokenAddress as Address,
					from: protocol.fromRouterAddress as Address,
					to: protocol.toRouterAddress as Address,
					part: this.partToPercent(partPool),
					direction: protocol.dodoDirection ?? 0,
					fromTokenIndex: protocol.fromTokenIndex ?? 0,
					toTokenIndex: protocol.toTokenIndex ?? 0,
					amountAfterFee: protocol.fee ?? 0,
					dexInterface: dexInterface,
				}
				return tradeRoutes
			}),
		)

		const notedKeys = Object.keys(this.note)
		if (notedKeys.reduce<number>((prev, curr) => prev + Number(this.note[curr]) || 0, 0)) return null

		return tradeRoutes
	}
}
