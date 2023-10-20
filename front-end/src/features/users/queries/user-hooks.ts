import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../lib/tanstack-query/query-keys";
import { getUserById } from "../api/users-api";

export const useCurrentUserQuery = (id?: string) => {
  return useQuery(
    queryKeys.users.current(id || ""),
    () => getUserById(id || ""),
    {
      enabled: Boolean(id),
    },
  );
};
