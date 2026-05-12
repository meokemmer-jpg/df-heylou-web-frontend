"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className = "", id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name ?? "input";
  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={!!error}
        className={`mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 ${error ? "border-red-500" : ""} ${className}`}
        {...rest}
      />
      {error && <p role="alert" className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});
