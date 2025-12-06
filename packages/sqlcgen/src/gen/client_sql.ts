import { Sql } from "postgres";

export const getClientQuery = `-- name: GetClient :one

SELECT
  co.id, co.privy_account_id, co.product_id, co.company_name, co.business_type, co.description, co.website_url, co.api_key_hash, co.api_key_prefix, co.webhook_urls, co.webhook_secret, co.custom_strategy, co.end_user_yield_portion, co.supported_currencies, co.bank_accounts, co.is_active, co.is_sandbox, co.platform_fee, co.performance_fee, co.created_at, co.updated_at, co.customer_tier,
  pa.privy_organization_id,
  pa.privy_wallet_address,
  pa.privy_email,
  pa.wallet_type AS privy_wallet_type
FROM client_organizations co
JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE co.id = $1
LIMIT 1`;

export interface GetClientArgs {
    id: string;
}

export interface GetClientRow {
    id: string;
    privyAccountId: string;
    productId: string;
    companyName: string;
    businessType: string;
    description: string | null;
    websiteUrl: string | null;
    apiKeyHash: string | null;
    apiKeyPrefix: string | null;
    webhookUrls: string[] | null;
    webhookSecret: string | null;
    customStrategy: any | null;
    endUserYieldPortion: string | null;
    supportedCurrencies: any | null;
    bankAccounts: any | null;
    isActive: boolean;
    isSandbox: boolean;
    platformFee: string | null;
    performanceFee: string | null;
    createdAt: Date;
    updatedAt: Date;
    customerTier: string | null;
    privyOrganizationId: string;
    privyWalletAddress: string;
    privyEmail: string | null;
    privyWalletType: string;
}

export async function getClient(sql: Sql, args: GetClientArgs): Promise<GetClientRow | null> {
    const rows = await sql.unsafe(getClientQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        privyAccountId: row[1],
        productId: row[2],
        companyName: row[3],
        businessType: row[4],
        description: row[5],
        websiteUrl: row[6],
        apiKeyHash: row[7],
        apiKeyPrefix: row[8],
        webhookUrls: row[9],
        webhookSecret: row[10],
        customStrategy: row[11],
        endUserYieldPortion: row[12],
        supportedCurrencies: row[13],
        bankAccounts: row[14],
        isActive: row[15],
        isSandbox: row[16],
        platformFee: row[17],
        performanceFee: row[18],
        createdAt: row[19],
        updatedAt: row[20],
        customerTier: row[21],
        privyOrganizationId: row[22],
        privyWalletAddress: row[23],
        privyEmail: row[24],
        privyWalletType: row[25]
    };
}

export const getClientByProductIDQuery = `-- name: GetClientByProductID :one
SELECT
  co.id, co.privy_account_id, co.product_id, co.company_name, co.business_type, co.description, co.website_url, co.api_key_hash, co.api_key_prefix, co.webhook_urls, co.webhook_secret, co.custom_strategy, co.end_user_yield_portion, co.supported_currencies, co.bank_accounts, co.is_active, co.is_sandbox, co.platform_fee, co.performance_fee, co.created_at, co.updated_at, co.customer_tier,
  pa.privy_organization_id,
  pa.privy_wallet_address,
  pa.privy_email,
  pa.wallet_type AS privy_wallet_type
FROM client_organizations co
JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE co.product_id = $1
LIMIT 1`;

export interface GetClientByProductIDArgs {
    productId: string;
}

export interface GetClientByProductIDRow {
    id: string;
    privyAccountId: string;
    productId: string;
    companyName: string;
    businessType: string;
    description: string | null;
    websiteUrl: string | null;
    apiKeyHash: string | null;
    apiKeyPrefix: string | null;
    webhookUrls: string[] | null;
    webhookSecret: string | null;
    customStrategy: any | null;
    endUserYieldPortion: string | null;
    supportedCurrencies: any | null;
    bankAccounts: any | null;
    isActive: boolean;
    isSandbox: boolean;
    platformFee: string | null;
    performanceFee: string | null;
    createdAt: Date;
    updatedAt: Date;
    customerTier: string | null;
    privyOrganizationId: string;
    privyWalletAddress: string;
    privyEmail: string | null;
    privyWalletType: string;
}

