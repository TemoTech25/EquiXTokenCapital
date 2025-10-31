# Engineering Foundations

This document defines the initial working agreements for repositories, branching, quality checks, and definition of done. It serves as the first development task to keep future contributions consistent, even while working solo.

---

## 1. Repository Layout
- **monorepo (current):** Maintain `/frontend`, `/backend`, `/contracts`, and `/infra` directories as code is added. Shared assets (docs, designs, ADRs) live in `/docs`.
- **future split option:** If the project grows, migrate contracts into a separate repo and mirror documentation via Git submodules. Document this decision in an ADR before moving.

---

## 2. Branching Strategy
- **Default branch:** `main` (protected; all changes land via pull request).
- **Feature branches:** `feature/<short-description>` for new functionality or docs.
- **Hotfix branches:** `hotfix/<issue>` for production fixes; merge into `main` and back into any long-lived branches immediately.
- **Merge policy:** Squash merge with clear commit message referencing issue/task ID; delete branch after merge.

---

## 3. Coding Standards
- **Languages:** TypeScript-first for backend and frontend; Solidity or Hedera SDK for contracts; Python allowed for AI pipelines.
- **Style guides:**  
  - Frontend: React + Next.js with ESLint (Airbnb base) and Prettier.  
  - Backend: ESLint (Node recommended), enforce strict TypeScript types, prefer functional service patterns.  
  - Contracts: Follow Hedera SDK best practices, include inline comments for state transitions and guard clauses.  
  - AI scripts: Pylint/Black formatting; document model assumptions in README.
- **Testing:**  
  - Frontend: Jest/React Testing Library for components and hooks.  
  - Backend: Jest integration tests + contract tests for business rules.  
  - Smart contracts: Unit tests using Hedera test frameworks (e.g., hedera-local-node or Hardhat with SDK).  
  - AI: Evaluation notebooks with accuracy/F1 metrics; store baseline results.

---

## 4. Definition of Done (DoD)
1. Code compiles and passes lint/test suites locally.  
2. CI pipeline green (lint, tests, type checks, contract compilation).  
3. Documentation updated (README, API docs, runbooks, ADRs if architecture changed).  
4. Security considerations noted (keys excluded, secrets managed via `.env.example`).  
5. Feature demo or screenshots attached to pull request when UI-facing.  
6. For infrastructure changes, rollback plan documented.

---

## 5. CI/CD Foundations
- **CI Tooling:** GitHub Actions for automated lint/test/type checks on every PR; add caching to speed builds.
- **Workflows (initial stubs):**
  - `frontend-ci.yml`: install Node deps, run `npm run lint`, `npm run test`, `npm run build`.
  - `backend-ci.yml`: similar flow with backend commands (`npm run lint`, `npm run test`, `npm run typecheck`).
  - `contracts-ci.yml`: compile contracts, run tests against Hedera testnet/local node.
  - `docs-check.yml`: optional spellcheck/markdown lint.
- **Secrets Management:** Use GitHub Secrets for API keys, but local `.env` files stay uncommitted with `.env.example` documenting required variables.
- **Deployment:** Manual for now; when staging environment exists, add GitHub Action to deploy on tagged releases (`v0.x`). Production deployments require manual approval step.

---

## 6. Tooling Checklist (Founder View)
1. Enable branch protection on `main` (require PR approval, status checks).  
2. Create base GitHub Action workflows (even as placeholders) to enforce lint/test.  
3. Add `.editorconfig` and pre-commit hooks (Husky) for consistent formatting.  
4. Document any deviations in `docs/adr/` directory as the system evolves.
