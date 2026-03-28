import type { ComponentProps } from "react";
import { NavLink } from "@front/components/NavLink";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { Button } from "./Button";

type HeaderProps = ComponentProps<"header">;

interface navLink {
  href: string;
  label: string;
}

export function Header({ className, ...props }: HeaderProps) {
  const navLinks: navLink[] = [];
  return (
    <header className={`sticky top-0 z-50 w-full ${className}`} {...props}>
      <nav className="w-full flex items-center justify-between h-14 px-6 bg-surface/70 shadow-md hover:shadow-xl backdrop-blur-md rounded-b-xl">
        <a
          href="/"
          className="text-2xl font-bold text-brand flex-1 hover:text-brand/80"
        >
          DecideFor.Us
        </a>
        <nav
          aria-label="Main navigation"
          className={`w-full h-full hidden md:flex items-center justify-center gap-6 px-6 py-2`}
        >
          {navLinks.map(({ href, label }) => (
            <NavLink key={href} href={href}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2 flex-1 justify-end">
          <ThemeSwitcher />
          <Button>Sign Up</Button>
          <Button>Login</Button>
        </div>
      </nav>
    </header>
  );
}
export default Header;
