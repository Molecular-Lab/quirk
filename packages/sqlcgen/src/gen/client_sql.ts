import { Sql } from "postgres";

export const createClientQuery = `-- name: CreateClient :one

INSERT INTO client_organizations (
  privy_account_id,
  product_id,
  company_name,
  business_type,
  description,
  website_url
)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id, privy_account_id, product_id, company_name, business_type, description, website_url, api_key_hash, api_key_prefix, webhook_urls, webhook_secret, custom_strategy, client_revenue_share_percent, platform_fee_percent, performance_fee, monthly_recurring_revenue, annual_run_rate, last_mrr_calculation_at, supported_currencies, bank_accounts, is_active, is_sandbox, customer_tier, strategies_preferences, strategies_customization, created_at, updated_at, idle_balance, earning_balance, client_revenue_earned, platform_revenue_earned, enduser_revenue_earned, total_end_users, new_users_30d, active_users_30d, total_deposited, total_withdrawn`;

export interface CreateClientArgs {
    privyAccountId: string;
    productId: string;
    companyName: string;
    businessType: string;
    description: string | null;
    websiteUrl: string | null;
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
    clientRevenueSharePercent: string;
    platformFeePercent: string;
    performanceFee: string | null;
    monthlyRecurringRevenue: string | null;
    annualRunRate: string | null;
    lastMrrCalculationAt: Date | null;
    supportedCurrencies: any | null;
    bankAccounts: any | null;
    isActive: boolean;
    isSandbox: boolean;
    customerTier: string | null;
    strategiesPreferences: any | null;
    strategiesCustomization: any | null;
    createdAt: Date;
    updatedAt: Date;
    idleBalance: string | null;
    earningBalance: string | null;
    clientRevenueEarned: string | null;
    platformRevenueEarned: string | null;
    enduserRevenueEarned: string | null;
    totalEndUsers: number | null;
    newUsers_30d: number | null;
    activeUsers_30d: number | null;
    totalDeposited: string | null;
    totalWithdrawn: string | null;
}

export async function createClient(sql: Sql, args: CreateClientArgs): Promise<CreateClientRow | null> {
    const rows = await sql.unsafe(createClientQuery, [args.privyAccountId, args.productId, args.companyName, args.businessType, args.description, args.websiteUrl]).values();
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
        clientRevenueSharePercent: row[12],
        platformFeePercent: row[13],
        performanceFee: row[14],
        monthlyRecurringRevenue: row[15],
        annualRunRate: row[16],
        lastMrrCalculationAt: row[17],
        supportedCurrencies: row[18],
        bankAccounts: row[19],
        isActive: row[20],
        isSandbox: row[21],
        customerTier: row[22],
        strategiesPreferences: row[23],
        strategiesCustomization: row[24],
        createdAt: row[25],
        updatedAt: row[26],
        idleBalance: row[27],
        earningBalance: row[28],
        clientRevenueEarned: row[29],
        platformRevenueEarned: row[30],
        enduserRevenueEarned: row[31],
        totalEndUsers: row[32],
        newUsers_30d: row[33],
        activeUsers_30d: row[34],
        totalDeposited: row[35],
        totalWithdrawn: row[36]
    };
}

export const getClientQuery = `-- name: GetClient :one
SELECT
  co.id, co.privy_account_id, co.product_id, co.company_name, co.business_type, co.description, co.website_url, co.api_key_hash, co.api_key_prefix, co.webhook_urls, co.webhook_secret, co.custom_strategy, co.client_revenue_share_percent, co.platform_fee_percent, co.performance_fee, co.monthly_recurring_revenue, co.annual_run_rate, co.last_mrr_calculation_at, co.supported_currencies, co.bank_accounts, co.is_active, co.is_sandbox, co.customer_tier, co.strategies_preferences, co.strategies_customization, co.created_at, co.updated_at, co.idle_balance, co.earning_balance, co.client_revenue_earned, co.platform_revenue_earned, co.enduser_revenue_earned, co.total_end_users, co.new_users_30d, co.active_users_30d, co.total_deposited, co.total_withdrawn,
  pa.privy_wallet_address,
  pa.privy_organization_id,
  pa.wallet_type
FROM client_organizations co
JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE co.id = $1`;

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
    clientRevenueSharePercent: string;
    platformFeePercent: string;
    performanceFee: string | null;
    monthlyRecurringRevenue: string | null;
    annualRunRate: string | null;
    lastMrrCalculationAt: Date | null;
    supportedCurrencies: any | null;
    bankAccounts: any | null;
    isActive: boolean;
    isSandbox: boolean;
    customerTier: string | null;
    strategiesPreferences: any | null;
    strategiesCustomization: any | null;
    createdAt: Date;
    updatedAt: Date;
    idleBalance: string | null;
    earningBalance: string | null;
    clientRevenueEarned: string | null;
    platformRevenueEarned: string | null;
    enduserRevenueEarned: string | null;
    totalEndUsers: number | null;
    newUsers_30d: number | null;
    activeUsers_30d: number | null;
    totalDeposited: string | null;
    totalWithdrawn: string | null;
    privyWalletAddress: string;
    privyOrganizationId: string;
    walletType: string;
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
        clientRevenueSharePercent: row[12],
        platformFeePercent: row[13],
        performanceFee: row[14],
        monthlyRecurringRevenue: row[15],
        annualRunRate: row[16],
        lastMrrCalculationAt: row[17],
        supportedCurrencies: row[18],
        bankAccounts: row[19],
        isActive: row[20],
        isSandbox: row[21],
        customerTier: row[22],
        strategiesPreferences: row[23],
        strategiesCustomization: row[24],
        createdAt: row[25],
        updatedAt: row[26],
        idleBalance: row[27],
        earningBalance: row[28],
        clientRevenueEarned: row[29],
        platformRevenueEarned: row[30],
        enduserRevenueEarned: row[31],
        totalEndUsers: row[32],
        newUsers_30d: row[33],
        activeUsers_30d: row[34],
        totalDeposited: row[35],
        totalWithdrawn: row[36],
        privyWalletAddress: row[37],
        privyOrganizationId: row[38],
        walletType: row[39]
    };
}