export async function getClientByProductID(sql: Sql, args: GetClientByProductIDArgs): Promise<GetClientByProductIDRow | null> {
    const rows = await sql.unsafe(getClientByProductIDQuery, [args.productId]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        privyAccountId: row[1],
        productId: row[2],
        companyName: row[3],
        businessType: row[4],
        description: row[5],
        websiteUrl: row[6],
        apiKeyHash: row[7],
        apiKeyPrefix: row[8],
        webhookUrls: row[9],
        webhookSecret: row[10],
        customStrategy: row[11],
        endUserYieldPortion: row[12],
        supportedCurrencies: row[13],
        bankAccounts: row[14],
        isActive: row[15],
        isSandbox: row[16],
        platformFee: row[17],
        performanceFee: row[18],
        createdAt: row[19],
        updatedAt: row[20],
        customerTier: row[21],
        privyOrganizationId: row[22],
        privyWalletAddress: row[23],
        privyEmail: row[24],
        privyWalletType: row[25]
    };
}

export const getClientsByPrivyOrgIDQuery = `-- name: GetClientsByPrivyOrgID :many
SELECT
  co.id, co.privy_account_id, co.product_id, co.company_name, co.business_type, co.description, co.website_url, co.api_key_hash, co.api_key_prefix, co.webhook_urls, co.webhook_secret, co.custom_strategy, co.end_user_yield_portion, co.supported_currencies, co.bank_accounts, co.is_active, co.is_sandbox, co.platform_fee, co.performance_fee, co.created_at, co.updated_at, co.customer_tier,
  pa.privy_organization_id,
  pa.privy_wallet_address,
  pa.privy_email,
  pa.wallet_type AS privy_wallet_type
FROM client_organizations co
JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE pa.privy_organization_id = $1`;

export interface GetClientsByPrivyOrgIDArgs {
    privyOrganizationId: string;
}

export interface GetClientsByPrivyOrgIDRow {
    id: string;
    privyAccountId: string;
    productId: string;
    companyName: string;
    businessType: string;
    description: string | null;
    websiteUrl: string | null;
    apiKeyHash: string | null;
    apiKeyPrefix: string | null;
    webhookUrls: string[] | null;
    webhookSecret: string | null;
    customStrategy: any | null;
    endUserYieldPortion: string | null;
    supportedCurrencies: any | null;
    bankAccounts: any | null;
    isActive: boolean;
    isSandbox: boolean;
    platformFee: string | null;
    performanceFee: string | null;
    createdAt: Date;
    updatedAt: Date;
    customerTier: string | null;
    privyOrganizationId: string;
    privyWalletAddress: string;
    privyEmail: string | null;
    privyWalletType: string;
}

export async function getClientsByPrivyOrgID(sql: Sql, args: GetClientsByPrivyOrgIDArgs): Promise<GetClientsByPrivyOrgIDRow[]> {
    return (await sql.unsafe(getClientsByPrivyOrgIDQuery, [args.privyOrganizationId]).values()).map(row => ({
        id: row[0],
        privyAccountId: row[1],
        productId: row[2],
        companyName: row[3],
        businessType: row[4],
        description: row[5],
        websiteUrl: row[6],
        apiKeyHash: row[7],
        apiKeyPrefix: row[8],
        webhookUrls: row[9],
        webhookSecret: row[10],
        customStrategy: row[11],
        endUserYieldPortion: row[12],
        supportedCurrencies: row[13],
        bankAccounts: row[14],
        isActive: row[15],
        isSandbox: row[16],
        platformFee: row[17],
        performanceFee: row[18],
        createdAt: row[19],
        updatedAt: row[20],
        customerTier: row[21],
        privyOrganizationId: row[22],
        privyWalletAddress: row[23],
        privyEmail: row[24],
        privyWalletType: row[25]
    }));
}

export const getClientByAPIKeyPrefixQuery = `-- name: GetClientByAPIKeyPrefix :one
SELECT
  co.id, co.privy_account_id, co.product_id, co.company_name, co.business_type, co.description, co.website_url, co.api_key_hash, co.api_key_prefix, co.webhook_urls, co.webhook_secret, co.custom_strategy, co.end_user_yield_portion, co.supported_currencies, co.bank_accounts, co.is_active, co.is_sandbox, co.platform_fee, co.performance_fee, co.created_at, co.updated_at, co.customer_tier,
  pa.privy_organization_id,
  pa.privy_wallet_address,
  pa.privy_email,
  pa.wallet_type AS privy_wallet_type
FROM client_organizations co
JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE co.api_key_prefix = $1
LIMIT 1`;

