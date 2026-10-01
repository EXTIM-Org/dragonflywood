# 📐 Coding Guidelines

Adhering to these principles is **mandatory** to maintain clean code, facilitate team collaboration, and ensure the long-term maintainability of the EXTIM E-Commerce platform.

---

## 1. 📝 Naming Conventions

Consistency in naming makes the codebase predictable and easier to navigate.

- **Variables & Functions:** `camelCase` (e.g., `calculateTotal()`, `userProfile`)
- **React Components & Classes:** `PascalCase` (e.g., `ProductCard.tsx`, `class PaymentGateway`)
- **Files & Directories:** 
  - Component files: `PascalCase` (e.g., `CartModal.tsx`)
  - Utility/Library files: `kebab-case` or `camelCase` (e.g., `price-utils.ts`, `auth.ts`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_UPLOAD_SIZE`)
- **Database Models (Prisma):** `PascalCase` singular (e.g., `User`, `FlashSale`)

---

## 2. 📂 Directory Structure

We follow a modular and feature-based approach within the Next.js App Router paradigm:

- 📁 `src/app`: Next.js file-system based routing and layouts.
- 📁 `src/components`: Reusable UI components.
  - ↳ `/ui`: Dumb, generic components (Buttons, Inputs).
  - ↳ `/product`, `/cart`, etc.: Domain-specific components.
- 📁 `src/actions`: Next.js Server Actions for data mutations.
- 📁 `src/lib`: Helper functions, external API wrappers, and utilities.
- 📁 `src/jobs`: BullMQ worker definitions and queue processing logic.
- 📁 `src/prisma`: Database schemas and clients.

---

## 3. 🧹 Clean Code Principles

- **Single Responsibility Principle (SRP):** Every function or component should do only one thing. Break down massive components into smaller, composable parts.
- **Don't Repeat Yourself (DRY):** Move common logic into helper functions (in `/lib`) or reusable React hooks.
- **Strict Typing:** 
  - The use of `any` in TypeScript is strictly forbidden unless dealing with highly dynamic 3rd-party libraries.
  - Always define explicit `interfaces` or `types` for component props and function returns.

---

## 4. 🔒 Security & Validation

- **Server-Side Validation:** *Always* validate user input on the server side (within Server Actions). Never trust client-side validation alone.
- **Secrets Management:** Never hardcode secret keys, API URLs, or passwords. Always use `process.env` and ensure `.env` files are in `.gitignore`.
- **RBAC (Role-Based Access Control):** Protect admin actions explicitly using the `canManageStore()` or `canManageBlog()` utilities before executing any database queries.

---

## 5. 🇮🇷 Localization & RTL Layout (Persian)

The platform targets the Iranian market, requiring specific attention to typography, language, and layout.

- **Language:** All UI components, success/error messages (toasts), and static texts must be written in Persian (Farsi).
- **RTL Support:** The entire layout is Right-To-Left (`dir="rtl"`). 
  - ⚠️ **CRITICAL:** Use logical Tailwind classes (e.g., `ps-*`, `pe-*`, `ms-*`, `me-*`) instead of physical directional classes (`pl-*`, `pr-*`). This ensures the UI remains intact regardless of text direction.
- **Numeral Localization:** 
  - Always use `Number.toLocaleString('fa-IR')` when displaying prices, dates, or counts to the user.
  - For raw text numbers, utilize the `e2p()` utility (English to Persian digits) found in `src/lib/persian.ts`.

---

## 6. 🚀 Versioning & Dependencies

- **Latest Stable Versions:** When installing packages, frameworks, or tools, always use the highest stable version. This ensures long-term maintainability and reduces technical debt.
- **Zero-Warning Policy:** Code should pass `npm run lint` and `npx tsc --noEmit` without a single warning or error before being merged.
