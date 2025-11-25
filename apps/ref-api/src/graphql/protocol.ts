import { gql } from "@/graphql/__generated__"

export const GetTVLGraphQuery = gql(`
  query GetTVLRange($orderBy: UniDayData_orderBy!) {
    uniDayDatas(orderBy: $orderBy, orderDirection: desc) {
      timestamp
      tvlUSD
    }
  }
`)

export const GetVolumeGraphQuery = gql(`
  query GetVolumeRange($orderBy: UniDayData_orderBy!, $filter: UniDayData_filter) {
    uniDayDatas(orderBy: $orderBy, where: $filter, orderDirection: desc, first: 1000) {
      timestamp
      volumeUSD
    }
  }
`)
