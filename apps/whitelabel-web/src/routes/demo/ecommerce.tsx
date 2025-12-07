import { createFileRoute } from "@tanstack/react-router"

import { DemoWrapper } from "@/feature/demo/DemoWrapper"

export const Route = createFileRoute("/demo/ecommerce")({
	component: () => <DemoWrapper visualizationType="ecommerce" />,
})
