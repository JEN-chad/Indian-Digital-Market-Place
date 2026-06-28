import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  phone?: string | null;
  phoneVerified: boolean;
  name?: string | null;
  avatarUrl?: string | null;
  role: "buyer" | "seller" | "both" | "admin";
  kycStatus: "not_started" | "pending" | "in_review" | "approved" | "rejected";
  kycType?: "individual" | "company" | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  setIsLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    try {
      const saved = localStorage.getItem("fmi_auth_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })(),
  isLoading: false,
  setUser: (user) => {
    if (user) {
      localStorage.setItem("fmi_auth_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("fmi_auth_user");
    }
    set({ user });
  },
  clearUser: () => {
    localStorage.removeItem("fmi_auth_user");
    set({ user: null });
  },
  setIsLoading: (isLoading) => set({ isLoading }),
}));
