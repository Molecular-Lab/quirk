import { Address } from "viem"
import { expect, test } from "vitest"

import { linkIdToWallets, modWalletAddress, walletToLinksId } from "@/utils/oneId"

test.each([
	{ address: "0x0000000000000000000000000000000000000000", k: 13, expected: 0 },
	{ address: "0x0000000000000000000000000000000000000001", k: 13, expected: 1 },
	{ address: "0x0000000000000000000000000000000000000002", k: 13, expected: 2 },
	{ address: "0x0000000000000000000000000000000000000003", k: 13, expected: 3 },
	{ address: "0x0000000000000000000000000000000000000004", k: 13, expected: 4 },
	{ address: "0x0000000000000000000000000000000000000005", k: 13, expected: 5 },
	{ address: "0x0000000000000000000000000000000000000006", k: 13, expected: 6 },
	{ address: "0x0000000000000000000000000000000000000007", k: 13, expected: 7 },
	{ address: "0x0000000000000000000000000000000000000008", k: 13, expected: 8 },
	{ address: "0x0000000000000000000000000000000000000009", k: 13, expected: 9 },
	{ address: "0x000000000000000000000000000000000000000a", k: 13, expected: 10 },
	{ address: "0x000000000000000000000000000000000000000b", k: 13, expected: 11 },
	{ address: "0x000000000000000000000000000000000000000c", k: 13, expected: 12 },
	{ address: "0x000000000000000000000000000000000000000d", k: 13, expected: 0 },
	{ address: "0x000000000000000000000000000000000000000e", k: 13, expected: 1 },
	{ address: "0x000000000000000000000000000000000000000f", k: 13, expected: 2 },
	{ address: "0x3aA6EdAB1BC8b8d40eFC6a5a025032fC008EFc86", k: 13, expected: 8 },
])("modWalletAddress %o", ({ address, k, expected }) => {
	expect(modWalletAddress(address as Address, k)).toBe(expected)
})

const domainId = "rabbit"
test.each([
	{ address: "0x3aA6EdAB1BC8b8d40eFC6a5a025032fC008EFc86", expected: false },
	{ address: "0x4E0BD60324971Ad1Cbc177C0C5c1ABA890d8FDA9", expected: true },
	{ address: "0xe99bbbdd6bffd483a7c46de7db6669f34600b278", expected: true },
])("walletToLinksId %o", async ({ address, expected }) => {
	const linkIds = await walletToLinksId(address as Address)
	const hasDomain = linkIds.some((linkId) => linkId.name?.toLowerCase().endsWith(domainId.toLowerCase()))
	expect(hasDomain).toBe(expected)
})

test.each([
	{ domain: "sci.rabbit", expected: 0 },
	{ domain: "ravi.rabbit", expected: 0 },
])("link to wallet %o", async ({ domain, expected }) => {
	const wallets = await linkIdToWallets(domain)
	expect(wallets.length).not.toBe(expected)
})
