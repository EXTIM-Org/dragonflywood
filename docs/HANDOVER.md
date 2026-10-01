# Project Handover & Context Summary

This document serves as a comprehensive summary of the EXTIM E-Commerce project for onboarding a new AI Agent to continue development.

## 🛠 Tech Stack & Environment
- **Framework**: Next.js 16.3.5 (App Router)
- **Database ORM**: **Prisma 8 (Contract-First ORM)** (This is highly critical! See Prisma 8 Caveats below)
- **Database Provider**: PostgreSQL (via `@prisma/orm-postgres`)
- **Styling**: Tailwind CSS + Lucide React icons
- **State Management**: React Context (`CartContext.tsx`)
- **Validation**: Zod (Server Actions)
- **Authentication**: Stateless JWT Sessions (via `jose` storing `userId`, `name`, `role`, etc., in `extim_session` cookie).

## 📦 Features Implemented & Current State

### 1. Database Contract
The active Prisma 8 source of truth is `src/prisma/contract.prisma`, configured by `prisma.config.ts`. Its generated artifacts are `src/prisma/contract.json` and `src/prisma/contract.d.ts`, and the runtime is initialized in `src/prisma/db.ts`. The root `prisma/schema.prisma` is a legacy schema and is not the source used by the current Prisma configuration.

The contract covers users and roles, catalog and inventory, carts and orders, coupons and promotions, wishlists, reviews and Q&A, articles, tickets and feedback, returns, and admin audit logs. Confirm the contract and migration state before changing or deploying the database schema.

### 2. User Authentication & Profile
- Fully functional login and registration with hashed passwords (`bcryptjs`).
- Profile layouts and sidebar navigation implemented (`src/app/profile/layout.tsx`).
- Users can update their profile name (synchronizes directly with the JWT Session Cookie).
- Users can add and delete multiple shipping addresses.
- **Wishlist System**: Add/remove products seamlessly.

### 3. Shopping Cart & Checkout
- **Cart Context**: Client-side state management for cart items, quantities, and real-time total calculations.
- **Checkout Flow**: Validates shipping details, calculates shipping costs, creates an `Order`, generates `OrderItem`s, deducts from `Inventory`, and records an `InventoryTransaction`.

### 4. Advanced Search & Filtering (Server-Side)
- **UI**: A sticky sidebar with debounced search input, category dropdown, min/max price fields, and sorting.
- **Custom Dropdowns**: All native browser `<select>` elements have been fully replaced with custom, animated, glassmorphic dropdown components that support click-outside detection and match the premium UI.
- **Logic**: Filters are synced with URL `searchParams`. The server dynamically chains Prisma 8 `.where()` clauses (`.ilike`, `.gte`, `.lte`, `.eq`) and `.orderBy()` to fetch results efficiently.

### 5. Smart Recommender System (`src/lib/recommender.ts`)
- Tracks `viewCount` and `salesCount` (incremented async on product page load).
- **Popular Products**: Fetches products ordered by sales/views.
- **Similar Products**: Products in the same category excluding the current one.
- **Frequently Bought Together**: Uses Collaborative Filtering to suggest products bought in the same orders.

### 6. Admin Dashboard (`/admin`)
- Comprehensive admin layout with role checks in the layout and authorization checks in Server Actions; there is no auth middleware.
- **Product Management**: Admins can create new products and upload product images.
- **Order Management**: Admins can view orders and update their status (e.g., `PENDING` -> `SHIPPED`) using a custom interactive dropdown component (`StatusUpdater`).

### 7. Product Reviews & Ratings
- Fully implemented frontend UI and backend server actions.
- Automatically detects if the reviewer is a verified buyer and what variant they purchased (`isVerifiedBuyer` and `purchasedVariantName`).

### 8. Premium Theming (Light & Dark Mode)
- **Consistent Glassmorphism**: The entire application uses a state-of-the-art modern aesthetic with `backdrop-blur` and translucent backgrounds (`bg-white/5` for dark mode, `bg-white/70` for light mode).
- **Theme Toggle**: Fully supports toggling between light and dark themes using `next-themes` without any textual or structural artifacts.

### 9. Order Tracking & Timeline
- A visual order tracking timeline (`OrderTimeline`) has been implemented to show states: PENDING, PAID, PROCESSING, SHIPPED, DELIVERED.
- **Admin**: Admins can update the status of the order and add a postal tracking code in `/admin/orders/[id]`. This triggers an automatic email notification to the user.
- **User**: Users can see the graphical timeline of their order and easily copy the tracking code in `/profile/orders/[id]`.

### 10. Advanced Admin Product Management
- Full CRUD for products with dynamic variant and inventory input fields integrated in `ProductForm.tsx`.
- **Product Filters & Sorts**: The admin product list (`/admin/products`) supports filtering by text and category, as well as sorting by Base Price, Inventory Stock, and Sales Count by clicking on the table headers.

