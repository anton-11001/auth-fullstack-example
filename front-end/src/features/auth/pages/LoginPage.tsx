import { zodResolver } from "@hookform/resolvers/zod";
import React, { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useHistory, useLocation } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { FormError } from "../../../components/ui/FormError";
import { Input } from "../../../components/ui/Input";
import { useAuth } from "../../../contexts/AuthContext";
import { getApiErrorMessage } from "../../../errors/api-error";
import { PATHS } from "../../../router/paths";
import { useLogin } from "../queries/auth-hooks";
import { LoginFormValues, loginSchema } from "../validation/auth-schemas";

interface LocationState {
  from?: {
    pathname?: string;
  };
}

export const LoginPage: FC = () => {
  const history = useHistory();
  const location = useLocation<LocationState>();
  const { sessionMessage } = useAuth();
  const loginMutation = useLogin();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (sessionMessage) {
      setFormError(sessionMessage);
    }
  }, [sessionMessage]);

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);

    try {
      await loginMutation.mutateAsync(values);
      history.replace(location.state?.from?.pathname || PATHS.dashboard);
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow">Welcome back</p>
        <h1>Sign in</h1>
        <FormError message={formError} />
        <form className="form" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Button disabled={isSubmitting || loginMutation.isLoading} type="submit">
            {loginMutation.isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <p className="auth-switch">
          Need an account? <Link to={PATHS.register}>Create one</Link>
        </p>
      </section>
    </main>
  );
};
