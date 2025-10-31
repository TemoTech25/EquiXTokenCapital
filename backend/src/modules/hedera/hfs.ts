import { Client, FileCreateTransaction, Hbar } from "@hashgraph/sdk";
import { loadEnv } from "../../config/env";

const env = loadEnv();

const buildClient = () => Client.forName(env.HEDERA_NETWORK).setOperator(env.HEDERA_OPERATOR_ID, env.HEDERA_OPERATOR_KEY);

export const storeFileOnHfs = async (contents: Buffer, memo: string) => {
  const client = buildClient();
  const operatorKey = client.operatorPublicKey;
  if (!operatorKey) {
    throw new Error("Operator public key not configured for Hedera client");
  }
  const tx = await new FileCreateTransaction()
    .setKeys([operatorKey])
    .setContents(contents)
    .setFileMemo(memo)
    .setMaxTransactionFee(new Hbar(5))
    .freezeWith(client)
    .signWithOperator(client);

  const response = await tx.execute(client);
  const receipt = await response.getReceipt(client);
  const fileId = receipt.fileId?.toString();
  if (!fileId) {
    throw new Error("Failed to create HFS file");
  }
  return fileId;
};