export const getClientByProductIdQuery = `-- name: GetClientByProductId :one
SELECT
  co.id, co.privy_account_id, co.product_id, co.company_name, co.business_type, co.description, co.website_url, co.api_key_hash, co.api_key_prefix, co.webhook_urls, co.webhook_secret, co.custom_strategy, co.client_revenue_share_percent, co.platform_fee_percent, co.performance_fee, co.monthly_recurring_revenue, co.annual_run_rate, co.last_mrr_calculation_at, co.supported_currencies, co.bank_accounts, co.is_active, co.is_sandbox, co.customer_tier, co.strategies_preferences, co.strategies_customization, co.created_at, co.updated_at, co.idle_balance, co.earning_balance, co.client_revenue_earned, co.platform_revenue_earned, co.enduser_revenue_earned, co.total_end_users, co.new_users_30d, co.active_users_30d, co.total_deposited, co.total_withdrawn,
  pa.privy_wallet_address,
  pa.privy_organization_id,
  pa.wallet_type
FROM client_organizations co
JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE co.product_id = $1`;

export interface GetClientByProductIdArgs {
    productId: string;
}

export interface GetClientByProductIdRow {
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
    clientRevenueSharePercent: string;
    platformFeePercent: string;
    performanceFee: string | null;
    monthlyRecurringRevenue: string | null;
    annualRunRate: string | null;
    lastMrrCalculationAt: Date | null;
    supportedCurrencies: any | null;
    bankAccounts: any | null;
    isActive: boolean;
    isSandbox: boolean;
    customerTier: string | null;
    strategiesPreferences: any | null;
    strategiesCustomization: any | null;
    createdAt: Date;
    updatedAt: Date;
    idleBalance: string | null;
    earningBalance: string | null;
    clientRevenueEarned: string | null;
    platformRevenueEarned: string | null;
    enduserRevenueEarned: string | null;
    totalEndUsers: number | null;
    newUsers_30d: number | null;
    activeUsers_30d: number | null;
    totalDeposited: string | null;
    totalWithdrawn: string | null;
    privyWalletAddress: string;
    privyOrganizationId: string;
    walletType: string;
}

export async function getClientByProductId(sql: Sql, args: GetClientByProductIdArgs): Promise<GetClientByProductIdRow | null> {
    const rows = await sql.unsafe(getClientByProductIdQuery, [args.productId]).values();
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
        clientRevenueSharePercent: row[12],
        platformFeePercent: row[13],
        performanceFee: row[14],
        monthlyRecurringRevenue: row[15],
        annualRunRate: row[16],
        lastMrrCalculationAt: row[17],
        supportedCurrencies: row[18],
        bankAccounts: row[19],
        isActive: row[20],
        isSandbox: row[21],
        customerTier: row[22],
        strategiesPreferences: row[23],
        strategiesCustomization: row[24],
        createdAt: row[25],
        updatedAt: row[26],
        idleBalance: row[27],
        earningBalance: row[28],
        clientRevenueEarned: row[29],
        platformRevenueEarned: row[30],
        enduserRevenueEarned: row[31],
        totalEndUsers: row[32],
        newUsers_30d: row[33],
        activeUsers_30d: row[34],
        totalDeposited: row[35],
        totalWithdrawn: row[36],
        privyWalletAddress: row[37],
        privyOrganizationId: row[38],
        walletType: row[39]
    };
}

export const getClientByPrivyOrgIdQuery = `-- name: GetClientByPrivyOrgId :one
SELECT co.id, co.privy_account_id, co.product_id, co.company_name, co.business_type, co.description, co.website_url, co.api_key_hash, co.api_key_prefix, co.webhook_urls, co.webhook_secret, co.custom_strategy, co.client_revenue_share_percent, co.platform_fee_percent, co.performance_fee, co.monthly_recurring_revenue, co.annual_run_rate, co.last_mrr_calculation_at, co.supported_currencies, co.bank_accounts, co.is_active, co.is_sandbox, co.customer_tier, co.strategies_preferences, co.strategies_customization, co.created_at, co.updated_at, co.idle_balance, co.earning_balance, co.client_revenue_earned, co.platform_revenue_earned, co.enduser_revenue_earned, co.total_end_users, co.new_users_30d, co.active_users_30d, co.total_deposited, co.total_withdrawn FROM client_organizations co
JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE pa.privy_organization_id = $1
LIMIT 1`;

export interface GetClientByPrivyOrgIdArgs {
    privyOrganizationId: string;
}

export interface GetClientByPrivyOrgIdRow {
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
    clientRevenueSharePercent: string;
    platformFeePercent: string;
    performanceFee: string | null;
    monthlyRecurringRevenue: string | null;
    annualRunRate: string | null;
    lastMrrCalculationAt: Date | null;
    supportedCurrencies: any | null;
    bankAccounts: any | null;
    isActive: boolean;
    isSandbox: boolean;
    customerTier: string | null;
    strategiesPreferences: any | null;
    strategiesCustomization: any | null;
    createdAt: Date;
    updatedAt: Date;
    idleBalance: string | null;
    earningBalance: string | null;
    clientRevenueEarned: string | null;
    platformRevenueEarned: string | null;
    enduserRevenueEarned: string | null;
    totalEndUsers: number | null;
    newUsers_30d: number | null;
    activeUsers_30d: number | null;
    totalDeposited: string | null;
    totalWithdrawn: string | null;
}

export async function getClientByPrivyOrgId(sql: Sql, args: GetClientByPrivyOrgIdArgs): Promise<GetClientByPrivyOrgIdRow | null> {
    const rows = await sql.unsafe(getClientByPrivyOrgIdQuery, [args.privyOrganizationId]).values();
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
        clientRevenueSharePercent: row[12],
        platformFeePercent: row[13],
        performanceFee: row[14],
        monthlyRecurringRevenue: row[15],
        annualRunRate: row[16],
        lastMrrCalculationAt: row[17],
        supportedCurrencies: row[18],
        bankAccounts: row[19],
        isActive: row[20],
        isSandbox: row[21],
        customerTier: row[22],
        strategiesPreferences: row[23],
        strategiesCustomization: row[24],
        createdAt: row[25],
        updatedAt: row[26],
        idleBalance: row[27],
        earningBalance: row[28],
        clientRevenueEarned: row[29],
        platformRevenueEarned: row[30],
        enduserRevenueEarned: row[31],
        totalEndUsers: row[32],
        newUsers_30d: row[33],
        activeUsers_30d: row[34],
        totalDeposited: row[35],
        totalWithdrawn: row[36]
    };
}

