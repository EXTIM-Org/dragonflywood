# 🏗️ System Architecture & Tech Stack

This document outlines the architectural decisions, structural patterns, and technology stack powering the EXTIM E-Commerce platform.

---

## 1. Core Architecture (Monolith)

The EXTIM platform follows a **Modern Monolithic Architecture** using Next.js 16.3.5. The web application and its background worker are separate processes in the same repository and share the application contract and services.

- **Next.js App Router**: Utilizes React Server Components (RSC) to render UI on the server, shipping zero JavaScript to the client where possible.
- **Server Actions**: All backend mutations (creating orders, updating products, etc.) are handled via secure Server Actions directly within the Next.js environment, eliminating the need for a traditional REST API layer.
- **Type Safety**: End-to-end type safety from the database schema to the client UI using TypeScript.

---

## 2. Technology Stack

### Frontend Layer
| Technology | Purpose |
| :--- | :--- |
| **Next.js 16.3.5** | SSR, SSG, Routing, and API Handlers |
| **React 19** | UI Library |
| **Tailwind CSS 4.0** | Utility-first styling for high performance and strict design system adherence |
| **React Context** | Client-side shopping cart state; guest carts persist in local storage |
| **Lucide React** | Scalable SVG icons |

### Backend & Data Layer
| Technology | Purpose |
| :--- | :--- |
| **PostgreSQL 15+** | Primary relational database; Docker Compose currently uses PostgreSQL 15 |
| **Prisma 8 ORM** | Type-safe database schema management and query builder |
| **Redis 7** | Cache, BullMQ queues, rate limiting, and JWT secret storage |
| **BullMQ** | Reliable Redis-based job queue for background workers |
| **jose** | Stateless HS256 JWT sessions in the HttpOnly `extim_session` cookie |
| **Sharp** | High-performance Node.js image processing (WebP conversion, resizing) |
| **Zod** | Server-side form and import validation |

---

## 3. Performance & Infrastructure

To handle enterprise-level scale and ensure maximum reliability, the following systems have been integrated:

### 3.1. Advanced Caching Strategy
- **Redis Caching**: Selected catalog and recommendation queries are cached via the `withCache` helper in `src/lib/cache.ts`.
- **Cache Invalidation**: Server Actions and background workers invalidate matching Redis cache keys and revalidate affected Next.js paths.

### 3.2. Background Processing (Workers)
Heavy, non-blocking, and recurring operations are offloaded to **BullMQ** and processed by dedicated background workers:
- **Bulk Imports**: Processing large Excel/ZIP files for catalog updates.
- **Cart Cleanup**: Releasing soft-reserved inventory (15 mins) if an order is not completed.
- **Flash Sales**: Expiring old flash sales automatically.
- **Ticketing**: Closing inactive tickets after 72 hours.

### 3.3. Database Indexing
The active contract currently declares compound unique constraints but no explicit `@@index` directives. Do not assume the lookup and sorting indexes described in older notes are present; inspect the live database and query plans before making performance claims. Add required indexes to `src/prisma/contract.prisma` and apply them through reviewed migrations.

### 3.4. Image Pipeline
All uploaded images go through a strict pipeline:
1. Validated for size and mime type.
2. Resized dynamically using `sharp` (e.g. 1200x1200px max for products).
3. Converted to WebP format for 80%+ file size reduction without quality loss.

---

## 4. Smart Recommender System

The platform includes an intelligent recommendation engine to boost sales:
1. **Category-based Recommendations:** Suggests similar products from the same category, ordered by sales count; technical specifications are not currently used for similarity matching.
2. **Collaborative Filtering:** Uses products appearing in the same orders to display complementary "Frequently Bought Together" items.
3. **Trending Algorithms:** Intelligently displays top-selling and most-viewed items using optimized, cached database queries.

---

## 5. Security Measures
- **Rate Limiting**: A Redis-backed atomic (LUA scripted) Rate Limiter protects endpoints from brute-force and SMS bombing.
- **Role-Based Access Control (RBAC)**: Strict permission checks (`canManageStore`, `canManageBlog`) at the Server Action level.
- **Input Validation**: Server Actions validate submitted data where schemas are defined; Prisma's typed query API is the normal database access path.
