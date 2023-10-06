import React, { FC } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { VerifyEmailSuccessPage } from "../features/auth/pages/VerifyEmailSuccessPage";
import { DashboardPage } from "../features/users/pages/DashboardPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";
import { PATHS } from "./paths";

export const AppRoutes: FC = () => {
  return (
    <Switch>
      <Route exact path={PATHS.home}>
        <Redirect to={PATHS.dashboard} />
      </Route>
      <PublicRoute path={PATHS.login}>
        <LoginPage />
      </PublicRoute>
      <PublicRoute path={PATHS.register}>
        <RegisterPage />
      </PublicRoute>
      <Route path={PATHS.verifyEmailSuccess}>
        <VerifyEmailSuccessPage />
      </Route>
      <ProtectedRoute path={PATHS.dashboard}>
        <DashboardPage />
      </ProtectedRoute>
      <Route>
        <Redirect to={PATHS.dashboard} />
      </Route>
    </Switch>
  );
};
