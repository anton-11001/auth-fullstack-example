import { ENDPOINTS } from "../../../api/endpoints";
import api from "../../../lib/axios/instance";
import { AuthResponse, RegisterPayload } from "./types";

export const registerUser = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(ENDPOINTS.auth.register, payload);
  return response.data;
};
