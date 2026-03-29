import React, { createContext, useContext, useState, useEffect } from "react";
import { type User } from "@shared/shared-types";

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  refreshUser: () => Promise<void>;
};

// Use a module-level ref so it persists across all renders and all UserProvider instances
const lastRefreshRef = { current: 0 };
const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  console.log("[UserProvider] Rendered");
  const [user, setUserState] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setTokenState] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });

  // Persist user to localStorage on change

  useEffect(() => {
    console.log("[UserProvider] useEffect user changed:", user);
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  useEffect(() => {
    console.log("[UserProvider] useEffect token changed:", token);
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // Wrap setUser to update state

  const setUser = (u: User | null) => {
    console.log("[UserProvider] setUser called:", u);
    setUserState(u);
  };
  const setToken = (t: string | null) => {
    console.log("[UserProvider] setToken called:", t);
    setTokenState(t);
  };

  // Refresh user from backend
  const refreshUser = async () => {
    const now = Date.now();
    if (now - lastRefreshRef.current < 30000) {
      console.log(
        `[refreshUser] Skipped: Only ${((now - lastRefreshRef.current) / 1000).toFixed(1)}s since last refresh.`,
      );
      return;
    }
    lastRefreshRef.current = now;
    console.trace("[refreshUser] called");
    if (!token) {
      console.log("[refreshUser] No token, skipping refresh.");
      return;
    }
    try {
      console.log("[refreshUser] Fetching user with token", token);
      const res = await fetch("/api/get-user", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updatedUser = await res.json();
        console.log("[refreshUser] Got user:", updatedUser);
        setUserState(updatedUser);
      } else {
        const text = await res.text();
        console.log(
          `[refreshUser] Failed to refresh user: ${res.status} ${text}`,
        );
      }
    } catch (err) {
      console.log("[refreshUser] Error:", err);
    }
  };
  // ...existing code...

  return (
    <UserContext.Provider
      value={{ user, setUser, token, setToken, refreshUser }}
    >
      {children}
    </UserContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
}
