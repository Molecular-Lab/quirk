import { Hex, PublicClient } from "viem"

import { pythAbi } from "@rabbitswap/core/constants"

import { axiosClient } from "@/config/axios"

export interface HermesResponse {
	binary: {
		encoding: "base64" | "hex"
		data: string[]
	}
	parsed: {
		id: string
		price: {
			price: string
			conf: string
			expo: number
		}
	}[]
}

export async function getPythNetworkPrice(tokenPriceIds: string[]): Promise<HermesResponse> {
	const url = `https://hermes.pyth.network/v2/updates/price/latest?encoding=base64&ids[]=${tokenPriceIds.join(
		"&ids[]=",
	)}`
	const response = await axiosClient.get<HermesResponse>(url)
	return response.data
}

export async function getPriceUpdateBytes(tokenPriceIds: string[]): Promise<Buffer[][]> {
	const hermesResponse = await getPythNetworkPrice(tokenPriceIds)

	return mapPriceUpdateData(hermesResponse)
}

export function mapPriceUpdateData(hermesResponse: HermesResponse): Buffer[][] {
	const priceUpdateData: Buffer[][] = []
	if (hermesResponse.binary.data.length > 0) {
		// Get the price update data in base64 format
		const base64Data = hermesResponse.binary.data

		// Convert base64 data to bytes format required by the contract
		const bytesData = base64Data.map((data) => {
			// Convert base64 to buffer and then to hex string
			const buffer = Buffer.from(data, hermesResponse.binary.encoding)
			return buffer
		})

		// Add the converted data to the priceUpdateData array
		priceUpdateData.push(bytesData)
	}

	return priceUpdateData
}

const PYTH_CONTRACT_ADDRESS = "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729"

export async function getPriceUpdateFee(publicClient: PublicClient, priceUpdateData: Buffer[][]): Promise<bigint> {
	// get each update fee
	const updateFees = await Promise.all(
		priceUpdateData.map(async (update) => {
			const updateHex: Hex[] = update.map<Hex>((e) => `0x${e.toString("hex")}`)

			const updateFee = await publicClient.readContract({
				address: PYTH_CONTRACT_ADDRESS,
				abi: pythAbi,
				functionName: "getUpdateFee",
				args: [updateHex],
			})
			return updateFee
		}),
	)

	// Calculate the total update fee for all price updates
	let totalUpdateFee = BigInt(0)
	for (const updateFee of updateFees) {
		totalUpdateFee = totalUpdateFee + updateFee
	}

	return totalUpdateFee
}
