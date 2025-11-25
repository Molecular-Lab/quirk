import { Helmet } from "react-helmet"

import { Container } from "@rabbitswap/ui/basic"

import { Layout } from "@/components/layout"
import { BridgePage } from "@/feature/bridge"

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
			<Layout showSolanaConnect={true}>
				<Container className="min-h-[calc(100vh-200px)] max-w-[480px] lg:max-w-[480px]">
					<BridgePage />
				</Container>
			</Layout>
		</>
	)
}

export default Index
