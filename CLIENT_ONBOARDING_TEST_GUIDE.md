# Client Onboarding - Quick Test Guide

## 🚀 How to Test the Implementation

### Prerequisites
- Server running (`pnpm dev`)
- Database configured
- Privy authentication working

---

## 📝 Test Scenario 1: New User Onboarding

### Steps:
1. **Visit Landing Page**
   - Navigate to `http://localhost:PORT/`
   - Should see the landing page

2. **Click "Get Started"**
   - Should redirect to `/get-started`
   - Privy login modal should appear

3. **Sign In with Privy**
   - Use email, Google, or Web3 wallet
   - Wait for authentication

4. **Auto-Redirect to Onboarding**
   - Should redirect to `/onboarding`
   - Should see "Create Your Product" header
   - Step indicator shows Step 1 active

5. **Complete Step 1: Company Info**
   - Fill in:
     - Company Name: "Test Corp"
     - Business Type: "FinTech"
     - Industry: "Technology"
     - Description: (optional)
     - Website: "https://example.com" (optional)
     - **Select Customer Tier**: "1,000-10,000 customers"
     - Estimated AUM: "1000000"
   - Click "Next: Strategy Configuration →"
   - Should move to Step 2

6. **Complete Step 2: Strategy Ranking**
   - Drag strategy cards to reorder
   - Try different rankings
   - Select risk tolerance: "Moderate"
   - Click "Next: Banking Setup →"
   - Should move to Step 3

7. **Complete Step 3: Banking (Optional)**
   - **Option A: Skip**
     - Click "Skip for Now"
     - Should create product and redirect to dashboard
   - **Option B: Add Banking**
     - Fill in:
       - Currency: "USD"
       - Bank Name: "Chase Bank"
       - Account Name: "Test Account"
       - Account Number: "123456789"
       - SWIFT Code: "CHASUS33" (optional)
     - Click "Add Account"
     - Account should appear in list
     - Click "Complete Setup →"
     - Should create product and redirect to dashboard

8. **Verify Dashboard**
   - Should land on `/dashboard`
   - New organization should be in UserStore
   - Product ID should be set

---

## 📝 Test Scenario 2: Returning User

### Steps:
1. **Already Authenticated User**
   - User who completed onboarding before
   - Has at least one product

2. **Click "Get Started" Again**
   - Navigate to landing page
   - Click "Get Started"

3. **Auto-Redirect to Dashboard**
   - Should redirect to `/get-started`
   - Should immediately redirect to `/dashboard`
   - Should NOT see onboarding form

---

## 📝 Test Scenario 3: Form Persistence

### Steps:
1. **Start Onboarding**
   - Complete Step 1
   - Fill some fields in Step 2

2. **Refresh Page**
   - Press F5 or refresh browser
   - Should stay on `/onboarding`
   - Should still be on Step 2
   - **All previous data should be preserved**

3. **Complete Onboarding**
   - Finish remaining steps
   - Data should be submitted successfully

---

## 📝 Test Scenario 4: Validation

### Test Invalid Data:
1. **Step 1 Validation**
   - Leave Company Name empty
   - Try to click Next
   - Should show error: "Company name is required"
   
2. **Step 1 Invalid URL**
   - Enter "not-a-url" in Website field
   - Try to click Next
   - Should show error: "Please enter a valid URL"

3. **Step 1 Invalid AUM**
   - Enter letters in AUM field
   - Should only allow numbers

4. **Step 3 Banking**
   - Try to add account without filling required fields
   - Should show error: "Please fill in all required fields"

---

## 📝 Test Scenario 5: Navigation

### Test Back/Next Buttons:
1. **Complete Step 1**
   - Click Next to Step 2

2. **Go Back**
   - Click "← Back" button
   - Should return to Step 1
   - **Data should be preserved**

3. **Go Forward Again**
   - Click Next to Step 2
   - Data should still be there

4. **Complete to Step 3**
   - From Step 2, click Next
   - Should go to Step 3

5. **Navigate Back from Step 3**
   - Click "← Back"
   - Should go to Step 2
   - Strategy rankings should be preserved

---

## 🎨 Test Scenario 6: UI/UX

### Visual Tests:
1. **Step Indicator**
   - Step 1: Should show checkmark after completion
   - Step 2: Should highlight when active
   - Step 3: Should be grayed out until Step 2 complete

