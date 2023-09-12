import React, { ButtonHTMLAttributes, FC } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export const Button: FC<ButtonProps> = ({ className = "", variant = "primary", ...props }) => {
  return <button className={`button button--${variant} ${className}`.trim()} {...props} />;
};
