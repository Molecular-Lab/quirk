# Demo Flow Comprehensive Logging

This document outlines all the logging added to track state changes throughout the demo flow.

## Purpose

Added comprehensive console logging to debug state tracking issues when clicking "Start Demo as Bob". Every state mutation is now logged with:
- ✅ Success indicators
- 🚀 Function entry points
- 🔄 Operation progress
- ❌ Error conditions
- 📋 Data/configuration details
- 🔀 Navigation events
- ⚠️ Warnings

## Files Modified with Logging

### 1. `apps/whitelabel-web/src/store/demoStore.ts`

**State management for demo flow - all mutations logged**

#### `setPersona()`
```
[demoStore] ✅ setPersona() called:
  - privyUserId
  - persona (new)
  - visualizationType
  - clientUserId (Static Key)
  - previousPersona
  - previousVisualizationType
  - previousEndUserId
  - previousHasEarnAccount

[demoStore] ✅ setPersona() state updated:
  - newPersona
  - newVisualizationType
  - newClientUserId
  - endUserStateReset: true
```

#### `resetPersona()`
```
[demoStore] ✅ resetPersona() called:
  - previousPersona
  - previousVisualizationType
  - previousEndUserId
  - previousHasEarnAccount

[demoStore] ✅ resetPersona() - all state cleared
```

#### `setEndUser()`
```
[demoStore] ✅ setEndUser() called:
  - endUserId (new)
  - clientUserId (new)
  - previousEndUserId
  - previousClientUserId
  - hasEarnAccount (current)

[demoStore] ✅ setEndUser() state updated:
  - newEndUserId
  - newClientUserId
```

#### `setHasEarnAccount()`
```
[demoStore] ✅ setHasEarnAccount(): {boolean}
```

#### `activateEarnAccount()`
```
[demoStore] ✅ activateEarnAccount() called:
  - previousHasEarnAccount
  - endUserId
  - endUserClientUserId

[demoStore] ✅ activateEarnAccount() - hasEarnAccount set to true
```

#### `setIsCreatingAccount()`
```
[demoStore] ✅ setIsCreatingAccount(): {boolean}
```

#### `setIsDepositing()`
```
[demoStore] ✅ setIsDepositing(): {boolean}
```

#### `setError()`
```
[demoStore] ⚠️ setError(): {error message}
```

#### `addDeposit()`
```
[demoStore] ✅ addDeposit():
  - deposit (full object)
  - previousDepositCount
```

---

### 2. `apps/whitelabel-web/src/store/demoProductStore.ts`

**Product selection and API key management**

#### `selectProduct()`
```
[demoProductStore] 🚀 selectProduct() called:
  - productId
  - previousProductId
  - availableProductsCount
  - totalApiKeys

[demoProductStore] 📋 Product details:
  - productId
  - clientId
  - companyName
  - environment
  - hasApiKey
  - apiKeyPrefix
  - isActive

[demoProductStore] 🔄 Syncing to clientContextStore...

[demoProductStore] 🔄 Resetting demoStore state (persona + end-user)...

[demoProductStore] ✅ Product selected and synced to clientContextStore:
  - productId
  - clientId
  - companyName
  - hasApiKey
  - apiKeyPrefix
  - demoStateReset: true
```

---

### 3. `apps/whitelabel-web/src/feature/demo/shared/PersonaSelector.tsx`

**Persona selection component (used within demo apps)**

#### `handleStartDemo()`
```
[PersonaSelector] 🚀 handleStartDemo() called:
  - personaId
  - privyUserId
  - selectedProductId
  - visualizationType

[PersonaSelector] 📋 Generated Static Key:
  - privyUserId
  - productId
  - clientId
  - clientUserId (Static Key)
  - visualizationType
  - persona
  - environment

[PersonaSelector] 🔄 Calling createUser API...

[PersonaSelector] ✅ createUser API response:
  - {full API response}

[PersonaSelector] 🔄 Step 1: Calling setPersona()...

[PersonaSelector] 🔄 Step 2: Calling setEndUser()...

[PersonaSelector] 🔄 Step 3: Calling activateEarnAccount()...

[PersonaSelector] ✅ Demo started successfully - all state updates complete

[PersonaSelector] 📢 Calling onDemoStarted() callback
```

**Errors:**
```
[PersonaSelector] ❌ Missing required context:
  - hasPrivyUserId
  - hasSelectedProductId
  - hasSelectedProduct

[PersonaSelector] ❌ Failed to start demo: {error}
```

---

### 4. `apps/whitelabel-web/src/feature/demo/selector/DemoSelectorPage.tsx`

**Main demo selector page (3-step wizard)**