2. **Drag & Drop (Step 2)**
   - Drag strategy card up
   - Should reorder smoothly
   - Rank numbers should update
   - Drop card - should save new order

3. **Mobile Responsiveness**
   - Test on mobile device or resize window
   - Forms should be readable
   - Buttons should be touchable
   - Drag & drop should work on touch

4. **Loading States**
   - Click "Complete Setup"
   - Button should show "Creating Product..."
   - Button should be disabled

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot find module"
**Solution:** Run `pnpm install` to ensure all dependencies are installed

### Issue 2: Privy modal doesn't appear
**Solution:** Check PRIVY_APP_ID in environment variables

### Issue 3: API calls fail
**Solution:** Ensure backend is running and VITE_API_BASE_URL is correct

### Issue 4: Redirect loops
**Solution:** Clear localStorage and try again
```javascript
// In browser console:
localStorage.removeItem('proxify-onboarding')
localStorage.removeItem('proxify-user-credentials')
```

### Issue 5: Drag & drop doesn't work
**Solution:** Ensure @dnd-kit packages are installed:
```bash
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities --filter @proxify/whitelabel-web
```

---

## ✅ Checklist for QA

### Functional Tests:
- [ ] New user can complete full onboarding
- [ ] Returning user skips to dashboard
- [ ] Form data persists on refresh
- [ ] All validation works correctly
- [ ] Banking skip functionality works
- [ ] Banking add/remove accounts works
- [ ] Product created successfully
- [ ] Redirect to dashboard after completion
- [ ] UserStore updated with new organization

### UI Tests:
- [ ] Step indicator updates correctly
- [ ] Forms are readable and well-formatted
- [ ] Buttons have hover states
- [ ] Loading states show correctly
- [ ] Error messages display properly
- [ ] Cards have proper spacing
- [ ] Drag & drop is smooth

### Responsive Tests:
- [ ] Works on desktop (1920x1080)
- [ ] Works on tablet (768x1024)
- [ ] Works on mobile (375x667)
- [ ] Touch interactions work

### Edge Cases:
- [ ] Network timeout during API call
- [ ] Invalid Privy session
- [ ] Duplicate product creation attempt
- [ ] Special characters in company name
- [ ] Very long company descriptions
- [ ] Multiple bank accounts (10+)

---

## 📊 Expected Behavior Summary

| Action | Expected Result |
|--------|----------------|
| Click "Get Started" (new user) | Privy login → Onboarding |
| Click "Get Started" (existing user) | Privy login → Dashboard |
| Complete Step 1 | Advance to Step 2 |
| Drag strategy card | Reorder with animation |
| Click "Skip for Now" | Create product, go to dashboard |
| Add bank account | Show in list below form |
| Remove bank account | Disappear from list |
| Click "Complete Setup" | API calls → Dashboard redirect |
| Refresh during onboarding | Stay on same step, data preserved |

---

## 🔍 Debug Tools

### Check Onboarding State:
```javascript
// In browser console:
console.log(JSON.parse(localStorage.getItem('proxify-onboarding')))
```

### Check User Store:
```javascript
// In browser console:
console.log(JSON.parse(localStorage.getItem('proxify-user-credentials')))
```

### Check Current Route:
```javascript
// In browser console:
console.log(window.location.pathname)
```

### Monitor API Calls:
- Open DevTools → Network tab
- Filter by "Fetch/XHR"
- Watch for:
  - POST /api/v1/clients
  - POST /api/v1/products/{id}/strategies
  - POST /api/v1/clients/product/{id}/bank-accounts

---

## 📸 Screenshots to Capture

For documentation:
1. Landing page with "Get Started" button
2. Privy login modal
3. Step 1: Company Info form (empty)
4. Step 1: Customer Tier selection
5. Step 2: Strategy ranking (before drag)
6. Step 2: Strategy ranking (after drag)
7. Step 3: Banking form (empty)
8. Step 3: Banking form with added account
9. Dashboard after completion

---

## 🎯 Success Metrics

The implementation is successful if:
- ✅ 100% of new users can complete onboarding
- ✅ 0 errors during happy path
- ✅ Form data always persists
- ✅ Drag & drop works smoothly
- ✅ Mobile experience is good
- ✅ API integration works correctly
- ✅ Navigation is intuitive

---

**Test Guide Version:** 1.0
**Created:** December 3, 2025
**Status:** Ready for QA Testing
