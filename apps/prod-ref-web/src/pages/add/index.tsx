import { Helmet } from "react-helmet"

import { Container } from "@rabbitswap/ui/basic"

import { Layout } from "@/components/layout"
import { CreatePositionPage } from "@/feature/liquidity/add"
import { MainAccountGuard } from "@/feature/sub-account/components/MainAccountGuard"

const PAGE_TITLE = "Add liquidity to pools on Rabbit Swap"
const PAGE_DESCRIPTION = "Earn fees when others swap on Rabbit Swap by adding tokens to liquidity pools"

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
				<MainAccountGuard>
					<Container className="lg:max-w-[1128px]">
						<CreatePositionPage />
					</Container>
				</MainAccountGuard>
			</Layout>
		</>
	)
}

export default Index
