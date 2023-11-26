import { zodResolver } from "@hookform/resolvers/zod";
import React, { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useHistory } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { FormError } from "../../../components/ui/FormError";
import { Input } from "../../../components/ui/Input";
import { getApiErrorMessage } from "../../../errors/api-error";
import { PATHS } from "../../../router/paths";
import { useRegister } from "../queries/auth-hooks";
import { RegisterFormValues, registerSchema } from "../validation/auth-schemas";

export const RegisterPage: FC = () => {
  const history = useHistory();
  const registerMutation = useRegister();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setFormError(null);

    try {
      await registerMutation.mutateAsync(values);
      history.replace(PATHS.dashboard);
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow">Create account</p>
        <h1>Register</h1>
        <FormError message={formError} />
        <form className="form" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Name" autoComplete="name" error={errors.name?.message} {...register("name")} />
          <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Button disabled={isSubmitting || registerMutation.isLoading} type="submit">
            {registerMutation.isLoading ? "Creating..." : "Create account"}
          </Button>
        </form>
        <p className="auth-switch">
          Already registered? <Link to={PATHS.login}>Sign in</Link>
        </p>
      </section>
    </main>
  );
};
