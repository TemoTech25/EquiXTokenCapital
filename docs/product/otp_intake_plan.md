# OTP Intake & E-Sign Implementation Plan (Phase 1 Task 2)

This guide breaks down the work needed to deliver the OTP capture, document upload, and e-signature flow. Use it to organize coding tasks, acceptance criteria, and integration checkpoints.

---

## 1. Scope & Success Criteria
- Users can create or upload an OTP, invite counter-parties, and capture all required property details.
- Both parties can review and e-sign via OTP (SMS/email) with status tracking.
- Documents are stored encrypted; hashes anchored to Hedera HCS.
- The flow hands off to KYC stage automatically once signatures are complete.

**Definition of Done:**
1. End-to-end flow works in staging with sample buyers/sellers.
2. Audit log records upload, signatures, and hash anchoring events.
3. Validation covers required fields, attachments, and consent.
4. Integration tests cover success, invalid OTP, and re-upload scenarios.

---

## 2. Frontend Tasks (Next.js)
1. **Project Scaffolding**
   - Run `npx create-next-app@latest frontend --ts --eslint --app --src-dir --import-alias "@/*"` (adjust if offline).
   - Install UI dependencies: Tailwind or Chakra (choose one), React Hook Form, Zod for validation.
   - Configure ESLint/Prettier according to `docs/engineering_standards.md`.
2. **Route Structure**
   - `/dashboard` (case list), `/cases/[caseId]/otp`, `/cases/[caseId]/sign` routes.
   - Implement layout with navigation, breadcrumb, progress indicator.
3. **OTP Capture Form**
   - Sections: Property info, buyer/seller info, purchase terms, special conditions, attachments.
   - Use React Hook Form + Zod schema; show inline validation.
   - Support “upload existing PDF” and “generate from template” options.
4. **Document Upload Component**
   - Drag-and-drop area (use `react-dropzone` or native input).
   - Display file list with status, size, hash pending indicator.
   - Call backend to request pre-signed upload URL (stub API until backend ready).
5. **E-Sign Flow UI**
   - Signature request screen showing parties, status (Pending/Signed/Declined).
   - OTP entry modal (SMS/email) with resend + timer.
   - Confirmation screen after both parties sign; display ledger hash reference.
6. **State Management**
   - Use React Query or SWR for data fetching.
   - Implement optimistic updates for upload status.
7. **Accessibility & Responsiveness**
   - Ensure form elements have labels, keyboard navigation.
   - Mobile layout for diaspora users on phones.
8. **Testing**
   - Component tests for OTP form validation.
   - Integration test mocking backend responses (use MSW).

---

## 3. Backend Tasks (Node/TypeScript)
1. **Service Scaffolding**
   - Create `backend` folder with Express/Fastify or NestJS (choose framework).
   - Set up basic routes, request validation (Zod/Joi), error handling, logging.
2. **Data Models**
   - Define `Case`, `OTPDocument`, `Party`, `Signature` tables in Prisma/TypeORM.
   - Create migration scripts for Postgres.
3. **Document Storage API**
   - Endpoint to request pre-signed S3 URL.
   - After upload, compute hash (SHA-256) and store metadata.
4. **E-Signature Service**
   - Generate OTP codes (6-digit) with expiry; store hashed OTP in DB.
   - Integrate SMS/email provider (Twilio/SendGrid) with template.
   - Signature verification endpoint validating OTP and updating status.
5. **Hedera HCS Logging**
   - Implement utility to publish hash + metadata to HCS topic.
   - Store transaction ID for audit reference.
6. **Case Progression**
   - After both signatures complete, transition case status to `KYC_PENDING`.
   - Publish event to message bus (placeholder) or call KYC service.
7. **Security**
   - Input validation, rate limiting for OTP attempts, request authentication (JWT).
   - Ensure uploaded documents scanned (use antivirus service in future iteration).
8. **Testing**
   - Unit tests for services (OTP generation, HCS logging).
  - Integration tests covering upload + signature flow.

---

## 4. Integration & DevOps
- **Environment Variables:** Update `.env.example` with `SIGNATURE_OTP_EXPIRY`, `SMS_PROVIDER_API_KEY`, `HCS_TOPIC_ID`.
- **CI/CD:** Extend GitHub Actions to run frontend/backend tests.
- **Secrets Management:** Store SMS/email provider credentials in vault.
- **Logging & Monitoring:** Add structured logs for key events; plan dashboards for signature success rate, error alerts.

---

## 5. Manual QA Scenarios
1. Buyer uploads OTP PDF, both parties sign via SMS OTP.
2. Buyer edits OTP details before seller signs; system maintains version history.
3. Seller enters incorrect OTP twice; third attempt succeeds.
4. Missing required field triggers validation error.
5. Document agent (future integration) flags missing annexure; user re-uploads.

Log QA results in testing tracker; capture screenshots for training material.

---

## 6. Dependencies & Open Questions
- Choose SMS provider (Twilio, Africa’s Talking) and confirm coverage/cost.
- Decide on e-sign legal compliance requirements per jurisdiction (consult legal).
- Clarify municipal expectations for digital signatures; capture in risk register.
- Confirm template library format (Word/PDF) and storage policy.

Record decisions and links in founder decision log; update development backlog accordingly.
