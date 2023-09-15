import React, { FC, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label: string;
}

export const Input: FC<InputProps> = ({ error, label, id, ...props }) => {
  const inputId = id || props.name;

  return (
    <label className="field" htmlFor={inputId}>
      <span className="field__label">{label}</span>
      <input className={`input ${error ? "input--error" : ""}`} id={inputId} {...props} />
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
};
