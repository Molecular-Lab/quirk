import { APP_ENV } from "@/config/env"

export function getMixpanelEventKey(event: string) {
	if (APP_ENV === "production") {
		return event
	}
	return `dev_${event}`
}

interface MixpanelBaseErrorProperties {
	message: string
	stack: string | undefined
	name: string
	error: string
}

export function getMixpanelErrorProperties(error: Error): MixpanelBaseErrorProperties {
	const baseProperties = {
		message: error.message,
		stack: error.stack,
		name: error.name,
		error: error.toString(),
	}

	return baseProperties
}
