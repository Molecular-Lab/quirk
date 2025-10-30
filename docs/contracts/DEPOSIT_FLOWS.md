# LAAC Deposit Flows - Custodial vs Non-Custodial

## Overview

The LAAC system supports **3 deposit patterns** to handle different custody models. All deposits use **ERC20 stablecoins only** (USDC, USDT, DAI) - no native ETH support.

---

## The 3 Deposit Functions

### 1. `deposit(clientId, userId, token, amount, from)`
**For: Oracle/Controller Custody**

```solidity
function deposit(
    bytes32 clientId,
    bytes32 userId,
    address token,
    uint256 amount,
    address from  // Where to pull tokens from
) external
```

**Use Case:** Oracle/controller holds user funds temporarily

**Flow:**
```
User sends USDC to Oracle's hot wallet
    ↓
Oracle accumulates deposits
    ↓
Oracle calls: deposit(clientId, userId, USDC, amount, oracleAddress)
    ↓
Contract pulls from oracle's address
    ↓
User balance updated in LAAC
```

**Example:**
```typescript
// User sends $100 USDC to oracle
// Oracle batches and deposits
await laac.deposit(
  clientId,
  userId,
  USDC_ADDRESS,
  ethers.parseUnits("100", 6),
  ORACLE_WALLET_ADDRESS  // Oracle's address
);
```

---

### 2. `depositFrom(clientId, userId, token, amount)`
**For: Custodial (Privy) & Non-Custodial (MetaMask)**

```solidity
function depositFrom(
    bytes32 clientId,
    bytes32 userId,
    address token,
    uint256 amount
    // No 'from' - uses msg.sender automatically
) external
```

**THIS IS THE MAIN FUNCTION YOU NEED!**

Supports **BOTH** custody models:

#### 2a. Custodial Model (Privy/Turnkey/Fireblocks)

**Setup:**
```
Client (Bitkub) → Privy SDK
    ↓
Privy manages user wallets
    ↓
User: alice@email.com
Privy creates: 0xABC... (custodial wallet)
    ↓
Bitkub holds private key via Privy
```

**Deposit Flow:**
```
1. User clicks "Deposit $100" in Bitkub app

2. Bitkub UI shows confirmation

3. User approves

4. Bitkub backend calls Privy SDK:
   privy.signTransaction({
     from: aliceWallet,  // 0xABC...
     to: USDC_ADDRESS,
     data: approve(LAAC, 100 USDC)
   })

5. Bitkub calls LAAC:
   laac.depositFrom(
     bitkubClientId,
     keccak256("alice@email.com"),
     USDC,
     100e6
   )

6. msg.sender = 0xABC... (Alice's custodial wallet)

7. Contract pulls USDC from msg.sender
```

**Code Example (Bitkub Backend):**
```typescript
import { PrivyClient } from '@privy-io/server-auth';

const privy = new PrivyClient({
  appId: process.env.PRIVY_APP_ID,
  appSecret: process.env.PRIVY_APP_SECRET,
});

async function depositForUser(userEmail: string, amount: string) {
  // 1. Get user's custodial wallet from Privy
  const user = await privy.getUserByEmail(userEmail);
  const userWallet = user.wallet.address;

  // 2. Approve LAAC to spend USDC (via Privy)
  await privy.signAndSendTransaction(user.id, {
    to: USDC_ADDRESS,
    data: USDC.interface.encodeFunctionData('approve', [
      LAAC_ADDRESS,
      parseUnits(amount, 6)
    ])
  });

  // 3. Call depositFrom (via Privy)
  const tx = await privy.signAndSendTransaction(user.id, {
    to: LAAC_ADDRESS,
    data: LAAC.interface.encodeFunctionData('depositFrom', [
      BITKUB_CLIENT_ID,
      ethers.keccak256(ethers.toUtf8Bytes(userEmail)),
      USDC_ADDRESS,
      parseUnits(amount, 6)
    ])
  });

  return tx.hash;
}
```

