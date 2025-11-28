import { Sql } from "postgres";

export const updateClientBankAccountsQuery = `-- name: UpdateClientBankAccounts :exec

UPDATE client_organizations
SET bank_accounts = $1::jsonb,
    updated_at = now()
WHERE id = $2`;

export interface UpdateClientBankAccountsArgs {
    bankAccounts: any;
    id: string;
}

export async function updateClientBankAccounts(sql: Sql, args: UpdateClientBankAccountsArgs): Promise<void> {
    await sql.unsafe(updateClientBankAccountsQuery, [args.bankAccounts, args.id]);
}

export const getClientBankAccountsQuery = `-- name: GetClientBankAccounts :one
SELECT
  id,
  bank_accounts
FROM client_organizations
WHERE id = $1`;

export interface GetClientBankAccountsArgs {
    id: string;
}

export interface GetClientBankAccountsRow {
    id: string;
    bankAccounts: any | null;
}

export async function getClientBankAccounts(sql: Sql, args: GetClientBankAccountsArgs): Promise<GetClientBankAccountsRow | null> {
    const rows = await sql.unsafe(getClientBankAccountsQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        bankAccounts: row[1]
    };
}

export const updateClientSupportedCurrenciesQuery = `-- name: UpdateClientSupportedCurrencies :exec
UPDATE client_organizations
SET supported_currencies = $2,
    updated_at = now()
WHERE id = $1`;

export interface UpdateClientSupportedCurrenciesArgs {
    id: string;
    supportedCurrencies: string[] | null;
}

export async function updateClientSupportedCurrencies(sql: Sql, args: UpdateClientSupportedCurrenciesArgs): Promise<void> {
    await sql.unsafe(updateClientSupportedCurrenciesQuery, [args.id, args.supportedCurrencies]);
}

export const addSupportedCurrencyQuery = `-- name: AddSupportedCurrency :exec
UPDATE client_organizations
SET supported_currencies = array_append(supported_currencies, $2),
    updated_at = now()
WHERE id = $1
  AND NOT ($2 = ANY(supported_currencies))`;

export interface AddSupportedCurrencyArgs {
    id: string;
    arrayAppend: string;
}

export async function addSupportedCurrency(sql: Sql, args: AddSupportedCurrencyArgs): Promise<void> {
    await sql.unsafe(addSupportedCurrencyQuery, [args.id, args.arrayAppend]);
}

export const removeSupportedCurrencyQuery = `-- name: RemoveSupportedCurrency :exec
UPDATE client_organizations
SET supported_currencies = array_remove(supported_currencies, $2),
    updated_at = now()
WHERE id = $1`;

export interface RemoveSupportedCurrencyArgs {
    id: string;
    arrayRemove: string;
}

export async function removeSupportedCurrency(sql: Sql, args: RemoveSupportedCurrencyArgs): Promise<void> {
    await sql.unsafe(removeSupportedCurrencyQuery, [args.id, args.arrayRemove]);
}

