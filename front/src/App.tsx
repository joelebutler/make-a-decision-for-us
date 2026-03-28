import { sharedString } from "@shared/shared";
import { useEffect, useState } from "react";
import { Button } from "@ariakit/react";

type Theme = "default" | "dark" | "sunset";

function App() {
  const [theme, setTheme] = useState<Theme>(
    (localStorage.getItem("theme") as Theme) || "default",
  );
  useEffect(() => {
    console.log(theme);
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  return (
    <>
      {/* <Button onClick={() => setTheme("default")}>Default theme</Button>
      <Button onClick={() => setTheme("dark")}>Dark theme</Button>
      <Button onClick={() => setTheme("sunset")}>Sunset theme</Button> */}
      <h1>I am a frontend!</h1>
      <p>I share with my backend. {sharedString}</p>
    </>
  );
}

export default App;
