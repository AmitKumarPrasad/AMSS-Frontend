import { apiClient } from "./client";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType?: string;
  expiresIn?: number;
  refreshToken?: string;
  user?: {
    id?: string;
    username?: string;
    roles?: string[];
  };
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>(
    "/api/v1/auth/login",
    request,
  );
  return response.data;
}
