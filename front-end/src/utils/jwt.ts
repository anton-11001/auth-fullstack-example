import { User } from "../types/user";

interface JwtPayload extends User {
  exp?: number;
  iat?: number;
}

export const getUserFromAccessToken = (token: string): User | null => {
  try {
    const [, payload] = token.split(".");

    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const parsedPayload = JSON.parse(window.atob(normalizedPayload)) as JwtPayload;

    if (!parsedPayload.id || !parsedPayload.email || !parsedPayload.name) {
      return null;
    }

    return {
      id: parsedPayload.id,
      email: parsedPayload.email,
      name: parsedPayload.name,
      isEmailVerified: parsedPayload.isEmailVerified,
    };
  } catch {
    return null;
  }
};
