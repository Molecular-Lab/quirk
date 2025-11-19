import ReactDOM from "react-dom/client"

import { Routes } from "@generouted/react-router"
import BigNumber from "bignumber.js"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import mixpanel from "mixpanel-browser"

import { ThemeProvider } from "@rabbitswap/ui/providers"

import { GlobalProvider } from "@/providers/GlobalProvider"

mixpanel.init("97205f65b3890d262cf364233b303230", {
	debug: true,
	track_pageview: true,
	persistence: "localStorage",
})

dayjs.extend(duration)
BigNumber.config({ EXPONENTIAL_AT: 200 })

ReactDOM.createRoot(document.getElementById("app")!).render(
	<ThemeProvider>
		<GlobalProvider>
			<Routes />
		</GlobalProvider>
	</ThemeProvider>,
)
