import { Client, TopicMessageSubmitTransaction } from "@hashgraph/sdk";
import { loadEnv } from "../../config/env";
import crypto from "crypto";

const env = loadEnv();

const client = Client.forName(env.HEDERA_NETWORK).setOperator(env.HEDERA_OPERATOR_ID, env.HEDERA_OPERATOR_KEY);

export type AnchorPayload = {
  tenantId: string;
  module: string;
  subjectType: string;
  subjectId: string;
  sha256: string;
  timestamp: string;
};

export const publish = async (topicId: string, payload: AnchorPayload) => {
  const message = JSON.stringify(payload);
  const tx = await new TopicMessageSubmitTransaction().setTopicId(topicId).setMessage(message).freezeWith(client).signWithOperator(client);
  const response = await tx.execute(client);
  const receipt = await response.getReceipt(client);
  let consensusTimestamp: string | undefined;
  try {
    const record = await response.getRecord(client);
    consensusTimestamp = record.consensusTimestamp?.toDate()?.toISOString();
  } catch {
    consensusTimestamp = undefined;
  }
  return {
    consensusTimestamp,
    sequenceNumber: receipt.topicSequenceNumber?.toString(),
    messageHash: crypto.createHash("sha256").update(message).digest("hex"),
  };
};
