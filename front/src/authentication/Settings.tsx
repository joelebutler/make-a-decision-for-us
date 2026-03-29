import { useState, useEffect } from "react";
import { useUser } from "@front/components/UserContext";
import { APIEndpoints } from "@shared/shared-types";
import { Section } from "@front/components/Section";
import { Card } from "@front/components/Card";
import Select from "@front/components/Select";
import { Themes, type Theme, applyTheme } from "@front/components/types";

function Settings() {
  const { user, setUser } = useUser();
  const [theme, setTheme] = useState<Theme>(() => {
    if (user && user.theme) return user.theme as Theme;
    const stored = localStorage.getItem("theme");
    return (stored as Theme) || "default";
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    applyTheme(theme);
    // Save to backend if user is logged in
    if (user && user.username && user.theme !== theme) {
      setSaving(true);
      fetch(APIEndpoints.CHANGE_THEME, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username, theme }),
      })
        .then((res) => {
          if (res.ok) setUser({ ...user, theme });
        })
        .finally(() => setSaving(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            {saving && (
              <div className="text-xs text-gray-500 mt-2">Saving...</div>
            )}
          </div>
        </Card>
      </div>
    </Section>
  );
}

export default Settings;
