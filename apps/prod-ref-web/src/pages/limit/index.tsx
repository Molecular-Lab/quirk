import { Helmet } from "react-helmet"

import { Container } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { Layout } from "@/components/layout"
import { LimitPage } from "@/feature/swap/limit"

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
				<Container className={cn("lg:max-w-auto lg:px-3 xl:max-w-[1208px]", "-mt-5 sm:-mt-5 md:-mt-3")}>
					<LimitPage />
				</Container>
			</Layout>
		</>
	)
}

export default Index
