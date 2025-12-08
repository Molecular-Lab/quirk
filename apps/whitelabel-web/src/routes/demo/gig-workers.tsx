import { createFileRoute } from "@tanstack/react-router"

import { DemoWrapper } from "@/feature/demo/DemoWrapper"

export const Route = createFileRoute("/demo/gig-workers")({
	component: () => <DemoWrapper visualizationType="gig-workers" />,
})
