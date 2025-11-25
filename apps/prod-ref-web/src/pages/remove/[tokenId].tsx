import { useEffect, useMemo } from "react"
import { Helmet } from "react-helmet"

import { BigNumber } from "@ethersproject/bignumber"

import { Container } from "@rabbitswap/ui/basic"

import { Layout } from "@/components/layout"
import { RemoveLiquidityPage } from "@/feature/liquidity/remove"
import { useNavigate, useParams } from "@/router"

const PAGE_TITLE = "Remove pool liquidity on Rabbit Swap"
const PAGE_DESCRIPTION = "Remove your tokens from v3 liquidity pools"

const Index: React.FC = () => {
	const { tokenId } = useParams("/remove/:tokenId")
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
				<Container>
					<RemoveLiquidityPage tokenId={parsedTokenId} />
				</Container>
			</Layout>
		</>
	)
}

export default Index
