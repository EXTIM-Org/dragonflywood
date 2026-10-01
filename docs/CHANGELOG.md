# Changelog

## [Unreleased]

### Added
- **Production-Ready Security Hardening**: 
  - **DoS Protection**: Restricted global Next.js Server Action `bodySizeLimit` to `10mb` to prevent payload-based Denial of Service attacks.
  - **Secure Bulk Import API**: Migrated the ZIP file upload from a Server Action to a dedicated Next.js API Route (`/api/admin/bulk-import`) to safely bypass global body size limits for admins without exposing the entire app.
  - **Content Security Policy (CSP)**: Implemented strict CSP headers in `next.config.ts` (`script-src`, `img-src`, `frame-ancestors 'self'`) to systematically prevent Cross-Site Scripting (XSS) and Clickjacking.
  - **CSRF Protection**: Upgraded the authentication JWT cookie (`extim_session`) configuration from `SameSite=Lax` to `SameSite=Strict`, completely blocking Cross-Site Request Forgery (CSRF).
  - **Markdown XSS Sanitization**: Integrated `rehype-raw` and `rehype-sanitize` into `ReactMarkdown` on the Blog pages to neutralize any malicious HTML/JS payloads.
  - **Expanded Rate Limiting**: Applied atomic Redis rate-limiting to the Checkout process (max 5 orders/min per user) and Coupon Validation (max 10 attempts/min per IP) to prevent spam and brute-force attacks.
- **Comprehensive E2E Testing Pipeline**: 
  - Integrated **Playwright** and successfully developed 10 robust end-to-end tests covering Authentication, Admin Security, Navigation, Search, Cart, and full Checkout flow.
  - Implemented dynamic OTP backdoor (allowing `12345` for `0999...` numbers in non-production) and rate-limit bypassing for reliable automated login.
  - Refactored assertions to use resilient `toContainText` locators and increased Next.js dev server timeouts (up to 120s) to gracefully handle JIT compilation and React Server Component hydration delays.
- **Admin Audit Logs**: 
  - Created a comprehensive Audit Log system for tracking sensitive admin actions (CREATE, UPDATE, DELETE, SETTINGS_CHANGE).
  - Added `AdminAuditLog` Prisma model and `AdminActionType` enum to the database contract.
  - Implemented a dedicated UI in the Admin Dashboard (`/admin/audit-logs`) with pagination to view activity history.
  - Logged activities currently include Product creation/editing/deletion, Order status changes, and Store/Notification settings updates, automatically capturing the admin's IP address and User-Agent for security.
- **Smart Promotion Engine**:
  - Implemented a database-centric robust promotion system (`PromotionRule` Prisma model) avoiding basic Redis caching for long-term scalability.
  - Added support for two campaign types: `BOGO` (Buy One Get One with percentage discount) and `CART_TOTAL` (Fixed discount on cart threshold).
  - Built real-time dynamic cart discount calculations in `cart.ts` that automatically find the cheapest eligible items for BOGO rules.
  - **Cart Upsell Nudge**: Added a dynamic bouncing widget in the cart that calculates how many more items a user needs to trigger a BOGO discount (e.g. "Add 1 more to get 50% off").
  - **Product Page Nudge**: Displaying targeted, animated BOGO banners directly on eligible product pages.
  - **Admin Management**: Created a complete CRM interface for promotions in the Admin Dashboard (`/admin/promotions`), allowing admins to create, edit, and toggle campaigns targeting specific categories.
- **Mobile Responsiveness Enhancements**:
  - Implemented a responsive mobile hamburger menu in the global `Header.tsx` for accessible mobile navigation.
  - Developed a toggleable `AdminSidebarWrapper` for the Admin Dashboard to prevent the sidebar from taking up full vertical space on mobile devices.
  - Applied Persian digit localization to Admin Dashboard statistics (Total Products, Orders, Users).
- **Global Pagination System**: Implemented a reusable, server-side compatible `<Pagination>` component (`src/components/ui/Pagination.tsx`).
  - Added support for query preservation during pagination.
  - Pagination applied to Admin Orders, User Profile Orders, Admin Returns, Admin Tickets, and Admin Users pages.
  - Implemented RTL layout fix: The pages flow Left-to-Right logically (Previous < 1 2 3 > Next) while keeping the site's overall Right-to-Left alignment for Persian.
- **Persian Localization (Numbers)**: 
  - Integrated `toLocaleString('fa-IR')` globally across the application for prices and dates to ensure foolproof Persian number formatting.
  - Implemented `e2p` utility (`src/lib/persian.ts`) for raw numbers (like counts, inventory quantities, phone numbers, postal codes, and lengths).
  - Ensured all dashboard charts (e.g., RevenueChart, TopProductsChart), email receipts, and data tables consistently display Persian digits regardless of the user's browser font configuration.
