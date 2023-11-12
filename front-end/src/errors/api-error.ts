import { AxiosError } from "axios";

interface ApiErrorBody {
  message?: string;
  errors?: unknown[];
}

export const getApiErrorMessage = (error: unknown): string => {
  const axiosError = error as AxiosError<ApiErrorBody>;

  if (axiosError.response?.data?.message) {
    return axiosError.response.data.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};
