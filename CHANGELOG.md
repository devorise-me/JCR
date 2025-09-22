# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
-   **Manual Results Editing:** Administrators can now manually correct/adjust race results, showing only entered results (e.g., if 3 results are added, show only 3, not 10 placeholders).
-   **Account Management:** Added ability to disable/hide/delete accounts without breaking system consistency.
-   **Separate Test Accounts:** Implemented isolation of test accounts from official participant accounts.
-   **Control Event/Result Visibility:** Added independent hide/show toggles for participants/public and admin, allowing private work on events.
-   **News, Announcements, About Us System:**
    -   Extended news system to allow more than 3 entries, with title, image, summary, details, ordered newest → oldest.
    -   Announcements: structured text, ability to upload PDF/Word, expiry date.
    -   About Us: single page with editable text, text alignment, font size, RTL support.
-   **Ads API Integration:** Configured Ads API key and ensured functionality.
-   **Backup & Restore:** Added admin option to backup data and restore in case of system failure.
-   **Account Activation & Password Reset:** Implemented API routes for account activation and password reset functionality.
-   **System Health Monitoring:** Created API route for system health checks and monitoring.
-   **System Maintenance Operations:** Created API route for system maintenance operations (e.g., database optimization, event status updates, participant number synchronization, data integrity validation, cache refresh).
-   **Admin System Dashboard:** Created admin page for system monitoring and maintenance.

### Changed
-   **Participant Ordering in Events:** Fixed public view ordering of participants to match admin view ordering (by registration time, earliest first). Ordering stays consistent after registration closes and after refresh.
-   **Camel Disable/Enable Visibility:** Fixed bug where disabled camels disappear completely. Now, disabled camels are hidden from participants but still visible to admin, with an option to re-enable. (Restored 37 missing camels).
-   **Search by Chip:** Added seconds to the timestamp shown in chip search results (currently only hours/minutes are shown).
-   **System Stability:** Optimized for high load (many participants and results) with rate limiting, caching, and performance monitoring.
-   **Fixed Participant Numbers:** Ensured participant numbers remain consistent across all stages.
-   **Login Issues:** Improved login action with better error handling and account activation checks (though `isActive` field was later removed from User model).
-   **Chip/Phone Validation:** Improved validation logic for chip and phone numbers to ensure correctness (Saudi-specific phone validation, alphanumeric chip IDs).
-   **Event Completion:** Events now automatically end and disappear after their completion date.
-   **Remove Test Data:** Implemented functionality to clean up test/demo data and old records from production.
-   **Refresh Session Stability:** Ensured page refresh does not reset or break active sessions.
-   **Event Creation Date Issues:** Allowed creating events with single day or multiple days. Calendar now reflects event duration correctly (Red = finished, Green = active, Grey = upcoming).
-   **Activity Log:** Replaced database path codes with user-friendly labels in admin activity log.
-   **General Polish and Bug Fixes:** Implemented various general polish and bug fixes as needed.

### Fixed
-   **Route Conflicts:** Resolved Next.js dynamic route slug conflicts (e.g., `[id]` vs `[userId]`).
-   **Missing UI Components:** Added missing `shadcn/ui` components (`textarea`, `switch`, `progress`).
-   **TypeScript Errors:** Corrected TypeScript compilation errors related to missing fields in Prisma models (`isActive`, `disabled` on `User` model).



