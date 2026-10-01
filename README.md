# 🛒 Dragonfly Wood - Modern E-Commerce Platform

![Next.js](https://img.shields.io/badge/Next.js-16.3.5-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-8.0-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-336791?logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-BullMQ-DC382D?logo=redis)

**EXTIM** is a monolithic e-commerce platform built for the Iranian market. It uses the **Next.js App Router** and **React Server Components (RSC)** to render a Persian, RTL storefront with search, catalog, and SEO features.

---

## ✨ Key Features

- **Storefront & Catalog**:
  - Full RTL layout with native Persian typography and numeral localization.
  - Advanced product variants (colors, sizes, storage) with dynamic pricing and inventory.
  - Intelligent recommender system (Popular, FBT, New Arrivals, Similar).
  - High-performance, Server-Side Rendered (SSR) search and filtering.
- **Dynamic Pricing & Smart Promotions**:
  - Global discounts and scheduled flash sales with live countdowns.
  - Database-driven BOGO and cart-total promotions are calculated for cart display and upsell messages. Checkout currently applies coupons but does not include these campaign discounts in the order total.
  - Cart Upsell nudges (e.g., "Add 1 more to get 50% off") and dynamic Free Shipping progress bar.
- **Cart & Order Management**:
  - React Context-powered client cart with local persistence for guests and server-side validation for signed-in users.
  - Soft-reservation (15 mins) to prevent overselling.
- **Comprehensive Admin Dashboard**:
  - Complete CRM for Users, Orders, Products, Promotions, Blog, and Returns.
  - **Admin Audit Logs**: Comprehensive tracking of sensitive admin actions (IP, User-Agent, timestamp) for enhanced security.
  - Dedicated UI for managing smart discount campaigns with category targeting.
  - Excel/ZIP Bulk Import system for massive catalog updates (background processing).
- **Support & Ticketing**:
  - Advanced support ticket system with automated closing rules (72hr).
  - Post-resolution CSAT (Customer Satisfaction) feedback collection.
- **Technical Excellence**:
  - Redis caching for selected catalog and recommendation queries.
  - Automated Image Optimization (WebP, `sharp`, auto-resizing).
  - Schema.org JSON-LD generation for optimal Google SERP presence.

---

## 🛠️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16.3.5 (App Router)](https://nextjs.org/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4.0](https://tailwindcss.com/) + Lucide Icons |
| **State Management** | React Context for cart state |
| **Database** | [PostgreSQL](https://www.postgresql.org/) via [Prisma 8 ORM](https://www.prisma.io/) |
| **Caching & Queues** | [Redis](https://redis.io/) + [BullMQ](https://docs.bullmq.io/) |
| **Image Processing** | [Sharp](https://sharp.pixelplumbing.com/) (WebP conversion) |

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed on your local machine:
- **Node.js** (v20.9.0 or higher, as required by Next.js 16)
- **PostgreSQL** (v15 or higher)
- **Redis** (v7 or higher; this is the version used by Docker Compose)

### 2. Installation

Clone the repository and install the dependencies:
```bash
git clone https://github.com/EXTIM-Org/dragonflywood.git
cd dragonflywood
npm install
```

### 3. Start Local Services
The included Docker Compose file starts PostgreSQL and Redis with local development credentials:
```bash
docker compose up -d
```

### 4. Environment Variables
Create a `.env` file in the project root with the local database URL and a private JWT secret:
```env
DATABASE_URL="postgresql://ecommerce_user:ecommerce_password@localhost:5432/ecommerce_db"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="replace-with-a-random-secret-at-least-32-characters-long"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```
`REDIS_URL` defaults to `redis://localhost:6379`. SMTP settings are optional; without `SMTP_HOST`, email delivery is mocked and logged locally.

### 5. Database Setup
For a new, empty database, apply the active Prisma 8 contract:
```bash
npx prisma db init
```
For local contract changes, use `npx prisma contract emit` followed by `npx prisma db update`. For shared or production databases, use reviewed migrations (`npx prisma migration plan` and `npx prisma db migrate`). The contract source is `src/prisma/contract.prisma`; do not edit the legacy `prisma/schema.prisma` for this setup.

### 6. Running the Application
The platform consists of two main processes: the Next.js web server and the BullMQ background worker. You can run both concurrently:

```bash
# Starts both the Next.js dev server and the background worker
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### 7. Testing (E2E)
The project includes a comprehensive suite of End-to-End (E2E) tests powered by Playwright. The tests cover both Desktop and Mobile viewports for all critical flows including Authentication, Cart, Admin Returns, and Campaigns.

To run the E2E tests, ensure the local dev server is running, then execute:
```bash
npm run test:e2e
```
To view the UI trace for failed tests, use `npx playwright show-trace <path-to-trace.zip>`.

---

## 📚 Documentation Directory

The project includes detailed technical documentation located in the `/docs` folder:

- 🏗️ **[System Architecture](docs/ARCHITECTURE.md)**: Details on the monolithic structure, Server Actions, and Caching strategies.
- 👨‍💻 **[Coding Guidelines](docs/CODING_GUIDELINES.md)**: Rules for writing clean, consistent, and localized React code.
- 📦 **[Prisma 8 Quick Reference](prisma-8.md)**: Contract location, setup commands, and Prisma 8 workflow.
- 📜 **[Changelog](docs/CHANGELOG.md)**: A chronological record of features, fixes, and updates.
- 🤝 **[Handover Document](docs/HANDOVER.md)**: A comprehensive guide for new developers joining the project (State, Workflows, Missing Features).

---

## 📜 Available Scripts

- `npm run dev` - Starts the Next.js development server and the background worker concurrently.
- `npm run build` - Builds the application for production.
- `npm run start` - Starts the production server.
- `npm run lint` - Runs ESLint to catch syntax and style issues.
- `npm run test:e2e` - Runs the Playwright End-to-End test suite across Desktop and Mobile configurations.
- `npm run worker` - Starts the standalone BullMQ worker process for background jobs (Flash Sales, Bulk Imports, Notifications).
- `npm run dev:clean` - Clears the Next.js `.next` cache and starts the dev server (useful for fixing stale RSC cache).

Production deployments must run `npm run start` and `npm run worker` as separate long-running processes.

---

## 🛡️ License
Copyright © 2026 Dragonfly Wood. All rights reserved.
