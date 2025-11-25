import { PropsWithChildren } from "react"

import { Button, Container } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { RabbitTextBox } from "@/components/Mascot/RabbitTextBox"
import { Redirect } from "@/components/Redirect"
import { Path } from "@/router"

interface ErrorProps extends PropsWithChildren {
	title: string
	code: number
	rabbitSrc?: string
	/**
	 * @default "/"
	 */
	redirectTo?: Path
	/**
	 * @default "Back to Homepage"
	 */
	buttonTitle?: string
}

export const Error: React.FC<ErrorProps> = ({
	title,
	code,
	rabbitSrc,
	redirectTo = "/",
	buttonTitle = "Back to Homepage",
	children,
}) => {
	return (
		<>
			<Container
				className={cn(
					"flex items-center justify-center text-center",
					"-my-7 sm:-my-8 md:-my-10",
					"h-[calc(100vh-56px)] md:h-[calc(100vh-72px)]",
				)}
			>
				<RabbitTextBox rabbitSrc={rabbitSrc}>
					<div className="pb-1 text-[32px] font-semibold leading-10 text-primary-500 md:text-4xl">{code}</div>
					<h1 className="text-xl font-semibold uppercase text-blue-300 md:text-2xl">{title}</h1>
					<p className="pt-3 text-sm md:text-base">{children}</p>
				</RabbitTextBox>
				<Redirect to={redirectTo}>
					<Button className="h-[60px] w-[300px] text-lg font-medium">{buttonTitle}</Button>
				</Redirect>
			</Container>
		</>
	)
}