export interface GetClientByAPIKeyPrefixArgs {
    apiKeyPrefix: string | null;
}

export interface GetClientByAPIKeyPrefixRow {
    id: string;
    privyAccountId: string;
    productId: string;
    companyName: string;
    businessType: string;
    description: string | null;
    websiteUrl: string | null;
    apiKeyHash: string | null;
    apiKeyPrefix: string | null;
    webhookUrls: string[] | null;
    webhookSecret: string | null;
    customStrategy: any | null;
    endUserYieldPortion: string | null;
    supportedCurrencies: any | null;
    bankAccounts: any | null;
    isActive: boolean;
    isSandbox: boolean;
    platformFee: string | null;
    performanceFee: string | null;
    createdAt: Date;
    updatedAt: Date;
    customerTier: string | null;
    privyOrganizationId: string;
    privyWalletAddress: string;
    privyEmail: string | null;
    privyWalletType: string;
}

export async function getClientByAPIKeyPrefix(sql: Sql, args: GetClientByAPIKeyPrefixArgs): Promise<GetClientByAPIKeyPrefixRow | null> {
    const rows = await sql.unsafe(getClientByAPIKeyPrefixQuery, [args.apiKeyPrefix]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        privyAccountId: row[1],
        productId: row[2],
        companyName: row[3],
        businessType: row[4],
        description: row[5],
        websiteUrl: row[6],
        apiKeyHash: row[7],
        apiKeyPrefix: row[8],
        webhookUrls: row[9],
        webhookSecret: row[10],
        customStrategy: row[11],
        endUserYieldPortion: row[12],
        supportedCurrencies: row[13],
        bankAccounts: row[14],
        isActive: row[15],
        isSandbox: row[16],
        platformFee: row[17],
        performanceFee: row[18],
        createdAt: row[19],
        updatedAt: row[20],
        customerTier: row[21],
        privyOrganizationId: row[22],
        privyWalletAddress: row[23],
        privyEmail: row[24],
        privyWalletType: row[25]
    };
}

export const getClientByAPIKeyHashQuery = `-- name: GetClientByAPIKeyHash :one
SELECT
  co.id, co.privy_account_id, co.product_id, co.company_name, co.business_type, co.description, co.website_url, co.api_key_hash, co.api_key_prefix, co.webhook_urls, co.webhook_secret, co.custom_strategy, co.end_user_yield_portion, co.supported_currencies, co.bank_accounts, co.is_active, co.is_sandbox, co.platform_fee, co.performance_fee, co.created_at, co.updated_at, co.customer_tier,
  pa.privy_organization_id,
  pa.privy_wallet_address,
  pa.privy_email,
  pa.wallet_type AS privy_wallet_type
FROM client_organizations co
JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE co.api_key_hash = $1
LIMIT 1`;

export interface GetClientByAPIKeyHashArgs {
    apiKeyHash: string | null;
}

export interface GetClientByAPIKeyHashRow {
    id: string;
    privyAccountId: string;
    productId: string;
    companyName: string;
    businessType: string;
    description: string | null;
    websiteUrl: string | null;
    apiKeyHash: string | null;
    apiKeyPrefix: string | null;
    webhookUrls: string[] | null;
    webhookSecret: string | null;
    customStrategy: any | null;
    endUserYieldPortion: string | null;
    supportedCurrencies: any | null;
    bankAccounts: any | null;
    isActive: boolean;
    isSandbox: boolean;
    platformFee: string | null;
    performanceFee: string | null;
    createdAt: Date;
    updatedAt: Date;
    customerTier: string | null;
    privyOrganizationId: string;
    privyWalletAddress: string;
    privyEmail: string | null;
    privyWalletType: string;
}

export async function getClientByAPIKeyHash(sql: Sql, args: GetClientByAPIKeyHashArgs): Promise<GetClientByAPIKeyHashRow | null> {
    const rows = await sql.unsafe(getClientByAPIKeyHashQuery, [args.apiKeyHash]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        privyAccountId: row[1],
        productId: row[2],
        companyName: row[3],
        businessType: row[4],
        description: row[5],
        websiteUrl: row[6],
        apiKeyHash: row[7],
        apiKeyPrefix: row[8],
        webhookUrls: row[9],
        webhookSecret: row[10],
        customStrategy: row[11],
        endUserYieldPortion: row[12],
        supportedCurrencies: row[13],
        bankAccounts: row[14],
        isActive: row[15],
        isSandbox: row[16],
        platformFee: row[17],
        performanceFee: row[18],
        createdAt: row[19],
        updatedAt: row[20],
        customerTier: row[21],
        privyOrganizationId: row[22],
        privyWalletAddress: row[23],
        privyEmail: row[24],
        privyWalletType: row[25]
    };
}

