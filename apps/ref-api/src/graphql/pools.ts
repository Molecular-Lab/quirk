import { gql } from "./__generated__"

export const GetPoolAddressQuery = gql(`
  query PoolAddress {
    pools {
      id
      feeTier
      token0 {
        id
      }
      token1 {
        id
      }
    }
  }
`)

export const GetPoolsQuery = gql(`
  query Pools($filter: Pool_filter) {
    pools(where: $filter) {
      id
      feeTier
      token0 {
        id
      }
      token1 {
        id
      }
      totalValueLockedUSD
      feesUSD
      poolHourData(orderBy: timestamp, orderDirection: desc, first: 24) {
        id
        volumeUSD
        feesUSD
      }
    }
  }
`)

export const GetTokenPairPoolsDataQuery = gql(`
  query TokenPairPoolsData($filter: Pool_filter) {
    pools(where: $filter) {
      id
      feeTier
      liquidity
      totalValueLockedUSD
    }
  }
`)

export const GetPoolQuery = gql(`
  query Pool($poolId: ID!) {
    pool(id: $poolId) {
      totalValueLockedUSD
      totalValueLockedToken0
      totalValueLockedToken1
      poolHourData(orderBy: timestamp, orderDirection: desc, first: 48) {
        timestamp
        tvlUSD
        volumeUSD
        feesUSD
      }
    }
  }
`)

export const GetPoolTicksQuery = gql(`
  query PoolTicks($poolId: ID!) {
    pool(id: $poolId) {
      ticks(orderBy: tickIdx, orderDirection: asc) {
        tickIdx
        liquidityNet
      }
    }
  }
`)

export const GetPoolTransactionsQuery = gql(`
  query PoolTransactions($filter: PoolTransaction_filter, $first: Int) {
    poolTransactions(orderBy: timestamp, orderDirection: desc, where: $filter, first: $first) {
      timestamp
      id
      type
      amountUSD
      pool
      token0
      token0Amount
      token1
      token1Amount
      maker
    }
  }
`)

export const GetPoolVolumeDayGraphQuery = gql(`
  query PoolVolumeDayGraph($poolId: ID!, $orderBy: PoolDayData_orderBy!, $filter: PoolDayData_filter) {
    pool(id: $poolId) {
      poolDayData(orderBy: $orderBy, where: $filter, first: 1000) {
        volumeUSD
        timestamp
      }
    }
  }
`)

export const GetPoolVolumeHourGraphQuery = gql(`
  query PoolVolumeHourGraph($poolId: ID!, $orderBy: PoolHourData_orderBy!, $filter: PoolHourData_filter) {
    pool(id: $poolId) {
      poolHourData(orderBy: $orderBy, where: $filter, first: 1000) {
        volumeUSD
        timestamp
      }
    }
  }
`)

export const GetPoolVolume5MinsGraphQuery = gql(`
  query PoolVolume5MinsGraph($poolId: ID!, $orderBy: Pool5MinData_orderBy!, $filter: Pool5MinData_filter) {
    pool(id: $poolId) {
      pool5MinData(orderBy: $orderBy, where: $filter, first: 1000) {
        volumeUSD
        timestamp
      }
    }
  }
`)

export const GetPoolPriceDayQuery = gql(`
  query PoolPriceDay($poolId: ID!, $first: Int) {
    pool(id: $poolId) {
      poolDayData(orderBy: timestamp, orderDirection: desc, first: $first) {
        sqrtPrice
        timestamp
      }
    }
  }
`)

export const GetPoolPriceHourQuery = gql(`
  query PoolPriceHour($poolId: ID!, $first: Int) {
    pool(id: $poolId) {
      poolHourData(orderBy: timestamp, orderDirection: desc, first: $first) {
        sqrtPrice
        timestamp
      }
    }
  }
`)

export const GetPoolPrice5MinuteQuery = gql(`
  query PoolPrice5Minute($poolId: ID!, $first: Int) {
    pool(id: $poolId) {
      pool5MinData(orderBy: timestamp, orderDirection: desc, first: $first) {
        sqrtPrice
        timestamp
      }
    }
  }
`)
