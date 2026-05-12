import { HTMLAttributes } from "react";

export function Card({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-lg bg-white p-6 shadow ${className}`} {...rest} />;
}

export function CardHeader({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`mb-4 ${className}`} {...rest} />;
}

export function CardTitle({ className = "", ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`text-lg font-semibold ${className}`} {...rest} />;
}

export function CardBody({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...rest} />;
}
