import { create } from "zustand";
import { api, AuthUser, MeResponse } from "./api";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  patientId: string | null;
  doctorId: string | null;
  loading: boolean;
  meLoaded: boolean; // tracks whether fetchMe has been attempted — prevents infinite loops
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
  meLoaded: false,

  loadFromStorage: () => {
    const token = localStorage.getItem("dental_token");
    const raw = localStorage.getItem("dental_user");
    const patientId = localStorage.getItem("dental_patientId") || null;
    const doctorId = localStorage.getItem("dental_doctorId") || null;
    if (token && raw) {
      try {
        const user = JSON.parse(raw) as AuthUser;
        set({ token, user, patientId, doctorId });
      } catch {
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
        patientId?: string | null;
        doctorId?: string | null;
      }>("/api/auth/login", { email, password });

      localStorage.setItem("dental_token", res.token);
      localStorage.setItem("dental_user", JSON.stringify(res.user));

      // Always persist — even if null, clear the old value
      if (res.patientId) {
        localStorage.setItem("dental_patientId", res.patientId);
      } else {
        localStorage.removeItem("dental_patientId");
      }
      if (res.doctorId) {
        localStorage.setItem("dental_doctorId", res.doctorId);
      } else {
        localStorage.removeItem("dental_doctorId");
      }

      set({
        token: res.token,
        user: res.user,
        patientId: res.patientId ?? null,
        doctorId: res.doctorId ?? null,
        loading: false,
        meLoaded: true, // login gives us everything — no need to fetchMe
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
        patientId?: string | null;
        doctorId?: string | null;
      }>("/api/auth/register", { email, password, fullName, phone, role: "patient" });

      localStorage.setItem("dental_token", res.token);
      localStorage.setItem("dental_user", JSON.stringify(res.user));
      if (res.patientId) {
        localStorage.setItem("dental_patientId", res.patientId);
      } else {
        localStorage.removeItem("dental_patientId");
      }

      set({
        token: res.token,
        user: res.user,
        patientId: res.patientId ?? null,
        doctorId: null,
        loading: false,
        meLoaded: true,
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
    set({ user: null, token: null, patientId: null, doctorId: null, meLoaded: false });
  },

  fetchMe: async () => {
    // Guard: only run once per session to prevent infinite loops
    if (get().meLoaded) return;
    set({ meLoaded: true });

    try {
      const res = await api.get<MeResponse>("/api/auth/me");

      const patientId =
        res.user.role === "patient" && res.profile
          ? (res.profile as any).id
          : get().patientId;

      const doctorId =
        res.user.role === "doctor" && res.profile
          ? (res.profile as any).id
          : get().doctorId;

      if (patientId) localStorage.setItem("dental_patientId", patientId);
      else localStorage.removeItem("dental_patientId");

      if (doctorId) localStorage.setItem("dental_doctorId", doctorId);
      else localStorage.removeItem("dental_doctorId");

      set({ user: res.user, patientId: patientId ?? null, doctorId: doctorId ?? null });
    } catch {
      get().logout();
    }
  },
}));

export const DEMO_CREDENTIALS = {
  patient: { email: "anna@email.com", password: "Demo1234!" },
  doctor:  { email: "armen@andreasyan.dental", password: "Demo1234!" },
  admin:   { email: "admin@andreasyan.dental", password: "Demo1234!" },
};
