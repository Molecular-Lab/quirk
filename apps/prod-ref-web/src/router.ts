// Generouted, changes to this file will be overridden
/* eslint-disable */

import { components, hooks, utils } from '@generouted/react-router/client'

export type Path =
  | `/`
  | `/add`
  | `/add/:currencyIdA`
  | `/add/:currencyIdA/:currencyIdB`
  | `/add/:currencyIdA/:currencyIdB/:feeAmount`
  | `/add/:currencyIdA/:currencyIdB/:feeAmount/:tokenId`
  | `/bridge`
  | `/explore`
  | `/explore/pools`
  | `/explore/pools/:chainName/:poolAddress`
  | `/explore/tokens`
  | `/limit`
  | `/pools`
  | `/pools/:tokenId`
  | `/remove`
  | `/remove/:tokenId`
  | `/storybook`
  | `/swap`
  | `/utils`
  | `/utils/fee-watcher`
  | `/utils/gas-watcher`
  | `/utils/wallet-info`

export type Params = {
  '/add/:currencyIdA': { currencyIdA: string }
  '/add/:currencyIdA/:currencyIdB': { currencyIdA: string; currencyIdB: string }
  '/add/:currencyIdA/:currencyIdB/:feeAmount': { currencyIdA: string; currencyIdB: string; feeAmount: string }
  '/add/:currencyIdA/:currencyIdB/:feeAmount/:tokenId': { currencyIdA: string; currencyIdB: string; feeAmount: string; tokenId: string }
  '/explore/pools/:chainName/:poolAddress': { chainName: string; poolAddress: string }
  '/pools/:tokenId': { tokenId: string }
  '/remove/:tokenId': { tokenId: string }
}

export type ModalPath = never

export const { Link, Navigate } = components<Path, Params>()
export const { useModals, useNavigate, useParams } = hooks<Path, Params, ModalPath>()
export const { redirect } = utils<Path, Params>()
