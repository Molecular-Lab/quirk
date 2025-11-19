/**
 * B2B User UseCase
 * Manages end-user accounts (FLOW 3)
 */

import type { UserRepository } from '../../repository/postgres/end_user.repository';
import type { AuditRepository } from '../../repository/postgres/audit.repository';
import type {
  GetEndUserRow,
  CreateEndUserRow,
  GetEndUserPortfolioRow,
} from '@proxify/sqlcgen';
import type {
  CreateUserRequest,
  GetUserPortfolioRequest,
  ListUsersByClientRequest,
} from '../../dto/b2b';

/**
 * B2B User Service
 * Handles end-user account creation and management
 */
export class B2BUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly auditRepository: AuditRepository
  ) {}

  /**
   * Get or create end-user (idempotent)
   * Used when processing deposits/withdrawals
   */
  async getOrCreateUser(request: CreateUserRequest): Promise<GetEndUserRow> {
    // Check if user exists
    const existing = await this.userRepository.getByClientAndUserId(
      request.clientId,
      request.userId
    );

    if (existing) {
      return existing;
    }

    // Create new user
    const user = await this.userRepository.getOrCreate(
      request.clientId,
      request.userId,
      request.userType,
      request.userWalletAddress
    );

    // Audit log
    await this.auditRepository.create({
      clientId: request.clientId,
      userId: user.id,
      actorType: 'client',
      action: 'user_created',
      resourceType: 'end_user',
      resourceId: user.id,
      description: `End-user created: ${request.userId}`,
      metadata: {
        userId: request.userId,
        userType: request.userType,
      },
      ipAddress: null,
      userAgent: null,
    });

    return user;
  }

  /**
   * Get user by client and user ID
   */
  async getUserByClientAndUserId(
    clientId: string,
    userId: string
  ): Promise<GetEndUserRow | null> {
    return await this.userRepository.getByClientAndUserId(clientId, userId);
  }

  /**
   * Get user portfolio (all vaults across chains)
   */
  async getUserPortfolio(userId: string): Promise<GetEndUserPortfolioRow | null> {
    return await this.userRepository.getPortfolio(userId);
  }

  /**
   * List all users for a client
   */
  async listUsersByClient(clientId: string, limit: number = 50, offset: number = 0) {
    return await this.userRepository.listByClient(clientId, limit, offset);
  }

  /**
   * Get active user count for client
   */
  async getActiveUserCount(clientId: string): Promise<number> {
    const users = await this.userRepository.listByClient(clientId, 1000, 0);
    return users.filter((u: any) => u.isActive).length;
  }
}
