// ─── Central API client ────────────────────────────────────────────────────
// All backend calls go through here. Attaches JWT, normalises errors.

const BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:3001";

function getToken(): string | null {
  return localStorage.getItem("dental_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    // Token expired — wipe auth and redirect
    localStorage.removeItem("dental_token");
    localStorage.removeItem("dental_user");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

// ─── Helpers ──────────────────────────────────────────────────────────────
export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),

  // Multipart upload (for xrays — no JSON header)
  upload: async <T>(path: string, formData: FormData): Promise<T> => {
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${BASE}${path}`, { method: "POST", headers, body: formData });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `HTTP ${res.status}`);
    }
    return res.json();
  },
};

// ─── Types matching backend responses ─────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: "patient" | "doctor" | "admin";
  avatarUrl?: string | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface MeResponse {
  user: AuthUser;
  profile: PatientProfile | DoctorProfile | null;
}

export interface PatientProfile {
  id: string;
  userId: string;
  dateOfBirth: string | null;
  allergies: string | null;
  medicalNotes: string | null;
  loyaltyPoints: number;
  balance: string;
  isVip: boolean;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  specialty: string;
  bio: string | null;
  experience: number;
  rating: string;
  color: string;
  schedule: string[];
}

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  description: string | null;
  duration: number;
  price: string;
  icon: string;
  isActive: boolean;
}

export interface DoctorItem {
  doctor: DoctorProfile;
  user: { id: string; email: string; fullName: string; phone: string | null; avatarUrl: string | null };
}

export interface SlotItem {
  time: string;
  available: boolean;
}

export interface SlotsResponse {
  date: string;
  doctorId: string;
  slots: SlotItem[];
}

export interface AppointmentItem {
  appointment: {
    id: string;
    patientId: string;
    doctorId: string;
    serviceId: string;
    date: string;
    time: string;
    duration: number;
    status: string;
    room: string | null;
    notes: string | null;
    price: string | null;
    paid: boolean;
  };
  service: { id: string; name: string; icon: string; category: string };
  patient: { id: string; isVip?: boolean };
  patientUser: { fullName: string; phone: string | null; avatarUrl: string | null };
  doctor: { id: string; specialty?: string; color?: string };
  doctorUser: { fullName: string };
}

export interface PatientItem {
  patient: PatientProfile & { allergies: string | null; medicalNotes: string | null; isVip: boolean; loyaltyPoints: number; balance: string };
  user: { id: string; email: string; fullName: string; phone: string | null; avatarUrl: string | null; createdAt?: string };
}

export interface ToothItem {
  id: string;
  patientId: string;
  toothNumber: number;
  status: string;
  notes: string | null;
  treatedAt: string | null;
}

export interface XRayItem {
  xray: {
    id: string;
    patientId: string;
    type: string;
    fileUrl: string;
    fileName: string;
    notes: string | null;
    takenAt: string;
  };
  doctor: { fullName: string };
}

export interface AdminStats {
  todayAppointments: number;
  totalPatients: number;
  monthAppointments: number;
  weekRevenue: number;
  pendingInvoices: number;
}
