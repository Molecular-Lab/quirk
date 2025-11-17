import { expect } from "chai";
import { network } from "hardhat";
import type { ProxifyClientRegistry } from "../typechain-types.js";
import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

const { ethers } = await network.connect();

describe("ProxifyClientRegistry", function () {
  let registry: ProxifyClientRegistry;
  let admin: SignerWithAddress;
  let oracle: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let clientAddress: SignerWithAddress;

  const clientId1 = ethers.keccak256(ethers.toUtf8Bytes("BITKUB"));
  const clientId2 = ethers.keccak256(ethers.toUtf8Bytes("RISE"));

  const tierLowRisk = ethers.keccak256(ethers.toUtf8Bytes("LOW_RISK"));
  const tierModerateRisk = ethers.keccak256(ethers.toUtf8Bytes("MODERATE_RISK"));
  const tierHighRisk = ethers.keccak256(ethers.toUtf8Bytes("HIGH_RISK"));

  beforeEach(async function () {
    [admin, oracle, user1, user2, clientAddress] = await ethers.getSigners();

    const ProxifyClientRegistry = await ethers.getContractFactory("ProxifyClientRegistry");
    registry = await ProxifyClientRegistry.deploy(admin.address, oracle.address);
    await registry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set correct admin role", async function () {
      const DEFAULT_ADMIN_ROLE = await registry.DEFAULT_ADMIN_ROLE();
      expect(await registry.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
    });

    it("Should set correct oracle role", async function () {
      const ORACLE_ROLE = await registry.ORACLE_ROLE();
      expect(await registry.hasRole(ORACLE_ROLE, oracle.address)).to.be.true;
    });

    it("Should reject zero address for admin", async function () {
      const ProxifyClientRegistry = await ethers.getContractFactory("ProxifyClientRegistry");
      await expect(
        ProxifyClientRegistry.deploy(ethers.ZeroAddress, oracle.address)
      ).to.be.revertedWith("Invalid admin address");
    });

    it("Should reject zero address for oracle", async function () {
      const ProxifyClientRegistry = await ethers.getContractFactory("ProxifyClientRegistry");
      await expect(
        ProxifyClientRegistry.deploy(admin.address, ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid oracle address");
    });

    it("Should set correct constants", async function () {
      expect(await registry.MAX_FEE_BPS()).to.equal(10000);
      expect(await registry.MAX_TIERS_PER_CLIENT()).to.equal(20);
    });
  });

  describe("Client Registration", function () {
    it("Should allow oracle to register client", async function () {
      await expect(
        registry.connect(oracle).registerClient(
          clientId1,
          clientAddress.address,
          "Bitkub Exchange",
          500, // 5% client fee (deprecated, for compatibility)
          2000, // 20% service fee
          500 // 5% client share of service fee
        )
      )
        .to.emit(registry, "ClientRegistered")
        .withArgs(clientId1, clientAddress.address, "Bitkub Exchange")
        .to.emit(registry, "ClientActivated")
        .withArgs(clientId1);

      const clientInfo = await registry.getClientInfo(clientId1);
      expect(clientInfo.name).to.equal("Bitkub Exchange");
      expect(clientInfo.clientAddress).to.equal(clientAddress.address);
      expect(clientInfo.feeBps).to.equal(500);
      expect(clientInfo.serviceFeeBps).to.equal(2000);
      expect(clientInfo.clientFeeBps).to.equal(500);
      expect(clientInfo.isActive).to.be.true;
      expect(clientInfo.registeredAt).to.be.gt(0);
    });

    it("Should reject registration from non-oracle", async function () {
      await expect(
        registry.connect(user1).registerClient(
          clientId1,
          clientAddress.address,
          "Bitkub",
          500,
          2000,
          500
        )
      ).to.be.reverted;
    });

    it("Should reject zero clientId", async function () {
      await expect(
        registry.connect(oracle).registerClient(
          ethers.ZeroHash,
          clientAddress.address,
          "Bitkub",
          500,
          2000
        )
      ).to.be.revertedWith("Invalid clientId");
    });

    it("Should reject zero client address", async function () {
      await expect(
        registry.connect(oracle).registerClient(
          clientId1,
          ethers.ZeroAddress,
          "Bitkub",
          500,
          2000
        )
      ).to.be.revertedWith("Invalid client address");
    });

    it("Should reject empty client name", async function () {
      await expect(
        registry.connect(oracle).registerClient(
          clientId1,
          clientAddress.address,
          "",
          500,
          2000
        )
      ).to.be.revertedWith("Name cannot be empty");
    });

    it("Should reject duplicate client registration", async function () {
      await registry.connect(oracle).registerClient(
        clientId1,
        clientAddress.address,
        "Bitkub",
        500,
        2000
      );

      await expect(
        registry.connect(oracle).registerClient(
          clientId1,
          clientAddress.address,
          "Bitkub Again",
          500,
          2000
        )
      ).to.be.revertedWith("Client already registered");
    });

    it("Should reject invalid fee parameters", async function () {
      await expect(
        registry.connect(oracle).registerClient(
          clientId1,
          clientAddress.address,
          "Bitkub",
          10001, // > 100%
          2000
        )
      ).to.be.revertedWith("Invalid feeBps");

      await expect(
        registry.connect(oracle).registerClient(
          clientId1,
          clientAddress.address,
          "Bitkub",
          500,
          10001 // > 100%
        )
      ).to.be.revertedWith("Invalid serviceFeeBps");
    });
  });

  describe("Client Activation/Deactivation", function () {
    beforeEach(async function () {
      await registry.connect(oracle).registerClient(
        clientId1,
        clientAddress.address,
        "Bitkub",
        500,
        2000
      );
    });

    it("Should allow admin to deactivate client", async function () {
      await expect(registry.connect(admin).deactivateClient(clientId1))
        .to.emit(registry, "ClientDeactivated")
        .withArgs(clientId1);

      expect(await registry.isClientActive(clientId1)).to.be.false;
      expect(await registry.isClientRegistered(clientId1)).to.be.true;
    });

    it("Should allow admin to reactivate client", async function () {
      await registry.connect(admin).deactivateClient(clientId1);

      await expect(registry.connect(admin).activateClient(clientId1))
        .to.emit(registry, "ClientActivated")
        .withArgs(clientId1);

      expect(await registry.isClientActive(clientId1)).to.be.true;
    });

    it("Should reject deactivation from non-admin", async function () {
      await expect(
        registry.connect(user1).deactivateClient(clientId1)
      ).to.be.reverted;
    });

    it("Should reject activation of already active client", async function () {
      await expect(
        registry.connect(admin).activateClient(clientId1)
      ).to.be.revertedWith("Client already active");
    });

    it("Should reject deactivation of already inactive client", async function () {
      await registry.connect(admin).deactivateClient(clientId1);
      await expect(
        registry.connect(admin).deactivateClient(clientId1)
      ).to.be.revertedWith("Client already inactive");
    });
  });

  describe("Client Address Management", function () {
    beforeEach(async function () {
      await registry.connect(oracle).registerClient(
        clientId1,
        clientAddress.address,
        "Bitkub",
        500,
        2000
      );
    });

    it("Should allow admin to update client address", async function () {
      await expect(
        registry.connect(admin).updateClientAddress(clientId1, user1.address)
      )
        .to.emit(registry, "ClientAddressUpdated")
        .withArgs(clientId1, clientAddress.address, user1.address);

      const clientInfo = await registry.getClientInfo(clientId1);
      expect(clientInfo.clientAddress).to.equal(user1.address);
    });

    it("Should reject zero address", async function () {
      await expect(
        registry.connect(admin).updateClientAddress(clientId1, ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid new address");
    });

    it("Should reject update from non-admin", async function () {
      await expect(
        registry.connect(user1).updateClientAddress(clientId1, user1.address)
      ).to.be.reverted;
    });
  });

  describe("Client Fee Configuration", function () {
    beforeEach(async function () {
      await registry.connect(oracle).registerClient(
        clientId1,
        clientAddress.address,
        "Bitkub",
        500,
        2000
      );
    });

    it("Should allow admin to update fees", async function () {
      await expect(
        registry.connect(admin).updateClientFees(clientId1, 1000, 1500)
      )
        .to.emit(registry, "ClientFeeConfigUpdated")
        .withArgs(clientId1, 1000, 1500);

      const clientInfo = await registry.getClientInfo(clientId1);
      expect(clientInfo.feeBps).to.equal(1000);
      expect(clientInfo.serviceFeeBps).to.equal(1500);
    });

    it("Should reject invalid fee values", async function () {
      await expect(
        registry.connect(admin).updateClientFees(clientId1, 10001, 2000)
      ).to.be.revertedWith("Invalid feeBps");

      await expect(
        registry.connect(admin).updateClientFees(clientId1, 500, 10001)
      ).to.be.revertedWith("Invalid serviceFeeBps");
    });
  });

  describe("Risk Tier Management", function () {
    beforeEach(async function () {
      await registry.connect(oracle).registerClient(
        clientId1,
        clientAddress.address,
        "Bitkub",
        500,
        2000
      );
    });

    it("Should allow admin to set risk tiers", async function () {
      const tiers = [
        {
          tierId: tierLowRisk,
          name: "Low Risk - Aave/Compound",
          allocationBps: 7000, // 70%
          isActive: true
        },
        {
          tierId: tierModerateRisk,
          name: "Moderate Risk - Curve",
          allocationBps: 2000, // 20%
          isActive: true
        },
        {
          tierId: tierHighRisk,
          name: "High Risk - DeFi Protocols",
          allocationBps: 1000, // 10%
          isActive: true
        }
      ];

      await expect(
        registry.connect(admin).setClientRiskTiers(clientId1, tiers)
      )
        .to.emit(registry, "ClientRiskTiersUpdated")
        .withArgs(clientId1, 3);

      const retrievedTiers = await registry.getClientRiskTiers(clientId1);
      expect(retrievedTiers.length).to.equal(3);
      expect(retrievedTiers[0].tierId).to.equal(tierLowRisk);
      expect(retrievedTiers[0].allocationBps).to.equal(7000);
    });

    it("Should reject tiers that don't sum to 100%", async function () {
      const invalidTiers = [
        {
          tierId: tierLowRisk,
          name: "Low Risk",
          allocationBps: 7000,
          isActive: true
        },
        {
          tierId: tierModerateRisk,
          name: "Moderate Risk",
          allocationBps: 2000,
          isActive: true
        }
        // Missing 1000 bps
      ];

      await expect(
        registry.connect(admin).setClientRiskTiers(clientId1, invalidTiers)
      ).to.be.revertedWith("Allocations must sum to 100%");
    });

    it("Should reject duplicate tier IDs", async function () {
      const duplicateTiers = [
        {
          tierId: tierLowRisk,
          name: "Low Risk 1",
          allocationBps: 5000,
          isActive: true
        },
        {
          tierId: tierLowRisk, // Duplicate
          name: "Low Risk 2",
          allocationBps: 5000,
          isActive: true
        }
      ];

      await expect(
        registry.connect(admin).setClientRiskTiers(clientId1, duplicateTiers)
      ).to.be.revertedWith("Duplicate tierId");
    });

    it("Should reject empty tier array", async function () {
      await expect(
        registry.connect(admin).setClientRiskTiers(clientId1, [])
      ).to.be.revertedWith("At least one tier required");
    });

    it("Should reject too many tiers", async function () {
      const tooManyTiers = Array.from({ length: 21 }, (_, i) => ({
        tierId: ethers.keccak256(ethers.toUtf8Bytes(`TIER_${i}`)),
        name: `Tier ${i}`,
        allocationBps: i === 0 ? 10000 : 0,
        isActive: true
      }));

      await expect(
        registry.connect(admin).setClientRiskTiers(clientId1, tooManyTiers)
      ).to.be.revertedWith("Too many tiers");
    });

    it("Should reject invalid tier data", async function () {
      // Zero tierId
      await expect(
        registry.connect(admin).setClientRiskTiers(clientId1, [{
          tierId: ethers.ZeroHash,
          name: "Test",
          allocationBps: 10000,
          isActive: true
        }])
      ).to.be.revertedWith("Invalid tierId");

      // Empty name
      await expect(
        registry.connect(admin).setClientRiskTiers(clientId1, [{
          tierId: tierLowRisk,
          name: "",
          allocationBps: 10000,
          isActive: true
        }])
      ).to.be.revertedWith("Tier name required");
    });
  });

  describe("Tier Allocation Updates", function () {
    beforeEach(async function () {
      await registry.connect(oracle).registerClient(
        clientId1,
        clientAddress.address,
        "Bitkub",
        500,
        2000
      );

      const tiers = [
        {
          tierId: tierLowRisk,
          name: "Low Risk",
          allocationBps: 7000,
          isActive: true
        },
        {
          tierId: tierModerateRisk,
          name: "Moderate Risk",
          allocationBps: 2000,
          isActive: true
        },
        {
          tierId: tierHighRisk,
          name: "High Risk",
          allocationBps: 1000,
          isActive: true
        }
      ];

      await registry.connect(admin).setClientRiskTiers(clientId1, tiers);
    });

    it("Should update tier allocation", async function () {
      // Update LOW_RISK from 70% to 60%, others remain same
      await registry.connect(admin).updateTierAllocation(clientId1, tierLowRisk, 6000);
      await registry.connect(admin).updateTierAllocation(clientId1, tierModerateRisk, 3000);

      const tiers = await registry.getClientRiskTiers(clientId1);
      expect(tiers[0].allocationBps).to.equal(6000);
      expect(tiers[1].allocationBps).to.equal(3000);
    });

    it("Should reject allocation update that breaks 100% rule", async function () {
      await expect(
        registry.connect(admin).updateTierAllocation(clientId1, tierLowRisk, 8000)
      ).to.be.revertedWith("Allocations must sum to 100%");
    });

    it("Should activate/deactivate specific tier", async function () {
      await registry.connect(admin).setTierActive(clientId1, tierHighRisk, false);

      const tier = await registry.getClientRiskTier(clientId1, tierHighRisk);
      expect(tier.isActive).to.be.false;

      await registry.connect(admin).setTierActive(clientId1, tierHighRisk, true);
      const tierAfter = await registry.getClientRiskTier(clientId1, tierHighRisk);
      expect(tierAfter.isActive).to.be.true;
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await registry.connect(oracle).registerClient(
        clientId1,
        clientAddress.address,
        "Bitkub",
        500,
        2000
      );

      const tiers = [
        {
          tierId: tierLowRisk,
          name: "Low Risk",
          allocationBps: 7000,
          isActive: true
        },
        {
          tierId: tierModerateRisk,
          name: "Moderate Risk",
          allocationBps: 3000,
          isActive: true
        }
      ];

      await registry.connect(admin).setClientRiskTiers(clientId1, tiers);
    });

    it("Should return correct client info", async function () {
      const info = await registry.getClientInfo(clientId1);
      expect(info.name).to.equal("Bitkub");
      expect(info.clientAddress).to.equal(clientAddress.address);
      expect(info.feeBps).to.equal(500);
      expect(info.serviceFeeBps).to.equal(2000);
    });

    it("Should return correct client address", async function () {
      const addr = await registry.getClientAddress(clientId1);
      expect(addr).to.equal(clientAddress.address);
    });

    it("Should check if client is active", async function () {
      expect(await registry.isClientActive(clientId1)).to.be.true;

      await registry.connect(admin).deactivateClient(clientId1);
      expect(await registry.isClientActive(clientId1)).to.be.false;
    });

    it("Should check if client is registered", async function () {
      expect(await registry.isClientRegistered(clientId1)).to.be.true;
      expect(await registry.isClientRegistered(clientId2)).to.be.false;
    });

    it("Should return all risk tiers", async function () {
      const tiers = await registry.getClientRiskTiers(clientId1);
      expect(tiers.length).to.equal(2);
      expect(tiers[0].tierId).to.equal(tierLowRisk);
      expect(tiers[1].tierId).to.equal(tierModerateRisk);
    });

    it("Should return specific risk tier", async function () {
      const tier = await registry.getClientRiskTier(clientId1, tierLowRisk);
      expect(tier.tierId).to.equal(tierLowRisk);
      expect(tier.name).to.equal("Low Risk");
      expect(tier.allocationBps).to.equal(7000);
    });

    it("Should check if tier exists", async function () {
      expect(await registry.hasTier(clientId1, tierLowRisk)).to.be.true;
      expect(await registry.hasTier(clientId1, tierHighRisk)).to.be.false;
    });

    it("Should validate tier allocations", async function () {
      const validTiers = [
        { tierId: tierLowRisk, name: "Low", allocationBps: 6000, isActive: true },
        { tierId: tierModerateRisk, name: "Mod", allocationBps: 4000, isActive: true }
      ];

      const invalidTiers = [
        { tierId: tierLowRisk, name: "Low", allocationBps: 6000, isActive: true },
        { tierId: tierModerateRisk, name: "Mod", allocationBps: 3000, isActive: true }
      ];

      expect(await registry.validateTierAllocations(validTiers)).to.be.true;
      expect(await registry.validateTierAllocations(invalidTiers)).to.be.false;
    });
  });

  describe("Edge Cases", function () {
    it("Should handle 100% allocation to single tier", async function () {
      await registry.connect(oracle).registerClient(
        clientId1,
        clientAddress.address,
        "Bitkub",
        500,
        2000
      );

      const singleTier = [{
        tierId: tierLowRisk,
        name: "Single Tier",
        allocationBps: 10000,
        isActive: true
      }];

      await registry.connect(admin).setClientRiskTiers(clientId1, singleTier);

      const tiers = await registry.getClientRiskTiers(clientId1);
      expect(tiers.length).to.equal(1);
      expect(tiers[0].allocationBps).to.equal(10000);
    });

    it("Should handle maximum number of tiers", async function () {
      await registry.connect(oracle).registerClient(
        clientId1,
        clientAddress.address,
        "Bitkub",
        500,
        2000
      );

      const maxTiers = Array.from({ length: 20 }, (_, i) => ({
        tierId: ethers.keccak256(ethers.toUtf8Bytes(`TIER_${i}`)),
        name: `Tier ${i}`,
        allocationBps: i === 0 ? 10000 : 0,
        isActive: true
      }));

      // Adjust to sum to 10000
      maxTiers[0].allocationBps = 500;
      for (let i = 1; i < 20; i++) {
        maxTiers[i].allocationBps = 500;
      }

      await registry.connect(admin).setClientRiskTiers(clientId1, maxTiers);

      const tiers = await registry.getClientRiskTiers(clientId1);
      expect(tiers.length).to.equal(20);
    });
  });
});
