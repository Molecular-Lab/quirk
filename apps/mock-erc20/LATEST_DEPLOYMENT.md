# Latest USDQ Deployment

## 📝 Contract Details

**Contract Address:** `0x1d02848c34ed2155613dd5cd26ce20a601b9a489`  
**Network:** Sepolia Testnet (Chain ID: 11155111)  
**Deployer/Owner:** `0x41649a1F8B2499e2F7884184D062639CEF9d0601`  
**Block:** 9723301  
**Transaction:** `0xfda54dc1e97a7a3197d0646e95be8d3b2f375299de1700a683966c5e84b99909`

## 📋 Token Info

- **Name:** Mock USD Quirk Coin
- **Symbol:** USDC
- **Decimals:** 6
- **Initial Supply:** 1,000,000 USDC (minted to deployer)

## 🔍 Verification

✅ **Verified on Etherscan:**  
https://sepolia.etherscan.io/address/0x1d02848c34ed2155613dd5cd26ce20a601b9a489#code

✅ **Verified on Blockscout:**  
https://eth-sepolia.blockscout.com/address/0x1d02848c34ed2155613dd5cd26ce20a601b9a489#code

## 🔑 Important Notes

1. **No Constructor Arguments:** The USDQ contract has a parameterless constructor. All values (name, symbol, decimals) are hardcoded in the contract.

2. **Minting Permission:** Only the contract owner (`0x41649a1F8B2499e2F7884184D062639CEF9d0601`) can mint new tokens.

3. **Environment Configuration:** Make sure to update your `.env` file:
   ```bash
   MOCK_USDC_ADDRESS=0x1d02848c34ed2155613dd5cd26ce20a601b9a489
   DEPLOYER_PRIVATE_KEY=0xb775f014fdf2a080db021f4640456b75d9e51ee81fe9712084abc13663f9c399
   ```

4. **Restart Required:** After updating `.env`, restart the B2B API server to load the new configuration.

## 🧪 Testing

To test minting from the command line:

```bash
cd apps/mock-erc20
pnpm hardhat run scripts/mint-to-custodial.ts --network sepolia
```

Or use the B2B API batch complete deposits endpoint after restarting the server.

## 📅 Deployment History

- **Previous:** `0x390518374c84c3abca46e9da0f9f0e6c5aee10e0` (Block 9722821)
- **Current:** `0x1d02848c34ed2155613dd5cd26ce20a601b9a489` (Block 9723301) ✅
