import { Helmet } from "react-helmet"

import { Container } from "@rabbitswap/ui/basic"

import { Layout } from "@/components/layout"
import { LiquidityListPage } from "@/feature/liquidity/list"
import { MainAccountGuard } from "@/feature/sub-account/components/MainAccountGuard"

const PAGE_TITLE = "Manage pool liquidity on Rabbit Swap"
const PAGE_DESCRIPTION = "View your active liquidity positions. Add new positions."

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
					<Container>
						<LiquidityListPage />
					</Container>
				</MainAccountGuard>
			</Layout>
		</>
	)
}

export default Index
