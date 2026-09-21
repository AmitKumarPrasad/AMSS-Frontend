import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

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
  const response = await axios.post<LoginResponse>(
    `${API_BASE_URL}/api/v1/auth/login`,
    request,
    { headers: { "Content-Type": "application/json" } }
  );
  return response.data;
}
