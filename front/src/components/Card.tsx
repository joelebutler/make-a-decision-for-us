import type { ComponentProps } from "react";

type CardProps = ComponentProps<"div">;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={`card p-8 border border-brand/20 rounded-lg bg-white/80 dark:bg-surface/80 ${className}`}
      {...props}
    />
  );
}
