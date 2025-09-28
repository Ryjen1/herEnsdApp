"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const hardhat_1 = __importDefault(require("hardhat"));
const network_helpers_1 = require("@nomicfoundation/hardhat-toolbox/network-helpers");
describe("WhisprMulticall", function () {
    async function deployMulticallFixture() {
        const Multicall = await hardhat_1.default.ethers.getContractFactory("WhisprMulticall");
        const multicall = await Multicall.deploy();
        // Deploy a simple test contract
        const TestContract = await hardhat_1.default.ethers.getContractFactory("TestContract");
        const testContract = await TestContract.deploy();
        return { multicall, testContract };
    }
    // Simple test contract for multicall testing
    before(async function () {
        const TestContract = await hardhat_1.default.ethers.getContractFactory("TestContract");
        try {
            await TestContract.deploy();
        }
        catch {
            // If already deployed or doesn't exist, skip
        }
    });
    describe("Aggregate", function () {
        it("Should aggregate multiple calls successfully", async function () {
            const { multicall } = await (0, network_helpers_1.loadFixture)(deployMulticallFixture);
            // For simplicity, we'll test with the multicall contract itself
            const calls = [
                {
                    target: await multicall.getAddress(),
                    callData: multicall.interface.encodeFunctionData("aggregate", [[]])
                }
            ];
            const result = await multicall.aggregate(calls);
            (0, chai_1.expect)(result).to.be.an('array');
        });
        it("Should fail if any call fails", async function () {
            const { multicall } = await (0, network_helpers_1.loadFixture)(deployMulticallFixture);
            // Create a call that will fail
            const calls = [
                {
                    target: await multicall.getAddress(),
                    callData: "0x12345678" // Invalid function selector
                }
            ];
            await (0, chai_1.expect)(multicall.aggregate(calls)).to.be.rejectedWith("Call failed");
        });
    });
});
