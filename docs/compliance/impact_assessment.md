# Data Protection Impact Assessment (DPIA) Template – Draft

Use this template to conduct the initial POPIA/GDPR-aligned DPIA for the MVP. The goal is to identify personal data processing, risks, and mitigations before development proceeds. Fill in each section as information becomes available; involve legal counsel where necessary.

---

## 1. Project Overview
- **Project Name:** EquiXToken Capital MVP
- **Owner:** (Founder name)
- **Date Initiated:** YYYY-MM-DD
- **Review Cycle:** Quarterly or when major changes occur
- **Summary:** Digitized property transfer workflow with tokenization, AI-driven compliance, and escrow automation for South African municipalities and diaspora investors.

---

## 2. Scope of Processing
| Data Subject | Data Categories | Purpose | Lawful Basis |
|--------------|----------------|---------|--------------|
| Buyers/Sellers | Identification docs (ID, passport), contact details, proof of address, selfies, bank info | KYC, offer to purchase execution, escrow settlement | Contract necessity, legal obligation |
| Intermediaries (conveyancers, agents) | Professional details, license numbers, contact info | Workflow assignments, compliance logging | Legitimate interest, legal obligation |
| Municipal Officials | Work email, role, approvals | Certificate processing, SLA tracking | Legitimate interest |
| Investors (fractional tokens) | KYC data, wallet IDs, transaction history | Compliance, token issuance, payout reporting | Legal obligation |

Add additional categories as discovered.

---

## 3. Data Flow Diagram Reference
- Link to architecture diagram illustrating data sources, processing nodes, storage (Postgres, S3, vector DB), blockchain hashes, and external APIs.
- Identify points where PII leaves the system (KYC vendor, payment providers).

---

## 4. Risk Assessment
| Risk ID | Description | Likelihood (L/M/H) | Impact (L/M/H) | Mitigation | Residual Risk |
|---------|-------------|--------------------|----------------|------------|---------------|
| R1 | Unauthorized access to KYC documents stored in S3 | M | H | Encrypt at rest, strict IAM, access logging, least privilege | L |
| R2 | AI agent bias leading to wrongful KYC rejection | M | M | Model evaluation, human review queue, rationale logging | M |
| R3 | Smart contract malfunction delaying escrow payouts | L | H | Peer review, testnet simulations, emergency pause control | M |
| R4 | Data residency violation (PII stored outside compliant regions) | M | H | Region-specific storage, review vendor agreements | L |
| R5 | Municipal template containing PII mishandled | M | M | Secure file transfer, retention policy, access audit | L |

Modify or extend risks as needed; include cross-references to mitigation plans.

---

## 5. Data Retention & Deletion
- Outline retention periods per data category (e.g., KYC data retained for 5 years per FICA; audit logs retained 7 years).
- Define deletion triggers (case closure + 90 days, investor withdrawal, partner request).
- Document deletion process (automated job, manual review, confirm blockchain hashes remain as evidence only).

---

## 6. Data Subject Rights
- Procedures for responding to access, rectification, erasure, restriction requests.
- Contact channel (e.g., privacy@equixcapital.com).
- Timeline commitments (POPIA/GDPR: 30 days).

---

## 7. Privacy by Design Measures
1. Pseudonymize case references in internal logs (use UUIDs instead of names).
2. Limit blockchain storage to hashes and metadata; keep PII off-chain.
3. Role-based access control with principle of least privilege.
4. Continuous monitoring and anomaly detection for suspicious access.
5. Secure development lifecycle with code reviews, dependency scanning.

---

## 8. Third-Party Processors
| Vendor | Service | Data Shared | Location | Contract Status |
|--------|---------|-------------|----------|-----------------|
| KYC Provider (e.g., Smile ID) | Identity verification | ID docs, selfies |  |  |
| Stablecoin Custodian | Wallet services | Wallet IDs, KYC status |  |  |
| Payment Provider | EFT processing | Account info, transaction data |  |  |
| Cloud Hosting (AWS) | Infrastructure | Hosted data |  |  |
| Vector DB Provider | Embeddings | Chunked documents (no raw PII) |  |  |

Ensure DPAs (Data Processing Agreements) are in place before go-live.

---

## 9. Approval Workflow
- **Prepared by:** (Name, role, date)
- **Reviewed by:** Compliance officer / Legal counsel (Name, date)
- **Approval decision:** Accept / Accept with actions / Reject
- **Follow-up actions:** (List required mitigations, deadlines, responsible owners)

---

## 10. Version History
| Version | Date | Changes | Owner |
|---------|------|---------|-------|
| 0.1 (Draft) | YYYY-MM-DD | Initial draft populated | Founder |
| 0.2 |  |  |  |

Update this section as revisions occur.
