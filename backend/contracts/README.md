# EquiXToken Capital Hedera Contracts

This folder contains the on-chain components that back the escrow lifecycle.

## 1. Escrow Contract

- Source: `escrow/EquiXEscrow.sol`
- Purpose: holds HBAR for a conveyancing case and releases it once the EquiX backend determines all conditions are met.
- Operator: the backend Hedera operator account (same one configured in `.env`) controls deposits and releases.

### Key behaviour

1. `depositForCase(caseId)` – operator deposits HBAR for the given case.
2. `releaseEscrow(caseId, grossAmount, beneficiaries, bps)` – operator distributes the locked amount according to the basis-point splits (10_000 bps = 100%). The function:
   - Prevents double releases per case.
   - Checks the splits sum to 10_000.
   - Transfers HBAR to each beneficiary.

> ⚠️ Amounts must be supplied in **tinybars** (1 HBAR = 100,000,000 tinybars). Ensure the backend converts from whatever accounting unit you store (e.g. cents) before invoking the contract.

## 2. Build & Deploy Workflow

You can deploy with the Hedera SDK (no Hardhat required). The helper script below expects the contract to be compiled with `solc`.

### Step A – Compile

```bash
cd backend
npx solc --bin --abi contracts/escrow/EquiXEscrow.sol -o contracts/escrow/build --overwrite
```

This creates:
- `contracts/escrow/build/EquiXEscrow.bin`
- `contracts/escrow/build/EquiXEscrow.abi`

### Step B – Deploy

1. Populate `.env` with your Hedera operator credentials (testnet or mainnet).
2. Run the deployment script:

```bash
cd backend
ts-node scripts/deploy-escrow.ts --operator-account 0.0.xxxxx
```

The script will:
- Read the compiled bytecode.
- Upload it to Hedera File Service (in chunks when necessary) and capture the file ID.
- Convert the operator account to a Solidity address for the constructor.
- Submit the contract create transaction.
- Output the deployed contract ID.

### Step C – Record Contract ID

The console output includes a line similar to:

```
Deployed EquiXEscrow to contract 0.0.123456 (tx: 0.0.1234@171xxx)
```

- Save the `contractId` in your backend config or pass it when creating escrows.
- Future release calls reference this ID.

## 3. Funding the Contract

Before releasing funds, you must deposit HBAR:

```bash
ts-node scripts/deposit-escrow.ts \
  --contract-id 0.0.123456 \
  --case-id CASE-001 \
  --amount-hbar 100
```

(`deposit-escrow.ts` will be created when the backend funding workflow is wired. For now, you can deposit via the Hedera portal or by modifying the deployment script.)

## 4. Backend Integration Notes

- `escrow.service.ts` stores the `contractId` (ledgerRef) alongside case metadata.
- `callEscrowRelease` converts Hedera `0.0.*` account IDs into Solidity addresses before calling `releaseEscrow`.
- Once deployed, update the frontend/admin flows to pass the contract ID when opening an escrow.

## 5. Next Steps

- Extend the contract if you need token-based escrow (HTS) instead of raw HBAR.
- Add mirror-node polling to verify transaction success.
- Implement hash-based condition checks (provide `bytes32[] conditionHashes` to `releaseEscrow`) if legal requirements demand it.
