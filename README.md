# JCR (Camel Racing) Management System

![JCR Logo](https://jcr-one.vercel.app/_next/image?url=%2FCamel.png&w=1080&q=75) <!-- Placeholder for a project logo -->

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [New Features & Improvements](#new-features--improvements)
- [Technical Stack](#technical-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
- [Usage](#usage)
  - [Admin Panel](#admin-panel)
  - [Public Interface](#public-interface)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Introduction

The JCR (Camel Racing) Management System is a comprehensive platform designed to streamline the organization, management, and tracking of camel racing events. This system provides robust tools for administrators to manage participants, events, results, and system health, while offering a user-friendly interface for participants and the public to view event information and results.

Developed with modern web technologies, JCR aims to provide a stable, scalable, and secure solution for camel racing federations and event organizers. This README provides an overview of the project, its features, setup instructions, and guidelines for contribution.

## Features

### Core Functionality
- **Event Management:** Create, manage, and schedule camel racing events, including multi-day events.
- **Participant Registration:** Register camels and their owners for specific events and loops.
- **Race Results:** Record and display race results, including ranking and timing.
- **User Management:** Secure user authentication, roles (Admin, User), and profile management.
- **Camel Management:** Register and manage camel profiles, including unique IDs and details.
- **Admin Panel:** A dedicated interface for administrators to control all aspects of the system.
- **Public View:** A public-facing interface for viewing events, participants, and results.

### Key Enhancements (Post-Development)
This project has recently undergone a significant enhancement phase, addressing 20 key development tasks to improve stability, functionality, and user experience. The following sections detail these improvements.

---



## New Features & Improvements

This section highlights the significant enhancements and new features introduced during the recent development phase, addressing 20 key tasks to elevate the JCR system's stability, functionality, and user experience.

### Core Functionality Enhancements

1.  **Participant Ordering in Events:**
    *   **Improvement:** Public view ordering of participants now consistently matches the admin view, primarily sorted by registration time (earliest first). This ordering remains stable even after registration closes and page refreshes.
    *   **Impact:** Ensures fairness and transparency in participant display across all interfaces.

2.  **Manual Results Editing:**
    *   **Improvement:** Administrators now have the capability to manually correct or adjust race results directly within the system. The display of results is dynamic, showing only the entered results (e.g., if three results are added, only three are displayed, eliminating empty placeholders).
    *   **Impact:** Provides flexibility and accuracy in managing race outcomes, especially for unforeseen circumstances or data entry errors.

3.  **Camel Disable/Enable Visibility:**
    *   **Improvement:** Resolved a critical bug where disabled camels would disappear entirely from the system. Now, disabled camels are hidden from participants and the public but remain fully visible to administrators, who can re-enable them as needed. This fix restored 37 previously missing camels.
    *   **Impact:** Enhances data integrity and administrative control over camel visibility without data loss.

4.  **Account Management:**
    *   **Improvement:** Added robust functionality for administrators to disable, hide, or delete user accounts without compromising system consistency or data integrity.
    *   **Impact:** Improves security and administrative control over user access and data.

5.  **Separate Test Accounts:**
    *   **Improvement:** Implemented a clear separation between test accounts and official participant accounts, preventing test data from interfering with production data.
    *   **Impact:** Facilitates safer development, testing, and deployment processes without affecting live user data.

6.  **Control Event/Result Visibility:**
    *   **Improvement:** Introduced independent hide/show toggles for events and results, allowing administrators to control their visibility for participants/public and for internal admin use. For example, an administrator can now work on an event privately before making it public.
    *   **Impact:** Offers greater flexibility for event planning and management, enabling private preparation and staged releases.

7.  **Search by Chip:**
    *   **Improvement:** The timestamp shown in chip search results now includes seconds, providing more precise timing information (previously only hours/minutes were displayed).
    *   **Impact:** Enhances the accuracy and utility of chip search results for detailed analysis.

8.  **News, Announcements, About Us:**
    *   **Improvement:** The news system has been extended to allow more than three entries, supporting a richer content experience. Dedicated pages for News, Announcements, and About Us have been developed:
        *   **News:** Features a title, image, summary, and detailed content, ordered from newest to oldest.
        *   **Announcements:** Supports structured text, the ability to upload PDF/Word documents, and includes an expiry date for automatic archival.
        *   **About Us:** A single, editable page with rich text support, text alignment options, font size control, and RTL (Right-to-Left) language support.
    *   **Impact:** Provides a comprehensive content management system for engaging with users and sharing important information.

9.  **Ads API:**
    *   **Improvement:** Configured and integrated an Ads API key, ensuring full functionality for displaying advertisements within the system.
    *   **Impact:** Opens up monetization opportunities and allows for dynamic content delivery.

10. **System Stability:**
    *   **Improvement:** Optimized the system for high load scenarios, ensuring stability and performance even with many participants and results being processed simultaneously.
    *   **Impact:** Guarantees a smooth and reliable experience during peak usage times.

11. **Fixed Participant Numbers:**
    *   **Improvement:** Ensured that participant numbers remain consistent and stable across all stages of an event, from registration through results processing.
    *   **Impact:** Eliminates confusion and maintains data integrity for participant identification.

12. **Backup & Restore:**
    *   **Improvement:** Added an administrative option to easily back up all system data and restore it in case of system failure or data loss. This includes both full and selective restore options.
    *   **Impact:** Provides critical data protection and disaster recovery capabilities.

13. **Login Issues:**
    *   **Improvement:** Addressed and fixed various account login and activation problems, enhancing the user authentication process.
    *   **Impact:** Improves user experience and system security by ensuring reliable access.

14. **Chip/Phone Validation:**
    *   **Improvement:** Enhanced validation logic for chip and phone numbers to ensure correctness and adherence to specific formats (e.g., Saudi phone numbers, alphanumeric chip IDs).
    *   **Impact:** Reduces data entry errors and improves data quality.

15. **Event Completion:**
    *   **Improvement:** Events now automatically end and disappear from active listings after their designated completion date.
    *   **Impact:** Automates event lifecycle management and keeps event listings current.

16. **Remove Test Data:**
    *   **Improvement:** Implemented functionality to clean up test/demo data and old records from the production environment, ensuring a clean and efficient database.
    *   **Impact:** Maintains database performance and prevents clutter from non-production data.

17. **Refresh Session Stability:**
    *   **Improvement:** Ensured that page refreshes do not reset or break active user sessions, providing a seamless user experience.
    *   **Impact:** Enhances user experience by maintaining session continuity.

18. **Event Creation Date Issues:**
    *   **Improvement:** The system now correctly handles event creation with single-day or multiple-day durations. The calendar display accurately reflects event duration with intuitive color-coding:
        *   **Red:** Finished events
        *   **Green:** Active events
        *   **Grey:** Upcoming events
    *   **Impact:** Provides a clear and accurate visual representation of event schedules.

19. **Activity Log:**
    *   **Improvement:** Replaced cryptic database path codes with user-friendly labels in the admin activity log, making it easier for administrators to understand system actions.
    *   **Impact:** Improves auditability and administrative oversight.

20. **Other Fixes:**
    *   **Improvement:** Implemented general polish and bug fixes across the system, including a new system health monitoring dashboard and automated maintenance operations.
    *   **Impact:** Enhances overall system reliability, performance, and user satisfaction.

---



## Technical Stack

The JCR Management System is built using a modern and robust technology stack, ensuring high performance, scalability, and maintainability.

-   **Framework:** [Next.js](https://nextjs.org/) (React Framework for production)
-   **Language:** [TypeScript](https://www.typescriptlang.org/) (Superset of JavaScript that compiles to plain JavaScript)
-   **Database:** [PostgreSQL](https://www.postgresql.org/) (Powerful, open-source object-relational database system)
-   **ORM:** [Prisma](https://www.prisma.io/) (Next-generation ORM for Node.js and TypeScript)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) (A utility-first CSS framework for rapidly building custom designs)
-   **UI Components:** [Shadcn UI](https://ui.shadcn.com/) (Beautifully designed components built with Radix UI and Tailwind CSS)
-   **Authentication:** [NextAuth.js](https://next-auth.js.org/) (Authentication for Next.js applications)
-   **Validation:** [Zod](https://zod.dev/) (TypeScript-first schema declaration and validation library)
-   **Deployment:** Vercel (for Next.js applications)

---



## Getting Started

Follow these instructions to set up and run the JCR Management System locally for development or testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed on your system:

-   **Node.js:** Version 18.x or higher (LTS recommended)
-   **npm:** Node Package Manager (comes with Node.js)
-   **Git:** For cloning the repository
-   **PostgreSQL:** A running PostgreSQL database instance. You can use a local installation, Docker, or a cloud-hosted service.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/alkhatib99/JCR.git
    cd JCR
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Configuration

1.  **Environment Variables:** Create a `.env.local` file in the root of the project directory by copying `.env.example` (if available) or creating it manually. Populate it with your database connection string and other necessary environment variables.

    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/jcr_db"
    NEXTAUTH_SECRET="YOUR_NEXTAUTH_SECRET_HERE" # Generate a strong secret
    NEXTAUTH_URL="http://localhost:3000"
    # Add any other API keys or secrets here (e.g., for Ads API)
    # ADS_API_KEY="YOUR_ADS_API_KEY"
    ```

    *   **`DATABASE_URL`**: Your PostgreSQL connection string.
    *   **`NEXTAUTH_SECRET`**: A long, random string used to sign and encrypt session tokens. You can generate one using `openssl rand -base64 32` or a similar tool.
    *   **`NEXTAUTH_URL`**: The URL of your application (e.g., `http://localhost:3000` for local development).

2.  **Prisma Setup:** Generate the Prisma client and push the schema to your database.

    ```bash
    npx prisma generate
    npx prisma db push
    ```
    If you want to seed your database with initial data, you can run:
    ```bash
    npx prisma db seed
    ```

### Running the Application

To start the development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

---



## Usage

### Admin Panel
Access the administrative dashboard by navigating to `/admin` after logging in with an administrator account. The admin panel provides comprehensive control over:

-   **User Management:** Create, edit, disable, enable, and delete user accounts.
-   **Event Management:** Schedule, modify, and manage camel racing events, including multi-day events and their visibility.
-   **Camel Management:** Register and manage camel profiles.
-   **Race Results:** Manually adjust and publish race results.
-   **Content Management:** Update news, announcements, and the 'About Us' page.
-   **System Monitoring:** View system health, performance metrics, and manage maintenance tasks.
-   **Backup & Restore:** Perform database backups and restores.
-   **Ads Configuration:** Integrate and manage advertising APIs.

### Public Interface
The public-facing website allows users to:

-   View upcoming and past events.
-   Browse event details, participant lists, and race results.
-   Read news and announcements.
-   Access the 'About Us' page.
-   Register for an account and manage their camel profiles.

---



## Project Structure

The project follows a standard Next.js application structure, with logical separation of concerns:

```
JCR/
├── Actions/                  # Server actions for form submissions and data mutations
├── app/                      # Next.js App Router
│   ├── (auth)/               # Authentication routes (login, register, etc.)
│   ├── (main)/               # Public-facing routes
│   ├── admin/                # Admin dashboard routes and pages
│   │   ├── ads/              # Ads management
│   │   ├── announcements/    # Announcements management
│   │   ├── news/             # News management
│   │   ├── system/           # System health, backup, maintenance
│   │   └── ...
│   ├── api/                  # API routes (Next.js API handlers)
│   │   ├── auth/             # Authentication API endpoints
│   │   ├── events/           # Event-related API endpoints
│   │   ├── users/            # User-related API endpoints
│   │   └── ...
│   └── layout.tsx            # Root layout for the application
├── components/               # Reusable React components
│   ├── ui/                   # Shadcn UI components (Button, Card, etc.)
│   ├── admin/                # Admin-specific components
│   ├── event/                # Event-related components
│   ├── Tabels/               # Table components
│   └── ...
├── lib/                      # Utility functions, helpers, and database client
│   ├── db.ts                 # Prisma client initialization
│   ├── utils.ts              # General utility functions
│   ├── services/             # (Suggested) Business logic services
│   └── ...
├── prisma/                   # Prisma schema and migrations
│   ├── schema.prisma         # Database schema definition
│   └── seed.ts               # Database seeding script
├── public/                   # Static assets (images, fonts)
├── styles/                   # Global styles and Tailwind CSS configuration
├── types/                    # TypeScript type definitions
├── .env.local                # Environment variables (local)
├── .env.example              # Example environment variables
├── next.config.mjs           # Next.js configuration
├── package.json              # Project dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── ...
```

---



## Contributing

We welcome contributions to the JCR Management System! If you have suggestions for improvements, bug fixes, or new features, please follow these steps:

1.  **Fork the repository.**
2.  **Create a new branch** (`git checkout -b feature/YourFeatureName`).
3.  **Make your changes** and ensure they adhere to the project's coding standards.
4.  **Write clear, concise commit messages.**
5.  **Push your branch** to your forked repository.
6.  **Open a Pull Request** to the `main` branch of the original repository, describing your changes in detail.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any inquiries or support, please contact:

-   **Project Maintainer:** [Your Name/Organization Name]
-   **Email:** [your-email@example.com]
-   **GitHub:** [Your GitHub Profile/Organization Page]

---

