import { Sql } from "postgres";

export const createDemoRequestQuery = `-- name: CreateDemoRequest :one
INSERT INTO demo_requests (
  first_name,
  last_name,
  email,
  company_name,
  country,
  company_size,
  capital_volume,
  industry
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING id, first_name, last_name, email, company_name, country, company_size, capital_volume, industry, status, notes, created_at, updated_at`;

export interface CreateDemoRequestArgs {
    firstName: string;
    lastName: string;
    email: string;
    companyName: string;
    country: string;
    companySize: string;
    capitalVolume: string;
    industry: string;
}

export interface CreateDemoRequestRow {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    companyName: string;
    country: string;
    companySize: string;
    capitalVolume: string;
    industry: string;
    status: string;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function createDemoRequest(sql: Sql, args: CreateDemoRequestArgs): Promise<CreateDemoRequestRow | null> {
    const rows = await sql.unsafe(createDemoRequestQuery, [args.firstName, args.lastName, args.email, args.companyName, args.country, args.companySize, args.capitalVolume, args.industry]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        firstName: row[1],
        lastName: row[2],
        email: row[3],
        companyName: row[4],
        country: row[5],
        companySize: row[6],
        capitalVolume: row[7],
        industry: row[8],
        status: row[9],
        notes: row[10],
        createdAt: row[11],
        updatedAt: row[12]
    };
}

export const getDemoRequestByEmailQuery = `-- name: GetDemoRequestByEmail :one
SELECT id, first_name, last_name, email, company_name, country, company_size, capital_volume, industry, status, notes, created_at, updated_at FROM demo_requests
WHERE email = $1
ORDER BY created_at DESC
LIMIT 1`;

export interface GetDemoRequestByEmailArgs {
    email: string;
}

export interface GetDemoRequestByEmailRow {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    companyName: string;
    country: string;
    companySize: string;
    capitalVolume: string;
    industry: string;
    status: string;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function getDemoRequestByEmail(sql: Sql, args: GetDemoRequestByEmailArgs): Promise<GetDemoRequestByEmailRow | null> {
    const rows = await sql.unsafe(getDemoRequestByEmailQuery, [args.email]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        firstName: row[1],
        lastName: row[2],
        email: row[3],
        companyName: row[4],
        country: row[5],
        companySize: row[6],
        capitalVolume: row[7],
        industry: row[8],
        status: row[9],
        notes: row[10],
        createdAt: row[11],
        updatedAt: row[12]
    };
}

export const listDemoRequestsQuery = `-- name: ListDemoRequests :many
SELECT id, first_name, last_name, email, company_name, country, company_size, capital_volume, industry, status, notes, created_at, updated_at FROM demo_requests
ORDER BY created_at DESC
LIMIT $1 OFFSET $2`;

export interface ListDemoRequestsArgs {
    limit: string;
    offset: string;
}

export interface ListDemoRequestsRow {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    companyName: string;
    country: string;
    companySize: string;
    capitalVolume: string;
    industry: string;
    status: string;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function listDemoRequests(sql: Sql, args: ListDemoRequestsArgs): Promise<ListDemoRequestsRow[]> {
    return (await sql.unsafe(listDemoRequestsQuery, [args.limit, args.offset]).values()).map(row => ({
        id: row[0],
        firstName: row[1],
        lastName: row[2],
        email: row[3],
        companyName: row[4],
        country: row[5],
        companySize: row[6],
        capitalVolume: row[7],
        industry: row[8],
        status: row[9],
        notes: row[10],
        createdAt: row[11],
        updatedAt: row[12]
    }));
}

export const countDemoRequestsQuery = `-- name: CountDemoRequests :one
SELECT COUNT(*) FROM demo_requests`;

export interface CountDemoRequestsRow {
    count: string;
}

export async function countDemoRequests(sql: Sql): Promise<CountDemoRequestsRow | null> {
    const rows = await sql.unsafe(countDemoRequestsQuery, []).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        count: row[0]
    };
}

export const getDemoRequestByIdQuery = `-- name: GetDemoRequestById :one
SELECT id, first_name, last_name, email, company_name, country, company_size, capital_volume, industry, status, notes, created_at, updated_at FROM demo_requests
WHERE id = $1
LIMIT 1`;

export interface GetDemoRequestByIdArgs {
    id: string;
}

export interface GetDemoRequestByIdRow {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    companyName: string;
    country: string;
    companySize: string;
    capitalVolume: string;
    industry: string;
    status: string;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function getDemoRequestById(sql: Sql, args: GetDemoRequestByIdArgs): Promise<GetDemoRequestByIdRow | null> {
    const rows = await sql.unsafe(getDemoRequestByIdQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        firstName: row[1],
        lastName: row[2],
        email: row[3],
        companyName: row[4],
        country: row[5],
        companySize: row[6],
        capitalVolume: row[7],
        industry: row[8],
        status: row[9],
        notes: row[10],
        createdAt: row[11],
        updatedAt: row[12]
    };
}

