import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { login as loginApi, type LoginRequest } from "../api/auth";
import { isJwtExpired, userFromJwt, type AuthUser } from "./jwt";

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
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
        if (!result.accessToken || isJwtExpired(result.accessToken)) {
          throw new Error("Authentication token is invalid or expired.");
        }

        set({
          accessToken: result.accessToken,
          user: result.user ?? userFromJwt(result.accessToken),
          isAuthenticated: true,
        });
      },
      logout: () => set({ accessToken: null, user: null, isAuthenticated: false }),
    }),
    {
      name: "amss-auth",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<AuthState>;
        const token = saved.accessToken;
        if (!token || isJwtExpired(token)) {
          return current;
        }

        return {
          ...current,
          ...saved,
          user: saved.user ?? userFromJwt(token),
          isAuthenticated: true,
        };
      },
    },
  ),
);
