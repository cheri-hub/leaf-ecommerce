"use client";

import { create } from "zustand";
import { api } from "@/lib/api";
import type { User, AuthResponse } from "@/types";

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    taxId?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user, isLoading: false }),

  login: async (email, password) => {
    const res = await api<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    set({ user: res.user, isLoading: false });
  },

  register: async (data) => {
    const res = await api<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    set({ user: res.user, isLoading: false });
  },

  logout: async () => {
    await api("/api/auth/logout", { method: "POST" });
    set({ user: null, isLoading: false });
  },

  fetchUser: async () => {
    try {
      const user = await api<User>("/api/auth/me");
      set({ user, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },
}));
