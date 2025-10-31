export type PairingResponse = {
  topic: string;
  pairingString: string;
  expiresAt: string;
};

export type WalletSessionPayload = {
  accountId: string;
  publicKey: string;
  signature: string;
  message: string;
  topic: string;
};
