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
import { TokenTransferService } from '../../service/token-transfer.service';
import { ClientGrowthIndexService } from '../../service/client-growth-index.service';
import BigNumber from 'bignumber.js';

/**
 * B2B Deposit Service
 */
export class B2BDepositUseCase {
  private tokenTransferService: TokenTransferService;

  constructor(
    private readonly depositRepository: DepositRepository,
    private readonly clientRepository: ClientRepository,
    private readonly vaultRepository: VaultRepository,
    private readonly userRepository: UserRepository,
    private readonly auditRepository: AuditRepository,
    private readonly clientGrowthIndexService: ClientGrowthIndexService
  ) {
    this.tokenTransferService = new TokenTransferService();
  }

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
      'custodial', // Default userType
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
   * ✅ NEW SIMPLIFIED FLOW:
   * 1. Mark deposit as completed
   * 2. Get client vault (for custodial wallet verification)
   * 3. Calculate client growth index (weighted average across all vaults)
   * 4. Get or create end_user_vault (simplified - no chain/token)
   * 5. Calculate new weighted entry index (for DCA)
   * 6. Update vault deposit (fiat amount, no shares)
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

    // Step 0: Get client vault to retrieve custodial wallet address
    const clientVault = await this.vaultRepository.getClientVault(
      deposit.clientId,
      request.chain,
      request.tokenAddress
    );

    if (!clientVault) {
      throw new Error(`Client vault not found for ${request.chain}/${request.tokenAddress}`);
    }

