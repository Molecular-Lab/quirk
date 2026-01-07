/**
 * Demo Request DTOs
 * Type-safe validation schemas for demo request operations
 */

import { z } from "zod"

// ============================================
// REQUEST DTOs
// ============================================

export const CreateDemoRequestDto = z.object({
	firstName: z.string().min(1, "First name is required").max(100),
	lastName: z.string().min(1, "Last name is required").max(100),
	email: z.string().email("Invalid email format").max(255),
	companyName: z.string().min(1, "Company name is required").max(255),
	country: z.string().min(1, "Country is required").max(100),
	companySize: z.enum(["1-10", "11-50", "51-200", "201-1000", "1000+"]),
	capitalVolume: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid capital volume format"),
	industry: z.enum(["FinTech", "E-commerce", "Gaming", "Healthcare", "Education", "Other"]),
})

// ============================================
// RESPONSE DTOs
// ============================================

export const DemoRequestDto = z.object({
	id: z.string().uuid(),
	firstName: z.string(),
	lastName: z.string(),
	email: z.string(),
	companyName: z.string(),
	country: z.string(),
	companySize: z.string(),
	capitalVolume: z.string(),
	industry: z.string(),
	status: z.string(),
	notes: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
})

export const DemoRequestListDto = z.object({
	data: z.array(DemoRequestDto),
	pagination: z.object({
		page: z.number(),
		limit: z.number(),
		total: z.number(),
	}),
})

// ============================================
// TYPE EXPORTS
// ============================================

export type CreateDemoRequestDto = z.infer<typeof CreateDemoRequestDto>
export type DemoRequestDto = z.infer<typeof DemoRequestDto>
export type DemoRequestListDto = z.infer<typeof DemoRequestListDto>
