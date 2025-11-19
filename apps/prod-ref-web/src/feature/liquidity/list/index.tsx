import { useLocalStorage } from "localstore"

import { Button, Header } from "@rabbitswap/ui/basic"

import { usePositionList } from "@/feature/liquidity/list/hooks/usePositionList"
import { useAccount } from "@/hooks/useAccount"
import { useNavigate } from "@/router"

import { PositionList } from "./components"

export const LiquidityListPage: React.FC = () => {
	const navigate = useNavigate()
	const { address } = useAccount()

	const [hideClosed, setHideClosed] = useLocalStorage("hide-closed-positions", false)
	const { displayPositionList, isLoading } = usePositionList(address, { hideClosed })

	return (
		<div className="flex w-full flex-col gap-5">
			<div className="mb-2 flex w-full flex-col justify-between gap-3 sm:flex-row">
				<div className="flex items-center gap-3">
					<Header>Positions</Header>
					<div className="flex h-6 w-12 items-center justify-center rounded-full bg-gray-50 px-3 py-2 text-sm leading-none dark:bg-gray-900">
						V3
					</div>
				</div>
				<Button
					onClick={() => {
						void navigate("/add")
					}}
				>
					+ New Position
				</Button>
			</div>

			{/* Position List */}
			<PositionList
				loading={isLoading}
				positions={displayPositionList}
				hideClosed={hideClosed}
				toggleHideClosed={() => {
					setHideClosed((prev) => !prev)
				}}
			/>
		</div>
	)
}
