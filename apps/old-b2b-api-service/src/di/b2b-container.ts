/**
 * Service Container - Dependency Injection
 * 
 * Manages all repositories and usecases with PostgreSQL connection
 */

import postgres, { type Sql } from 'postgres';
import {
  ClientRepository,
  DepositRepository,
  VaultRepository,
  UserRepository,
  AuditRepository,
  WithdrawalRepository,
  DefiRepository,
  B2BClientUseCase,
  B2BDepositUseCase,
  B2BVaultUseCase,
  B2BUserUseCase,
  B2BUserVaultUseCase,
  B2BWithdrawalUseCase,
} from '@proxify/core';

/**
 * DI Container Interface
 */
export interface DIContainer {
  // PostgreSQL connection
  sql: Sql;

  // Repositories
  clientRepository: ClientRepository;
  depositRepository: DepositRepository;
  vaultRepository: VaultRepository;
  userRepository: UserRepository;
  auditRepository: AuditRepository;
  withdrawalRepository: WithdrawalRepository;
  defiRepository: DefiRepository;

  // UseCases (Business Logic)
  b2bClientUseCase: B2BClientUseCase;
  b2bDepositUseCase: B2BDepositUseCase;
  b2bVaultUseCase: B2BVaultUseCase;
  b2bUserUseCase: B2BUserUseCase;
  b2bUserVaultUseCase: B2BUserVaultUseCase;
  b2bWithdrawalUseCase: B2BWithdrawalUseCase;

  // Lifecycle methods
  close(): Promise<void>;
  healthCheck(): Promise<boolean>;
}

/**
 * Service Container Implementation
 */
export class ServiceContainer implements DIContainer {
  public readonly sql: Sql;
  public readonly clientRepository: ClientRepository;
  public readonly depositRepository: DepositRepository;
  public readonly vaultRepository: VaultRepository;
  public readonly userRepository: UserRepository;
  public readonly auditRepository: AuditRepository;
  public readonly withdrawalRepository: WithdrawalRepository;
  public readonly defiRepository: DefiRepository;
  public readonly b2bClientUseCase: B2BClientUseCase;
  public readonly b2bDepositUseCase: B2BDepositUseCase;
  public readonly b2bVaultUseCase: B2BVaultUseCase;
  public readonly b2bUserUseCase: B2BUserUseCase;
  public readonly b2bUserVaultUseCase: B2BUserVaultUseCase;
  public readonly b2bWithdrawalUseCase: B2BWithdrawalUseCase;

  constructor(databaseUrl: string) {
    // Initialize PostgreSQL connection
    this.sql = postgres(databaseUrl, {
      max: 10, // Connection pool size
      idle_timeout: 20,
      connect_timeout: 10,
    });

    // Initialize repositories
    this.clientRepository = new ClientRepository(this.sql);
    this.depositRepository = new DepositRepository(this.sql);
    this.vaultRepository = new VaultRepository(this.sql);
    this.userRepository = new UserRepository(this.sql);
    this.auditRepository = new AuditRepository(this.sql);
    this.withdrawalRepository = new WithdrawalRepository(this.sql);
    this.defiRepository = new DefiRepository(this.sql);

    // Initialize usecases with repository dependencies
    this.b2bClientUseCase = new B2BClientUseCase(
      this.clientRepository,
      this.auditRepository
    );

    this.b2bDepositUseCase = new B2BDepositUseCase(
      this.depositRepository,
      this.clientRepository,
      this.vaultRepository,
      this.userRepository,
      this.auditRepository
    );

    this.b2bVaultUseCase = new B2BVaultUseCase(
      this.vaultRepository,
      this.auditRepository
    );

    this.b2bUserUseCase = new B2BUserUseCase(
      this.userRepository,
      this.auditRepository
    );

    this.b2bUserVaultUseCase = new B2BUserVaultUseCase(
      this.vaultRepository,
      this.userRepository,
      this.auditRepository
    );

    this.b2bWithdrawalUseCase = new B2BWithdrawalUseCase(
      this.withdrawalRepository,
      this.vaultRepository,
      this.userRepository,
      this.auditRepository
    );
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.sql.end();
  }

  /**
   * Health check - test database connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.sql`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

/**
 * Factory function to create service container
 */
export function createServiceContainer(databaseUrl: string): DIContainer {
  return new ServiceContainer(databaseUrl);
}
