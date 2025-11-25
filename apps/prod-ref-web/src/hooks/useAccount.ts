import { useCallback, useEffect, useMemo } from "react"

import { useAuthCore, useConnect } from "@particle-network/authkit"
import { useAccount as useParticleAccount } from "@particle-network/connectkit"
import { useLocalStorage } from "localstore"
import { type Address, getAddress } from "viem"

import { useAccountMode } from "@/feature/sub-account/context"

/**
 * override address to viem getAddress format
 */
export const useAccount = () => {
	const { accountMode, setAccountMode } = useAccountMode()
	const { address: _mainAddress, ...rest } = useParticleAccount()
	const { userInfo } = useAuthCore()
	const { disconnect: disconnectSubAcc } = useConnect()

	const mainAddress = useMemo<Address | undefined>(() => {
		try {
			if (_mainAddress === undefined) {
				return undefined
			}
			return getAddress(_mainAddress)
		} catch {
			if (_mainAddress?.startsWith("0x")) {
				return _mainAddress as Address
			}
			return undefined
		}
	}, [_mainAddress])

	const [subAccMap, setSubAccMap] = useLocalStorage("sub-account", {})

	const subAccountAddress = useMemo<Address | undefined>(() => {
		if (!mainAddress) return undefined
		const _subAccountAddress = subAccMap[mainAddress.toLowerCase()]?.address
		if (!_subAccountAddress) return undefined
		try {
			const addr = getAddress(_subAccountAddress)
			return addr
		} catch {
			return undefined
		}
	}, [mainAddress, subAccMap])

	// this hook is patching wrong localstorage data
	useEffect(() => {
		setSubAccMap((prev) => {
			const _subAccMap = Object.entries(prev)
			const subAccList = Object.values(prev)
			const uniqueSubAddress = [...new Set(subAccList.map((e) => e.address.toLowerCase()))]

			const uniqueSubAddressGroup = uniqueSubAddress
				.map<[string, { ack: boolean; address: string }][]>((subAddr) => {
					return _subAccMap.filter(([_, v2]) => v2.address.toLowerCase() === subAddr)
				})
				.filter((arr) => arr.length === 1)
				.flat()

			return Object.fromEntries(uniqueSubAddressGroup)
		})
	}, [mainAddress, setSubAccMap])

	const setSubAccountAddress = useCallback(
		(mainAddr: Address | undefined, subAddr: Address) => {
			setSubAccMap((prev) => {
				if (!mainAddr) return prev

				// remove all wrong duplication by getting only unrelated address to this subaccount
				// and add new data at the end
				const nonDupItem = Object.entries(prev).filter(([_, v1]) => {
					const addr1 = v1.address.toLowerCase()
					const addr2 = subAddr.toLowerCase()
					return addr1 !== addr2
				})

				return {
					...Object.fromEntries(nonDupItem),
					[mainAddr.toLowerCase()]: {
						ack: prev[mainAddr.toLowerCase()]?.ack ?? false,
						address: subAddr,
					},
				}
			})
		},
		[setSubAccMap],
	)

	const [mainAddr, subAddress] = useMemo<[Address | undefined, Address | undefined]>(() => {
		if (!userInfo) return [undefined, undefined]
		let mainAddr: Address | undefined = undefined
		try {
			// format = uuid:mainAddress
			const jwtId = userInfo.jwt_id
			const mainAddrStr = jwtId?.split(":")[1]
			if (mainAddrStr) mainAddr = getAddress(mainAddrStr)
		} catch {
			// ignore
		}
		const evmAddress = userInfo.wallets.find((wallet) => wallet.chain_name === "evm_chain")?.public_address
		if (evmAddress) {
			const addr = getAddress(evmAddress)
			setSubAccountAddress(mainAddr, addr)
			return [mainAddr, addr]
		}
		return [undefined, undefined]
	}, [setSubAccountAddress, userInfo])

	// logout sub-account when address is not the same as local storage
	useEffect(() => {
		if (mainAddr?.toLowerCase() !== mainAddress?.toLowerCase()) {
			setAccountMode("main")
			void disconnectSubAcc()
		}
	}, [disconnectSubAcc, mainAddr, mainAddress, setAccountMode])

	const address = useMemo<Address | undefined>(() => {
		switch (accountMode) {
			case "main": {
				return mainAddress
			}
			case "sub": {
				return subAddress
			}
			default: {
				return undefined
			}
		}
	}, [accountMode, mainAddress, subAddress])

	return {
		address,
		mainAddress,
		subAddress,
		subAccountAddress,
		...rest,
	}
}
