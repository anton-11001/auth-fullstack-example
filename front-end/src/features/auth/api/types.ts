import { User } from "../../../types/user";

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
}

export interface LogoutResponse {
  message: string;
}
