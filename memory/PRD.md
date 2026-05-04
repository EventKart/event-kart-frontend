# Product Requirements Document (PRD): EventKart Ecosystem

## 1. Project Overview
EventKart is a premium, dual-sided managed marketplace designed to connect high-end event planners (Users) with verified service providers (Vendors)[cite: 8]. The ecosystem features a unified mobile and web experience built with React Native, focusing on organized clarity, modern minimalism, and professional trust[cite: 1, 8].

---

## 2. User Roles & Permissions
*   **USER (Planner):** Can search for vendors, view premium profiles, manage event invitations, and track RSVPs[cite: 1, 6, 7].
*   **VENDOR:** Can onboard their business, manage a professional dashboard, upload media portfolios, and respond to booking requests[cite: 2, 8].
*   **ADMIN:** Overarching management of platform verification and system health[cite: 1, 2].

---

## 3. Functional Requirements

### 3.1 Identity & Access Management (IAM)
*   **Authentication:** Implement a phone-based OTP login system and Google/Apple SSO integration[cite: 3, 8].
*   **OTP Verification:** A dedicated 6-digit verification interface for securing account access[cite: 4].
*   **Role Selection:** Post-authentication, users must designate themselves as either a "Planner" or a "Vendor" to customize their experience[cite: 8].
*   **Profile Completion:** Collect basic details (First Name, Last Name, Email) and business-specific data for vendors[cite: 5, 8].

### 3.2 Discovery & Search (User Domain)
*   **Global Search:** A centralized search bar for finding vendors, venues, and specialized services[cite: 7].
*   **Category Navigation:** Chips for quick filtering by category, including Photographers, Catering, Venues, and Decorators[cite: 7].
*   **Featured Experiences:** A bento-grid layout showcasing premium "Featured" listings with high-fidelity imagery[cite: 7].
*   **Vendor Profiles:** Detailed views including verified badges, cinematic image galleries, service packages (Essential vs. Signature), and client reviews[cite: 1].

### 3.3 Vendor Management (Vendor Domain)
*   **Self-Onboarding:** A guided flow for vendors to submit business metadata, location, and required credentials[cite: 8].
*   **Business Dashboard:** Real-time performance tracking including profile views, total earnings, and conversion rates[cite: 2].
*   **Request Management:** An actionable interface to accept or decline pending booking requests with specific event details[cite: 2].
*   **Schedule Tracking:** A timeline-based "Upcoming Schedule" to manage confirmed event dates[cite: 2].

### 3.4 Media Service
*   **Portfolio Management:** Tools for vendors to upload and organize images and documentation[cite: 1, 2].
*   **Storage Strategy:** Integration for saving files to a local directory (`uploads/`) for prototype verification before AWS migration.

### 3.5 Invitation & RSVP Center
*   **Invitation Designer:** A premium editor to customize event invitations with sophisticated typography and champagne gold aesthetics[cite: 6].
*   **RSVP Tracker:** A real-time analytics dashboard tracking "Accepted," "Pending," and "Declined" guest responses[cite: 6].
*   **Guest Management:** A searchable guest list with tags for dietary preferences (e.g., Veg) and relationship groups[cite: 6].
*   **Bulk Communication:** Integration for sending invitations via Email or WhatsApp broadcasts[cite: 6].

---

## 4. Technical Specifications

### 4.1 Frontend Architecture
*   **Framework:** React Native / Expo (Cross-platform iOS, Android, and Web).
*   **Styling:** NativeWind (Tailwind CSS) using the specified "Elevate" color palette[cite: 1].
*   **Fonts:** Noto Serif for headers/display and Inter for body/labels[cite: 1, 8].
*   **Icons:** Material Symbols Outlined[cite: 1, 2].

### 4.2 API & Data Integration
*   **API Contracts:** Use existing Bruno collections in the `backend-repo` for service integration.
*   **Mock Storage:** Use In-Memory `ConcurrentHashMaps` for data persistence during the prototype phase.

---

## 5. UI/UX Design Contract
*   **Navigation Shell:** A responsive TopAppBar for web/tablet and an adaptive BottomNavBar for mobile[cite: 1, 2, 7].
*   **Interactive Feedback:** Use high-fidelity textures, ambient shadows, and refined borders to convey modern sophistication[cite: 1].
*   **Adaptive Layouts:** Switch between "Host Member" views and "Vendor" dashboards within the same application shell[cite: 2, 5].