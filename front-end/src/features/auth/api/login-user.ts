import { ENDPOINTS } from "../../../api/endpoints";
import api from "../../../lib/axios/instance";
import { AuthResponse, LoginPayload } from "./types";

export const loginUser = async (payload: LoginPayload): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(ENDPOINTS.auth.login, payload);
  return response.data;
};
