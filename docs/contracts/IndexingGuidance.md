
    /*//////////////////////////////////////////////////////////////
                    OFF-CHAIN INDEXING GUIDANCE
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev The following data should be indexed OFF-CHAIN from events:
     *
     * 1. Client-Level Analytics (for invoicing):
     *    - Total AUM per client: Sum Deposited events by clientId
     *    - Total yield per client: Calculate from user balances + indices
     *    - User count per client: Count unique userIds in Deposited events
     *    - Activity metrics: Count & sum Deposited/Withdrawn events
     *
     * 2. Revenue Calculation:
     *    - Index all Deposited events
     *    - Calculate AUM snapshots (daily/monthly)
     *    - Apply fee rate (50 bps) to AUM × time
     *
     * 3. Historical Data:
     *    - Deposit/withdraw volumes: Sum amounts from events
     *    - Transaction counts: Count events per client/user
     *    - APY tracking: Track VaultIndexUpdated events over time
     *
     * Recommended Tools:
     * - The Graph Protocol (subgraphs)
     * - Moralis Streams
     * - Alchemy Notify
     * - Custom indexer (Node.js + PostgreSQL)
     *
     * Example Query (The Graph):
     * ```graphql
     * query ClientAUM($clientId: Bytes!, $token: Bytes!) {
     *   deposits(where: { clientId: $clientId, token: $token }) {
     *     amount
     *     userId
     *   }
     * }
     * ```
     */
