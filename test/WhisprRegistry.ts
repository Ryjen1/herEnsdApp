import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("WhisprRegistry", function () {
  async function deployRegistryFixture() {
    const [owner, user1, user2] = await hre.ethers.getSigners();

    // Deploy mock ENS contract
    const ENS = await hre.ethers.getContractFactory("ENS");
    const ens = await ENS.deploy();

    // Deploy WhisprRegistry
    const WhisprRegistry = await hre.ethers.getContractFactory("WhisprRegistry");
    const registry = await WhisprRegistry.deploy(await ens.getAddress());

    return { registry, ens, owner, user1, user2 };
  }

  describe("Deployment", function () {
    it("Should set the ENS address", async function () {
      const { registry, ens } = await loadFixture(deployRegistryFixture);
      expect(await registry.ens()).to.equal(await ens.getAddress());
    });
  });

  describe("Registration", function () {
    it("Should allow registration with valid ENS ownership", async function () {
      const { registry, ens, user1 } = await loadFixture(deployRegistryFixture);

      const ensName = "alice.eth";
      const node = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(ensName));

      // Set owner of the ENS name
      await ens.setOwner(node, user1.address);

      await expect(registry.connect(user1).register(ensName))
        .to.emit(registry, "Registered")
        .withArgs(user1.address, ensName.toLowerCase());

      expect(await registry.addressToEnsName(user1.address)).to.equal(ensName.toLowerCase());
      expect(await registry.ensNameToAddress(ensName.toLowerCase())).to.equal(user1.address);
    });

    it("Should reject registration if not ENS owner", async function () {
      const { registry, user1, user2 } = await loadFixture(deployRegistryFixture);

      const ensName = "alice.eth";

      await expect(registry.connect(user1).register(ensName)).to.be.revertedWith("Not ENS name owner");
    });

    it("Should reject duplicate registration", async function () {
      const { registry, ens, user1 } = await loadFixture(deployRegistryFixture);

      const ensName = "alice.eth";
      const node = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(ensName));

      await ens.setOwner(node, user1.address);
      await registry.connect(user1).register(ensName);

      await expect(registry.connect(user1).register("bob.eth")).to.be.revertedWith("Already registered");
    });

    it("Should reject if ENS name already taken", async function () {
      const { registry, ens, user1, user2 } = await loadFixture(deployRegistryFixture);

      const ensName = "alice.eth";
      const node = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(ensName));

      await ens.setOwner(node, user1.address);
      await registry.connect(user1).register(ensName);

      // Try to register same name with different user
      await expect(registry.connect(user2).register(ensName)).to.be.revertedWith("ENS name already taken");
    });
  });

  describe("ENS Name Retrieval", function () {
    it("Should return ENS name for registered address", async function () {
      const { registry, ens, user1 } = await loadFixture(deployRegistryFixture);

      const ensName = "alice.eth";
      const node = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(ensName));

      await ens.setOwner(node, user1.address);
      await registry.connect(user1).register(ensName);

      expect(await registry.getEnsName(user1.address)).to.equal(ensName.toLowerCase());
    });

    it("Should return empty string for unregistered address", async function () {
      const { registry, user1 } = await loadFixture(deployRegistryFixture);

      expect(await registry.getEnsName(user1.address)).to.equal("");
    });
  });
});