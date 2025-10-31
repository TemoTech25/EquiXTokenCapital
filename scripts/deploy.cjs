const { ethers, network } = require("hardhat");
const fs = require("fs").promises;
const path = require("path");
require("dotenv").config();

const DEPLOYMENTS_DIR = path.join(__dirname, "..", "deployments");

const registryKey = (label) => ethers.utils.id(label);

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with: ${deployer.address}`);

  const deployments = {};

  const registryFactory = await ethers.getContractFactory("ContractRegistry");
  const registry = await registryFactory.deploy(deployer.address);
  await registry.deployed();
  deployments.ContractRegistry = registry.address;
  console.log(`ContractRegistry: ${registry.address}`);

  const complianceFactory = await ethers.getContractFactory("ComplianceOracle");
  const compliance = await complianceFactory.deploy(deployer.address);
  await compliance.deployed();
  deployments.ComplianceOracle = compliance.address;
  console.log(`ComplianceOracle: ${compliance.address}`);

  const propertyFactory = await ethers.getContractFactory("PropertyToken");
  const propertyToken = await propertyFactory.deploy(deployer.address);
  await propertyToken.deployed();
  deployments.PropertyToken = propertyToken.address;
  console.log(`PropertyToken: ${propertyToken.address}`);

  const stablecoinAddress = await ensureStablecoin(deployments);

  const escrowFactory = await ethers.getContractFactory("EscrowManager");
  const escrowManager = await escrowFactory.deploy(deployer.address, compliance.address);
  await escrowManager.deployed();
  deployments.EscrowManager = escrowManager.address;
  console.log(`EscrowManager: ${escrowManager.address}`);

  const investmentFactory = await ethers.getContractFactory("InvestmentOffering");
  const investmentOffering = await investmentFactory.deploy(
    deployer.address,
    stablecoinAddress,
    escrowManager.address,
    propertyToken.address,
    compliance.address,
  );
  await investmentOffering.deployed();
  deployments.InvestmentOffering = investmentOffering.address;
  console.log(`InvestmentOffering: ${investmentOffering.address}`);

  const revenueFactory = await ethers.getContractFactory("RevenueDistribution");
  const revenueDistribution = await revenueFactory.deploy(deployer.address, propertyToken.address, stablecoinAddress);
  await revenueDistribution.deployed();
  deployments.RevenueDistribution = revenueDistribution.address;
  console.log(`RevenueDistribution: ${revenueDistribution.address}`);

  const registryContract = await ethers.getContractFactory("PropertyRegistry");
  const propertyRegistry = await registryContract.deploy(deployer.address);
  await propertyRegistry.deployed();
  deployments.PropertyRegistry = propertyRegistry.address;
  console.log(`PropertyRegistry: ${propertyRegistry.address}`);

  const deedFactory = await ethers.getContractFactory("DigitalTitleDeed");
  const digitalTitleDeed = await deedFactory.deploy(deployer.address);
  await digitalTitleDeed.deployed();
  deployments.DigitalTitleDeed = digitalTitleDeed.address;
  console.log(`DigitalTitleDeed: ${digitalTitleDeed.address}`);

  const identityFactory = await ethers.getContractFactory("IdentityRegistry");
  const identityRegistry = await identityFactory.deploy(deployer.address);
  await identityRegistry.deployed();
  deployments.IdentityRegistry = identityRegistry.address;
  console.log(`IdentityRegistry: ${identityRegistry.address}`);

  const marketplaceFactory = await ethers.getContractFactory("Marketplace");
  const marketplace = await marketplaceFactory.deploy(deployer.address);
  await marketplace.deployed();
  deployments.Marketplace = marketplace.address;
  console.log(`Marketplace: ${marketplace.address}`);

  const governanceFactory = await ethers.getContractFactory("GovernanceDAO");
  const governance = await governanceFactory.deploy(deployer.address, propertyToken.address);
  await governance.deployed();
  deployments.GovernanceDAO = governance.address;
  console.log(`GovernanceDAO: ${governance.address}`);

  const bridgeFactory = await ethers.getContractFactory("StablecoinBridge");
  const bridge = await bridgeFactory.deploy(deployer.address, stablecoinAddress, ethers.utils.parseUnits("1", 18));
  await bridge.deployed();
  deployments.StablecoinBridge = bridge.address;
  console.log(`StablecoinBridge: ${bridge.address}`);

  const keys = new Map([
    ["COMPLIANCE_ORACLE", compliance.address],
    ["PROPERTY_TOKEN", propertyToken.address],
    ["ESCROW_MANAGER", escrowManager.address],
    ["INVESTMENT_OFFERING", investmentOffering.address],
    ["REVENUE_DISTRIBUTION", revenueDistribution.address],
    ["PROPERTY_REGISTRY", propertyRegistry.address],
    ["DIGITAL_TITLE_DEED", digitalTitleDeed.address],
    ["IDENTITY_REGISTRY", identityRegistry.address],
    ["MARKETPLACE", marketplace.address],
    ["GOVERNANCE_DAO", governance.address],
    ["STABLECOIN_BRIDGE", bridge.address],
  ]);

  for (const [label, addr] of keys.entries()) {
    const tx = await registry.setAddress(registryKey(label), addr);
    await tx.wait();
  }

  await saveDeployments(deployments);
  console.log("Deployment complete.");
}

async function ensureStablecoin(deployments) {
  const preconfigured = process.env.STABLECOIN_ADDRESS;
  if (preconfigured) {
    console.log(`Using provided stablecoin: ${preconfigured}`);
    return preconfigured;
  }
  const mockFactory = await ethers.getContractFactory("MockERC20");
  const mock = await mockFactory.deploy("MockUSD", "MUSD", 18);
  await mock.deployed();
  deployments.MockERC20 = mock.address;
  console.log(`MockERC20 deployed: ${mock.address}`);
  return mock.address;
}

async function saveDeployments(deployments) {
  const output = {
    network: network.name,
    timestamp: new Date().toISOString(),
    contracts: deployments,
  };
  await fs.mkdir(DEPLOYMENTS_DIR, { recursive: true });
  const file = path.join(DEPLOYMENTS_DIR, `${network.name}.json`);
  await fs.writeFile(file, JSON.stringify(output, null, 2));
  console.log(`Wrote deployments to ${file}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
