export const ENDPOINTS = {
  auth: {
    register: "/register",
    login: "/login",
    logout: "/logout",
    refresh: "/refresh",
  },
  users: {
    byId: (id: string) => `/users/${id}`,
  },
};
