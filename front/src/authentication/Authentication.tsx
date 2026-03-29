import { Button } from "@front/components/Button";
import { Card } from "@front/components/Card";
import { Header } from "@front/components/Header";
import { Main, PageLayout } from "@front/components/PageLayout";
import { Section } from "@front/components/Section";

import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useUser } from "@front/components/UserContext";
import { applyTheme } from "@front/components/types";
import { APIEndpoints, type Message } from "@shared/shared-types";

type FormState = {
  username: string;
  email: string;
  password: string;
};

function Authentication() {
  const location = useLocation();
  const initialMode = location.pathname === "/register" ? "register" : "login";
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [form, setForm] = useState<FormState>({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();
  const { user, setUser, setToken } = useUser();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    if (mode === "register") {
      try {
        const res = await fetch(APIEndpoints.REGISTER, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: form.username,
            email: form.email,
            password: form.password,
          }),
        });
        if (res.ok) {
          // After registration, log in to get JWT
          const loginRes = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: form.username,
              password: form.password,
            }),
          });
          if (loginRes.ok) {
            const { user, token } = await loginRes.json();
            setUser(user);
            setToken(token);
            setMessage({
              type: "success",
              text: "Registration and login successful!",
            });
            if (user.theme) applyTheme(user.theme);
            navigate("/dashboard");
          } else {
            setMessage({
              type: "success",
              text: "Registration successful! Please log in.",
            });
            setMode("login");
            setForm({ username: "", email: "", password: "" });
            formRef.current?.reset();
          }
        } else {
          const text = await res.text();
          setMessage({
            type: "error",
            text: text || "Registration failed.",
          });
        }
      } catch (err) {
        console.error("Registration error:", err);
        setMessage({ type: "error", text: "Network error. Please try again." });
      } finally {
        setLoading(false);
      }
    } else {
      // Login logic
      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: form.username,
            password: form.password,
          }),
        });
        if (res.ok) {
          const { user, token } = await res.json();
          if (user && user.username && token) {
            setMessage({ type: "success", text: "Login successful!" });
            setUser(user);
            setToken(token);
            if (user.theme) applyTheme(user.theme);
            navigate("/dashboard");
          } else {
            setMessage({
              type: "error",
              text: "Login failed. Invalid user data.",
            });
          }
        } else {
          const text = await res.text();
          setMessage({ type: "error", text: text || "Login failed." });
        }
      } catch (err) {
        console.error("Login error:", err);
        setMessage({ type: "error", text: "Network error. Please try again." });
      } finally {
        setLoading(false);
      }
    }
  };
  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (user) {
      navigate("/dashboard");
    }
  }, []);
  return (
    <PageLayout>
      <Header mode={"login"} noLinks={true} />
      <Main>
        <Section>
          <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full mx-auto">
              <h1 className="text-3xl font-bold mb-6 text-center">
                {mode === "login"
                  ? "Login to Existing Account"
                  : "Create an Account"}
              </h1>
              <form
                className="flex flex-col gap-4"
                onSubmit={handleSubmit}
                ref={formRef}
                autoComplete="off"
              >
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  className="px-4 py-2 rounded border border-brand/30 bg-surface/60 focus:outline-none focus:ring-2 focus:ring-brand"
                  required
                  value={form.username}
                  onChange={handleChange}
                  disabled={loading}
                />
                {mode === "register" && (
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="px-4 py-2 rounded border border-brand/30 bg-surface/60 focus:outline-none focus:ring-2 focus:ring-brand"
                    required
                    value={form.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                )}
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="px-4 py-2 rounded border border-brand/30 bg-surface/60 focus:outline-none focus:ring-2 focus:ring-brand"
                  required
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                />
                <Button
                  type="submit"
                  className="w-full mt-2 px-2 py-1"
                  disabled={loading}
                >
                  {loading
                    ? mode === "login"
                      ? "Logging in..."
                      : "Registering..."
                    : mode === "login"
                      ? "Continue"
                      : "Register"}
                </Button>
              </form>
              {message &&
                (message.type === "success" ? (
                  <div className="mt-4 text-center text-sm text-green-500">
                    {message.text}
                  </div>
                ) : (
                  <div className="mt-4 text-center text-sm text-red-500">
                    {message.text}
                  </div>
                ))}
              <div className="mt-6 text-center text-sm text-text/70">
                {mode === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      className="text-brand hover:underline"
                      onClick={() => {
                        setMode("register");
                        setMessage(null);
                      }}
                      disabled={loading}
                    >
                      Register for free!
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="text-brand hover:underline"
                      onClick={() => {
                        setMode("login");
                        setMessage(null);
                      }}
                      disabled={loading}
                    >
                      Login!
                    </button>
                  </>
                )}
              </div>
            </Card>
          </div>
        </Section>
      </Main>
    </PageLayout>
  );
}

export default Authentication;
