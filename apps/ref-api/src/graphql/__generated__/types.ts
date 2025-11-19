export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigDecimal: { input: string; output: string; }
  BigInt: { input: string; output: string; }
  Bytes: { input: any; output: any; }
  Int8: { input: any; output: any; }
  Timestamp: { input: any; output: any; }
};

export enum Aggregation_Interval {
  Day = 'day',
  Hour = 'hour'
}

export type BlockChangedFilter = {
  number_gte: Scalars['Int']['input'];
};

export type Block_Height = {
  hash?: InputMaybe<Scalars['Bytes']['input']>;
  number?: InputMaybe<Scalars['Int']['input']>;
  number_gte?: InputMaybe<Scalars['Int']['input']>;
};

export type Bundle = {
  __typename?: 'Bundle';
  decimals: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  price: Scalars['BigDecimal']['output'];
  updatedAt: Scalars['BigInt']['output'];
};

export type Bundle_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Bundle_Filter>>>;
  decimals?: InputMaybe<Scalars['BigInt']['input']>;
  decimals_gt?: InputMaybe<Scalars['BigInt']['input']>;
  decimals_gte?: InputMaybe<Scalars['BigInt']['input']>;
  decimals_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  decimals_lt?: InputMaybe<Scalars['BigInt']['input']>;
  decimals_lte?: InputMaybe<Scalars['BigInt']['input']>;
  decimals_not?: InputMaybe<Scalars['BigInt']['input']>;
  decimals_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Bundle_Filter>>>;
  price?: InputMaybe<Scalars['BigDecimal']['input']>;
  price_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  price_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  price_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  price_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  price_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  price_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  price_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  updatedAt?: InputMaybe<Scalars['BigInt']['input']>;
  updatedAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  updatedAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  updatedAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  updatedAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  updatedAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  updatedAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  updatedAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum Bundle_OrderBy {
  Decimals = 'decimals',
  Id = 'id',
  Price = 'price',
  UpdatedAt = 'updatedAt'
}

export type Factory = {
  __typename?: 'Factory';
  id: Scalars['ID']['output'];
  owner: Scalars['ID']['output'];
  poolCount: Scalars['BigInt']['output'];
  totalFeesETH: Scalars['BigDecimal']['output'];
  totalFeesUSD: Scalars['BigDecimal']['output'];
  totalProtocolFeesETH: Scalars['BigDecimal']['output'];
  totalProtocolFeesUSD: Scalars['BigDecimal']['output'];
  totalValueLockedETH: Scalars['BigDecimal']['output'];
  totalValueLockedUSD: Scalars['BigDecimal']['output'];
  totalVolumeETH: Scalars['BigDecimal']['output'];
  totalVolumeUSD: Scalars['BigDecimal']['output'];
  txCount: Scalars['BigInt']['output'];
};

export type Factory_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Factory_Filter>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Factory_Filter>>>;
  owner?: InputMaybe<Scalars['ID']['input']>;
  owner_gt?: InputMaybe<Scalars['ID']['input']>;
  owner_gte?: InputMaybe<Scalars['ID']['input']>;
  owner_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  owner_lt?: InputMaybe<Scalars['ID']['input']>;
  owner_lte?: InputMaybe<Scalars['ID']['input']>;
  owner_not?: InputMaybe<Scalars['ID']['input']>;
  owner_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  poolCount?: InputMaybe<Scalars['BigInt']['input']>;
  poolCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  poolCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  poolCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  poolCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  poolCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  poolCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  poolCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalFeesETH?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalFeesETH_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalFeesETH_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalFeesETH_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalFeesETH_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalFeesETH_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalFeesETH_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalFeesETH_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalFeesUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalFeesUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalFeesUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalFeesUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalFeesUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalFeesUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalFeesUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalFeesUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalProtocolFeesETH?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalProtocolFeesETH_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalProtocolFeesETH_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalProtocolFeesETH_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalProtocolFeesETH_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalProtocolFeesETH_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalProtocolFeesETH_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalProtocolFeesETH_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalProtocolFeesUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalProtocolFeesUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalProtocolFeesUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalProtocolFeesUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalProtocolFeesUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalProtocolFeesUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalProtocolFeesUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalProtocolFeesUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedETH?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedETH_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedETH_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedETH_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedETH_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedETH_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedETH_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedETH_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalVolumeETH?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeETH_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeETH_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeETH_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalVolumeETH_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeETH_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeETH_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeETH_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalVolumeUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalVolumeUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  txCount?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  txCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum Factory_OrderBy {
  Id = 'id',
  Owner = 'owner',
  PoolCount = 'poolCount',
  TotalFeesEth = 'totalFeesETH',
  TotalFeesUsd = 'totalFeesUSD',
  TotalProtocolFeesEth = 'totalProtocolFeesETH',
  TotalProtocolFeesUsd = 'totalProtocolFeesUSD',
  TotalValueLockedEth = 'totalValueLockedETH',
  TotalValueLockedUsd = 'totalValueLockedUSD',
  TotalVolumeEth = 'totalVolumeETH',
  TotalVolumeUsd = 'totalVolumeUSD',
  TxCount = 'txCount'
}

export type Farm = {
  __typename?: 'Farm';
  active: Scalars['Boolean']['output'];
  harvestEvents: Array<HarvestEvent>;
  id: Scalars['ID']['output'];
  pool: Pool;
  positions: Array<StakedPositionFarm>;
  rewardPerBlock: Scalars['BigInt']['output'];
  rewardToken: Token;
  stakeEvents: Array<StakeEvent>;
  totalBlockShare: Scalars['BigInt']['output'];
  totalClaimable: Scalars['BigInt']['output'];
  totalClaimed: Scalars['BigInt']['output'];
  unstakeEvents: Array<UnstakeEvent>;
};


export type FarmHarvestEventsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<HarvestEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<HarvestEvent_Filter>;
};


export type FarmPositionsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<StakedPositionFarm_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<StakedPositionFarm_Filter>;
};


export type FarmStakeEventsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<StakeEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<StakeEvent_Filter>;
};


export type FarmUnstakeEventsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<UnstakeEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<UnstakeEvent_Filter>;
};

export type Farm_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  active?: InputMaybe<Scalars['Boolean']['input']>;
  active_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  active_not?: InputMaybe<Scalars['Boolean']['input']>;
  active_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  and?: InputMaybe<Array<InputMaybe<Farm_Filter>>>;
  harvestEvents_?: InputMaybe<HarvestEvent_Filter>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Farm_Filter>>>;
  pool?: InputMaybe<Scalars['String']['input']>;
  pool_?: InputMaybe<Pool_Filter>;
  pool_contains?: InputMaybe<Scalars['String']['input']>;
  pool_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_gt?: InputMaybe<Scalars['String']['input']>;
  pool_gte?: InputMaybe<Scalars['String']['input']>;
  pool_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_lt?: InputMaybe<Scalars['String']['input']>;
  pool_lte?: InputMaybe<Scalars['String']['input']>;
  pool_not?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  positions_?: InputMaybe<StakedPositionFarm_Filter>;
  rewardPerBlock?: InputMaybe<Scalars['BigInt']['input']>;
  rewardPerBlock_gt?: InputMaybe<Scalars['BigInt']['input']>;
  rewardPerBlock_gte?: InputMaybe<Scalars['BigInt']['input']>;
  rewardPerBlock_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  rewardPerBlock_lt?: InputMaybe<Scalars['BigInt']['input']>;
  rewardPerBlock_lte?: InputMaybe<Scalars['BigInt']['input']>;
  rewardPerBlock_not?: InputMaybe<Scalars['BigInt']['input']>;
  rewardPerBlock_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  rewardToken?: InputMaybe<Scalars['String']['input']>;
  rewardToken_?: InputMaybe<Token_Filter>;
  rewardToken_contains?: InputMaybe<Scalars['String']['input']>;
  rewardToken_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  rewardToken_ends_with?: InputMaybe<Scalars['String']['input']>;
  rewardToken_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  rewardToken_gt?: InputMaybe<Scalars['String']['input']>;
  rewardToken_gte?: InputMaybe<Scalars['String']['input']>;
  rewardToken_in?: InputMaybe<Array<Scalars['String']['input']>>;
  rewardToken_lt?: InputMaybe<Scalars['String']['input']>;
  rewardToken_lte?: InputMaybe<Scalars['String']['input']>;
  rewardToken_not?: InputMaybe<Scalars['String']['input']>;
  rewardToken_not_contains?: InputMaybe<Scalars['String']['input']>;
  rewardToken_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  rewardToken_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  rewardToken_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  rewardToken_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  rewardToken_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  rewardToken_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  rewardToken_starts_with?: InputMaybe<Scalars['String']['input']>;
  rewardToken_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  stakeEvents_?: InputMaybe<StakeEvent_Filter>;
  totalBlockShare?: InputMaybe<Scalars['BigInt']['input']>;
  totalBlockShare_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalBlockShare_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalBlockShare_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalBlockShare_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalBlockShare_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalBlockShare_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalBlockShare_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalClaimable?: InputMaybe<Scalars['BigInt']['input']>;
  totalClaimable_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalClaimable_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalClaimable_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalClaimable_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalClaimable_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalClaimable_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalClaimable_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalClaimed?: InputMaybe<Scalars['BigInt']['input']>;
  totalClaimed_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalClaimed_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalClaimed_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalClaimed_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalClaimed_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalClaimed_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalClaimed_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  unstakeEvents_?: InputMaybe<UnstakeEvent_Filter>;
};

export enum Farm_OrderBy {
  Active = 'active',
  HarvestEvents = 'harvestEvents',
  Id = 'id',
  Pool = 'pool',
  PoolCollectedFeesToken0 = 'pool__collectedFeesToken0',
  PoolCollectedFeesToken1 = 'pool__collectedFeesToken1',
  PoolCollectedFeesUsd = 'pool__collectedFeesUSD',
  PoolCreatedAtBlockNumber = 'pool__createdAtBlockNumber',
  PoolCreatedAtTimestamp = 'pool__createdAtTimestamp',
  PoolFeeTier = 'pool__feeTier',
  PoolFeesUsd = 'pool__feesUSD',
  PoolId = 'pool__id',
  PoolLiquidity = 'pool__liquidity',
  PoolLiquidityProviderCount = 'pool__liquidityProviderCount',
  PoolSqrtPrice = 'pool__sqrtPrice',
  PoolTick = 'pool__tick',
  PoolToken0Price = 'pool__token0Price',
  PoolToken1Price = 'pool__token1Price',
  PoolTotalValueLockedEth = 'pool__totalValueLockedETH',
  PoolTotalValueLockedToken0 = 'pool__totalValueLockedToken0',
  PoolTotalValueLockedToken1 = 'pool__totalValueLockedToken1',
  PoolTotalValueLockedUsd = 'pool__totalValueLockedUSD',
  PoolTxCount = 'pool__txCount',
  PoolVolumeEth = 'pool__volumeETH',
  PoolVolumeToken0 = 'pool__volumeToken0',
  PoolVolumeToken1 = 'pool__volumeToken1',
  PoolVolumeUsd = 'pool__volumeUSD',
  Positions = 'positions',
  RewardPerBlock = 'rewardPerBlock',
  RewardToken = 'rewardToken',
  RewardTokenDecimals = 'rewardToken__decimals',
  RewardTokenDerivedEth = 'rewardToken__derivedETH',
  RewardTokenDerivedUsd = 'rewardToken__derivedUSD',
  RewardTokenEligiblePools = 'rewardToken__eligiblePools',
  RewardTokenFeesUsd = 'rewardToken__feesUSD',
  RewardTokenId = 'rewardToken__id',
  RewardTokenName = 'rewardToken__name',
  RewardTokenPoolCount = 'rewardToken__poolCount',
  RewardTokenSymbol = 'rewardToken__symbol',
  RewardTokenTotalValueLocked = 'rewardToken__totalValueLocked',
  RewardTokenTotalValueLockedUsd = 'rewardToken__totalValueLockedUSD',
  RewardTokenTxCount = 'rewardToken__txCount',
  RewardTokenVolume = 'rewardToken__volume',
  RewardTokenVolumeUsd = 'rewardToken__volumeUSD',
  StakeEvents = 'stakeEvents',
  TotalBlockShare = 'totalBlockShare',
  TotalClaimable = 'totalClaimable',
  TotalClaimed = 'totalClaimed',
  UnstakeEvents = 'unstakeEvents'
}

export type HarvestEvent = {
  __typename?: 'HarvestEvent';
  amount: Scalars['BigInt']['output'];
  blockNumber: Scalars['BigInt']['output'];
  farm: Farm;
  id: Scalars['ID']['output'];
  position: StakedPosition;
  positionFarm: StakedPositionFarm;
  timestamp: Scalars['BigInt']['output'];
  transaction: Transaction;
};

export type HarvestEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<HarvestEvent_Filter>>>;
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  farm?: InputMaybe<Scalars['String']['input']>;
  farm_?: InputMaybe<Farm_Filter>;
  farm_contains?: InputMaybe<Scalars['String']['input']>;
  farm_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  farm_ends_with?: InputMaybe<Scalars['String']['input']>;
  farm_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  farm_gt?: InputMaybe<Scalars['String']['input']>;
  farm_gte?: InputMaybe<Scalars['String']['input']>;
  farm_in?: InputMaybe<Array<Scalars['String']['input']>>;
  farm_lt?: InputMaybe<Scalars['String']['input']>;
  farm_lte?: InputMaybe<Scalars['String']['input']>;
  farm_not?: InputMaybe<Scalars['String']['input']>;
  farm_not_contains?: InputMaybe<Scalars['String']['input']>;
  farm_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  farm_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  farm_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  farm_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  farm_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  farm_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  farm_starts_with?: InputMaybe<Scalars['String']['input']>;
  farm_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<HarvestEvent_Filter>>>;
  position?: InputMaybe<Scalars['String']['input']>;
  positionFarm?: InputMaybe<Scalars['String']['input']>;
  positionFarm_?: InputMaybe<StakedPositionFarm_Filter>;
  positionFarm_contains?: InputMaybe<Scalars['String']['input']>;
  positionFarm_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  positionFarm_ends_with?: InputMaybe<Scalars['String']['input']>;
  positionFarm_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  positionFarm_gt?: InputMaybe<Scalars['String']['input']>;
  positionFarm_gte?: InputMaybe<Scalars['String']['input']>;
  positionFarm_in?: InputMaybe<Array<Scalars['String']['input']>>;
  positionFarm_lt?: InputMaybe<Scalars['String']['input']>;
  positionFarm_lte?: InputMaybe<Scalars['String']['input']>;
  positionFarm_not?: InputMaybe<Scalars['String']['input']>;
  positionFarm_not_contains?: InputMaybe<Scalars['String']['input']>;
  positionFarm_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  positionFarm_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  positionFarm_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  positionFarm_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  positionFarm_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  positionFarm_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  positionFarm_starts_with?: InputMaybe<Scalars['String']['input']>;
  positionFarm_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  position_?: InputMaybe<StakedPosition_Filter>;
  position_contains?: InputMaybe<Scalars['String']['input']>;
  position_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  position_ends_with?: InputMaybe<Scalars['String']['input']>;
  position_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  position_gt?: InputMaybe<Scalars['String']['input']>;
  position_gte?: InputMaybe<Scalars['String']['input']>;
  position_in?: InputMaybe<Array<Scalars['String']['input']>>;
  position_lt?: InputMaybe<Scalars['String']['input']>;
  position_lte?: InputMaybe<Scalars['String']['input']>;
  position_not?: InputMaybe<Scalars['String']['input']>;
  position_not_contains?: InputMaybe<Scalars['String']['input']>;
  position_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  position_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  position_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  position_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  position_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  position_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  position_starts_with?: InputMaybe<Scalars['String']['input']>;
  position_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  transaction?: InputMaybe<Scalars['String']['input']>;
  transaction_?: InputMaybe<Transaction_Filter>;
  transaction_contains?: InputMaybe<Scalars['String']['input']>;
  transaction_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction_ends_with?: InputMaybe<Scalars['String']['input']>;
  transaction_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction_gt?: InputMaybe<Scalars['String']['input']>;
  transaction_gte?: InputMaybe<Scalars['String']['input']>;
  transaction_in?: InputMaybe<Array<Scalars['String']['input']>>;
  transaction_lt?: InputMaybe<Scalars['String']['input']>;
  transaction_lte?: InputMaybe<Scalars['String']['input']>;
  transaction_not?: InputMaybe<Scalars['String']['input']>;
  transaction_not_contains?: InputMaybe<Scalars['String']['input']>;
  transaction_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  transaction_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  transaction_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  transaction_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction_starts_with?: InputMaybe<Scalars['String']['input']>;
  transaction_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum HarvestEvent_OrderBy {
  Amount = 'amount',
  BlockNumber = 'blockNumber',
  Farm = 'farm',
  FarmActive = 'farm__active',
  FarmId = 'farm__id',
  FarmRewardPerBlock = 'farm__rewardPerBlock',
  FarmTotalBlockShare = 'farm__totalBlockShare',
  FarmTotalClaimable = 'farm__totalClaimable',
  FarmTotalClaimed = 'farm__totalClaimed',
  Id = 'id',
  Position = 'position',
  PositionFarm = 'positionFarm',
  PositionFarmId = 'positionFarm__id',
  PositionFarmLastUpdateBlock = 'positionFarm__lastUpdateBlock',
  PositionFarmLastUpdateTimestamp = 'positionFarm__lastUpdateTimestamp',
  PositionFarmTotalClaimable = 'positionFarm__totalClaimable',
  PositionBlockShare = 'position__blockShare',
  PositionId = 'position__id',
  PositionIsActive = 'position__isActive',
  PositionIsStaked = 'position__isStaked',
  PositionLastUpdateBlock = 'position__lastUpdateBlock',
  PositionLastUpdateTimestamp = 'position__lastUpdateTimestamp',
  PositionOwner = 'position__owner',
  PositionTokenId = 'position__tokenId',
  Timestamp = 'timestamp',
  Transaction = 'transaction',
  TransactionBlockNumber = 'transaction__blockNumber',
  TransactionGasPrice = 'transaction__gasPrice',
  TransactionGasUsed = 'transaction__gasUsed',
  TransactionId = 'transaction__id',
  TransactionTimestamp = 'transaction__timestamp'
}

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc'
}

