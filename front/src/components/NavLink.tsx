import { Button } from "@ariakit/react/button";
import type { ComponentProps } from "react";

type NavLinkProps = ComponentProps<"a">;

export function NavLink({ className = "", ...props }: NavLinkProps) {
  return (
    <Button
      render={
        <a
          className={`nav-link px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-brand/60 ${className}`}
          {...props}
        />
      }
    />
  );
}
