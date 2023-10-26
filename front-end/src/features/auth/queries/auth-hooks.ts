import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../contexts/AuthContext";
import { queryKeys } from "../../../lib/tanstack-query/query-keys";
import { clearAccessToken } from "../../../utils/token-storage";
import { loginUser, logoutUser, registerUser } from "../api/auth-api";
import { LoginPayload, RegisterPayload } from "../api/types";

export const useLogin = () => {
  const { setSession } = useAuth();

  return useMutation((payload: LoginPayload) => loginUser(payload), {
    onSuccess: (response) => {
      setSession(response.accessToken, response.user);
    },
  });
};

export const useRegister = () => {
  const { setSession } = useAuth();

  return useMutation((payload: RegisterPayload) => registerUser(payload), {
    onSuccess: (response) => {
      setSession(response.accessToken, response.user);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { clearSession } = useAuth();

  return useMutation(logoutUser, {
    onSettled: () => {
      clearAccessToken();
      clearSession();
      queryClient.removeQueries(queryKeys.users.current(""));
      queryClient.invalidateQueries();
    },
  });
};
