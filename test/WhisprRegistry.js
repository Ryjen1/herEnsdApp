"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const hardhat_1 = __importDefault(require("hardhat"));
const network_helpers_1 = require("@nomicfoundation/hardhat-toolbox/network-helpers");
describe("WhisprRegistry", function () {
    async function deployRegistryFixture() {
        const [owner, user1, user2] = await hardhat_1.default.ethers.getSigners();
        // Deploy mock ENS contract
        const ENS = await hardhat_1.default.ethers.getContractFactory("ENS");
        const ens = await ENS.deploy();
        // Deploy WhisprRegistry
        const WhisprRegistry = await hardhat_1.default.ethers.getContractFactory("WhisprRegistry");
        const registry = await WhisprRegistry.deploy(await ens.getAddress());
        return { registry, ens, owner, user1, user2 };
    }
    describe("Deployment", function () {
        it("Should set the ENS address", async function () {
            const { registry, ens } = await (0, network_helpers_1.loadFixture)(deployRegistryFixture);
            (0, chai_1.expect)(await registry.ens()).to.equal(await ens.getAddress());
        });
    });
    describe("Registration", function () {
        it("Should allow registration with valid ENS ownership", async function () {
            const { registry, ens, user1 } = await (0, network_helpers_1.loadFixture)(deployRegistryFixture);
            const ensName = "alice.eth";
            const node = hardhat_1.default.ethers.keccak256(hardhat_1.default.ethers.toUtf8Bytes(ensName));
            // Set owner of the ENS name
            await ens.setOwner(node, user1.address);
            await (0, chai_1.expect)(registry.connect(user1).register(ensName))
                .to.emit(registry, "Registered")
                .withArgs(user1.address, ensName.toLowerCase());
            (0, chai_1.expect)(await registry.addressToEnsName(user1.address)).to.equal(ensName.toLowerCase());
            (0, chai_1.expect)(await registry.ensNameToAddress(ensName.toLowerCase())).to.equal(user1.address);
        });
        it("Should reject registration if not ENS owner", async function () {
            const { registry, user1, user2 } = await (0, network_helpers_1.loadFixture)(deployRegistryFixture);
            const ensName = "alice.eth";
            await (0, chai_1.expect)(registry.connect(user1).register(ensName)).to.be.revertedWith("Not ENS name owner");
        });
        it("Should reject duplicate registration", async function () {
            const { registry, ens, user1 } = await (0, network_helpers_1.loadFixture)(deployRegistryFixture);
            const ensName = "alice.eth";
            const node = hardhat_1.default.ethers.keccak256(hardhat_1.default.ethers.toUtf8Bytes(ensName));
            await ens.setOwner(node, user1.address);
            await registry.connect(user1).register(ensName);
            await (0, chai_1.expect)(registry.connect(user1).register("bob.eth")).to.be.revertedWith("Already registered");
        });
        it("Should reject if ENS name already taken", async function () {
            const { registry, ens, user1, user2 } = await (0, network_helpers_1.loadFixture)(deployRegistryFixture);
            const ensName = "alice.eth";
            const node = hardhat_1.default.ethers.keccak256(hardhat_1.default.ethers.toUtf8Bytes(ensName));
            await ens.setOwner(node, user1.address);
            await registry.connect(user1).register(ensName);
            // Try to register same name with different user
            await (0, chai_1.expect)(registry.connect(user2).register(ensName)).to.be.revertedWith("ENS name already taken");
        });
    });
    describe("ENS Name Retrieval", function () {
        it("Should return ENS name for registered address", async function () {
            const { registry, ens, user1 } = await (0, network_helpers_1.loadFixture)(deployRegistryFixture);
            const ensName = "alice.eth";
            const node = hardhat_1.default.ethers.keccak256(hardhat_1.default.ethers.toUtf8Bytes(ensName));
            await ens.setOwner(node, user1.address);
            await registry.connect(user1).register(ensName);
            (0, chai_1.expect)(await registry.getEnsName(user1.address)).to.equal(ensName.toLowerCase());
        });
        it("Should return empty string for unregistered address", async function () {
            const { registry, user1 } = await (0, network_helpers_1.loadFixture)(deployRegistryFixture);
            (0, chai_1.expect)(await registry.getEnsName(user1.address)).to.equal("");
        });
    });
});
