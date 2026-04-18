import { create } from "zustand";
import { api } from "@shared/routes";

interface AdminAuthStore {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAdminAuth = create<AdminAuthStore>((set) => ({
  isAuthenticated: false,
  isLoading: true,

  login: async (username: string, password: string) => {
    try {
      const res = await fetch(api.admin.login.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      
      if (res.ok) {
        set({ isAuthenticated: true });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  logout: async () => {
    try {
      await fetch(api.admin.logout.path, { method: "POST" });
      set({ isAuthenticated: false });
    } catch {
      set({ isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    try {
      const res = await fetch(api.admin.checkAuth.path);
      if (res.ok) {
        const data = await res.json();
        set({ isAuthenticated: data.authenticated, isLoading: false });
      } else {
        set({ isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ isAuthenticated: false, isLoading: false });
    }
  },
}));
