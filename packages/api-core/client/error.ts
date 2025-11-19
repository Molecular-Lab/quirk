import { ErrorResponse } from "../dto"

export class APIError<T extends string> extends Error {
	name = "APIError"
	isAPIError = true

	private _error: ErrorResponse<T> | undefined = undefined

	constructor(
		public status: number,
		message?: string,
		response?: ErrorResponse<T>,
	) {
		super(message ?? status.toString())
		if (response) this._error = response
	}

	public get errorResponse(): ErrorResponse<T> | undefined {
		return this._error
	}
}

/**
 * Note: Doesn't actually check the error code btw.
 */
export function isAPIError<ErrorCode extends string>(e: unknown): e is APIError<ErrorCode> {
	return e !== null && typeof e === "object" && "isAPIError" in e
}
