import type { QueryClient } from "@tanstack/react-query";
import type { NavigateFunction } from "react-router-dom";
export function signOut(queryClient: QueryClient, logout: () => void, navigate: NavigateFunction) {
  logout();
  void queryClient.cancelQueries();
  queryClient.clear();
  navigate("/login", { replace: true });
}