export const getAllClientsByPrivyOrgIdQuery = `-- name: GetAllClientsByPrivyOrgId :many
SELECT
  co.id, co.privy_account_id, co.product_id, co.company_name, co.business_type, co.description, co.website_url, co.api_key_hash, co.api_key_prefix, co.webhook_urls, co.webhook_secret, co.custom_strategy, co.client_revenue_share_percent, co.platform_fee_percent, co.performance_fee, co.monthly_recurring_revenue, co.annual_run_rate, co.last_mrr_calculation_at, co.supported_currencies, co.bank_accounts, co.is_active, co.is_sandbox, co.customer_tier, co.strategies_preferences, co.strategies_customization, co.created_at, co.updated_at, co.idle_balance, co.earning_balance, co.client_revenue_earned, co.platform_revenue_earned, co.enduser_revenue_earned, co.total_end_users, co.new_users_30d, co.active_users_30d, co.total_deposited, co.total_withdrawn,
  pa.privy_organization_id,
  pa.wallet_type
FROM client_organizations co
JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE pa.privy_organization_id = $1
  AND co.is_active = true
ORDER BY co.created_at DESC`;

export interface GetAllClientsByPrivyOrgIdArgs {
    privyOrganizationId: string;
}

export interface GetAllClientsByPrivyOrgIdRow {
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
    clientRevenueSharePercent: string;
    platformFeePercent: string;
    performanceFee: string | null;
    monthlyRecurringRevenue: string | null;
    annualRunRate: string | null;
    lastMrrCalculationAt: Date | null;
    supportedCurrencies: any | null;
    bankAccounts: any | null;
    isActive: boolean;
    isSandbox: boolean;
    customerTier: string | null;
    strategiesPreferences: any | null;
    strategiesCustomization: any | null;
    createdAt: Date;
    updatedAt: Date;
    idleBalance: string | null;
    earningBalance: string | null;
    clientRevenueEarned: string | null;
    platformRevenueEarned: string | null;
    enduserRevenueEarned: string | null;
    totalEndUsers: number | null;
    newUsers_30d: number | null;
    activeUsers_30d: number | null;
    totalDeposited: string | null;
    totalWithdrawn: string | null;
    privyOrganizationId: string;
    walletType: string;
}

export async function getAllClientsByPrivyOrgId(sql: Sql, args: GetAllClientsByPrivyOrgIdArgs): Promise<GetAllClientsByPrivyOrgIdRow[]> {
    return (await sql.unsafe(getAllClientsByPrivyOrgIdQuery, [args.privyOrganizationId]).values()).map(row => ({
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
        clientRevenueSharePercent: row[12],
        platformFeePercent: row[13],
        performanceFee: row[14],
        monthlyRecurringRevenue: row[15],
        annualRunRate: row[16],
        lastMrrCalculationAt: row[17],
        supportedCurrencies: row[18],
        bankAccounts: row[19],
        isActive: row[20],
        isSandbox: row[21],
        customerTier: row[22],
        strategiesPreferences: row[23],
        strategiesCustomization: row[24],
        createdAt: row[25],
        updatedAt: row[26],
        idleBalance: row[27],
        earningBalance: row[28],
        clientRevenueEarned: row[29],
        platformRevenueEarned: row[30],
        enduserRevenueEarned: row[31],
        totalEndUsers: row[32],
        newUsers_30d: row[33],
        activeUsers_30d: row[34],
        totalDeposited: row[35],
        totalWithdrawn: row[36],
        privyOrganizationId: row[37],
        walletType: row[38]
    }));
}

export const listClientsQuery = `-- name: ListClients :many
SELECT id, privy_account_id, product_id, company_name, business_type, description, website_url, api_key_hash, api_key_prefix, webhook_urls, webhook_secret, custom_strategy, client_revenue_share_percent, platform_fee_percent, performance_fee, monthly_recurring_revenue, annual_run_rate, last_mrr_calculation_at, supported_currencies, bank_accounts, is_active, is_sandbox, customer_tier, strategies_preferences, strategies_customization, created_at, updated_at, idle_balance, earning_balance, client_revenue_earned, platform_revenue_earned, enduser_revenue_earned, total_end_users, new_users_30d, active_users_30d, total_deposited, total_withdrawn FROM client_organizations
WHERE is_active = true
ORDER BY created_at DESC
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
    clientRevenueSharePercent: string;
    platformFeePercent: string;
    performanceFee: string | null;
    monthlyRecurringRevenue: string | null;
    annualRunRate: string | null;
    lastMrrCalculationAt: Date | null;
    supportedCurrencies: any | null;
    bankAccounts: any | null;
    isActive: boolean;
    isSandbox: boolean;
    customerTier: string | null;
    strategiesPreferences: any | null;
    strategiesCustomization: any | null;
    createdAt: Date;
    updatedAt: Date;
    idleBalance: string | null;
    earningBalance: string | null;
    clientRevenueEarned: string | null;
    platformRevenueEarned: string | null;
    enduserRevenueEarned: string | null;
    totalEndUsers: number | null;
    newUsers_30d: number | null;
    activeUsers_30d: number | null;
    totalDeposited: string | null;
    totalWithdrawn: string | null;
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
        clientRevenueSharePercent: row[12],
        platformFeePercent: row[13],
        performanceFee: row[14],
        monthlyRecurringRevenue: row[15],
        annualRunRate: row[16],
        lastMrrCalculationAt: row[17],
        supportedCurrencies: row[18],
        bankAccounts: row[19],
        isActive: row[20],
        isSandbox: row[21],
        customerTier: row[22],
        strategiesPreferences: row[23],
        strategiesCustomization: row[24],
        createdAt: row[25],
        updatedAt: row[26],
        idleBalance: row[27],
        earningBalance: row[28],
        clientRevenueEarned: row[29],
        platformRevenueEarned: row[30],
        enduserRevenueEarned: row[31],
        totalEndUsers: row[32],
        newUsers_30d: row[33],
        activeUsers_30d: row[34],
        totalDeposited: row[35],
        totalWithdrawn: row[36]
    }));
}

export const updateClientQuery = `-- name: UpdateClient :one
UPDATE client_organizations
SET
  company_name = COALESCE($2, company_name),
  description = COALESCE($3, description),
  website_url = COALESCE($4, website_url),
  updated_at = now()
