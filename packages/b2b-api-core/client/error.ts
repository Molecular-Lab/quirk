/**
 * API Error class for B2B API
 */

export class APIError extends Error {
	constructor(
		public status: number,
		message: string
	) {
		super(message);
		this.name = "APIError";
	}
}
