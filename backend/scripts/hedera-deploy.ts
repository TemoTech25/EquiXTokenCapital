import {
  AccountId,
  Client,
  ContractCreateTransaction,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractId,
  FileAppendTransaction,
  FileCreateTransaction,
  PrivateKey,
} from "@hashgraph/sdk";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type DeploymentRecord = Record<
  string,
  {
    contractId: string;
    solidityAddress: string;
  }
>;

const ARTIFACT_PATHS: Record<string, string> = {
  ContractRegistry: "common/ContractRegistry.sol/ContractRegistry.json",
  ComplianceOracle: "oracle/ComplianceOracle.sol/ComplianceOracle.json",
  PropertyToken: "property/PropertyToken.sol/PropertyToken.json",
  EscrowManager: "escrow/EscrowManager.sol/EscrowManager.json",
  InvestmentOffering: "offering/InvestmentOffering.sol/InvestmentOffering.json",
  RevenueDistribution: "revenue/RevenueDistribution.sol/RevenueDistribution.json",
  PropertyRegistry: "registry/PropertyRegistry.sol/PropertyRegistry.json",
  DigitalTitleDeed: "deeds/DigitalTitleDeed.sol/DigitalTitleDeed.json",
  IdentityRegistry: "identity/IdentityRegistry.sol/IdentityRegistry.json",
  Marketplace: "marketplace/Marketplace.sol/Marketplace.json",
  GovernanceDAO: "governance/GovernanceDAO.sol/GovernanceDAO.json",
  StablecoinBridge: "stablecoin/StablecoinBridge.sol/StablecoinBridge.json",
  MockERC20: "mocks/MockERC20.sol/MockERC20.json",
};

const DEPLOYMENTS_DIR = path.join(process.cwd(), "deployments");

async function main() {
  const operatorId = process.env.HEDERA_OPERATOR_ID;
  const operatorKeyStr = process.env.HEDERA_OPERATOR_KEY;
  if (!operatorId || !operatorKeyStr) {
    throw new Error("Set HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY in your environment.");
  }

  const networkName = (process.env.HEDERA_NETWORK ?? "testnet").toLowerCase();
  const client = createClient(networkName, operatorId, operatorKeyStr);

  const operatorAccount = AccountId.fromString(operatorId);
  const operatorAddress = `0x${operatorAccount.toSolidityAddress()}`;

  const deployments: DeploymentRecord = {};

  try {
    console.log(`Deploying to Hedera ${networkName} as ${operatorId}`);

    const registry = await deployContract(client, "ContractRegistry", ["address"], [operatorAddress]);
    deployments.ContractRegistry = registry;

    const compliance = await deployContract(client, "ComplianceOracle", ["address"], [operatorAddress]);
    deployments.ComplianceOracle = compliance;

    const propertyToken = await deployContract(client, "PropertyToken", ["address"], [operatorAddress]);
    deployments.PropertyToken = propertyToken;

    const stablecoinAddress = await ensureStablecoin(client, deployments);

    const escrowManager = await deployContract(client, "EscrowManager", ["address", "address"], [operatorAddress, compliance.solidityAddress]);
    deployments.EscrowManager = escrowManager;

    const investmentOffering = await deployContract(
      client,
      "InvestmentOffering",
      ["address", "address", "address", "address", "address"],
      [operatorAddress, stablecoinAddress, escrowManager.solidityAddress, propertyToken.solidityAddress, compliance.solidityAddress],
      8_000_000,
    );
    deployments.InvestmentOffering = investmentOffering;

    const revenueDistribution = await deployContract(
      client,
      "RevenueDistribution",
      ["address", "address", "address"],
      [operatorAddress, propertyToken.solidityAddress, stablecoinAddress],
    );
    deployments.RevenueDistribution = revenueDistribution;

    const propertyRegistry = await deployContract(client, "PropertyRegistry", ["address"], [operatorAddress]);
    deployments.PropertyRegistry = propertyRegistry;

    const digitalTitleDeed = await deployContract(client, "DigitalTitleDeed", ["address"], [operatorAddress]);
    deployments.DigitalTitleDeed = digitalTitleDeed;

    const identityRegistry = await deployContract(client, "IdentityRegistry", ["address"], [operatorAddress]);
    deployments.IdentityRegistry = identityRegistry;

    const marketplace = await deployContract(client, "Marketplace", ["address"], [operatorAddress]);
    deployments.Marketplace = marketplace;

    const governance = await deployContract(client, "GovernanceDAO", ["address", "address"], [operatorAddress, propertyToken.solidityAddress]);
    deployments.GovernanceDAO = governance;

    const bridge = await deployContract(
      client,
      "StablecoinBridge",
      ["address", "address", "uint256"],
      [operatorAddress, stablecoinAddress, ethers.parseUnits("1", 18)],
    );
    deployments.StablecoinBridge = bridge;

    await populateRegistry(client, registry.contractId, [
      ["COMPLIANCE_ORACLE", compliance.solidityAddress],
      ["PROPERTY_TOKEN", propertyToken.solidityAddress],
      ["ESCROW_MANAGER", escrowManager.solidityAddress],
      ["INVESTMENT_OFFERING", investmentOffering.solidityAddress],
      ["REVENUE_DISTRIBUTION", revenueDistribution.solidityAddress],
      ["PROPERTY_REGISTRY", propertyRegistry.solidityAddress],
      ["DIGITAL_TITLE_DEED", digitalTitleDeed.solidityAddress],
      ["IDENTITY_REGISTRY", identityRegistry.solidityAddress],
      ["MARKETPLACE", marketplace.solidityAddress],
      ["GOVERNANCE_DAO", governance.solidityAddress],
      ["STABLECOIN_BRIDGE", bridge.solidityAddress],
    ]);

    await writeDeployments(networkName, deployments);
    console.log("Hedera deployment complete.");
  } finally {
    client.close();
  }
}