WHERE id = $1
RETURNING id, privy_account_id, product_id, company_name, business_type, description, website_url, api_key_hash, api_key_prefix, webhook_urls, webhook_secret, custom_strategy, client_revenue_share_percent, platform_fee_percent, performance_fee, monthly_recurring_revenue, annual_run_rate, last_mrr_calculation_at, supported_currencies, bank_accounts, is_active, is_sandbox, customer_tier, strategies_preferences, strategies_customization, created_at, updated_at, idle_balance, earning_balance, client_revenue_earned, platform_revenue_earned, enduser_revenue_earned, total_end_users, new_users_30d, active_users_30d, total_deposited, total_withdrawn`;

export interface UpdateClientArgs {
    id: string;
    companyName: string | null;
    description: string | null;
    websiteUrl: string | null;
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
    clientRevenueSharePercent: string;
    platformFeePercent: string;
    performanceFee: string | null;
    monthlyRecurringRevenue: string | null;
    annualRunRate: string | null;
    lastMrrCalculationAt: Date | null;
    supportedCurrencies: any | null;
    bankAccounts: any | null;
    isActive: boolean;
    isSandbox: boolean;
    customerTier: string | null;
    strategiesPreferences: any | null;
    strategiesCustomization: any | null;
    createdAt: Date;
    updatedAt: Date;
    idleBalance: string | null;
    earningBalance: string | null;
    clientRevenueEarned: string | null;
    platformRevenueEarned: string | null;
    enduserRevenueEarned: string | null;
    totalEndUsers: number | null;
    newUsers_30d: number | null;
    activeUsers_30d: number | null;
    totalDeposited: string | null;
    totalWithdrawn: string | null;
}

export async function updateClient(sql: Sql, args: UpdateClientArgs): Promise<UpdateClientRow | null> {
    const rows = await sql.unsafe(updateClientQuery, [args.id, args.companyName, args.description, args.websiteUrl]).values();
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
        clientRevenueSharePercent: row[12],
        platformFeePercent: row[13],
        performanceFee: row[14],
        monthlyRecurringRevenue: row[15],
        annualRunRate: row[16],
        lastMrrCalculationAt: row[17],
        supportedCurrencies: row[18],
        bankAccounts: row[19],
        isActive: row[20],
        isSandbox: row[21],
        customerTier: row[22],
        strategiesPreferences: row[23],
        strategiesCustomization: row[24],
        createdAt: row[25],
        updatedAt: row[26],
        idleBalance: row[27],
        earningBalance: row[28],
        clientRevenueEarned: row[29],
        platformRevenueEarned: row[30],
        enduserRevenueEarned: row[31],
        totalEndUsers: row[32],
        newUsers_30d: row[33],
        activeUsers_30d: row[34],
        totalDeposited: row[35],
        totalWithdrawn: row[36]
    };
}

export const updateClientByProductIdQuery = `-- name: UpdateClientByProductId :one
UPDATE client_organizations
SET
  company_name = COALESCE($2, company_name),
  description = COALESCE($3, description),
  website_url = COALESCE($4, website_url),
  updated_at = now()
WHERE product_id = $1
RETURNING id, privy_account_id, product_id, company_name, business_type, description, website_url, api_key_hash, api_key_prefix, webhook_urls, webhook_secret, custom_strategy, client_revenue_share_percent, platform_fee_percent, performance_fee, monthly_recurring_revenue, annual_run_rate, last_mrr_calculation_at, supported_currencies, bank_accounts, is_active, is_sandbox, customer_tier, strategies_preferences, strategies_customization, created_at, updated_at, idle_balance, earning_balance, client_revenue_earned, platform_revenue_earned, enduser_revenue_earned, total_end_users, new_users_30d, active_users_30d, total_deposited, total_withdrawn`;

export interface UpdateClientByProductIdArgs {
    productId: string;
    companyName: string | null;
    description: string | null;
    websiteUrl: string | null;
}

export interface UpdateClientByProductIdRow {
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
    clientRevenueSharePercent: string;
    platformFeePercent: string;
    performanceFee: string | null;
    monthlyRecurringRevenue: string | null;
    annualRunRate: string | null;
    lastMrrCalculationAt: Date | null;
    supportedCurrencies: any | null;
    bankAccounts: any | null;
    isActive: boolean;
    isSandbox: boolean;
    customerTier: string | null;
    strategiesPreferences: any | null;
    strategiesCustomization: any | null;
    createdAt: Date;
    updatedAt: Date;
    idleBalance: string | null;
    earningBalance: string | null;
    clientRevenueEarned: string | null;
    platformRevenueEarned: string | null;
    enduserRevenueEarned: string | null;
    totalEndUsers: number | null;
    newUsers_30d: number | null;
    activeUsers_30d: number | null;
    totalDeposited: string | null;
    totalWithdrawn: string | null;
}

export async function updateClientByProductId(sql: Sql, args: UpdateClientByProductIdArgs): Promise<UpdateClientByProductIdRow | null> {
    const rows = await sql.unsafe(updateClientByProductIdQuery, [args.productId, args.companyName, args.description, args.websiteUrl]).values();
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
        clientRevenueSharePercent: row[12],
        platformFeePercent: row[13],
        performanceFee: row[14],
        monthlyRecurringRevenue: row[15],
        annualRunRate: row[16],
        lastMrrCalculationAt: row[17],
        supportedCurrencies: row[18],
        bankAccounts: row[19],
        isActive: row[20],
        isSandbox: row[21],
        customerTier: row[22],
        strategiesPreferences: row[23],
        strategiesCustomization: row[24],
        createdAt: row[25],
        updatedAt: row[26],
        idleBalance: row[27],
        earningBalance: row[28],
        clientRevenueEarned: row[29],
        platformRevenueEarned: row[30],
        enduserRevenueEarned: row[31],
        totalEndUsers: row[32],
        newUsers_30d: row[33],
        activeUsers_30d: row[34],
        totalDeposited: row[35],
        totalWithdrawn: row[36]
    };
}

export const deactivateClientQuery = `-- name: DeactivateClient :exec
UPDATE client_organizations
SET is_active = false, updated_at = now()
WHERE id = $1`;

export interface DeactivateClientArgs {
    id: string;
}

export async function deactivateClient(sql: Sql, args: DeactivateClientArgs): Promise<void> {
    await sql.unsafe(deactivateClientQuery, [args.id]);
}

export const activateClientQuery = `-- name: ActivateClient :exec
UPDATE client_organizations
SET is_active = true, updated_at = now()
WHERE id = $1`;

export interface ActivateClientArgs {
    id: string;
}

export async function activateClient(sql: Sql, args: ActivateClientArgs): Promise<void> {
    await sql.unsafe(activateClientQuery, [args.id]);
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

export const storeAPIKeyQuery = `-- name: StoreAPIKey :one

