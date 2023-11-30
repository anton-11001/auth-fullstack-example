import React, { createContext, FC, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { refreshSession } from "../features/auth/api/auth-api";
import { User } from "../types/user";
import { getUserFromAccessToken } from "../utils/jwt";
import { clearAccessToken, getAccessToken, setAccessToken } from "../utils/token-storage";

interface AuthContextValue {
  user: User | null;
  isAuth: boolean;
  isInitializing: boolean;
  sessionMessage: string | null;
  setSession: (accessToken: string, user?: User) => void;
  clearSession: (message?: string | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  const setSession = useCallback((accessToken: string, nextUser?: User) => {
    setAccessToken(accessToken);
    setUser(nextUser || getUserFromAccessToken(accessToken));
    setSessionMessage(null);
  }, []);

  const clearSession = useCallback((message: string | null = null) => {
    clearAccessToken();
    setUser(null);
    setSessionMessage(message);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      try {
        const storedToken = getAccessToken();

        if (storedToken) {
          const storedUser = getUserFromAccessToken(storedToken);

          if (storedUser) {
            setUser(storedUser);
          }
        }

        const response = await refreshSession();

        if (isMounted) {
          setSession(response.accessToken);
        }
      } catch {
        if (isMounted) {
          clearSession();
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeSession();

    return () => {
      isMounted = false;
    };
  }, [clearSession, setSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuth: Boolean(user),
      isInitializing,
      sessionMessage,
      setSession,
      clearSession,
    }),
    [clearSession, isInitializing, sessionMessage, setSession, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
