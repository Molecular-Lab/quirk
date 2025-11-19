import { Helmet } from "react-helmet"

import { Container } from "@rabbitswap/ui/basic"

import { Layout } from "@/components/layout"
import { ExplorePage } from "@/feature/explore/list"

const PAGE_TITLE = "Rabbit Swap | Seamlessly trade crypto assets on Viction!"
const PAGE_DESCRIPTION = "The primary liquidity center on Viction network"

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
				<Container className="lg:max-w-[960px]">
					<ExplorePage />
				</Container>
			</Layout>
		</>
	)
}

export default Index