function createClient(networkName: string, operatorId: string, operatorKeyStr: string): Client {
  const client =
    networkName === "mainnet"
      ? Client.forMainnet()
      : networkName === "previewnet"
      ? Client.forPreviewnet()
      : Client.forTestnet();

  const operatorKey = parsePrivateKey(operatorKeyStr);
  client.setOperator(operatorId, operatorKey);
  client.setMaxAttempts(20);
  client.setRequestTimeout(120_000);
  return client;
}

async function ensureStablecoin(client: Client, deployments: DeploymentRecord): Promise<string> {
  if (process.env.STABLECOIN_ADDRESS) {
    const normalized = toAbiAddress(process.env.STABLECOIN_ADDRESS);
    console.log(`Using provided stablecoin: ${normalized}`);
    return normalized;
  }

  const mock = await deployContract(client, "MockERC20", ["string", "string", "uint8"], ["MockUSD", "MUSD", 18]);
  deployments.MockERC20 = mock;
  return mock.solidityAddress;
}

async function deployContract(
  client: Client,
  name: keyof typeof ARTIFACT_PATHS,
  constructorTypes: string[] = [],
  constructorValues: any[] = [],
  gas: number = 6_000_000,
): Promise<{ contractId: string; solidityAddress: string }> {
  const artifact = await loadArtifact(name);
  const bytecode = Buffer.from(artifact.bytecode.object.replace(/^0x/, ""), "hex");
  const bytecodeFileId = await storeBytecode(client, bytecode);

  let encodedParamsHex = "0x";
  let constructorParams: Buffer | undefined;
  if (constructorTypes.length > 0) {
    const { encodedBytes, encodedHex } = buildConstructorParameters(constructorTypes, constructorValues);
    constructorParams = encodedBytes;
    encodedParamsHex = encodedHex;
    console.log(`${name} constructor params: ${encodedHex.slice(2)}`);
  }

  const txBuilder = new ContractCreateTransaction().setBytecodeFileId(bytecodeFileId).setGas(gas);
  if (constructorParams) {
    txBuilder.setConstructorParameters(constructorParams);
  }
  const tx = await txBuilder.execute(client);

  const receipt = await tx.getReceipt(client);
  const contractId = receipt.contractId;
  if (!contractId) {
    throw new Error(`Failed to deploy ${name}`);
  }

  const contractIdStr = contractId.toString();
  const solidityAddress = `0x${contractId.toSolidityAddress()}`;
  console.log(`${name}: ${contractIdStr} (${solidityAddress})`);
  return { contractId: contractIdStr, solidityAddress };
}