#### 2b. Non-Custodial Model (MetaMask/WalletConnect)

**Setup:**
```
User owns private key
    ↓
User connects MetaMask to Bitkub app
    ↓
User: 0xDEF...
    ↓
User controls wallet
```

**Deposit Flow:**
```
1. User connects MetaMask to Bitkub app

2. User clicks "Deposit $100"

3. Bitkub frontend calls MetaMask:
   // Approve
   await usdcContract.approve(LAAC_ADDRESS, 100e6)

4. Bitkub frontend calls LAAC:
   await laacContract.depositFrom(
     bitkubClientId,
     userId,
     USDC_ADDRESS,
     100e6
   )

5. msg.sender = user's MetaMask address

6. Contract pulls USDC from msg.sender
```

**Code Example (Frontend - React):**
```typescript
import { useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';

function DepositButton({ amount }: { amount: string }) {
  const { wallets } = useWallets();

  async function handleDeposit() {
    const wallet = wallets[0]; // User's connected wallet
    const provider = await wallet.getEthersProvider();
    const signer = await provider.getSigner();

    // 1. Approve USDC
    const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
    const approveTx = await usdc.approve(
      LAAC_ADDRESS,
      ethers.parseUnits(amount, 6)
    );
    await approveTx.wait();

    // 2. Deposit
    const laac = new ethers.Contract(LAAC_ADDRESS, LAAC_ABI, signer);
    const depositTx = await laac.depositFrom(
      BITKUB_CLIENT_ID,
      ethers.keccak256(ethers.toUtf8Bytes(userEmail)),
      USDC_ADDRESS,
      ethers.parseUnits(amount, 6)
    );
    await depositTx.wait();

    console.log('Deposit successful!');
  }

  return <button onClick={handleDeposit}>Deposit ${amount}</button>;
}
```

---

## Comparison Table

| Feature | `deposit(from)` | `depositFrom()` Custodial | `depositFrom()` Non-Custodial |
|---------|----------------|---------------------------|-------------------------------|
| **Who calls** | Oracle/Controller | Client via Privy | User directly |
| **Who holds keys** | Oracle | Client (Privy) | User (MetaMask) |
| **msg.sender** | Oracle address | User's custodial wallet | User's wallet |
| **Tokens from** | `from` parameter | `msg.sender` (custodial) | `msg.sender` (user) |
| **Approval needed** | Yes (to LAAC) | Yes (via Privy SDK) | Yes (via MetaMask) |
| **Use case** | Batched deposits | Bitkub/Privy users | Power users, DeFi natives |
| **User experience** | Email/password | Email/social login | Connect wallet |
| **Gas paid by** | Oracle | Client (Bitkub) | User |

---

## Which Function Should You Use?

### For Bitkub (B2B Client):

**Recommended: `depositFrom()` with Privy**

**Reasons:**
1. ✅ Users don't need MetaMask
2. ✅ Email/social login (better UX)
3. ✅ You control gas (sponsor transactions)
4. ✅ Works for both custodial and non-custodial
5. ✅ One function supports both models

**Implementation:**
```typescript
// Bitkub backend API endpoint
app.post('/api/deposit', async (req, res) => {
  const { userEmail, amount } = req.body;

  // Privy handles wallet management
  const tx = await depositForUser(userEmail, amount);

  res.json({ success: true, txHash: tx });
});
```

### For Oracle Service:

**Use: `deposit(from)` for batch operations**

**Reasons:**
1. ✅ Collect deposits off-chain first
2. ✅ Batch multiple users in one tx
3. ✅ Lower total gas costs
4. ✅ More control over timing

**Implementation:**
```typescript
// Oracle batches deposits every hour
async function batchDeposits() {
  const pending = await db.getPendingDeposits();

  for (const deposit of pending) {
    await laac.deposit(
      deposit.clientId,
      deposit.userId,
      deposit.token,
      deposit.amount,
      ORACLE_WALLET  // Oracle holds funds temporarily
    );
  }
}
```