export const listClientsQuery = `-- name: ListClients :many
SELECT
  co.id, co.privy_account_id, co.product_id, co.company_name, co.business_type, co.description, co.website_url, co.api_key_hash, co.api_key_prefix, co.webhook_urls, co.webhook_secret, co.custom_strategy, co.end_user_yield_portion, co.supported_currencies, co.bank_accounts, co.is_active, co.is_sandbox, co.platform_fee, co.performance_fee, co.created_at, co.updated_at, co.customer_tier,
  pa.privy_organization_id,
  pa.privy_wallet_address,
  pa.privy_email,
  pa.wallet_type AS privy_wallet_type
FROM client_organizations co
JOIN privy_accounts pa ON co.privy_account_id = pa.id
ORDER BY co.created_at DESC
LIMIT $1 OFFSET $2`;

export interface ListClientsArgs {
    limit: string;
    offset: string;
}

export interface ListClientsRow {
    id: string;
    privyAccountId: string;
    productId: string;
    companyName: string;
    businessType: string;
    description: string | null;
    websiteUrl: string | null;
    apiKeyHash: string | null;
    apiKeyPrefix: string | null;
    webhookUrls: string[] | null;
    webhookSecret: string | null;
    customStrategy: any | null;
    endUserYieldPortion: string | null;
    supportedCurrencies: any | null;
    bankAccounts: any | null;
    isActive: boolean;
    isSandbox: boolean;
    platformFee: string | null;
    performanceFee: string | null;
    createdAt: Date;
    updatedAt: Date;
    customerTier: string | null;
    privyOrganizationId: string;
    privyWalletAddress: string;
    privyEmail: string | null;
    privyWalletType: string;
}

export async function listClients(sql: Sql, args: ListClientsArgs): Promise<ListClientsRow[]> {
    return (await sql.unsafe(listClientsQuery, [args.limit, args.offset]).values()).map(row => ({
        id: row[0],
        privyAccountId: row[1],
        productId: row[2],
        companyName: row[3],
        businessType: row[4],
        description: row[5],
        websiteUrl: row[6],
        apiKeyHash: row[7],
        apiKeyPrefix: row[8],
        webhookUrls: row[9],
        webhookSecret: row[10],
        customStrategy: row[11],
        endUserYieldPortion: row[12],
        supportedCurrencies: row[13],
        bankAccounts: row[14],
        isActive: row[15],
        isSandbox: row[16],
        platformFee: row[17],
        performanceFee: row[18],
        createdAt: row[19],
        updatedAt: row[20],
        customerTier: row[21],
        privyOrganizationId: row[22],
        privyWalletAddress: row[23],
        privyEmail: row[24],
        privyWalletType: row[25]
    }));
}

export const listActiveClientsQuery = `-- name: ListActiveClients :many
SELECT
  co.id, co.privy_account_id, co.product_id, co.company_name, co.business_type, co.description, co.website_url, co.api_key_hash, co.api_key_prefix, co.webhook_urls, co.webhook_secret, co.custom_strategy, co.end_user_yield_portion, co.supported_currencies, co.bank_accounts, co.is_active, co.is_sandbox, co.platform_fee, co.performance_fee, co.created_at, co.updated_at, co.customer_tier,
  pa.privy_organization_id,
  pa.privy_wallet_address,
  pa.privy_email,
  pa.wallet_type AS privy_wallet_type
FROM client_organizations co
JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE co.is_active = true
ORDER BY co.created_at DESC`;

export interface ListActiveClientsRow {
    id: string;
    privyAccountId: string;
    productId: string;
    companyName: string;
    businessType: string;
    description: string | null;
    websiteUrl: string | null;
    apiKeyHash: string | null;
    apiKeyPrefix: string | null;
    webhookUrls: string[] | null;
    webhookSecret: string | null;
    customStrategy: any | null;
    endUserYieldPortion: string | null;
    supportedCurrencies: any | null;
    bankAccounts: any | null;
    isActive: boolean;
    isSandbox: boolean;
    platformFee: string | null;
    performanceFee: string | null;
    createdAt: Date;
    updatedAt: Date;
    customerTier: string | null;
    privyOrganizationId: string;
    privyWalletAddress: string;
    privyEmail: string | null;
    privyWalletType: string;
}

