import { createFileRoute } from "@tanstack/react-router"
import { PaymentSessionPage } from "@/feature/payment/PaymentSessionPage"

export const Route = createFileRoute("/payment-session/$orderId")({
	component: PaymentSessionPage,
})
