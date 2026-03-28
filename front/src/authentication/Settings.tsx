import { useState, useEffect } from "react";
import { Section } from "@front/components/Section";
import { Card } from "@front/components/Card";
import Select from "@front/components/Select";
import { Themes, type Theme, applyTheme } from "@front/components/types";

function Settings() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme");
    return (stored as Theme) || "default";
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <Section>
      <div className="container mx-auto px-4 max-w-lg">
        <Card>
          <h1 className="text-2xl font-bold mb-6 text-center">Settings</h1>
          <div className="mb-8">
            <Select
              label="Theme"
              value={theme.charAt(0).toUpperCase() + theme.slice(1)}
              onChange={(v) => setTheme(v as Theme)}
              items={Themes.map((t) => ({
                value: t,
                label: t.charAt(0).toUpperCase() + t.slice(1),
              }))}
            />
          </div>
          {/* Add more settings here */}
        </Card>
      </div>
    </Section>
  );
}

export default Settings;
