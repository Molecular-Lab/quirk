import { useEffect } from "react"
import { Helmet } from "react-helmet"

import { useNavigate } from "@/router"

const PAGE_TITLE = "Rabbit Swap | Seamlessly trade crypto assets on Viction!"
const PAGE_DESCRIPTION = "The primary liquidity center on Viction network"

const Index: React.FC = () => {
	const navigate = useNavigate()
	useEffect(() => {
		void navigate("/swap", { replace: true })
	}, [navigate])

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
		</>
	)
}

export default Index
