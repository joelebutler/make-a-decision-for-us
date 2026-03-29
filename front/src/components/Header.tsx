import { useState, type ComponentProps } from "react";
import { useUser } from "@front/components/UserContext";
import { NavLink } from "@front/components/NavLink";
import { NavLink as RouterLink, useNavigate } from "react-router";
import { Button } from "./Button";
import Menu from "./Menu";
import { applyTheme, type Theme } from "./types";

type HeaderProps = ComponentProps<"header"> & {
  mode: string;
  noLinks?: boolean;
};

interface navLink {
  href: string;
  label: string;
}

export function Header({
  className,
  mode,
  noLinks = false,
  ...props
}: HeaderProps) {
  const user = useUser().user;
  const setUser = useUser().setUser;
  const navLinks: navLink[] = [];
  const navigate = useNavigate();
  return (
    <header className={`sticky top-0 z-50 w-full ${className}`} {...props}>
      <nav className="w-full flex items-center justify-between h-14 px-6 bg-surface/70 shadow-md backdrop-blur-md gap-5">
        <a
          href="/"
          className="text-2xl font-bold text-brand hover:text-brand/80"
        >
          DecisionsFor.Us
        </a>
        {mode === "authenticated" && (
          <NavLink href={"/dashboard"}>Dashboard</NavLink>
        )}
        {!noLinks && (
          <>
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
              {mode === "homepage" && (
                <>
                  <RouterLink to="/login">
                    <Button className="px-2 py-1">Login</Button>
                  </RouterLink>
                  <RouterLink to="/register">
                    <Button className="px-2 py-1">Register</Button>
                  </RouterLink>
                </>
              )}
              {mode === "authenticated" && (
                <Menu
                  title={user?.username || "User"}
                  items={[
                    {
                      type: "button",
                      label: "Settings",
                      onClick: () => navigate("/settings"),
                      className:
                        "block w-full px-4 py-2 text-left text-text hover:bg-brand/5 focus:bg-brand/10 focus:outline-none font-medium",
                    },
                    {
                      type: "separator",
                    },
                    {
                      type: "button",
                      label: "Logout",
                      onClick: () => {
                        setUser(null);
                        applyTheme("default");
                        navigate("/");
                      },
                      className:
                        "block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 focus:bg-red-100 focus:outline-none font-medium",
                    },
                  ]}
                />
              )}
            </div>
          </>
        )}
      </nav>
    </header>
  );
}
export default Header;
