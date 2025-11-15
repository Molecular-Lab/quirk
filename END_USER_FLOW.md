# End-User Flow - White-Label DeFi Yield Experience

**Version:** 1.0
**Date:** 2025-11-16
**Audience:** End-users of client applications (not product owners)

---

## 🎯 Overview

This document describes the **end-user experience** when using apps that integrate Proxify's white-label DeFi yield platform.

**End-User = Customer of the Product Owner**
- E-commerce platform: Seller with pending payout
- Streaming platform: Creator with monthly revenue
- Freelancer marketplace: Worker with escrow funds
- Gaming platform: Player with in-game balance
- Subscription SaaS: User with prepaid annual subscription

---

## 📱 Complete End-User Journey

### Example: Sarah (E-Commerce Seller)

Sarah sells handmade jewelry on "CraftHub" (e-commerce platform that uses Proxify).

---

### **STEP 1: Discovery**

```
┌──────────────────────────────────────────────────────────┐
│         CraftHub Dashboard (Seller View)                 │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  💰 Pending Payout: $500.00                              │
│  📅 Next Payout: 7 days                                  │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │ 💡 NEW: Earn While You Wait!                   │     │
│  │                                                │     │
│  │ Your $500 is sitting idle. Enable Smart Earn  │     │
│  │ to get 7.3% APY while waiting for payout.     │     │
│  │                                                │     │
│  │ Expected extra earnings: $0.70 over 7 days    │     │
│  │                                                │     │
│  │ [Enable Smart Earn]  [Learn More]             │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Sarah's thought:** "Free money? Why not!"

---

### **STEP 2: Opt-In & Consent**

```
┌──────────────────────────────────────────────────────────┐
│              Enable Smart Earn                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  How it works:                                           │
│  ✅ Your balance earns yield automatically               │
│  ✅ Powered by top DeFi protocols (AAVE, Curve)          │
│  ✅ Withdraw anytime, no lock-up                         │
│  ✅ FDIC-like protection via custodial wallet            │
│                                                          │
│  Your $500 balance will be converted to:                 │
│  • USDC (stablecoin, $1 = 1 USDC always)                 │
│  • Deployed to low-risk DeFi protocols                   │
│  • Earnings added to your balance daily                  │
│                                                          │
│  Risk Level: Low (70% AAVE, 20% Curve, 10% reserves)     │
│  Expected APY: 7.3%                                      │
│                                                          │
│  ⚠️ Crypto assets can fluctuate, but USDC is designed    │
│     to maintain $1 value. Past performance: 99.99%       │
│     stability since 2018.                                │
│                                                          │
│  [ ] I understand the risks and want to enable           │
│                                                          │
│  [Cancel]  [Enable Smart Earn]                           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Sarah clicks:** "Enable Smart Earn"

---

### **STEP 3: Initial Deposit (Automatic)**

```
┌──────────────────────────────────────────────────────────┐
│          Converting to Yield-Earning Balance             │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ⏳ Converting $500.00 → 500 USDC...                     │
│                                                          │
│  Step 1: Creating secure wallet        ✅               │
│  Step 2: Converting to USDC            ⏳ (30 sec)       │
│  Step 3: Deploying to DeFi protocols   ⏸️ (pending)      │
│                                                          │
│  [Progress bar: 66%]                                     │
│                                                          │
└──────────────────────────────────────────────────────────┘

⬇️ (After 30 seconds)

┌──────────────────────────────────────────────────────────┐
│                  ✅ Smart Earn Enabled!                   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Your $500 is now earning 7.3% APY                       │
│                                                          │
│  💰 Current Balance:  $500.00                            │
│  📈 Daily Earnings:   ~$0.10/day                         │
│  🎯 7-Day Projection: +$0.70                             │
│                                                          │
│  [View Details]  [Close]                                 │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Behind the scenes:**
1. CraftHub's Proxify SDK creates entry: `userId: sarah-123, amount: 500, entry_index: 1.0`
2. $500 converted to 500 USDC via existing balance (no on-ramp needed)
3. Added to CraftHub's custodial pool
4. Sarah's share: `balance: 500, entry_index: 1.0`

---

### **STEP 4: Watching Balance Grow**

**Day 1 (1 hour later):**

```
┌──────────────────────────────────────────────────────────┐
│         CraftHub Dashboard - Smart Earn Widget           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  💰 Smart Earn Balance                                   │
│                                                          │
│  $500.04                                                 │
│  +$0.04 earned today (+0.008%)                           │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │ Daily Earnings Chart                           │     │
│  │ [Small area chart showing +$0.04 growth]       │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  📊 Performance                                          │
│  • APY:           7.3%                                   │
│  • Daily Rate:    0.02%                                  │
│  • Total Earned:  $0.04                                  │
│  • Since:         1 hour ago                             │
│                                                          │
│  [Withdraw]  [Add More]  [Details]                       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Day 3:**

