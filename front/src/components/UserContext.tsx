import React, { createContext, useContext, useState, useEffect } from "react";
import { type User } from "@shared/shared-types";

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setTokenState] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });

  // Persist user to localStorage on change

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // Wrap setUser to update state

  const setUser = (u: User | null) => {
    setUserState(u);
  };
  const setToken = (t: string | null) => {
    setTokenState(t);
  };

  // Refresh user from backend
  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/get-user", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUserState(updatedUser);
      }
    } catch (err) {
      // Optionally handle error
      console.log(err);
    }
  };

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
