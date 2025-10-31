# Compliance & Risk Register

This living document tracks regulatory and operational risks discovered during the DPIA and ongoing operations. Update it after each assessment or when new risks emerge.

| Risk ID | Category | Description | Likelihood | Impact | Mitigation | Owner | Status | Last Reviewed |
|---------|----------|-------------|------------|--------|------------|-------|--------|---------------|
| R1 | Data Protection | Unauthorized access to PII in S3 | Medium | High | Encrypt at rest, IAM least privilege, CloudTrail monitoring | Compliance Lead | Open | YYYY-MM-DD |
| R2 | AI Governance | AI agent bias causing wrongful KYC decisions | Medium | Medium | Evaluation framework, human review overrides, bias audits | AI Lead | Open | YYYY-MM-DD |
| R3 | Smart Contracts | Escrow contract bug leading to frozen funds | Low | High | Code review, testnet simulations, emergency pause | Blockchain Lead | Open | YYYY-MM-DD |
| R4 | Legal/Regulatory | Tokenized fractions classified as securities without license | Medium | High | Engage legal counsel, sandbox participation, compliance controls | Legal Counsel | Open | YYYY-MM-DD |
| R5 | Municipal Integration | RPA submissions rejected due to policy changes | Medium | Medium | Maintain contact with municipality, alert system, manual fallback | Ops Lead | Open | YYYY-MM-DD |

Add new rows as additional risks are identified. Possible statuses: Open, Mitigated, Transferred, Accepted.
