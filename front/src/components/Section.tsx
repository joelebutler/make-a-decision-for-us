import type { ComponentProps } from "react";

type SectionProps = ComponentProps<"section"> & {
  variant?: "clear" | "default" | "subtle";
};

export function Section({
  className,
  variant = "clear",
  ...props
}: SectionProps) {
  const variantClasses = {
    clear: "",
    default: "bg-surface",
    subtle: "bg-surface/50",
  };
  return (
    <section
      className={`section py-20 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
