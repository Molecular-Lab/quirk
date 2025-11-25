/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query PoolAddress {\n    pools {\n      id\n      feeTier\n      token0 {\n        id\n      }\n      token1 {\n        id\n      }\n    }\n  }\n": typeof types.PoolAddressDocument,
    "\n  query Pools($filter: Pool_filter) {\n    pools(where: $filter) {\n      id\n      feeTier\n      token0 {\n        id\n      }\n      token1 {\n        id\n      }\n      totalValueLockedUSD\n      feesUSD\n      poolHourData(orderBy: timestamp, orderDirection: desc, first: 24) {\n        id\n        volumeUSD\n        feesUSD\n      }\n    }\n  }\n": typeof types.PoolsDocument,
    "\n  query TokenPairPoolsData($filter: Pool_filter) {\n    pools(where: $filter) {\n      id\n      feeTier\n      liquidity\n      totalValueLockedUSD\n    }\n  }\n": typeof types.TokenPairPoolsDataDocument,
    "\n  query Pool($poolId: ID!) {\n    pool(id: $poolId) {\n      totalValueLockedUSD\n      totalValueLockedToken0\n      totalValueLockedToken1\n      poolHourData(orderBy: timestamp, orderDirection: desc, first: 48) {\n        timestamp\n        tvlUSD\n        volumeUSD\n        feesUSD\n      }\n    }\n  }\n": typeof types.PoolDocument,
    "\n  query PoolTicks($poolId: ID!) {\n    pool(id: $poolId) {\n      ticks(orderBy: tickIdx, orderDirection: asc) {\n        tickIdx\n        liquidityNet\n      }\n    }\n  }\n": typeof types.PoolTicksDocument,
    "\n  query PoolTransactions($filter: PoolTransaction_filter, $first: Int) {\n    poolTransactions(orderBy: timestamp, orderDirection: desc, where: $filter, first: $first) {\n      timestamp\n      id\n      type\n      amountUSD\n      pool\n      token0\n      token0Amount\n      token1\n      token1Amount\n      maker\n    }\n  }\n": typeof types.PoolTransactionsDocument,
    "\n  query PoolVolumeDayGraph($poolId: ID!, $orderBy: PoolDayData_orderBy!, $filter: PoolDayData_filter) {\n    pool(id: $poolId) {\n      poolDayData(orderBy: $orderBy, where: $filter, first: 1000) {\n        volumeUSD\n        timestamp\n      }\n    }\n  }\n": typeof types.PoolVolumeDayGraphDocument,
    "\n  query PoolVolumeHourGraph($poolId: ID!, $orderBy: PoolHourData_orderBy!, $filter: PoolHourData_filter) {\n    pool(id: $poolId) {\n      poolHourData(orderBy: $orderBy, where: $filter, first: 1000) {\n        volumeUSD\n        timestamp\n      }\n    }\n  }\n": typeof types.PoolVolumeHourGraphDocument,
    "\n  query PoolVolume5MinsGraph($poolId: ID!, $orderBy: Pool5MinData_orderBy!, $filter: Pool5MinData_filter) {\n    pool(id: $poolId) {\n      pool5MinData(orderBy: $orderBy, where: $filter, first: 1000) {\n        volumeUSD\n        timestamp\n      }\n    }\n  }\n": typeof types.PoolVolume5MinsGraphDocument,
    "\n  query PoolPriceDay($poolId: ID!, $first: Int) {\n    pool(id: $poolId) {\n      poolDayData(orderBy: timestamp, orderDirection: desc, first: $first) {\n        sqrtPrice\n        timestamp\n      }\n    }\n  }\n": typeof types.PoolPriceDayDocument,
    "\n  query PoolPriceHour($poolId: ID!, $first: Int) {\n    pool(id: $poolId) {\n      poolHourData(orderBy: timestamp, orderDirection: desc, first: $first) {\n        sqrtPrice\n        timestamp\n      }\n    }\n  }\n": typeof types.PoolPriceHourDocument,
    "\n  query PoolPrice5Minute($poolId: ID!, $first: Int) {\n    pool(id: $poolId) {\n      pool5MinData(orderBy: timestamp, orderDirection: desc, first: $first) {\n        sqrtPrice\n        timestamp\n      }\n    }\n  }\n": typeof types.PoolPrice5MinuteDocument,
    "\n  query GetTVLRange($orderBy: UniDayData_orderBy!) {\n    uniDayDatas(orderBy: $orderBy, orderDirection: desc) {\n      timestamp\n      tvlUSD\n    }\n  }\n": typeof types.GetTvlRangeDocument,
    "\n  query GetVolumeRange($orderBy: UniDayData_orderBy!, $filter: UniDayData_filter) {\n    uniDayDatas(orderBy: $orderBy, where: $filter, orderDirection: desc, first: 1000) {\n      timestamp\n      volumeUSD\n    }\n  }\n": typeof types.GetVolumeRangeDocument,
    "\n  query Tokens($filter: Token_filter) {\n    tokens(where: $filter) {\n      id\n      derivedUSD\n      tokenHourData(orderBy: timestamp, orderDirection: desc, first: 48) {\n        timestamp\n        priceUSD\n        volumeUSD\n        open\n      }\n      token5MinData(orderBy: timestamp, orderDirection: desc, first: 24) {\n        timestamp\n        priceUSD\n        volumeUSD\n        open\n      }\n    }\n  }\n": typeof types.TokensDocument,
};
const documents: Documents = {
    "\n  query PoolAddress {\n    pools {\n      id\n      feeTier\n      token0 {\n        id\n      }\n      token1 {\n        id\n      }\n    }\n  }\n": types.PoolAddressDocument,
    "\n  query Pools($filter: Pool_filter) {\n    pools(where: $filter) {\n      id\n      feeTier\n      token0 {\n        id\n      }\n      token1 {\n        id\n      }\n      totalValueLockedUSD\n      feesUSD\n      poolHourData(orderBy: timestamp, orderDirection: desc, first: 24) {\n        id\n        volumeUSD\n        feesUSD\n      }\n    }\n  }\n": types.PoolsDocument,
    "\n  query TokenPairPoolsData($filter: Pool_filter) {\n    pools(where: $filter) {\n      id\n      feeTier\n      liquidity\n      totalValueLockedUSD\n    }\n  }\n": types.TokenPairPoolsDataDocument,
    "\n  query Pool($poolId: ID!) {\n    pool(id: $poolId) {\n      totalValueLockedUSD\n      totalValueLockedToken0\n      totalValueLockedToken1\n      poolHourData(orderBy: timestamp, orderDirection: desc, first: 48) {\n        timestamp\n        tvlUSD\n        volumeUSD\n        feesUSD\n      }\n    }\n  }\n": types.PoolDocument,
    "\n  query PoolTicks($poolId: ID!) {\n    pool(id: $poolId) {\n      ticks(orderBy: tickIdx, orderDirection: asc) {\n        tickIdx\n        liquidityNet\n      }\n    }\n  }\n": types.PoolTicksDocument,
    "\n  query PoolTransactions($filter: PoolTransaction_filter, $first: Int) {\n    poolTransactions(orderBy: timestamp, orderDirection: desc, where: $filter, first: $first) {\n      timestamp\n      id\n      type\n      amountUSD\n      pool\n      token0\n      token0Amount\n      token1\n      token1Amount\n      maker\n    }\n  }\n": types.PoolTransactionsDocument,
    "\n  query PoolVolumeDayGraph($poolId: ID!, $orderBy: PoolDayData_orderBy!, $filter: PoolDayData_filter) {\n    pool(id: $poolId) {\n      poolDayData(orderBy: $orderBy, where: $filter, first: 1000) {\n        volumeUSD\n        timestamp\n      }\n    }\n  }\n": types.PoolVolumeDayGraphDocument,
    "\n  query PoolVolumeHourGraph($poolId: ID!, $orderBy: PoolHourData_orderBy!, $filter: PoolHourData_filter) {\n    pool(id: $poolId) {\n      poolHourData(orderBy: $orderBy, where: $filter, first: 1000) {\n        volumeUSD\n        timestamp\n      }\n    }\n  }\n": types.PoolVolumeHourGraphDocument,
    "\n  query PoolVolume5MinsGraph($poolId: ID!, $orderBy: Pool5MinData_orderBy!, $filter: Pool5MinData_filter) {\n    pool(id: $poolId) {\n      pool5MinData(orderBy: $orderBy, where: $filter, first: 1000) {\n        volumeUSD\n        timestamp\n      }\n    }\n  }\n": types.PoolVolume5MinsGraphDocument,
    "\n  query PoolPriceDay($poolId: ID!, $first: Int) {\n    pool(id: $poolId) {\n      poolDayData(orderBy: timestamp, orderDirection: desc, first: $first) {\n        sqrtPrice\n        timestamp\n      }\n    }\n  }\n": types.PoolPriceDayDocument,
    "\n  query PoolPriceHour($poolId: ID!, $first: Int) {\n    pool(id: $poolId) {\n      poolHourData(orderBy: timestamp, orderDirection: desc, first: $first) {\n        sqrtPrice\n        timestamp\n      }\n    }\n  }\n": types.PoolPriceHourDocument,
    "\n  query PoolPrice5Minute($poolId: ID!, $first: Int) {\n    pool(id: $poolId) {\n      pool5MinData(orderBy: timestamp, orderDirection: desc, first: $first) {\n        sqrtPrice\n        timestamp\n      }\n    }\n  }\n": types.PoolPrice5MinuteDocument,
    "\n  query GetTVLRange($orderBy: UniDayData_orderBy!) {\n    uniDayDatas(orderBy: $orderBy, orderDirection: desc) {\n      timestamp\n      tvlUSD\n    }\n  }\n": types.GetTvlRangeDocument,
    "\n  query GetVolumeRange($orderBy: UniDayData_orderBy!, $filter: UniDayData_filter) {\n    uniDayDatas(orderBy: $orderBy, where: $filter, orderDirection: desc, first: 1000) {\n      timestamp\n      volumeUSD\n    }\n  }\n": types.GetVolumeRangeDocument,
    "\n  query Tokens($filter: Token_filter) {\n    tokens(where: $filter) {\n      id\n      derivedUSD\n      tokenHourData(orderBy: timestamp, orderDirection: desc, first: 48) {\n        timestamp\n        priceUSD\n        volumeUSD\n        open\n      }\n      token5MinData(orderBy: timestamp, orderDirection: desc, first: 24) {\n        timestamp\n        priceUSD\n        volumeUSD\n        open\n      }\n    }\n  }\n": types.TokensDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query PoolAddress {\n    pools {\n      id\n      feeTier\n      token0 {\n        id\n      }\n      token1 {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  query PoolAddress {\n    pools {\n      id\n      feeTier\n      token0 {\n        id\n      }\n      token1 {\n        id\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query Pools($filter: Pool_filter) {\n    pools(where: $filter) {\n      id\n      feeTier\n      token0 {\n        id\n      }\n      token1 {\n        id\n      }\n      totalValueLockedUSD\n      feesUSD\n      poolHourData(orderBy: timestamp, orderDirection: desc, first: 24) {\n        id\n        volumeUSD\n        feesUSD\n      }\n    }\n  }\n"): (typeof documents)["\n  query Pools($filter: Pool_filter) {\n    pools(where: $filter) {\n      id\n      feeTier\n      token0 {\n        id\n      }\n      token1 {\n        id\n      }\n      totalValueLockedUSD\n      feesUSD\n      poolHourData(orderBy: timestamp, orderDirection: desc, first: 24) {\n        id\n        volumeUSD\n        feesUSD\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query TokenPairPoolsData($filter: Pool_filter) {\n    pools(where: $filter) {\n      id\n      feeTier\n      liquidity\n      totalValueLockedUSD\n    }\n  }\n"): (typeof documents)["\n  query TokenPairPoolsData($filter: Pool_filter) {\n    pools(where: $filter) {\n      id\n      feeTier\n      liquidity\n      totalValueLockedUSD\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query Pool($poolId: ID!) {\n    pool(id: $poolId) {\n      totalValueLockedUSD\n      totalValueLockedToken0\n      totalValueLockedToken1\n      poolHourData(orderBy: timestamp, orderDirection: desc, first: 48) {\n        timestamp\n        tvlUSD\n        volumeUSD\n        feesUSD\n      }\n    }\n  }\n"): (typeof documents)["\n  query Pool($poolId: ID!) {\n    pool(id: $poolId) {\n      totalValueLockedUSD\n      totalValueLockedToken0\n      totalValueLockedToken1\n      poolHourData(orderBy: timestamp, orderDirection: desc, first: 48) {\n        timestamp\n        tvlUSD\n        volumeUSD\n        feesUSD\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query PoolTicks($poolId: ID!) {\n    pool(id: $poolId) {\n      ticks(orderBy: tickIdx, orderDirection: asc) {\n        tickIdx\n        liquidityNet\n      }\n    }\n  }\n"): (typeof documents)["\n  query PoolTicks($poolId: ID!) {\n    pool(id: $poolId) {\n      ticks(orderBy: tickIdx, orderDirection: asc) {\n        tickIdx\n        liquidityNet\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query PoolTransactions($filter: PoolTransaction_filter, $first: Int) {\n    poolTransactions(orderBy: timestamp, orderDirection: desc, where: $filter, first: $first) {\n      timestamp\n      id\n      type\n      amountUSD\n      pool\n      token0\n      token0Amount\n      token1\n      token1Amount\n      maker\n    }\n  }\n"): (typeof documents)["\n  query PoolTransactions($filter: PoolTransaction_filter, $first: Int) {\n    poolTransactions(orderBy: timestamp, orderDirection: desc, where: $filter, first: $first) {\n      timestamp\n      id\n      type\n      amountUSD\n      pool\n      token0\n      token0Amount\n      token1\n      token1Amount\n      maker\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query PoolVolumeDayGraph($poolId: ID!, $orderBy: PoolDayData_orderBy!, $filter: PoolDayData_filter) {\n    pool(id: $poolId) {\n      poolDayData(orderBy: $orderBy, where: $filter, first: 1000) {\n        volumeUSD\n        timestamp\n      }\n    }\n  }\n"): (typeof documents)["\n  query PoolVolumeDayGraph($poolId: ID!, $orderBy: PoolDayData_orderBy!, $filter: PoolDayData_filter) {\n    pool(id: $poolId) {\n      poolDayData(orderBy: $orderBy, where: $filter, first: 1000) {\n        volumeUSD\n        timestamp\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query PoolVolumeHourGraph($poolId: ID!, $orderBy: PoolHourData_orderBy!, $filter: PoolHourData_filter) {\n    pool(id: $poolId) {\n      poolHourData(orderBy: $orderBy, where: $filter, first: 1000) {\n        volumeUSD\n        timestamp\n      }\n    }\n  }\n"): (typeof documents)["\n  query PoolVolumeHourGraph($poolId: ID!, $orderBy: PoolHourData_orderBy!, $filter: PoolHourData_filter) {\n    pool(id: $poolId) {\n      poolHourData(orderBy: $orderBy, where: $filter, first: 1000) {\n        volumeUSD\n        timestamp\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query PoolVolume5MinsGraph($poolId: ID!, $orderBy: Pool5MinData_orderBy!, $filter: Pool5MinData_filter) {\n    pool(id: $poolId) {\n      pool5MinData(orderBy: $orderBy, where: $filter, first: 1000) {\n        volumeUSD\n        timestamp\n      }\n    }\n  }\n"): (typeof documents)["\n  query PoolVolume5MinsGraph($poolId: ID!, $orderBy: Pool5MinData_orderBy!, $filter: Pool5MinData_filter) {\n    pool(id: $poolId) {\n      pool5MinData(orderBy: $orderBy, where: $filter, first: 1000) {\n        volumeUSD\n        timestamp\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query PoolPriceDay($poolId: ID!, $first: Int) {\n    pool(id: $poolId) {\n      poolDayData(orderBy: timestamp, orderDirection: desc, first: $first) {\n        sqrtPrice\n        timestamp\n      }\n    }\n  }\n"): (typeof documents)["\n  query PoolPriceDay($poolId: ID!, $first: Int) {\n    pool(id: $poolId) {\n      poolDayData(orderBy: timestamp, orderDirection: desc, first: $first) {\n        sqrtPrice\n        timestamp\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query PoolPriceHour($poolId: ID!, $first: Int) {\n    pool(id: $poolId) {\n      poolHourData(orderBy: timestamp, orderDirection: desc, first: $first) {\n        sqrtPrice\n        timestamp\n      }\n    }\n  }\n"): (typeof documents)["\n  query PoolPriceHour($poolId: ID!, $first: Int) {\n    pool(id: $poolId) {\n      poolHourData(orderBy: timestamp, orderDirection: desc, first: $first) {\n        sqrtPrice\n        timestamp\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query PoolPrice5Minute($poolId: ID!, $first: Int) {\n    pool(id: $poolId) {\n      pool5MinData(orderBy: timestamp, orderDirection: desc, first: $first) {\n        sqrtPrice\n        timestamp\n      }\n    }\n  }\n"): (typeof documents)["\n  query PoolPrice5Minute($poolId: ID!, $first: Int) {\n    pool(id: $poolId) {\n      pool5MinData(orderBy: timestamp, orderDirection: desc, first: $first) {\n        sqrtPrice\n        timestamp\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetTVLRange($orderBy: UniDayData_orderBy!) {\n    uniDayDatas(orderBy: $orderBy, orderDirection: desc) {\n      timestamp\n      tvlUSD\n    }\n  }\n"): (typeof documents)["\n  query GetTVLRange($orderBy: UniDayData_orderBy!) {\n    uniDayDatas(orderBy: $orderBy, orderDirection: desc) {\n      timestamp\n      tvlUSD\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetVolumeRange($orderBy: UniDayData_orderBy!, $filter: UniDayData_filter) {\n    uniDayDatas(orderBy: $orderBy, where: $filter, orderDirection: desc, first: 1000) {\n      timestamp\n      volumeUSD\n    }\n  }\n"): (typeof documents)["\n  query GetVolumeRange($orderBy: UniDayData_orderBy!, $filter: UniDayData_filter) {\n    uniDayDatas(orderBy: $orderBy, where: $filter, orderDirection: desc, first: 1000) {\n      timestamp\n      volumeUSD\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query Tokens($filter: Token_filter) {\n    tokens(where: $filter) {\n      id\n      derivedUSD\n      tokenHourData(orderBy: timestamp, orderDirection: desc, first: 48) {\n        timestamp\n        priceUSD\n        volumeUSD\n        open\n      }\n      token5MinData(orderBy: timestamp, orderDirection: desc, first: 24) {\n        timestamp\n        priceUSD\n        volumeUSD\n        open\n      }\n    }\n  }\n"): (typeof documents)["\n  query Tokens($filter: Token_filter) {\n    tokens(where: $filter) {\n      id\n      derivedUSD\n      tokenHourData(orderBy: timestamp, orderDirection: desc, first: 48) {\n        timestamp\n        priceUSD\n        volumeUSD\n        open\n      }\n      token5MinData(orderBy: timestamp, orderDirection: desc, first: 24) {\n        timestamp\n        priceUSD\n        volumeUSD\n        open\n      }\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;