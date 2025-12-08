import { createFileRoute } from "@tanstack/react-router"

import { DemoSelectorPage } from "@/feature/demo/selector/DemoSelectorPage"

export const Route = createFileRoute("/demo/")({
	component: DemoSelectorPage,
})
