import { Error } from "@/components/Error/Error"
import { Layout } from "@/components/layout"

export const Fallback: React.FC = () => {
	return (
		<div className="bg-background text-gray-950 dark:bg-background-dark dark:text-rabbit-white">
			<Layout showIconOnly>
				<Error title="Something went wrong" code={500} rabbitSrc="/images/rabbit-500.svg">
					This is unexpected. Please refresh this page or try again later.
				</Error>
			</Layout>
		</div>
	)
}
