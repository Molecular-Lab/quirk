import { Helmet } from "react-helmet"

import { Container } from "@rabbitswap/ui/basic"

import { Layout } from "@/components/layout"
import { CreatePositionPage } from "@/feature/liquidity/add"
import { MainAccountGuard } from "@/feature/sub-account/components/MainAccountGuard"
import { useParams } from "@/router"

const PAGE_TITLE = "Add liquidity to pools on Rabbit Swap"
const PAGE_DESCRIPTION = "Earn fees when others swap on Rabbit Swap by adding tokens to liquidity pools"

const Index: React.FC = () => {
	const { currencyIdA, currencyIdB, feeAmount } = useParams("/add/:currencyIdA/:currencyIdB/:feeAmount")
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
						<CreatePositionPage currencyIdA={currencyIdA} currencyIdB={currencyIdB} feeAmount={feeAmount} />
					</Container>
				</MainAccountGuard>
			</Layout>
		</>
	)
}

export default Index
