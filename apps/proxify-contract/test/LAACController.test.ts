import { expect } from "chai";
import { network } from "hardhat";
import type { LAAC, LAACController, ClientRegistry } from "../typechain-types.js";
import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
// import { time } from "@nomicfoundation/hardhat-network-helpers";

const { ethers } = await network.connect();

describe("LAACController", function () {
  let laac: LAAC;
  let controller: LAACController;
  let clientRegistry: ClientRegistry;
  let mockUSDC: any;
  let mockProtocol: SignerWithAddress;
  let adminMultisig: SignerWithAddress;
  let guardian: SignerWithAddress;
  let oracle: SignerWithAddress;
  let user1: SignerWithAddress;

  const DECIMALS = 6;
  const parseUSDC = (amount: string) => ethers.parseUnits(amount, DECIMALS);

  const MAX_SINGLE_TRANSFER = parseUSDC("1000000"); // $1M
  const DAILY_TRANSFER_LIMIT = parseUSDC("5000000"); // $5M

  beforeEach(async function () {
    [adminMultisig, guardian, oracle, mockProtocol, user1] = await ethers.getSigners();

    // Deploy Mock USDC
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockUSDC = await MockERC20.deploy("USD Coin", "USDC", DECIMALS);
    await mockUSDC.waitForDeployment();

    // Deploy ClientRegistry
    const ClientRegistry = await ethers.getContractFactory("ClientRegistry");
    clientRegistry = await ClientRegistry.deploy(adminMultisig.address, oracle.address);
    await clientRegistry.waitForDeployment();

    // Deploy LAAC (with temporary controller)
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

    // Update LAAC to use LAACController
    await laac.connect(oracle).setController(await controller.getAddress());

    // Setup: Add supported token and whitelist protocol
    await controller.connect(adminMultisig).addSupportedToken(await mockUSDC.getAddress());
    await controller.connect(adminMultisig).addWhitelistedProtocol(mockProtocol.address);

    // Mint USDC to LAAC contract (simulating deposits)
    await mockUSDC.mint(await laac.getAddress(), parseUSDC("10000000"));
  });

  describe("Deployment", function () {
    it("Should set correct roles", async function () {
      const ORACLE_ROLE = await controller.ORACLE_ROLE();
      const GUARDIAN_ROLE = await controller.GUARDIAN_ROLE();
      const DEFAULT_ADMIN_ROLE = await controller.DEFAULT_ADMIN_ROLE();

      expect(await controller.hasRole(ORACLE_ROLE, oracle.address)).to.be.true;
      expect(await controller.hasRole(GUARDIAN_ROLE, guardian.address)).to.be.true;
      expect(await controller.hasRole(DEFAULT_ADMIN_ROLE, adminMultisig.address)).to.be.true;
    });

    it("Should set correct LAAC address", async function () {
      expect(await controller.laac()).to.equal(await laac.getAddress());
    });

    it("Should set correct constants", async function () {
      expect(await controller.MAX_SINGLE_TRANSFER()).to.equal(MAX_SINGLE_TRANSFER);
      expect(await controller.DAILY_TRANSFER_LIMIT()).to.equal(DAILY_TRANSFER_LIMIT);
    });
  });

  describe("Execute Transfer", function () {
    it("Should allow oracle to execute transfer", async function () {
      const amount = parseUSDC("100000");

      await expect(
        controller.connect(oracle).executeTransfer(
          await mockUSDC.getAddress(),
          mockProtocol.address,
          amount
        )
      )
        .to.emit(controller, "TransferExecuted")
        .withArgs(
          await mockUSDC.getAddress(),
          mockProtocol.address,
          amount,
          amount, // dailyTotal
          await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1)
        );

      expect(await mockUSDC.balanceOf(mockProtocol.address)).to.equal(amount);
    });

    it("Should reject transfer from non-oracle", async function () {
      await expect(
        controller.connect(user1).executeTransfer(
          await mockUSDC.getAddress(),
          mockProtocol.address,
          parseUSDC("100000")
        )
      ).to.be.reverted;
    });

    it("Should reject unsupported token", async function () {
      const mockDAI = await (await ethers.getContractFactory("MockERC20"))
        .deploy("DAI", "DAI", 18);

      await expect(
        controller.connect(oracle).executeTransfer(
          await mockDAI.getAddress(),
          mockProtocol.address,
          parseUSDC("100000")
        )
      ).to.be.revertedWith("Token not supported");
    });

    it("Should reject non-whitelisted protocol", async function () {
      await expect(
        controller.connect(oracle).executeTransfer(
          await mockUSDC.getAddress(),
          user1.address, // Not whitelisted
          parseUSDC("100000")
        )
      ).to.be.revertedWith("Protocol not whitelisted");
    });

    it("Should reject transfer exceeding single transaction limit", async function () {
      const tooMuch = MAX_SINGLE_TRANSFER + 1n;

      await expect(
        controller.connect(oracle).executeTransfer(
          await mockUSDC.getAddress(),
          mockProtocol.address,
          tooMuch
        )
      ).to.be.revertedWith("Exceeds single tx limit");
    });

    it("Should reject transfer exceeding daily limit", async function () {
      // Transfer $4M (OK)
      await controller.connect(oracle).executeTransfer(
        await mockUSDC.getAddress(),
        mockProtocol.address,
        parseUSDC("4000000")
      );

      // Try to transfer another $2M (would exceed $5M daily limit)
      await expect(
        controller.connect(oracle).executeTransfer(
          await mockUSDC.getAddress(),
          mockProtocol.address,
          parseUSDC("2000000")
        )
      ).to.be.revertedWith("Exceeds daily limit");
    });

    it("Should reset daily limit after 24 hours", async function () {
      // Transfer $5M
      for (let i = 0; i < 5; i++) {
        await controller.connect(oracle).executeTransfer(
          await mockUSDC.getAddress(),
          mockProtocol.address,
          parseUSDC("1000000")
        );
      }

      // Advance time by 1 day
      await time.increase(24 * 60 * 60);

      // Should be able to transfer again
      await expect(
        controller.connect(oracle).executeTransfer(
          await mockUSDC.getAddress(),
          mockProtocol.address,
          parseUSDC("1000000")
        )
      ).to.not.be.reverted;
    });

    it("Should track daily transferred amount", async function () {
      const amount = parseUSDC("500000");

      await controller.connect(oracle).executeTransfer(
        await mockUSDC.getAddress(),
        mockProtocol.address,
        amount
      );

      const remaining = await controller.getRemainingDailyLimit();
      expect(remaining).to.equal(DAILY_TRANSFER_LIMIT - amount);
    });
  });

  describe("Update Vault Index", function () {
    it("Should allow oracle to update vault index", async function () {
      const newIndex = ethers.parseEther("1.04");

      await controller.connect(oracle).updateVaultIndex(
        await mockUSDC.getAddress(),
        newIndex
      );

      expect(await laac.getVaultIndex(await mockUSDC.getAddress())).to.equal(newIndex);
    });

    it("Should reject update from non-oracle", async function () {
      await expect(
        controller.connect(user1).updateVaultIndex(
          await mockUSDC.getAddress(),
          ethers.parseEther("1.04")
        )
      ).to.be.reverted;
    });

    it("Should reject unsupported token", async function () {
      const mockDAI = await (await ethers.getContractFactory("MockERC20"))
        .deploy("DAI", "DAI", 18);

      await expect(
        controller.connect(oracle).updateVaultIndex(
          await mockDAI.getAddress(),
          ethers.parseEther("1.04")
        )
      ).to.be.revertedWith("Token not supported");
    });
  });

  describe("Protocol Management", function () {
    it("Should allow admin to whitelist protocol", async function () {
      const newProtocol = user1.address;

      await expect(
        controller.connect(adminMultisig).addWhitelistedProtocol(newProtocol)
      )
        .to.emit(controller, "ProtocolWhitelisted")
        .withArgs(newProtocol, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      expect(await controller.isProtocolWhitelisted(newProtocol)).to.be.true;
    });

    it("Should reject whitelisting from non-admin", async function () {
      await expect(
        controller.connect(oracle).addWhitelistedProtocol(user1.address)
      ).to.be.reverted;
    });

    it("Should reject zero address", async function () {
      await expect(
        controller.connect(adminMultisig).addWhitelistedProtocol(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid protocol address");
    });

    it("Should reject duplicate protocol", async function () {
      await expect(
        controller.connect(adminMultisig).addWhitelistedProtocol(mockProtocol.address)
      ).to.be.revertedWith("Already whitelisted");
    });

    it("Should allow admin to remove protocol", async function () {
      await expect(
        controller.connect(adminMultisig).removeWhitelistedProtocol(mockProtocol.address)
      )
        .to.emit(controller, "ProtocolRemovedFromWhitelist")
        .withArgs(mockProtocol.address, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      expect(await controller.isProtocolWhitelisted(mockProtocol.address)).to.be.false;
    });

    it("Should reject removing non-whitelisted protocol", async function () {
      await expect(
        controller.connect(adminMultisig).removeWhitelistedProtocol(user1.address)
      ).to.be.revertedWith("Not whitelisted");
    });
  });

  describe("Token Management", function () {
    it("Should allow admin to add supported token", async function () {
      const mockUSDT = await (await ethers.getContractFactory("MockERC20"))
        .deploy("Tether", "USDT", DECIMALS);

      await expect(
        controller.connect(adminMultisig).addSupportedToken(await mockUSDT.getAddress())
      )
        .to.emit(controller, "TokenAdded")
        .withArgs(await mockUSDT.getAddress(), await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      expect(await controller.isTokenSupported(await mockUSDT.getAddress())).to.be.true;
      expect(await laac.isSupportedToken(await mockUSDT.getAddress())).to.be.true;
    });

    it("Should reject adding token from non-admin", async function () {
      const mockUSDT = await (await ethers.getContractFactory("MockERC20"))
        .deploy("Tether", "USDT", DECIMALS);

      await expect(
        controller.connect(oracle).addSupportedToken(await mockUSDT.getAddress())
      ).to.be.reverted;
    });

    it("Should allow admin to remove supported token", async function () {
      const mockUSDT = await (await ethers.getContractFactory("MockERC20"))
        .deploy("Tether", "USDT", DECIMALS);

      await controller.connect(adminMultisig).addSupportedToken(await mockUSDT.getAddress());

      await expect(
        controller.connect(adminMultisig).removeSupportedToken(await mockUSDT.getAddress())
      )
        .to.emit(controller, "TokenRemoved")
        .withArgs(await mockUSDT.getAddress(), await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      expect(await controller.isTokenSupported(await mockUSDT.getAddress())).to.be.false;
    });

    it("Should reject removing token with active deposits", async function () {
      // USDC already has deposits in this test scenario
      // (We minted to LAAC contract)
      await expect(
        controller.connect(adminMultisig).removeSupportedToken(await mockUSDC.getAddress())
      ).to.be.reverted; // Will fail due to totalDeposits check in LAAC
    });
  });

  describe("Emergency Controls", function () {
    it("Should allow guardian to pause", async function () {
      await expect(
        controller.connect(guardian).emergencyPause()
      )
        .to.emit(controller, "EmergencyPaused")
        .withArgs(guardian.address, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      expect(await controller.isPaused()).to.be.true;
    });

    it("Should reject pause from non-guardian", async function () {
      await expect(
        controller.connect(oracle).emergencyPause()
      ).to.be.reverted;
    });

    it("Should block operations when paused", async function () {
      await controller.connect(guardian).emergencyPause();

      await expect(
        controller.connect(oracle).executeTransfer(
          await mockUSDC.getAddress(),
          mockProtocol.address,
          parseUSDC("100000")
        )
      ).to.be.reverted;

      await expect(
        controller.connect(oracle).updateVaultIndex(
          await mockUSDC.getAddress(),
          ethers.parseEther("1.04")
        )
      ).to.be.reverted;
    });

    it("Should allow admin to unpause", async function () {
      await controller.connect(guardian).emergencyPause();

      await expect(
        controller.connect(adminMultisig).unpause()
      )
        .to.emit(controller, "EmergencyUnpaused")
        .withArgs(adminMultisig.address, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      expect(await controller.isPaused()).to.be.false;
    });

    it("Should reject unpause from non-admin", async function () {
      await controller.connect(guardian).emergencyPause();

      await expect(
        controller.connect(guardian).unpause()
      ).to.be.reverted;
    });

    it("Should allow operations after unpause", async function () {
      await controller.connect(guardian).emergencyPause();
      await controller.connect(adminMultisig).unpause();

      await expect(
        controller.connect(oracle).executeTransfer(
          await mockUSDC.getAddress(),
          mockProtocol.address,
          parseUSDC("100000")
        )
      ).to.not.be.reverted;
    });
  });

  describe("View Functions", function () {
    it("Should return remaining daily limit", async function () {
      expect(await controller.getRemainingDailyLimit()).to.equal(DAILY_TRANSFER_LIMIT);

      await controller.connect(oracle).executeTransfer(
        await mockUSDC.getAddress(),
        mockProtocol.address,
        parseUSDC("2000000")
      );

      expect(await controller.getRemainingDailyLimit()).to.equal(parseUSDC("3000000"));
    });

    it("Should return zero when daily limit exceeded", async function () {
      // Transfer full $5M
      for (let i = 0; i < 5; i++) {
        await controller.connect(oracle).executeTransfer(
          await mockUSDC.getAddress(),
          mockProtocol.address,
          parseUSDC("1000000")
        );
      }

      expect(await controller.getRemainingDailyLimit()).to.equal(0);
    });

    it("Should return correct max single transfer", async function () {
      expect(await controller.getMaxSingleTransfer()).to.equal(MAX_SINGLE_TRANSFER);
    });

    it("Should return correct daily transfer limit", async function () {
      expect(await controller.getDailyTransferLimit()).to.equal(DAILY_TRANSFER_LIMIT);
    });
  });
});