export type Pool = {
  __typename?: 'Pool';
  collectedFeesToken0: Scalars['BigInt']['output'];
  collectedFeesToken1: Scalars['BigInt']['output'];
  collectedFeesUSD: Scalars['BigDecimal']['output'];
  createdAtBlockNumber: Scalars['BigInt']['output'];
  createdAtTimestamp: Scalars['BigInt']['output'];
  farms: Array<Farm>;
  feeTier: Scalars['BigInt']['output'];
  feesUSD: Scalars['BigDecimal']['output'];
  id: Scalars['ID']['output'];
  liquidity: Scalars['BigInt']['output'];
  liquidityProviderCount: Scalars['BigInt']['output'];
  pool5MinData: Array<Pool5MinData>;
  poolDayData: Array<PoolDayData>;
  poolHourData: Array<PoolHourData>;
  sqrtPrice: Scalars['BigInt']['output'];
  stakedPositions: Array<StakedPosition>;
  tick?: Maybe<Scalars['BigInt']['output']>;
  ticks: Array<Tick>;
  token0: Token;
  token0Price: Scalars['BigDecimal']['output'];
  token1: Token;
  token1Price: Scalars['BigDecimal']['output'];
  totalValueLockedETH: Scalars['BigDecimal']['output'];
  totalValueLockedToken0: Scalars['BigInt']['output'];
  totalValueLockedToken1: Scalars['BigInt']['output'];
  totalValueLockedUSD: Scalars['BigDecimal']['output'];
  txCount: Scalars['BigInt']['output'];
  volumeETH: Scalars['BigDecimal']['output'];
  volumeToken0: Scalars['BigInt']['output'];
  volumeToken1: Scalars['BigInt']['output'];
  volumeUSD: Scalars['BigDecimal']['output'];
};


export type PoolFarmsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Farm_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Farm_Filter>;
};


export type PoolPool5MinDataArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Pool5MinData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Pool5MinData_Filter>;
};


export type PoolPoolDayDataArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PoolDayData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<PoolDayData_Filter>;
};


export type PoolPoolHourDataArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PoolHourData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<PoolHourData_Filter>;
};


export type PoolStakedPositionsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<StakedPosition_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<StakedPosition_Filter>;
};


export type PoolTicksArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Tick_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Tick_Filter>;
};

export type Pool5MinData = {
  __typename?: 'Pool5MinData';
  close: Scalars['BigDecimal']['output'];
  feesUSD: Scalars['BigDecimal']['output'];
  high: Scalars['BigDecimal']['output'];
  id: Scalars['ID']['output'];
  liquidity: Scalars['BigInt']['output'];
  low: Scalars['BigDecimal']['output'];
  open: Scalars['BigDecimal']['output'];
  pool: Pool;
  sqrtPrice: Scalars['BigInt']['output'];
  tick?: Maybe<Scalars['BigInt']['output']>;
  timestamp: Scalars['Int']['output'];
  token0Price: Scalars['BigDecimal']['output'];
  token1Price: Scalars['BigDecimal']['output'];
  tvlUSD: Scalars['BigDecimal']['output'];
  txCount: Scalars['BigInt']['output'];
  volumeToken0: Scalars['BigInt']['output'];
  volumeToken1: Scalars['BigInt']['output'];
  volumeUSD: Scalars['BigDecimal']['output'];
};

export type Pool5MinData_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Pool5MinData_Filter>>>;
  close?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  close_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  high?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  high_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  liquidity?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_gt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_gte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  liquidity_lt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_lte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_not?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  low?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  low_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  open?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  open_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Pool5MinData_Filter>>>;
  pool?: InputMaybe<Scalars['String']['input']>;
  pool_?: InputMaybe<Pool_Filter>;
  pool_contains?: InputMaybe<Scalars['String']['input']>;
  pool_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_gt?: InputMaybe<Scalars['String']['input']>;
  pool_gte?: InputMaybe<Scalars['String']['input']>;
  pool_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_lt?: InputMaybe<Scalars['String']['input']>;
  pool_lte?: InputMaybe<Scalars['String']['input']>;
  pool_not?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  sqrtPrice?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_gt?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_gte?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  sqrtPrice_lt?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_lte?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_not?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tick?: InputMaybe<Scalars['BigInt']['input']>;
  tick_gt?: InputMaybe<Scalars['BigInt']['input']>;
  tick_gte?: InputMaybe<Scalars['BigInt']['input']>;
  tick_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tick_lt?: InputMaybe<Scalars['BigInt']['input']>;
  tick_lte?: InputMaybe<Scalars['BigInt']['input']>;
  tick_not?: InputMaybe<Scalars['BigInt']['input']>;
  tick_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  token0Price?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token0Price_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token1Price?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token1Price_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  tvlUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  tvlUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  tvlUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  tvlUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  tvlUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  tvlUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  tvlUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  tvlUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  txCount?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  txCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeToken0?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeToken0_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_not?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeToken1?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeToken1_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_not?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
};

export enum Pool5MinData_OrderBy {
  Close = 'close',
  FeesUsd = 'feesUSD',
  High = 'high',
  Id = 'id',
  Liquidity = 'liquidity',
  Low = 'low',
  Open = 'open',
  Pool = 'pool',
  PoolCollectedFeesToken0 = 'pool__collectedFeesToken0',
  PoolCollectedFeesToken1 = 'pool__collectedFeesToken1',
  PoolCollectedFeesUsd = 'pool__collectedFeesUSD',
  PoolCreatedAtBlockNumber = 'pool__createdAtBlockNumber',
  PoolCreatedAtTimestamp = 'pool__createdAtTimestamp',
  PoolFeeTier = 'pool__feeTier',
  PoolFeesUsd = 'pool__feesUSD',
  PoolId = 'pool__id',
  PoolLiquidity = 'pool__liquidity',
  PoolLiquidityProviderCount = 'pool__liquidityProviderCount',
  PoolSqrtPrice = 'pool__sqrtPrice',
  PoolTick = 'pool__tick',
  PoolToken0Price = 'pool__token0Price',
  PoolToken1Price = 'pool__token1Price',
  PoolTotalValueLockedEth = 'pool__totalValueLockedETH',
  PoolTotalValueLockedToken0 = 'pool__totalValueLockedToken0',
  PoolTotalValueLockedToken1 = 'pool__totalValueLockedToken1',
  PoolTotalValueLockedUsd = 'pool__totalValueLockedUSD',
  PoolTxCount = 'pool__txCount',
  PoolVolumeEth = 'pool__volumeETH',
  PoolVolumeToken0 = 'pool__volumeToken0',
  PoolVolumeToken1 = 'pool__volumeToken1',
  PoolVolumeUsd = 'pool__volumeUSD',
  SqrtPrice = 'sqrtPrice',
  Tick = 'tick',
  Timestamp = 'timestamp',
  Token0Price = 'token0Price',
  Token1Price = 'token1Price',
  TvlUsd = 'tvlUSD',
  TxCount = 'txCount',
  VolumeToken0 = 'volumeToken0',
  VolumeToken1 = 'volumeToken1',
  VolumeUsd = 'volumeUSD'
}

export type PoolDayData = {
  __typename?: 'PoolDayData';
  close: Scalars['BigDecimal']['output'];
  feesUSD: Scalars['BigDecimal']['output'];
  high: Scalars['BigDecimal']['output'];
  id: Scalars['ID']['output'];
  liquidity: Scalars['BigInt']['output'];
  low: Scalars['BigDecimal']['output'];
  open: Scalars['BigDecimal']['output'];
  pool: Pool;
  sqrtPrice: Scalars['BigInt']['output'];
  tick?: Maybe<Scalars['BigInt']['output']>;
  timestamp: Scalars['Int']['output'];
  token0Price: Scalars['BigDecimal']['output'];
  token1Price: Scalars['BigDecimal']['output'];
  tvlUSD: Scalars['BigDecimal']['output'];
  txCount: Scalars['BigInt']['output'];
  volumeToken0: Scalars['BigInt']['output'];
  volumeToken1: Scalars['BigInt']['output'];
  volumeUSD: Scalars['BigDecimal']['output'];
};

export type PoolDayData_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<PoolDayData_Filter>>>;
  close?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  close_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  high?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  high_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  liquidity?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_gt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_gte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  liquidity_lt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_lte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_not?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  low?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  low_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  open?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  open_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  or?: InputMaybe<Array<InputMaybe<PoolDayData_Filter>>>;
  pool?: InputMaybe<Scalars['String']['input']>;
  pool_?: InputMaybe<Pool_Filter>;
  pool_contains?: InputMaybe<Scalars['String']['input']>;
  pool_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_gt?: InputMaybe<Scalars['String']['input']>;
  pool_gte?: InputMaybe<Scalars['String']['input']>;
  pool_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_lt?: InputMaybe<Scalars['String']['input']>;
  pool_lte?: InputMaybe<Scalars['String']['input']>;
  pool_not?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  sqrtPrice?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_gt?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_gte?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  sqrtPrice_lt?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_lte?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_not?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tick?: InputMaybe<Scalars['BigInt']['input']>;
  tick_gt?: InputMaybe<Scalars['BigInt']['input']>;
  tick_gte?: InputMaybe<Scalars['BigInt']['input']>;
  tick_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tick_lt?: InputMaybe<Scalars['BigInt']['input']>;
  tick_lte?: InputMaybe<Scalars['BigInt']['input']>;
  tick_not?: InputMaybe<Scalars['BigInt']['input']>;
  tick_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  token0Price?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token0Price_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token1Price?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token1Price_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  tvlUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  tvlUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  tvlUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  tvlUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  tvlUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  tvlUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  tvlUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  tvlUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  txCount?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  txCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeToken0?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeToken0_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_not?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeToken1?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeToken1_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_not?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
};

export enum PoolDayData_OrderBy {
  Close = 'close',
  FeesUsd = 'feesUSD',
  High = 'high',
  Id = 'id',
  Liquidity = 'liquidity',
  Low = 'low',
  Open = 'open',
  Pool = 'pool',
  PoolCollectedFeesToken0 = 'pool__collectedFeesToken0',
  PoolCollectedFeesToken1 = 'pool__collectedFeesToken1',
  PoolCollectedFeesUsd = 'pool__collectedFeesUSD',
  PoolCreatedAtBlockNumber = 'pool__createdAtBlockNumber',
  PoolCreatedAtTimestamp = 'pool__createdAtTimestamp',
  PoolFeeTier = 'pool__feeTier',
  PoolFeesUsd = 'pool__feesUSD',
  PoolId = 'pool__id',
  PoolLiquidity = 'pool__liquidity',
  PoolLiquidityProviderCount = 'pool__liquidityProviderCount',
  PoolSqrtPrice = 'pool__sqrtPrice',
  PoolTick = 'pool__tick',
  PoolToken0Price = 'pool__token0Price',
  PoolToken1Price = 'pool__token1Price',
  PoolTotalValueLockedEth = 'pool__totalValueLockedETH',
  PoolTotalValueLockedToken0 = 'pool__totalValueLockedToken0',
  PoolTotalValueLockedToken1 = 'pool__totalValueLockedToken1',
  PoolTotalValueLockedUsd = 'pool__totalValueLockedUSD',
  PoolTxCount = 'pool__txCount',
  PoolVolumeEth = 'pool__volumeETH',
  PoolVolumeToken0 = 'pool__volumeToken0',
  PoolVolumeToken1 = 'pool__volumeToken1',
  PoolVolumeUsd = 'pool__volumeUSD',
  SqrtPrice = 'sqrtPrice',
  Tick = 'tick',
  Timestamp = 'timestamp',
  Token0Price = 'token0Price',
  Token1Price = 'token1Price',
  TvlUsd = 'tvlUSD',
  TxCount = 'txCount',
  VolumeToken0 = 'volumeToken0',
  VolumeToken1 = 'volumeToken1',
  VolumeUsd = 'volumeUSD'
}

export type PoolHourData = {
  __typename?: 'PoolHourData';
  close: Scalars['BigDecimal']['output'];
  feesUSD: Scalars['BigDecimal']['output'];
  high: Scalars['BigDecimal']['output'];
  id: Scalars['ID']['output'];
  liquidity: Scalars['BigInt']['output'];
  low: Scalars['BigDecimal']['output'];
  open: Scalars['BigDecimal']['output'];
  pool: Pool;
  sqrtPrice: Scalars['BigInt']['output'];
  tick?: Maybe<Scalars['BigInt']['output']>;
  timestamp: Scalars['Int']['output'];
  token0Price: Scalars['BigDecimal']['output'];
  token1Price: Scalars['BigDecimal']['output'];
  tvlUSD: Scalars['BigDecimal']['output'];
  txCount: Scalars['BigInt']['output'];
  volumeToken0: Scalars['BigInt']['output'];
  volumeToken1: Scalars['BigInt']['output'];
  volumeUSD: Scalars['BigDecimal']['output'];
};

