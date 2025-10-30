import { Sql } from "postgres";

export const createUserQuery = `-- name: CreateUser :one
INSERT INTO users (wallet_address, name, email)
VALUES ($1, $2, $3)
RETURNING id, wallet_address, name, email`;

export interface CreateUserArgs {
    walletAddress: string;
    name: string;
    email: string;
}

export interface CreateUserRow {
    id: string;
    walletAddress: string;
    name: string;
    email: string;
}

export async function createUser(sql: Sql, args: CreateUserArgs): Promise<CreateUserRow | null> {
    const rows = await sql.unsafe(createUserQuery, [args.walletAddress, args.name, args.email]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        walletAddress: row[1],
        name: row[2],
        email: row[3]
    };
}

export const getUserByWalletQuery = `-- name: GetUserByWallet :one
SELECT id, wallet_address, name, email FROM users
WHERE wallet_address = $1`;

export interface GetUserByWalletArgs {
    walletAddress: string;
}

export interface GetUserByWalletRow {
    id: string;
    walletAddress: string;
    name: string;
    email: string;
}

export async function getUserByWallet(sql: Sql, args: GetUserByWalletArgs): Promise<GetUserByWalletRow | null> {
    const rows = await sql.unsafe(getUserByWalletQuery, [args.walletAddress]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        walletAddress: row[1],
        name: row[2],
        email: row[3]
    };
}

export const getUsersQuery = `-- name: GetUsers :many
SELECT id, wallet_address, name, email FROM users`;

export interface GetUsersRow {
    id: string;
    walletAddress: string;
    name: string;
    email: string;
}

export async function getUsers(sql: Sql): Promise<GetUsersRow[]> {
    return (await sql.unsafe(getUsersQuery, []).values()).map(row => ({
        id: row[0],
        walletAddress: row[1],
        name: row[2],
        email: row[3]
    }));
}

export const updateUserByAddressQuery = `-- name: UpdateUserByAddress :one
UPDATE users
SET name = $2
WHERE wallet_address = $1
RETURNING id, wallet_address, name, email`;

export interface UpdateUserByAddressArgs {
    walletAddress: string;
    name: string;
}

export interface UpdateUserByAddressRow {
    id: string;
    walletAddress: string;
    name: string;
    email: string;
}

export async function updateUserByAddress(sql: Sql, args: UpdateUserByAddressArgs): Promise<UpdateUserByAddressRow | null> {
    const rows = await sql.unsafe(updateUserByAddressQuery, [args.walletAddress, args.name]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        walletAddress: row[1],
        name: row[2],
        email: row[3]
    };
}

export const deleteUserByAddressQuery = `-- name: DeleteUserByAddress :execrows
DELETE FROM users
WHERE wallet_address = $1`;

export interface DeleteUserByAddressArgs {
    walletAddress: string;
}

export const deleteUserByIdQuery = `-- name: DeleteUserById :execrows
DELETE FROM users
WHERE id = $1`;

export interface DeleteUserByIdArgs {
    id: string;
}

