import { expect } from "chai";
import { network } from "hardhat";
import type { LAAC, ClientRegistry } from "../typechain-types.js";
import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import type { MockERC20 } from "./helpers/MockERC20.js";

const { ethers } = await network.connect();

/**
 * Unit Conversion Bug Fix Tests
 *
 * Critical Bug: LAAC contract was mixing token units with balance units
 *
 * Background:
 * - account.balance stores "balance units" (weighted by entryIndex)
 * - Withdrawal calculations use "token units" (current value)
 * - OLD CODE: account.balance -= amount (mixing units!) ❌
 * - NEW CODE: Convert token units to balance units before subtracting ✅
 *
 * Test Coverage:
 * 1. Partial withdrawal with yield (the $900 example)
 * 2. Multiple deposits with different indices
 * 3. Full withdrawal edge case
 * 4. Small deposit then huge deposit (revenue protection)
 * 5. Immediate withdrawal (no yield)
 */

describe("LAAC - Unit Conversion Fix", function () {
  let laac: LAAC;
  let clientRegistry: ClientRegistry;
  let mockUSDC: MockERC20;
  let admin: SignerWithAddress;
  let controller: SignerWithAddress;
  let oracle: SignerWithAddress;
  let user1: SignerWithAddress;

  const clientId1 = ethers.keccak256(ethers.toUtf8Bytes("bitkub"));
  const userId1 = ethers.keccak256(ethers.toUtf8Bytes("alice@email.com"));

  const DECIMALS = 6;
  const parseUSDC = (amount: string) => ethers.parseUnits(amount, DECIMALS);
  const parseIndex = (amount: string) => ethers.parseEther(amount);

  beforeEach(async function () {
    [admin, controller, oracle, user1] = await ethers.getSigners();

    // Deploy Mock USDC
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockUSDC = await MockERC20Factory.deploy("USD Coin", "USDC", DECIMALS);
    await mockUSDC.waitForDeployment();

    // Mint USDC to user
    await mockUSDC.mint(user1.address, parseUSDC("200000000")); // 200M for large deposit tests

    // Deploy ClientRegistry
    const ClientRegistry = await ethers.getContractFactory("ClientRegistry");
    clientRegistry = await ClientRegistry.deploy(admin.address, oracle.address);
    await clientRegistry.waitForDeployment();

    // Deploy LAAC
    const LAAC = await ethers.getContractFactory("LAAC");
    laac = await LAAC.deploy(controller.address, await clientRegistry.getAddress());
    await laac.waitForDeployment();

    // Register client with 5% client revenue share, 20% service fee
    await clientRegistry.connect(oracle).registerClient(
      clientId1,
      user1.address,
      "Bitkub",
      500,   // 5% client revenue share (of service fee)
      2000   // 20% service fee (total fee on yield)
    );

    // Add supported token
    await laac.connect(controller)._addSupportedToken(await mockUSDC.getAddress());
  });

  describe("Test 1: Partial Withdrawal with Yield (The $900 Example)", function () {
    it("Should correctly handle partial withdrawal after yield accrual", async function () {
      const tokenAddress = await mockUSDC.getAddress();

      // Step 1: User deposits $1,000 at index 1.0
      await mockUSDC.connect(user1).approve(await laac.getAddress(), parseUSDC("1000"));
      await laac.connect(user1).depositFrom(
        clientId1,
        userId1,
        tokenAddress,
        parseUSDC("1000")
      );

      let account = await laac.getAccount(clientId1, userId1, tokenAddress);
      expect(account.balance).to.equal(parseUSDC("1000"));
      expect(account.entryIndex).to.equal(parseIndex("1.0"));

      // Step 2: Oracle updates index to 1.5 (50% yield)
      await laac.connect(controller).updateVaultIndex(tokenAddress, parseIndex("1.5"));

      // Verify total value = $1,500
      const totalValue = await laac.getTotalValue(clientId1, userId1, tokenAddress);
      expect(totalValue).to.equal(parseUSDC("1500"));

      // Verify accrued yield = $500
      const accruedYield = await laac.getAccruedYield(clientId1, userId1, tokenAddress);
      expect(accruedYield).to.equal(parseUSDC("500"));

      // Step 3: User withdraws $900 (60% of total value)
      await laac.connect(controller).withdraw(
        clientId1,
        userId1,
        tokenAddress,
        parseUSDC("900"),
        user1.address,
        0,  // no gas fee
        false
      );

      // Step 4: Verify remaining balance
      account = await laac.getAccount(clientId1, userId1, tokenAddress);

      // Expected: User should have $600 remaining
      // Old bug: balance would be 100 → value = 150 (wrong!)
      // New fix: balance should be 400 → value = 600 (correct!)

      const remainingValue = await laac.getTotalValue(clientId1, userId1, tokenAddress);
      expect(remainingValue).to.be.closeTo(parseUSDC("600"), parseUSDC("1")); // Allow 1 USDC rounding

      // Verify balance units are correct
      // Expected: (600 × 1.0) / 1.5 = 400 balance units
      expect(account.balance).to.be.closeTo(parseUSDC("400"), parseUSDC("1"));
    });
  });

  describe("Test 2: Multiple Deposits with Different Indices", function () {
    it("Should correctly track balance across multiple deposits and withdrawal", async function () {
      const tokenAddress = await mockUSDC.getAddress();

      // Deposit 1: $500 at index 1.0
      await mockUSDC.connect(user1).approve(await laac.getAddress(), parseUSDC("500"));
      await laac.connect(user1).depositFrom(clientId1, userId1, tokenAddress, parseUSDC("500"));

      // Oracle updates index to 1.5 (50% yield)
      await laac.connect(controller).updateVaultIndex(tokenAddress, parseIndex("1.5"));

      // Deposit 2: $600 at index 1.5
      await mockUSDC.connect(user1).approve(await laac.getAddress(), parseUSDC("600"));
      await laac.connect(user1).depositFrom(clientId1, userId1, tokenAddress, parseUSDC("600"));

      let account = await laac.getAccount(clientId1, userId1, tokenAddress);

      // Weighted entry index = (500 × 1.0 + 600 × 1.5) / 1100 = 1.3181...
      expect(account.balance).to.equal(parseUSDC("1100"));
      expect(account.entryIndex).to.be.closeTo(parseIndex("1.318181818"), parseIndex("0.000001"));

      // Oracle updates index to 1.6
      await laac.connect(controller).updateVaultIndex(tokenAddress, parseIndex("1.6"));

      // Total value should be approximately:
      // (1100 × 1.6) / 1.3181 = $1,334.54
      const totalValue = await laac.getTotalValue(clientId1, userId1, tokenAddress);
      expect(totalValue).to.be.closeTo(parseUSDC("1334.54"), parseUSDC("1"));

      // Withdraw $700
      await laac.connect(controller).withdraw(
        clientId1,
        userId1,
        tokenAddress,
        parseUSDC("700"),
        user1.address,
        0,
        false
      );

      // Remaining value should be ~$634.54
      const remainingValue = await laac.getTotalValue(clientId1, userId1, tokenAddress);
      expect(remainingValue).to.be.closeTo(parseUSDC("634.54"), parseUSDC("2"));
    });
  });

  describe("Test 3: Full Withdrawal Edge Case", function () {
    it("Should allow full withdrawal without underflow", async function () {
      const tokenAddress = await mockUSDC.getAddress();

      // Deposit $1,000 at index 1.0
      await mockUSDC.connect(user1).approve(await laac.getAddress(), parseUSDC("1000"));
      await laac.connect(user1).depositFrom(clientId1, userId1, tokenAddress, parseUSDC("1000"));

      // Update index to 1.2 (20% yield)
      await laac.connect(controller).updateVaultIndex(tokenAddress, parseIndex("1.2"));

      const totalValue = await laac.getTotalValue(clientId1, userId1, tokenAddress);
      expect(totalValue).to.equal(parseUSDC("1200"));

      // Withdraw full amount (minus fees)
      const accruedYield = await laac.getAccruedYield(clientId1, userId1, tokenAddress);
      const serviceFee = (accruedYield * 2000n) / 10000n; // 20% of $200 = $40
      const withdrawable = totalValue - serviceFee;

      // This should NOT revert with underflow
      await expect(
        laac.connect(controller).withdraw(
          clientId1,
          userId1,
          tokenAddress,
          withdrawable,
          user1.address,
          0,
          false
        )
      ).to.not.be.reverted;

      // Remaining balance should be near zero (dust from rounding)
      const account = await laac.getAccount(clientId1, userId1, tokenAddress);
      expect(account.balance).to.be.lessThan(parseUSDC("1")); // Less than $1 dust
    });
  });

  describe("Test 4: Revenue Protection (Small then Huge Deposit)", function () {
    it("Should capture all yield fees even with massive second deposit", async function () {
      const tokenAddress = await mockUSDC.getAddress();

      // Step 1: Small deposit $500 at index 1.0
      await mockUSDC.connect(user1).approve(await laac.getAddress(), parseUSDC("500"));
      await laac.connect(user1).depositFrom(clientId1, userId1, tokenAddress, parseUSDC("500"));

      // Step 2: Index grows to 1.5 (50% yield = $250)
      await laac.connect(controller).updateVaultIndex(tokenAddress, parseIndex("1.5"));

      let accruedYield = await laac.getAccruedYield(clientId1, userId1, tokenAddress);
      expect(accruedYield).to.equal(parseUSDC("250"));

      // Step 3: HUGE deposit $100M at index 1.5
      await mockUSDC.connect(user1).approve(await laac.getAddress(), parseUSDC("100000000"));
      await laac.connect(user1).depositFrom(
        clientId1,
        userId1,
        tokenAddress,
        parseUSDC("100000000")
      );

      // Step 4: Tiny index movement to 1.5015 (0.1% yield)
      await laac.connect(controller).updateVaultIndex(tokenAddress, parseIndex("1.5015"));

      // Step 5: Withdraw $100M
      const protocolRevenueBefore = await laac.getProtocolRevenueBalance(tokenAddress);

      await laac.connect(controller).withdraw(
        clientId1,
        userId1,
        tokenAddress,
        parseUSDC("100000000"),
        user1.address,
        0,
        false
      );

      const protocolRevenueAfter = await laac.getProtocolRevenueBalance(tokenAddress);
      const protocolEarned = protocolRevenueAfter - protocolRevenueBefore;

      // Protocol should earn fees on BOTH:
      // - The original $250 yield (proportionally)
      // - The new yield from $100M
      // Total should be > $15,000 (conservative estimate)
      expect(protocolEarned).to.be.greaterThan(parseUSDC("15000"));

      console.log(`      💰 Protocol earned: $${ethers.formatUnits(protocolEarned, DECIMALS)}`);
    });
  });

  describe("Test 5: Immediate Withdrawal (No Yield)", function () {
    it("Should handle withdrawal immediately after deposit", async function () {
      const tokenAddress = await mockUSDC.getAddress();

      // Deposit $1,000
      await mockUSDC.connect(user1).approve(await laac.getAddress(), parseUSDC("1000"));
      await laac.connect(user1).depositFrom(clientId1, userId1, tokenAddress, parseUSDC("1000"));

      // Withdraw $500 immediately (no index change = no yield)
      await laac.connect(controller).withdraw(
        clientId1,
        userId1,
        tokenAddress,
        parseUSDC("500"),
        user1.address,
        0,
        false
      );

      // Should have exactly $500 remaining (no yield, no fees)
      const remainingValue = await laac.getTotalValue(clientId1, userId1, tokenAddress);
      expect(remainingValue).to.equal(parseUSDC("500"));

      const account = await laac.getAccount(clientId1, userId1, tokenAddress);
      expect(account.balance).to.equal(parseUSDC("500"));
    });
  });

  describe("Test 6: Extreme Index Growth", function () {
    it("Should handle large index changes correctly", async function () {
      const tokenAddress = await mockUSDC.getAddress();

      // Deposit $1,000 at index 1.0
      await mockUSDC.connect(user1).approve(await laac.getAddress(), parseUSDC("1000"));
      await laac.connect(user1).depositFrom(clientId1, userId1, tokenAddress, parseUSDC("1000"));

      // Extreme yield: index goes to 10.0 (900% gain!)
      await laac.connect(controller).updateVaultIndex(tokenAddress, parseIndex("10.0"));

      const totalValue = await laac.getTotalValue(clientId1, userId1, tokenAddress);
      expect(totalValue).to.equal(parseUSDC("10000"));

      // Withdraw half ($5,000)
      await laac.connect(controller).withdraw(
        clientId1,
        userId1,
        tokenAddress,
        parseUSDC("5000"),
        user1.address,
        0,
        false
      );

      // Should have ~$5,000 remaining (minus fees)
      const remainingValue = await laac.getTotalValue(clientId1, userId1, tokenAddress);
      expect(remainingValue).to.be.closeTo(parseUSDC("5000"), parseUSDC("50")); // Allow some fee deduction
    });
  });

  describe("Test 7: Proportional Yield Calculation", function () {
    it("Should correctly calculate proportional yield for partial withdrawals", async function () {
      const tokenAddress = await mockUSDC.getAddress();

      // Deposit $1,000 at index 1.0
      await mockUSDC.connect(user1).approve(await laac.getAddress(), parseUSDC("1000"));
      await laac.connect(user1).depositFrom(clientId1, userId1, tokenAddress, parseUSDC("1000"));

      // Index grows to 1.2 (20% yield = $200)
      await laac.connect(controller).updateVaultIndex(tokenAddress, parseIndex("1.2"));

      // Withdraw 50% of value ($600 out of $1,200)
      const protocolRevenueBefore = await laac.getProtocolRevenueBalance(tokenAddress);

      await laac.connect(controller).withdraw(
        clientId1,
        userId1,
        tokenAddress,
        parseUSDC("600"),
        user1.address,
        0,
        false
      );

      const protocolRevenueAfter = await laac.getProtocolRevenueBalance(tokenAddress);
      const feesCollected = protocolRevenueAfter - protocolRevenueBefore;

      // User withdrew 50% of value, so should get 50% of yield = $100
      // Service fee (20%) = $20
      // Protocol share (95%) = $19
      expect(feesCollected).to.be.closeTo(parseUSDC("19"), parseUSDC("0.1"));
    });
  });
});
