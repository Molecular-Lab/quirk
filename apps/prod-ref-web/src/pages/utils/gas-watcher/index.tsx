import { Helmet } from "react-helmet"
import { Link } from "react-router-dom"

import { Address } from "viem"
import { viction } from "viem/chains"

import { Button, Container, Separator, Skeleton } from "@rabbitswap/ui/basic"
import { ClipboardCopy } from "@rabbitswap/ui/components"
import { cn, shortenText } from "@rabbitswap/ui/utils"

import { Layout } from "@/components/layout"
import { getExplorerLink } from "@/constants/explorer"
import { VIC } from "@/constants/token"
import { DevModeAuthGuard } from "@/feature/dev/DevModeAuthGuard"
import { useBalance } from "@/hooks/token/useBalance"
import { useGasSponsoredBalance } from "@/hooks/useGasSponsoredBalance"

const PAGE_TITLE = "Rabbit Swap | Gas Watcher"
const PAGE_DESCRIPTION = ""

const GasWatcherListItem: React.FC<{ address: Address; name: string; rowIndex: number }> = ({
	address,
	name,
	rowIndex,
}) => {
	const { data: balance, isLoading } = useGasSponsoredBalance(address)
	return (
		<div className="flex items-center gap-4 px-4 py-3">
			<div className="w-6 text-right text-sm tabular-nums">{rowIndex}</div>
			<div className="flex w-32 items-center gap-2">
				<Link
					to={getExplorerLink(viction.id, address, "address")}
					target="_blank"
					className="leading-none hover:underline"
				>
					{shortenText({ text: address })}
				</Link>
				<ClipboardCopy text={address} className="size-4" />
			</div>
			<div className="w-56">{name}</div>
			<Skeleton
				isLoading={isLoading}
				width={220}
				className={cn(
					"w-full flex-1 grow",
					"text-right tabular-nums",
					balance?.bigNumber.lt(2) && "text-warning-darken",
					balance?.bigNumber.lt(1) && "text-error-darken",
				)}
			>
				{balance?.toFixed()} {balance?.token.symbol}
			</Skeleton>
		</div>
	)
}

const WalletWatcherListItem: React.FC<{ address: Address; name: string; rowIndex: number }> = ({
	address,
	name,
	rowIndex,
}) => {
	const { data: balance, isLoading } = useBalance({ walletAddress: address, token: VIC })
	return (
		<div className="flex items-center gap-4 px-4 py-3">
			<div className="w-6 text-right text-sm tabular-nums">{rowIndex}</div>
			<div className="flex w-32 items-center gap-2">
				<Link
					to={getExplorerLink(viction.id, address, "address")}
					target="_blank"
					className="leading-none hover:underline"
				>
					{shortenText({ text: address })}
				</Link>
				<ClipboardCopy text={address} className="size-4" />
			</div>
			<div className="w-56">{name}</div>
			<Skeleton
				isLoading={isLoading}
				width={220}
				className={cn(
					"w-full flex-1 grow",
					"text-right tabular-nums",
					balance?.bigNumber.lt(2) && "text-warning-darken",
					balance?.bigNumber.lt(1) && "text-error-darken",
				)}
			>
				{balance?.toFixed()} {balance?.token.symbol}
			</Skeleton>
		</div>
	)
}

// get added list from https://www.vicscan.xyz/address/0x8c0faeb5c6bed2129b8674f262fd45c4e9468bee
const WATCHING_CONTRACTS = [
	{ address: "0xbF73c6E53965C3f34020D58cfe85D027Fe375C96", name: "position manager" },
	{ address: "0x71eBF8972459B01A50cca14Ed351CF34213Ed742", name: "router" },
	{ address: "0x69B946132B4a6C74cd29Ba3ff614cEEA1eF9fF2B", name: "$USDT" },
	{ address: "0x2C664910222BE7b7e203753C59A9667cBe282828", name: "$RABBIT" },
	{ address: "0x0CA98Da6dc9Ba8Ac1FFFBCb07E18cb965C641B86", name: "rabbit limit order (prod)" },
	{ address: "0xe8D1f4bf02aC794c18EBF3C5260d7385961D4d8B", name: "starbase order (prod)" },
] as const

const ORACLE_PUBLISHER_ADDRESS = "0x00000D03362154876c308425B75ee43C59343a94"

const Index: React.FC = () => {
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
			<Layout>
				<DevModeAuthGuard>
					<Container className="lg:max-w-[auto]">
						<h1 className="mb-6 text-xl font-semibold lg:text-2xl">Gas Sponsored Watcher</h1>
						<Link
							to="https://www.vicscan.xyz/address/0x8c0faeb5c6bed2129b8674f262fd45c4e9468bee"
							target="_blank"
							className="mb-6"
						>
							<Button>Read/Write gas sponsored registration on Vicscan</Button>
						</Link>
						<div className="flex flex-col divide-y divide-gray-200 border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
							{WATCHING_CONTRACTS.map((contract, index) => {
								return (
									<GasWatcherListItem
										address={contract.address}
										name={contract.name}
										key={contract.address}
										rowIndex={index + 1}
									/>
								)
							})}
						</div>
					</Container>
					<Container className="mt-6 lg:max-w-[auto]">
						<Separator className="my-6" />
						<h1 className="mb-6 text-xl font-semibold lg:text-2xl">Oracle publisher watcher</h1>
						<Link
							to="https://www.vicscan.xyz/address/0xA2aa501b19aff244D90cc15a4Cf739D2725B5729"
							target="_blank"
							className="mb-6"
						>
							<Button>Check Oracle Status on Vicscan</Button>
						</Link>
						<div className="flex flex-col divide-y divide-gray-200 border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
							<WalletWatcherListItem
								key={ORACLE_PUBLISHER_ADDRESS}
								address={ORACLE_PUBLISHER_ADDRESS}
								name="oracle publisher"
								rowIndex={1}
							/>
						</div>
					</Container>
				</DevModeAuthGuard>
			</Layout>
		</>
	)
}

export default Index