export type PoolHourData_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<PoolHourData_Filter>>>;
  close?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  close_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  high?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  high_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  liquidity?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_gt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_gte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  liquidity_lt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_lte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_not?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  low?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  low_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  open?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  open_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  or?: InputMaybe<Array<InputMaybe<PoolHourData_Filter>>>;
  pool?: InputMaybe<Scalars['String']['input']>;
  pool_?: InputMaybe<Pool_Filter>;
  pool_contains?: InputMaybe<Scalars['String']['input']>;
  pool_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_gt?: InputMaybe<Scalars['String']['input']>;
  pool_gte?: InputMaybe<Scalars['String']['input']>;
  pool_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_lt?: InputMaybe<Scalars['String']['input']>;
  pool_lte?: InputMaybe<Scalars['String']['input']>;
  pool_not?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  sqrtPrice?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_gt?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_gte?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  sqrtPrice_lt?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_lte?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_not?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tick?: InputMaybe<Scalars['BigInt']['input']>;
  tick_gt?: InputMaybe<Scalars['BigInt']['input']>;
  tick_gte?: InputMaybe<Scalars['BigInt']['input']>;
  tick_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tick_lt?: InputMaybe<Scalars['BigInt']['input']>;
  tick_lte?: InputMaybe<Scalars['BigInt']['input']>;
  tick_not?: InputMaybe<Scalars['BigInt']['input']>;
  tick_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  token0Price?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token0Price_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token1Price?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token1Price_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  tvlUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  tvlUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  tvlUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  tvlUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  tvlUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  tvlUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  tvlUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  tvlUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  txCount?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  txCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeToken0?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeToken0_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_not?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeToken1?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeToken1_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_not?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
};

export enum PoolHourData_OrderBy {
  Close = 'close',
  FeesUsd = 'feesUSD',
  High = 'high',
  Id = 'id',
  Liquidity = 'liquidity',
  Low = 'low',
  Open = 'open',
  Pool = 'pool',
  PoolCollectedFeesToken0 = 'pool__collectedFeesToken0',
  PoolCollectedFeesToken1 = 'pool__collectedFeesToken1',
  PoolCollectedFeesUsd = 'pool__collectedFeesUSD',
  PoolCreatedAtBlockNumber = 'pool__createdAtBlockNumber',
  PoolCreatedAtTimestamp = 'pool__createdAtTimestamp',
  PoolFeeTier = 'pool__feeTier',
  PoolFeesUsd = 'pool__feesUSD',
  PoolId = 'pool__id',
  PoolLiquidity = 'pool__liquidity',
  PoolLiquidityProviderCount = 'pool__liquidityProviderCount',
  PoolSqrtPrice = 'pool__sqrtPrice',
  PoolTick = 'pool__tick',
  PoolToken0Price = 'pool__token0Price',
  PoolToken1Price = 'pool__token1Price',
  PoolTotalValueLockedEth = 'pool__totalValueLockedETH',
  PoolTotalValueLockedToken0 = 'pool__totalValueLockedToken0',
  PoolTotalValueLockedToken1 = 'pool__totalValueLockedToken1',
  PoolTotalValueLockedUsd = 'pool__totalValueLockedUSD',
  PoolTxCount = 'pool__txCount',
  PoolVolumeEth = 'pool__volumeETH',
  PoolVolumeToken0 = 'pool__volumeToken0',
  PoolVolumeToken1 = 'pool__volumeToken1',
  PoolVolumeUsd = 'pool__volumeUSD',
  SqrtPrice = 'sqrtPrice',
  Tick = 'tick',
  Timestamp = 'timestamp',
  Token0Price = 'token0Price',
  Token1Price = 'token1Price',
  TvlUsd = 'tvlUSD',
  TxCount = 'txCount',
  VolumeToken0 = 'volumeToken0',
  VolumeToken1 = 'volumeToken1',
  VolumeUsd = 'volumeUSD'
}

export type PoolTransaction = {
  __typename?: 'PoolTransaction';
  amountETH: Scalars['BigDecimal']['output'];
  amountUSD: Scalars['BigDecimal']['output'];
  id: Scalars['ID']['output'];
  maker: Scalars['String']['output'];
  pool: Scalars['String']['output'];
  tick: Scalars['BigInt']['output'];
  timestamp: Scalars['BigInt']['output'];
  token0: Scalars['String']['output'];
  token0Amount: Scalars['BigInt']['output'];
  token1: Scalars['String']['output'];
  token1Amount: Scalars['BigInt']['output'];
  type: Scalars['String']['output'];
};

export type PoolTransaction_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amountETH?: InputMaybe<Scalars['BigDecimal']['input']>;
  amountETH_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  amountETH_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  amountETH_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  amountETH_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  amountETH_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  amountETH_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  amountETH_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  amountUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  amountUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  amountUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  amountUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  amountUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  amountUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  amountUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  amountUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  and?: InputMaybe<Array<InputMaybe<PoolTransaction_Filter>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  maker?: InputMaybe<Scalars['String']['input']>;
  maker_contains?: InputMaybe<Scalars['String']['input']>;
  maker_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  maker_ends_with?: InputMaybe<Scalars['String']['input']>;
  maker_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  maker_gt?: InputMaybe<Scalars['String']['input']>;
  maker_gte?: InputMaybe<Scalars['String']['input']>;
  maker_in?: InputMaybe<Array<Scalars['String']['input']>>;
  maker_lt?: InputMaybe<Scalars['String']['input']>;
  maker_lte?: InputMaybe<Scalars['String']['input']>;
  maker_not?: InputMaybe<Scalars['String']['input']>;
  maker_not_contains?: InputMaybe<Scalars['String']['input']>;
  maker_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  maker_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  maker_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  maker_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  maker_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  maker_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  maker_starts_with?: InputMaybe<Scalars['String']['input']>;
  maker_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<InputMaybe<PoolTransaction_Filter>>>;
  pool?: InputMaybe<Scalars['String']['input']>;
  pool_contains?: InputMaybe<Scalars['String']['input']>;
  pool_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_gt?: InputMaybe<Scalars['String']['input']>;
  pool_gte?: InputMaybe<Scalars['String']['input']>;
  pool_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_lt?: InputMaybe<Scalars['String']['input']>;
  pool_lte?: InputMaybe<Scalars['String']['input']>;
  pool_not?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tick?: InputMaybe<Scalars['BigInt']['input']>;
  tick_gt?: InputMaybe<Scalars['BigInt']['input']>;
  tick_gte?: InputMaybe<Scalars['BigInt']['input']>;
  tick_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tick_lt?: InputMaybe<Scalars['BigInt']['input']>;
  tick_lte?: InputMaybe<Scalars['BigInt']['input']>;
  tick_not?: InputMaybe<Scalars['BigInt']['input']>;
  tick_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  token0?: InputMaybe<Scalars['String']['input']>;
  token0Amount?: InputMaybe<Scalars['BigInt']['input']>;
  token0Amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  token0Amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  token0Amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  token0Amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  token0Amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  token0Amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  token0Amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  token0_contains?: InputMaybe<Scalars['String']['input']>;
  token0_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_ends_with?: InputMaybe<Scalars['String']['input']>;
  token0_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_gt?: InputMaybe<Scalars['String']['input']>;
  token0_gte?: InputMaybe<Scalars['String']['input']>;
  token0_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token0_lt?: InputMaybe<Scalars['String']['input']>;
  token0_lte?: InputMaybe<Scalars['String']['input']>;
  token0_not?: InputMaybe<Scalars['String']['input']>;
  token0_not_contains?: InputMaybe<Scalars['String']['input']>;
  token0_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token0_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token0_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token0_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_starts_with?: InputMaybe<Scalars['String']['input']>;
  token0_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1?: InputMaybe<Scalars['String']['input']>;
  token1Amount?: InputMaybe<Scalars['BigInt']['input']>;
  token1Amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  token1Amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  token1Amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  token1Amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  token1Amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  token1Amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  token1Amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  token1_contains?: InputMaybe<Scalars['String']['input']>;
  token1_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_ends_with?: InputMaybe<Scalars['String']['input']>;
  token1_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_gt?: InputMaybe<Scalars['String']['input']>;
  token1_gte?: InputMaybe<Scalars['String']['input']>;
  token1_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token1_lt?: InputMaybe<Scalars['String']['input']>;
  token1_lte?: InputMaybe<Scalars['String']['input']>;
  token1_not?: InputMaybe<Scalars['String']['input']>;
  token1_not_contains?: InputMaybe<Scalars['String']['input']>;
  token1_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token1_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token1_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token1_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_starts_with?: InputMaybe<Scalars['String']['input']>;
  token1_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  type_contains?: InputMaybe<Scalars['String']['input']>;
  type_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  type_ends_with?: InputMaybe<Scalars['String']['input']>;
  type_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  type_gt?: InputMaybe<Scalars['String']['input']>;
  type_gte?: InputMaybe<Scalars['String']['input']>;
  type_in?: InputMaybe<Array<Scalars['String']['input']>>;
  type_lt?: InputMaybe<Scalars['String']['input']>;
  type_lte?: InputMaybe<Scalars['String']['input']>;
  type_not?: InputMaybe<Scalars['String']['input']>;
  type_not_contains?: InputMaybe<Scalars['String']['input']>;
  type_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  type_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  type_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  type_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  type_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  type_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  type_starts_with?: InputMaybe<Scalars['String']['input']>;
  type_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum PoolTransaction_OrderBy {
  AmountEth = 'amountETH',
  AmountUsd = 'amountUSD',
  Id = 'id',
  Maker = 'maker',
  Pool = 'pool',
  Tick = 'tick',
  Timestamp = 'timestamp',
  Token0 = 'token0',
  Token0Amount = 'token0Amount',
  Token1 = 'token1',
  Token1Amount = 'token1Amount',
  Type = 'type'
}

export type Pool_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Pool_Filter>>>;
  collectedFeesToken0?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken0_gt?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken0_gte?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken0_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  collectedFeesToken0_lt?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken0_lte?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken0_not?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken0_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  collectedFeesToken1?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken1_gt?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken1_gte?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken1_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  collectedFeesToken1_lt?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken1_lte?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken1_not?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken1_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  collectedFeesUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  collectedFeesUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  createdAtBlockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtBlockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtBlockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAtBlockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtBlockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtBlockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAtTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAtTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  farms_?: InputMaybe<Farm_Filter>;
  feeTier?: InputMaybe<Scalars['BigInt']['input']>;
  feeTier_gt?: InputMaybe<Scalars['BigInt']['input']>;
  feeTier_gte?: InputMaybe<Scalars['BigInt']['input']>;
  feeTier_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feeTier_lt?: InputMaybe<Scalars['BigInt']['input']>;
  feeTier_lte?: InputMaybe<Scalars['BigInt']['input']>;
  feeTier_not?: InputMaybe<Scalars['BigInt']['input']>;
  feeTier_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feesUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  liquidity?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityProviderCount?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityProviderCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityProviderCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityProviderCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  liquidityProviderCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityProviderCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityProviderCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityProviderCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  liquidity_gt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_gte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  liquidity_lt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_lte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_not?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Pool_Filter>>>;
  pool5MinData_?: InputMaybe<Pool5MinData_Filter>;
  poolDayData_?: InputMaybe<PoolDayData_Filter>;
  poolHourData_?: InputMaybe<PoolHourData_Filter>;
  sqrtPrice?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_gt?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_gte?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  sqrtPrice_lt?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_lte?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_not?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  stakedPositions_?: InputMaybe<StakedPosition_Filter>;
  tick?: InputMaybe<Scalars['BigInt']['input']>;
  tick_gt?: InputMaybe<Scalars['BigInt']['input']>;
  tick_gte?: InputMaybe<Scalars['BigInt']['input']>;
  tick_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tick_lt?: InputMaybe<Scalars['BigInt']['input']>;
  tick_lte?: InputMaybe<Scalars['BigInt']['input']>;
  tick_not?: InputMaybe<Scalars['BigInt']['input']>;
  tick_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  ticks_?: InputMaybe<Tick_Filter>;
  token0?: InputMaybe<Scalars['String']['input']>;
  token0Price?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token0Price_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token0_?: InputMaybe<Token_Filter>;
  token0_contains?: InputMaybe<Scalars['String']['input']>;
  token0_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_ends_with?: InputMaybe<Scalars['String']['input']>;
  token0_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_gt?: InputMaybe<Scalars['String']['input']>;
  token0_gte?: InputMaybe<Scalars['String']['input']>;
  token0_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token0_lt?: InputMaybe<Scalars['String']['input']>;
  token0_lte?: InputMaybe<Scalars['String']['input']>;
  token0_not?: InputMaybe<Scalars['String']['input']>;
  token0_not_contains?: InputMaybe<Scalars['String']['input']>;
  token0_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token0_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token0_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token0_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_starts_with?: InputMaybe<Scalars['String']['input']>;
  token0_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1?: InputMaybe<Scalars['String']['input']>;
  token1Price?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token1Price_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token1_?: InputMaybe<Token_Filter>;
  token1_contains?: InputMaybe<Scalars['String']['input']>;
  token1_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_ends_with?: InputMaybe<Scalars['String']['input']>;
  token1_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_gt?: InputMaybe<Scalars['String']['input']>;
  token1_gte?: InputMaybe<Scalars['String']['input']>;
  token1_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token1_lt?: InputMaybe<Scalars['String']['input']>;
  token1_lte?: InputMaybe<Scalars['String']['input']>;
  token1_not?: InputMaybe<Scalars['String']['input']>;
  token1_not_contains?: InputMaybe<Scalars['String']['input']>;
  token1_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token1_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token1_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token1_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_starts_with?: InputMaybe<Scalars['String']['input']>;
  token1_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  totalValueLockedETH?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedETH_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedETH_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedETH_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedETH_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedETH_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedETH_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedETH_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedToken0?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLockedToken0_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLockedToken0_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLockedToken0_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalValueLockedToken0_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLockedToken0_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLockedToken0_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLockedToken0_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalValueLockedToken1?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLockedToken1_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLockedToken1_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLockedToken1_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalValueLockedToken1_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLockedToken1_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLockedToken1_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLockedToken1_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalValueLockedUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  txCount?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  txCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeETH?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeETH_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeETH_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeETH_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeETH_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeETH_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeETH_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeETH_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeToken0?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeToken0_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_not?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeToken1?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeToken1_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_not?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
};

export enum Pool_OrderBy {
  CollectedFeesToken0 = 'collectedFeesToken0',
  CollectedFeesToken1 = 'collectedFeesToken1',
  CollectedFeesUsd = 'collectedFeesUSD',
  CreatedAtBlockNumber = 'createdAtBlockNumber',
  CreatedAtTimestamp = 'createdAtTimestamp',
  Farms = 'farms',
  FeeTier = 'feeTier',
  FeesUsd = 'feesUSD',
  Id = 'id',
  Liquidity = 'liquidity',
  LiquidityProviderCount = 'liquidityProviderCount',
  Pool5MinData = 'pool5MinData',
  PoolDayData = 'poolDayData',
  PoolHourData = 'poolHourData',
  SqrtPrice = 'sqrtPrice',
  StakedPositions = 'stakedPositions',
  Tick = 'tick',
  Ticks = 'ticks',
  Token0 = 'token0',
  Token0Price = 'token0Price',
  Token0Decimals = 'token0__decimals',
  Token0DerivedEth = 'token0__derivedETH',
  Token0DerivedUsd = 'token0__derivedUSD',
  Token0EligiblePools = 'token0__eligiblePools',
  Token0FeesUsd = 'token0__feesUSD',
  Token0Id = 'token0__id',
  Token0Name = 'token0__name',
  Token0PoolCount = 'token0__poolCount',
  Token0Symbol = 'token0__symbol',
  Token0TotalValueLocked = 'token0__totalValueLocked',
  Token0TotalValueLockedUsd = 'token0__totalValueLockedUSD',
  Token0TxCount = 'token0__txCount',
  Token0Volume = 'token0__volume',
  Token0VolumeUsd = 'token0__volumeUSD',
  Token1 = 'token1',
  Token1Price = 'token1Price',
  Token1Decimals = 'token1__decimals',
  Token1DerivedEth = 'token1__derivedETH',
  Token1DerivedUsd = 'token1__derivedUSD',
  Token1EligiblePools = 'token1__eligiblePools',
  Token1FeesUsd = 'token1__feesUSD',
  Token1Id = 'token1__id',
  Token1Name = 'token1__name',
  Token1PoolCount = 'token1__poolCount',
  Token1Symbol = 'token1__symbol',
  Token1TotalValueLocked = 'token1__totalValueLocked',
  Token1TotalValueLockedUsd = 'token1__totalValueLockedUSD',
  Token1TxCount = 'token1__txCount',
  Token1Volume = 'token1__volume',
  Token1VolumeUsd = 'token1__volumeUSD',
  TotalValueLockedEth = 'totalValueLockedETH',
  TotalValueLockedToken0 = 'totalValueLockedToken0',
  TotalValueLockedToken1 = 'totalValueLockedToken1',
  TotalValueLockedUsd = 'totalValueLockedUSD',
  TxCount = 'txCount',
  VolumeEth = 'volumeETH',
  VolumeToken0 = 'volumeToken0',
  VolumeToken1 = 'volumeToken1',
  VolumeUsd = 'volumeUSD'
}

