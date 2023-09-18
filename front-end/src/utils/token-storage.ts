import { ACCESS_TOKEN_STORAGE_KEY } from "../constants";

export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
};

export const setAccessToken = (token: string): void => {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
};

export const clearAccessToken = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
};
