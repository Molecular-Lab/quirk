import { Error } from "@/components/Error/Error"

export const SectionError: React.FC = () => {
	return (
		<>
			{/* 500 */}
			<Error title="Something went wrong" code={500} rabbitSrc="/images/rabbit-500.svg">
				This is unexpected. Please refresh this page or try again later.
			</Error>
			{/* 404 */}
			<Error title="Page Not Found" code={404} rabbitSrc="/images/rabbit-404.svg">
				This page doesn&#39;t exist or may have been removed. <wbr />
				Please check the address and try again or return to the homepage.
			</Error>
		</>
	)
}
