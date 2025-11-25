import { Helmet } from "react-helmet"

import { Container } from "@rabbitswap/ui/basic"

import { Layout } from "@/components/layout"
import { PhisingWarningBox } from "@/feature/security/phising-warning/PhisingWarningBox"
import { SwapPage } from "@/feature/swap/swap"

const PAGE_TITLE = "Rabbit Swap | Buy, sell, and trade tokens on Viction with Rabbit Swap"
const PAGE_DESCRIPTION = "The primary liquidity center on Viction network."

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
				<Container>
					<SwapPage />
				</Container>
				<PhisingWarningBox />
			</Layout>
		</>
	)
}

export default Index
