import React, { FC } from "react";
import { Link } from "react-router-dom";
import { PATHS } from "../../../router/paths";

export const VerifyEmailSuccessPage: FC = () => {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow">Email verified</p>
        <h1>You're all set</h1>
        <p className="muted">Your email address has been confirmed. You can continue to your dashboard.</p>
        <Link className="button button--primary link-button" to={PATHS.dashboard}>
          Go to dashboard
        </Link>
      </section>
    </main>
  );
};
