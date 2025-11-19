import { useEffect, useMemo } from "react"
import { Helmet } from "react-helmet"

import { BigNumber } from "@ethersproject/bignumber"

import { Container } from "@rabbitswap/ui/basic"

import { Layout } from "@/components/layout"
import { LiquidityDetailPage } from "@/feature/liquidity/detail"
import { MainAccountGuard } from "@/feature/sub-account/components/MainAccountGuard"
import { useNavigate, useParams } from "@/router"

const PAGE_TITLE = "Manage pool liquidity on Rabbit Swap"
const PAGE_DESCRIPTION = "View your active liquidity positions. Add new positions."

const Index: React.FC = () => {
	const { tokenId } = useParams("/pools/:tokenId")
	const navigate = useNavigate()

	const parsedTokenId = useMemo<BigNumber | null>(() => {
		try {
			const t = BigNumber.from(tokenId)
			return t
		} catch {
			return null
		}
	}, [tokenId])

	useEffect(() => {
		if (!parsedTokenId || parsedTokenId.eq(0)) {
			void navigate("/pools", { replace: true })
		}
	}, [navigate, parsedTokenId])

	if (!parsedTokenId) {
		return <></>
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
				<MainAccountGuard>
					<Container className="lg:max-w-[1008px] lg:px-10">
						<LiquidityDetailPage tokenId={parsedTokenId} />
					</Container>
				</MainAccountGuard>
			</Layout>
		</>
	)
}

export default Index