export type Position = {
  __typename?: 'Position';
  collectedFeesToken0: Scalars['BigInt']['output'];
  collectedFeesToken1: Scalars['BigInt']['output'];
  depositedToken0: Scalars['BigInt']['output'];
  depositedToken1: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  liquidity: Scalars['BigInt']['output'];
  owner: Scalars['String']['output'];
  pool: Pool;
  tickLower: Tick;
  tickUpper: Tick;
  token0: Token;
  token1: Token;
  transaction: Transaction;
  withdrawnToken0: Scalars['BigInt']['output'];
  withdrawnToken1: Scalars['BigInt']['output'];
};

export type Position_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Position_Filter>>>;
  collectedFeesToken0?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken0_gt?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken0_gte?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken0_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  collectedFeesToken0_lt?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken0_lte?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken0_not?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken0_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  collectedFeesToken1?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken1_gt?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken1_gte?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken1_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  collectedFeesToken1_lt?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken1_lte?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken1_not?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken1_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  depositedToken0?: InputMaybe<Scalars['BigInt']['input']>;
  depositedToken0_gt?: InputMaybe<Scalars['BigInt']['input']>;
  depositedToken0_gte?: InputMaybe<Scalars['BigInt']['input']>;
  depositedToken0_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  depositedToken0_lt?: InputMaybe<Scalars['BigInt']['input']>;
  depositedToken0_lte?: InputMaybe<Scalars['BigInt']['input']>;
  depositedToken0_not?: InputMaybe<Scalars['BigInt']['input']>;
  depositedToken0_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  depositedToken1?: InputMaybe<Scalars['BigInt']['input']>;
  depositedToken1_gt?: InputMaybe<Scalars['BigInt']['input']>;
  depositedToken1_gte?: InputMaybe<Scalars['BigInt']['input']>;
  depositedToken1_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  depositedToken1_lt?: InputMaybe<Scalars['BigInt']['input']>;
  depositedToken1_lte?: InputMaybe<Scalars['BigInt']['input']>;
  depositedToken1_not?: InputMaybe<Scalars['BigInt']['input']>;
  depositedToken1_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  liquidity?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_gt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_gte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  liquidity_lt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_lte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_not?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Position_Filter>>>;
  owner?: InputMaybe<Scalars['String']['input']>;
  owner_contains?: InputMaybe<Scalars['String']['input']>;
  owner_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_ends_with?: InputMaybe<Scalars['String']['input']>;
  owner_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_gt?: InputMaybe<Scalars['String']['input']>;
  owner_gte?: InputMaybe<Scalars['String']['input']>;
  owner_in?: InputMaybe<Array<Scalars['String']['input']>>;
  owner_lt?: InputMaybe<Scalars['String']['input']>;
  owner_lte?: InputMaybe<Scalars['String']['input']>;
  owner_not?: InputMaybe<Scalars['String']['input']>;
  owner_not_contains?: InputMaybe<Scalars['String']['input']>;
  owner_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  owner_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  owner_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  owner_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_starts_with?: InputMaybe<Scalars['String']['input']>;
  owner_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool?: InputMaybe<Scalars['String']['input']>;
  pool_?: InputMaybe<Pool_Filter>;
  pool_contains?: InputMaybe<Scalars['String']['input']>;
  pool_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_gt?: InputMaybe<Scalars['String']['input']>;
  pool_gte?: InputMaybe<Scalars['String']['input']>;
  pool_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_lt?: InputMaybe<Scalars['String']['input']>;
  pool_lte?: InputMaybe<Scalars['String']['input']>;
  pool_not?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tickLower?: InputMaybe<Scalars['String']['input']>;
  tickLower_?: InputMaybe<Tick_Filter>;
  tickLower_contains?: InputMaybe<Scalars['String']['input']>;
  tickLower_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tickLower_ends_with?: InputMaybe<Scalars['String']['input']>;
  tickLower_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tickLower_gt?: InputMaybe<Scalars['String']['input']>;
  tickLower_gte?: InputMaybe<Scalars['String']['input']>;
  tickLower_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tickLower_lt?: InputMaybe<Scalars['String']['input']>;
  tickLower_lte?: InputMaybe<Scalars['String']['input']>;
  tickLower_not?: InputMaybe<Scalars['String']['input']>;
  tickLower_not_contains?: InputMaybe<Scalars['String']['input']>;
  tickLower_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tickLower_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  tickLower_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tickLower_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tickLower_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  tickLower_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tickLower_starts_with?: InputMaybe<Scalars['String']['input']>;
  tickLower_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tickUpper?: InputMaybe<Scalars['String']['input']>;
  tickUpper_?: InputMaybe<Tick_Filter>;
  tickUpper_contains?: InputMaybe<Scalars['String']['input']>;
  tickUpper_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tickUpper_ends_with?: InputMaybe<Scalars['String']['input']>;
  tickUpper_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tickUpper_gt?: InputMaybe<Scalars['String']['input']>;
  tickUpper_gte?: InputMaybe<Scalars['String']['input']>;
  tickUpper_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tickUpper_lt?: InputMaybe<Scalars['String']['input']>;
  tickUpper_lte?: InputMaybe<Scalars['String']['input']>;
  tickUpper_not?: InputMaybe<Scalars['String']['input']>;
  tickUpper_not_contains?: InputMaybe<Scalars['String']['input']>;
  tickUpper_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tickUpper_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  tickUpper_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tickUpper_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tickUpper_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  tickUpper_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tickUpper_starts_with?: InputMaybe<Scalars['String']['input']>;
  tickUpper_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0?: InputMaybe<Scalars['String']['input']>;
  token0_?: InputMaybe<Token_Filter>;
  token0_contains?: InputMaybe<Scalars['String']['input']>;
  token0_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_ends_with?: InputMaybe<Scalars['String']['input']>;
  token0_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_gt?: InputMaybe<Scalars['String']['input']>;
  token0_gte?: InputMaybe<Scalars['String']['input']>;
  token0_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token0_lt?: InputMaybe<Scalars['String']['input']>;
  token0_lte?: InputMaybe<Scalars['String']['input']>;
  token0_not?: InputMaybe<Scalars['String']['input']>;
  token0_not_contains?: InputMaybe<Scalars['String']['input']>;
  token0_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token0_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token0_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token0_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_starts_with?: InputMaybe<Scalars['String']['input']>;
  token0_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1?: InputMaybe<Scalars['String']['input']>;
  token1_?: InputMaybe<Token_Filter>;
  token1_contains?: InputMaybe<Scalars['String']['input']>;
  token1_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_ends_with?: InputMaybe<Scalars['String']['input']>;
  token1_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_gt?: InputMaybe<Scalars['String']['input']>;
  token1_gte?: InputMaybe<Scalars['String']['input']>;
  token1_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token1_lt?: InputMaybe<Scalars['String']['input']>;
  token1_lte?: InputMaybe<Scalars['String']['input']>;
  token1_not?: InputMaybe<Scalars['String']['input']>;
  token1_not_contains?: InputMaybe<Scalars['String']['input']>;
  token1_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token1_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token1_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token1_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_starts_with?: InputMaybe<Scalars['String']['input']>;
  token1_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction?: InputMaybe<Scalars['String']['input']>;
  transaction_?: InputMaybe<Transaction_Filter>;
  transaction_contains?: InputMaybe<Scalars['String']['input']>;
  transaction_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction_ends_with?: InputMaybe<Scalars['String']['input']>;
  transaction_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction_gt?: InputMaybe<Scalars['String']['input']>;
  transaction_gte?: InputMaybe<Scalars['String']['input']>;
  transaction_in?: InputMaybe<Array<Scalars['String']['input']>>;
  transaction_lt?: InputMaybe<Scalars['String']['input']>;
  transaction_lte?: InputMaybe<Scalars['String']['input']>;
  transaction_not?: InputMaybe<Scalars['String']['input']>;
  transaction_not_contains?: InputMaybe<Scalars['String']['input']>;
  transaction_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  transaction_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  transaction_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  transaction_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction_starts_with?: InputMaybe<Scalars['String']['input']>;
  transaction_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  withdrawnToken0?: InputMaybe<Scalars['BigInt']['input']>;
  withdrawnToken0_gt?: InputMaybe<Scalars['BigInt']['input']>;
  withdrawnToken0_gte?: InputMaybe<Scalars['BigInt']['input']>;
  withdrawnToken0_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  withdrawnToken0_lt?: InputMaybe<Scalars['BigInt']['input']>;
  withdrawnToken0_lte?: InputMaybe<Scalars['BigInt']['input']>;
  withdrawnToken0_not?: InputMaybe<Scalars['BigInt']['input']>;
  withdrawnToken0_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  withdrawnToken1?: InputMaybe<Scalars['BigInt']['input']>;
  withdrawnToken1_gt?: InputMaybe<Scalars['BigInt']['input']>;
  withdrawnToken1_gte?: InputMaybe<Scalars['BigInt']['input']>;
  withdrawnToken1_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  withdrawnToken1_lt?: InputMaybe<Scalars['BigInt']['input']>;
  withdrawnToken1_lte?: InputMaybe<Scalars['BigInt']['input']>;
  withdrawnToken1_not?: InputMaybe<Scalars['BigInt']['input']>;
  withdrawnToken1_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum Position_OrderBy {
  CollectedFeesToken0 = 'collectedFeesToken0',
  CollectedFeesToken1 = 'collectedFeesToken1',
  DepositedToken0 = 'depositedToken0',
  DepositedToken1 = 'depositedToken1',
  Id = 'id',
  Liquidity = 'liquidity',
  Owner = 'owner',
  Pool = 'pool',
  PoolCollectedFeesToken0 = 'pool__collectedFeesToken0',
  PoolCollectedFeesToken1 = 'pool__collectedFeesToken1',
  PoolCollectedFeesUsd = 'pool__collectedFeesUSD',
  PoolCreatedAtBlockNumber = 'pool__createdAtBlockNumber',
  PoolCreatedAtTimestamp = 'pool__createdAtTimestamp',
  PoolFeeTier = 'pool__feeTier',
  PoolFeesUsd = 'pool__feesUSD',
  PoolId = 'pool__id',
  PoolLiquidity = 'pool__liquidity',
  PoolLiquidityProviderCount = 'pool__liquidityProviderCount',
  PoolSqrtPrice = 'pool__sqrtPrice',
  PoolTick = 'pool__tick',
  PoolToken0Price = 'pool__token0Price',
  PoolToken1Price = 'pool__token1Price',
  PoolTotalValueLockedEth = 'pool__totalValueLockedETH',
  PoolTotalValueLockedToken0 = 'pool__totalValueLockedToken0',
  PoolTotalValueLockedToken1 = 'pool__totalValueLockedToken1',
  PoolTotalValueLockedUsd = 'pool__totalValueLockedUSD',
  PoolTxCount = 'pool__txCount',
  PoolVolumeEth = 'pool__volumeETH',
  PoolVolumeToken0 = 'pool__volumeToken0',
  PoolVolumeToken1 = 'pool__volumeToken1',
  PoolVolumeUsd = 'pool__volumeUSD',
  TickLower = 'tickLower',
  TickLowerCollectedFeesToken0 = 'tickLower__collectedFeesToken0',
  TickLowerCollectedFeesToken1 = 'tickLower__collectedFeesToken1',
  TickLowerCollectedFeesUsd = 'tickLower__collectedFeesUSD',
  TickLowerCreatedAtBlockNumber = 'tickLower__createdAtBlockNumber',
  TickLowerCreatedAtTimestamp = 'tickLower__createdAtTimestamp',
  TickLowerFeesUsd = 'tickLower__feesUSD',
  TickLowerId = 'tickLower__id',
  TickLowerLiquidityGross = 'tickLower__liquidityGross',
  TickLowerLiquidityNet = 'tickLower__liquidityNet',
  TickLowerLiquidityProviderCount = 'tickLower__liquidityProviderCount',
  TickLowerPoolAddress = 'tickLower__poolAddress',
  TickLowerPrice0 = 'tickLower__price0',
  TickLowerPrice1 = 'tickLower__price1',
  TickLowerTickIdx = 'tickLower__tickIdx',
  TickLowerVolumeToken0 = 'tickLower__volumeToken0',
  TickLowerVolumeToken1 = 'tickLower__volumeToken1',
  TickLowerVolumeUsd = 'tickLower__volumeUSD',
  TickUpper = 'tickUpper',
  TickUpperCollectedFeesToken0 = 'tickUpper__collectedFeesToken0',
  TickUpperCollectedFeesToken1 = 'tickUpper__collectedFeesToken1',
  TickUpperCollectedFeesUsd = 'tickUpper__collectedFeesUSD',
  TickUpperCreatedAtBlockNumber = 'tickUpper__createdAtBlockNumber',
  TickUpperCreatedAtTimestamp = 'tickUpper__createdAtTimestamp',
  TickUpperFeesUsd = 'tickUpper__feesUSD',
  TickUpperId = 'tickUpper__id',
  TickUpperLiquidityGross = 'tickUpper__liquidityGross',
  TickUpperLiquidityNet = 'tickUpper__liquidityNet',
  TickUpperLiquidityProviderCount = 'tickUpper__liquidityProviderCount',
  TickUpperPoolAddress = 'tickUpper__poolAddress',
  TickUpperPrice0 = 'tickUpper__price0',
  TickUpperPrice1 = 'tickUpper__price1',
  TickUpperTickIdx = 'tickUpper__tickIdx',
  TickUpperVolumeToken0 = 'tickUpper__volumeToken0',
  TickUpperVolumeToken1 = 'tickUpper__volumeToken1',
  TickUpperVolumeUsd = 'tickUpper__volumeUSD',
  Token0 = 'token0',
  Token0Decimals = 'token0__decimals',
  Token0DerivedEth = 'token0__derivedETH',
  Token0DerivedUsd = 'token0__derivedUSD',
  Token0EligiblePools = 'token0__eligiblePools',
  Token0FeesUsd = 'token0__feesUSD',
  Token0Id = 'token0__id',
  Token0Name = 'token0__name',
  Token0PoolCount = 'token0__poolCount',
  Token0Symbol = 'token0__symbol',
  Token0TotalValueLocked = 'token0__totalValueLocked',
  Token0TotalValueLockedUsd = 'token0__totalValueLockedUSD',
  Token0TxCount = 'token0__txCount',
  Token0Volume = 'token0__volume',
  Token0VolumeUsd = 'token0__volumeUSD',
  Token1 = 'token1',
  Token1Decimals = 'token1__decimals',
  Token1DerivedEth = 'token1__derivedETH',
  Token1DerivedUsd = 'token1__derivedUSD',
  Token1EligiblePools = 'token1__eligiblePools',
  Token1FeesUsd = 'token1__feesUSD',
  Token1Id = 'token1__id',
  Token1Name = 'token1__name',
  Token1PoolCount = 'token1__poolCount',
  Token1Symbol = 'token1__symbol',
  Token1TotalValueLocked = 'token1__totalValueLocked',
  Token1TotalValueLockedUsd = 'token1__totalValueLockedUSD',
  Token1TxCount = 'token1__txCount',
  Token1Volume = 'token1__volume',
  Token1VolumeUsd = 'token1__volumeUSD',
  Transaction = 'transaction',
  TransactionBlockNumber = 'transaction__blockNumber',
  TransactionGasPrice = 'transaction__gasPrice',
  TransactionGasUsed = 'transaction__gasUsed',
  TransactionId = 'transaction__id',
  TransactionTimestamp = 'transaction__timestamp',
  WithdrawnToken0 = 'withdrawnToken0',
  WithdrawnToken1 = 'withdrawnToken1'
}

