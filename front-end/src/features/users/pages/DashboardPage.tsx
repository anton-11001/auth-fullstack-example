import React, { FC } from "react";
import { Button } from "../../../components/ui/Button";
import { useAuth } from "../../../contexts/AuthContext";
import { useLogout } from "../../auth/queries/auth-hooks";
import { useCurrentUserQuery } from "../queries/user-hooks";

export const DashboardPage: FC = () => {
  const { user, clearSession } = useAuth();
  const logoutMutation = useLogout();
  const currentUserQuery = useCurrentUserQuery(user?.id);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      clearSession("Your session has ended. Please sign in again.");
    }
  };

  return (
    <main className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Account</h1>
        </div>
        <Button disabled={logoutMutation.isLoading} onClick={handleLogout} type="button" variant="secondary">
          {logoutMutation.isLoading ? "Signing out..." : "Sign out"}
        </Button>
      </header>

      <section className="dashboard-grid">
        <article className="account-card">
          <h2>Session</h2>
          <dl>
            <div>
              <dt>Name</dt>
              <dd>{user?.name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user?.email}</dd>
            </div>
            <div>
              <dt>Email status</dt>
              <dd>{user?.isEmailVerified ? "Verified" : "Pending verification"}</dd>
            </div>
          </dl>
        </article>

        <article className="account-card">
          <h2>Protected user lookup</h2>
          {currentUserQuery.isLoading ? <p className="muted">Loading protected profile...</p> : null}
          {currentUserQuery.isError ? (
            <div className="stack">
              <p className="form-error">Could not load protected profile.</p>
              <Button onClick={() => currentUserQuery.refetch()} type="button" variant="secondary">
                Retry
              </Button>
            </div>
          ) : null}
          {currentUserQuery.data ? (
            <dl>
              <div>
                <dt>User id</dt>
                <dd>{currentUserQuery.data.id}</dd>
              </div>
              <div>
                <dt>Name</dt>
                <dd>{currentUserQuery.data.name}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{currentUserQuery.data.email}</dd>
              </div>
            </dl>
          ) : null}
        </article>
      </section>
    </main>
  );
};