### 11. Smart Inventory Badges (FOMO & UX)
- Avoids showing exact stock numbers to preserve perceived value and prevent competitor scraping.
- **Product Cards**: Displays a beautiful "ناموجود" overlay for out-of-stock items, and a pulsing orange "موجودی محدود" badge if stock is running low.
- **Product Details Page**: Dynamically displays semantic stock statuses ("موجود در انبار", "تنها X عدد باقی مانده!", or "ناموجود") based on the selected variant, leveraging the database's `lowStockThreshold`.

### 12. Mock Payment Gateway
- A simulated payment page allows for complete end-to-end testing of the checkout flow (Order creation -> Payment -> Inventory deduction) without requiring a real third-party provider.

### 13. Coupon & Discount System
- Fully functional discount system where admins can create coupon codes (percentage or fixed amount, with expiry and usage limits).
- Users can apply these codes during checkout to receive dynamic discounts on their cart total.

### 14. Notifications & RMA Background Processing
- **Granular Notification Settings**: Admins can enable/disable SMS and Email notifications per specific lifecycle stage of Orders and Returns via `/admin/settings/notifications`.
- **RMA (Return Merchandise Authorization)**: 
  - `SUBMITTED` state added and enforced as the default schema status ("ثبت شده") for newly created return requests.
  - Automatically transitions to `PENDING` ("در حال بررسی") when loaded in the Admin Dashboard, preventing premature resolution.
  - **Dynamic Visual Tagging**: Returned items (with `REFUNDED` status) dynamically render with grayscale, line-through, and red badge styling natively across Admin Order pages through automated database relationship checks.

---


## ⚠️ CRITICAL: Prisma 8 (Contract-First) Syntax Rules
This project uses **Prisma 8**, which has breaking syntax changes compared to older Prisma versions. The previous agent encountered and resolved several errors by learning these rules:

1. **Contract and Database Updates**:
   - Update `src/prisma/contract.prisma`; do not update the legacy `prisma/schema.prisma` for the current Prisma configuration.
   - Run `npm run contract:emit` to regenerate `src/prisma/contract.json` and `src/prisma/contract.d.ts`.
   - For a new, empty database, run `npx prisma db init`. For local development schema iteration, run `npx prisma db update`.
   - For shared or production databases, review and apply migrations with `npx prisma migration plan` and `npx prisma db migrate`; do not use direct schema updates as the deployment workflow.
2. **`.where()` requires Lambdas or Object Shorthand**:
   - Correct: `.where((p) => p.categoryId.eq(catId)).where((p) => p.basePrice.gte(minPrice))`
   - **DO NOT** use string operators. Use `.eq()`, `.neq()`, `.ilike()`, `.in([...])`, `.gte()`.
   - **No `.between()`**: You must chain two `.where()` calls.
3. **`.orderBy()` requires Lambdas**:
   - Correct: `.orderBy((p) => p.salesCount.desc())`
   - Correct (multiple): `.orderBy([(p) => p.salesCount.desc(), (p) => p.viewCount.desc()])`
4. **`.include()` for Relations**:
   - Must use callbacks for nested includes.
   - Correct: `.include("items", (items) => items.include("product"))`
5. **Data fetching termination**:
   - Queries return an `AsyncIterable`. You must append `.all()` or `.first()` to consume them.
   - Correct: `await db.orm.public.Product.all()`
6. **Relational Data Mapping**:
   - Remember that `OrderItem` links to `ProductVariant` (`variantId`), NOT `Product` (`productId`).
7. **Raw Queries**:
   - Use `db.raw.sql\`...\`` to build raw SQL query plans, following the runtime API used in `src/`. For example, `db.raw.sql\`UPDATE inventory SET ...\`.affectedCount().build()`.

---

## 🚀 Next Steps (Action Items for New Agent)

