import { Helmet } from "react-helmet"

import { isAddress } from "viem"

import { Button, Container } from "@rabbitswap/ui/basic"

import { Layout } from "@/components/layout"
import { PoolDetail } from "@/feature/explore/pool"
import { Link, useParams } from "@/router"
import { chainNameToId } from "@/utils/chain"

const PAGE_TITLE = "Rabbit Swap | Seamlessly trade crypto assets on Viction!"
const PAGE_DESCRIPTION = "The primary liquidity center on Viction network"

const Index: React.FC = () => {
	const { chainName, poolAddress } = useParams("/explore/pools/:chainName/:poolAddress")
	const chainId = chainNameToId(chainName)

	if (chainId === undefined || chainId === 0) {
		return (
			<Layout>
				<Container className="gap-6">
					Unknown chain name {chainName}
					<Link to="/explore/pools">
						<Button>Back to Explore</Button>
					</Link>
				</Container>
			</Layout>
		)
	}

	if (!isAddress(poolAddress)) {
		return (
			<Layout>
				<Container className="gap-6">
					Invalid pool address {poolAddress}
					<Link to="/explore/pools">
						<Button>Back to Explore</Button>
					</Link>
				</Container>
			</Layout>
		)
	}

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
				<Container className="pb-16 sm:max-w-[1080px] lg:max-w-[1080px] lg:px-10 lg:pb-0">
					<PoolDetail chainId={chainId} poolAddress={poolAddress} />
				</Container>
			</Layout>
		</>
	)
}

export default Index