#### `handleStartDemo()`
```
[DemoSelectorPage] 🚀 handleStartDemo() called:
  - personaId
  - privyUserId
  - selectedProductId
  - visualizationType

[DemoSelectorPage] 📋 Generated Static Key:
  - privyUserId
  - productId
  - clientId
  - clientUserId (Static Key)
  - visualizationType
  - persona
  - environment

[DemoSelectorPage] 🔄 Calling createUser API...

[DemoSelectorPage] ✅ createUser API response:
  - {full API response}

[DemoSelectorPage] 🔄 Step 1: Calling setPersona()...

[DemoSelectorPage] 🔄 Step 2: Calling setEndUser()...

[DemoSelectorPage] 🔄 Step 3: Calling activateEarnAccount()...

[DemoSelectorPage] ✅ Demo started successfully - all state updates complete

[DemoSelectorPage] 🔀 Navigating to demo: {path}
```

**Errors:**
```
[DemoSelectorPage] ❌ Missing required context:
  - hasPrivyUserId
  - hasSelectedProductId
  - hasSelectedProduct
  - hasVisualizationType

[DemoSelectorPage] Failed to create demo: {error}
```

---

### 5. `apps/whitelabel-web/src/feature/demo/shared/DemoSettings.tsx`

**Settings panel for switching products/personas mid-demo**

#### `confirmProductChange()`
```
[DemoSettings] 🚀 confirmProductChange() called:
  - newProductId
  - previousProductId

[DemoSettings] 📋 API key check:
  - hasApiKey
  - apiKeyPrefix

[DemoSettings] 🔄 Calling selectProduct()...

[DemoSettings] 🔄 Reloading page to apply product change...
```

**Errors:**
```
[DemoSettings] ❌ API key not found for product: {productId}
```

#### `confirmPersonaChange()`
```
[DemoSettings] 🚀 confirmPersonaChange() called:
  - newPersona
  - previousPersona
  - visualizationType
  - userId

[DemoSettings] 🔄 Calling setPersona() before reload...

[DemoSettings] 🔄 Reloading page to apply persona change...
```

**Errors:**
```
[DemoSettings] ❌ Missing required data:
  - hasPersona
  - hasUserId
```

---

## Complete Demo Flow Trace

When a user clicks "Start Demo as Bob", you will see this sequence in the console:

### Step 1: Persona Selection Component
```
[PersonaSelector] 🚀 handleStartDemo() called
[PersonaSelector] 📋 Generated Static Key
[PersonaSelector] 🔄 Calling createUser API...
[PersonaSelector] ✅ createUser API response
```

### Step 2: State Updates (in order)
```
[PersonaSelector] 🔄 Step 1: Calling setPersona()...
  [demoStore] ✅ setPersona() called
  [demoStore] ✅ setPersona() state updated

[PersonaSelector] 🔄 Step 2: Calling setEndUser()...
  [demoStore] ✅ setEndUser() called
  [demoStore] ✅ setEndUser() state updated
```

### Step 3: Completion
```
[PersonaSelector] ✅ Demo user created - ready for onboarding flow
[PersonaSelector] 📢 Calling onDemoStarted() callback
```

### Step 4: Demo App Onboarding Redirect
```
[CreatorsDemoApp] User status check: { status: "pending_onboarding", endUserId: "...", hasEarnAccount: false }
[CreatorsDemoApp] User needs onboarding - redirecting to /onboarding
```

### Step 5: After Onboarding Completes
```
[CreatorsDemoApp] Onboarding completed
[demoStore] ✅ activateEarnAccount() called
[demoStore] ✅ activateEarnAccount() - hasEarnAccount set to true
[CreatorsDemoApp] Real balance fetched: { balance: "1000.00", currency: "USD" }
```

---

## How to Use This Logging

1. **Open Browser DevTools** → Console tab
2. **Click "Start Demo as Bob"**
3. **Watch the console** - you'll see the complete flow with all state changes
4. **Filter by component**: Use browser console filter (e.g., `PersonaSelector` or `demoStore`)
5. **Check for errors**: Look for ❌ indicators
6. **Verify state transitions**: Look for ✅ indicators and compare before/after values

### Example: Debugging State Not Tracking

If "Start Demo as Bob" doesn't work:

1. **Check if API was called:**
   - Look for `[PersonaSelector] 🔄 Calling createUser API...`
   - Look for `[PersonaSelector] ✅ createUser API response`

2. **Check if state was updated:**
   - Look for `[demoStore] ✅ setPersona() called`
   - Look for `[demoStore] ✅ setEndUser() called`
   - Look for `[demoStore] ✅ activateEarnAccount() called`

3. **Check for errors:**
   - Look for any ❌ log lines
   - Check if `previousEndUserId` is set when it shouldn't be (indicates stale state)

4. **Verify Static Key format:**
   - Look for `clientUserId` in logs - should be: `did:privy:{id}:gig-workers:bob`

---

## Next Steps

After adding this logging, the user can:
1. Test the demo flow
2. See exactly where state tracking fails
3. Identify if it's an API issue, state update issue, or persistence issue
4. Check localStorage in DevTools → Application → Local Storage → `proxify-demo-state`

The comprehensive logging will show the complete state mutation trace, making it easy to pinpoint where the flow breaks.