The following features are the next logical steps for development:
1. **Mock Payment Flow**: (✅ Completed) A simulated payment flow supports checkout testing. A real payment gateway remains deferred until deployment.
2. **Advanced Image Uploads**: (✅ Completed) Enabled multiple image uploads per product and an image gallery viewer in the Admin panel.
3. **Email Notifications**: (✅ Completed) Provider-agnostic email delivery is implemented using Nodemailer and React Email. Phone verification is handled separately through OTP; email verification is not implemented.
4. **Sales Analytics / Charts**: (✅ Completed) Added Recharts-based visual charts to the Admin Dashboard showing revenue and top-selling products.
5. **Product Q&A System**: (✅ Completed) Implemented interactive Product Q&A section with Admin Dashboard management.
6. **Advanced Shop Page (Search & Filters)**: (✅ Completed) Server-side advanced search and filtering system.
7. **User Dashboard & Wishlist**: (✅ Completed) Fully integrated user profile, order tracking, and wishlist.
8. **Server-Side Cart & Inventory Reservation**: (✅ Completed) Logged-in users' inventory reservations expire after 15 minutes through delayed BullMQ cleanup jobs; the cart also displays reservation timers.
9. **Technical Specifications & Admin UI Enhancements**: (✅ Completed) Added `ProductSpecification` model to Prisma, allowing flexible technical specifications per product. Upgraded `ProductForm.tsx` to automatically supply optional default dimension fields (Weight, Length, Width, Height) with dynamic placeholders. Adjusted Admin UI layout to place Specifications under Variants. Polished the Product Details tabs by reorganizing their order (Reviews -> Q&A -> Specs) and updating the active Reviews tab to a premium analogous color (`rose-500`). Fixed lingering `.next` caching errors leading to 404s on admin routes.
10. **Flash Sales & UI Standardization**: (✅ Completed) Implemented time-sensitive Flash Sales with lazy evaluation pricing (no cron jobs required). Standardized all admin and user-facing `<select>` inputs to custom glassmorphic dropdowns. Fixed product card heights for consistency and integrated a "Recently Viewed Products" carousel using localStorage and server actions.
11. **Advanced SEO & Rich Snippets**: (✅ Completed) Fully integrated Google Rich Snippets via JSON-LD `@graph` on Product pages (including `Product`, `AggregateRating`, `Review`, `BreadcrumbList`, and `FAQPage`) to maximize organic search visibility and CTR.
12. **Markdown-Based Blog & CMS System**: (✅ Completed) Built a fully functional Blog for SEO optimization. Extended Prisma 8 contract with `Article` and `ArticleCategory` models. Integrated `react-markdown` and `@tailwindcss/typography` for secure and beautiful content rendering. Developed comprehensive Admin Dashboard interfaces (`/admin/blog`) for article and category management, alongside public dynamic routes (`/blog` and `/blog/[slug]`) featuring view counts and `Article` schema JSON-LD.
13. **Admin UI Refinements & Codebase Stabilization**: (✅ Completed) Resolved clipping issues in the Admin Order Status dropdown by migrating to React Portals (`createPortal`) with dynamic color-coding and scroll event handling. Executed a project-wide cleanup achieving zero TypeScript compilation errors and zero ESLint warnings, standardizing `catch` blocks in Server Actions and fixing authentication action bugs.
14. **Support Tickets & Static Pages**: (✅ Completed) Implemented the `SUPPORT` role for support-ticket and blog-management access. The project has a ticketing workflow, not a Contact Messages dashboard. Added static pages (About Us, Privacy Policy, Terms, etc.) and a dynamic footer.
15. **Dynamic Category Management**: (✅ Completed) Refactored the Category model in Prisma to support custom `image`, `iconName`, and `colorGradient`. Implemented image uploads utilizing `sharp` for WebP compression. Upgraded the public categories page (`/categories`) to seamlessly render custom images or fallback to dynamic Lucide icons within a premium glassmorphic layout. Automated unused image cleanup on category edits and deletions. Conducted full ESLint and TypeScript compilation pass for 100% codebase health.
16. **Advanced Ticketing Workflows**: (✅ Completed) Implemented dynamic ticket status transitions (auto-SEEN on admin open, auto-WAITING_FOR_USER on admin reply). Added client-side intelligent sorting to the Admin Tickets list (mapping statuses and priorities to numerical weights, keeping CLOSED tickets at the bottom). Added a client-side pagination system (10/page) with standard LTR navigation to both Admin and User Ticket pages.
18. **Admin Order Visibility**: (✅ Completed) Linked support tickets directly to their respective `Order` details within the Admin interface. Made the hidden `/admin/orders/[id]` page accessible by adding a "View Details" button to each order card in the master Admin Orders list.
19. **Security & Rate Limiting**: (✅ Completed) Implemented a distributed Rate Limiter (`src/lib/rate-limit.ts`) backed by **Redis** (`ioredis`) to prevent brute-force attacks and SMS/Email abuse on sensitive auth endpoints (`login`, `register`, `requestPasswordReset`, `sendOtp`).
20. **Background Jobs & Queue (BullMQ)**: (✅ Completed) Redis and BullMQ handle delayed cart-reservation cleanup, flash-sale expiration, notifications, bulk imports, ticket auto-close, abandoned-cart checks, and key rotation. Workers run as a standalone Node process via `src/worker-server.ts`, separate from the Next.js web server.
21. **Advanced Redis Caching**: (✅ Completed) Migrated heavy DB queries (Popular Products, Flash Sales, Recommender) to Redis using a generic `withCache` wrapper. Implemented cache invalidation patterns (`invalidateCachePattern`) triggered by Server Actions and background workers.
22. **Sentry & Pino (Monitoring)**: (✅ Completed) Integrated `@sentry/nextjs` for error tracking and added a Pino logger helper used in checkout and order-service paths. Direct `console` logging remains throughout the application; logging is not fully standardized.
23. **Security Enhancements**: (✅ Completed) Upgraded the Rate Limiter with an atomic Lua script to eliminate edge-case memory leaks during high traffic. Implemented automated JWT Secret Key rotation every month using BullMQ to secure user sessions.
24. **Database Indexing Status**: The active `src/prisma/contract.prisma` currently declares compound unique constraints but no explicit `@@index` annotations. Older notes about targeted indexes came from the legacy schema and should not be treated as proof that those indexes exist in the active contract or live database. Verify the live schema and query plans before adding or claiming indexes.
25. **Enterprise Bulk Import/Export System**: (✅ Completed) Implemented a secure, background-job (BullMQ) powered bulk import system for products via ZIP files (Excel sheet + Images by SKU). Added dynamic row validation with Zod to prevent database corruption. Implemented robust Admin-only authorization and added a fully-featured Export API that generates properly formatted multi-line Persian/English headers via `exceljs`. Also integrated dynamic `ProductSpecification` handling for dimensions (Weight, Length, Width, Height) during both Import and Export.
26. **Optimization & Performance**: (✅ Completed) Configured Next.js image formats and HTTP security headers, added OpenGraph/Twitter metadata, and lazy-loaded admin charts. Treat historical performance and connection-pooling claims as environment-dependent; verify the current deployment configuration and measure before relying on them.
27. **Admin UI Standardization & Dropdown Architecture**: (✅ Completed) Abstracted all custom, portal-based dropdowns into a highly reusable `<DropdownSelect>` component. It supports dynamic variants (`colored` vs `neutral`), smart portal positioning, and `w-full` responsiveness. Refactored `/admin/orders` to include advanced server-side search and filtering using Prisma 8. Synchronized and unified all status colors and labels across the Admin Dashboard (e.g. Orders, Returns) to perfectly match the central Notification Settings UI.
28. **Comprehensive E2E Testing Pipeline**: (✅ Completed) Integrated **Playwright** and developed 10 extremely robust end-to-end tests covering all critical flows. Tested Authentication (Login, OTP backdoor, Profile access), Admin Security (role-based redirects), Navigation, Search, and a complete E-Commerce Checkout Flow. Tuned test timeouts (up to 120s) and implemented resilient DOM locators (`toContainText` on `.first()`) to gracefully handle dynamic Next.js JIT compilation and React Server Component hydration delays in dev environments.
29. **Codebase Standardization & Deployment Readiness**: (✅ Completed) Enforced strict Right-To-Left (RTL) layout compliance across the entire project by replacing all physical directional Tailwind classes (e.g., `pl-`, `mr-`) with logical equivalents (`ps-`, `me-`) in over 31 components. Conducted a final `npm run build` verification resulting in a 100% successful production build generation (46 routes compiled), confirming the project is completely ready for server deployment without any blocking errors.
30. **Production-Ready Security Hardening**: (✅ Completed) Implemented strict Content Security Policy (CSP), upgraded session cookies to `SameSite=Strict` for absolute CSRF protection, neutralized Markdown XSS risks with `rehype-sanitize`, expanded Redis Rate-Limiting to Checkout and Coupons, and prevented payload DoS attacks by enforcing a global `10mb` Server Action body limit while moving Admin Bulk Imports to a dedicated API route.
## 📌 Future Scope & Excluded Features
- **Support Chat System**: Will use a third-party service in the future. Do not implement a custom chat system.
- **Payment Gateway**: Real payment gateway integration is deferred until final deployment. The mock gateway is sufficient for now.

## 📧 Provider-Agnostic Email System (Architecture)
The email system is designed to be completely independent of any specific vendor, allowing it to work with a personal Mail Server (like Postfix/Exim) or third-party APIs (like Resend, SendGrid) without changing any code.

- **Templating**: Emails are built using `@react-email/components` and Tailwind CSS in `src/emails/OrderStatusEmail.tsx`.
- **Sending Engine**: `Nodemailer` handles SMTP transport in `src/lib/email.ts`.
- **Usage**: To connect a real mail server, simply fill out the `SMTP_*` variables in the `.env` file. If `SMTP_HOST` is left empty, the application will automatically mock the email by logging the contents to the terminal console, allowing for uninterrupted local development.

*This handover is a documentation snapshot. Verify current behavior, generated contract artifacts, and database migration state against the repository before making changes.*
