import { Sql } from "postgres";

export const getPrivyAccountByOrgIdQuery = `-- name: GetPrivyAccountByOrgId :one

SELECT id, privy_organization_id, privy_wallet_address, privy_email, wallet_type, created_at, updated_at FROM privy_accounts
WHERE privy_organization_id = $1
LIMIT 1`;

export interface GetPrivyAccountByOrgIdArgs {
    privyOrganizationId: string;
}

export interface GetPrivyAccountByOrgIdRow {
    id: string;
    privyOrganizationId: string;
    privyWalletAddress: string;
    privyEmail: string | null;
    walletType: string;
    createdAt: Date;
    updatedAt: Date;
}

export async function getPrivyAccountByOrgId(sql: Sql, args: GetPrivyAccountByOrgIdArgs): Promise<GetPrivyAccountByOrgIdRow | null> {
    const rows = await sql.unsafe(getPrivyAccountByOrgIdQuery, [args.privyOrganizationId]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        privyOrganizationId: row[1],
        privyWalletAddress: row[2],
        privyEmail: row[3],
        walletType: row[4],
        createdAt: row[5],
        updatedAt: row[6]
    };
}

export const getPrivyAccountByIdQuery = `-- name: GetPrivyAccountById :one
SELECT id, privy_organization_id, privy_wallet_address, privy_email, wallet_type, created_at, updated_at FROM privy_accounts
WHERE id = $1
LIMIT 1`;

export interface GetPrivyAccountByIdArgs {
    id: string;
}

export interface GetPrivyAccountByIdRow {
    id: string;
    privyOrganizationId: string;
    privyWalletAddress: string;
    privyEmail: string | null;
    walletType: string;
    createdAt: Date;
    updatedAt: Date;
}

export async function getPrivyAccountById(sql: Sql, args: GetPrivyAccountByIdArgs): Promise<GetPrivyAccountByIdRow | null> {
    const rows = await sql.unsafe(getPrivyAccountByIdQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        privyOrganizationId: row[1],
        privyWalletAddress: row[2],
        privyEmail: row[3],
        walletType: row[4],
        createdAt: row[5],
        updatedAt: row[6]
    };
}

export const createPrivyAccountQuery = `-- name: CreatePrivyAccount :one
INSERT INTO privy_accounts (
    privy_organization_id,
    privy_wallet_address,
    privy_email,
    wallet_type
) VALUES ($1, $2, $3, $4)
RETURNING id, privy_organization_id, privy_wallet_address, privy_email, wallet_type, created_at, updated_at`;

export interface CreatePrivyAccountArgs {
    privyOrganizationId: string;
    privyWalletAddress: string;
    privyEmail: string | null;
    walletType: string;
}

export interface CreatePrivyAccountRow {
    id: string;
    privyOrganizationId: string;
    privyWalletAddress: string;
    privyEmail: string | null;
    walletType: string;
    createdAt: Date;
    updatedAt: Date;
}

export async function createPrivyAccount(sql: Sql, args: CreatePrivyAccountArgs): Promise<CreatePrivyAccountRow | null> {
    const rows = await sql.unsafe(createPrivyAccountQuery, [args.privyOrganizationId, args.privyWalletAddress, args.privyEmail, args.walletType]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        privyOrganizationId: row[1],
        privyWalletAddress: row[2],
        privyEmail: row[3],
        walletType: row[4],
        createdAt: row[5],
        updatedAt: row[6]
    };
}

export const getOrCreatePrivyAccountQuery = `-- name: GetOrCreatePrivyAccount :one
INSERT INTO privy_accounts (
    privy_organization_id,
    privy_wallet_address,
    privy_email,
    wallet_type
) VALUES ($1, $2, $3, $4)
ON CONFLICT (privy_organization_id)
DO UPDATE SET
    updated_at = now(),
    privy_wallet_address = EXCLUDED.privy_wallet_address,
    privy_email = COALESCE(EXCLUDED.privy_email, privy_accounts.privy_email),
    wallet_type = EXCLUDED.wallet_type
RETURNING id, privy_organization_id, privy_wallet_address, privy_email, wallet_type, created_at, updated_at`;

export interface GetOrCreatePrivyAccountArgs {
    privyOrganizationId: string;
    privyWalletAddress: string;
    privyEmail: string | null;
    walletType: string;
}

export interface GetOrCreatePrivyAccountRow {
    id: string;
    privyOrganizationId: string;
    privyWalletAddress: string;
    privyEmail: string | null;
    walletType: string;
    createdAt: Date;
    updatedAt: Date;
}

export async function getOrCreatePrivyAccount(sql: Sql, args: GetOrCreatePrivyAccountArgs): Promise<GetOrCreatePrivyAccountRow | null> {
    const rows = await sql.unsafe(getOrCreatePrivyAccountQuery, [args.privyOrganizationId, args.privyWalletAddress, args.privyEmail, args.walletType]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        privyOrganizationId: row[1],
        privyWalletAddress: row[2],
        privyEmail: row[3],
        walletType: row[4],
        createdAt: row[5],
        updatedAt: row[6]
    };
}

export const updatePrivyAccountEmailQuery = `-- name: UpdatePrivyAccountEmail :one
UPDATE privy_accounts
SET
    privy_email = $2,
    updated_at = now()
WHERE privy_organization_id = $1
RETURNING id, privy_organization_id, privy_wallet_address, privy_email, wallet_type, created_at, updated_at`;

export interface UpdatePrivyAccountEmailArgs {
    privyOrganizationId: string;
    privyEmail: string | null;
}

export interface UpdatePrivyAccountEmailRow {
    id: string;
    privyOrganizationId: string;
    privyWalletAddress: string;
    privyEmail: string | null;
    walletType: string;
    createdAt: Date;
    updatedAt: Date;
}

export async function updatePrivyAccountEmail(sql: Sql, args: UpdatePrivyAccountEmailArgs): Promise<UpdatePrivyAccountEmailRow | null> {
    const rows = await sql.unsafe(updatePrivyAccountEmailQuery, [args.privyOrganizationId, args.privyEmail]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        privyOrganizationId: row[1],
        privyWalletAddress: row[2],
        privyEmail: row[3],
        walletType: row[4],
        createdAt: row[5],
        updatedAt: row[6]
    };
}

export const listAllPrivyAccountsQuery = `-- name: ListAllPrivyAccounts :many
SELECT id, privy_organization_id, privy_wallet_address, privy_email, wallet_type, created_at, updated_at FROM privy_accounts
ORDER BY created_at DESC`;

export interface ListAllPrivyAccountsRow {
    id: string;
    privyOrganizationId: string;
    privyWalletAddress: string;
    privyEmail: string | null;
    walletType: string;
    createdAt: Date;
    updatedAt: Date;
}

export async function listAllPrivyAccounts(sql: Sql): Promise<ListAllPrivyAccountsRow[]> {
    return (await sql.unsafe(listAllPrivyAccountsQuery, []).values()).map(row => ({
        id: row[0],
        privyOrganizationId: row[1],
        privyWalletAddress: row[2],
        privyEmail: row[3],
        walletType: row[4],
        createdAt: row[5],
        updatedAt: row[6]
    }));
}

