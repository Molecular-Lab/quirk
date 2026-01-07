/**
 * Demo Request API Helpers
 * Handles communication with the B2B API demo request endpoints
 */

import { b2bApiClient } from "./b2bClient"
import type { CreateDemoRequestDto, DemoRequestDto } from "@quirk/b2b-api-core"

export interface SubmitDemoRequestParams {
	firstName: string
	lastName: string
	email: string
	companyName: string
	country: string
	companySize: "1-10" | "11-50" | "51-200" | "201-1000" | "1000+"
	capitalVolume: string
	industry: "FinTech" | "E-commerce" | "Gaming" | "Healthcare" | "Education" | "Other"
}

export interface DemoRequestResponse {
	id: string
	firstName: string
	lastName: string
	email: string
	companyName: string
	country: string
	companySize: string
	capitalVolume: string
	industry: string
	status: string
	notes: string | null
	createdAt: string
	updatedAt: string
}

/**
 * Submit a new demo request
 * PUBLIC endpoint - no authentication required
 */
export async function submitDemoRequest(data: SubmitDemoRequestParams): Promise<DemoRequestResponse> {
	const { status, body } = await b2bApiClient.demoRequest.create({
		body: data,
	})

	if (status === 201) {
		return body
	}

	if (status === 409) {
		throw new Error(
			"This email has already been submitted within the last 24 hours. Please check your inbox or try again later.",
		)
	}

	if (status === 400) {
		throw new Error(body.error || "Invalid submission. Please check your information.")
	}

	throw new Error("Failed to submit demo request. Please try again.")
}

/**
 * Check if an email has already submitted a demo request
 * Useful for client-side validation
 */
export async function checkDemoRequestByEmail(email: string): Promise<DemoRequestResponse | null> {
	const { status, body } = await b2bApiClient.demoRequest.getByEmail({
		params: { email },
	})

	if (status === 200 && body.found) {
		return body.data
	}

	return null
}