async function storeBytecode(client: Client, bytecode: Buffer) {
  const chunkSize = 1024;
  const createTx = await new FileCreateTransaction()
    .setKeys([client.operatorPublicKey!])
    .setContents(bytecode.slice(0, chunkSize))
    .execute(client);
  const createReceipt = await createTx.getReceipt(client);
  const fileId = createReceipt.fileId;
  if (!fileId) {
    throw new Error("Failed to create bytecode file");
  }

  for (let i = chunkSize; i < bytecode.length; i += chunkSize) {
    const appendTx = await new FileAppendTransaction()
      .setFileId(fileId)
      .setContents(bytecode.slice(i, Math.min(bytecode.length, i + chunkSize)))
      .execute(client);
    await appendTx.getReceipt(client);
  }

  return fileId;
}

async function populateRegistry(
  client: Client,
  registryIdStr: string,
  entries: Array<[string, string]>,
) {
  const registryId = ContractId.fromString(registryIdStr);
  for (const [label, address] of entries) {
    const params = new ContractFunctionParameters().addBytes32(ethers.id(label)).addAddress(normalizeAddress(address));
    const tx = await new ContractExecuteTransaction()
      .setContractId(registryId)
      .setGas(300_000)
      .setFunction("setAddress", params)
      .execute(client);
    await tx.getReceipt(client);
    console.log(`Registry updated: ${label} -> ${address}`);
  }
}

async function writeDeployments(networkName: string, deployments: DeploymentRecord) {
  await fs.mkdir(DEPLOYMENTS_DIR, { recursive: true });
  const outputPath = path.join(DEPLOYMENTS_DIR, `hedera-${networkName}.json`);
  await fs.writeFile(
    outputPath,
    JSON.stringify(
      {
        network: networkName,
        timestamp: new Date().toISOString(),
        contracts: deployments,
      },
      null,
      2,
    ),
  );
  console.log(`Deployment manifest written to ${outputPath}`);
}

async function loadArtifact(name: keyof typeof ARTIFACT_PATHS) {
  const artifactPath = path.join(__dirname, "..", "artifacts", "contracts", ARTIFACT_PATHS[name]);
  const contents = await fs.readFile(artifactPath, "utf8");
  return JSON.parse(contents);
}

function parsePrivateKey(raw: string): PrivateKey {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("{")) {
    return PrivateKey.fromString(trimmed);
  }
  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === "string") {
      return PrivateKey.fromString(parsed);
    }
    const candidate = findFirstString(parsed);
    if (candidate) {
      return PrivateKey.fromString(candidate);
    }
    if (parsed && typeof parsed === "object") {
      return PrivateKey.fromJSON(parsed);
    }
  } catch (error) {
    throw new Error(`Unable to parse HEDERA_OPERATOR_KEY: ${error}`);
  }
  throw new Error("Unable to determine private key string from HEDERA_OPERATOR_KEY");
}

function findFirstString(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = findFirstString(entry);
      if (found) {
        return found;
      }
    }
  } else if (value && typeof value === "object") {
    for (const entry of Object.values(value as Record<string, unknown>)) {
      const found = findFirstString(entry);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

function buildConstructorParameters(types: string[], originalValues: any[]) {
  if (types.length !== originalValues.length) {
    throw new Error("constructorTypes and constructorValues length mismatch");
  }

  const normalizedValues = types.map((type, index) => normalizeForAbi(type, originalValues[index]));
  const encodedHex = ethers.AbiCoder.defaultAbiCoder().encode(types, normalizedValues);
  const encodedBytes = Buffer.from(encodedHex.slice(2), "hex");
  return { encodedBytes, encodedHex };
}

function normalizeForAbi(type: string, value: any): any {
  switch (type) {
    case "address":
      return normalizeAddress(String(value));
    case "string":
      return String(value);
    case "uint256":
      return typeof value === "bigint" ? value : BigInt(value);
    case "uint8":
      return Number(value);
    default:
      throw new Error(`Unsupported constructor type: ${type}`);
  }
}

function normalizeAddress(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("0x")) {
    const hex = trimmed.slice(2).padStart(40, "0");
    return `0x${hex}`;
  }
  const accountId = AccountId.fromString(trimmed);
  const hex = accountId.toSolidityAddress();
  return `0x${hex}`;
}

function toAbiAddress(value: string): string {
  return normalizeAddress(value);
}

main().catch((error) => {
  console.error("Hedera deployment failed:", error);
  process.exit(1);
});
