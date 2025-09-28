import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  // Deploy WhisprRegistry
  const WhisprRegistry = await ethers.getContractFactory("WhisprRegistry");
  console.log("Deploying WhisprRegistry...");
  const registry = await WhisprRegistry.deploy(); // No ENS dependency needed
  await registry.waitForDeployment(); // Explicitly wait for deployment
  const registryAddress = await registry.getAddress();
  console.log("WhisprRegistry deployed to:", registryAddress);

  // Deploy WhisprChat with 300 second (5 minute) interval for oracle updates
  const WhisprChat = await ethers.getContractFactory("WhisprChat");
  console.log("Deploying WhisprChat...");
  const chat = await WhisprChat.deploy(300);
  await chat.waitForDeployment();
  const chatAddress = await chat.getAddress();
  console.log("WhisprChat deployed to:", chatAddress);

  // Note: WhisprMulticall contract not found, skipping deployment
  console.log("Skipping WhisprMulticall deployment - contract not found");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});