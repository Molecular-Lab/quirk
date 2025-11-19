import { Helmet } from "react-helmet"

import { Container } from "@rabbitswap/ui/basic"

import { Layout } from "@/components/layout"
import { AddLiquidityPage } from "@/feature/liquidity/add"
import { MainAccountGuard } from "@/feature/sub-account/components/MainAccountGuard"
import { useParams } from "@/router"

const PAGE_TITLE = "Add liquidity to pools on Rabbit Swap"
const PAGE_DESCRIPTION = "Earn fees when others swap on Rabbit Swap by adding tokens to liquidity pools"

const Index: React.FC = () => {
	const { tokenId } = useParams("/add/:currencyIdA/:currencyIdB/:feeAmount/:tokenId")
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
				<MainAccountGuard>
					<Container className="lg:max-w-[1128px]">
						<AddLiquidityPage tokenId={tokenId} />
					</Container>
				</MainAccountGuard>
			</Layout>
		</>
	)
}

export default Index
