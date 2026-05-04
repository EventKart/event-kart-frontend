# Claude Code Skills: Unified EventKart Frontend & Design System Constraints

This document establishes the **Technical Design Contract** for Claude Code to generate a unified frontend (Web/iOS/Android). Claude must strictly adhere to these constraints to ensure that React Native components achieve exact visual and behavioral parity with the provided reference designs[cite: 9, 10, 11].

## 1. Unified Architectural Standards
Claude must prioritize "Universal" components that leverage **Expo Router** and **NativeWind** to eliminate platform-specific branching[cite: 10, 14].

### 1.1 Responsive Container Mapping
*   **Unified Max-Width:** Enforce a `max-w-7xl` (1280px) container for Web/Tablet views to match the desktop layout specifications[cite: 9, 11, 15].
*   **Mobile Scaling:** For mobile screens, transition to full-width containers with strict `gutter` (24px) and `margin` (32px) padding[cite: 10, 14, 16].
*   **Adaptive Shells:**
    *   **Web/Tablet:** Render the `TopAppBar` with persistent navigation links and a hidden drawer button[cite: 10, 15].
    *   **Mobile:** Render the `BottomNavBar` for primary navigation[cite: 14, 15] and the simplified "EventPro" mobile header[cite: 12, 13, 15].

---

## 2. Design System Constraints (The "Elevate" Spec)
All components must programmatically utilize these exact variables to maintain the premium minimalist aesthetic[cite: 9, 10].

### 2.1 Core Color Palette
| Token | Hex Value | Usage Context |
| :--- | :--- | :--- |
| `primary` | `#000000` | High-impact text, primary action buttons[cite: 10, 13]. |
| `primary-container`| `#131b2e` | Highlighted "Signature" cards and dark-theme panels[cite: 14, 16]. |
| `tertiary-container`| `#cba72f` | Star ratings, verified badges, and gold accents[cite: 10, 11]. |
| `surface-container` | `#f0edef` | Input backgrounds and dashboard section headers[cite: 11, 14]. |
| `outline-variant` | `#c6c6cd` | Border colors for cards and input fields[cite: 9, 11, 13]. |
| `background` | `#fcf8fa` | Global application background[cite: 9, 13, 16]. |

### 2.2 Typography System
*   **Serif Stack (Display):** Use **Noto Serif** (Weights: 400, 500, 600, 700, 900) for all `font-display`, `h1`, `h2`, and `h3` tags[cite: 11, 16].
*   **Sans Stack (UI):** Use **Inter** (Weights: 400, 500, 600, 700) for `body`, `label`, and `button` text[cite: 11, 16].
*   **Scaling:**
    *   `h1`: 36px (Line-height: 1.2)[cite: 9, 10].
    *   `h2`: 30px (Line-height: 1.3)[cite: 9, 10].
    *   `button`: 14px (Letter-spacing: 0.02em, Weight: 600)[cite: 9, 10].

### 2.3 Interactive & Border Specs
*   **Border Radius:** Standardize on `0.25rem` (default), `0.5rem` (lg), and `0.75rem` (xl) for cards and hero galleries[cite: 9, 10, 16].
*   **Input Height:** All form inputs (Phone, Name, Email) must be exactly **50px** high[cite: 12, 16].
*   **OTP Cell Size:** 6-digit inputs must be **48px x 56px** with a `tertiary` focus ring[cite: 13].
*   **Shadows:** Apply `shadow-[0_4px_24px_rgba(15,23,42,0.06)]` to main dashboard panels[cite: 16].

---

## 3. Specialized Integration Skills

### 3.1 Advanced UI Parity
*   **Bento Grids:** Translate Tailwind `grid-cols-12` layouts using Flexbox with percentage widths to ensure parity between CSS and Yoga[cite: 9, 11, 15].
*   **Timeline Logic:** Replicate the "Upcoming Schedule" vertical timeline with `tertiary-container` round nodes and active state indicators[cite: 11].
*   **Role Switcher:** Build the "Planner vs Vendor" toggle with `surface-container` backgrounds and `surface-container-lowest` active states[cite: 16].

### 3.2 Universal Networking & Auth
*   **Environment Detection:** Use a shared constant to toggle between `10.0.2.2` (Android) and `localhost` (iOS/Web)[cite: 15].
*   **Auth Store (Zustand):** Manage `USER` and `VENDOR` roles to conditionally hide/show the "Invitation & RSVP Center" or "Vendor Dashboard" based on the profile selection[cite: 11, 14, 16].