export type Query = {
  __typename?: 'Query';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  bundle?: Maybe<Bundle>;
  bundles: Array<Bundle>;
  factories: Array<Factory>;
  factory?: Maybe<Factory>;
  farm?: Maybe<Farm>;
  farms: Array<Farm>;
  harvestEvent?: Maybe<HarvestEvent>;
  harvestEvents: Array<HarvestEvent>;
  pool?: Maybe<Pool>;
  pool5MinData?: Maybe<Pool5MinData>;
  pool5MinDatas: Array<Pool5MinData>;
  poolDayData?: Maybe<PoolDayData>;
  poolDayDatas: Array<PoolDayData>;
  poolHourData?: Maybe<PoolHourData>;
  poolHourDatas: Array<PoolHourData>;
  poolTransaction?: Maybe<PoolTransaction>;
  poolTransactions: Array<PoolTransaction>;
  pools: Array<Pool>;
  position?: Maybe<Position>;
  positions: Array<Position>;
  stakeEvent?: Maybe<StakeEvent>;
  stakeEvents: Array<StakeEvent>;
  stakedPosition?: Maybe<StakedPosition>;
  stakedPositionFarm?: Maybe<StakedPositionFarm>;
  stakedPositionFarms: Array<StakedPositionFarm>;
  stakedPositions: Array<StakedPosition>;
  tick?: Maybe<Tick>;
  ticks: Array<Tick>;
  token?: Maybe<Token>;
  token5MinData?: Maybe<Token5MinData>;
  token5MinDatas: Array<Token5MinData>;
  tokenDayData?: Maybe<TokenDayData>;
  tokenDayDatas: Array<TokenDayData>;
  tokenHourData?: Maybe<TokenHourData>;
  tokenHourDatas: Array<TokenHourData>;
  tokens: Array<Token>;
  transaction?: Maybe<Transaction>;
  transactions: Array<Transaction>;
  uniDayData?: Maybe<UniDayData>;
  uniDayDatas: Array<UniDayData>;
  unstakeEvent?: Maybe<UnstakeEvent>;
  unstakeEvents: Array<UnstakeEvent>;
  walletTradingVolume?: Maybe<WalletTradingVolume>;
  walletTradingVolumes: Array<WalletTradingVolume>;
};


export type Query_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type QueryBundleArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryBundlesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Bundle_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Bundle_Filter>;
};


export type QueryFactoriesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Factory_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Factory_Filter>;
};


export type QueryFactoryArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryFarmArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryFarmsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Farm_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Farm_Filter>;
};


export type QueryHarvestEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryHarvestEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<HarvestEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<HarvestEvent_Filter>;
};


export type QueryPoolArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryPool5MinDataArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryPool5MinDatasArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Pool5MinData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Pool5MinData_Filter>;
};


export type QueryPoolDayDataArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryPoolDayDatasArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PoolDayData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PoolDayData_Filter>;
};


export type QueryPoolHourDataArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryPoolHourDatasArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PoolHourData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PoolHourData_Filter>;
};


export type QueryPoolTransactionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryPoolTransactionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PoolTransaction_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PoolTransaction_Filter>;
};


export type QueryPoolsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Pool_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Pool_Filter>;
};


export type QueryPositionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryPositionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Position_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Position_Filter>;
};


export type QueryStakeEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryStakeEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<StakeEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<StakeEvent_Filter>;
};


export type QueryStakedPositionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryStakedPositionFarmArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryStakedPositionFarmsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<StakedPositionFarm_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<StakedPositionFarm_Filter>;
};


export type QueryStakedPositionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<StakedPosition_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<StakedPosition_Filter>;
};


export type QueryTickArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTicksArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Tick_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Tick_Filter>;
};


export type QueryTokenArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryToken5MinDataArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryToken5MinDatasArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Token5MinData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Token5MinData_Filter>;
};


export type QueryTokenDayDataArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTokenDayDatasArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TokenDayData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TokenDayData_Filter>;
};


export type QueryTokenHourDataArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTokenHourDatasArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TokenHourData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TokenHourData_Filter>;
};


export type QueryTokensArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Token_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Token_Filter>;
};


export type QueryTransactionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTransactionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Transaction_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Transaction_Filter>;
};


export type QueryUniDayDataArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryUniDayDatasArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<UniDayData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<UniDayData_Filter>;
};


export type QueryUnstakeEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryUnstakeEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<UnstakeEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<UnstakeEvent_Filter>;
};


export type QueryWalletTradingVolumeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryWalletTradingVolumesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<WalletTradingVolume_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<WalletTradingVolume_Filter>;
};

export type StakeEvent = {
  __typename?: 'StakeEvent';
  blockNumber: Scalars['BigInt']['output'];
  farm: Farm;
  id: Scalars['ID']['output'];
  owner: Scalars['String']['output'];
  position: StakedPosition;
  positionFarm: StakedPositionFarm;
  timestamp: Scalars['BigInt']['output'];
  tokenId: Scalars['BigInt']['output'];
  transaction: Transaction;
};

export type StakeEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<StakeEvent_Filter>>>;
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  farm?: InputMaybe<Scalars['String']['input']>;
  farm_?: InputMaybe<Farm_Filter>;
  farm_contains?: InputMaybe<Scalars['String']['input']>;
  farm_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  farm_ends_with?: InputMaybe<Scalars['String']['input']>;
  farm_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  farm_gt?: InputMaybe<Scalars['String']['input']>;
  farm_gte?: InputMaybe<Scalars['String']['input']>;
  farm_in?: InputMaybe<Array<Scalars['String']['input']>>;
  farm_lt?: InputMaybe<Scalars['String']['input']>;
  farm_lte?: InputMaybe<Scalars['String']['input']>;
  farm_not?: InputMaybe<Scalars['String']['input']>;
  farm_not_contains?: InputMaybe<Scalars['String']['input']>;
  farm_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  farm_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  farm_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  farm_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  farm_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  farm_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  farm_starts_with?: InputMaybe<Scalars['String']['input']>;
  farm_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<StakeEvent_Filter>>>;
  owner?: InputMaybe<Scalars['String']['input']>;
  owner_contains?: InputMaybe<Scalars['String']['input']>;
  owner_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_ends_with?: InputMaybe<Scalars['String']['input']>;
  owner_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_gt?: InputMaybe<Scalars['String']['input']>;
  owner_gte?: InputMaybe<Scalars['String']['input']>;
  owner_in?: InputMaybe<Array<Scalars['String']['input']>>;
  owner_lt?: InputMaybe<Scalars['String']['input']>;
  owner_lte?: InputMaybe<Scalars['String']['input']>;
  owner_not?: InputMaybe<Scalars['String']['input']>;
  owner_not_contains?: InputMaybe<Scalars['String']['input']>;
  owner_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  owner_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  owner_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  owner_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_starts_with?: InputMaybe<Scalars['String']['input']>;
  owner_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['String']['input']>;
  positionFarm?: InputMaybe<Scalars['String']['input']>;
  positionFarm_?: InputMaybe<StakedPositionFarm_Filter>;
  positionFarm_contains?: InputMaybe<Scalars['String']['input']>;
  positionFarm_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  positionFarm_ends_with?: InputMaybe<Scalars['String']['input']>;
  positionFarm_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  positionFarm_gt?: InputMaybe<Scalars['String']['input']>;
  positionFarm_gte?: InputMaybe<Scalars['String']['input']>;
  positionFarm_in?: InputMaybe<Array<Scalars['String']['input']>>;
  positionFarm_lt?: InputMaybe<Scalars['String']['input']>;
  positionFarm_lte?: InputMaybe<Scalars['String']['input']>;
  positionFarm_not?: InputMaybe<Scalars['String']['input']>;
  positionFarm_not_contains?: InputMaybe<Scalars['String']['input']>;
  positionFarm_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  positionFarm_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  positionFarm_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  positionFarm_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  positionFarm_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  positionFarm_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  positionFarm_starts_with?: InputMaybe<Scalars['String']['input']>;
  positionFarm_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  position_?: InputMaybe<StakedPosition_Filter>;
  position_contains?: InputMaybe<Scalars['String']['input']>;
  position_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  position_ends_with?: InputMaybe<Scalars['String']['input']>;
  position_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  position_gt?: InputMaybe<Scalars['String']['input']>;
  position_gte?: InputMaybe<Scalars['String']['input']>;
  position_in?: InputMaybe<Array<Scalars['String']['input']>>;
  position_lt?: InputMaybe<Scalars['String']['input']>;
  position_lte?: InputMaybe<Scalars['String']['input']>;
  position_not?: InputMaybe<Scalars['String']['input']>;
  position_not_contains?: InputMaybe<Scalars['String']['input']>;
  position_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  position_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  position_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  position_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  position_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  position_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  position_starts_with?: InputMaybe<Scalars['String']['input']>;
  position_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tokenId?: InputMaybe<Scalars['BigInt']['input']>;
  tokenId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  tokenId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  tokenId_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tokenId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  tokenId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  tokenId_not?: InputMaybe<Scalars['BigInt']['input']>;
  tokenId_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  transaction?: InputMaybe<Scalars['String']['input']>;
  transaction_?: InputMaybe<Transaction_Filter>;
  transaction_contains?: InputMaybe<Scalars['String']['input']>;
  transaction_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction_ends_with?: InputMaybe<Scalars['String']['input']>;
  transaction_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction_gt?: InputMaybe<Scalars['String']['input']>;
  transaction_gte?: InputMaybe<Scalars['String']['input']>;
  transaction_in?: InputMaybe<Array<Scalars['String']['input']>>;
  transaction_lt?: InputMaybe<Scalars['String']['input']>;
  transaction_lte?: InputMaybe<Scalars['String']['input']>;
  transaction_not?: InputMaybe<Scalars['String']['input']>;
  transaction_not_contains?: InputMaybe<Scalars['String']['input']>;
  transaction_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  transaction_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  transaction_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  transaction_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction_starts_with?: InputMaybe<Scalars['String']['input']>;
  transaction_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum StakeEvent_OrderBy {
  BlockNumber = 'blockNumber',
  Farm = 'farm',
  FarmActive = 'farm__active',
  FarmId = 'farm__id',
  FarmRewardPerBlock = 'farm__rewardPerBlock',
  FarmTotalBlockShare = 'farm__totalBlockShare',
  FarmTotalClaimable = 'farm__totalClaimable',
  FarmTotalClaimed = 'farm__totalClaimed',
  Id = 'id',
  Owner = 'owner',
  Position = 'position',
  PositionFarm = 'positionFarm',
  PositionFarmId = 'positionFarm__id',
  PositionFarmLastUpdateBlock = 'positionFarm__lastUpdateBlock',
  PositionFarmLastUpdateTimestamp = 'positionFarm__lastUpdateTimestamp',
  PositionFarmTotalClaimable = 'positionFarm__totalClaimable',
  PositionBlockShare = 'position__blockShare',
  PositionId = 'position__id',
  PositionIsActive = 'position__isActive',
  PositionIsStaked = 'position__isStaked',
  PositionLastUpdateBlock = 'position__lastUpdateBlock',
  PositionLastUpdateTimestamp = 'position__lastUpdateTimestamp',
  PositionOwner = 'position__owner',
  PositionTokenId = 'position__tokenId',
  Timestamp = 'timestamp',
  TokenId = 'tokenId',
  Transaction = 'transaction',
  TransactionBlockNumber = 'transaction__blockNumber',
  TransactionGasPrice = 'transaction__gasPrice',
  TransactionGasUsed = 'transaction__gasUsed',
  TransactionId = 'transaction__id',
  TransactionTimestamp = 'transaction__timestamp'
}

export type StakedPosition = {
  __typename?: 'StakedPosition';
  blockShare: Scalars['BigInt']['output'];
  harvestEvents: Array<HarvestEvent>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isStaked: Scalars['Boolean']['output'];
  lastUpdateBlock: Scalars['BigInt']['output'];
  lastUpdateTimestamp: Scalars['BigInt']['output'];
  owner: Scalars['String']['output'];
  pool: Pool;
  position: Position;
  stakeEvents: Array<StakeEvent>;
  stakedPositionFarms: Array<StakedPositionFarm>;
  tokenId: Scalars['BigInt']['output'];
  unstakeEvents: Array<UnstakeEvent>;
};


export type StakedPositionHarvestEventsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<HarvestEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<HarvestEvent_Filter>;
};


export type StakedPositionStakeEventsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<StakeEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<StakeEvent_Filter>;
};


export type StakedPositionStakedPositionFarmsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<StakedPositionFarm_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<StakedPositionFarm_Filter>;
};


export type StakedPositionUnstakeEventsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<UnstakeEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<UnstakeEvent_Filter>;
};

export type StakedPositionFarm = {
  __typename?: 'StakedPositionFarm';
  farm: Farm;
  id: Scalars['ID']['output'];
  lastUpdateBlock: Scalars['BigInt']['output'];
  lastUpdateTimestamp: Scalars['BigInt']['output'];
  position: StakedPosition;
  totalClaimable: Scalars['BigInt']['output'];
};

export type StakedPositionFarm_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<StakedPositionFarm_Filter>>>;
  farm?: InputMaybe<Scalars['String']['input']>;
  farm_?: InputMaybe<Farm_Filter>;
  farm_contains?: InputMaybe<Scalars['String']['input']>;
  farm_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  farm_ends_with?: InputMaybe<Scalars['String']['input']>;
  farm_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  farm_gt?: InputMaybe<Scalars['String']['input']>;
  farm_gte?: InputMaybe<Scalars['String']['input']>;
  farm_in?: InputMaybe<Array<Scalars['String']['input']>>;
  farm_lt?: InputMaybe<Scalars['String']['input']>;
  farm_lte?: InputMaybe<Scalars['String']['input']>;
  farm_not?: InputMaybe<Scalars['String']['input']>;
  farm_not_contains?: InputMaybe<Scalars['String']['input']>;
  farm_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  farm_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  farm_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  farm_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  farm_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  farm_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  farm_starts_with?: InputMaybe<Scalars['String']['input']>;
  farm_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  lastUpdateBlock?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlock_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlock_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlock_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastUpdateBlock_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlock_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlock_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlock_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<StakedPositionFarm_Filter>>>;
  position?: InputMaybe<Scalars['String']['input']>;
  position_?: InputMaybe<StakedPosition_Filter>;
  position_contains?: InputMaybe<Scalars['String']['input']>;
  position_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  position_ends_with?: InputMaybe<Scalars['String']['input']>;
  position_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  position_gt?: InputMaybe<Scalars['String']['input']>;
  position_gte?: InputMaybe<Scalars['String']['input']>;
  position_in?: InputMaybe<Array<Scalars['String']['input']>>;
  position_lt?: InputMaybe<Scalars['String']['input']>;
  position_lte?: InputMaybe<Scalars['String']['input']>;
  position_not?: InputMaybe<Scalars['String']['input']>;
  position_not_contains?: InputMaybe<Scalars['String']['input']>;
  position_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  position_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  position_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  position_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  position_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  position_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  position_starts_with?: InputMaybe<Scalars['String']['input']>;
  position_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  totalClaimable?: InputMaybe<Scalars['BigInt']['input']>;
  totalClaimable_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalClaimable_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalClaimable_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalClaimable_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalClaimable_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalClaimable_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalClaimable_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum StakedPositionFarm_OrderBy {
  Farm = 'farm',
  FarmActive = 'farm__active',
  FarmId = 'farm__id',
  FarmRewardPerBlock = 'farm__rewardPerBlock',
  FarmTotalBlockShare = 'farm__totalBlockShare',
  FarmTotalClaimable = 'farm__totalClaimable',
  FarmTotalClaimed = 'farm__totalClaimed',
  Id = 'id',
  LastUpdateBlock = 'lastUpdateBlock',
  LastUpdateTimestamp = 'lastUpdateTimestamp',
  Position = 'position',
  PositionBlockShare = 'position__blockShare',
  PositionId = 'position__id',
  PositionIsActive = 'position__isActive',
  PositionIsStaked = 'position__isStaked',
  PositionLastUpdateBlock = 'position__lastUpdateBlock',
  PositionLastUpdateTimestamp = 'position__lastUpdateTimestamp',
  PositionOwner = 'position__owner',
  PositionTokenId = 'position__tokenId',
  TotalClaimable = 'totalClaimable'
}

