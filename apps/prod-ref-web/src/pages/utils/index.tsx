import { useMemo, useState } from "react"
import { Helmet } from "react-helmet"

import dayjs from "dayjs"
import { isAddress } from "viem"

import { Button, Container, Input } from "@rabbitswap/ui/basic"

import { Layout } from "@/components/layout"
import { TokenSelector } from "@/components/TokenSelector"
import { DevModeAuthGuard } from "@/feature/dev/DevModeAuthGuard"
import { useAllowance } from "@/hooks/token/useAllowance"
import { useApproveMutation } from "@/hooks/token/useApproveMutation"
import { useSystemInfo } from "@/hooks/useSystemInfo"
import { Link } from "@/router"
import { Token } from "@/types/token"
import { TokenAmount } from "@/types/tokenAmount"

const PAGE_TITLE = "Rabbit Swap | Dev Utils"
const PAGE_DESCRIPTION = ""

const DecreaseAllowanceSection: React.FC = () => {
	const [spender, setSpender] = useState<string>("")
	const [token, setToken] = useState<Token>()

	const { data: allowedAmountWei } = useAllowance({
		spender: isAddress(spender) ? spender : undefined,
		amount: token ? TokenAmount.fromString(token, "0") : undefined,
	})

	const allowedAmount = useMemo<TokenAmount | undefined>(() => {
		if (allowedAmountWei === null || allowedAmountWei === undefined || !token) return undefined
		return TokenAmount.fromWei(token, allowedAmountWei)
	}, [allowedAmountWei, token])

	const { mutateAsync: revoke, isPending } = useApproveMutation()

	return (
		<div className="flex w-full flex-col gap-2 rounded-xl border border-gray-500 p-4">
			<div>Revoke token approval</div>
			<TokenSelector
				token={token}
				onSelect={(token) => {
					setToken(token)
				}}
			/>
			<div className="flex items-center gap-1 text-sm">
				<div>Spender:</div>
				<Input
					placeholder="Spender"
					value={spender}
					onChange={(e) => {
						setSpender(e.target.value)
					}}
				/>
			</div>
			<div className="flex items-center gap-1 text-sm">
				<div>Allowed amount:</div>
				{!!allowedAmount && <div>{allowedAmount.toFormat({ withUnit: true })}</div>}
			</div>
			<Button
				disabled={!allowedAmount?.bigint}
				loading={isPending}
				onClick={() => {
					if (!allowedAmount?.bigint) return
					if (!spender) return
					void revoke({
						spender: isAddress(spender) ? spender : undefined,
						token: allowedAmount.token,
						amount: 0n,
					})
				}}
			>
				Revoke
			</Button>
		</div>
	)
}

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => {
	return (
		<div className="flex items-center gap-1 text-sm">
			<div className="w-48">{label}</div>
			<div className="font-mono">{value}</div>
		</div>
	)
}

const Index: React.FC = () => {
	const { data: systemInfo } = useSystemInfo()
	return (
		<>
			<Helmet
				title={PAGE_TITLE}
				meta={[
					{
						name: "description",
						content: PAGE_DESCRIPTION,
					},
				]}
			/>
			<Layout className="gap-8">
				<DevModeAuthGuard>
					<Container className="gap-2">
						<h1 className="text-2xl font-semibold">App info</h1>
						<div className="flex w-full flex-col gap-1 text-sm">
							<div className="mb-1 text-base">Contract Address:</div>
							<InfoRow label="Factory" value={systemInfo?.contractAddress.factory} />
							<InfoRow label="Quoter" value={systemInfo?.contractAddress.quoter} />
							<InfoRow label="Router" value={systemInfo?.contractAddress.router} />
							<div className="mb-1 mt-2 text-base">Limit Order:</div>
							<InfoRow label="Latest block number" value={systemInfo?.limitOrder.latestBlockNumber.toString()} />
							<InfoRow
								label="Latest block timestamp"
								value={
									systemInfo?.limitOrder.latestBlockTimestamp
										? dayjs.unix(systemInfo.limitOrder.latestBlockTimestamp).format("DD MMM YYYY, HH:mm:ss Z")
										: "N/A"
								}
							/>
						</div>
					</Container>
					<Container>
						<h1 className="text-2xl font-semibold">Dev Utils</h1>
						<div className="flex items-center gap-2">
							<Link to="/utils/fee-watcher">
								<Button>Fee Watcher</Button>
							</Link>
							<Link to="/utils/gas-watcher">
								<Button>Gas Watcher</Button>
							</Link>
							<Link to="/utils/wallet-info">
								<Button>Wallet Info</Button>
							</Link>
						</div>
					</Container>
					<Container>
						<DecreaseAllowanceSection />
					</Container>
				</DevModeAuthGuard>
			</Layout>
		</>
	)
}

export default Index
