import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login as loginApi, type LoginRequest, type LoginResponse } from "../api/auth";

interface AuthState {
  accessToken: string | null;
  user: LoginResponse["user"] | null;
  isAuthenticated: boolean;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      login: async (request) => {
        const result = await loginApi(request);
        set({
          accessToken: result.accessToken,
          user: result.user ?? null,
          isAuthenticated: true,
        });
      },
      logout: () => set({ accessToken: null, user: null, isAuthenticated: false }),
    }),
    {
      name: "amss-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