export async function listActiveClients(sql: Sql): Promise<ListActiveClientsRow[]> {
    return (await sql.unsafe(listActiveClientsQuery, []).values()).map(row => ({
        id: row[0],
        privyAccountId: row[1],
        productId: row[2],
        companyName: row[3],
        businessType: row[4],
        description: row[5],
        websiteUrl: row[6],
        apiKeyHash: row[7],
        apiKeyPrefix: row[8],
        webhookUrls: row[9],
        webhookSecret: row[10],
        customStrategy: row[11],
        endUserYieldPortion: row[12],
        supportedCurrencies: row[13],
        bankAccounts: row[14],
        isActive: row[15],
        isSandbox: row[16],
        platformFee: row[17],
        performanceFee: row[18],
        createdAt: row[19],
        updatedAt: row[20],
        customerTier: row[21],
        privyOrganizationId: row[22],
        privyWalletAddress: row[23],
        privyEmail: row[24],
        privyWalletType: row[25]
    }));
}

export const createClientQuery = `-- name: CreateClient :one
INSERT INTO client_organizations (
  privy_account_id,
  product_id,
  company_name,
  business_type,
  description,
  website_url,
  customer_tier,
  api_key_hash,
  api_key_prefix,
  webhook_urls,
  webhook_secret,
  custom_strategy,
  end_user_yield_portion,
  platform_fee,
  performance_fee,
  is_active,
  is_sandbox,
  supported_currencies,
  bank_accounts
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
  $11, $12, $13, $14, $15, $16, $17, $18, $19
)
RETURNING id, privy_account_id, product_id, company_name, business_type, description, website_url, api_key_hash, api_key_prefix, webhook_urls, webhook_secret, custom_strategy, end_user_yield_portion, supported_currencies, bank_accounts, is_active, is_sandbox, platform_fee, performance_fee, created_at, updated_at, customer_tier`;

export interface CreateClientArgs {
    privyAccountId: string;
    productId: string;
    companyName: string;
    businessType: string;
    description: string | null;
    websiteUrl: string | null;
    customerTier: string | null;
    apiKeyHash: string | null;
    apiKeyPrefix: string | null;
    webhookUrls: string[] | null;
    webhookSecret: string | null;
    customStrategy: any | null;
    endUserYieldPortion: string | null;
    platformFee: string | null;
    performanceFee: string | null;
    isActive: boolean;
    isSandbox: boolean;
    supportedCurrencies: any | null;
    bankAccounts: any | null;
}

export interface CreateClientRow {
    id: string;
    privyAccountId: string;
    productId: string;
    companyName: string;
    businessType: string;
    description: string | null;
    websiteUrl: string | null;
    apiKeyHash: string | null;
    apiKeyPrefix: string | null;
    webhookUrls: string[] | null;
    webhookSecret: string | null;
    customStrategy: any | null;
    endUserYieldPortion: string | null;
    supportedCurrencies: any | null;
    bankAccounts: any | null;
    isActive: boolean;
    isSandbox: boolean;
    platformFee: string | null;
    performanceFee: string | null;
    createdAt: Date;
    updatedAt: Date;
    customerTier: string | null;
}

export async function createClient(sql: Sql, args: CreateClientArgs): Promise<CreateClientRow | null> {
    const rows = await sql.unsafe(createClientQuery, [args.privyAccountId, args.productId, args.companyName, args.businessType, args.description, args.websiteUrl, args.customerTier, args.apiKeyHash, args.apiKeyPrefix, args.webhookUrls, args.webhookSecret, args.customStrategy, args.endUserYieldPortion, args.platformFee, args.performanceFee, args.isActive, args.isSandbox, args.supportedCurrencies, args.bankAccounts]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        privyAccountId: row[1],
        productId: row[2],
        companyName: row[3],
        businessType: row[4],
        description: row[5],
        websiteUrl: row[6],
        apiKeyHash: row[7],
        apiKeyPrefix: row[8],
        webhookUrls: row[9],
        webhookSecret: row[10],
        customStrategy: row[11],
        endUserYieldPortion: row[12],
        supportedCurrencies: row[13],
        bankAccounts: row[14],
        isActive: row[15],
        isSandbox: row[16],
        platformFee: row[17],
        performanceFee: row[18],
        createdAt: row[19],
        updatedAt: row[20],
        customerTier: row[21]
    };
}

