# Demo Flow Testing Plan

## Prerequisites
- [ ] Database is running (`make db-start`)
- [ ] Backend API is running (`pnpm dev-api` or similar)
- [ ] Frontend is running (`pnpm dev-web` or similar)
- [ ] You have at least one product created in the dashboard
- [ ] That product has an API key generated

## Test Scenarios

### Test 1: Fresh Demo Start (Happy Path)

**Steps:**
1. Navigate to `/demo` (Demo Selector Page)
2. Select platform (e.g., "Gig Workers Platform")
3. Select your product from dropdown
4. Select environment (Sandbox recommended)
5. Click "Continue"
6. Select persona (Bob or Alice)
7. Click "Start Demo as {name}"

**Expected Result:**
- ✅ Should generate Static Key in format: `did:privy:{id}:gig-workers:bob`
- ✅ Should call `createUser` API with the Static Key
- ✅ Should navigate to `/demo/gig-workers`
- ✅ Should show the demo app with persona's initial balance
- ✅ Console should show:
  ```
  [DemoSelectorPage] Creating demo user
  [DemoSelectorPage] Demo user result: { id: "...", ... }
  [demoStore] Setting persona with Static Key
  ```

**What to Check:**
- Open browser DevTools → Console
- Check for any errors
- Verify the Static Key format in console logs
- Check that `endUserId` is set in demoStore (use React DevTools)

---

### Test 2: Switch Persona Mid-Demo

**Steps:**
1. Complete Test 1 to start a demo
2. Click the Settings button (bottom-right floating button)
3. Select the OTHER persona (if you were Bob, select Alice)
4. Confirm the switch
5. Page reloads

**Expected Result:**
- ✅ Should generate NEW Static Key with different persona
- ✅ Should call `createUser` API again with NEW Static Key
- ✅ Should show DIFFERENT balance (Bob: $1,000, Alice: $5,000)
- ✅ Old persona's `endUserId` should be cleared
- ✅ New persona's `endUserId` should be set

**What to Check:**
- Console logs show persona switch
- Balance changes to reflect new persona
- Static Key in logs has correct persona suffix

---

### Test 3: Switch Product Mid-Demo

**Steps:**
1. Complete Test 1 to start a demo
2. Click Settings button
3. Select a DIFFERENT product
4. Confirm the switch
5. Page reloads

**Expected Result:**
- ✅ Should clear old persona state
- ✅ Should show PersonaSelector again (no persona selected)
- ✅ User must re-select persona
- ✅ New Static Key will be generated with NEW product context

**What to Check:**
- `demoStore.resetPersona()` was called (check console)
- PersonaSelector shows up after reload
- No stale `endUserId` from previous product

---

### Test 4: Switch Platform (Visualization Type)

**Steps:**
1. Start demo in "Gig Workers" platform
2. Manually navigate to `/demo` (or `/demo/ecommerce`)
3. System should detect platform mismatch

**Expected Result:**
- ✅ Should show PersonaSelector OR auto-redirect to correct platform
- ✅ Platform-specific UI should render correctly

**What to Check:**
- No crashes
- Static Key still has correct `visualizationType`

---

### Test 5: Persistence After Refresh

**Steps:**
1. Complete Test 1 to start a demo
2. Refresh the page (F5 or Cmd+R)

**Expected Result:**
- ✅ Demo state persists (from Zustand localStorage)
- ✅ Same persona, same balance
- ✅ Same `endUserId`
- ✅ No API call on refresh (state loaded from localStorage)

**What to Check:**
- Check localStorage in DevTools → Application → Local Storage
- Look for keys: `proxify-demo-state`, `proxify-demo-product-state`
- Verify data looks correct

---

### Test 6: Error Handling - No API Key

**Steps:**
1. Navigate to `/demo`
2. Select platform
3. Try to select a product WITHOUT an API key

**Expected Result:**
- ✅ Should show error dialog: "API Key Not Found"
- ✅ Should NOT allow continuing to persona selection
- ✅ Dialog should suggest going to Dashboard → API Testing

---

### Test 7: Error Handling - API Failure

**Steps:**
1. Stop the backend API server
2. Try to start a demo (complete persona selection)

**Expected Result:**
- ✅ Should show error message
- ✅ Should NOT navigate to demo app
- ✅ Error should be user-friendly

---

## Static Key Validation

After each test, verify the Static Key format in console logs:

**Correct Format:**
```
did:privy:abc123def456:gig-workers:bob
         ↑               ↑            ↑
    privyUserId    platform      persona
```

**Verification Queries (Database):**
```sql
-- Check that end_users are created with Static Key as client_user_id
SELECT id, client_user_id, created_at
FROM end_users
WHERE client_user_id LIKE '%:gig-workers:bob'
ORDER BY created_at DESC
LIMIT 5;

-- Verify each persona has separate end_user
SELECT client_user_id, COUNT(*)
FROM end_users
WHERE client_user_id LIKE '%:gig-workers:%'
GROUP BY client_user_id;
```

**Expected:**
- Each unique `{privyUserId}:{platform}:{persona}` combination has ONE `end_user`
- Bob and Alice have DIFFERENT `end_user.id` values
- Same user can have multiple personas (Bob for gig-workers, Alice for ecommerce, etc.)

---

## Common Issues to Watch For

### Issue 1: Stale `endUserId` after persona switch
**Symptom:** Old persona's balance shows after switching
**Root Cause:** `setPersona()` didn't reset state properly
**Fix:** Already fixed - `setPersona()` now resets `endUserId`, `hasEarnAccount`, `deposits`

### Issue 2: `visualizationType` mismatch
**Symptom:** Static Key has wrong platform
**Root Cause:** `selectedVisualizationType` not tracked properly
**Fix:** Already fixed - now tracked in `demoStore`

### Issue 3: State leakage between products
**Symptom:** Switching products keeps old persona
**Root Cause:** Product change didn't reset demo state
**Fix:** Already fixed - `selectProduct()` now calls `resetPersona()`

---

## Success Criteria

All tests pass with:
- ✅ No TypeScript errors (already verified)
- ✅ No console errors during demo flow
- ✅ Static Keys generated correctly
- ✅ Each persona gets separate `end_user` in database
- ✅ State persists after refresh
- ✅ State resets properly when switching personas/products

---

## Running the Tests

1. Start services:
   ```bash
   make db-start
   pnpm dev
   ```

2. Open browser to `http://localhost:3000/demo`

3. Open DevTools → Console

4. Go through each test scenario

5. Check database after tests:
   ```bash
   psql $DATABASE_URL
   \dt  # list tables (verify demo_user_mappings is gone)
   SELECT * FROM end_users ORDER BY created_at DESC LIMIT 10;
   ```

---

## Notes

- The `demo_user_mapping` table is **completely removed**
- All demo logic now uses the **existing `end_users` table**
- Static Keys are the **only identifier** - no separate mapping needed
- This is simpler, more scalable, and fixes all the Zustand state bugs
