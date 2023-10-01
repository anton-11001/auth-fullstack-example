import React, { FC, ReactNode } from "react";
import { Redirect, Route, RouteProps } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { PATHS } from "../paths";

interface ProtectedRouteProps extends RouteProps {
  children: ReactNode;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({ children, ...props }) => {
  const { isAuth, isInitializing } = useAuth();

  return (
    <Route
      {...props}
      render={({ location }) => {
        if (isInitializing) {
          return <main className="page-shell">Loading session...</main>;
        }

        if (!isAuth) {
          return <Redirect to={{ pathname: PATHS.login, state: { from: location } }} />;
        }

        return children;
      }}
    />
  );
};