```
│  $500.30                                                 │
│  +$0.30 earned (+0.06%)                                  │
```

**Day 7 (Payout Day):**

```
│  $500.70                                                 │
│  +$0.70 earned (+0.14%)                                  │
```

**Behind the scenes:**
- Proxify backend updates index hourly: `current_index: 1.0 → 1.0014`
- Sarah's value = `(500 × 1.0014) / 1.0 = $500.70`
- No database changes to Sarah's record, just index grows

---

### **STEP 5: Payout/Withdrawal**

**Sarah decides to cash out on Day 7:**

```
┌──────────────────────────────────────────────────────────┐
│                  Request Withdrawal                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Available Balance: $500.70                              │
│                                                          │
│  Amount to withdraw:                                     │
│  ┌──────────────────────────────────────────────┐       │
│  │ $500.70                            [Max]     │       │
│  └──────────────────────────────────────────────┘       │
│                                                          │
│  Withdraw to:                                            │
│  ● Your CraftHub Balance (instant, free)                 │
│  ○ Bank Account (1-3 days, $0 fee)                       │
│  ○ Debit Card (instant, $2 fee)                          │
│                                                          │
│  Summary:                                                │
│  • Original deposit:  $500.00                            │
│  • Earnings:          +$0.70                             │
│  • Withdraw:          $500.70                            │
│  • Fees:              $0.00                              │
│  • You receive:       $500.70                            │
│                                                          │
│  [Cancel]  [Withdraw $500.70]                            │
│                                                          │
└──────────────────────────────────────────────────────────┘

⬇️ (After clicking Withdraw)

┌──────────────────────────────────────────────────────────┐
│              ✅ Withdrawal Successful!                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  $500.70 has been added to your CraftHub balance         │
│                                                          │
│  📊 Your Smart Earn Summary                              │
│  • Duration:        7 days                               │
│  • Total earned:    $0.70                                │
│  • Effective APY:   7.3%                                 │
│                                                          │
│  Want to keep earning? Your next payout can              │
│  automatically use Smart Earn.                           │
│                                                          │
│  [ ] Auto-enable Smart Earn for future payouts           │
│                                                          │
│  [Done]                                                  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Behind the scenes:**
1. CraftHub's SDK calls Proxify: `withdraw(userId: 'sarah-123', amount: 500.70)`
2. Proxify backend:
   - Calculates final value: `(500 × 1.0014) / 1.0 = 500.70`
   - Removes from pool: 500.70 USDC
   - Converts to USD if needed
   - Returns to CraftHub's balance system
3. Database: Delete Sarah's record or set balance to 0
4. Transaction logged for audit

---

### **STEP 6: Ongoing Use**

**Sarah's next sale (Week 2):**

```
┌──────────────────────────────────────────────────────────┐
│         CraftHub Dashboard                               │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  💰 Pending Payout: $300.00                              │
│  📅 Next Payout: 7 days                                  │
│                                                          │
│  ✅ Smart Earn is enabled (auto-earning)                 │
│                                                          │
│  Your $300 is already earning 7.3% APY                   │
│  Expected earnings: +$0.42 over 7 days                   │
│                                                          │
│  [View Dashboard]  [Settings]                            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Sarah checked the auto-enable box, so now it's automatic!**

---

## 🎮 Alternative Use Cases

### 1. **Streaming Creator (Monthly Revenue)**

**Alex (Twitch-like platform creator):**

