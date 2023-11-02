import { ENDPOINTS } from "../../../api/endpoints";
import api from "../../../lib/axios/instance";
import { LogoutResponse } from "./types";

export const logoutUser = async (): Promise<LogoutResponse> => {
  const response = await api.post<LogoutResponse>(ENDPOINTS.auth.logout);
  return response.data;
};
