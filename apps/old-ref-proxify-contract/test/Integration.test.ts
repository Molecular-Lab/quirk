import { expect } from "chai";
import { network } from "hardhat";
import type { LAAC, LAACController, ClientRegistry } from "../typechain-types.js";
import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

const { ethers } = await network.connect();

describe("Integration Tests", function () {
  let laac: LAAC;
  let controller: LAACController;
  let clientRegistry: ClientRegistry;
  let mockUSDC: any;
  let mockProtocol: SignerWithAddress;
  let adminMultisig: SignerWithAddress;
  let guardian: SignerWithAddress;
  let oracle: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const clientId1 = ethers.keccak256(ethers.toUtf8Bytes("bitkub"));
  const userId1 = ethers.keccak256(ethers.toUtf8Bytes("alice@email.com"));
  const userId2 = ethers.keccak256(ethers.toUtf8Bytes("bob@email.com"));

  const DECIMALS = 6;
  const parseUSDC = (amount: string) => ethers.parseUnits(amount, DECIMALS);

  beforeEach(async function () {
    [adminMultisig, guardian, oracle, mockProtocol, user1, user2] = await ethers.getSigners();

    // Deploy Mock USDC
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockUSDC = await MockERC20.deploy("USD Coin", "USDC", DECIMALS);
    await mockUSDC.waitForDeployment();

    // Mint USDC to users
    await mockUSDC.mint(user1.address, parseUSDC("100000"));
    await mockUSDC.mint(user2.address, parseUSDC("100000"));

    // Deploy ClientRegistry
    const ClientRegistry = await ethers.getContractFactory("ClientRegistry");
    clientRegistry = await ClientRegistry.deploy(adminMultisig.address, oracle.address);
    await clientRegistry.waitForDeployment();

    // Deploy LAAC
    const LAAC = await ethers.getContractFactory("LAAC");
    laac = await LAAC.deploy(oracle.address, await clientRegistry.getAddress());
    await laac.waitForDeployment();

    // Deploy LAACController
    const LAACController = await ethers.getContractFactory("LAACController");
    controller = await LAACController.deploy(
      await laac.getAddress(),
      adminMultisig.address,
      guardian.address,
      oracle.address
    );
    await controller.waitForDeployment();

    // Update LAAC to use controller
    await laac.connect(oracle).setController(await controller.getAddress());

    // Setup system
    await clientRegistry.connect(oracle).registerClient(clientId1, "Bitkub Exchange");
    await controller.connect(adminMultisig).addSupportedToken(await mockUSDC.getAddress());
    await controller.connect(adminMultisig).addWhitelistedProtocol(mockProtocol.address);
  });

  describe("Complete User Journey: Deposit → Stake → Yield → Withdraw", function () {
    it("Should handle full user lifecycle", async function () {
      // ===== STEP 1: User Deposits =====
      console.log("\n===== STEP 1: User Deposits =====");

      await mockUSDC.connect(user1).approve(await laac.getAddress(), parseUSDC("10000"));
      await laac.deposit(clientId1, userId1, await mockUSDC.getAddress(), parseUSDC("10000"), user1.address);

      let account = await laac.getAccount(clientId1, userId1, await mockUSDC.getAddress());
      expect(account.balance).to.equal(parseUSDC("10000"));
      expect(account.entryIndex).to.equal(ethers.parseEther("1.0"));

      console.log("✓ User1 deposited 10,000 USDC");
      console.log("  Entry Index:", ethers.formatEther(account.entryIndex));

      // ===== STEP 2: Oracle Stakes to Protocol =====
      console.log("\n===== STEP 2: Oracle Stakes to Protocol =====");

      // Oracle stakes 80% to protocol, keeps 20% buffer
      await controller.connect(oracle).executeTransfer(
        await mockUSDC.getAddress(),
        mockProtocol.address,
        parseUSDC("8000")
      );

      expect(await mockUSDC.balanceOf(mockProtocol.address)).to.equal(parseUSDC("8000"));
      expect(await mockUSDC.balanceOf(await laac.getAddress())).to.equal(parseUSDC("2000"));

      console.log("✓ Oracle staked 8,000 USDC to protocol");
      console.log("  Buffer:", ethers.formatUnits(await mockUSDC.balanceOf(await laac.getAddress()), DECIMALS), "USDC");

      // ===== STEP 3: Simulate Yield Accrual =====
      console.log("\n===== STEP 3: Simulate Yield Accrual (4% APY for 1 month) =====");

      // Simulate 1 month of 4% APY yield (~0.33% = 26.4 USDC on 8000)
      // Protocol returns 8026.4 USDC to LAAC
      await mockUSDC.mint(await laac.getAddress(), parseUSDC("26.4"));

      // Oracle calculates new index:
      // totalValue = 8026.4 + 2000 = 10026.4
      // totalDeposits = 10000
      // growth = 10026.4 / 10000 = 1.00264
      // newIndex = 1.0 * 1.00264 = 1.00264
      const newIndex = ethers.parseEther("1.00264");
      await controller.connect(oracle).updateVaultIndex(await mockUSDC.getAddress(), newIndex);

      console.log("✓ Vault index updated to:", ethers.formatEther(newIndex));

      // ===== STEP 4: User Checks Balance =====
      console.log("\n===== STEP 4: User Checks Balance =====");

      const totalValue = await laac.getTotalValue(clientId1, userId1, await mockUSDC.getAddress());
      const accruedYield = await laac.getAccruedYield(clientId1, userId1, await mockUSDC.getAddress());

      console.log("  Balance:", ethers.formatUnits(account.balance, DECIMALS), "USDC");
      console.log("  Total Value:", ethers.formatUnits(totalValue, DECIMALS), "USDC");
      console.log("  Accrued Yield:", ethers.formatUnits(accruedYield, DECIMALS), "USDC");

      expect(totalValue).to.be.closeTo(parseUSDC("10026.4"), parseUSDC("0.1"));
      expect(accruedYield).to.be.closeTo(parseUSDC("26.4"), parseUSDC("0.1"));

      // ===== STEP 5: Second User Deposits (at higher index) =====
      console.log("\n===== STEP 5: Second User Deposits =====");

      await mockUSDC.connect(user2).approve(await laac.getAddress(), parseUSDC("10000"));
      await laac.deposit(clientId1, userId2, await mockUSDC.getAddress(), parseUSDC("10000"), user2.address);

      const account2 = await laac.getAccount(clientId1, userId2, await mockUSDC.getAddress());
      expect(account2.balance).to.equal(parseUSDC("10000"));
      expect(account2.entryIndex).to.equal(newIndex); // Enters at higher index

      console.log("✓ User2 deposited 10,000 USDC");
      console.log("  Entry Index:", ethers.formatEther(account2.entryIndex));

      // ===== STEP 6: More Yield Accrues =====
      console.log("\n===== STEP 6: More Yield Accrues =====");

      // Another 26.4 USDC yield
      await mockUSDC.mint(await laac.getAddress(), parseUSDC("26.4"));
      const newIndex2 = ethers.parseEther("1.00528");
      await controller.connect(oracle).updateVaultIndex(await mockUSDC.getAddress(), newIndex2);

      console.log("✓ Vault index updated to:", ethers.formatEther(newIndex2));

      // ===== STEP 7: Check Both Users' Balances =====
      console.log("\n===== STEP 7: Check Both Users' Balances =====");

      const totalValue1 = await laac.getTotalValue(clientId1, userId1, await mockUSDC.getAddress());
      const accruedYield1 = await laac.getAccruedYield(clientId1, userId1, await mockUSDC.getAddress());

      const totalValue2 = await laac.getTotalValue(clientId1, userId2, await mockUSDC.getAddress());
      const accruedYield2 = await laac.getAccruedYield(clientId1, userId2, await mockUSDC.getAddress());

      console.log("  User1 Total Value:", ethers.formatUnits(totalValue1, DECIMALS), "USDC");
      console.log("  User1 Accrued Yield:", ethers.formatUnits(accruedYield1, DECIMALS), "USDC");
      console.log("  User2 Total Value:", ethers.formatUnits(totalValue2, DECIMALS), "USDC");
      console.log("  User2 Accrued Yield:", ethers.formatUnits(accruedYield2, DECIMALS), "USDC");

      // User1 should have more yield (was in longer)
      expect(accruedYield1).to.be.gt(accruedYield2);

      // ===== STEP 8: User1 Withdraws =====
      console.log("\n===== STEP 8: User1 Withdraws =====");

      const withdrawAmount = parseUSDC("5000");

      await controller.connect(oracle).withdraw(
        clientId1,
        userId1,
        await mockUSDC.getAddress(),
        withdrawAmount,
        user1.address
      );

      account = await laac.getAccount(clientId1, userId1, await mockUSDC.getAddress());
      expect(account.balance).to.equal(parseUSDC("5000"));

      console.log("✓ User1 withdrew 5,000 USDC");
      console.log("  Remaining balance:", ethers.formatUnits(account.balance, DECIMALS), "USDC");

      // ===== FINAL CHECKS =====
      console.log("\n===== FINAL CHECKS =====");

      const totalDeposits = await laac.getTotalDeposits(await mockUSDC.getAddress());
      console.log("  Total Deposits:", ethers.formatUnits(totalDeposits, DECIMALS), "USDC");

      expect(totalDeposits).to.equal(parseUSDC("15000")); // 5000 (user1) + 10000 (user2)

      console.log("\n✅ Complete user journey successful!\n");
    });
  });

  describe("Emergency Scenarios", function () {
    beforeEach(async function () {
      await mockUSDC.connect(user1).approve(await laac.getAddress(), parseUSDC("10000"));
      await laac.deposit(clientId1, userId1, await mockUSDC.getAddress(), parseUSDC("10000"), user1.address);
    });

    it("Should handle emergency pause and recovery", async function () {
      // Oracle detects exploit
      await controller.connect(guardian).emergencyPause();

      // All operations blocked
      await expect(
        laac.deposit(clientId1, userId2, await mockUSDC.getAddress(), parseUSDC("1000"), user2.address)
      ).to.be.reverted;

      await expect(
        controller.connect(oracle).executeTransfer(
          await mockUSDC.getAddress(),
          mockProtocol.address,
          parseUSDC("1000")
        )
      ).to.be.reverted;

      // Admin investigates and unpauses
      await controller.connect(adminMultisig).unpause();

      // Operations resume
      await mockUSDC.connect(user2).approve(await laac.getAddress(), parseUSDC("1000"));
      await expect(
        laac.deposit(clientId1, userId2, await mockUSDC.getAddress(), parseUSDC("1000"), user2.address)
      ).to.not.be.reverted;
    });
  });

  describe("Multi-Client Isolation", function () {
    const clientId2 = ethers.keccak256(ethers.toUtf8Bytes("rise"));

    beforeEach(async function () {
      await clientRegistry.connect(oracle).registerClient(clientId2, "Rise");
    });

    it("Should isolate balances between clients", async function () {
      // User1 deposits via Client1
      await mockUSDC.connect(user1).approve(await laac.getAddress(), parseUSDC("10000"));
      await laac.deposit(clientId1, userId1, await mockUSDC.getAddress(), parseUSDC("10000"), user1.address);

      // User2 deposits via Client2 (same userId!)
      await mockUSDC.connect(user2).approve(await laac.getAddress(), parseUSDC("5000"));
      await laac.deposit(clientId2, userId1, await mockUSDC.getAddress(), parseUSDC("5000"), user2.address);

      // Balances should be separate
      const account1 = await laac.getAccount(clientId1, userId1, await mockUSDC.getAddress());
      const account2 = await laac.getAccount(clientId2, userId1, await mockUSDC.getAddress());

      expect(account1.balance).to.equal(parseUSDC("10000"));
      expect(account2.balance).to.equal(parseUSDC("5000"));
    });

    it("Should handle client deactivation", async function () {
      await mockUSDC.connect(user1).approve(await laac.getAddress(), parseUSDC("10000"));
      await laac.deposit(clientId1, userId1, await mockUSDC.getAddress(), parseUSDC("10000"), user1.address);

      // Deactivate client
      await clientRegistry.connect(adminMultisig).deactivateClient(clientId1);

      // New deposits blocked
      await expect(
        laac.deposit(clientId1, userId2, await mockUSDC.getAddress(), parseUSDC("1000"), user2.address)
      ).to.be.revertedWith("Client not active");

      // Existing balances safe and withdrawable
      await expect(
        controller.connect(oracle).withdraw(
          clientId1,
          userId1,
          await mockUSDC.getAddress(),
          parseUSDC("5000"),
          user1.address
        )
      ).to.not.be.reverted;
    });
  });

  describe("Rate Limiting", function () {
    beforeEach(async function () {
      // Mint large amount to LAAC
      await mockUSDC.mint(await laac.getAddress(), parseUSDC("10000000"));
    });

    it("Should enforce single transaction limit", async function () {
      await expect(
        controller.connect(oracle).executeTransfer(
          await mockUSDC.getAddress(),
          mockProtocol.address,
          parseUSDC("1000001") // Just over $1M limit
        )
      ).to.be.revertedWith("Exceeds single tx limit");
    });

    it("Should enforce daily limit across multiple transactions", async function () {
      // Transfer $1M five times (total $5M - at limit)
      for (let i = 0; i < 5; i++) {
        await controller.connect(oracle).executeTransfer(
          await mockUSDC.getAddress(),
          mockProtocol.address,
          parseUSDC("1000000")
        );
      }

      // 6th transaction should fail
      await expect(
        controller.connect(oracle).executeTransfer(
          await mockUSDC.getAddress(),
          mockProtocol.address,
          parseUSDC("100000")
        )
      ).to.be.revertedWith("Exceeds daily limit");

      // Check remaining limit is 0
      expect(await controller.getRemainingDailyLimit()).to.equal(0);
    });
  });
});