---

## Security Considerations

### Approvals

**All deposit functions require ERC20 approval:**

```solidity
// User/Oracle must approve LAAC first
USDC.approve(LAAC_ADDRESS, amount);

// Then deposit
LAAC.depositFrom(...);  // or deposit(...)
```

**Why?** ERC20 tokens cannot be "pushed" to contracts. Contracts must "pull" them.

### Access Control

**Both deposit functions check:**
1. ✅ Client must be registered (`onlyActiveClient` modifier)
2. ✅ Client must be active (not suspended)
3. ✅ Token must be whitelisted
4. ✅ Amount > 0
5. ✅ ReentrancyGuard protection

### Custodial Wallet Security (Privy)

**Bitkub must secure:**
1. Privy API keys (server-side only)
2. User authentication (email verification, 2FA)
3. Transaction limits (daily/per-tx caps)
4. Withdrawal verification (email/SMS confirmation)

---

## Migration Path

### Phase 1: Start with Custodial (Privy)
```
All Bitkub users → Privy wallets → depositFrom()
- Easiest onboarding
- Best UX for non-crypto users
- Bitkub controls gas
```

### Phase 2: Add Non-Custodial Support
```
Power users can connect MetaMask → depositFrom()
- Same function!
- No code changes needed
- Just different wallet provider
```

### Phase 3: Oracle Batching (Optional)
```
For high-volume scenarios → deposit(from)
- Only if needed for gas optimization
- More complex implementation
- Requires oracle infrastructure
```

---

## Testing Scenarios

### Test 1: Custodial Deposit (Privy)
```typescript
// Setup
const privy = new PrivyClient({ ... });
const user = await privy.createUser({ email: 'test@example.com' });

// Approve
await privy.signAndSendTransaction(user.id, {
  to: USDC_ADDRESS,
  data: encodeApprove(LAAC_ADDRESS, 100e6)
});

// Deposit
await privy.signAndSendTransaction(user.id, {
  to: LAAC_ADDRESS,
  data: encodeDepositFrom(clientId, userId, USDC, 100e6)
});

// Verify
const balance = await laac.getAccount(clientId, userId, USDC);
expect(balance).to.equal(100e6);
```

### Test 2: Non-Custodial Deposit (Hardhat)
```typescript
// Setup
const [user] = await ethers.getSigners();
const usdc = await ethers.getContractAt('IERC20', USDC_ADDRESS);
const laac = await ethers.getContractAt('LAAC', LAAC_ADDRESS);

// Approve
await usdc.connect(user).approve(LAAC_ADDRESS, 100e6);

// Deposit
await laac.connect(user).depositFrom(
  clientId,
  userId,
  USDC_ADDRESS,
  100e6
);

// Verify
const balance = await laac.getAccount(clientId, userId, USDC_ADDRESS);
expect(balance.balance).to.equal(100e6);
```

### Test 3: Oracle Batch Deposit
```typescript
// Setup
const [oracle] = await ethers.getSigners();
const usdc = await ethers.getContractAt('IERC20', USDC_ADDRESS);

// Oracle receives user funds
await usdc.transfer(oracle.address, 1000e6);

// Oracle approves LAAC
await usdc.connect(oracle).approve(LAAC_ADDRESS, 1000e6);

// Deposit for multiple users
for (const user of users) {
  await laac.connect(oracle).deposit(
    clientId,
    user.id,
    USDC_ADDRESS,
    user.amount,
    oracle.address  // Pull from oracle
  );
}
```

---

## Summary

**For Bitkub → Use `depositFrom()` with Privy**
- Supports both custodial and non-custodial
- Best user experience
- One function, two models
- Easy migration path

**For Oracle → Use `deposit(from)` for batching**
- When you need to batch deposits
- Lower gas costs at scale
- More complex infrastructure

**Key Insight:** The `depositFrom()` function is your primary deposit method. It handles both Privy (custodial) and MetaMask (non-custodial) seamlessly. Start with this! 🚀
