import { createFileRoute } from "@tanstack/react-router"
import { ContactPage } from "@/feature/landing/ContactPage"

export const Route = createFileRoute("/contact")({
	component: ContactPage,
})
