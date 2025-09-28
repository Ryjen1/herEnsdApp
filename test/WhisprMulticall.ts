import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("WhisprMulticall", function () {
  async function deployMulticallFixture() {
    const Multicall = await hre.ethers.getContractFactory("WhisprMulticall");
    const multicall = await Multicall.deploy();

    // Deploy a simple test contract
    const TestContract = await hre.ethers.getContractFactory("TestContract");
    const testContract = await TestContract.deploy();

    return { multicall, testContract };
  }

  // Simple test contract for multicall testing
  before(async function () {
    const TestContract = await hre.ethers.getContractFactory("TestContract");
    try {
      await TestContract.deploy();
    } catch {
      // If already deployed or doesn't exist, skip
    }
  });

  describe("Aggregate", function () {
    it("Should aggregate multiple calls successfully", async function () {
      const { multicall } = await loadFixture(deployMulticallFixture);

      // For simplicity, we'll test with the multicall contract itself
      const calls = [
        {
          target: await multicall.getAddress(),
          callData: multicall.interface.encodeFunctionData("aggregate", [[]])
        }
      ];

      const result = await multicall.aggregate(calls);
      expect(result).to.be.an('array');
    });

    it("Should fail if any call fails", async function () {
      const { multicall } = await loadFixture(deployMulticallFixture);

      // Create a call that will fail
      const calls = [
        {
          target: await multicall.getAddress(),
          callData: "0x12345678" // Invalid function selector
        }
      ];

      await expect(multicall.aggregate(calls)).to.be.rejectedWith("Call failed");
    });
  });
});