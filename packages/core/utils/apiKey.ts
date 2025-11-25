/**
 * API Key Utilities
 * Following Stripe's pattern for production-grade API keys
 */

import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Generate a new API key
 * Format: {environment}_pk_{random32chars}
 * 
 * Examples:
 *   prod_pk_7a9f3e2b1c4d8f6e5a0b9c8d7e6f5a4b  (Production)
 *   test_pk_1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f  (Sandbox)
 * 
 * @param isSandbox - Whether this is a sandbox/test key
 * @returns Secure API key (shown only once!)
 */
export function generateApiKey(isSandbox: boolean = false): string {
  const env = isSandbox ? 'test' : 'prod';
  const random = randomBytes(16).toString('hex'); // 32 hex chars
  return `${env}_pk_${random}`;
}

/**
 * Hash API key for secure storage
 * Uses bcrypt with configurable salt rounds (default: 10)
 * 
 * @param apiKey - Plain text API key
 * @returns Bcrypt hash (safe to store in database)
 */
export async function hashApiKey(apiKey: string): Promise<string> {
  return await bcrypt.hash(apiKey, SALT_ROUNDS);
}

/**
 * Verify API key against stored hash
 * Constant-time comparison via bcrypt
 * 
 * @param apiKey - Plain text API key from request
 * @param hash - Stored bcrypt hash
 * @returns True if key matches hash
 */
export async function verifyApiKey(apiKey: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(apiKey, hash);
}

/**
 * Extract API key prefix for fast lookup
 * Prefix is first 8 characters (environment + type)
 * 
 * @param apiKey - Full API key
 * @returns First 8 characters (e.g., "prod_pk_")
 */
export function extractPrefix(apiKey: string): string {
  return apiKey.substring(0, 8);
}

/**
 * Validate API key format
 * Must match: {prod|test}_pk_{32 hex chars}
 * 
 * @param apiKey - API key to validate
 * @returns True if format is valid
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  const pattern = /^(prod|test)_pk_[a-f0-9]{32}$/;
  return pattern.test(apiKey);
}
