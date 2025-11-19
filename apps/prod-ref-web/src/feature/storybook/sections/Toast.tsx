import { zeroAddress, zeroHash } from "viem"

import { Button, useToaster } from "@rabbitswap/ui/basic"

import { CUSD_VICTION, VIC } from "@/constants/token"
import { useTxToast } from "@/hooks/useTxToast"
import { Transaction } from "@/types/transaction"

export const SectionToast: React.FC = () => {
	const txToast = useTxToast()
	const { showPreset } = useToaster()

	const content = {
		title: "Success",
		description: "This is a success toast",
	}

	return (
		<>
			<div>Preset</div>
			<div className="flex gap-2 [&>*]:grow">
				<Button
					onClick={() => {
						showPreset.success(content)
					}}
					className="bg-success hover:bg-success-hover"
				>
					Success
				</Button>
				<Button
					onClick={() => {
						showPreset.error(content)
					}}
					buttonColor="danger"
				>
					Error
				</Button>
				<Button
					onClick={() => {
						showPreset.info(content)
					}}
				>
					Info
				</Button>
			</div>

			<div>Transaction</div>
			<div className="flex gap-2 [&>*]:grow">
				<Button
					onClick={() => {
						txToast.success({
							title: "Title",
							description: "Description",
							token: [VIC, CUSD_VICTION],
							tx: new Transaction({
								hash: zeroHash,
								chainId: 88,
								address: zeroAddress,
								data: undefined,
							}),
						})
					}}
					className="bg-success hover:bg-success-hover"
				>
					Tx Toast Success
				</Button>
				<Button
					onClick={() => {
						txToast.error({
							title: "Title",
							description: "Description",
							token: [VIC, CUSD_VICTION],
							tx: new Transaction({
								hash: zeroHash,
								chainId: 88,
								address: zeroAddress,
								data: undefined,
							}),
						})
					}}
					buttonColor="danger"
				>
					Tx Toast Error
				</Button>
				<Button
					onClick={() => {
						txToast.success({
							title: "Title",
							description: "Description",
							token: CUSD_VICTION,
							tx: new Transaction({
								hash: zeroHash,
								chainId: 88,
								address: zeroAddress,
								data: undefined,
							}),
							showChainIcon: true,
						})
					}}
					className="bg-success hover:bg-success-hover"
				>
					Tx Toast Success with Chain icon
				</Button>
			</div>
		</>
	)
}
