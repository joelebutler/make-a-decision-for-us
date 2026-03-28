import { useEffect, useState } from "react";
import { Themes, type Theme } from "@front/components/types";
import { Button } from "@front/components/Button";

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>(
    (localStorage.getItem("theme") as Theme) || "default",
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const cycleTheme = () => {
    const currentIndex = Themes.indexOf(theme);
    const nextIndex: number = (currentIndex + 1) % Themes.length;
    if (Themes[nextIndex]) setTheme(Themes[nextIndex]);
  };

  return <Button onClick={cycleTheme}>Theme</Button>;
}
