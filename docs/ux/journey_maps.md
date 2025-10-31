# OTP → Registration Journey Maps (Phase 1 Task 1)

Use these outlines to guide the creation of user journey maps and accompanying wireframes for buyers, sellers, intermediaries, and municipal users. Start with the high-level stages below, then add detailed swimlanes and annotations as you gather feedback.

---

## 1. Stage Definitions
1. **Discovery & Onboarding:** User invited to platform, verifies email/phone, understands next steps.
2. **Offer to Purchase (OTP):** OTP data entry/import, parties review, e-signature execution, document hashing.
3. **KYC/KYB & Compliance:** Identity verification, policy engine decision, sanctions review, escalation if needed.
4. **Escrow Setup:** Payment instructions, conditional release configuration, stakeholder notifications.
5. **Certificates & Municipal Checks:** Rates clearance, transfer duty, other municipal documents, evidence uploads.
6. **Registration & Title Twin Update:** Submit deeds pack, confirm registry completion, update NFT metadata.
7. **Settlement & Payouts:** Disburse funds, generate statements, close case, optional fractional onboarding.
8. **Post-Completion & Guardian Reporting:** Archive docs, run ESG dashboards, set up monitoring for future transactions.

---

## 2. Persona Swimlanes (Fill In)

### Buyer (Primary or Diaspora)
- Goals: Understand progress, complete tasks remotely, minimize friction with KYC/payments.
- Pain Points: Paper-heavy steps, lack of visibility, currency/exchange challenges.
- Journey Steps:
  1. Receives invite → guided onboarding wizard.
  2. Uploads OTP (or reviews pre-filled version).
  3. Completes KYC (ID upload, selfie).
  4. Funds escrow via stablecoin/card/bank.
  5. Monitors certificates, registration status.
  6. Receives final statements & title twin confirmation.
- Emotions/Opportunities: Provide progress bar, contextual help, currency conversion info.

### Seller
- Goals: Confirm OTP terms, track obligations, receive settlement on time.
- Steps & Notes: Mirror buyer flow but focus on document approvals, account confirmation, payout view.

### Conveyancer / Intermediary
- Goals: Manage multiple cases, assign tasks, ensure compliance, meet SLAs.
- Steps & Notes:
  1. Dashboard of active cases with SLA indicators.
  2. Task queue (review OTP, approve KYC, submit certificates).
  3. Communications log, document versioning.
  4. Final review before registration submission.

### Municipal Liaison / Clerk
- Goals: Receive clear requests, process certificates efficiently, maintain audit trail.
- Steps & Notes: Access limited portal view, upload approvals, respond to clarifications, view history.

### Developer (Fractional Pilot)
- Goals: Track fractional issuance readiness, verify investor onboarding, update Guardian metrics.
- Steps: Monitor token issuance checklist, review investor whitelist, upload impact data.

Add additional swimlanes as new personas emerge (e.g., lenders, payment providers).

---

## 3. Journey Mapping Checklist
- [ ] Define entry and exit points for each persona (e.g., invite email, registration completion).
- [ ] Identify touchpoints with AI agents (Document Agent alerts, KYC decision rationale).
- [ ] Note integration points (Hedera hash logging, KYC vendor callbacks, payment confirmations).
- [ ] Capture key emotions/pain points at each stage.
- [ ] Highlight opportunities for automation or nudges.

Document final maps in your design tool of choice (FigJam, Miro) and attach exports/screenshots in your knowledge base. Reference them in sprint planning.

---

## 4. Wireframe Plan
1. **Low-Fidelity Sketches (Day 1–2):** Outline layout for dashboard, task detail, OTP upload, KYC flow, escrow configuration.
2. **Feedback Loop (Day 3):** Share with pilot partners (conveyancer + buyer) for quick feedback; log decisions.
3. **Mid-Fidelity Wireframes (Day 4–5):** Add labels, states, validation messages; ensure responsive considerations.
4. **Interaction Notes:** Document transitions, modals, error states, notifications.
5. **Hand-off Package:** Export to PDF/images; annotate user stories and acceptance criteria for backlog.

---

## 5. Artefacts to Produce
- Journey map PDF or screenshot per persona.
- Wireframe deck covering: landing dashboard, case overview, OTP form, document checklist, KYC module, escrow setup, certificate tracker, registration confirmation, fractional onboarding (initial).
- UX copy guidelines (tone, field labels, error messages).
- Accessibility checklist (contrast, keyboard navigation, language support).

---

## 6. Founder Review Checklist
- [ ] Do wireframes clearly show every step in the journey maps?
- [ ] Are compliance requirements (disclaimers, consent, data usage) visible?
- [ ] Can a new user understand “what to do next” at any point?
- [ ] Are diaspora-specific needs addressed (currency, remote signing)?
- [ ] Are municipal actions simplified and auditable?

Record approval date and feedback items in your founder decision log.
