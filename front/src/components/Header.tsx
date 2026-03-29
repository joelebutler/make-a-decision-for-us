import { type ComponentProps } from "react";
import { useUser } from "@front/components/UserContext";
import { NavLink } from "@front/components/NavLink";
import { NavLink as RouterLink, useNavigate } from "react-router";
import { Button } from "./Button";
import Menu from "./Menu";
import { applyTheme } from "./types";
import logo from "../assets/logo.svg";

type HeaderProps = ComponentProps<"header"> & {
  mode: string;
  noLinks?: boolean;
};

interface navLink {
  href: string;
  label: string;
}

export function Header({ className, noLinks = false, ...props }: HeaderProps) {
  const user = useUser().user;
  const setUser = useUser().setUser;
  const navLinks: navLink[] = [];
  const navigate = useNavigate();
  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${className}`}
      {...props}
    >
      <nav className="w-full flex items-center justify-between h-14 px-6 bg-surface/80 border-b border-brand/10 shadow-sm backdrop-blur-xl gap-5">
        <a
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img
            src={logo}
            alt="kimaru.tech logo"
            className="h-8 w-auto filter drop-shadow-sm"
          />
          <span className="text-xl md:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-hover whitespace-nowrap">
            kimaru.tech
          </span>
        </a>
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
            <div className="flex items-center gap-3 flex-1 justify-end">
              {!user ? (
                <>
                  <RouterLink to="/login" className="hidden sm:block">
                    <Button className="px-5 py-2 text-sm font-bold shadow-sm hover:bg-surface-elevated transition-all duration-300 rounded-xl border-2 border-brand/20 text-text bg-transparent whitespace-nowrap">
                      Login
                    </Button>
                  </RouterLink>
                  <RouterLink to="/register">
                    <Button className="px-5 py-2 text-sm font-bold shadow-md shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-0.5 transition-all duration-300 bg-brand text-surface rounded-xl border-none whitespace-nowrap">
                      Register
                    </Button>
                  </RouterLink>
                </>
              ) : (
                <Menu
                  title={user.username || "User"}
                  items={[
                    {
                      type: "button" as const,
                      label: (
                        <>
                          <svg
                            className="w-4 h-4 mr-2.5 opacity-70"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                            />
                          </svg>
                          Dashboard
                        </>
                      ),
                      onClick: () => navigate("/dashboard"),
                    },
                    {
                      type: "separator" as const,
                    },
                    {
                      type: "button" as const,
                      label: (
                        <>
                          <svg
                            className="w-4 h-4 mr-2.5 opacity-70"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Settings
                        </>
                      ),
                      onClick: () => navigate("/settings"),
                    },
                    {
                      type: "separator" as const,
                    },
                    {
                      type: "button" as const,
                      label: (
                        <>
                          <svg
                            className="w-4 h-4 mr-2.5 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          <span className="text-red-600 font-semibold">
                            Logout
                          </span>
                        </>
                      ),
                      onClick: () => {
                        setUser(null);
                        applyTheme("default");
                        navigate("/");
                      },
                      className:
                        "flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl my-0.5 outline-none transition-all duration-200 hover:bg-red-50 focus:bg-red-50 cursor-pointer",
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
