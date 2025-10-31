import {
  AccountId,
  Client,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar,
} from "@hashgraph/sdk";
import { loadEnv } from "../../config/env";

const env = loadEnv();

const buildClient = () => Client.forName(env.HEDERA_NETWORK).setOperator(env.HEDERA_OPERATOR_ID, env.HEDERA_OPERATOR_KEY);

type ReleaseEscrowInput = {
  contractId: string;
  caseId: string;
  amountTinybars: bigint;
  beneficiaries: Array<{ accountId: string; bps: number }>;
};

export const callEscrowRelease = async ({ contractId, caseId, amountTinybars, beneficiaries }: ReleaseEscrowInput) => {
  const client = buildClient();
  const amountForContract = Number(amountTinybars);
  const params = new ContractFunctionParameters()
    .addString(caseId)
    .addUint256(amountForContract)
    .addUint32(beneficiaries.length);

  beneficiaries.forEach((beneficiary) => {
    const solidityAddress = AccountId.fromString(beneficiary.accountId).toSolidityAddress();
    params.addAddress(`0x${solidityAddress}`);
    params.addUint32(beneficiary.bps);
  });

  const tx = await new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(2_000_000)
    .setFunction("releaseEscrow", params)
    .setMaxTransactionFee(new Hbar(5))
    .freezeWith(client)
    .signWithOperator(client);

  const response = await tx.execute(client);
  const receipt = await response.getReceipt(client);
  return {
    status: receipt.status.toString(),
    transactionId: response.transactionId.toString(),
  };
};