UPDATE client_organizations
SET
  api_key_hash = $2,
  api_key_prefix = $3,
  updated_at = now()
WHERE id = $1
RETURNING api_key_prefix`;

export interface StoreAPIKeyArgs {
    id: string;
    apiKeyHash: string | null;
    apiKeyPrefix: string | null;
}

export interface StoreAPIKeyRow {
    apiKeyPrefix: string | null;
}

export async function storeAPIKey(sql: Sql, args: StoreAPIKeyArgs): Promise<StoreAPIKeyRow | null> {
    const rows = await sql.unsafe(storeAPIKeyQuery, [args.id, args.apiKeyHash, args.apiKeyPrefix]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        apiKeyPrefix: row[0]
    };
}

export const getClientByAPIKeyPrefixQuery = `-- name: GetClientByAPIKeyPrefix :one
SELECT id, privy_account_id, product_id, company_name, business_type, description, website_url, api_key_hash, api_key_prefix, webhook_urls, webhook_secret, custom_strategy, client_revenue_share_percent, platform_fee_percent, performance_fee, monthly_recurring_revenue, annual_run_rate, last_mrr_calculation_at, supported_currencies, bank_accounts, is_active, is_sandbox, customer_tier, strategies_preferences, strategies_customization, created_at, updated_at, idle_balance, earning_balance, client_revenue_earned, platform_revenue_earned, enduser_revenue_earned, total_end_users, new_users_30d, active_users_30d, total_deposited, total_withdrawn FROM client_organizations
WHERE api_key_prefix = $1 AND is_active = true`;

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
    clientRevenueSharePercent: string;
    platformFeePercent: string;
    performanceFee: string | null;
    monthlyRecurringRevenue: string | null;
    annualRunRate: string | null;
    lastMrrCalculationAt: Date | null;
    supportedCurrencies: any | null;
    bankAccounts: any | null;
    isActive: boolean;
    isSandbox: boolean;
    customerTier: string | null;
    strategiesPreferences: any | null;
    strategiesCustomization: any | null;
    createdAt: Date;
    updatedAt: Date;
    idleBalance: string | null;
    earningBalance: string | null;
    clientRevenueEarned: string | null;
    platformRevenueEarned: string | null;
    enduserRevenueEarned: string | null;
    totalEndUsers: number | null;
    newUsers_30d: number | null;
    activeUsers_30d: number | null;
    totalDeposited: string | null;
    totalWithdrawn: string | null;
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
        clientRevenueSharePercent: row[12],
        platformFeePercent: row[13],
        performanceFee: row[14],
        monthlyRecurringRevenue: row[15],
        annualRunRate: row[16],
        lastMrrCalculationAt: row[17],
        supportedCurrencies: row[18],
        bankAccounts: row[19],
        isActive: row[20],
        isSandbox: row[21],
        customerTier: row[22],
        strategiesPreferences: row[23],
        strategiesCustomization: row[24],
        createdAt: row[25],
        updatedAt: row[26],
        idleBalance: row[27],
        earningBalance: row[28],
        clientRevenueEarned: row[29],
        platformRevenueEarned: row[30],
        enduserRevenueEarned: row[31],
        totalEndUsers: row[32],
        newUsers_30d: row[33],
        activeUsers_30d: row[34],
        totalDeposited: row[35],
        totalWithdrawn: row[36]
    };
}

export const getClientByAPIKeyHashQuery = `-- name: GetClientByAPIKeyHash :one
SELECT id, privy_account_id, product_id, company_name, business_type, description, website_url, api_key_hash, api_key_prefix, webhook_urls, webhook_secret, custom_strategy, client_revenue_share_percent, platform_fee_percent, performance_fee, monthly_recurring_revenue, annual_run_rate, last_mrr_calculation_at, supported_currencies, bank_accounts, is_active, is_sandbox, customer_tier, strategies_preferences, strategies_customization, created_at, updated_at, idle_balance, earning_balance, client_revenue_earned, platform_revenue_earned, enduser_revenue_earned, total_end_users, new_users_30d, active_users_30d, total_deposited, total_withdrawn FROM client_organizations
WHERE api_key_hash = $1 AND is_active = true`;

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
    clientRevenueSharePercent: string;
    platformFeePercent: string;
    performanceFee: string | null;
    monthlyRecurringRevenue: string | null;
    annualRunRate: string | null;
    lastMrrCalculationAt: Date | null;
    supportedCurrencies: any | null;
    bankAccounts: any | null;
    isActive: boolean;
    isSandbox: boolean;
    customerTier: string | null;
    strategiesPreferences: any | null;
    strategiesCustomization: any | null;
    createdAt: Date;
    updatedAt: Date;
    idleBalance: string | null;
    earningBalance: string | null;
    clientRevenueEarned: string | null;
    platformRevenueEarned: string | null;
    enduserRevenueEarned: string | null;
    totalEndUsers: number | null;
    newUsers_30d: number | null;
    activeUsers_30d: number | null;
    totalDeposited: string | null;
    totalWithdrawn: string | null;
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
        clientRevenueSharePercent: row[12],
        platformFeePercent: row[13],
        performanceFee: row[14],
        monthlyRecurringRevenue: row[15],
        annualRunRate: row[16],
        lastMrrCalculationAt: row[17],
        supportedCurrencies: row[18],
        bankAccounts: row[19],
        isActive: row[20],
        isSandbox: row[21],
        customerTier: row[22],
        strategiesPreferences: row[23],
        strategiesCustomization: row[24],
        createdAt: row[25],
        updatedAt: row[26],
        idleBalance: row[27],
        earningBalance: row[28],
        clientRevenueEarned: row[29],
        platformRevenueEarned: row[30],
        enduserRevenueEarned: row[31],
        totalEndUsers: row[32],
        newUsers_30d: row[33],
        activeUsers_30d: row[34],
        totalDeposited: row[35],
        totalWithdrawn: row[36]
    };
}

export const revokeAPIKeyQuery = `-- name: RevokeAPIKey :exec
UPDATE client_organizations
SET
  api_key_hash = NULL,
  api_key_prefix = NULL,
  updated_at = now()
