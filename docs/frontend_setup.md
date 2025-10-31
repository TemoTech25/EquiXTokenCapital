# Frontend Setup (Next.js)

Follow these steps to scaffold the Next.js application and align it with the OTP intake plan.

---

## 1. Create the Project
```bash
npx create-next-app@latest frontend --ts --eslint --app --src-dir --import-alias "@/*"
```
If offline, initialize manually:
1. Create `frontend/package.json` with Next.js dependencies (version 14+).
2. Configure TypeScript, ESLint, and basic scripts (`dev`, `build`, `lint`, `test`).

## 2. Install Core Dependencies
```bash
cd frontend
npm install @tanstack/react-query react-hook-form zod axios
# choose a UI kit (example: Tailwind)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```
Adjust if using Chakra/MUI instead of Tailwind.

## 3. Project Structure
```
frontend/
  src/
    app/
      layout.tsx
      page.tsx
      dashboard/
      cases/[caseId]/
    components/
    lib/
    hooks/
  public/
  tests/
```

## 4. Configuration Tasks
- Enable ESLint rules per `docs/engineering_standards.md`.
- Configure absolute imports with `tsconfig.json`.
- Add Tailwind (or chosen UI framework) to `globals.css`.
- Set up environment variable handling (`NEXT_PUBLIC_API_URL`, etc.).

## 5. Testing
- Install Jest/React Testing Library or rely on `playwright` for e2e (optional).
- Add scripts in `package.json`: `"test": "jest"` or `"test": "vitest"`.
- Create sample test `src/tests/otp-form.test.tsx`.

## 6. Next Steps
- Implement screens defined in `docs/ux/wireframe_brief.md`.
- Use `docs/product/otp_intake_plan.md` to break down tasks into user stories.
- Coordinate APIs with backend team (or self) to align on contracts.
