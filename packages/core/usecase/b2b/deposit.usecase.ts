/**
 * B2B Deposit Service
 * Handles deposit creation and processing
 */

import type {
  ClientRepository,
  DepositRepository,
  VaultRepository,
  UserRepository,
  AuditRepository,
} from '../../repository';
import type {
  CreateDepositArgs,
  CreateDepositRow,
  GetDepositByOrderIDRow,
} from '@proxify/sqlcgen';
import type {
  CreateDepositRequest,
  CompleteDepositRequest,
  FailDepositRequest,
  GetDepositStatsRequest,
} from '../../dto/b2b';

/**
 * B2B Deposit Service
 */
export class B2BDepositUseCase {
  constructor(
    private readonly depositRepository: DepositRepository,
    private readonly clientRepository: ClientRepository,
    private readonly vaultRepository: VaultRepository,
    private readonly userRepository: UserRepository,
    private readonly auditRepository: AuditRepository
  ) {}

  /**
   * Create deposit transaction
   */
  async createDeposit(request: CreateDepositRequest): Promise<CreateDepositRow> {
    // Validate client
    const client = await this.clientRepository.getById(request.clientId);
    if (!client || !client.isActive) {
      throw new Error('Invalid or inactive client');
    }

    // Get or create end user
    const user = await this.userRepository.getOrCreate(
      request.clientId,
      request.userId,
      'individual', // Default userType
      undefined // No wallet address yet
    );

    // Create deposit args
    const args: CreateDepositArgs = {
      orderId: `DEP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generate unique order ID
      clientId: request.clientId,
      userId: user.id,
      depositType: request.depositType,
      paymentMethod: request.gatewayProvider || null,
      fiatAmount: request.fiatAmount,
      cryptoAmount: null,
      currency: request.fiatCurrency, // SQLC uses 'currency' for fiat currency
      cryptoCurrency: request.cryptoCurrency,
      gatewayFee: null,
      proxifyFee: null,
      networkFee: null,
      totalFees: null,
      status: 'pending',
      paymentUrl: request.paymentUrl || null,
      gatewayOrderId: request.gatewayOrderId || null,
      clientBalanceId: null,
      deductedFromClient: null,
      walletAddress: null,
      expiresAt: null,
    };

    const deposit = await this.depositRepository.create(args);

    if (!deposit) {
      throw new Error('Failed to create deposit');
    }

    // Audit log
    await this.auditRepository.create({
      clientId: request.clientId,
      userId: user.id,
      actorType: 'client',
      action: 'deposit_created',
      resourceType: 'deposit',
      resourceId: deposit.id,
      description: `Deposit created: ${request.fiatAmount} ${request.fiatCurrency}`,
      metadata: {
        orderId: deposit.orderId,
        fiatAmount: request.fiatAmount,
        fiatCurrency: request.fiatCurrency,
        cryptoCurrency: request.cryptoCurrency,
      },
      ipAddress: null,
      userAgent: null,
    });

    return deposit;
  }

  /**
   * Get deposit by order ID
   */
  async getDepositByOrderId(orderId: string): Promise<GetDepositByOrderIDRow | null> {
    return await this.depositRepository.getByOrderId(orderId);
  }

  /**
   * Complete deposit (FLOW 4 - with vault operations)
   * 
   * Steps:
   * 1. Mark deposit as completed
   * 2. Get client vault (for current index)
   * 3. Calculate shares to mint (deposit_amount × 1e18 / current_index)
   * 4. Get or create end_user_vault
   * 5. Calculate new weighted entry index
   * 6. Add shares to end_user_vault
   * 7. Add pending deposit to client_vault
   * 8. Update end_user.last_deposit_at
   */
  async completeDeposit(request: CompleteDepositRequest): Promise<void> {
    const deposit = await this.depositRepository.getByOrderId(request.orderId);
    
    if (!deposit) {
      throw new Error('Deposit not found');
    }

    if (deposit.status !== 'pending') {
      throw new Error(`Deposit is already ${deposit.status}`);
    }

    // Step 1: Mark deposit as completed
    await this.depositRepository.markCompleted(
      deposit.id,
      request.cryptoAmount,
      request.gatewayFee,
      request.proxifyFee,
      request.networkFee,
      request.totalFees
    );

    // Step 2: Get client vault for current index
    const clientVault = await this.vaultRepository.getClientVault(
      deposit.clientId,
      request.chain,
      request.tokenAddress
    );

    if (!clientVault) {
      throw new Error(`Client vault not found for ${request.chain}/${request.tokenAddress}`);
    }

    // Step 3: Calculate shares to mint
    // shares = deposit_amount × 1e18 / current_index
    const depositAmount = BigInt(request.cryptoAmount);
    const currentIndex = BigInt(clientVault.currentIndex);
    const sharesToMint = (depositAmount * BigInt(1e18)) / currentIndex;

    // Step 4: Get end_user record
    const endUser = await this.userRepository.getById(deposit.userId);
    if (!endUser) {
      throw new Error('End user not found');
    }

    // Step 5: Get or create end_user_vault
    const userVault = await this.vaultRepository.getEndUserVault(
      endUser.id,
      request.chain,
      request.tokenAddress
    );

    let endUserVaultId: string;
    let oldShares = BigInt(0);
    let oldWeightedIndex = BigInt(0);
    let oldTotalDeposited = BigInt(0);

    if (userVault) {
      endUserVaultId = userVault.id;
      oldShares = BigInt(userVault.shares);
      oldWeightedIndex = BigInt(userVault.weightedEntryIndex);
      oldTotalDeposited = BigInt(userVault.totalDeposited);
    } else {
      // Create new end-user vault
      const newVault = await this.vaultRepository.createEndUserVault({
        endUserId: endUser.id,
        clientId: deposit.clientId,
        chain: request.chain,
        tokenAddress: request.tokenAddress,
        tokenSymbol: request.tokenSymbol,
        shares: '0',
        weightedEntryIndex: '0',
        totalDeposited: '0',
      });

      if (!newVault) {
        throw new Error('Failed to create end-user vault');
      }

      endUserVaultId = newVault.id;
    }

    // Step 6: Calculate new weighted entry index
    // Formula: new_weighted_index = (old_shares × old_weighted_index + new_shares × current_index) / (old_shares + new_shares)
    const newTotalShares = oldShares + sharesToMint;
    let newWeightedIndex: bigint;

    if (oldShares === BigInt(0)) {
      // First deposit - weighted index = current index
      newWeightedIndex = currentIndex;
    } else {
      // Calculate weighted average
      const oldWeight = oldShares * oldWeightedIndex;
      const newWeight = sharesToMint * currentIndex;
      newWeightedIndex = (oldWeight + newWeight) / newTotalShares;
    }

    // Step 7: Update end_user_vault (add shares)
    const newTotalDeposited = oldTotalDeposited + depositAmount;
    await this.vaultRepository.addShares(
      endUserVaultId,
      sharesToMint.toString(),
      newWeightedIndex.toString(),
      newTotalDeposited.toString()
    );

    // Step 8: Update client_vault (add pending deposit balance and total shares)
    const newClientTotalShares = BigInt(clientVault.totalShares) + sharesToMint;
    await this.vaultRepository.addPendingDeposit(
      clientVault.id,
      request.cryptoAmount,
      newClientTotalShares.toString()
    );

    // Step 9: Update end_user.last_deposit_at
    await this.userRepository.updateDepositTimestamp(endUser.id);

    // Step 10: Mark first deposit if needed (check if firstDepositAt is null)
    if (!endUser.firstDepositAt) {
      await this.userRepository.markFirstDeposit(endUser.id);
    }

    // Audit log
    await this.auditRepository.create({
      clientId: deposit.clientId,
      userId: deposit.userId,
      actorType: 'system',
      action: 'deposit_completed',
      resourceType: 'deposit',
      resourceId: deposit.id,
      description: `Deposit completed: ${request.cryptoAmount} ${request.tokenSymbol}`,
      metadata: {
        orderId: request.orderId,
        cryptoAmount: request.cryptoAmount,
        totalFees: request.totalFees,
        sharesToMint: sharesToMint.toString(),
        currentIndex: currentIndex.toString(),
        newWeightedIndex: newWeightedIndex.toString(),
        chain: request.chain,
        tokenAddress: request.tokenAddress,
      },
      ipAddress: null,
      userAgent: null,
    });
  }

  /**
   * Fail deposit
   */
  async failDeposit(orderId: string, errorMessage: string, errorCode?: string): Promise<void> {
    const deposit = await this.depositRepository.getByOrderId(orderId);
    
    if (!deposit) {
      throw new Error('Deposit not found');
    }

    await this.depositRepository.markFailed(deposit.id, errorMessage, errorCode);

    // Audit log
    await this.auditRepository.create({
      clientId: deposit.clientId,
      userId: deposit.userId,
      actorType: 'system',
      action: 'deposit_failed',
      resourceType: 'deposit',
      resourceId: deposit.id,
      description: `Deposit failed: ${errorMessage}`,
      metadata: {
        orderId,
        errorMessage,
        errorCode,
      },
      ipAddress: null,
      userAgent: null,
    });
  }

  /**
   * List deposits by client
   */
  async listDepositsByClient(clientId: string, limit: number = 50, offset: number = 0) {
    return await this.depositRepository.listByClient(clientId, limit, offset);
  }

  /**
   * List deposits by user
   */
  async listDepositsByUser(clientId: string, userId: string, limit: number = 50) {
    return await this.depositRepository.listByUser(clientId, userId, limit);
  }

  /**
   * List deposits by status
   */
  async listDepositsByStatus(clientId: string, status: string, limit: number = 50) {
    return await this.depositRepository.listByStatus(clientId, status, limit);
  }

  /**
   * Get deposit stats
   */
  async getDepositStats(clientId: string, startDate?: Date, endDate?: Date) {
    // Default to last 30 days if not provided
    const end = endDate || new Date();
    const start = startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return await this.depositRepository.getStats(clientId, start, end);
  }
}
