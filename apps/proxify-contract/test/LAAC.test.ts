import { expect } from "chai";
import { network } from "hardhat";
import type { LAAC, ClientRegistry } from "../typechain-types.js";
import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import type { MockERC20 } from "./helpers/MockERC20.js";

const { ethers } = await network.connect();

describe("LAAC", function () {
  let laac: LAAC;
  let clientRegistry: ClientRegistry;
  let mockUSDC: MockERC20;
  let admin: SignerWithAddress;
  let controller: SignerWithAddress;
  let oracle: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const clientId1 = ethers.keccak256(ethers.toUtf8Bytes("bitkub"));
  const userId1 = ethers.keccak256(ethers.toUtf8Bytes("alice@email.com"));
  const userId2 = ethers.keccak256(ethers.toUtf8Bytes("bob@email.com"));

  const DECIMALS = 6;
  const parseUSDC = (amount: string) => ethers.parseUnits(amount, DECIMALS);

  beforeEach(async function () {
    [admin, controller, oracle, user1, user2] = await ethers.getSigners();

    // Deploy Mock USDC
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockUSDC = await MockERC20Factory.deploy("USD Coin", "USDC", DECIMALS);
    await mockUSDC.waitForDeployment();

    // Mint USDC to users
    await mockUSDC.mint(user1.address, parseUSDC("10000"));
    await mockUSDC.mint(user2.address, parseUSDC("10000"));

    // Deploy ClientRegistry
    const ClientRegistry = await ethers.getContractFactory("ClientRegistry");
    clientRegistry = await ClientRegistry.deploy(admin.address, oracle.address);
    await clientRegistry.waitForDeployment();

    // Deploy LAAC
    const LAAC = await ethers.getContractFactory("LAAC");
    laac = await LAAC.deploy(controller.address, await clientRegistry.getAddress());
    await laac.waitForDeployment();

    // Register client
    await clientRegistry.connect(oracle).registerClient(clientId1, "Bitkub");

    // Add supported token (as controller)
    await laac.connect(controller)._addSupportedToken(await mockUSDC.getAddress());
  });

  describe("Deployment", function () {
    it("Should set correct controller", async function () {
      expect(await laac.controller()).to.equal(controller.address);
    });

    it("Should set correct client registry", async function () {
      expect(await laac.clientRegistry()).to.equal(await clientRegistry.getAddress());
    });

    it("Should reject zero address for controller", async function () {
      const LAAC = await ethers.getContractFactory("LAAC");
      await expect(
        LAAC.deploy(ethers.ZeroAddress, await clientRegistry.getAddress())
      ).to.be.revertedWith("Invalid controller");
    });

    it("Should reject zero address for registry", async function () {
      const LAAC = await ethers.getContractFactory("LAAC");
      await expect(
        LAAC.deploy(controller.address, ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid registry");
    });
  });

  describe("Token Support", function () {
    it("Should add supported token", async function () {
      const mockUSDT = await (await ethers.getContractFactory("MockERC20"))
        .deploy("Tether", "USDT", DECIMALS);

      await laac.connect(controller)._addSupportedToken(await mockUSDT.getAddress());

      expect(await laac.isSupportedToken(await mockUSDT.getAddress())).to.be.true;
      expect(await laac.getVaultIndex(await mockUSDT.getAddress())).to.equal(ethers.parseEther("1.0"));
    });

    it("Should reject adding token from non-controller", async function () {
      const mockUSDT = await (await ethers.getContractFactory("MockERC20"))
        .deploy("Tether", "USDT", DECIMALS);

      await expect(
        laac.connect(user1)._addSupportedToken(await mockUSDT.getAddress())
      ).to.be.revertedWith("Only controller");
    });

    it("Should reject duplicate token", async function () {
      await expect(
        laac.connect(controller)._addSupportedToken(await mockUSDC.getAddress())
      ).to.be.revertedWith("Already supported");
    });

    it("Should remove supported token", async function () {
      const mockUSDT = await (await ethers.getContractFactory("MockERC20"))
        .deploy("Tether", "USDT", DECIMALS);

      await laac.connect(controller)._addSupportedToken(await mockUSDT.getAddress());
      await laac.connect(controller)._removeSupportedToken(await mockUSDT.getAddress());

      expect(await laac.isSupportedToken(await mockUSDT.getAddress())).to.be.false;
    });

    it("Should reject removing token with active deposits", async function () {
      await mockUSDC.connect(user1).approve(await laac.getAddress(), parseUSDC("1000"));
      await laac.deposit(clientId1, userId1, await mockUSDC.getAddress(), parseUSDC("1000"), user1.address);

      await expect(
        laac.connect(controller)._removeSupportedToken(await mockUSDC.getAddress())
      ).to.be.revertedWith("Token has active deposits");
    });
  });

  describe("Deposit", function () {
    beforeEach(async function () {
      await mockUSDC.connect(user1).approve(await laac.getAddress(), parseUSDC("10000"));
    });

    it("Should allow deposit from active client", async function () {
      const amount = parseUSDC("1000");

      await expect(
        laac.deposit(clientId1, userId1, await mockUSDC.getAddress(), amount, user1.address)
      )
        .to.emit(laac, "Deposited")
        .withArgs(clientId1, userId1, await mockUSDC.getAddress(), amount, ethers.parseEther("1.0"), await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      const account = await laac.getAccount(clientId1, userId1, await mockUSDC.getAddress());
      expect(account.balance).to.equal(amount);
      expect(account.entryIndex).to.equal(ethers.parseEther("1.0"));
    });

    it("Should reject deposit from inactive client", async function () {
      await clientRegistry.connect(admin).deactivateClient(clientId1);

      await expect(
        laac.deposit(clientId1, userId1, await mockUSDC.getAddress(), parseUSDC("1000"), user1.address)
      ).to.be.revertedWith("Client not active");
    });

    it("Should reject unsupported token", async function () {
      const mockDAI = await (await ethers.getContractFactory("MockERC20"))
        .deploy("DAI", "DAI", 18);

      await expect(
        laac.deposit(clientId1, userId1, await mockDAI.getAddress(), parseUSDC("1000"), user1.address)
      ).to.be.revertedWith("Token not supported");
    });

    it("Should reject zero amount", async function () {
      await expect(
        laac.deposit(clientId1, userId1, await mockUSDC.getAddress(), 0, user1.address)
      ).to.be.revertedWith("Amount must be > 0");
    });

    it("Should reject zero from address", async function () {
      await expect(
        laac.deposit(clientId1, userId1, await mockUSDC.getAddress(), parseUSDC("1000"), ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid from address");
    });

    it("Should handle multiple deposits with weighted average entry index", async function () {
      // First deposit at index 1.0
      await laac.deposit(clientId1, userId1, await mockUSDC.getAddress(), parseUSDC("1000"), user1.address);

      // Update vault index to 1.04 (4% yield)
      await laac.connect(controller).updateVaultIndex(await mockUSDC.getAddress(), ethers.parseEther("1.04"));

      // Second deposit at index 1.04
      await laac.deposit(clientId1, userId1, await mockUSDC.getAddress(), parseUSDC("1000"), user1.address);

      const account = await laac.getAccount(clientId1, userId1, await mockUSDC.getAddress());

      // Weighted average: (1000 * 1.0 + 1000 * 1.04) / 2000 = 1.02
      expect(account.balance).to.equal(parseUSDC("2000"));
      expect(account.entryIndex).to.equal(ethers.parseEther("1.02"));
    });

    it("Should update totalDeposits", async function () {
      await laac.deposit(clientId1, userId1, await mockUSDC.getAddress(), parseUSDC("1000"), user1.address);

      expect(await laac.getTotalDeposits(await mockUSDC.getAddress())).to.equal(parseUSDC("1000"));

      await mockUSDC.connect(user2).approve(await laac.getAddress(), parseUSDC("500"));
      await laac.deposit(clientId1, userId2, await mockUSDC.getAddress(), parseUSDC("500"), user2.address);

      expect(await laac.getTotalDeposits(await mockUSDC.getAddress())).to.equal(parseUSDC("1500"));
    });
  });

  describe("Withdraw", function () {
    beforeEach(async function () {
      await mockUSDC.connect(user1).approve(await laac.getAddress(), parseUSDC("10000"));
      await laac.deposit(clientId1, userId1, await mockUSDC.getAddress(), parseUSDC("1000"), user1.address);
    });

    it("Should allow withdrawal via controller", async function () {
      await expect(
        laac.connect(controller).withdraw(
          clientId1,
          userId1,
          await mockUSDC.getAddress(),
          parseUSDC("500"),
          user1.address
        )
      )
        .to.emit(laac, "Withdrawn")
        .withArgs(clientId1, userId1, await mockUSDC.getAddress(), parseUSDC("500"), user1.address, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      const account = await laac.getAccount(clientId1, userId1, await mockUSDC.getAddress());
      expect(account.balance).to.equal(parseUSDC("500"));
    });

    it("Should reject withdrawal from non-controller", async function () {
      await expect(
        laac.connect(user1).withdraw(
          clientId1,
          userId1,
          await mockUSDC.getAddress(),
          parseUSDC("500"),
          user1.address
        )
      ).to.be.revertedWith("Only controller");
    });

    it("Should reject insufficient balance", async function () {
      await expect(
        laac.connect(controller).withdraw(
          clientId1,
          userId1,
          await mockUSDC.getAddress(),
          parseUSDC("2000"),
          user1.address
        )
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should reject zero amount", async function () {
      await expect(
        laac.connect(controller).withdraw(
          clientId1,
          userId1,
          await mockUSDC.getAddress(),
          0,
          user1.address
        )
      ).to.be.revertedWith("Amount must be > 0");
    });

    it("Should update totalDeposits on withdrawal", async function () {
      await laac.connect(controller).withdraw(
        clientId1,
        userId1,
        await mockUSDC.getAddress(),
        parseUSDC("500"),
        user1.address
      );

      expect(await laac.getTotalDeposits(await mockUSDC.getAddress())).to.equal(parseUSDC("500"));
    });
  });

  describe("Vault Index Updates", function () {
    it("Should allow controller to update vault index", async function () {
      const newIndex = ethers.parseEther("1.04");

      await expect(
        laac.connect(controller).updateVaultIndex(await mockUSDC.getAddress(), newIndex)
      )
        .to.emit(laac, "VaultIndexUpdated")
        .withArgs(await mockUSDC.getAddress(), ethers.parseEther("1.0"), newIndex, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      expect(await laac.getVaultIndex(await mockUSDC.getAddress())).to.equal(newIndex);
    });

    it("Should reject index update from non-controller", async function () {
      await expect(
        laac.connect(user1).updateVaultIndex(await mockUSDC.getAddress(), ethers.parseEther("1.04"))
      ).to.be.revertedWith("Only controller");
    });

    it("Should reject decreasing index", async function () {
      await laac.connect(controller).updateVaultIndex(await mockUSDC.getAddress(), ethers.parseEther("1.04"));

      await expect(
        laac.connect(controller).updateVaultIndex(await mockUSDC.getAddress(), ethers.parseEther("1.02"))
      ).to.be.revertedWith("Index cannot decrease");
    });
  });

  describe("Yield Calculation", function () {
    beforeEach(async function () {
      await mockUSDC.connect(user1).approve(await laac.getAddress(), parseUSDC("1000"));
      await laac.deposit(clientId1, userId1, await mockUSDC.getAddress(), parseUSDC("1000"), user1.address);
    });

    it("Should calculate total value correctly", async function () {
      // Initial value
      expect(await laac.getTotalValue(clientId1, userId1, await mockUSDC.getAddress()))
        .to.equal(parseUSDC("1000"));

      // Update index to 1.04 (4% yield)
      await laac.connect(controller).updateVaultIndex(await mockUSDC.getAddress(), ethers.parseEther("1.04"));

      // New value should be 1000 * 1.04 = 1040
      expect(await laac.getTotalValue(clientId1, userId1, await mockUSDC.getAddress()))
        .to.equal(parseUSDC("1040"));
    });

    it("Should calculate accrued yield correctly", async function () {
      expect(await laac.getAccruedYield(clientId1, userId1, await mockUSDC.getAddress()))
        .to.equal(0);

      // Update index to 1.04 (4% yield)
      await laac.connect(controller).updateVaultIndex(await mockUSDC.getAddress(), ethers.parseEther("1.04"));

      // Yield should be 40 USDC
      expect(await laac.getAccruedYield(clientId1, userId1, await mockUSDC.getAddress()))
        .to.equal(parseUSDC("40"));
    });

    it("Should return zero for non-existent account", async function () {
      expect(await laac.getTotalValue(clientId1, userId2, await mockUSDC.getAddress()))
        .to.equal(0);
      expect(await laac.getAccruedYield(clientId1, userId2, await mockUSDC.getAddress()))
        .to.equal(0);
    });
  });

  describe("getUserAccountSummary", function () {
    beforeEach(async function () {
      await mockUSDC.connect(user1).approve(await laac.getAddress(), parseUSDC("1000"));
      await laac.deposit(clientId1, userId1, await mockUSDC.getAddress(), parseUSDC("1000"), user1.address);
    });

    it("Should return complete account summary", async function () {
      await laac.connect(controller).updateVaultIndex(await mockUSDC.getAddress(), ethers.parseEther("1.04"));

      const summary = await laac.getUserAccountSummary(clientId1, userId1, await mockUSDC.getAddress());

      expect(summary.balance).to.equal(parseUSDC("1000"));
      expect(summary.totalValue).to.equal(parseUSDC("1040"));
      expect(summary.accruedYield).to.equal(parseUSDC("40"));
      expect(summary.entryIndex).to.equal(ethers.parseEther("1.0"));
      expect(summary.depositTimestamp).to.be.gt(0);
    });

    it("Should return zeros for non-existent account", async function () {
      const summary = await laac.getUserAccountSummary(clientId1, userId2, await mockUSDC.getAddress());

      expect(summary.balance).to.equal(0);
      expect(summary.totalValue).to.equal(0);
      expect(summary.accruedYield).to.equal(0);
      expect(summary.entryIndex).to.equal(0);
      expect(summary.depositTimestamp).to.equal(0);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow controller to update controller address", async function () {
      const newController = user2.address;

      await laac.connect(controller).setController(newController);

      expect(await laac.controller()).to.equal(newController);
    });

    it("Should allow controller to update client registry", async function () {
      const newRegistry = user2.address;

      await laac.connect(controller).setClientRegistry(newRegistry);

      expect(await laac.clientRegistry()).to.equal(newRegistry);
    });

    it("Should reject controller update from non-controller", async function () {
      await expect(
        laac.connect(user1).setController(user2.address)
      ).to.be.revertedWith("Only controller");
    });

    it("Should reject zero address for new controller", async function () {
      await expect(
        laac.connect(controller).setController(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid controller");
    });
  });
});
