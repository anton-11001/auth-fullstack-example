import React, { FC } from "react";

interface FormErrorProps {
  message?: string | null;
}

export const FormError: FC<FormErrorProps> = ({ message }) => {
  if (!message) {
    return null;
  }

  return <div className="form-error">{message}</div>;
};
