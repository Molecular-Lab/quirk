import { expect } from "chai";
import { network } from "hardhat";
import type { ClientRegistry } from "../typechain-types.js";
import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

const { ethers } = await network.connect();

describe("ClientRegistry", function () {
  let clientRegistry: ClientRegistry;
  let admin: SignerWithAddress;
  let oracle: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const clientId1 = ethers.keccak256(ethers.toUtf8Bytes("bitkub"));
  const clientId2 = ethers.keccak256(ethers.toUtf8Bytes("rise"));

  beforeEach(async function () {
    [admin, oracle, user1, user2] = await ethers.getSigners();

    const ClientRegistry = await ethers.getContractFactory("ClientRegistry");
    clientRegistry = await ClientRegistry.deploy(admin.address, oracle.address);
    await clientRegistry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set correct admin role", async function () {
      const DEFAULT_ADMIN_ROLE = await clientRegistry.DEFAULT_ADMIN_ROLE();
      expect(await clientRegistry.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
    });

    it("Should set correct oracle role", async function () {
      const ORACLE_ROLE = await clientRegistry.ORACLE_ROLE();
      expect(await clientRegistry.hasRole(ORACLE_ROLE, oracle.address)).to.be.true;
    });

    it("Should reject zero address for admin", async function () {
      const ClientRegistry = await ethers.getContractFactory("ClientRegistry");
      await expect(
        ClientRegistry.deploy(ethers.ZeroAddress, oracle.address)
      ).to.be.revertedWith("Invalid admin address");
    });

    it("Should reject zero address for oracle", async function () {
      const ClientRegistry = await ethers.getContractFactory("ClientRegistry");
      await expect(
        ClientRegistry.deploy(admin.address, ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid oracle address");
    });
  });

  describe("Client Registration", function () {
    it("Should allow oracle to register client", async function () {
      await expect(
        clientRegistry.connect(oracle).registerClient(clientId1, "Bitkub Exchange")
      )
        .to.emit(clientRegistry, "ClientRegistered")
        .withArgs(clientId1, "Bitkub Exchange");

      const clientInfo = await clientRegistry.getClient(clientId1);
      expect(clientInfo.name).to.equal("Bitkub Exchange");
      expect(clientInfo.isActive).to.be.true;
      expect(clientInfo.registeredAt).to.be.gt(0);
    });

    it("Should reject registration from non-oracle", async function () {
      await expect(
        clientRegistry.connect(user1).registerClient(clientId1, "Bitkub")
      ).to.be.reverted;
    });

    it("Should reject empty client name", async function () {
      await expect(
        clientRegistry.connect(oracle).registerClient(clientId1, "")
      ).to.be.revertedWith("Client name cannot be empty");
    });

    it("Should reject duplicate client registration", async function () {
      await clientRegistry.connect(oracle).registerClient(clientId1, "Bitkub");

      await expect(
        clientRegistry.connect(oracle).registerClient(clientId1, "Bitkub Again")
      ).to.be.revertedWith("Client already registered");
    });

    it("Should register multiple clients", async function () {
      await clientRegistry.connect(oracle).registerClient(clientId1, "Bitkub");
      await clientRegistry.connect(oracle).registerClient(clientId2, "Rise");

      expect(await clientRegistry.isClientActive(clientId1)).to.be.true;
      expect(await clientRegistry.isClientActive(clientId2)).to.be.true;
    });
  });

  describe("Client Activation/Deactivation", function () {
    beforeEach(async function () {
      await clientRegistry.connect(oracle).registerClient(clientId1, "Bitkub");
    });

    it("Should allow admin to deactivate client", async function () {
      await expect(
        clientRegistry.connect(admin).deactivateClient(clientId1)
      )
        .to.emit(clientRegistry, "ClientDeactivated")
        .withArgs(clientId1);

      expect(await clientRegistry.isClientActive(clientId1)).to.be.false;
    });

    it("Should allow admin to reactivate client", async function () {
      await clientRegistry.connect(admin).deactivateClient(clientId1);

      await expect(
        clientRegistry.connect(admin).activateClient(clientId1)
      )
        .to.emit(clientRegistry, "ClientActivated")
        .withArgs(clientId1);

      expect(await clientRegistry.isClientActive(clientId1)).to.be.true;
    });

    it("Should reject activation from non-admin", async function () {
      await clientRegistry.connect(admin).deactivateClient(clientId1);

      await expect(
        clientRegistry.connect(user1).activateClient(clientId1)
      ).to.be.reverted;
    });

    it("Should reject deactivation from non-admin", async function () {
      await expect(
        clientRegistry.connect(user1).deactivateClient(clientId1)
      ).to.be.reverted;
    });

    it("Should reject activating already active client", async function () {
      await expect(
        clientRegistry.connect(admin).activateClient(clientId1)
      ).to.be.revertedWith("Client already active");
    });

    it("Should reject deactivating already inactive client", async function () {
      await clientRegistry.connect(admin).deactivateClient(clientId1);

      await expect(
        clientRegistry.connect(admin).deactivateClient(clientId1)
      ).to.be.revertedWith("Client already inactive");
    });

    it("Should reject activation of non-registered client", async function () {
      await expect(
        clientRegistry.connect(admin).activateClient(clientId2)
      ).to.be.revertedWith("Client not registered");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await clientRegistry.connect(oracle).registerClient(clientId1, "Bitkub");
    });

    it("Should return correct client info", async function () {
      const info = await clientRegistry.getClient(clientId1);

      expect(info.name).to.equal("Bitkub");
      expect(info.isActive).to.be.true;
      expect(info.registeredAt).to.be.gt(0);
    });

    it("Should return false for non-registered client", async function () {
      expect(await clientRegistry.isClientRegistered(clientId2)).to.be.false;
    });

    it("Should return true for registered client", async function () {
      expect(await clientRegistry.isClientRegistered(clientId1)).to.be.true;
    });

    it("Should return correct active status", async function () {
      expect(await clientRegistry.isClientActive(clientId1)).to.be.true;

      await clientRegistry.connect(admin).deactivateClient(clientId1);
      expect(await clientRegistry.isClientActive(clientId1)).to.be.false;
    });
  });
});
