/**
 * Common DTOs and Response Types
 */

import { z } from "zod";

// ============================================
// COMMON RESPONSE DTOs
// ============================================

export const SuccessResponseDto = z.object({
	message: z.string(),
});

export const ErrorResponseDto = z.object({
	error: z.string(),
	details: z.string().optional(),
});

export const PaginationDto = z.object({
	limit: z.number().default(20),
	offset: z.number().default(0),
	total: z.number().optional(),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type SuccessResponseDto = z.infer<typeof SuccessResponseDto>;
export type ErrorResponseDto = z.infer<typeof ErrorResponseDto>;
export type PaginationDto = z.infer<typeof PaginationDto>;
