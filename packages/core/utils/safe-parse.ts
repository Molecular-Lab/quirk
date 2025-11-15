import { z } from "zod"
import VError from "verror"

/**
 * Safe Parse Result (Success)
 */
export interface SafeParseSuccess<T> {
	success: true
	result: T
}

/**
 * Safe Parse Result (Error)
 */
export interface SafeParseError {
	success: false
	error: Error
}

/**
 * Safe Parse Result Union
 */
export type SafeParseResult<T> = SafeParseSuccess<T> | SafeParseError

/**
 * Safely parse and validate data against a Zod schema
 * @param schema Zod schema to validate against
 * @param data Data to parse
 * @returns Safe parse result (success or error)
 */
export function safeParse<T extends z.ZodType>(schema: T, data: unknown): SafeParseResult<z.infer<T>> {
	try {
		const result = schema.safeParse(data)

		if (!result.success) {
			const errorMessage = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")

			return {
				success: false,
				error: new VError(
					{
						info: {
							errors: result.error.errors,
							data,
						},
					},
					`Validation failed: ${errorMessage}`,
				),
			}
		}

		return {
			success: true,
			result: result.data,
		}
	} catch (error) {
		return {
			success: false,
			error: new VError(
				{
					cause: error as Error,
					info: { data },
				},
				"Unexpected error during validation",
			),
		}
	}
}