- **Admin Users Enhancements**:
  - Granted standard `ADMIN` users access to the User Management section.
  - Added strict server-side and client-side security measures to prevent regular admins from modifying the roles of other admins, or promoting users to `ADMIN` or `SUPER_ADMIN`.
  - The `SUPER_ADMIN` role remains highly protected and completely unchangeable.
  - Added a simulated "ارسال پیامک" (Send SMS) feature in the User Profile CRM controls, with character counting and console logging for simulation.
- **Return Management**:
  - Added a "تاریخ و ساعت" (Date & Time) column to the Returns management table for better chronological tracking.
- **Support Tickets**:
  - Implemented an automatic cron job (via BullMQ) that automatically changes ticket status to `CLOSED` if a ticket has been `WAITING_FOR_USER` for over 72 hours.
  - Added a robust Ticket Feedback system: Users are now presented with an interactive survey (Star Rating with hover effects, Like/Dislike, Text Comment) when their ticket is Closed or Resolved. (Added `TicketFeedback` Prisma model).
  - Admins can now view customer feedback directly within the Admin Ticket Details page with dynamic color-coded UI based on the feedback score.
  - Updated descriptive texts in the user profile ticket list to clarify automatic closing rules.

### Fixed
- **Empty Cache Poisoning in Redis**: Fixed an issue in `src/lib/cache.ts` where returning an empty array (`[]`) would be cached (since it's truthy in JS), causing the homepage carousels (New Arrivals, Popular, etc.) to not render newly added products for 15 minutes. Empty arrays are now explicitly bypassed.
- **Cache Invalidation & Path Revalidation**: Added `revalidatePath` and `invalidateCachePattern` for public paths (`/`, `/products`, `/categories`) in `src/actions/product.ts` (create, update, delete) and `bulk-import-worker.ts` so that new products appear instantly on the storefront.
- **Persian Slug Generation**: Changed the regex in product creation from `[\s\W-]+` to `[^\p{L}\p{N}]+` (supporting Unicode) to generate readable and SEO-friendly Persian slugs. Added `decodeURIComponent` in the product detail page to support non-ASCII characters in DB lookups.
- **Flash Sale Discount Rendering Issue**: Fixed a logical bug in `getEffectivePrice` where expired or deleted flash sales would still incorrectly show a `00:00:00` countdown timer and styling on the product card if the product had a regular base discount. Extracted `hasActiveFlashSale` explicitly to prevent regular discounts from triggering the flash sale UI.
- Fixed TypeScript variable scoping and `prefer-const` warnings in `src/actions/product.ts`.
- Fixed missing React Hooks dependencies in `BulkImportModal.tsx` by using `useCallback` and proper dependency arrays.
- Fixed TypeScript `any` typing errors on string `.replace` callbacks in the bulk import worker.
- Fixed an `Unauthorized` error when managing blog categories by updating the permissions check in `createArticleCategory` to properly utilize the `canManageBlog` utility, allowing `SUPER_ADMIN` and `BLOG_ADMIN` to create categories.
- Resolved a critical `react-hooks/static-components` error in `Pagination.tsx` by extracting the `PageWrapper` component outside the render loop, optimizing performance and state retention.
- Fixed a TypeScript syntax error (`TS1003`) in `src/actions/bulk-import.ts`'s catch block.
- Executed a comprehensive ESLint cleanup across the codebase, removing over 17 unused imports and variables to achieve a 100% warning-free state.
- Updated `eslint.config.mjs` to properly ignore unused variables prefixed with an underscore (`_`), aligning with standard TypeScript practices.
- Fixed an issue in `src/app/admin/users/page.tsx` where a runtime exception (`ReferenceError: searchQuery is not defined`) occurred during search pagination.
- Fixed an issue where `.toLocaleString()` would fallback to English digits by explicitly passing `'fa-IR'`.
- Fixed a Prisma 8 query syntax error (`.skip is not a function`) in the Audit Logs page by refactoring pagination to use `.offset()` and `.limit()`, and aggregate count.
- Fixed a Prisma 8 `unique constraint` violation when editing products by implementing bulk deletion of previous product specifications via the SQL builder (`db.raw.sql...delete().where(...)`) before inserting new ones.
- **Codebase Standardization (RTL Layouts)**: Replaced physical directional Tailwind classes (e.g. `pl-`, `mr-`) with logical equivalents (`ps-`, `me-`) across 31 files to fully align the project with standard RTL best practices as requested in `CODING_GUIDELINES.md`.
- **E2E Testing Stabilization**: Resolved test flakiness across critical integrations (`flashsale`, `recommender`, `coupon`, `wishlist`, `tickets`) by decoupling them from the Next.js JIT boot delay in Playwright's local webServer, successfully passing all assertions.