WHERE id = $1`;

export interface RevokeAPIKeyArgs {
    id: string;
}

export async function revokeAPIKey(sql: Sql, args: RevokeAPIKeyArgs): Promise<void> {
    await sql.unsafe(revokeAPIKeyQuery, [args.id]);
}

export const updateWebhookConfigQuery = `-- name: UpdateWebhookConfig :one

UPDATE client_organizations
SET
  webhook_urls = $2,
  webhook_secret = $3,
  updated_at = now()
WHERE id = $1
RETURNING webhook_urls, webhook_secret`;

export interface UpdateWebhookConfigArgs {
    id: string;
    webhookUrls: string[] | null;
    webhookSecret: string | null;
}

export interface UpdateWebhookConfigRow {
    webhookUrls: string[] | null;
    webhookSecret: string | null;
}

export async function updateWebhookConfig(sql: Sql, args: UpdateWebhookConfigArgs): Promise<UpdateWebhookConfigRow | null> {
    const rows = await sql.unsafe(updateWebhookConfigQuery, [args.id, args.webhookUrls, args.webhookSecret]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        webhookUrls: row[0],
        webhookSecret: row[1]
    };
}

export const updateCustomStrategyQuery = `-- name: UpdateCustomStrategy :one

UPDATE client_organizations
SET
  custom_strategy = $2,
  updated_at = now()
WHERE id = $1
RETURNING custom_strategy`;

export interface UpdateCustomStrategyArgs {
    id: string;
    customStrategy: any | null;
}

export interface UpdateCustomStrategyRow {
    customStrategy: any | null;
}

export async function updateCustomStrategy(sql: Sql, args: UpdateCustomStrategyArgs): Promise<UpdateCustomStrategyRow | null> {
    const rows = await sql.unsafe(updateCustomStrategyQuery, [args.id, args.customStrategy]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        customStrategy: row[0]
    };
}

export const getProductStrategiesPreferencesQuery = `-- name: GetProductStrategiesPreferences :one
SELECT
  strategies_preferences,
  strategies_customization
FROM client_organizations
WHERE product_id = $1`;

export interface GetProductStrategiesPreferencesArgs {
    productId: string;
}

export interface GetProductStrategiesPreferencesRow {
    strategiesPreferences: any | null;
    strategiesCustomization: any | null;
}

export async function getProductStrategiesPreferences(sql: Sql, args: GetProductStrategiesPreferencesArgs): Promise<GetProductStrategiesPreferencesRow | null> {
    const rows = await sql.unsafe(getProductStrategiesPreferencesQuery, [args.productId]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        strategiesPreferences: row[0],
        strategiesCustomization: row[1]
    };
}

export const updateProductStrategiesPreferencesByProductIDQuery = `-- name: UpdateProductStrategiesPreferencesByProductID :one
UPDATE client_organizations
SET
  strategies_preferences = $2,
  updated_at = now()
WHERE product_id = $1
RETURNING strategies_preferences`;

export interface UpdateProductStrategiesPreferencesByProductIDArgs {
    productId: string;
    strategiesPreferences: any | null;
}

export interface UpdateProductStrategiesPreferencesByProductIDRow {
    strategiesPreferences: any | null;
}

export async function updateProductStrategiesPreferencesByProductID(sql: Sql, args: UpdateProductStrategiesPreferencesByProductIDArgs): Promise<UpdateProductStrategiesPreferencesByProductIDRow | null> {
    const rows = await sql.unsafe(updateProductStrategiesPreferencesByProductIDQuery, [args.productId, args.strategiesPreferences]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        strategiesPreferences: row[0]
    };
}

export const getProductStrategiesCustomizationQuery = `-- name: GetProductStrategiesCustomization :one
SELECT strategies_customization
FROM client_organizations
WHERE product_id = $1`;

export interface GetProductStrategiesCustomizationArgs {
    productId: string;
}

export interface GetProductStrategiesCustomizationRow {
    strategiesCustomization: any | null;
}

export async function getProductStrategiesCustomization(sql: Sql, args: GetProductStrategiesCustomizationArgs): Promise<GetProductStrategiesCustomizationRow | null> {
    const rows = await sql.unsafe(getProductStrategiesCustomizationQuery, [args.productId]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        strategiesCustomization: row[0]
    };
}

export const updateProductCustomizationByProductIDQuery = `-- name: UpdateProductCustomizationByProductID :one
UPDATE client_organizations
SET
  strategies_customization = $2,
  updated_at = now()
