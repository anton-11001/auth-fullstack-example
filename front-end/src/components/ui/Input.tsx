import React, { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ error, label, id, ...props }, ref) => {
  const inputId = id || props.name;

  return (
    <label className="field" htmlFor={inputId}>
      <span className="field__label">{label}</span>
      <input ref={ref} className={`input ${error ? "input--error" : ""}`} id={inputId} {...props} />
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
});

Input.displayName = "Input";
