import { ENDPOINTS } from "../../../api/endpoints";
import api from "../../../lib/axios/instance";
import { RefreshResponse } from "./types";

export const refreshSession = async (): Promise<RefreshResponse> => {
  const response = await api.get<RefreshResponse>(ENDPOINTS.auth.refresh);
  return response.data;
};
