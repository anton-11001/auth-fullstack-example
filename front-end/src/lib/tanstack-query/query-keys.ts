export const queryKeys = {
  auth: {
    session: ["auth", "session"] as const,
  },
  users: {
    current: (id: string) => ["users", id] as const,
  },
};