WHERE product_id = $1
RETURNING strategies_customization`;

export interface UpdateProductCustomizationByProductIDArgs {
    productId: string;
    strategiesCustomization: any | null;
}

export interface UpdateProductCustomizationByProductIDRow {
    strategiesCustomization: any | null;
}

export async function updateProductCustomizationByProductID(sql: Sql, args: UpdateProductCustomizationByProductIDArgs): Promise<UpdateProductCustomizationByProductIDRow | null> {
    const rows = await sql.unsafe(updateProductCustomizationByProductIDQuery, [args.productId, args.strategiesCustomization]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        strategiesCustomization: row[0]
    };
}

export const getClientBalanceQuery = `-- name: GetClientBalance :one

SELECT id, client_id, available, reserved, currency, last_topup_at, created_at, updated_at FROM client_balances
WHERE client_id = $1`;

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

export const createClientBalanceQuery = `-- name: CreateClientBalance :one
INSERT INTO client_balances (
  client_id,
  available,
  reserved,
  currency
)
VALUES ($1, $2, $3, $4)
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

export const addToClientIdleBalanceQuery = `-- name: AddToClientIdleBalance :exec

UPDATE client_organizations
SET
  idle_balance = idle_balance + $2,
  updated_at = now()
WHERE id = $1`;

export interface AddToClientIdleBalanceArgs {
    id: string;
    idleBalance: string | null;
}

export async function addToClientIdleBalance(sql: Sql, args: AddToClientIdleBalanceArgs): Promise<void> {
    await sql.unsafe(addToClientIdleBalanceQuery, [args.id, args.idleBalance]);
}

export const moveClientIdleToEarningQuery = `-- name: MoveClientIdleToEarning :exec
UPDATE client_organizations
SET
  idle_balance = idle_balance - $2,
  earning_balance = earning_balance + $2,
  updated_at = now()
WHERE id = $1
  AND idle_balance >= $2`;

export interface MoveClientIdleToEarningArgs {
    id: string;
    idleBalance: string | null;
}

export async function moveClientIdleToEarning(sql: Sql, args: MoveClientIdleToEarningArgs): Promise<void> {
    await sql.unsafe(moveClientIdleToEarningQuery, [args.id, args.idleBalance]);
}

export const moveClientEarningToIdleQuery = `-- name: MoveClientEarningToIdle :exec
UPDATE client_organizations
SET
  earning_balance = earning_balance - $2,
  idle_balance = idle_balance + $2,
  updated_at = now()
WHERE id = $1
  AND earning_balance >= $2`;

export interface MoveClientEarningToIdleArgs {
    id: string;
    earningBalance: string | null;
}

