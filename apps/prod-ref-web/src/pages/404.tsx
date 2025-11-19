import { Error } from "@/components/Error/Error"
import { Layout } from "@/components/layout"

const Index: React.FC = () => {
	return (
		<Layout>
			<Error title="Page Not Found" code={404} rabbitSrc="/images/rabbit-404.svg">
				This page doesn&#39;t exist or may have been removed. <wbr />
				Please check the address and try again or return to the homepage.
			</Error>
		</Layout>
	)
}

export default Index