```
Current Month Earnings: $1,200
Payout: End of month (20 days away)

Smart Earn Widget:
┌────────────────────────────────────┐
│ 💰 $1,200 earning 7.3% APY         │
│ +$4.80 projected this month        │
│                                    │
│ Daily: +$0.24                      │
│ [Details]                          │
└────────────────────────────────────┘
```

At month end: Alex gets $1,204.80 instead of $1,200

---

### 2. **Freelancer (Escrow Funds)**

**Maria (Upwork-like platform):**

```
Project: Website Design
Escrow: $3,000
Duration: 30 days

Client View:
┌────────────────────────────────────┐
│ Escrow Balance: $3,000             │
│ Smart Earn: Enabled                │
│ Project earns: +$18/month for you  │
│                                    │
│ At completion, you get $18 back    │
│ [Disable Smart Earn]               │
└────────────────────────────────────┘

Freelancer View:
┌────────────────────────────────────┐
│ Project: Website Design            │
│ Escrow: $3,000 (client's funds)    │
│                                    │
│ ✅ Client enabled Smart Earn       │
│ You'll receive bonus: +$9 at end   │
│ (50/50 split with client)          │
└────────────────────────────────────┘
```

**Both client and freelancer earn yield on escrow!**

---

### 3. **Gaming Platform (Idle Balance)**

**Jake (Web3 game player):**

```
Game Wallet Balance: 1,000 tokens ($100)
Last played: 5 days ago

Notification:
┌────────────────────────────────────┐
│ 🎮 Welcome back, Jake!             │
│                                    │
│ While you were away:               │
│ Your 1,000 tokens earned +5 tokens │
│ Worth: +$0.50                      │
│                                    │
│ New balance: 1,005 tokens ($100.50)│
│                                    │
│ [Play Now]  [Withdraw]             │
└────────────────────────────────────┘
```

**Jake's tokens grow even when not playing!**

---

### 4. **Subscription SaaS (Annual Billing)**

**Emily (SaaS annual subscriber):**

```
Annual Plan: $1,200 paid upfront
Platform uses Smart Earn on float

End of Year Email:
┌────────────────────────────────────┐
│ 🎉 Thanks for being a member!      │
│                                    │
│ Your $1,200 annual payment earned  │
│ $87.60 in our Smart Earn program.  │
│                                    │
│ We're applying $43.80 (50%) as a   │
│ credit to next year's renewal!     │
│                                    │
│ Your Year 2 price: $1,156.20       │
│                                    │
│ [Renew Now]  [Learn More]          │
└────────────────────────────────────┘
```

**Emily gets a discount funded by yield!**

---

## 📊 End-User Dashboard (Detailed View)

