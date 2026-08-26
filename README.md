# YD Hospital — OPD & Medicine Management (Frontend)

A frontend-only Next.js implementation of the district hospital OPD, token,
consultation, prescription and pharmacy dispensing system described in the
master prompt. **No backend / REST calls are wired up** — every action
(booking a token, calling a patient, prescribing, dispensing, managing
inventory, etc.) runs against an in-memory mock "store" so every screen is
fully interactive and demonstrates the real business rules end to end.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- lucide-react (icons), recharts (admin charts)

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 — the landing page lets you jump straight into
any of the four interfaces (Patient, Doctor, Clinic, Admin), or use
`/login` for the patient/staff login screens.

To build for production:

```bash
npm run build
npm start
```

## Design language

A "clinical signage" system: deep teal (`--teal-800` etc.) as the primary
color, warm amber as the token/accent color, IBM Plex Sans for UI text,
Space Grotesk for headings, and JetBrains Mono for the signature
**split-flap departure-board** token display (`components/token/TokenBoard.tsx`)
used everywhere a token number appears — patient confirmation, doctor
current-token, login hero — echoing real hospital/airport signage so a
token always reads as "the thing that tells you where to go."

## How the mock backend works

`lib/store.tsx` exposes a `HospitalProvider` (wrapped around the whole app
in `app/layout.tsx`) and a `useHospital()` hook. It holds all entities
(doctors, rooms, tokens, medicines, prescriptions, notifications,
assignments, inventory transactions) in React state and exposes actions
mirroring the REST endpoints in the brief, e.g.:

- `bookToken(roomId)` — patient books one token per visit
- `callNext(roomId)` / `holdToken` / `skipToken` / `recallToken` — doctor
  queue control, in strict FIFO order
- `submitPrescription(...)` — creates a prescription and **does not**
  touch inventory (per the brief's business rule)
- `dispenseItem(prescriptionId, itemId, "GIVEN" | "UNAVAILABLE")` —
  inventory is only deducted here, with a transaction record created
- `completeDispensing(prescriptionId)` — finalizes the order and pushes a
  patient notification summarizing what was given/unavailable
- Admin CRUD for doctors, rooms, assignments, medicines, OPD start/end,
  and prescription cancellation (soft, with reason preserved)

Seed data lives in `lib/mock-data.ts` — edit it to change the starting
scenario (e.g. add more waiting patients, change stock levels, etc.).

When you're ready to connect a real backend, swap the bodies of the
functions in `lib/store.tsx` for `fetch`/`axios` calls to the Node/Express
API described in the brief — the component layer doesn't need to change
since everything already consumes `useHospital()`.

## Project structure

```
app/
  (auth)/login, register, forgot-password      — shared auth shell
  patient/  dashboard, search, opd/[specId], token, notifications, profile
  doctor/   dashboard, patients (queue), consultation, prescription
  clinic/   dashboard, prescriptions (+ [id] detail/dispense), dispensing, inventory
  admin/    dashboard, doctors, rooms, assignments, opd, inventory,
            prescriptions, reports, settings
components/
  layout/    AppShell, Sidebar, MobileSidebar, MobileNav, Header
  token/     TokenBoard (signature split-flap display), MiniTokenChip
  badges/    StatusBadge (single source of truth for every status color)
  tables/    DataTable (search + filter chips + pagination)
  cards/     Panel, StatCard
  modals/    Modal, ConfirmDialog (used for every destructive action)
  forms/     TextField, TextAreaField, SelectField (validation + errors)
  common/    Toast, EmptyState, ErrorState, Skeletons
  inventory/ InventoryView (shared by /clinic/inventory and /admin/inventory)
  charts/    DashboardCharts (recharts, admin dashboard)
lib/
  types.ts     shared TypeScript types
  mock-data.ts seed data
  store.tsx    the mock "backend" (React context)
  nav.ts       per-role sidebar/nav configuration
```

## Notes on the flows

- **No separate doctor login**, per the brief — `app/doctor/layout.tsx`
  simulates "access granted through room assignment" by hard-coding the
  currently assigned doctor (`CURRENT_DOCTOR_ID`).
- **One token per patient per day** is enforced by always showing the
  patient's most recent token; booking again is only reachable from the
  search flow.
- **Prescription → Clinic → Inventory** strictly follows the brief:
  prescribing never touches stock; only a clinic "Give" action deducts
  stock and writes an inventory transaction; "Unavailable" leaves stock
  untouched and is reflected in the patient notification.
- All destructive actions (deactivate doctor/room/medicine, cancel a
  prescription, close the day, end OPD) go through `ConfirmDialog`.
- Tables support search, filter chips, and pagination; forms show inline
  validation errors, loading submit buttons and success/error toasts.