    // Step 0.5: Verify token transfer on-chain
    // In production, this checks the blockchain. In mock mode, it simulates verification.
    if (request.transactionHash) {
      console.log('[Deposit] Verifying token transfer on-chain...');
      
      const verification = await this.tokenTransferService.verifyTransfer({
        chain: request.chain,
        tokenAddress: request.tokenAddress,
        expectedAmount: request.cryptoAmount,
        transactionHash: request.transactionHash,
        toAddress: clientVault.custodialWalletAddress || '', // Custodial wallet
      });

      if (!verification.verified) {
        // Mark deposit as failed
        await this.depositRepository.markFailed(
          deposit.id,
          verification.error || 'Token transfer verification failed'
        );
        throw new Error(`Token transfer verification failed: ${verification.error}`);
      }

      console.log('[Deposit] ✅ Token transfer verified:', {
        amount: verification.actualAmount,
        from: verification.from,
        block: verification.blockNumber,
      });
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

    // Step 2: Calculate client growth index (weighted average across all client vaults)
    const clientGrowthIndex = new BigNumber(
      await this.clientGrowthIndexService.calculateClientGrowthIndex(deposit.clientId)
    );

    console.log('[Deposit] Client Growth Index:', {
      clientId: deposit.clientId,
      growthIndex: clientGrowthIndex.toString(),
      growthIndexDecimal: clientGrowthIndex.dividedBy('1e18').toString(),
    });

    // Step 3: Get end_user record
    const endUser = await this.userRepository.getById(deposit.userId);
    if (!endUser) {
      throw new Error('End user not found');
    }

    // Step 4: Get or create end_user_vault (simplified - no chain/token, just clientId)
    let userVault = await this.vaultRepository.getEndUserVaultByClient(
      endUser.id,
      deposit.clientId
    );

    const depositAmount = new BigNumber(request.cryptoAmount);

    if (!userVault) {
      // ✅ First deposit - create vault with entry index = client growth index
      // (This shouldn't happen often now that we create vaults on registration)
      console.log('[Deposit] Creating new end-user vault (vault missing - should have been created on registration)');

      const newVault = await this.vaultRepository.createEndUserVault({
        endUserId: endUser.id,
        clientId: deposit.clientId,
        totalDeposited: depositAmount.toString(),
        weightedEntryIndex: clientGrowthIndex.toString(),
      });

      if (!newVault) {
        throw new Error('Failed to create end-user vault');
      }

      console.log('[Deposit] ✅ Vault created:', {
        vaultId: newVault.id,
        totalDeposited: depositAmount.toString(),
        entryIndex: clientGrowthIndex.toString(),
        entryIndexDecimal: clientGrowthIndex.dividedBy('1e18').toString(),
      });
    } else {
      const oldDeposited = new BigNumber(userVault.totalDeposited);
      const oldEntryIndex = new BigNumber(userVault.weightedEntryIndex);

      // Check if this is the first deposit (vault exists but has 0 balance from registration)
      if (oldDeposited.isZero()) {
        console.log('[Deposit] First deposit - updating vault created on registration');
        
        // Set entry index to current client growth index
        await this.vaultRepository.updateVaultDeposit(
          userVault.id,
          depositAmount.toString(),
          clientGrowthIndex.toString() // Entry index = current growth index
        );

        console.log('[Deposit] ✅ Vault updated (first deposit):', {
          vaultId: userVault.id,
          totalDeposited: depositAmount.toString(),
          entryIndex: clientGrowthIndex.toString(),
          entryIndexDecimal: clientGrowthIndex.dividedBy('1e18').toString(),
        });
      } else {
        // ✅ DCA (Dollar-Cost Averaging) - recalculate weighted entry index
        console.log('[Deposit] Updating existing vault (DCA)');

        const totalDeposited = oldDeposited.plus(depositAmount);

        // Formula: new_weighted_entry_index = (old_deposited × old_entry_index + new_deposited × client_growth_index) / total_deposited
        const newWeightedEntryIndex = oldDeposited
          .multipliedBy(oldEntryIndex)
          .plus(depositAmount.multipliedBy(clientGrowthIndex))
          .dividedBy(totalDeposited)
          .integerValue(BigNumber.ROUND_DOWN);

        console.log('[Deposit] DCA Calculation:', {
          oldDeposited: oldDeposited.toString(),
          oldEntryIndex: oldEntryIndex.toString(),
          oldEntryIndexDecimal: oldEntryIndex.dividedBy('1e18').toString(),
          newDeposited: depositAmount.toString(),
          currentGrowthIndex: clientGrowthIndex.toString(),
          currentGrowthIndexDecimal: clientGrowthIndex.dividedBy('1e18').toString(),
          totalDeposited: totalDeposited.toString(),
          newWeightedEntryIndex: newWeightedEntryIndex.toString(),
          newWeightedEntryIndexDecimal: newWeightedEntryIndex.dividedBy('1e18').toString(),
        });

        // Update vault with new totals
        await this.vaultRepository.updateVaultDeposit(
          userVault.id,
          depositAmount.toString(),
          newWeightedEntryIndex.toString()
        );

        console.log('[Deposit] ✅ Vault updated (DCA)');
      }
    }

    // Step 5: Update client_vault (add pending deposit balance)
    // Note: Client vaults still track shares internally for their own accounting
    // End users don't see shares, they see fiat balance
    await this.vaultRepository.addPendingDeposit(
      clientVault.id,
      request.cryptoAmount,
      clientVault.totalShares // Keep existing shares unchanged
    );

    // Step 6: Update end_user.last_deposit_at
    await this.userRepository.updateDepositTimestamp(endUser.id);

    // Step 7: Mark first deposit if needed (check if firstDepositAt is null)
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
        clientGrowthIndex: clientGrowthIndex.toString(),
        clientGrowthIndexDecimal: clientGrowthIndex.dividedBy('1e18').toString(),
        chain: request.chain,
        tokenAddress: request.tokenAddress,
      },
      ipAddress: null,
      userAgent: null,
    });

    console.log('[Deposit] ✅ Deposit completed:', {
      orderId: request.orderId,
      userId: deposit.userId,
      clientId: deposit.clientId,
      amount: request.cryptoAmount,
      chain: request.chain,
      token: request.tokenSymbol,
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
