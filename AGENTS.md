<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Dragonfly Wood Project Rules & Context

- **Support Chat System**: Do NOT build or suggest a custom support chat system. A third-party service will be used in the future.
- **Payment Gateway**: Zarinpal payment gateway is integrated. Merchant ID is configured via environment variables (ZARINPAL_MERCHANT_ID).
- **UI Components**: ALWAYS use the project's custom UI components instead of native HTML elements for a unified experience. For example, use `<DropdownSelect>` (from `@/components/ui/DropdownSelect`) instead of native `<select>` tags in all forms.
