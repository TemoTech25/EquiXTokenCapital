# Wireframe Brief & Acceptance Criteria

Use this brief to guide the creation of low- and mid-fidelity wireframes for Phase 1. Update it with links to your design files and sign-offs.

---

## 1. Objectives
- Visualize the end-to-end Transfer Automation Lite experience for buyers, sellers, intermediaries, and municipal users.
- Ensure key compliance touchpoints (KYC, consent, audit trail) are visible.
- Support both desktop and mobile-responsive layouts for diaspora participants.

---

## 2. Critical Screens & Requirements

1. **Onboarding Wizard**
   - Steps: invite acceptance, profile setup, wallet selection (HashPack/custodial), consent to terms.
   - Must show progress indicator and contextual help.

2. **Case Dashboard (Intermediary View)**
   - Overview of active cases with status, SLA timer, risk flags.
   - Quick actions (review OTP, approve KYC, request certificate).
   - Filter/search by property, buyer/seller, stage.

3. **Case Detail – Timeline**
   - Stage-by-stage timeline (OTP → KYC → Escrow → Certificates → Registration → Settlement).
   - Event log (with Hedera hash references) and task assignments.

4. **OTP Capture & E-Sign**
   - Form sections for property details, parties, price, special conditions.
   - Upload existing PDF or generate from template.
   - Signature flow: OTP (SMS/email) + document preview, consent capture.

5. **Document Checklist**
   - AI Document Agent output (clauses verified, missing annexures, notes).
   - Evidence upload widget with status tags and hash indicator.

6. **KYC Module**
   - Identity document capture, selfie instructions, status card.
   - Policy engine decision card with rationale and escalation option.
   - Manual review workspace for flagged cases.

7. **Escrow Setup**
   - Conditional release matrix (e.g., registration confirmed, certificate received).
   - Payment method selection (stablecoin, bank EFT).
   - Fee split summary and preview of payout schedule.

8. **Certificates Tracker**
   - Task board showing each certificate request, due date, responsible party.
   - Upload area for receipts/evidence, with HCS hash confirmation.

9. **Registration & Title Twin Confirmation**
   - Final checklist prior to submission.
   - Success state showing NFT title twin update, statements ready.

10. **Fractional Pilot (Developer)**
   - Token issuance wizard (supply, whitelist, limits).
   - Guardian dashboard preview (metrics, visualizations).

---

## 3. Design Guidelines
- **Brand Voice:** Professional yet approachable; emphasize trust and transparency.
- **Accessibility:** Minimum color contrast 4.5:1, keyboard navigable forms, descriptive labels.
- **Localization:** Prepare for currency selector, time zone display, multi-language (English first).
- **Error Handling:** Provide inline error messages and next steps; capture common failure scenarios (failed KYC, missing document).

---

## 4. Deliverables
- Low-fidelity sketches annotated with assumptions.
- Mid-fidelity wireframes with interaction notes and responsive variants.
- Component inventory (buttons, cards, tabs, timeline, alerts) for future design system.
- Feedback log capturing pilot partner comments and resolutions.

---

## 5. Acceptance Criteria
- [ ] Every journey map step has a corresponding wireframe state.
- [ ] Wireframes include audit trail references (HCS hashes, timestamps).
- [ ] Compliance notices (POPIA consent, AML disclaimers) appear where required.
- [ ] Escrow conditions and payout splits are visibly configurable.
- [ ] Guardian dashboard communicates impact metrics clearly.

Document approval here once satisfied:
- **Approved by Founder:** (Name, date)
- **Notes / Follow-up:** 
