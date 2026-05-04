# Claude Code Skills: Unified EventKart Frontend (Web/iOS/Android)

This document upgrades the specialized skills for Claude Code to ensure a **Single Codebase Policy**. Claude must generate React Native (Expo) code that operates seamlessly across Web, iOS, and Android while maintaining the exact visual fidelity of the provided "Elevate" HTML designs[cite: 9, 10, 11].

## 1. Unified Architectural Standards
Claude must prioritize "Universal" components that leverage **Expo Router** and **NativeWind** to eliminate platform-specific branching where possible.

### 1.1 Responsive Container Mapping
*   **Unified Max-Width:** Enforce a `max-w-7xl` (1280px) container for Web/Tablet views to match the desktop layout[cite: 9, 11, 15].
*   **Mobile Scaling:** For mobile screens, transition to full-width containers with strict `gutter` (24px) padding[cite: 10, 14, 16].
*   **Adaptive Shells:**
    *   **Web/Tablet:** Render the `TopAppBar` with persistent navigation links[cite: 10, 15].
    *   **Mobile:** Render the `BottomNavBar` for primary navigation[cite: 14, 15] and a simplified mobile header[cite: 15].

### 1.2 Multi-Platform Typography (Inter & Noto Serif)
*   Implement a unified `Typography` component that maps:
    *   `font-display`, `h1`, `h2` $\rightarrow$ **Noto Serif** (Weights 400-900)[cite: 11, 16].
    *   `body`, `label`, `button` $\rightarrow$ **Inter** (Weights 400-700)[cite: 11, 16].
*   Standardize font sizes: `h1` (36px), `h2` (30px), `h3` (24px), and `button` (14px)[cite: 9, 10].

## 2. Shared Component Skills
Claude must generate components that use **Flexbox** for layouts to ensure compatibility across CSS (Web) and Yoga (Mobile).

### 2.1 Universal Form Engine
*   **Input Fields:** Standardize a 50px height with `border-outline-variant` and `tertiary-fixed` focus states for all platforms[cite: 12, 13, 16].
*   **OTP Verification:** Build a platform-agnostic 6-digit input that handles physical keyboard input (Web) and numeric pad focus (Mobile)[cite: 13, 14].
*   **Role Switcher:** Implement the "Planner vs Vendor" segmented control using a shared `View` container that mimics the HTML `surface-container` background[cite: 16].

### 2.2 Bento & Gallery Grids
*   **Dynamic Hero Gallery:** Replicate the 4-column (Web) to 1-column (Mobile) grid using NativeWind's responsive prefixes (e.g., `md:grid-cols-4`)[cite: 10, 15].
*   **Interactive Stats:** Replicate dashboard cards with gradient-bottom decorative charts that render consistently on all screens[cite: 11].

## 3. Advanced Integration Skills

### 3.1 Platform-Aware Networking
*   Generate an `apiClient` that automatically detects the environment:
    *   **Android Emulator:** Redirect to `http://10.0.2.2`.
    *   **iOS Simulator/Web:** Redirect to `http://localhost`.
*   Payload mapping: Strictly type all `Zustand` store actions using the schema definitions found in the `backend-repo` Bruno files.

### 3.2 Unified Authorization (RBAC) Layer
*   **Role-Based Routing:** Use **Expo Router** groups `(user)` and `(vendor)` to separate concerns based on the `currentRole` in the Zustand store[cite: 11, 14].
*   **Permission Guarding:**
    *   `USER` role sees "Discover" and "Invitation Manager"[cite: 14, 15].
    *   `VENDOR` role sees "Business Dashboard" and "Portfolio Management"[cite: 11, 16].

## 4. Visual Parity Check-List
*   **Colors:** Strictly adhere to hex codes: `#000000` (Primary), `#131b2e` (Primary Container), and `#cba72f` (Tertiary)[cite: 9, 10, 11].
*   **Icons:** Use **Material Symbols Outlined** globally. Ensure the `FILL` attribute is handled via component props to match HTML data-icon states[cite: 9, 11].
*   **Shadows:** Use `shadow-sm shadow-slate-900/5` for containers to maintain the "Modern Minimalist" aesthetic[cite: 9, 10, 15].