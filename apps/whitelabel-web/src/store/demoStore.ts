/**
 * Demo Store
 * Manages demo client app state with proper API key synchronization
 *
 * Ensures:
 * - Correct client context (productId, clientId, API key)
 * - End-user account state
 * - Deposit flow state
 * - API key sync with b2bApiClient
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface DemoState {
  // Client context (from dashboard selection)
  activeProductId: string | null
  activeClientId: string | null // Internal UUID
  activeApiKey: string | null

  // End-user state (created via "Start Earning")
  endUserId: string | null
  endUserClientUserId: string | null // The demo_user_xxx ID
  hasEarnAccount: boolean

  // UI state
  isCreatingAccount: boolean
  isDepositing: boolean
  error: string | null

  // Deposit history (for demo)
  deposits: Array<{
    orderId: string
    amount: string
    currency: string
    status: 'pending' | 'completed' | 'failed'
    createdAt: string
  }>
}

export interface DemoStore extends DemoState {
  // Setters
  setClientContext: (data: {
    productId: string
    clientId: string
    apiKey: string
  }) => void

  setEndUser: (data: {
    endUserId: string
    endUserClientUserId: string
  }) => void

  setHasEarnAccount: (hasAccount: boolean) => void
  setIsCreatingAccount: (isCreating: boolean) => void
  setIsDepositing: (isDepositing: boolean) => void
  setError: (error: string | null) => void

  addDeposit: (deposit: {
    orderId: string
    amount: string
    currency: string
    status: 'pending' | 'completed' | 'failed'
    createdAt: string
  }) => void

  // Sync API key to localStorage for b2bApiClient
  syncApiKey: () => void

  // Getters
  hasClientContext: () => boolean
  canStartEarning: () => boolean
  canDeposit: () => boolean

  // Reset
  resetEndUser: () => void
  resetDemo: () => void
}

const initialState: DemoState = {
  activeProductId: null,
  activeClientId: null,
  activeApiKey: null,
  endUserId: null,
  endUserClientUserId: null,
  hasEarnAccount: false,
  isCreatingAccount: false,
  isDepositing: false,
  error: null,
  deposits: [],
}

export const useDemoStore = create<DemoStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Set client context from dashboard
      setClientContext: (data) => {
        console.log('[DemoStore] Setting client context:', {
          productId: data.productId,
          clientId: data.clientId,
          apiKey: data.apiKey.substring(0, 12) + '...',
        })

        set({
          activeProductId: data.productId,
          activeClientId: data.clientId,
          activeApiKey: data.apiKey,
        })

        // Sync API key to localStorage for b2bApiClient
        localStorage.setItem('b2b:api_key', data.apiKey)
        console.log('[DemoStore] API key synced to localStorage')
      },

      // Set end-user after "Start Earning"
      setEndUser: (data) => {
        console.log('[DemoStore] Setting end-user:', {
          endUserId: data.endUserId,
          clientUserId: data.endUserClientUserId,
        })

        set({
          endUserId: data.endUserId,
          endUserClientUserId: data.endUserClientUserId,
          hasEarnAccount: true,
          isCreatingAccount: false,
          error: null,
        })
      },

      setHasEarnAccount: (hasAccount) => {
        set({ hasEarnAccount: hasAccount })
      },

      setIsCreatingAccount: (isCreating) => {
        set({ isCreatingAccount: isCreating })
      },

      setIsDepositing: (isDepositing) => {
        set({ isDepositing: isDepositing })
      },

      setError: (error) => {
        set({ error })
      },

      addDeposit: (deposit) => {
        const deposits = get().deposits
        set({
          deposits: [deposit, ...deposits],
        })
      },

      // Sync API key to localStorage (for b2bApiClient)
      syncApiKey: () => {
        const apiKey = get().activeApiKey
        if (apiKey) {
          localStorage.setItem('b2b:api_key', apiKey)
          console.log('[DemoStore] API key synced to localStorage:', apiKey.substring(0, 12) + '...')
        }
      },

      // Check if client context is set
      hasClientContext: () => {
        const { activeProductId, activeClientId, activeApiKey } = get()
        return !!(activeProductId && activeClientId && activeApiKey)
      },

      // Check if can start earning
      canStartEarning: () => {
        const { hasEarnAccount, isCreatingAccount } = get()
        return get().hasClientContext() && !hasEarnAccount && !isCreatingAccount
      },

      // Check if can deposit
      canDeposit: () => {
        const { hasEarnAccount, isDepositing } = get()
        return get().hasClientContext() && hasEarnAccount && !isDepositing
      },

      // Reset end-user state (for testing)
      resetEndUser: () => {
        set({
          endUserId: null,
          endUserClientUserId: null,
          hasEarnAccount: false,
          isCreatingAccount: false,
          error: null,
        })
      },

      // Reset entire demo state
      resetDemo: () => {
        set(initialState)
        localStorage.removeItem('b2b:api_key')
      },
    }),
    {
      name: 'proxify-demo-state',
      partialize: (state) => ({
        activeProductId: state.activeProductId,
        activeClientId: state.activeClientId,
        activeApiKey: state.activeApiKey,
        endUserId: state.endUserId,
        endUserClientUserId: state.endUserClientUserId,
        hasEarnAccount: state.hasEarnAccount,
        deposits: state.deposits,
      }) as Partial<DemoStore>,
    },
  ),
)

/**
 * Usage Example:
 *
 * // 1. When navigating to demo, set client context from userStore
 * const { activeProductId, getActiveOrganization, apiKey } = useUserStore()
 * const { setClientContext } = useDemoStore()
 *
 * useEffect(() => {
 *   const org = getActiveOrganization()
 *   if (org && activeProductId && apiKey) {
 *     setClientContext({
 *       productId: activeProductId,
 *       clientId: org.id,
 *       apiKey: apiKey,
 *     })
 *   }
 * }, [activeProductId])
 *
 * // 2. Start Earning - Create end-user
 * const { setIsCreatingAccount, setEndUser, setError } = useDemoStore()
 *
 * const handleStartEarning = async () => {
 *   setIsCreatingAccount(true)
 *   setError(null)
 *
 *   const demoUserId = `demo_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
 *
 *   const response = await b2bApiClient.createUser({
 *     clientId: activeProductId,
 *     clientUserId: demoUserId,
 *     email: 'demo@example.com',
 *   })
 *
 *   setEndUser({
 *     endUserId: response.id,
 *     endUserClientUserId: demoUserId,
 *   })
 * }
 *
 * // 3. Deposit - Create deposit order
 * const { endUserId, setIsDepositing, addDeposit } = useDemoStore()
 *
 * const handleDeposit = async (amount: number) => {
 *   setIsDepositing(true)
 *
 *   const response = await b2bApiClient.createDeposit({
 *     user_id: endUserId,
 *     amount: amount.toString(),
 *     currency: 'USD',
 *     chain: 'base',
 *     token: 'USDC',
 *     payment_method: 'proxify_gateway',
 *   })
 *
 *   addDeposit({
 *     orderId: response.orderId,
 *     amount: amount.toString(),
 *     currency: 'USD',
 *     status: 'pending',
 *     createdAt: new Date().toISOString(),
 *   })
 *
 *   setIsDepositing(false)
 * }
 */
