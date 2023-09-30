import React, { FC, ReactNode } from "react";
import { Redirect, Route, RouteProps } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { PATHS } from "../paths";

interface PublicRouteProps extends RouteProps {
  children: ReactNode;
}

export const PublicRoute: FC<PublicRouteProps> = ({ children, ...props }) => {
  const { isAuth, isInitializing } = useAuth();

  return (
    <Route
      {...props}
      render={() => {
        if (isInitializing) {
          return <main className="page-shell">Loading session...</main>;
        }

        if (isAuth) {
          return <Redirect to={PATHS.dashboard} />;
        }

        return children;
      }}
    />
  );
};
