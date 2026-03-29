import { Button } from "@front/components/Button";
import { Card } from "@front/components/Card";
import { Header } from "@front/components/Header";
import { Main, PageLayout } from "@front/components/PageLayout";
import { Section } from "@front/components/Section";

import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useUser } from "@front/components/UserContext";
import { applyTheme } from "@front/components/types";
import { API, type Message } from "@shared/shared-types";

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
        const res = await fetch(API.BASE + API.REGISTER, {
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
          const loginRes = await fetch(API.BASE + API.LOGIN, {
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
        const res = await fetch(API.BASE + API.LOGIN, {
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
        <Section className="relative overflow-hidden w-full flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] py-12 px-4 shadow-inner">
          <div className="absolute top-0 left-0 w-full h-[500px] bg-brand/5 blur-[120px] pointer-events-none -z-10" />

          <div className="container mx-auto max-w-md w-full relative z-10 flex flex-col gap-6">
            <div className="text-center mb-2">
              <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-hover leading-tight">
                {mode === "login" ? "Welcome Back" : "Get Started"}
              </h1>
              <p className="text-text-muted font-bold text-lg max-w-sm mx-auto">
                {mode === "login"
                  ? "Log in to manage your active decisions and groups."
                  : "Create a free account to start deciding together."}
              </p>
            </div>

            <Card className="w-full mx-auto p-8 rounded-3xl border-2 border-brand/10 shadow-xl shadow-brand/5 bg-surface/80 backdrop-blur-xl relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

              <form
                className="flex flex-col gap-5 relative z-10"
                onSubmit={handleSubmit}
                ref={formRef}
                autoComplete="off"
              >
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-muted uppercase tracking-wider px-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    placeholder="E.g. CoolUser99"
                    className="w-full bg-surface-muted/50 border-2 border-brand/10 hover:border-brand/30 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-brand/20 focus:border-brand transition-all duration-300 text-base font-bold placeholder:font-medium placeholder:text-text-muted/50 shadow-sm"
                    required
                    value={form.username}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                {mode === "register" && (
                  <div className="space-y-2 animate-fade-in">
                    <label className="text-sm font-bold text-text-muted uppercase tracking-wider px-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="hello@example.com"
                      className="w-full bg-surface-muted/50 border-2 border-brand/10 hover:border-brand/30 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-brand/20 focus:border-brand transition-all duration-300 text-base font-bold placeholder:font-medium placeholder:text-text-muted/50 shadow-sm"
                      required
                      value={form.email}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-muted uppercase tracking-wider px-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••••••"
                    className="w-full bg-surface-muted/50 border-2 border-brand/10 hover:border-brand/30 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-brand/20 focus:border-brand transition-all duration-300 text-base font-bold placeholder:font-medium placeholder:text-text-muted/50 shadow-sm font-mono tracking-widest"
                    required
                    value={form.password}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full min-h-[56px] text-lg px-8 py-4 shadow-xl shadow-brand/20 hover:shadow-brand/40 font-black bg-brand text-surface hover:-translate-y-1 transition-all duration-300 rounded-2xl flex items-center justify-center gap-3 border-none group disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-5 w-5 text-surface"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {mode === "login"
                          ? "Logging in..."
                          : "Creating Account..."}
                      </>
                    ) : (
                      <>
                        {mode === "login" ? "Secure Login" : "Create Account"}
                        <svg
                          className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {message && (
                <div
                  className={`mt-6 p-4 rounded-xl border-2 flex items-center gap-3 animate-fade-in ${
                    message.type === "success"
                      ? "bg-green-50 text-green-600 border-green-200"
                      : "bg-red-50 text-red-600 border-red-200"
                  }`}
                >
                  <svg
                    className="w-5 h-5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {message.type === "success" ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    )}
                  </svg>
                  <span className="font-bold text-sm">{message.text}</span>
                </div>
              )}

              <div className="mt-8 pt-6 border-t-2 border-surface-elevated/50 text-center text-base font-bold text-text-muted relative z-10 flex flex-col items-center justify-center gap-2">
                {mode === "login"
                  ? "Don't have an account?"
                  : "Already have an account?"}
                <button
                  type="button"
                  className="inline-flex items-center gap-2 bg-brand/10 text-brand px-6 py-2.5 rounded-xl hover:bg-brand hover:text-surface transition-all duration-300 font-black shadow-sm disabled:opacity-50"
                  onClick={() => {
                    setMode(mode === "login" ? "register" : "login");
                    setMessage(null);
                  }}
                  disabled={loading}
                >
                  {mode === "login" ? "Register for free" : "Login instead"}
                </button>
              </div>
            </Card>
          </div>
        </Section>
      </Main>
    </PageLayout>
  );
}

export default Authentication;