export const updateClientQuery = `-- name: UpdateClient :one
UPDATE client_organizations
SET company_name = COALESCE($2, company_name),
    business_type = COALESCE($3, business_type),
    description = COALESCE($4, description),
    website_url = COALESCE($5, website_url),
    customer_tier = COALESCE($6, customer_tier),
    webhook_urls = COALESCE($7, webhook_urls),
    webhook_secret = COALESCE($8, webhook_secret),
    custom_strategy = COALESCE($9, custom_strategy),
    end_user_yield_portion = COALESCE($10, end_user_yield_portion),
    platform_fee = COALESCE($11, platform_fee),
    performance_fee = COALESCE($12, performance_fee),
    updated_at = now()
WHERE id = $1
RETURNING id, privy_account_id, product_id, company_name, business_type, description, website_url, api_key_hash, api_key_prefix, webhook_urls, webhook_secret, custom_strategy, end_user_yield_portion, supported_currencies, bank_accounts, is_active, is_sandbox, platform_fee, performance_fee, created_at, updated_at, customer_tier`;

export interface UpdateClientArgs {
    id: string;
    companyName: string | null;
    businessType: string | null;
    description: string | null;
    websiteUrl: string | null;
    customerTier: string | null;
    webhookUrls: string[] | null;
    webhookSecret: string | null;
    customStrategy: any | null;
    endUserYieldPortion: string | null;
    platformFee: string | null;
    performanceFee: string | null;
}

export interface UpdateClientRow {
    id: string;
    privyAccountId: string;
    productId: string;
    companyName: string;
    businessType: string;
    description: string | null;
    websiteUrl: string | null;
    apiKeyHash: string | null;
    apiKeyPrefix: string | null;
    webhookUrls: string[] | null;
    webhookSecret: string | null;
    customStrategy: any | null;
    endUserYieldPortion: string | null;
    supportedCurrencies: any | null;
    bankAccounts: any | null;
    isActive: boolean;
    isSandbox: boolean;
    platformFee: string | null;
    performanceFee: string | null;
    createdAt: Date;
    updatedAt: Date;
    customerTier: string | null;
}

export async function updateClient(sql: Sql, args: UpdateClientArgs): Promise<UpdateClientRow | null> {
    const rows = await sql.unsafe(updateClientQuery, [args.id, args.companyName, args.businessType, args.description, args.websiteUrl, args.customerTier, args.webhookUrls, args.webhookSecret, args.customStrategy, args.endUserYieldPortion, args.platformFee, args.performanceFee]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        privyAccountId: row[1],
        productId: row[2],
        companyName: row[3],
        businessType: row[4],
        description: row[5],
        websiteUrl: row[6],
        apiKeyHash: row[7],
        apiKeyPrefix: row[8],
        webhookUrls: row[9],
        webhookSecret: row[10],
        customStrategy: row[11],
        endUserYieldPortion: row[12],
        supportedCurrencies: row[13],
        bankAccounts: row[14],
        isActive: row[15],
        isSandbox: row[16],
        platformFee: row[17],
        performanceFee: row[18],
        createdAt: row[19],
        updatedAt: row[20],
        customerTier: row[21]
    };
}

export const updateClientAPIKeyQuery = `-- name: UpdateClientAPIKey :exec
UPDATE client_organizations
SET api_key_hash = $2,
    api_key_prefix = $3,
    updated_at = now()
WHERE id = $1`;

export interface UpdateClientAPIKeyArgs {
    id: string;
    apiKeyHash: string | null;
    apiKeyPrefix: string | null;
}

export async function updateClientAPIKey(sql: Sql, args: UpdateClientAPIKeyArgs): Promise<void> {
    await sql.unsafe(updateClientAPIKeyQuery, [args.id, args.apiKeyHash, args.apiKeyPrefix]);
}

export const activateClientQuery = `-- name: ActivateClient :exec
UPDATE client_organizations
SET is_active = true,
    updated_at = now()
WHERE id = $1`;