export async function moveClientEarningToIdle(sql: Sql, args: MoveClientEarningToIdleArgs): Promise<void> {
    await sql.unsafe(moveClientEarningToIdleQuery, [args.id, args.earningBalance]);
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

export const updateFeeConfigurationQuery = `-- name: UpdateFeeConfiguration :one

UPDATE client_organizations
SET
  client_revenue_share_percent = $2,
  platform_fee_percent = $3,
  performance_fee = $4,
  updated_at = now()
WHERE id = $1
RETURNING client_revenue_share_percent, platform_fee_percent, performance_fee`;

export interface UpdateFeeConfigurationArgs {
    id: string;
    clientRevenueSharePercent: string;
    platformFeePercent: string;
    performanceFee: string | null;
}

export interface UpdateFeeConfigurationRow {
    clientRevenueSharePercent: string;
    platformFeePercent: string;
    performanceFee: string | null;
}

export async function updateFeeConfiguration(sql: Sql, args: UpdateFeeConfigurationArgs): Promise<UpdateFeeConfigurationRow | null> {
    const rows = await sql.unsafe(updateFeeConfigurationQuery, [args.id, args.clientRevenueSharePercent, args.platformFeePercent, args.performanceFee]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        clientRevenueSharePercent: row[0],
        platformFeePercent: row[1],
        performanceFee: row[2]
    };
}

export const getRevenueConfigQuery = `-- name: GetRevenueConfig :one
SELECT
  client_revenue_share_percent,
  platform_fee_percent,
  performance_fee
FROM client_organizations
WHERE id = $1`;

export interface GetRevenueConfigArgs {
    id: string;
}

export interface GetRevenueConfigRow {
    clientRevenueSharePercent: string;
    platformFeePercent: string;
    performanceFee: string | null;
}

export async function getRevenueConfig(sql: Sql, args: GetRevenueConfigArgs): Promise<GetRevenueConfigRow | null> {
    const rows = await sql.unsafe(getRevenueConfigQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        clientRevenueSharePercent: row[0],
        platformFeePercent: row[1],
        performanceFee: row[2]
    };
}

export const getRevenueConfigByProductIDQuery = `-- name: GetRevenueConfigByProductID :one
SELECT
  client_revenue_share_percent,
  platform_fee_percent
FROM client_organizations
WHERE product_id = $1`;

export interface GetRevenueConfigByProductIDArgs {
    productId: string;
}

export interface GetRevenueConfigByProductIDRow {
    clientRevenueSharePercent: string;
    platformFeePercent: string;
}

export async function getRevenueConfigByProductID(sql: Sql, args: GetRevenueConfigByProductIDArgs): Promise<GetRevenueConfigByProductIDRow | null> {
    const rows = await sql.unsafe(getRevenueConfigByProductIDQuery, [args.productId]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        clientRevenueSharePercent: row[0],
        platformFeePercent: row[1]
    };
}

export const updateMRRQuery = `-- name: UpdateMRR :exec
UPDATE client_organizations
SET
  monthly_recurring_revenue = $2,
  annual_run_rate = $3,
  last_mrr_calculation_at = now(),
  updated_at = now()
WHERE id = $1`;

export interface UpdateMRRArgs {
    id: string;
    monthlyRecurringRevenue: string | null;
    annualRunRate: string | null;
}

export async function updateMRR(sql: Sql, args: UpdateMRRArgs): Promise<void> {
    await sql.unsafe(updateMRRQuery, [args.id, args.monthlyRecurringRevenue, args.annualRunRate]);
}

export const getMRRStatsQuery = `-- name: GetMRRStats :one
SELECT
  monthly_recurring_revenue,
  annual_run_rate,
  last_mrr_calculation_at
FROM client_organizations
WHERE id = $1`;

export interface GetMRRStatsArgs {
    id: string;
}

export interface GetMRRStatsRow {
    monthlyRecurringRevenue: string | null;
    annualRunRate: string | null;
    lastMrrCalculationAt: Date | null;
}

export async function getMRRStats(sql: Sql, args: GetMRRStatsArgs): Promise<GetMRRStatsRow | null> {
    const rows = await sql.unsafe(getMRRStatsQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        monthlyRecurringRevenue: row[0],
        annualRunRate: row[1],
        lastMrrCalculationAt: row[2]
    };
}

export const updateRevenueConfigByProductIDQuery = `-- name: UpdateRevenueConfigByProductID :one
UPDATE client_organizations
SET
  client_revenue_share_percent = $2,
  updated_at = now()
WHERE product_id = $1
RETURNING
  client_revenue_share_percent,
  platform_fee_percent`;

export interface UpdateRevenueConfigByProductIDArgs {
    productId: string;
    clientRevenueSharePercent: string;
}

export interface UpdateRevenueConfigByProductIDRow {
    clientRevenueSharePercent: string;
    platformFeePercent: string;
}

export async function updateRevenueConfigByProductID(sql: Sql, args: UpdateRevenueConfigByProductIDArgs): Promise<UpdateRevenueConfigByProductIDRow | null> {
    const rows = await sql.unsafe(updateRevenueConfigByProductIDQuery, [args.productId, args.clientRevenueSharePercent]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        clientRevenueSharePercent: row[0],
        platformFeePercent: row[1]
    };
}

export const getAggregatedDashboardSummaryQuery = `-- name: GetAggregatedDashboardSummary :one

SELECT
  -- Company Info (use first org as representative)
  (SELECT company_name FROM client_organizations WHERE privy_account_id = pa.id LIMIT 1) AS company_name,

  -- Aggregated Balances (sum across all orgs)
  COALESCE(SUM(co.idle_balance), 0) AS total_idle_balance,
  COALESCE(SUM(co.earning_balance), 0) AS total_earning_balance,
  COALESCE(SUM(co.client_revenue_earned), 0) AS total_client_revenue,
  COALESCE(SUM(co.platform_revenue_earned), 0) AS total_platform_revenue,
  COALESCE(SUM(co.enduser_revenue_earned), 0) AS total_enduser_revenue,

  -- Aggregated Revenue Metrics
  COALESCE(SUM(co.monthly_recurring_revenue), 0) AS monthly_recurring_revenue,
  COALESCE(SUM(co.annual_run_rate), 0) AS annual_run_rate,

  -- Weighted Average Revenue Percentages
  -- Calculate weighted avg based on earning_balance as weight
  CASE
    WHEN SUM(co.earning_balance) > 0 THEN
      SUM(co.client_revenue_share_percent * co.earning_balance) / SUM(co.earning_balance)
    ELSE
      AVG(co.client_revenue_share_percent)
  END AS client_revenue_percent,

  CASE
    WHEN SUM(co.earning_balance) > 0 THEN
      SUM(co.platform_fee_percent * co.earning_balance) / SUM(co.earning_balance)
    ELSE
      AVG(co.platform_fee_percent)
  END AS platform_fee_percent,

  -- End-user fee percent = 100 - client - platform
  CASE
    WHEN SUM(co.earning_balance) > 0 THEN
      100 -
      SUM(co.client_revenue_share_percent * co.earning_balance) / SUM(co.earning_balance) -
      SUM(co.platform_fee_percent * co.earning_balance) / SUM(co.earning_balance)
    ELSE
      100 - AVG(co.client_revenue_share_percent) - AVG(co.platform_fee_percent)
  END AS enduser_fee_percent,

  -- Last calculation timestamp (most recent across all orgs)
  MAX(co.last_mrr_calculation_at) AS last_calculated_at,

  -- Aggregated End-User Metrics
  COALESCE(SUM(co.total_end_users), 0) AS total_end_users,
  COALESCE(SUM(co.new_users_30d), 0) AS new_users_30d,
  COALESCE(SUM(co.active_users_30d), 0) AS active_users_30d,
  COALESCE(SUM(co.total_deposited), 0) AS total_deposited,
  COALESCE(SUM(co.total_withdrawn), 0) AS total_withdrawn

FROM privy_accounts pa
LEFT JOIN client_organizations co ON pa.id = co.privy_account_id AND co.is_active = true
WHERE pa.privy_organization_id = $1
GROUP BY pa.id`;

export interface GetAggregatedDashboardSummaryArgs {
    privyOrganizationId: string;
}

export interface GetAggregatedDashboardSummaryRow {
    companyName: string | null;
    totalIdleBalance: string | null;
    totalEarningBalance: string | null;
    totalClientRevenue: string | null;
    totalPlatformRevenue: string | null;
    totalEnduserRevenue: string | null;
    monthlyRecurringRevenue: string | null;
    annualRunRate: string | null;
    clientRevenuePercent: string | null;
    platformFeePercent: string | null;
    enduserFeePercent: string | null;
    lastCalculatedAt: string;
    totalEndUsers: string | null;
    newUsers_30d: string | null;
    activeUsers_30d: string | null;
    totalDeposited: string | null;
    totalWithdrawn: string | null;
}

export async function getAggregatedDashboardSummary(sql: Sql, args: GetAggregatedDashboardSummaryArgs): Promise<GetAggregatedDashboardSummaryRow | null> {
    const rows = await sql.unsafe(getAggregatedDashboardSummaryQuery, [args.privyOrganizationId]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        companyName: row[0],
        totalIdleBalance: row[1],
        totalEarningBalance: row[2],
        totalClientRevenue: row[3],
        totalPlatformRevenue: row[4],
        totalEnduserRevenue: row[5],
        monthlyRecurringRevenue: row[6],
        annualRunRate: row[7],
        clientRevenuePercent: row[8],
        platformFeePercent: row[9],
        enduserFeePercent: row[10],
        lastCalculatedAt: row[11],
        totalEndUsers: row[12],
        newUsers_30d: row[13],
        activeUsers_30d: row[14],
        totalDeposited: row[15],
        totalWithdrawn: row[16]
    };
}