```
┌──────────────────────────────────────────────────────────────┐
│                    Smart Earn Dashboard                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  💰 Current Balance                                          │
│  ┌────────────────────────────────────────────────────┐     │
│  │  $500.70                                           │     │
│  │  +$0.70 total earned (+0.14%)                      │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  📈 Performance Chart (7 days)                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │  $501 ┤                                        ╱   │     │
│  │       │                                   ╱        │     │
│  │  $500 ┤─────────────────────────╱─────────        │     │
│  │       └──┬────┬────┬────┬────┬────┬────┬──        │     │
│  │         D1   D2   D3   D4   D5   D6   D7          │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  🎯 Yield Sources                                            │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Protocol    Allocation    APY      Earned         │     │
│  │  ────────────────────────────────────────────────  │     │
│  │  AAVE        70% ($350)    5.2%     $0.35          │     │
│  │  Curve       20% ($100)    8.1%     $0.20          │     │
│  │  Compound    10% ($50)     6.5%     $0.15          │     │
│  │  ────────────────────────────────────────────────  │     │
│  │  Total       100% ($500)   7.3%     $0.70          │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  📜 Transaction History                                      │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Date       Type        Amount      Balance        │     │
│  │  ────────────────────────────────────────────────  │     │
│  │  Nov 16     Deposit     +$500.00    $500.00        │     │
│  │  Nov 17     Yield       +$0.10      $500.10        │     │
│  │  Nov 18     Yield       +$0.10      $500.20        │     │
│  │  Nov 19     Yield       +$0.10      $500.30        │     │
│  │  Nov 20     Yield       +$0.10      $500.40        │     │
│  │  Nov 21     Yield       +$0.10      $500.50        │     │
│  │  Nov 22     Yield       +$0.10      $500.60        │     │
│  │  Nov 23     Yield       +$0.10      $500.70        │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ⚙️ Settings                                                 │
│  ┌────────────────────────────────────────────────────┐     │
│  │  [✓] Auto-enable Smart Earn                        │     │
│  │  [✓] Daily balance notifications                   │     │
│  │  [ ] Auto-compound earnings (reinvest)             │     │
│  │  Risk level: Low ▼                                 │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  [Withdraw]  [Add Funds]  [Export CSV]                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔔 Notifications & Alerts

### Push Notifications

**Daily Earnings Update:**
```
💰 Smart Earn Update
Your balance grew by $0.10 today
New balance: $500.40 (+$0.40 total)
[View Dashboard]
```

**Weekly Summary:**
```
📊 Weekly Smart Earn Report
Week ending Nov 23:
• Earned: $0.70
• APY: 7.3%
• Balance: $500.70
[See Details]
```

**Withdrawal Complete:**
```
✅ Withdrawal Successful
$500.70 added to your account
Total earned: +$0.70
[View Receipt]
```

---

## 🔐 Security & Trust Elements

### Trust Indicators Shown to End-Users

```
┌──────────────────────────────────────────────────────┐
│  🔒 Your Money is Protected                          │
│                                                      │
│  ✅ Custodial wallet with MPC security (Privy)       │
│  ✅ Funds deployed to audited DeFi protocols          │
│  ✅ Real-time monitoring & risk controls              │
│  ✅ Withdraw anytime, no lock-up                      │
│  ✅ 99.99% USDC price stability since 2018            │
│                                                      │
│  [Learn More About Security]                         │
└──────────────────────────────────────────────────────┘
```

---

## ❓ End-User FAQ

**Q: Is my money safe?**
A: Yes! Your funds are held in a secure custodial wallet protected by Privy's MPC technology (same security used by banks). Funds are deployed to top-tier DeFi protocols like AAVE and Curve, which have been audited and secured billions of dollars.

**Q: Can I lose money?**
A: USDC (the stablecoin we use) is designed to always be worth $1. Historical stability: 99.99% since 2018. The low-risk DeFi protocols we use have never had a security breach.

**Q: How is 7.3% APY possible?**
A: We deploy your funds to DeFi lending protocols (like AAVE) where borrowers pay interest. That interest is passed to you (minus our small fee).

**Q: Can I withdraw anytime?**
A: Yes! No lock-up period. Withdrawals are instant to your app balance, or 1-3 days to your bank account.

**Q: What's the catch?**
A: No catch! The app you're using (e.g., CraftHub) takes a small % of the yield to cover costs, but you still earn significantly more than a traditional savings account (0.01% APY).

**Q: What if the DeFi protocol gets hacked?**
A: We only use top-tier protocols with perfect security records. Additionally, we have insurance coverage and security monitoring. In the unlikely event of a loss, we have recovery mechanisms.

---

## 📱 Mobile App Experience

### Home Screen Widget

```
┌─────────────────────────────┐
│   💰 Smart Earn             │
│                             │
│   $500.70                   │
│   +$0.70 (7 days)           │
│                             │
│   [Tap to view details]     │
└─────────────────────────────┘
```

### Lock Screen Notification

```
📈 Your balance grew!
Smart Earn: +$0.10 today
Total: $500.40
```

---

## 🎯 Key Takeaways for End-Users

1. **Set It & Forget It:** Enable once, earn automatically
2. **No Lock-Up:** Withdraw anytime without penalty
3. **Low Risk:** USDC stablecoin + audited DeFi protocols
4. **Better Than Banks:** 7.3% APY vs 0.01% savings account
5. **Transparent:** See exactly where your money is deployed
6. **Free Money:** Why let your balance sit idle?

---

**Last Updated:** 2025-11-16
**Version:** 1.0 - End-User Experience Guide
**Companion Doc:** See `PRODUCT_OWNER_FLOW.md` for product owner perspective
