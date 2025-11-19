import { LimitOrderFailed } from "./LimitOrderFailed"
import { LimitOrderPending } from "./LimitOrderPending"
import { LimitOrderSubmit } from "./LimitOrderSubmit"
import { LimitOrderSuccess } from "./LimitOrderSuccess"

export const LimitOrderProcess = {
	Submit: LimitOrderSubmit,
	Pending: LimitOrderPending,
	Success: LimitOrderSuccess,
	Failed: LimitOrderFailed,
}
