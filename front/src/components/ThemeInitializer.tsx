import { useEffect } from "react";
import { applyTheme, type Theme } from "@front/components/types";

function ThemeInitializer() {
  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    applyTheme(stored || "default");
    // Listen for theme changes in other tabs/windows
    const onStorage = (e: StorageEvent) => {
      if (e.key === "theme" && e.newValue) {
        applyTheme(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return null;
}

export default ThemeInitializer;
