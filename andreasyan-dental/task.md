# Integration Plan — Frontend ↔ Backend

## API base URL
All calls go to: `import.meta.env.VITE_API_URL` (default: http://localhost:3001)

## What to build

### 1. `src/web/lib/api.ts`
Central API client — typed fetch wrapper, attaches JWT from localStorage,
handles errors uniformly. No axios needed.

### 2. `src/web/lib/auth-store.ts`
Tiny Zustand-like store (pure React context) for:
- current user (id, email, fullName, role, patientId, doctorId)
- JWT token (stored in localStorage)
- login / logout / register actions

### 3. Auth page → real API
- POST /api/auth/login → store token + user → redirect by role
- POST /api/auth/register
- Demo buttons → login with real demo credentials

### 4. Booking page → real API
- GET /api/services → replace SERVICES mock
- GET /api/doctors → replace DOCTORS mock
- GET /api/doctors/:id/slots?date=YYYY-MM-DD → replace BOOKED_SLOTS mock
- DATES: generate from today (not hardcoded 2026-03-25)
- POST /api/appointments → on confirm

### 5. Patient portal → real API
- GET /api/auth/me → patient profile
- GET /api/patients/:id/appointments → appointments list
- GET /api/patients/:id/tooth-chart → tooth chart data
- GET /api/patients/:id/xrays → xrays list
- PUT /api/patients/:patientId/tooth-chart/:toothNumber → save tooth change

### 6. Doctor workspace → real API
- GET /api/auth/me → doctor profile
- GET /api/doctors/:id/appointments?date=today → today's schedule
- GET /api/patients → patient list
- GET /api/patients/:id/tooth-chart → selected patient chart
- PATCH /api/appointments/:id/status → update status
- GET /api/patients/:id/xrays → xray list
- POST /api/xrays/upload → upload xray

### 7. Admin panel → real API
- GET /api/admin/stats → KPIs
- GET /api/admin/schedule → schedule grid (all doctors, date range)
- GET /api/patients → patient CRM table
- PATCH /api/appointments/:id/status
- PATCH /api/admin/invoices/:id/pay

### 8. Landing page
- GET /api/services → services section (keep testimonials/doctors as static — they're marketing content, not DB-critical)
- GET /api/doctors → doctors section

### 9. Delete mock-data.ts imports from all pages
- Keep TESTIMONIALS static (marketing copy, no backend needed)
- Keep TOOTH_POSITIONS, STATUS_FILL, STATUS_STROKE, STATUS_COLORS (pure UI constants)
- Keep TIME_SLOTS as fallback if API fails
- Delete: DOCTORS, SERVICES, PATIENTS, APPOINTMENTS, XRAYS, STATS, BOOKED_SLOTS, TOOTH_CHART_INITIAL

## Auth flow
- Token stored in localStorage key: `dental_token`
- User stored in localStorage key: `dental_user`
- Every API call sends: `Authorization: Bearer <token>`
- If 401 → clear store → redirect to /login

## Shape mapping (API → UI)
The API returns nested objects. Map them cleanly in api.ts:
- appointments: { appointment, service, patient, patientUser, doctor, doctorUser }
- doctors: { doctor, user }
- patients: { patient, user }

## .env.local addition
VITE_API_URL=http://localhost:3001
