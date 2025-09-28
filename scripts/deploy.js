"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
async function main() {
    const [deployer] = await hardhat_1.ethers.getSigners();
    console.log("Deploying contracts with:", deployer.address);
    // Deploy WhisprRegistry
    const WhisprRegistry = await hardhat_1.ethers.getContractFactory("WhisprRegistry");
    console.log("Deploying WhisprRegistry...");
    const registry = await WhisprRegistry.deploy("0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"); // Sepolia ENS
    await registry.waitForDeployment(); // Explicitly wait for deployment
    const registryAddress = await registry.getAddress();
    console.log("WhisprRegistry deployed to:", registryAddress);
    // Deploy WhisprChat
    const WhisprChat = await hardhat_1.ethers.getContractFactory("WhisprChat");
    console.log("Deploying WhisprChat...");
    const chat = await WhisprChat.deploy();
    await chat.waitForDeployment();
    const chatAddress = await chat.getAddress();
    console.log("WhisprChat deployed to:", chatAddress);
    // Deploy WhisprMulticall
    const WhisprMulticall = await hardhat_1.ethers.getContractFactory("WhisprMulticall");
    console.log("Deploying WhisprMulticall...");
    const multicall = await WhisprMulticall.deploy();
    await multicall.waitForDeployment();
    const multicallAddress = await multicall.getAddress();
    console.log("WhisprMulticall deployed to:", multicallAddress);
}
main().catch((error) => {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
});
