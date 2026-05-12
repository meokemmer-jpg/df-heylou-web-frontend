"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_STYLES: Record<Variant, string> = {
  primary: "bg-heylou-primary text-white hover:bg-blue-800 disabled:opacity-50",
  secondary: "bg-heylou-accent text-neutral-900 hover:bg-yellow-400 disabled:opacity-50",
  ghost: "bg-transparent text-heylou-primary hover:bg-blue-50",
  danger: "bg-heylou-error text-white hover:bg-red-700",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", className = "", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`rounded-md px-4 py-2 font-medium transition ${VARIANT_STYLES[variant]} ${className}`}
      {...rest}
    />
  );
});
