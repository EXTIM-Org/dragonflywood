# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-10-01

### Added
- **Zarinpal Payment Gateway Integration**: Integrated Zarinpal v4 REST API gateway (`requestZarinpalPayment`, `verifyZarinpalPayment`) with merchant ID `1c57c4f9-d4a1-42b2-b830-c24daaa89850`, automatic redirection, verification callback handler (`/api/payment/verify`), custom payment result screen (`/checkout/result`), and tracking code display across user and admin order pages.
- **UI Architecture**: Created a reusable, fully responsive `Modal.tsx` component in `src/components/ui/` with backdrop blur, scroll locking, and max-height constraints.

### Changed
- **Profile / Address Management**: Refactored `NewAddressForm.tsx` to use the new `Modal.tsx` component, fixing mobile responsiveness and layout clipping.
- **Admin / Categories**: Refactored `CategoryClient.tsx` to utilize `Modal.tsx` for adding and editing categories.
- **Admin / Products**: Improved mobile header layout by stacking buttons (Export, Import, Add) and wrapping texts gracefully to prevent horizontal overflows.
- **Admin / Orders**: Updated `AdminOrdersFilter.tsx` to stack the status dropdown and search button on mobile screens, preventing the search button from exceeding the screen width.
- **Admin / Returns**: Applied the same flexbox constraints to `AdminReturnsFilter.tsx` to ensure search boxes and buttons fit inside the mobile viewport.
- **Admin / Flash Sales**: Adjusted padding on the mobile view of the "New Flash Sale" page.
- **Layout**: Moved `overflow-x-hidden` from `<main>` to `<body>` in `src/app/layout.tsx` to ensure modals and date pickers can properly cover the screen without layout conflicts.

### Fixed
- **Home Page**: Fixed a horizontal scroll issue on mobile devices caused by absolute positioned background gradients escaping the parent constraints (`src/app/page.tsx`).
- **Map Component**: Fixed a geolocation edge case in `MapComponent.tsx` that broke the app when location services were unavailable.
- **Header**: Removed the unused "About Us" link from the mobile hamburger menu in `Header.tsx` to reduce clutter.
- **Code Quality**: Removed unused imports (`Info` icon from `lucide-react`) in `Header.tsx` to maintain 0 ESLint warnings.
