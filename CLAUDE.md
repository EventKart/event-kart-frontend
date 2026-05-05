# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start           # Expo dev server on port 9000 (web + QR for mobile)
npm run android     # Launch on Android emulator
npm run ios         # Launch on iOS simulator
npm run web         # Launch in browser
npm run typecheck   # npx tsc --noEmit — run this after any change
```

Copy `.env.example` → `.env` before running. Android emulator needs `10.0.2.2`; the base URL factory in `lib/api/base.ts` handles this automatically via `Platform.select`.

## Architecture

### Routing — Expo Router v4 file-based

```
app/
  _layout.tsx              # Root: loads fonts + hydrates auth. Blocks all screens until ready.
  index.tsx                # Auth redirect logic (no UI — pure <Redirect>)
  (auth)/                  # Unauthenticated stack: sign-in → otp-verify → role-select
    vendor-onboard/        # 3-step wizard: type → details → documents
  (user)/                  # Tab group: search | invitations | profile
  (vendor)/                # Tab group: dashboard | leads | portfolio
```

**Redirect flow** (`index.tsx`): not authenticated → `/sign-in` · profile incomplete → `/complete-profile` · `currentRole === VENDOR` + no vendor → `/vendor-onboard/step-1-type` · VENDOR → `/dashboard` · USER → `/search`.

### Auth State — `store/authStore.ts`

Zustand store. Key fields: `hydrated`, `isAuthenticated`, `token`, `currentRole` (`'USER' | 'VENDOR' | 'ADMIN'`), `user`, `vendor`, `pendingPhone`.

- `hydrate()` — reads token from storage, validates via `GET /api/users/me`, sets `hydrated: true`. Called once in `_layout.tsx`.
- `setToken()` — synchronous state update + fire-and-forget `SecureStore`/`localStorage` persist. **Do not await.**
- On web, `localStorage` is used instead of `expo-secure-store` (the web stub is a no-op).
- `isProfileComplete(user)` (from `types/index.ts`) — checks `firstName` + `lastName` are non-empty.

### API Layer — `lib/api/`

| File | Protocol | Clients |
|---|---|---|
| `base.ts` | — | Exports `SERVICE_URLS` (ports 8081–8084) |
| `graphqlClient.ts` | GraphQL over `fetch` | `userGql`, `vendorGql`, `invitationGql` |
| `axiosClient.ts` | REST/Axios | `userClient`, `mediaClient` |
| `auth.ts` | REST | OTP request/verify, Google, `/api/users/me` |
| `vendors.ts` | GraphQL | `getAllVendors`, `getVendor`, `createVendor`, `updateVendor`, `searchVendors` |
| `invitations.ts` | GraphQL | `createInvitation`, `getInvitationsByUser`, `getInvitationStats`, `sendBulkInvites` |
| `media.ts` | REST | `uploadMedia`, `getMedia`, `deleteMedia` |

**Custom GraphQL client** (`graphqlClient.ts`): a minimal `fetch`-based implementation, **not** `graphql-request`. This was intentional — `graphql-request` v7 emitted duplicate `Content-Type` headers that Spring rejected. Do not replace it.

The client reads the auth token directly from `useAuthStore.getState().token` (synchronous) rather than `SecureStore.getItemAsync` (async) to avoid lag after sign-in.

### Hooks — `hooks/`

- `useVendors.ts` — `useAllVendors`, `useVendor(id)`, `useSearchVendors(query, type)` (includes pagination + 400ms debounce)
- `useInvitations.ts` — `useInvitations`, `useInvitationStats(id)`
- `useMedia.ts` — `useVendorMedia(vendorId)`
- `useIsWide.ts` — `Platform.OS === 'web' && width >= 768`. Use this for responsive layout decisions.

### Responsive Layout Pattern

Every screen follows this pattern:

```tsx
const isWide = useIsWide();
// SafeAreaView: no edges on wide web (WebTopAppBar handles top inset)
<SafeAreaView edges={isWide ? [] : ['top', 'bottom']}>
  {isWide ? <WebTopAppBar variant="user" /> : <MobileHeader />}
  ...
</SafeAreaView>
```

Tab bars are hidden on wide screens via `tabBarStyle: isWide ? { display: 'none' } : { ... }` in `_layout.tsx` files. `WebTopAppBar` uses `position: 'sticky' as any` (a web-only CSS workaround acceptable for RN web).

### Design System — `tailwind.config.js`

Material 3-inspired. Key color tokens:

| Token | Value | Usage |
|---|---|---|
| `primary-container` | `#131b2e` | Primary buttons, active states |
| `tertiary-container` | `#cba72f` | Gold accent, active nav links |
| `surface-container-lowest` | `#ffffff` | Cards |
| `surface-on` | `#1b1b1d` | Primary text |
| `surface-on-variant` | `#45464d` | Secondary text |
| `outline-variant` | `#c6c6cd` | Card borders |
| `bg` | `#fcf8fa` | Screen background |

Fonts: `font-serif-bold` (NotoSerif_700Bold) for headings, `font-sans-sb` (Inter_600SemiBold) for buttons/labels, `font-sans` (Inter_400Regular) for body.

Input height is **50px** (use `style={{ height: 50 }}`, not `h-12` which is 48px).

### Backend Services

| Service | Port | Protocol |
|---|---|---|
| User Management | 8081 | REST (`/auth/…`, `/api/users/me`) + GraphQL |
| Vendor Management | 8082 | GraphQL |
| Media Management | 8083 | REST (multipart upload) |
| Invitation Management | 8084 | GraphQL |

Auth: JWT Bearer, 24h expiry. In development, OTP responses include a `devOtp` field — the OTP verify screen auto-fills it.