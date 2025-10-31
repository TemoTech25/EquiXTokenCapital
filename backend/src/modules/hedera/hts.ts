import { Client, TokenSupplyType, TokenType, TokenCreateTransaction, TokenMintTransaction } from "@hashgraph/sdk";
import { loadEnv } from "../../config/env";

const env = loadEnv();

const buildClient = () => Client.forName(env.HEDERA_NETWORK).setOperator(env.HEDERA_OPERATOR_ID, env.HEDERA_OPERATOR_KEY);

export const createFungibleToken = async (symbol: string, decimals: number, _memo = "EquiXToken") => {
  const client = buildClient();
  const operatorKey = client.operatorPublicKey;
  if (!operatorKey) {
    throw new Error("Operator public key not configured");
  }
  const tx = await new TokenCreateTransaction()
    .setTokenName(symbol)
    .setTokenSymbol(symbol)
    .setTokenType(TokenType.FungibleCommon)
    .setDecimals(decimals)
    .setInitialSupply(0)
    .setSupplyType(TokenSupplyType.Infinite)
    .setTreasuryAccountId(env.HEDERA_OPERATOR_ID)
    .setAdminKey(operatorKey)
    .setSupplyKey(operatorKey)
    .freezeWith(client)
    .signWithOperator(client);

  const response = await tx.execute(client);
  const receipt = await response.getReceipt(client);
  return receipt.tokenId?.toString();
};

export const createNonFungibleToken = async (symbol: string, _memo = "EquiXToken") => {
  const client = buildClient();
  const operatorKey = client.operatorPublicKey;
  if (!operatorKey) {
    throw new Error("Operator public key not configured");
  }
  const tx = await new TokenCreateTransaction()
    .setTokenName(symbol)
    .setTokenSymbol(symbol)
    .setTokenType(TokenType.NonFungibleUnique)
    .setTreasuryAccountId(env.HEDERA_OPERATOR_ID)
    .setSupplyType(TokenSupplyType.Infinite)
    .setAdminKey(operatorKey)
    .setSupplyKey(operatorKey)
    .freezeWith(client)
    .signWithOperator(client);

  const response = await tx.execute(client);
  const receipt = await response.getReceipt(client);
  return receipt.tokenId?.toString();
};

export const mintFungibleToken = async (tokenId: string, amount: bigint) => {
  const client = buildClient();
  const tx = await new TokenMintTransaction().setTokenId(tokenId).setAmount(Number(amount)).freezeWith(client).signWithOperator(client);
  const response = await tx.execute(client);
  const receipt = await response.getReceipt(client);
  return receipt.status.toString();
};

export const mintNonFungibleToken = async (tokenId: string, metadata: Uint8Array[]) => {
  const client = buildClient();
  const tx = await new TokenMintTransaction().setTokenId(tokenId).setMetadata(metadata).freezeWith(client).signWithOperator(client);
  const response = await tx.execute(client);
  const receipt = await response.getReceipt(client);
  return receipt.status.toString();
};

// Backwards compatibility exports
export const createFt = createFungibleToken;
export const mintFt = mintFungibleToken;