export type StakedPosition_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<StakedPosition_Filter>>>;
  blockShare?: InputMaybe<Scalars['BigInt']['input']>;
  blockShare_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockShare_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockShare_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockShare_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockShare_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockShare_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockShare_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  harvestEvents_?: InputMaybe<HarvestEvent_Filter>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isActive_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isActive_not?: InputMaybe<Scalars['Boolean']['input']>;
  isActive_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isStaked?: InputMaybe<Scalars['Boolean']['input']>;
  isStaked_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isStaked_not?: InputMaybe<Scalars['Boolean']['input']>;
  isStaked_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  lastUpdateBlock?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlock_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlock_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlock_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastUpdateBlock_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlock_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlock_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlock_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<StakedPosition_Filter>>>;
  owner?: InputMaybe<Scalars['String']['input']>;
  owner_contains?: InputMaybe<Scalars['String']['input']>;
  owner_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_ends_with?: InputMaybe<Scalars['String']['input']>;
  owner_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_gt?: InputMaybe<Scalars['String']['input']>;
  owner_gte?: InputMaybe<Scalars['String']['input']>;
  owner_in?: InputMaybe<Array<Scalars['String']['input']>>;
  owner_lt?: InputMaybe<Scalars['String']['input']>;
  owner_lte?: InputMaybe<Scalars['String']['input']>;
  owner_not?: InputMaybe<Scalars['String']['input']>;
  owner_not_contains?: InputMaybe<Scalars['String']['input']>;
  owner_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  owner_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  owner_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  owner_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_starts_with?: InputMaybe<Scalars['String']['input']>;
  owner_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool?: InputMaybe<Scalars['String']['input']>;
  pool_?: InputMaybe<Pool_Filter>;
  pool_contains?: InputMaybe<Scalars['String']['input']>;
  pool_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_gt?: InputMaybe<Scalars['String']['input']>;
  pool_gte?: InputMaybe<Scalars['String']['input']>;
  pool_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_lt?: InputMaybe<Scalars['String']['input']>;
  pool_lte?: InputMaybe<Scalars['String']['input']>;
  pool_not?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['String']['input']>;
  position_?: InputMaybe<Position_Filter>;
  position_contains?: InputMaybe<Scalars['String']['input']>;
  position_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  position_ends_with?: InputMaybe<Scalars['String']['input']>;
  position_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  position_gt?: InputMaybe<Scalars['String']['input']>;
  position_gte?: InputMaybe<Scalars['String']['input']>;
  position_in?: InputMaybe<Array<Scalars['String']['input']>>;
  position_lt?: InputMaybe<Scalars['String']['input']>;
  position_lte?: InputMaybe<Scalars['String']['input']>;
  position_not?: InputMaybe<Scalars['String']['input']>;
  position_not_contains?: InputMaybe<Scalars['String']['input']>;
  position_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  position_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  position_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  position_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  position_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  position_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  position_starts_with?: InputMaybe<Scalars['String']['input']>;
  position_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  stakeEvents_?: InputMaybe<StakeEvent_Filter>;
  stakedPositionFarms_?: InputMaybe<StakedPositionFarm_Filter>;
  tokenId?: InputMaybe<Scalars['BigInt']['input']>;
  tokenId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  tokenId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  tokenId_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tokenId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  tokenId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  tokenId_not?: InputMaybe<Scalars['BigInt']['input']>;
  tokenId_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  unstakeEvents_?: InputMaybe<UnstakeEvent_Filter>;
};

export enum StakedPosition_OrderBy {
  BlockShare = 'blockShare',
  HarvestEvents = 'harvestEvents',
  Id = 'id',
  IsActive = 'isActive',
  IsStaked = 'isStaked',
  LastUpdateBlock = 'lastUpdateBlock',
  LastUpdateTimestamp = 'lastUpdateTimestamp',
  Owner = 'owner',
  Pool = 'pool',
  PoolCollectedFeesToken0 = 'pool__collectedFeesToken0',
  PoolCollectedFeesToken1 = 'pool__collectedFeesToken1',
  PoolCollectedFeesUsd = 'pool__collectedFeesUSD',
  PoolCreatedAtBlockNumber = 'pool__createdAtBlockNumber',
  PoolCreatedAtTimestamp = 'pool__createdAtTimestamp',
  PoolFeeTier = 'pool__feeTier',
  PoolFeesUsd = 'pool__feesUSD',
  PoolId = 'pool__id',
  PoolLiquidity = 'pool__liquidity',
  PoolLiquidityProviderCount = 'pool__liquidityProviderCount',
  PoolSqrtPrice = 'pool__sqrtPrice',
  PoolTick = 'pool__tick',
  PoolToken0Price = 'pool__token0Price',
  PoolToken1Price = 'pool__token1Price',
  PoolTotalValueLockedEth = 'pool__totalValueLockedETH',
  PoolTotalValueLockedToken0 = 'pool__totalValueLockedToken0',
  PoolTotalValueLockedToken1 = 'pool__totalValueLockedToken1',
  PoolTotalValueLockedUsd = 'pool__totalValueLockedUSD',
  PoolTxCount = 'pool__txCount',
  PoolVolumeEth = 'pool__volumeETH',
  PoolVolumeToken0 = 'pool__volumeToken0',
  PoolVolumeToken1 = 'pool__volumeToken1',
  PoolVolumeUsd = 'pool__volumeUSD',
  Position = 'position',
  PositionCollectedFeesToken0 = 'position__collectedFeesToken0',
  PositionCollectedFeesToken1 = 'position__collectedFeesToken1',
  PositionDepositedToken0 = 'position__depositedToken0',
  PositionDepositedToken1 = 'position__depositedToken1',
  PositionId = 'position__id',
  PositionLiquidity = 'position__liquidity',
  PositionOwner = 'position__owner',
  PositionWithdrawnToken0 = 'position__withdrawnToken0',
  PositionWithdrawnToken1 = 'position__withdrawnToken1',
  StakeEvents = 'stakeEvents',
  StakedPositionFarms = 'stakedPositionFarms',
  TokenId = 'tokenId',
  UnstakeEvents = 'unstakeEvents'
}

export type Tick = {
  __typename?: 'Tick';
  collectedFeesToken0: Scalars['BigInt']['output'];
  collectedFeesToken1: Scalars['BigInt']['output'];
  collectedFeesUSD: Scalars['BigDecimal']['output'];
  createdAtBlockNumber: Scalars['BigInt']['output'];
  createdAtTimestamp: Scalars['BigInt']['output'];
  feesUSD: Scalars['BigDecimal']['output'];
  id: Scalars['ID']['output'];
  liquidityGross: Scalars['BigInt']['output'];
  liquidityNet: Scalars['BigInt']['output'];
  liquidityProviderCount: Scalars['BigInt']['output'];
  pool: Pool;
  poolAddress?: Maybe<Scalars['String']['output']>;
  price0: Scalars['BigDecimal']['output'];
  price1: Scalars['BigDecimal']['output'];
  tickIdx: Scalars['BigInt']['output'];
  volumeToken0: Scalars['BigInt']['output'];
  volumeToken1: Scalars['BigInt']['output'];
  volumeUSD: Scalars['BigDecimal']['output'];
};

export type Tick_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Tick_Filter>>>;
  collectedFeesToken0?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken0_gt?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken0_gte?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken0_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  collectedFeesToken0_lt?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken0_lte?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken0_not?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken0_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  collectedFeesToken1?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken1_gt?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken1_gte?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken1_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  collectedFeesToken1_lt?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken1_lte?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken1_not?: InputMaybe<Scalars['BigInt']['input']>;
  collectedFeesToken1_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  collectedFeesUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  collectedFeesUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  createdAtBlockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtBlockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtBlockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAtBlockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtBlockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtBlockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAtTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAtTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feesUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  liquidityGross?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityGross_gt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityGross_gte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityGross_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  liquidityGross_lt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityGross_lte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityGross_not?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityGross_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  liquidityNet?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityNet_gt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityNet_gte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityNet_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  liquidityNet_lt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityNet_lte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityNet_not?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityNet_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  liquidityProviderCount?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityProviderCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityProviderCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityProviderCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  liquidityProviderCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityProviderCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityProviderCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityProviderCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Tick_Filter>>>;
  pool?: InputMaybe<Scalars['String']['input']>;
  poolAddress?: InputMaybe<Scalars['String']['input']>;
  poolAddress_contains?: InputMaybe<Scalars['String']['input']>;
  poolAddress_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  poolAddress_ends_with?: InputMaybe<Scalars['String']['input']>;
  poolAddress_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  poolAddress_gt?: InputMaybe<Scalars['String']['input']>;
  poolAddress_gte?: InputMaybe<Scalars['String']['input']>;
  poolAddress_in?: InputMaybe<Array<Scalars['String']['input']>>;
  poolAddress_lt?: InputMaybe<Scalars['String']['input']>;
  poolAddress_lte?: InputMaybe<Scalars['String']['input']>;
  poolAddress_not?: InputMaybe<Scalars['String']['input']>;
  poolAddress_not_contains?: InputMaybe<Scalars['String']['input']>;
  poolAddress_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  poolAddress_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  poolAddress_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  poolAddress_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  poolAddress_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  poolAddress_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  poolAddress_starts_with?: InputMaybe<Scalars['String']['input']>;
  poolAddress_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_?: InputMaybe<Pool_Filter>;
  pool_contains?: InputMaybe<Scalars['String']['input']>;
  pool_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_gt?: InputMaybe<Scalars['String']['input']>;
  pool_gte?: InputMaybe<Scalars['String']['input']>;
  pool_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_lt?: InputMaybe<Scalars['String']['input']>;
  pool_lte?: InputMaybe<Scalars['String']['input']>;
  pool_not?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  price0?: InputMaybe<Scalars['BigDecimal']['input']>;
  price0_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  price0_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  price0_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  price0_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  price0_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  price0_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  price0_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  price1?: InputMaybe<Scalars['BigDecimal']['input']>;
  price1_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  price1_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  price1_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  price1_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  price1_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  price1_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  price1_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  tickIdx?: InputMaybe<Scalars['BigInt']['input']>;
  tickIdx_gt?: InputMaybe<Scalars['BigInt']['input']>;
  tickIdx_gte?: InputMaybe<Scalars['BigInt']['input']>;
  tickIdx_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tickIdx_lt?: InputMaybe<Scalars['BigInt']['input']>;
  tickIdx_lte?: InputMaybe<Scalars['BigInt']['input']>;
  tickIdx_not?: InputMaybe<Scalars['BigInt']['input']>;
  tickIdx_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeToken0?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeToken0_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_not?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken0_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeToken1?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeToken1_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_not?: InputMaybe<Scalars['BigInt']['input']>;
  volumeToken1_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
};

export enum Tick_OrderBy {
  CollectedFeesToken0 = 'collectedFeesToken0',
  CollectedFeesToken1 = 'collectedFeesToken1',
  CollectedFeesUsd = 'collectedFeesUSD',
  CreatedAtBlockNumber = 'createdAtBlockNumber',
  CreatedAtTimestamp = 'createdAtTimestamp',
  FeesUsd = 'feesUSD',
  Id = 'id',
  LiquidityGross = 'liquidityGross',
  LiquidityNet = 'liquidityNet',
  LiquidityProviderCount = 'liquidityProviderCount',
  Pool = 'pool',
  PoolAddress = 'poolAddress',
  PoolCollectedFeesToken0 = 'pool__collectedFeesToken0',
  PoolCollectedFeesToken1 = 'pool__collectedFeesToken1',
  PoolCollectedFeesUsd = 'pool__collectedFeesUSD',
  PoolCreatedAtBlockNumber = 'pool__createdAtBlockNumber',
  PoolCreatedAtTimestamp = 'pool__createdAtTimestamp',
  PoolFeeTier = 'pool__feeTier',
  PoolFeesUsd = 'pool__feesUSD',
  PoolId = 'pool__id',
  PoolLiquidity = 'pool__liquidity',
  PoolLiquidityProviderCount = 'pool__liquidityProviderCount',
  PoolSqrtPrice = 'pool__sqrtPrice',
  PoolTick = 'pool__tick',
  PoolToken0Price = 'pool__token0Price',
  PoolToken1Price = 'pool__token1Price',
  PoolTotalValueLockedEth = 'pool__totalValueLockedETH',
  PoolTotalValueLockedToken0 = 'pool__totalValueLockedToken0',
  PoolTotalValueLockedToken1 = 'pool__totalValueLockedToken1',
  PoolTotalValueLockedUsd = 'pool__totalValueLockedUSD',
  PoolTxCount = 'pool__txCount',
  PoolVolumeEth = 'pool__volumeETH',
  PoolVolumeToken0 = 'pool__volumeToken0',
  PoolVolumeToken1 = 'pool__volumeToken1',
  PoolVolumeUsd = 'pool__volumeUSD',
  Price0 = 'price0',
  Price1 = 'price1',
  TickIdx = 'tickIdx',
  VolumeToken0 = 'volumeToken0',
  VolumeToken1 = 'volumeToken1',
  VolumeUsd = 'volumeUSD'
}

export type Token = {
  __typename?: 'Token';
  decimals: Scalars['BigInt']['output'];
  derivedETH: Scalars['BigDecimal']['output'];
  derivedUSD: Scalars['BigDecimal']['output'];
  eligiblePools: Scalars['String']['output'];
  feesUSD: Scalars['BigDecimal']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  poolCount: Scalars['BigInt']['output'];
  symbol: Scalars['String']['output'];
  token5MinData: Array<Token5MinData>;
  tokenDayData: Array<TokenDayData>;
  tokenHourData: Array<TokenHourData>;
  totalValueLocked: Scalars['BigInt']['output'];
  totalValueLockedUSD: Scalars['BigDecimal']['output'];
  txCount: Scalars['BigInt']['output'];
  volume: Scalars['BigInt']['output'];
  volumeUSD: Scalars['BigDecimal']['output'];
};


export type TokenToken5MinDataArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Token5MinData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Token5MinData_Filter>;
};


export type TokenTokenDayDataArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TokenDayData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<TokenDayData_Filter>;
};


export type TokenTokenHourDataArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TokenHourData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<TokenHourData_Filter>;
};

