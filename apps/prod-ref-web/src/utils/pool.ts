import BigNumber from "bignumber.js"
import JSBI from "jsbi"
import { type Address, encodeAbiParameters, getAddress, keccak256 } from "viem"

import { POOL_BYTECODE_HASHES, V3_CORE_FACTORY_ADDRESSES } from "@/constants/dex"
import { Pool } from "@/types/pool"
import { SqrtPriceMath } from "@/types/position/sqrtPriceMath"
import { TickMath } from "@/types/position/tickMath"
import { TokenAmount } from "@/types/tokens"

export function computePoolAddress(
	chainId: number,
	[tokenA, tokenB]: [Address | undefined, Address | undefined],
	fee: number | undefined,
): Address | undefined {
	// sort pool token
	const [token0, token1] = [tokenA, tokenB].sort((a, b) => {
		if (!a || !b) {
			return 0
		}
		return a.toLowerCase().localeCompare(b.toLowerCase())
	})

	if (!token0 || !token1 || !fee) {
		return undefined
	}

	const factoryAddress = V3_CORE_FACTORY_ADDRESSES[chainId]
	if (!factoryAddress) {
		throw new Error(`[computePoolAddress] undefined factoryAddress`)
	}

	const poolBytecodeHash = POOL_BYTECODE_HASHES[chainId]
	if (!poolBytecodeHash) {
		throw new Error(`[computePoolAddress] undefined poolBytecodeHash`)
	}

	const constructorArgumentsEncoded = encodeAbiParameters(
		[
			{ name: "token0", type: "address" },
			{ name: "token1", type: "address" },
			{ name: "fee", type: "uint24" },
		],
		[getAddress(token0), getAddress(token1), fee],
	)

	const create2Inputs = [
		"0xff",
		factoryAddress,
		// salt
		keccak256(constructorArgumentsEncoded),
		// init code hash
		poolBytecodeHash,
	]
	const sanitizedInputs: Address = `0x${create2Inputs.map((i) => i.slice(2)).join("")}`

	const out: Address = `0x${keccak256(sanitizedInputs).slice(-40)}`
	return getAddress(out)
}

const Q96 = BigNumber(2).pow(96)
export const calculateTokensLocked = (pool: Pool, tick: number, liquidityActive: JSBI) => {
	const sqrtPriceX96 = TickMath.getSqrtRatioAtTick(tick)
	const prevSqrtX96 = TickMath.getSqrtRatioAtTick(tick - pool.tickSpacing)

	const token1Amount = BigNumber(SqrtPriceMath.getAmount1Delta(prevSqrtX96, sqrtPriceX96, liquidityActive).toString())

	// equivalent to ratioX192 / Q196
	const priceAtTick = BigNumber(sqrtPriceX96.toString()).div(Q96).pow(2)
	const token0Amount = BigNumber(1).div(priceAtTick).multipliedBy(token1Amount)

	return {
		amount0Locked: TokenAmount.fromWei(pool.token0, token0Amount.lte(0) ? "0" : token0Amount.toFixed(0)),
		amount1Locked: TokenAmount.fromWei(pool.token1, token1Amount.lte(0) ? "0" : token1Amount.toFixed(0)),
	}
}
