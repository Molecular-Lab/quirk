import { PropsWithChildren } from "react"

import { Button, Container } from "@rabbitswap/ui/basic"

import { useAccountMode } from "@/feature/sub-account/context"

export const MainAccountGuard: React.FC<PropsWithChildren> = ({ children }) => {
	const { accountMode, setAccountMode } = useAccountMode()

	if (accountMode !== "main") {
		return (
			<Container className="flex flex-col">
				<h1 className="text-base font-semibold lg:text-lg">Feature Unavailable</h1>
				<div className="mb-4 mt-2 text-center text-gray-600 dark:text-gray-400">
					The Portfolio is unavailable for sub-accounts.
					<br /> Please switch to your main wallet to continue.
				</div>
				<Button
					onClick={() => {
						setAccountMode("main")
					}}
				>
					Switch to Main Account
				</Button>
			</Container>
		)
	}

	return children
}