export interface ActivateClientArgs {
    id: string;
}

export async function activateClient(sql: Sql, args: ActivateClientArgs): Promise<void> {
    await sql.unsafe(activateClientQuery, [args.id]);
}

export const deactivateClientQuery = `-- name: DeactivateClient :exec
UPDATE client_organizations
SET is_active = false,
    updated_at = now()
WHERE id = $1`;

export interface DeactivateClientArgs {
    id: string;
}

export async function deactivateClient(sql: Sql, args: DeactivateClientArgs): Promise<void> {
    await sql.unsafe(deactivateClientQuery, [args.id]);
}

export const deleteClientQuery = `-- name: DeleteClient :exec
DELETE FROM client_organizations
WHERE id = $1`;

export interface DeleteClientArgs {
    id: string;
}

export async function deleteClient(sql: Sql, args: DeleteClientArgs): Promise<void> {
    await sql.unsafe(deleteClientQuery, [args.id]);
}

export const getClientBalanceQuery = `-- name: GetClientBalance :one

SELECT id, client_id, available, reserved, currency, last_topup_at, created_at, updated_at FROM client_balances
WHERE client_id = $1 LIMIT 1`;

export interface GetClientBalanceArgs {
    clientId: string;
}

export interface GetClientBalanceRow {
    id: string;
    clientId: string;
    available: string;
    reserved: string;
    currency: string;
    lastTopupAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function getClientBalance(sql: Sql, args: GetClientBalanceArgs): Promise<GetClientBalanceRow | null> {
    const rows = await sql.unsafe(getClientBalanceQuery, [args.clientId]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        clientId: row[1],
        available: row[2],
        reserved: row[3],
        currency: row[4],
        lastTopupAt: row[5],
        createdAt: row[6],
        updatedAt: row[7]
    };
}

export const getClientBalanceForUpdateQuery = `-- name: GetClientBalanceForUpdate :one
SELECT id, client_id, available, reserved, currency, last_topup_at, created_at, updated_at FROM client_balances
WHERE client_id = $1
FOR UPDATE
LIMIT 1`;

export interface GetClientBalanceForUpdateArgs {
    clientId: string;
}

export interface GetClientBalanceForUpdateRow {
    id: string;
    clientId: string;
    available: string;
    reserved: string;
    currency: string;
    lastTopupAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function getClientBalanceForUpdate(sql: Sql, args: GetClientBalanceForUpdateArgs): Promise<GetClientBalanceForUpdateRow | null> {
    const rows = await sql.unsafe(getClientBalanceForUpdateQuery, [args.clientId]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        clientId: row[1],
        available: row[2],
        reserved: row[3],
        currency: row[4],
        lastTopupAt: row[5],
        createdAt: row[6],
        updatedAt: row[7]
    };
}

export const createClientBalanceQuery = `-- name: CreateClientBalance :one
INSERT INTO client_balances (
  client_id,
  available,
  reserved,
  currency
) VALUES (
  $1, $2, $3, $4
)
RETURNING id, client_id, available, reserved, currency, last_topup_at, created_at, updated_at`;

export interface CreateClientBalanceArgs {
    clientId: string;
    available: string;
    reserved: string;
    currency: string;
}

export interface CreateClientBalanceRow {
    id: string;
    clientId: string;
    available: string;
    reserved: string;
    currency: string;
    lastTopupAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function createClientBalance(sql: Sql, args: CreateClientBalanceArgs): Promise<CreateClientBalanceRow | null> {
    const rows = await sql.unsafe(createClientBalanceQuery, [args.clientId, args.available, args.reserved, args.currency]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        clientId: row[1],
        available: row[2],
        reserved: row[3],
        currency: row[4],
        lastTopupAt: row[5],
        createdAt: row[6],
        updatedAt: row[7]
    };
}

export const addToAvailableBalanceQuery = `-- name: AddToAvailableBalance :exec
UPDATE client_balances
SET available = available + $2,
    last_topup_at = now(),
    updated_at = now()
WHERE client_id = $1`;

export interface AddToAvailableBalanceArgs {
    clientId: string;
    available: string;
}

export async function addToAvailableBalance(sql: Sql, args: AddToAvailableBalanceArgs): Promise<void> {
    await sql.unsafe(addToAvailableBalanceQuery, [args.clientId, args.available]);
}

export const reserveBalanceQuery = `-- name: ReserveBalance :exec
UPDATE client_balances
SET available = available - $2,
    reserved = reserved + $2,
    updated_at = now()
WHERE client_id = $1
  AND available >= $2`;

export interface ReserveBalanceArgs {
    clientId: string;
    available: string;
}

export async function reserveBalance(sql: Sql, args: ReserveBalanceArgs): Promise<void> {
    await sql.unsafe(reserveBalanceQuery, [args.clientId, args.available]);
}

export const releaseReservedBalanceQuery = `-- name: ReleaseReservedBalance :exec

UPDATE client_balances
SET reserved = reserved - $2,
    available = available + $2,
    updated_at = now()
WHERE client_id = $1
  AND reserved >= $2`;

export interface ReleaseReservedBalanceArgs {
    clientId: string;
    reserved: string;
}

export async function releaseReservedBalance(sql: Sql, args: ReleaseReservedBalanceArgs): Promise<void> {
    await sql.unsafe(releaseReservedBalanceQuery, [args.clientId, args.reserved]);
}

export const deductFromAvailableQuery = `-- name: DeductFromAvailable :exec
UPDATE client_balances
SET available = available - $2,
    updated_at = now()
WHERE client_id = $1
  AND available >= $2`;

export interface DeductFromAvailableArgs {
    clientId: string;
    available: string;
}

export async function deductFromAvailable(sql: Sql, args: DeductFromAvailableArgs): Promise<void> {
    await sql.unsafe(deductFromAvailableQuery, [args.clientId, args.available]);
}

export const deductReservedBalanceQuery = `-- name: DeductReservedBalance :exec
UPDATE client_balances
SET reserved = reserved - $2,
    updated_at = now()
WHERE client_id = $1
  AND reserved >= $2`;

export interface DeductReservedBalanceArgs {
    clientId: string;
    reserved: string;
}

export async function deductReservedBalance(sql: Sql, args: DeductReservedBalanceArgs): Promise<void> {
    await sql.unsafe(deductReservedBalanceQuery, [args.clientId, args.reserved]);
}

export const getClientStatsQuery = `-- name: GetClientStats :one

SELECT
  c.id,
  c.product_id,
  c.company_name,
  c.is_active,
  c.created_at,
  cb.available AS balance_available,
  cb.reserved AS balance_reserved,
  COUNT(DISTINCT eu.id) AS total_end_users,
  COUNT(DISTINCT cv.id) AS total_vaults,
  COALESCE(SUM(cv.total_staked_balance), 0) AS total_aum,
  COALESCE(SUM(cv.cumulative_yield), 0) AS total_yield_earned,
  COUNT(DISTINCT dt.id) FILTER (WHERE dt.status = 'completed') AS total_deposits,
  COUNT(DISTINCT wt.id) FILTER (WHERE wt.status = 'completed') AS total_withdrawals
FROM client_organizations c
LEFT JOIN client_balances cb ON c.id = cb.client_id
LEFT JOIN end_users eu ON c.id = eu.client_id AND eu.is_active = true
LEFT JOIN client_vaults cv ON c.id = cv.client_id AND cv.is_active = true
LEFT JOIN deposit_transactions dt ON c.id = dt.client_id
LEFT JOIN withdrawal_transactions wt ON c.id = wt.client_id
WHERE c.id = $1
GROUP BY c.id, cb.available, cb.reserved`;

export interface GetClientStatsArgs {
    id: string;
}

export interface GetClientStatsRow {
    id: string;
    productId: string;
    companyName: string;
    isActive: boolean;
    createdAt: Date;
    balanceAvailable: string | null;
    balanceReserved: string | null;
    totalEndUsers: string;
    totalVaults: string;
    totalAum: string | null;
    totalYieldEarned: string | null;
    totalDeposits: string;
    totalWithdrawals: string;
}

export async function getClientStats(sql: Sql, args: GetClientStatsArgs): Promise<GetClientStatsRow | null> {
    const rows = await sql.unsafe(getClientStatsQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        productId: row[1],
        companyName: row[2],
        isActive: row[3],
        createdAt: row[4],
        balanceAvailable: row[5],
        balanceReserved: row[6],
        totalEndUsers: row[7],
        totalVaults: row[8],
        totalAum: row[9],
        totalYieldEarned: row[10],
        totalDeposits: row[11],
        totalWithdrawals: row[12]
    };
}

