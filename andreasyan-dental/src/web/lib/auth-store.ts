import { create } from "zustand";
import { api, AuthUser, MeResponse } from "./api";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  patientId: string | null;
  doctorId: string | null;
  loading: boolean;
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  patientId: null,
  doctorId: null,
  loading: false,

  loadFromStorage: () => {
    const token = localStorage.getItem("dental_token");
    const raw = localStorage.getItem("dental_user");
    const patientId = localStorage.getItem("dental_patientId");
    const doctorId = localStorage.getItem("dental_doctorId");
    if (token && raw) {
      try {
        const user = JSON.parse(raw) as AuthUser;
        set({ token, user, patientId, doctorId });
      } catch {
        // corrupt storage — wipe it
        localStorage.removeItem("dental_token");
        localStorage.removeItem("dental_user");
      }
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await api.post<{
        token: string;
        user: AuthUser;
        patientId?: string;
        doctorId?: string;
      }>("/api/auth/login", { email, password });

      localStorage.setItem("dental_token", res.token);
      localStorage.setItem("dental_user", JSON.stringify(res.user));
      if (res.patientId) localStorage.setItem("dental_patientId", res.patientId);
      if (res.doctorId) localStorage.setItem("dental_doctorId", res.doctorId);

      set({
        token: res.token,
        user: res.user,
        patientId: res.patientId ?? null,
        doctorId: res.doctorId ?? null,
        loading: false,
      });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  register: async (email, password, fullName, phone) => {
    set({ loading: true });
    try {
      const res = await api.post<{
        token: string;
        user: AuthUser;
        patientId?: string;
      }>("/api/auth/register", { email, password, fullName, phone, role: "patient" });

      localStorage.setItem("dental_token", res.token);
      localStorage.setItem("dental_user", JSON.stringify(res.user));
      if (res.patientId) localStorage.setItem("dental_patientId", res.patientId);

      set({
        token: res.token,
        user: res.user,
        patientId: res.patientId ?? null,
        loading: false,
      });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem("dental_token");
    localStorage.removeItem("dental_user");
    localStorage.removeItem("dental_patientId");
    localStorage.removeItem("dental_doctorId");
    set({ user: null, token: null, patientId: null, doctorId: null });
  },

  fetchMe: async () => {
    try {
      const res = await api.get<MeResponse>("/api/auth/me");
      // Refresh patientId / doctorId from profile if missing
      const patientId =
        res.user.role === "patient" && res.profile
          ? (res.profile as any).id
          : get().patientId;
      const doctorId =
        res.user.role === "doctor" && res.profile
          ? (res.profile as any).id
          : get().doctorId;
      if (patientId) localStorage.setItem("dental_patientId", patientId);
      if (doctorId) localStorage.setItem("dental_doctorId", doctorId);
      set({ user: res.user, patientId: patientId ?? null, doctorId: doctorId ?? null });
    } catch {
      // token invalid — don't crash, just wipe
      get().logout();
    }
  },
}));

// ─── Demo account credentials (must match what's seeded in DB) ────────────
export const DEMO_CREDENTIALS = {
  patient: { email: "anna@email.com", password: "Demo1234!" },
  doctor:  { email: "armen@andreasyan.dental", password: "Demo1234!" },
  admin:   { email: "admin@andreasyan.dental", password: "Demo1234!" },
};
