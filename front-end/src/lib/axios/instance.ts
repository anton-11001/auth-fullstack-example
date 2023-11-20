import axios from "axios";
import { ENDPOINTS } from "../../api/endpoints";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "../../utils/token-storage";
import { RefreshResponse } from "../../features/auth/api/types";

const API_URL = process.env.REACT_APP_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (config) => {
    return config;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response.status == 401 &&
      error.config &&
      !error.config._isRetry
    ) {
      originalRequest._isRetry = true;

      try {
        const response = await axios.get<RefreshResponse>(
          `${API_URL}${ENDPOINTS.auth.refresh}`,
          {
            withCredentials: true,
          },
        );

        setAccessToken(response.data.accessToken);

        return api.request(originalRequest);
      } catch (e) {
        console.error("Token refresh failed", e);
        clearAccessToken();
      }
    }
    throw error;
  },
);

export default api;
