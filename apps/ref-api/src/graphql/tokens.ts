import { gql } from "./__generated__"

export const GetTokensQuery = gql(`
  query Tokens($filter: Token_filter) {
    tokens(where: $filter) {
      id
      derivedUSD
      tokenHourData(orderBy: timestamp, orderDirection: desc, first: 48) {
        timestamp
        priceUSD
        volumeUSD
        open
      }
      token5MinData(orderBy: timestamp, orderDirection: desc, first: 24) {
        timestamp
        priceUSD
        volumeUSD
        open
      }
    }
  }
`)
