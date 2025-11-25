import { Sql } from "postgres";

export const getProtocolQuery = `-- name: GetProtocol :one

SELECT id, name, chain, address_book, category, risk_level, is_active, created_at, updated_at FROM supported_defi_protocols
WHERE id = $1 LIMIT 1`;

export interface GetProtocolArgs {
    id: string;
}

export interface GetProtocolRow {
    id: string;
    name: string;
    chain: string;
    addressBook: any;
    category: string;
    riskLevel: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export async function getProtocol(sql: Sql, args: GetProtocolArgs): Promise<GetProtocolRow | null> {
    const rows = await sql.unsafe(getProtocolQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        name: row[1],
        chain: row[2],
        addressBook: row[3],
        category: row[4],
        riskLevel: row[5],
        isActive: row[6],
        createdAt: row[7],
        updatedAt: row[8]
    };
}

export const getProtocolByNameQuery = `-- name: GetProtocolByName :one
SELECT id, name, chain, address_book, category, risk_level, is_active, created_at, updated_at FROM supported_defi_protocols
WHERE name = $1
  AND chain = $2
LIMIT 1`;

export interface GetProtocolByNameArgs {
    name: string;
    chain: string;
}

export interface GetProtocolByNameRow {
    id: string;
    name: string;
    chain: string;
    addressBook: any;
    category: string;
    riskLevel: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export async function getProtocolByName(sql: Sql, args: GetProtocolByNameArgs): Promise<GetProtocolByNameRow | null> {
    const rows = await sql.unsafe(getProtocolByNameQuery, [args.name, args.chain]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        name: row[1],
        chain: row[2],
        addressBook: row[3],
        category: row[4],
        riskLevel: row[5],
        isActive: row[6],
        createdAt: row[7],
        updatedAt: row[8]
    };
}

export const listProtocolsQuery = `-- name: ListProtocols :many
SELECT id, name, chain, address_book, category, risk_level, is_active, created_at, updated_at FROM supported_defi_protocols
ORDER BY name ASC`;

export interface ListProtocolsRow {
    id: string;
    name: string;
    chain: string;
    addressBook: any;
    category: string;
    riskLevel: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export async function listProtocols(sql: Sql): Promise<ListProtocolsRow[]> {
    return (await sql.unsafe(listProtocolsQuery, []).values()).map(row => ({
        id: row[0],
        name: row[1],
        chain: row[2],
        addressBook: row[3],
        category: row[4],
        riskLevel: row[5],
        isActive: row[6],
        createdAt: row[7],
        updatedAt: row[8]
    }));
}

export const listActiveProtocolsQuery = `-- name: ListActiveProtocols :many
SELECT id, name, chain, address_book, category, risk_level, is_active, created_at, updated_at FROM supported_defi_protocols
WHERE is_active = true
ORDER BY name ASC`;

export interface ListActiveProtocolsRow {
    id: string;
    name: string;
    chain: string;
    addressBook: any;
    category: string;
    riskLevel: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export async function listActiveProtocols(sql: Sql): Promise<ListActiveProtocolsRow[]> {
    return (await sql.unsafe(listActiveProtocolsQuery, []).values()).map(row => ({
        id: row[0],
        name: row[1],
        chain: row[2],
        addressBook: row[3],
        category: row[4],
        riskLevel: row[5],
        isActive: row[6],
        createdAt: row[7],
        updatedAt: row[8]
    }));
}

export const listProtocolsByChainQuery = `-- name: ListProtocolsByChain :many
SELECT id, name, chain, address_book, category, risk_level, is_active, created_at, updated_at FROM supported_defi_protocols
WHERE chain = $1
  AND is_active = true
ORDER BY name ASC`;

export interface ListProtocolsByChainArgs {
    chain: string;
}

export interface ListProtocolsByChainRow {
    id: string;
    name: string;
    chain: string;
    addressBook: any;
    category: string;
    riskLevel: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export async function listProtocolsByChain(sql: Sql, args: ListProtocolsByChainArgs): Promise<ListProtocolsByChainRow[]> {
    return (await sql.unsafe(listProtocolsByChainQuery, [args.chain]).values()).map(row => ({
        id: row[0],
        name: row[1],
        chain: row[2],
        addressBook: row[3],
        category: row[4],
        riskLevel: row[5],
        isActive: row[6],
        createdAt: row[7],
        updatedAt: row[8]
    }));
}

export const listProtocolsByCategoryQuery = `-- name: ListProtocolsByCategory :many
SELECT id, name, chain, address_book, category, risk_level, is_active, created_at, updated_at FROM supported_defi_protocols
WHERE category = $1
  AND is_active = true
ORDER BY name ASC`;

export interface ListProtocolsByCategoryArgs {
    category: string;
}

export interface ListProtocolsByCategoryRow {
    id: string;
    name: string;
    chain: string;
    addressBook: any;
    category: string;
    riskLevel: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export async function listProtocolsByCategory(sql: Sql, args: ListProtocolsByCategoryArgs): Promise<ListProtocolsByCategoryRow[]> {
    return (await sql.unsafe(listProtocolsByCategoryQuery, [args.category]).values()).map(row => ({
        id: row[0],
        name: row[1],
        chain: row[2],
        addressBook: row[3],
        category: row[4],
        riskLevel: row[5],
        isActive: row[6],
        createdAt: row[7],
        updatedAt: row[8]
    }));
}

export const listProtocolsByChainAndCategoryQuery = `-- name: ListProtocolsByChainAndCategory :many
SELECT id, name, chain, address_book, category, risk_level, is_active, created_at, updated_at FROM supported_defi_protocols
WHERE chain = $1
  AND category = $2
  AND is_active = true
ORDER BY name ASC`;

export interface ListProtocolsByChainAndCategoryArgs {
    chain: string;
    category: string;
}

export interface ListProtocolsByChainAndCategoryRow {
    id: string;
    name: string;
    chain: string;
    addressBook: any;
    category: string;
    riskLevel: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export async function listProtocolsByChainAndCategory(sql: Sql, args: ListProtocolsByChainAndCategoryArgs): Promise<ListProtocolsByChainAndCategoryRow[]> {
    return (await sql.unsafe(listProtocolsByChainAndCategoryQuery, [args.chain, args.category]).values()).map(row => ({
        id: row[0],
        name: row[1],
        chain: row[2],
        addressBook: row[3],
        category: row[4],
        riskLevel: row[5],
        isActive: row[6],
        createdAt: row[7],
        updatedAt: row[8]
    }));
}

export const createProtocolQuery = `-- name: CreateProtocol :one
INSERT INTO supported_defi_protocols (
  name,
  chain,
  address_book,
  category,
  risk_level,
  is_active
) VALUES (
  $1, $2, $3, $4, $5, $6
)
RETURNING id, name, chain, address_book, category, risk_level, is_active, created_at, updated_at`;

export interface CreateProtocolArgs {
    name: string;
    chain: string;
    addressBook: any;
    category: string;
    riskLevel: string;
    isActive: boolean;
}

export interface CreateProtocolRow {
    id: string;
    name: string;
    chain: string;
    addressBook: any;
    category: string;
    riskLevel: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export async function createProtocol(sql: Sql, args: CreateProtocolArgs): Promise<CreateProtocolRow | null> {
    const rows = await sql.unsafe(createProtocolQuery, [args.name, args.chain, args.addressBook, args.category, args.riskLevel, args.isActive]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        name: row[1],
        chain: row[2],
        addressBook: row[3],
        category: row[4],
        riskLevel: row[5],
        isActive: row[6],
        createdAt: row[7],
        updatedAt: row[8]
    };
}

export const updateProtocolQuery = `-- name: UpdateProtocol :one
UPDATE supported_defi_protocols
SET address_book = COALESCE($2, address_book),
    category = COALESCE($3, category),
    risk_level = COALESCE($4, risk_level),
    is_active = COALESCE($5, is_active),
    updated_at = now()
WHERE id = $1
RETURNING id, name, chain, address_book, category, risk_level, is_active, created_at, updated_at`;

export interface UpdateProtocolArgs {
    id: string;
    addressBook: any | null;
    category: string | null;
    riskLevel: string | null;
    isActive: boolean | null;
}

export interface UpdateProtocolRow {
    id: string;
    name: string;
    chain: string;
    addressBook: any;
    category: string;
    riskLevel: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export async function updateProtocol(sql: Sql, args: UpdateProtocolArgs): Promise<UpdateProtocolRow | null> {
    const rows = await sql.unsafe(updateProtocolQuery, [args.id, args.addressBook, args.category, args.riskLevel, args.isActive]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        name: row[1],
        chain: row[2],
        addressBook: row[3],
        category: row[4],
        riskLevel: row[5],
        isActive: row[6],
        createdAt: row[7],
        updatedAt: row[8]
    };
}

export const activateProtocolQuery = `-- name: ActivateProtocol :exec
UPDATE supported_defi_protocols
SET is_active = true,
    updated_at = now()
WHERE id = $1`;

export interface ActivateProtocolArgs {
    id: string;
}

export async function activateProtocol(sql: Sql, args: ActivateProtocolArgs): Promise<void> {
    await sql.unsafe(activateProtocolQuery, [args.id]);
}

export const deactivateProtocolQuery = `-- name: DeactivateProtocol :exec
UPDATE supported_defi_protocols
SET is_active = false,
    updated_at = now()
WHERE id = $1`;

export interface DeactivateProtocolArgs {
    id: string;
}

export async function deactivateProtocol(sql: Sql, args: DeactivateProtocolArgs): Promise<void> {
    await sql.unsafe(deactivateProtocolQuery, [args.id]);
}

export const deleteProtocolQuery = `-- name: DeleteProtocol :exec
DELETE FROM supported_defi_protocols
WHERE id = $1`;

export interface DeleteProtocolArgs {
    id: string;
}

export async function deleteProtocol(sql: Sql, args: DeleteProtocolArgs): Promise<void> {
    await sql.unsafe(deleteProtocolQuery, [args.id]);
}

export const getAllocationQuery = `-- name: GetAllocation :one

SELECT id, client_id, client_vault_id, protocol_id, category, chain, token_address, token_symbol, balance, percentage_allocation, apy, yield_earned, tx_hash, status, deployed_at, last_rebalance_at, withdrawn_at, created_at, updated_at FROM defi_allocations
WHERE id = $1 LIMIT 1`;

export interface GetAllocationArgs {
    id: string;
}

export interface GetAllocationRow {
    id: string;
    clientId: string;
    clientVaultId: string;
    protocolId: string;
    category: string;
    chain: string;
    tokenAddress: string;
    tokenSymbol: string;
    balance: string;
    percentageAllocation: string;
    apy: string | null;
    yieldEarned: string;
    txHash: string | null;
    status: string;
    deployedAt: Date;
    lastRebalanceAt: Date | null;
    withdrawnAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function getAllocation(sql: Sql, args: GetAllocationArgs): Promise<GetAllocationRow | null> {
    const rows = await sql.unsafe(getAllocationQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        clientId: row[1],
        clientVaultId: row[2],
        protocolId: row[3],
        category: row[4],
        chain: row[5],
        tokenAddress: row[6],
        tokenSymbol: row[7],
        balance: row[8],
        percentageAllocation: row[9],
        apy: row[10],
        yieldEarned: row[11],
        txHash: row[12],
        status: row[13],
        deployedAt: row[14],
        lastRebalanceAt: row[15],
        withdrawnAt: row[16],
        createdAt: row[17],
        updatedAt: row[18]
    };
}

export const getAllocationForUpdateQuery = `-- name: GetAllocationForUpdate :one
SELECT id, client_id, client_vault_id, protocol_id, category, chain, token_address, token_symbol, balance, percentage_allocation, apy, yield_earned, tx_hash, status, deployed_at, last_rebalance_at, withdrawn_at, created_at, updated_at FROM defi_allocations
WHERE id = $1
FOR UPDATE
LIMIT 1`;

export interface GetAllocationForUpdateArgs {
    id: string;
}

export interface GetAllocationForUpdateRow {
    id: string;
    clientId: string;
    clientVaultId: string;
    protocolId: string;
    category: string;
    chain: string;
    tokenAddress: string;
    tokenSymbol: string;
    balance: string;
    percentageAllocation: string;
    apy: string | null;
    yieldEarned: string;
    txHash: string | null;
    status: string;
    deployedAt: Date;
    lastRebalanceAt: Date | null;
    withdrawnAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function getAllocationForUpdate(sql: Sql, args: GetAllocationForUpdateArgs): Promise<GetAllocationForUpdateRow | null> {
    const rows = await sql.unsafe(getAllocationForUpdateQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        clientId: row[1],
        clientVaultId: row[2],
        protocolId: row[3],
        category: row[4],
        chain: row[5],
        tokenAddress: row[6],
        tokenSymbol: row[7],
        balance: row[8],
        percentageAllocation: row[9],
        apy: row[10],
        yieldEarned: row[11],
        txHash: row[12],
        status: row[13],
        deployedAt: row[14],
        lastRebalanceAt: row[15],
        withdrawnAt: row[16],
        createdAt: row[17],
        updatedAt: row[18]
    };
}

export const getAllocationByVaultAndProtocolQuery = `-- name: GetAllocationByVaultAndProtocol :one
SELECT id, client_id, client_vault_id, protocol_id, category, chain, token_address, token_symbol, balance, percentage_allocation, apy, yield_earned, tx_hash, status, deployed_at, last_rebalance_at, withdrawn_at, created_at, updated_at FROM defi_allocations
WHERE client_vault_id = $1
  AND protocol_id = $2
LIMIT 1`;

export interface GetAllocationByVaultAndProtocolArgs {
    clientVaultId: string;
    protocolId: string;
}

export interface GetAllocationByVaultAndProtocolRow {
    id: string;
    clientId: string;
    clientVaultId: string;
    protocolId: string;
    category: string;
    chain: string;
    tokenAddress: string;
    tokenSymbol: string;
    balance: string;
    percentageAllocation: string;
    apy: string | null;
    yieldEarned: string;
    txHash: string | null;
    status: string;
    deployedAt: Date;
    lastRebalanceAt: Date | null;
    withdrawnAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function getAllocationByVaultAndProtocol(sql: Sql, args: GetAllocationByVaultAndProtocolArgs): Promise<GetAllocationByVaultAndProtocolRow | null> {
    const rows = await sql.unsafe(getAllocationByVaultAndProtocolQuery, [args.clientVaultId, args.protocolId]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        clientId: row[1],
        clientVaultId: row[2],
        protocolId: row[3],
        category: row[4],
        chain: row[5],
        tokenAddress: row[6],
        tokenSymbol: row[7],
        balance: row[8],
        percentageAllocation: row[9],
        apy: row[10],
        yieldEarned: row[11],
        txHash: row[12],
        status: row[13],
        deployedAt: row[14],
        lastRebalanceAt: row[15],
        withdrawnAt: row[16],
        createdAt: row[17],
        updatedAt: row[18]
    };
}

export const listAllocationsQuery = `-- name: ListAllocations :many
SELECT id, client_id, client_vault_id, protocol_id, category, chain, token_address, token_symbol, balance, percentage_allocation, apy, yield_earned, tx_hash, status, deployed_at, last_rebalance_at, withdrawn_at, created_at, updated_at FROM defi_allocations
WHERE client_id = $1
ORDER BY deployed_at DESC`;

export interface ListAllocationsArgs {
    clientId: string;
}

export interface ListAllocationsRow {
    id: string;
    clientId: string;
    clientVaultId: string;
    protocolId: string;
    category: string;
    chain: string;
    tokenAddress: string;
    tokenSymbol: string;
    balance: string;
    percentageAllocation: string;
    apy: string | null;
    yieldEarned: string;
    txHash: string | null;
    status: string;
    deployedAt: Date;
    lastRebalanceAt: Date | null;
    withdrawnAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function listAllocations(sql: Sql, args: ListAllocationsArgs): Promise<ListAllocationsRow[]> {
    return (await sql.unsafe(listAllocationsQuery, [args.clientId]).values()).map(row => ({
        id: row[0],
        clientId: row[1],
        clientVaultId: row[2],
        protocolId: row[3],
        category: row[4],
        chain: row[5],
        tokenAddress: row[6],
        tokenSymbol: row[7],
        balance: row[8],
        percentageAllocation: row[9],
        apy: row[10],
        yieldEarned: row[11],
        txHash: row[12],
        status: row[13],
        deployedAt: row[14],
        lastRebalanceAt: row[15],
        withdrawnAt: row[16],
        createdAt: row[17],
        updatedAt: row[18]
    }));
}

export const listAllocationsByVaultQuery = `-- name: ListAllocationsByVault :many
SELECT
  da.id, da.client_id, da.client_vault_id, da.protocol_id, da.category, da.chain, da.token_address, da.token_symbol, da.balance, da.percentage_allocation, da.apy, da.yield_earned, da.tx_hash, da.status, da.deployed_at, da.last_rebalance_at, da.withdrawn_at, da.created_at, da.updated_at,
  sdp.name AS protocol_name,
  sdp.category AS protocol_category,
  sdp.risk_level AS protocol_risk_level
FROM defi_allocations da
JOIN supported_defi_protocols sdp ON da.protocol_id = sdp.id
WHERE da.client_vault_id = $1
ORDER BY da.balance DESC`;

export interface ListAllocationsByVaultArgs {
    clientVaultId: string;
}

export interface ListAllocationsByVaultRow {
    id: string;
    clientId: string;
    clientVaultId: string;
    protocolId: string;
    category: string;
    chain: string;
    tokenAddress: string;
    tokenSymbol: string;
    balance: string;
    percentageAllocation: string;
    apy: string | null;
    yieldEarned: string;
    txHash: string | null;
    status: string;
    deployedAt: Date;
    lastRebalanceAt: Date | null;
    withdrawnAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    protocolName: string;
    protocolCategory: string;
    protocolRiskLevel: string;
}

export async function listAllocationsByVault(sql: Sql, args: ListAllocationsByVaultArgs): Promise<ListAllocationsByVaultRow[]> {
    return (await sql.unsafe(listAllocationsByVaultQuery, [args.clientVaultId]).values()).map(row => ({
        id: row[0],
        clientId: row[1],
        clientVaultId: row[2],
        protocolId: row[3],
        category: row[4],
        chain: row[5],
        tokenAddress: row[6],
        tokenSymbol: row[7],
        balance: row[8],
        percentageAllocation: row[9],
        apy: row[10],
        yieldEarned: row[11],
        txHash: row[12],
        status: row[13],
        deployedAt: row[14],
        lastRebalanceAt: row[15],
        withdrawnAt: row[16],
        createdAt: row[17],
        updatedAt: row[18],
        protocolName: row[19],
        protocolCategory: row[20],
        protocolRiskLevel: row[21]
    }));
}

export const listActiveAllocationsQuery = `-- name: ListActiveAllocations :many
SELECT
  da.id, da.client_id, da.client_vault_id, da.protocol_id, da.category, da.chain, da.token_address, da.token_symbol, da.balance, da.percentage_allocation, da.apy, da.yield_earned, da.tx_hash, da.status, da.deployed_at, da.last_rebalance_at, da.withdrawn_at, da.created_at, da.updated_at,
  sdp.name AS protocol_name,
  sdp.category AS protocol_category,
  sdp.risk_level AS protocol_risk_level
FROM defi_allocations da
JOIN supported_defi_protocols sdp ON da.protocol_id = sdp.id
WHERE da.client_id = $1
  AND da.status = 'active'
ORDER BY da.balance DESC`;

export interface ListActiveAllocationsArgs {
    clientId: string;
}

export interface ListActiveAllocationsRow {
    id: string;
    clientId: string;
    clientVaultId: string;
    protocolId: string;
    category: string;
    chain: string;
    tokenAddress: string;
    tokenSymbol: string;
    balance: string;
    percentageAllocation: string;
    apy: string | null;
    yieldEarned: string;
    txHash: string | null;
    status: string;
    deployedAt: Date;
    lastRebalanceAt: Date | null;
    withdrawnAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    protocolName: string;
    protocolCategory: string;
    protocolRiskLevel: string;
}

export async function listActiveAllocations(sql: Sql, args: ListActiveAllocationsArgs): Promise<ListActiveAllocationsRow[]> {
    return (await sql.unsafe(listActiveAllocationsQuery, [args.clientId]).values()).map(row => ({
        id: row[0],
        clientId: row[1],
        clientVaultId: row[2],
        protocolId: row[3],
        category: row[4],
        chain: row[5],
        tokenAddress: row[6],
        tokenSymbol: row[7],
        balance: row[8],
        percentageAllocation: row[9],
        apy: row[10],
        yieldEarned: row[11],
        txHash: row[12],
        status: row[13],
        deployedAt: row[14],
        lastRebalanceAt: row[15],
        withdrawnAt: row[16],
        createdAt: row[17],
        updatedAt: row[18],
        protocolName: row[19],
        protocolCategory: row[20],
        protocolRiskLevel: row[21]
    }));
}

export const listAllocationsByCategoryQuery = `-- name: ListAllocationsByCategory :many
SELECT
  da.id, da.client_id, da.client_vault_id, da.protocol_id, da.category, da.chain, da.token_address, da.token_symbol, da.balance, da.percentage_allocation, da.apy, da.yield_earned, da.tx_hash, da.status, da.deployed_at, da.last_rebalance_at, da.withdrawn_at, da.created_at, da.updated_at,
  sdp.name AS protocol_name
FROM defi_allocations da
JOIN supported_defi_protocols sdp ON da.protocol_id = sdp.id
WHERE da.client_vault_id = $1
  AND da.category = $2
  AND da.status = 'active'
ORDER BY da.balance DESC`;

export interface ListAllocationsByCategoryArgs {
    clientVaultId: string;
    category: string;
}

export interface ListAllocationsByCategoryRow {
    id: string;
    clientId: string;
    clientVaultId: string;
    protocolId: string;
    category: string;
    chain: string;
    tokenAddress: string;
    tokenSymbol: string;
    balance: string;
    percentageAllocation: string;
    apy: string | null;
    yieldEarned: string;
    txHash: string | null;
    status: string;
    deployedAt: Date;
    lastRebalanceAt: Date | null;
    withdrawnAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    protocolName: string;
}

export async function listAllocationsByCategory(sql: Sql, args: ListAllocationsByCategoryArgs): Promise<ListAllocationsByCategoryRow[]> {
    return (await sql.unsafe(listAllocationsByCategoryQuery, [args.clientVaultId, args.category]).values()).map(row => ({
        id: row[0],
        clientId: row[1],
        clientVaultId: row[2],
        protocolId: row[3],
        category: row[4],
        chain: row[5],
        tokenAddress: row[6],
        tokenSymbol: row[7],
        balance: row[8],
        percentageAllocation: row[9],
        apy: row[10],
        yieldEarned: row[11],
        txHash: row[12],
        status: row[13],
        deployedAt: row[14],
        lastRebalanceAt: row[15],
        withdrawnAt: row[16],
        createdAt: row[17],
        updatedAt: row[18],
        protocolName: row[19]
    }));
}

export const createAllocationQuery = `-- name: CreateAllocation :one
INSERT INTO defi_allocations (
  client_id,
  client_vault_id,
  protocol_id,
  category,
  chain,
  token_address,
  token_symbol,
  balance,
  percentage_allocation,
  apy,
  tx_hash,
  status
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
)
RETURNING id, client_id, client_vault_id, protocol_id, category, chain, token_address, token_symbol, balance, percentage_allocation, apy, yield_earned, tx_hash, status, deployed_at, last_rebalance_at, withdrawn_at, created_at, updated_at`;

export interface CreateAllocationArgs {
    clientId: string;
    clientVaultId: string;
    protocolId: string;
    category: string;
    chain: string;
    tokenAddress: string;
    tokenSymbol: string;
    balance: string;
    percentageAllocation: string;
    apy: string | null;
    txHash: string | null;
    status: string;
}

export interface CreateAllocationRow {
    id: string;
    clientId: string;
    clientVaultId: string;
    protocolId: string;
    category: string;
    chain: string;
    tokenAddress: string;
    tokenSymbol: string;
    balance: string;
    percentageAllocation: string;
    apy: string | null;
    yieldEarned: string;
    txHash: string | null;
    status: string;
    deployedAt: Date;
    lastRebalanceAt: Date | null;
    withdrawnAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function createAllocation(sql: Sql, args: CreateAllocationArgs): Promise<CreateAllocationRow | null> {
    const rows = await sql.unsafe(createAllocationQuery, [args.clientId, args.clientVaultId, args.protocolId, args.category, args.chain, args.tokenAddress, args.tokenSymbol, args.balance, args.percentageAllocation, args.apy, args.txHash, args.status]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        clientId: row[1],
        clientVaultId: row[2],
        protocolId: row[3],
        category: row[4],
        chain: row[5],
        tokenAddress: row[6],
        tokenSymbol: row[7],
        balance: row[8],
        percentageAllocation: row[9],
        apy: row[10],
        yieldEarned: row[11],
        txHash: row[12],
        status: row[13],
        deployedAt: row[14],
        lastRebalanceAt: row[15],
        withdrawnAt: row[16],
        createdAt: row[17],
        updatedAt: row[18]
    };
}

export const upsertAllocationQuery = `-- name: UpsertAllocation :one
INSERT INTO defi_allocations (
  client_id,
  client_vault_id,
  protocol_id,
  category,
  chain,
  token_address,
  token_symbol,
  balance,
  percentage_allocation,
  apy,
  tx_hash,
  status
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
)
ON CONFLICT (client_vault_id, protocol_id)
DO UPDATE SET
  balance = defi_allocations.balance + EXCLUDED.balance,
  percentage_allocation = EXCLUDED.percentage_allocation,
  apy = EXCLUDED.apy,
  last_rebalance_at = now(),
  updated_at = now()
RETURNING id, client_id, client_vault_id, protocol_id, category, chain, token_address, token_symbol, balance, percentage_allocation, apy, yield_earned, tx_hash, status, deployed_at, last_rebalance_at, withdrawn_at, created_at, updated_at`;

export interface UpsertAllocationArgs {
    clientId: string;
    clientVaultId: string;
    protocolId: string;
    category: string;
    chain: string;
    tokenAddress: string;
    tokenSymbol: string;
    balance: string;
    percentageAllocation: string;
    apy: string | null;
    txHash: string | null;
    status: string;
}

export interface UpsertAllocationRow {
    id: string;
    clientId: string;
    clientVaultId: string;
    protocolId: string;
    category: string;
    chain: string;
    tokenAddress: string;
    tokenSymbol: string;
    balance: string;
    percentageAllocation: string;
    apy: string | null;
    yieldEarned: string;
    txHash: string | null;
    status: string;
    deployedAt: Date;
    lastRebalanceAt: Date | null;
    withdrawnAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function upsertAllocation(sql: Sql, args: UpsertAllocationArgs): Promise<UpsertAllocationRow | null> {
    const rows = await sql.unsafe(upsertAllocationQuery, [args.clientId, args.clientVaultId, args.protocolId, args.category, args.chain, args.tokenAddress, args.tokenSymbol, args.balance, args.percentageAllocation, args.apy, args.txHash, args.status]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        clientId: row[1],
        clientVaultId: row[2],
        protocolId: row[3],
        category: row[4],
        chain: row[5],
        tokenAddress: row[6],
        tokenSymbol: row[7],
        balance: row[8],
        percentageAllocation: row[9],
        apy: row[10],
        yieldEarned: row[11],
        txHash: row[12],
        status: row[13],
        deployedAt: row[14],
        lastRebalanceAt: row[15],
        withdrawnAt: row[16],
        createdAt: row[17],
        updatedAt: row[18]
    };
}

export const updateAllocationBalanceQuery = `-- name: UpdateAllocationBalance :exec
UPDATE defi_allocations
SET balance = $2,
    updated_at = now()
WHERE id = $1`;

export interface UpdateAllocationBalanceArgs {
    id: string;
    balance: string;
}

export async function updateAllocationBalance(sql: Sql, args: UpdateAllocationBalanceArgs): Promise<void> {
    await sql.unsafe(updateAllocationBalanceQuery, [args.id, args.balance]);
}

export const increaseAllocationBalanceQuery = `-- name: IncreaseAllocationBalance :exec
UPDATE defi_allocations
SET balance = balance + $2,
    last_rebalance_at = now(),
    updated_at = now()
WHERE id = $1`;

export interface IncreaseAllocationBalanceArgs {
    id: string;
    balance: string;
}

export async function increaseAllocationBalance(sql: Sql, args: IncreaseAllocationBalanceArgs): Promise<void> {
    await sql.unsafe(increaseAllocationBalanceQuery, [args.id, args.balance]);
}

export const decreaseAllocationBalanceQuery = `-- name: DecreaseAllocationBalance :exec
UPDATE defi_allocations
SET balance = balance - $2,
    last_rebalance_at = now(),
    updated_at = now()
WHERE id = $1`;

export interface DecreaseAllocationBalanceArgs {
    id: string;
    balance: string;
}

export async function decreaseAllocationBalance(sql: Sql, args: DecreaseAllocationBalanceArgs): Promise<void> {
    await sql.unsafe(decreaseAllocationBalanceQuery, [args.id, args.balance]);
}

export const updateAllocationYieldQuery = `-- name: UpdateAllocationYield :exec
UPDATE defi_allocations
SET balance = $2,
    yield_earned = yield_earned + $3,
    apy = COALESCE($4, apy),
    updated_at = now()
WHERE id = $1`;

export interface UpdateAllocationYieldArgs {
    id: string;
    balance: string;
    yieldEarned: string;
    apy: string | null;
}

export async function updateAllocationYield(sql: Sql, args: UpdateAllocationYieldArgs): Promise<void> {
    await sql.unsafe(updateAllocationYieldQuery, [args.id, args.balance, args.yieldEarned, args.apy]);
}

export const updateAllocationAPYQuery = `-- name: UpdateAllocationAPY :exec
UPDATE defi_allocations
SET apy = $2,
    updated_at = now()
WHERE id = $1`;

export interface UpdateAllocationAPYArgs {
    id: string;
    apy: string | null;
}

export async function updateAllocationAPY(sql: Sql, args: UpdateAllocationAPYArgs): Promise<void> {
    await sql.unsafe(updateAllocationAPYQuery, [args.id, args.apy]);
}

export const markAllocationRebalancingQuery = `-- name: MarkAllocationRebalancing :exec
UPDATE defi_allocations
SET status = 'rebalancing',
    updated_at = now()
WHERE id = $1`;

export interface MarkAllocationRebalancingArgs {
    id: string;
}

export async function markAllocationRebalancing(sql: Sql, args: MarkAllocationRebalancingArgs): Promise<void> {
    await sql.unsafe(markAllocationRebalancingQuery, [args.id]);
}

export const markAllocationActiveQuery = `-- name: MarkAllocationActive :exec
UPDATE defi_allocations
SET status = 'active',
    last_rebalance_at = now(),
    updated_at = now()
WHERE id = $1`;

export interface MarkAllocationActiveArgs {
    id: string;
}

export async function markAllocationActive(sql: Sql, args: MarkAllocationActiveArgs): Promise<void> {
    await sql.unsafe(markAllocationActiveQuery, [args.id]);
}

export const withdrawAllocationQuery = `-- name: WithdrawAllocation :exec
UPDATE defi_allocations
SET status = 'withdrawn',
    withdrawn_at = now(),
    updated_at = now()
WHERE id = $1`;

export interface WithdrawAllocationArgs {
    id: string;
}

export async function withdrawAllocation(sql: Sql, args: WithdrawAllocationArgs): Promise<void> {
    await sql.unsafe(withdrawAllocationQuery, [args.id]);
}

export const deleteAllocationQuery = `-- name: DeleteAllocation :exec
DELETE FROM defi_allocations
WHERE id = $1`;

export interface DeleteAllocationArgs {
    id: string;
}

export async function deleteAllocation(sql: Sql, args: DeleteAllocationArgs): Promise<void> {
    await sql.unsafe(deleteAllocationQuery, [args.id]);
}

export const getAllocationSummaryQuery = `-- name: GetAllocationSummary :one

SELECT
  COUNT(DISTINCT da.protocol_id) AS total_protocols,
  COUNT(DISTINCT da.category) AS total_categories,
  COALESCE(SUM(da.balance), 0) AS total_allocated,
  COALESCE(SUM(da.yield_earned), 0) AS total_yield_earned,
  COALESCE(AVG(da.apy), 0) AS avg_apy
FROM defi_allocations da
WHERE da.client_vault_id = $1
  AND da.status = 'active'`;

export interface GetAllocationSummaryArgs {
    clientVaultId: string;
}

export interface GetAllocationSummaryRow {
    totalProtocols: string;
    totalCategories: string;
    totalAllocated: string | null;
    totalYieldEarned: string | null;
    avgApy: string | null;
}

export async function getAllocationSummary(sql: Sql, args: GetAllocationSummaryArgs): Promise<GetAllocationSummaryRow | null> {
    const rows = await sql.unsafe(getAllocationSummaryQuery, [args.clientVaultId]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        totalProtocols: row[0],
        totalCategories: row[1],
        totalAllocated: row[2],
        totalYieldEarned: row[3],
        avgApy: row[4]
    };
}

export const getCategoryAllocationBreakdownQuery = `-- name: GetCategoryAllocationBreakdown :many
SELECT
  da.category,
  COUNT(DISTINCT da.protocol_id) AS num_protocols,
  COALESCE(SUM(da.balance), 0) AS total_balance,
  COALESCE(AVG(da.apy), 0) AS avg_apy,
  COALESCE(SUM(da.yield_earned), 0) AS total_yield
FROM defi_allocations da
WHERE da.client_vault_id = $1
  AND da.status = 'active'
GROUP BY da.category
ORDER BY total_balance DESC`;

export interface GetCategoryAllocationBreakdownArgs {
    clientVaultId: string;
}

export interface GetCategoryAllocationBreakdownRow {
    category: string;
    numProtocols: string;
    totalBalance: string | null;
    avgApy: string | null;
    totalYield: string | null;
}

export async function getCategoryAllocationBreakdown(sql: Sql, args: GetCategoryAllocationBreakdownArgs): Promise<GetCategoryAllocationBreakdownRow[]> {
    return (await sql.unsafe(getCategoryAllocationBreakdownQuery, [args.clientVaultId]).values()).map(row => ({
        category: row[0],
        numProtocols: row[1],
        totalBalance: row[2],
        avgApy: row[3],
        totalYield: row[4]
    }));
}

export const getProtocolPerformanceQuery = `-- name: GetProtocolPerformance :many
SELECT
  sdp.name AS protocol_name,
  sdp.category,
  da.chain,
  da.token_symbol,
  da.balance,
  da.yield_earned,
  da.apy,
  da.deployed_at,
  da.last_rebalance_at,
  -- Calculate total return percentage
  CASE
    WHEN da.balance > 0 THEN (da.yield_earned::numeric / da.balance::numeric * 100)
    ELSE 0
  END AS total_return_percent
FROM defi_allocations da
JOIN supported_defi_protocols sdp ON da.protocol_id = sdp.id
WHERE da.client_id = $1
  AND da.status = 'active'
ORDER BY da.yield_earned DESC`;

export interface GetProtocolPerformanceArgs {
    clientId: string;
}

export interface GetProtocolPerformanceRow {
    protocolName: string;
    category: string;
    chain: string;
    tokenSymbol: string;
    balance: string;
    yieldEarned: string;
    apy: string | null;
    deployedAt: Date;
    lastRebalanceAt: Date | null;
    totalReturnPercent: string;
}

export async function getProtocolPerformance(sql: Sql, args: GetProtocolPerformanceArgs): Promise<GetProtocolPerformanceRow[]> {
    return (await sql.unsafe(getProtocolPerformanceQuery, [args.clientId]).values()).map(row => ({
        protocolName: row[0],
        category: row[1],
        chain: row[2],
        tokenSymbol: row[3],
        balance: row[4],
        yieldEarned: row[5],
        apy: row[6],
        deployedAt: row[7],
        lastRebalanceAt: row[8],
        totalReturnPercent: row[9]
    }));
}

export const getTotalAllocatedByClientQuery = `-- name: GetTotalAllocatedByClient :one
SELECT
  COALESCE(SUM(balance), 0) AS total_deployed,
  COALESCE(SUM(yield_earned), 0) AS total_yield,
  COALESCE(AVG(apy), 0) AS weighted_avg_apy
FROM defi_allocations
WHERE client_id = $1
  AND status = 'active'`;

export interface GetTotalAllocatedByClientArgs {
    clientId: string;
}

export interface GetTotalAllocatedByClientRow {
    totalDeployed: string | null;
    totalYield: string | null;
    weightedAvgApy: string | null;
}

export async function getTotalAllocatedByClient(sql: Sql, args: GetTotalAllocatedByClientArgs): Promise<GetTotalAllocatedByClientRow | null> {
    const rows = await sql.unsafe(getTotalAllocatedByClientQuery, [args.clientId]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        totalDeployed: row[0],
        totalYield: row[1],
        weightedAvgApy: row[2]
    };
}