export type Token5MinData = {
  __typename?: 'Token5MinData';
  close: Scalars['BigDecimal']['output'];
  feesUSD: Scalars['BigDecimal']['output'];
  high: Scalars['BigDecimal']['output'];
  id: Scalars['ID']['output'];
  low: Scalars['BigDecimal']['output'];
  open: Scalars['BigDecimal']['output'];
  priceUSD: Scalars['BigDecimal']['output'];
  timestamp: Scalars['Int']['output'];
  token: Token;
  totalValueLocked: Scalars['BigInt']['output'];
  totalValueLockedUSD: Scalars['BigDecimal']['output'];
  volume: Scalars['BigInt']['output'];
  volumeUSD: Scalars['BigDecimal']['output'];
};

export type Token5MinData_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Token5MinData_Filter>>>;
  close?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  close_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  high?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  high_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  low?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  low_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  open?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  open_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Token5MinData_Filter>>>;
  priceUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  priceUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  token?: InputMaybe<Scalars['String']['input']>;
  token_?: InputMaybe<Token_Filter>;
  token_contains?: InputMaybe<Scalars['String']['input']>;
  token_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token_ends_with?: InputMaybe<Scalars['String']['input']>;
  token_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token_gt?: InputMaybe<Scalars['String']['input']>;
  token_gte?: InputMaybe<Scalars['String']['input']>;
  token_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token_lt?: InputMaybe<Scalars['String']['input']>;
  token_lte?: InputMaybe<Scalars['String']['input']>;
  token_not?: InputMaybe<Scalars['String']['input']>;
  token_not_contains?: InputMaybe<Scalars['String']['input']>;
  token_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token_starts_with?: InputMaybe<Scalars['String']['input']>;
  token_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  totalValueLocked?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLockedUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLocked_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLocked_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLocked_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalValueLocked_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLocked_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLocked_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLocked_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volume?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volume_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volume_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volume_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volume_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volume_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volume_not?: InputMaybe<Scalars['BigInt']['input']>;
  volume_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum Token5MinData_OrderBy {
  Close = 'close',
  FeesUsd = 'feesUSD',
  High = 'high',
  Id = 'id',
  Low = 'low',
  Open = 'open',
  PriceUsd = 'priceUSD',
  Timestamp = 'timestamp',
  Token = 'token',
  TokenDecimals = 'token__decimals',
  TokenDerivedEth = 'token__derivedETH',
  TokenDerivedUsd = 'token__derivedUSD',
  TokenEligiblePools = 'token__eligiblePools',
  TokenFeesUsd = 'token__feesUSD',
  TokenId = 'token__id',
  TokenName = 'token__name',
  TokenPoolCount = 'token__poolCount',
  TokenSymbol = 'token__symbol',
  TokenTotalValueLocked = 'token__totalValueLocked',
  TokenTotalValueLockedUsd = 'token__totalValueLockedUSD',
  TokenTxCount = 'token__txCount',
  TokenVolume = 'token__volume',
  TokenVolumeUsd = 'token__volumeUSD',
  TotalValueLocked = 'totalValueLocked',
  TotalValueLockedUsd = 'totalValueLockedUSD',
  Volume = 'volume',
  VolumeUsd = 'volumeUSD'
}

export type TokenDayData = {
  __typename?: 'TokenDayData';
  close: Scalars['BigDecimal']['output'];
  feesUSD: Scalars['BigDecimal']['output'];
  high: Scalars['BigDecimal']['output'];
  id: Scalars['ID']['output'];
  low: Scalars['BigDecimal']['output'];
  open: Scalars['BigDecimal']['output'];
  priceUSD: Scalars['BigDecimal']['output'];
  timestamp: Scalars['Int']['output'];
  token: Token;
  totalValueLocked: Scalars['BigInt']['output'];
  totalValueLockedUSD: Scalars['BigDecimal']['output'];
  volume: Scalars['BigInt']['output'];
  volumeUSD: Scalars['BigDecimal']['output'];
};

export type TokenDayData_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<TokenDayData_Filter>>>;
  close?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  close_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  high?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  high_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  low?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  low_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  open?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  open_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  or?: InputMaybe<Array<InputMaybe<TokenDayData_Filter>>>;
  priceUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  priceUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  token?: InputMaybe<Scalars['String']['input']>;
  token_?: InputMaybe<Token_Filter>;
  token_contains?: InputMaybe<Scalars['String']['input']>;
  token_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token_ends_with?: InputMaybe<Scalars['String']['input']>;
  token_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token_gt?: InputMaybe<Scalars['String']['input']>;
  token_gte?: InputMaybe<Scalars['String']['input']>;
  token_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token_lt?: InputMaybe<Scalars['String']['input']>;
  token_lte?: InputMaybe<Scalars['String']['input']>;
  token_not?: InputMaybe<Scalars['String']['input']>;
  token_not_contains?: InputMaybe<Scalars['String']['input']>;
  token_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token_starts_with?: InputMaybe<Scalars['String']['input']>;
  token_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  totalValueLocked?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLockedUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLocked_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLocked_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLocked_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalValueLocked_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLocked_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLocked_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLocked_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volume?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volume_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volume_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volume_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volume_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volume_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volume_not?: InputMaybe<Scalars['BigInt']['input']>;
  volume_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum TokenDayData_OrderBy {
  Close = 'close',
  FeesUsd = 'feesUSD',
  High = 'high',
  Id = 'id',
  Low = 'low',
  Open = 'open',
  PriceUsd = 'priceUSD',
  Timestamp = 'timestamp',
  Token = 'token',
  TokenDecimals = 'token__decimals',
  TokenDerivedEth = 'token__derivedETH',
  TokenDerivedUsd = 'token__derivedUSD',
  TokenEligiblePools = 'token__eligiblePools',
  TokenFeesUsd = 'token__feesUSD',
  TokenId = 'token__id',
  TokenName = 'token__name',
  TokenPoolCount = 'token__poolCount',
  TokenSymbol = 'token__symbol',
  TokenTotalValueLocked = 'token__totalValueLocked',
  TokenTotalValueLockedUsd = 'token__totalValueLockedUSD',
  TokenTxCount = 'token__txCount',
  TokenVolume = 'token__volume',
  TokenVolumeUsd = 'token__volumeUSD',
  TotalValueLocked = 'totalValueLocked',
  TotalValueLockedUsd = 'totalValueLockedUSD',
  Volume = 'volume',
  VolumeUsd = 'volumeUSD'
}

export type TokenHourData = {
  __typename?: 'TokenHourData';
  close: Scalars['BigDecimal']['output'];
  feesUSD: Scalars['BigDecimal']['output'];
  high: Scalars['BigDecimal']['output'];
  id: Scalars['ID']['output'];
  low: Scalars['BigDecimal']['output'];
  open: Scalars['BigDecimal']['output'];
  priceUSD: Scalars['BigDecimal']['output'];
  timestamp: Scalars['Int']['output'];
  token: Token;
  totalValueLocked: Scalars['BigInt']['output'];
  totalValueLockedUSD: Scalars['BigDecimal']['output'];
  volume: Scalars['BigInt']['output'];
  volumeUSD: Scalars['BigDecimal']['output'];
};

export type TokenHourData_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<TokenHourData_Filter>>>;
  close?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  close_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  close_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  high?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  high_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  high_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  low?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  low_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  low_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  open?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  open_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  open_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  or?: InputMaybe<Array<InputMaybe<TokenHourData_Filter>>>;
  priceUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  priceUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  token?: InputMaybe<Scalars['String']['input']>;
  token_?: InputMaybe<Token_Filter>;
  token_contains?: InputMaybe<Scalars['String']['input']>;
  token_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token_ends_with?: InputMaybe<Scalars['String']['input']>;
  token_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token_gt?: InputMaybe<Scalars['String']['input']>;
  token_gte?: InputMaybe<Scalars['String']['input']>;
  token_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token_lt?: InputMaybe<Scalars['String']['input']>;
  token_lte?: InputMaybe<Scalars['String']['input']>;
  token_not?: InputMaybe<Scalars['String']['input']>;
  token_not_contains?: InputMaybe<Scalars['String']['input']>;
  token_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token_starts_with?: InputMaybe<Scalars['String']['input']>;
  token_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  totalValueLocked?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLockedUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLocked_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLocked_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLocked_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalValueLocked_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLocked_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLocked_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLocked_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volume?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volume_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volume_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volume_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volume_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volume_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volume_not?: InputMaybe<Scalars['BigInt']['input']>;
  volume_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum TokenHourData_OrderBy {
  Close = 'close',
  FeesUsd = 'feesUSD',
  High = 'high',
  Id = 'id',
  Low = 'low',
  Open = 'open',
  PriceUsd = 'priceUSD',
  Timestamp = 'timestamp',
  Token = 'token',
  TokenDecimals = 'token__decimals',
  TokenDerivedEth = 'token__derivedETH',
  TokenDerivedUsd = 'token__derivedUSD',
  TokenEligiblePools = 'token__eligiblePools',
  TokenFeesUsd = 'token__feesUSD',
  TokenId = 'token__id',
  TokenName = 'token__name',
  TokenPoolCount = 'token__poolCount',
  TokenSymbol = 'token__symbol',
  TokenTotalValueLocked = 'token__totalValueLocked',
  TokenTotalValueLockedUsd = 'token__totalValueLockedUSD',
  TokenTxCount = 'token__txCount',
  TokenVolume = 'token__volume',
  TokenVolumeUsd = 'token__volumeUSD',
  TotalValueLocked = 'totalValueLocked',
  TotalValueLockedUsd = 'totalValueLockedUSD',
  Volume = 'volume',
  VolumeUsd = 'volumeUSD'
}

export type Token_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Token_Filter>>>;
  decimals?: InputMaybe<Scalars['BigInt']['input']>;
  decimals_gt?: InputMaybe<Scalars['BigInt']['input']>;
  decimals_gte?: InputMaybe<Scalars['BigInt']['input']>;
  decimals_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  decimals_lt?: InputMaybe<Scalars['BigInt']['input']>;
  decimals_lte?: InputMaybe<Scalars['BigInt']['input']>;
  decimals_not?: InputMaybe<Scalars['BigInt']['input']>;
  decimals_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  derivedETH?: InputMaybe<Scalars['BigDecimal']['input']>;
  derivedETH_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  derivedETH_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  derivedETH_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  derivedETH_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  derivedETH_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  derivedETH_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  derivedETH_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  derivedUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  derivedUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  derivedUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  derivedUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  derivedUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  derivedUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  derivedUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  derivedUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  eligiblePools?: InputMaybe<Scalars['String']['input']>;
  eligiblePools_contains?: InputMaybe<Scalars['String']['input']>;
  eligiblePools_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  eligiblePools_ends_with?: InputMaybe<Scalars['String']['input']>;
  eligiblePools_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  eligiblePools_gt?: InputMaybe<Scalars['String']['input']>;
  eligiblePools_gte?: InputMaybe<Scalars['String']['input']>;
  eligiblePools_in?: InputMaybe<Array<Scalars['String']['input']>>;
  eligiblePools_lt?: InputMaybe<Scalars['String']['input']>;
  eligiblePools_lte?: InputMaybe<Scalars['String']['input']>;
  eligiblePools_not?: InputMaybe<Scalars['String']['input']>;
  eligiblePools_not_contains?: InputMaybe<Scalars['String']['input']>;
  eligiblePools_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  eligiblePools_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  eligiblePools_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  eligiblePools_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  eligiblePools_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  eligiblePools_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  eligiblePools_starts_with?: InputMaybe<Scalars['String']['input']>;
  eligiblePools_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  feesUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_contains?: InputMaybe<Scalars['String']['input']>;
  name_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_ends_with?: InputMaybe<Scalars['String']['input']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_gt?: InputMaybe<Scalars['String']['input']>;
  name_gte?: InputMaybe<Scalars['String']['input']>;
  name_in?: InputMaybe<Array<Scalars['String']['input']>>;
  name_lt?: InputMaybe<Scalars['String']['input']>;
  name_lte?: InputMaybe<Scalars['String']['input']>;
  name_not?: InputMaybe<Scalars['String']['input']>;
  name_not_contains?: InputMaybe<Scalars['String']['input']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  name_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_starts_with?: InputMaybe<Scalars['String']['input']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<InputMaybe<Token_Filter>>>;
  poolCount?: InputMaybe<Scalars['BigInt']['input']>;
  poolCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  poolCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  poolCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  poolCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  poolCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  poolCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  poolCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  symbol?: InputMaybe<Scalars['String']['input']>;
  symbol_contains?: InputMaybe<Scalars['String']['input']>;
  symbol_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_ends_with?: InputMaybe<Scalars['String']['input']>;
  symbol_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_gt?: InputMaybe<Scalars['String']['input']>;
  symbol_gte?: InputMaybe<Scalars['String']['input']>;
  symbol_in?: InputMaybe<Array<Scalars['String']['input']>>;
  symbol_lt?: InputMaybe<Scalars['String']['input']>;
  symbol_lte?: InputMaybe<Scalars['String']['input']>;
  symbol_not?: InputMaybe<Scalars['String']['input']>;
  symbol_not_contains?: InputMaybe<Scalars['String']['input']>;
  symbol_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  symbol_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  symbol_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  symbol_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_starts_with?: InputMaybe<Scalars['String']['input']>;
  symbol_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token5MinData_?: InputMaybe<Token5MinData_Filter>;
  tokenDayData_?: InputMaybe<TokenDayData_Filter>;
  tokenHourData_?: InputMaybe<TokenHourData_Filter>;
  totalValueLocked?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLockedUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLocked_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLocked_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLocked_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalValueLocked_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLocked_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLocked_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalValueLocked_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  txCount?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  txCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volume?: InputMaybe<Scalars['BigInt']['input']>;
  volumeUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volume_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volume_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volume_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volume_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volume_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volume_not?: InputMaybe<Scalars['BigInt']['input']>;
  volume_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum Token_OrderBy {
  Decimals = 'decimals',
  DerivedEth = 'derivedETH',
  DerivedUsd = 'derivedUSD',
  EligiblePools = 'eligiblePools',
  FeesUsd = 'feesUSD',
  Id = 'id',
  Name = 'name',
  PoolCount = 'poolCount',
  Symbol = 'symbol',
  Token5MinData = 'token5MinData',
  TokenDayData = 'tokenDayData',
  TokenHourData = 'tokenHourData',
  TotalValueLocked = 'totalValueLocked',
  TotalValueLockedUsd = 'totalValueLockedUSD',
  TxCount = 'txCount',
  Volume = 'volume',
  VolumeUsd = 'volumeUSD'
}

export type Transaction = {
  __typename?: 'Transaction';
  blockNumber: Scalars['BigInt']['output'];
  gasPrice: Scalars['BigInt']['output'];
  gasUsed: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  timestamp: Scalars['BigInt']['output'];
};

export type Transaction_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Transaction_Filter>>>;
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  gasPrice?: InputMaybe<Scalars['BigInt']['input']>;
  gasPrice_gt?: InputMaybe<Scalars['BigInt']['input']>;
  gasPrice_gte?: InputMaybe<Scalars['BigInt']['input']>;
  gasPrice_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  gasPrice_lt?: InputMaybe<Scalars['BigInt']['input']>;
  gasPrice_lte?: InputMaybe<Scalars['BigInt']['input']>;
  gasPrice_not?: InputMaybe<Scalars['BigInt']['input']>;
  gasPrice_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  gasUsed?: InputMaybe<Scalars['BigInt']['input']>;
  gasUsed_gt?: InputMaybe<Scalars['BigInt']['input']>;
  gasUsed_gte?: InputMaybe<Scalars['BigInt']['input']>;
  gasUsed_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  gasUsed_lt?: InputMaybe<Scalars['BigInt']['input']>;
  gasUsed_lte?: InputMaybe<Scalars['BigInt']['input']>;
  gasUsed_not?: InputMaybe<Scalars['BigInt']['input']>;
  gasUsed_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Transaction_Filter>>>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum Transaction_OrderBy {
  BlockNumber = 'blockNumber',
  GasPrice = 'gasPrice',
  GasUsed = 'gasUsed',
  Id = 'id',
  Timestamp = 'timestamp'
}

