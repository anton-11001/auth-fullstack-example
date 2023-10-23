import { ENDPOINTS } from "../../../api/endpoints";
import api from "../../../lib/axios/instance";
import { User } from "../../../types/user";

export const getUserById = async (id: string): Promise<User> => {
  const response = await api.get<User>(ENDPOINTS.users.byId(id));
  return response.data;
};
