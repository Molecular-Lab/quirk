/**
 * Morpho GraphQL API client
 * Docs: https://docs.morpho.org/api/morpho-vaults/
 */

const MORPHO_API_ENDPOINT = 'https://api.morpho.org/graphql'

/**
 * GraphQL query response types
 */
export interface MorphoVaultResponse {
	vaultV2ByAddress: {
		address: string
		name: string
		avgApy: number // 6h average vault APY excluding rewards, before performance fee
		avgNetApy: number // 6h average vault APY including rewards, after performance fee
		performanceFee: number
		managementFee: number
		totalAssets: string
		totalAssetsUsd: number
		dailyApys: Array<{
			apy: number
			netApy: number
		}>
	} | null
}

/**
 * Fetch vault data from Morpho GraphQL API
 * @param vaultAddress - Vault contract address
 * @param chainId - Chain ID
 * @returns Vault data including APY
 */
export async function fetchVaultData(
	vaultAddress: string,
	chainId: number,
): Promise<MorphoVaultResponse['vaultV2ByAddress']> {
	// Use inline query parameters instead of variables for better compatibility
	const query = `
		query {
			vaultV2ByAddress(address: "${vaultAddress}", chainId: ${chainId}) {
				address
				name
				avgApy
				avgNetApy
				performanceFee
				managementFee
				totalAssets
				totalAssetsUsd
				dailyApys {
					apy
					netApy
				}
			}
		}
	`

	try {
		const response = await fetch(MORPHO_API_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				query,
			}),
		})

		if (!response.ok) {
			throw new Error(
				`Morpho API request failed: ${response.status} ${response.statusText}`,
			)
		}

		const json = (await response.json()) as {
			data?: MorphoVaultResponse
			errors?: Array<{ message: string }>
		}

		if (json.errors && json.errors.length > 0) {
			throw new Error(`Morpho API error: ${json.errors[0].message}`)
		}

		if (!json.data?.vaultV2ByAddress) {
			throw new Error(
				`Vault not found: ${vaultAddress} on chain ${chainId}`,
			)
		}

		return json.data.vaultV2ByAddress
	} catch (error) {
		if (error instanceof Error) {
			throw error
		}
		throw new Error(`Failed to fetch vault data: ${String(error)}`)
	}
}

/**
 * Convert APY from decimal to percentage string
 * Morpho API returns APY as a decimal (e.g., 0.0525 for 5.25%)
 */
export function formatMorphoAPY(apy: number): string {
	return (apy * 100).toFixed(2)
}