export type UniDayData = {
  __typename?: 'UniDayData';
  feesUSD: Scalars['BigDecimal']['output'];
  id: Scalars['ID']['output'];
  timestamp: Scalars['Int']['output'];
  tvlUSD: Scalars['BigDecimal']['output'];
  txCount: Scalars['BigInt']['output'];
  volumeETH: Scalars['BigDecimal']['output'];
  volumeUSD: Scalars['BigDecimal']['output'];
};

export type UniDayData_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<UniDayData_Filter>>>;
  feesUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<UniDayData_Filter>>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  tvlUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  tvlUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  tvlUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  tvlUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  tvlUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  tvlUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  tvlUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  tvlUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  txCount?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  txCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  volumeETH?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeETH_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeETH_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeETH_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeETH_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeETH_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeETH_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeETH_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
};

export enum UniDayData_OrderBy {
  FeesUsd = 'feesUSD',
  Id = 'id',
  Timestamp = 'timestamp',
  TvlUsd = 'tvlUSD',
  TxCount = 'txCount',
  VolumeEth = 'volumeETH',
  VolumeUsd = 'volumeUSD'
}

export type UnstakeEvent = {
  __typename?: 'UnstakeEvent';
  blockNumber: Scalars['BigInt']['output'];
  farm: Farm;
  id: Scalars['ID']['output'];
  owner: Scalars['String']['output'];
  position: StakedPosition;
  positionFarm: StakedPositionFarm;
  timestamp: Scalars['BigInt']['output'];
  tokenId: Scalars['BigInt']['output'];
  transaction: Transaction;
};

export type UnstakeEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<UnstakeEvent_Filter>>>;
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  farm?: InputMaybe<Scalars['String']['input']>;
  farm_?: InputMaybe<Farm_Filter>;
  farm_contains?: InputMaybe<Scalars['String']['input']>;
  farm_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  farm_ends_with?: InputMaybe<Scalars['String']['input']>;
  farm_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  farm_gt?: InputMaybe<Scalars['String']['input']>;
  farm_gte?: InputMaybe<Scalars['String']['input']>;
  farm_in?: InputMaybe<Array<Scalars['String']['input']>>;
  farm_lt?: InputMaybe<Scalars['String']['input']>;
  farm_lte?: InputMaybe<Scalars['String']['input']>;
  farm_not?: InputMaybe<Scalars['String']['input']>;
  farm_not_contains?: InputMaybe<Scalars['String']['input']>;
  farm_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  farm_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  farm_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  farm_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  farm_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  farm_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  farm_starts_with?: InputMaybe<Scalars['String']['input']>;
  farm_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<UnstakeEvent_Filter>>>;
  owner?: InputMaybe<Scalars['String']['input']>;
  owner_contains?: InputMaybe<Scalars['String']['input']>;
  owner_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_ends_with?: InputMaybe<Scalars['String']['input']>;
  owner_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_gt?: InputMaybe<Scalars['String']['input']>;
  owner_gte?: InputMaybe<Scalars['String']['input']>;
  owner_in?: InputMaybe<Array<Scalars['String']['input']>>;
  owner_lt?: InputMaybe<Scalars['String']['input']>;
  owner_lte?: InputMaybe<Scalars['String']['input']>;
  owner_not?: InputMaybe<Scalars['String']['input']>;
  owner_not_contains?: InputMaybe<Scalars['String']['input']>;
  owner_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  owner_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  owner_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  owner_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_starts_with?: InputMaybe<Scalars['String']['input']>;
  owner_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['String']['input']>;
  positionFarm?: InputMaybe<Scalars['String']['input']>;
  positionFarm_?: InputMaybe<StakedPositionFarm_Filter>;
  positionFarm_contains?: InputMaybe<Scalars['String']['input']>;
  positionFarm_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  positionFarm_ends_with?: InputMaybe<Scalars['String']['input']>;
  positionFarm_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  positionFarm_gt?: InputMaybe<Scalars['String']['input']>;
  positionFarm_gte?: InputMaybe<Scalars['String']['input']>;
  positionFarm_in?: InputMaybe<Array<Scalars['String']['input']>>;
  positionFarm_lt?: InputMaybe<Scalars['String']['input']>;
  positionFarm_lte?: InputMaybe<Scalars['String']['input']>;
  positionFarm_not?: InputMaybe<Scalars['String']['input']>;
  positionFarm_not_contains?: InputMaybe<Scalars['String']['input']>;
  positionFarm_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  positionFarm_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  positionFarm_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  positionFarm_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  positionFarm_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  positionFarm_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  positionFarm_starts_with?: InputMaybe<Scalars['String']['input']>;
  positionFarm_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  position_?: InputMaybe<StakedPosition_Filter>;
  position_contains?: InputMaybe<Scalars['String']['input']>;
  position_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  position_ends_with?: InputMaybe<Scalars['String']['input']>;
  position_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  position_gt?: InputMaybe<Scalars['String']['input']>;
  position_gte?: InputMaybe<Scalars['String']['input']>;
  position_in?: InputMaybe<Array<Scalars['String']['input']>>;
  position_lt?: InputMaybe<Scalars['String']['input']>;
  position_lte?: InputMaybe<Scalars['String']['input']>;
  position_not?: InputMaybe<Scalars['String']['input']>;
  position_not_contains?: InputMaybe<Scalars['String']['input']>;
  position_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  position_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  position_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  position_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  position_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  position_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  position_starts_with?: InputMaybe<Scalars['String']['input']>;
  position_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tokenId?: InputMaybe<Scalars['BigInt']['input']>;
  tokenId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  tokenId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  tokenId_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tokenId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  tokenId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  tokenId_not?: InputMaybe<Scalars['BigInt']['input']>;
  tokenId_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  transaction?: InputMaybe<Scalars['String']['input']>;
  transaction_?: InputMaybe<Transaction_Filter>;
  transaction_contains?: InputMaybe<Scalars['String']['input']>;
  transaction_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction_ends_with?: InputMaybe<Scalars['String']['input']>;
  transaction_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction_gt?: InputMaybe<Scalars['String']['input']>;
  transaction_gte?: InputMaybe<Scalars['String']['input']>;
  transaction_in?: InputMaybe<Array<Scalars['String']['input']>>;
  transaction_lt?: InputMaybe<Scalars['String']['input']>;
  transaction_lte?: InputMaybe<Scalars['String']['input']>;
  transaction_not?: InputMaybe<Scalars['String']['input']>;
  transaction_not_contains?: InputMaybe<Scalars['String']['input']>;
  transaction_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  transaction_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  transaction_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  transaction_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction_starts_with?: InputMaybe<Scalars['String']['input']>;
  transaction_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum UnstakeEvent_OrderBy {
  BlockNumber = 'blockNumber',
  Farm = 'farm',
  FarmActive = 'farm__active',
  FarmId = 'farm__id',
  FarmRewardPerBlock = 'farm__rewardPerBlock',
  FarmTotalBlockShare = 'farm__totalBlockShare',
  FarmTotalClaimable = 'farm__totalClaimable',
  FarmTotalClaimed = 'farm__totalClaimed',
  Id = 'id',
  Owner = 'owner',
  Position = 'position',
  PositionFarm = 'positionFarm',
  PositionFarmId = 'positionFarm__id',
  PositionFarmLastUpdateBlock = 'positionFarm__lastUpdateBlock',
  PositionFarmLastUpdateTimestamp = 'positionFarm__lastUpdateTimestamp',
  PositionFarmTotalClaimable = 'positionFarm__totalClaimable',
  PositionBlockShare = 'position__blockShare',
  PositionId = 'position__id',
  PositionIsActive = 'position__isActive',
  PositionIsStaked = 'position__isStaked',
  PositionLastUpdateBlock = 'position__lastUpdateBlock',
  PositionLastUpdateTimestamp = 'position__lastUpdateTimestamp',
  PositionOwner = 'position__owner',
  PositionTokenId = 'position__tokenId',
  Timestamp = 'timestamp',
  TokenId = 'tokenId',
  Transaction = 'transaction',
  TransactionBlockNumber = 'transaction__blockNumber',
  TransactionGasPrice = 'transaction__gasPrice',
  TransactionGasUsed = 'transaction__gasUsed',
  TransactionId = 'transaction__id',
  TransactionTimestamp = 'transaction__timestamp'
}

export type WalletTradingVolume = {
  __typename?: 'WalletTradingVolume';
  id: Scalars['ID']['output'];
  lastActiveBlockNumber: Scalars['BigInt']['output'];
  totalVolumeUSD: Scalars['BigDecimal']['output'];
  txCount: Scalars['BigInt']['output'];
};

export type WalletTradingVolume_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<WalletTradingVolume_Filter>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  lastActiveBlockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  lastActiveBlockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastActiveBlockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastActiveBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastActiveBlockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastActiveBlockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastActiveBlockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastActiveBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<WalletTradingVolume_Filter>>>;
  totalVolumeUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalVolumeUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  txCount?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  txCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum WalletTradingVolume_OrderBy {
  Id = 'id',
  LastActiveBlockNumber = 'lastActiveBlockNumber',
  TotalVolumeUsd = 'totalVolumeUSD',
  TxCount = 'txCount'
}

export type _Block_ = {
  __typename?: '_Block_';
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']['output']>;
  /** The block number */
  number: Scalars['Int']['output'];
  /** The hash of the parent block */
  parentHash?: Maybe<Scalars['Bytes']['output']>;
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']['output']>;
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  __typename?: '_Meta_';
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   *
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String']['output'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean']['output'];
};

export enum _SubgraphErrorPolicy_ {
  /** Data will be returned even if the subgraph has indexing errors */
  Allow = 'allow',
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  Deny = 'deny'
}

export type PoolAddressQueryVariables = Exact<{ [key: string]: never; }>;


export type PoolAddressQuery = { __typename?: 'Query', pools: Array<{ __typename?: 'Pool', id: string, feeTier: string, token0: { __typename?: 'Token', id: string }, token1: { __typename?: 'Token', id: string } }> };

export type PoolsQueryVariables = Exact<{
  filter?: InputMaybe<Pool_Filter>;
}>;


export type PoolsQuery = { __typename?: 'Query', pools: Array<{ __typename?: 'Pool', id: string, feeTier: string, totalValueLockedUSD: string, feesUSD: string, token0: { __typename?: 'Token', id: string }, token1: { __typename?: 'Token', id: string }, poolHourData: Array<{ __typename?: 'PoolHourData', id: string, volumeUSD: string, feesUSD: string }> }> };

export type TokenPairPoolsDataQueryVariables = Exact<{
  filter?: InputMaybe<Pool_Filter>;
}>;


export type TokenPairPoolsDataQuery = { __typename?: 'Query', pools: Array<{ __typename?: 'Pool', id: string, feeTier: string, liquidity: string, totalValueLockedUSD: string }> };

export type PoolQueryVariables = Exact<{
  poolId: Scalars['ID']['input'];
}>;


export type PoolQuery = { __typename?: 'Query', pool?: { __typename?: 'Pool', totalValueLockedUSD: string, totalValueLockedToken0: string, totalValueLockedToken1: string, poolHourData: Array<{ __typename?: 'PoolHourData', timestamp: number, tvlUSD: string, volumeUSD: string, feesUSD: string }> } | null };

export type PoolTicksQueryVariables = Exact<{
  poolId: Scalars['ID']['input'];
}>;


export type PoolTicksQuery = { __typename?: 'Query', pool?: { __typename?: 'Pool', ticks: Array<{ __typename?: 'Tick', tickIdx: string, liquidityNet: string }> } | null };

export type PoolTransactionsQueryVariables = Exact<{
  filter?: InputMaybe<PoolTransaction_Filter>;
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type PoolTransactionsQuery = { __typename?: 'Query', poolTransactions: Array<{ __typename?: 'PoolTransaction', timestamp: string, id: string, type: string, amountUSD: string, pool: string, token0: string, token0Amount: string, token1: string, token1Amount: string, maker: string }> };

export type PoolVolumeDayGraphQueryVariables = Exact<{
  poolId: Scalars['ID']['input'];
  orderBy: PoolDayData_OrderBy;
  filter?: InputMaybe<PoolDayData_Filter>;
}>;


export type PoolVolumeDayGraphQuery = { __typename?: 'Query', pool?: { __typename?: 'Pool', poolDayData: Array<{ __typename?: 'PoolDayData', volumeUSD: string, timestamp: number }> } | null };

export type PoolVolumeHourGraphQueryVariables = Exact<{
  poolId: Scalars['ID']['input'];
  orderBy: PoolHourData_OrderBy;
  filter?: InputMaybe<PoolHourData_Filter>;
}>;


export type PoolVolumeHourGraphQuery = { __typename?: 'Query', pool?: { __typename?: 'Pool', poolHourData: Array<{ __typename?: 'PoolHourData', volumeUSD: string, timestamp: number }> } | null };

export type PoolVolume5MinsGraphQueryVariables = Exact<{
  poolId: Scalars['ID']['input'];
  orderBy: Pool5MinData_OrderBy;
  filter?: InputMaybe<Pool5MinData_Filter>;
}>;


export type PoolVolume5MinsGraphQuery = { __typename?: 'Query', pool?: { __typename?: 'Pool', pool5MinData: Array<{ __typename?: 'Pool5MinData', volumeUSD: string, timestamp: number }> } | null };

export type PoolPriceDayQueryVariables = Exact<{
  poolId: Scalars['ID']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type PoolPriceDayQuery = { __typename?: 'Query', pool?: { __typename?: 'Pool', poolDayData: Array<{ __typename?: 'PoolDayData', sqrtPrice: string, timestamp: number }> } | null };

export type PoolPriceHourQueryVariables = Exact<{
  poolId: Scalars['ID']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type PoolPriceHourQuery = { __typename?: 'Query', pool?: { __typename?: 'Pool', poolHourData: Array<{ __typename?: 'PoolHourData', sqrtPrice: string, timestamp: number }> } | null };

export type PoolPrice5MinuteQueryVariables = Exact<{
  poolId: Scalars['ID']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type PoolPrice5MinuteQuery = { __typename?: 'Query', pool?: { __typename?: 'Pool', pool5MinData: Array<{ __typename?: 'Pool5MinData', sqrtPrice: string, timestamp: number }> } | null };

export type GetTvlRangeQueryVariables = Exact<{
  orderBy: UniDayData_OrderBy;
}>;


export type GetTvlRangeQuery = { __typename?: 'Query', uniDayDatas: Array<{ __typename?: 'UniDayData', timestamp: number, tvlUSD: string }> };

export type GetVolumeRangeQueryVariables = Exact<{
  orderBy: UniDayData_OrderBy;
  filter?: InputMaybe<UniDayData_Filter>;
}>;


export type GetVolumeRangeQuery = { __typename?: 'Query', uniDayDatas: Array<{ __typename?: 'UniDayData', timestamp: number, volumeUSD: string }> };

export type TokensQueryVariables = Exact<{
  filter?: InputMaybe<Token_Filter>;
}>;


export type TokensQuery = { __typename?: 'Query', tokens: Array<{ __typename?: 'Token', id: string, derivedUSD: string, tokenHourData: Array<{ __typename?: 'TokenHourData', timestamp: number, priceUSD: string, volumeUSD: string, open: string }>, token5MinData: Array<{ __typename?: 'Token5MinData', timestamp: number, priceUSD: string, volumeUSD: string, open: string }> }> };
