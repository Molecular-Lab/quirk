import { useState } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@rabbitswap/ui/basic"

import { ProtocolStats } from "@/feature/explore/list/ProtocolStats"

import { SearchButton } from "./components/SearchButton"
import { PoolTable } from "./PoolTable"
import { TokenTable } from "./TokenTable"
import { VolumeChartSection } from "./VolumeChartSection"

type TabValue = "tokens" | "pools"

interface ExplorePageProps {
	initTab?: TabValue
}

const tabs = [
	{ title: "Tokens", value: "tokens", component: TokenTable },
	{ title: "Pools", value: "pools", component: PoolTable },
] as const

export const ExplorePage: React.FC<ExplorePageProps> = ({ initTab = "tokens" }) => {
	const [search, setSearch] = useState("")
	const [tab, setTab] = useState<TabValue>(initTab)
	return (
		<>
			<div className="mb-6 flex w-full gap-x-5 md:gap-x-7 lg:gap-x-10">
				<ProtocolStats />
				<VolumeChartSection />
			</div>
			<Tabs
				defaultValue={initTab}
				value={tab}
				onValueChange={(value) => {
					setTab(value as TabValue)
				}}
				className="flex w-full flex-col"
			>
				<div className="flex items-center justify-between">
					<TabsList className="flex gap-8">
						{tabs.map((item, i) => (
							<TabsTrigger key={i} value={item.value} className="text-xl lg:text-2xl">
								{item.title}
							</TabsTrigger>
						))}
					</TabsList>
					<div className="flex items-center justify-end gap-2 sm:gap-3">
						{/* Chain */}
						{tab === "tokens" && (
							<div className="flex items-center gap-2 rounded-full px-1">
								<img src="/logo/viction-logo.png" className="size-6 rounded-full" />
								<div className="hidden text-sm text-gray-500 sm:block">Viction</div>
							</div>
						)}

						{/* Search */}
						<SearchButton value={search} onChange={setSearch} label={tab} />
					</div>
				</div>
				{tabs.map((item, i) => (
					<TabsContent className="flex-1 lg:mt-6" value={item.value} key={i}>
						{<item.component search={search} />}
					</TabsContent>
				))}
			</Tabs>
		</>
	)
}
