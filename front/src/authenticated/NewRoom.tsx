import { Button } from "@front/components/Button";
import { Card } from "@front/components/Card";
import { Section } from "@front/components/Section";
import { useState } from "react";
import { useUser } from "@front/components/UserContext";
import { Switch } from "@front/components/Switch";
import { API, type Message } from "@shared/shared-types";

import type { User, Room } from "@shared/shared-types";
import { useNavigate } from "react-router";

type FormState = {
  name: string;
  problemDescription: string;
  isPrivate: boolean;
  password?: string;
  isAnonymous: boolean;
  isSolo: boolean;
};

function NewRoom() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    problemDescription: "",
    isPrivate: false,
    password: "",
    isAnonymous: false,
    isSolo: false,
  });
  const navigate = useNavigate();
  const { user, refreshUser } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      // Use user from context
      let createdBy: User | undefined = undefined;
      if (user && user.username) {
        createdBy = { username: user.username, email: user.email };
      }
      const payload: Partial<Room> = {
        name: form.name,
        problemDescription: form.problemDescription,
        isPrivate: form.isPrivate,
        isAnonymous: form.isAnonymous,
        password: form.isPrivate ? form.password : undefined,
        createdBy,
        createdAt: new Date(),
        members: createdBy ? [createdBy.username] : [],
      };
      const res = await fetch(API.BASE + API.ROOM_BASE + API.CREATE_ROOM, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        // Refresh user data after room creation
        if (user && user.username) {
          await refreshUser();
        }
        if (data && data.roomID) {
          navigate("/room/" + data.roomID);
        } else {
          setMessage({
            type: "error",
            text: "Room created but no roomID returned.",
          });
        }
      } else {
        const text = await res.text();
        setMessage({
          type: "error",
          text: text || "Room creation failed.",
        });
      }
    } catch (err) {
      console.error("Room creation error:", err);
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section className="min-h-[90vh] py-10 relative overflow-hidden flex items-center justify-center">
      {/* Decorative backdrop elements */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[100px] opacity-70 -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-subtle rounded-full blur-[80px] opacity-70 -z-10 pointer-events-none mix-blend-multiply" />

      <div className="container mx-auto px-4 z-10">
        <div className="max-w-xl mx-auto mb-10 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-text leading-tight">
            Create a{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-hover">
              New Room
            </span>
          </h1>
          <p className="text-lg text-text-muted font-medium max-w-md mx-auto">
            Make the hard decision.
          </p>
        </div>

        <Card className="max-w-xl w-full mx-auto p-8 border-brand/10 shadow-2xl shadow-brand/10 bg-surface/80 backdrop-blur-xl rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <form
            className="flex flex-col gap-6 relative z-10"
            autoComplete="off"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-bold text-text-muted uppercase tracking-wider px-1"
              >
                Room Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Where should grandma go?"
                className="w-full bg-surface-muted/50 border-2 border-brand/10 hover:border-brand/30 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-brand/20 focus:border-brand transition-all duration-300 text-lg font-semibold placeholder:font-normal placeholder:text-text-muted/50 shadow-sm"
                required
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="problemDescription"
                className="text-sm font-bold text-text-muted uppercase tracking-wider px-1"
              >
                Problem Description
              </label>
              <textarea
                name="problemDescription"
                placeholder="Describe the exact problem or decision to be solved..."
                className="w-full bg-surface-muted/50 border-2 border-brand/10 hover:border-brand/30 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-brand/20 focus:border-brand transition-all duration-300 text-base font-medium placeholder:font-normal placeholder:text-text-muted/50 shadow-sm min-h-[100px] resize-y"
                required
                value={form.problemDescription}
                onChange={(e) =>
                  setForm((f) => ({ ...f, problemDescription: e.target.value }))
                }
                disabled={loading}
              />
            </div>

            <div className="p-5 rounded-2xl border-2 border-surface-elevated bg-surface space-y-5 shadow-sm">
              <div className="flex items-center justify-between gap-4 w-full group">
                <div className="flex-1 min-w-0 flex items-start gap-3">
                  <div className="mt-0.5 w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <label
                      className="text-base font-bold text-text block mb-0.5 cursor-pointer"
                      htmlFor="isAnonymous"
                    >
                      Anonymous Room
                    </label>
                    <p className="text-sm text-text-muted leading-snug pr-4">
                      Participants' votes and requests are hidden from everyone
                      else.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center">
                  <Switch
                    name="isAnonymous"
                    checked={form.isAnonymous}
                    onChange={(val) =>
                      setForm((f) => ({ ...f, isAnonymous: val }))
                    }
                    aria-label="Anonymous Mode"
                  />
                </div>
              </div>

              <hr className="border-t-2 border-surface-elevated" />

              <div className="flex items-center justify-between gap-4 w-full group">
                <div className="flex-1 min-w-0 flex items-start gap-3">
                  <div className="mt-0.5 w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <label
                      className="text-base font-bold text-text block mb-0.5 cursor-pointer"
                      htmlFor="isSolo"
                    >
                      Solo Room
                    </label>
                    <p className="text-sm text-text-muted leading-snug pr-4">
                      Make this room completely private to you, evaluating
                      custom weights.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center">
                  <Switch
                    name="isSolo"
                    checked={form.isSolo}
                    onChange={(val) => setForm((f) => ({ ...f, isSolo: val }))}
                    aria-label="Solo Mode"
                  />
                </div>
              </div>

              <hr className="border-t-2 border-surface-elevated" />

              <div className="flex items-center justify-between gap-4 w-full group">
                <div className="flex-1 min-w-0 flex items-start gap-3">
                  <div className="mt-0.5 w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <label
                      className="text-base font-bold text-text block mb-0.5 cursor-pointer"
                      htmlFor="isPrivate"
                    >
                      Private Room
                    </label>
                    <p className="text-sm text-text-muted leading-snug pr-4">
                      Require a password for anyone attempting to join this
                      room.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center">
                  <Switch
                    name={"isPrivate"}
                    checked={form.isPrivate}
                    onChange={(val) =>
                      setForm((f) => ({ ...f, isPrivate: val }))
                    }
                    aria-label="Private Room"
                  />
                </div>
              </div>
            </div>

            <div
              className={`space-y-2 transition-all duration-300 ${form.isPrivate ? "opacity-100 max-h-32" : "opacity-50 max-h-32 pointer-events-none"}`}
            >
              <label
                htmlFor="password"
                className="text-sm font-bold text-text-muted uppercase tracking-wider px-1 flex items-center gap-2"
              >
                Room Password
                {form.isPrivate && (
                  <span className="text-brand text-xs px-2 py-0.5 bg-brand/10 rounded-md">
                    Required
                  </span>
                )}
              </label>
              <input
                type="password"
                name="password"
                placeholder={
                  form.isPrivate
                    ? "Enter a secure password..."
                    : "Enable Private Room to set a password"
                }
                className="w-full bg-surface-muted/50 border-2 border-brand/10 hover:border-brand/30 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-brand/20 focus:border-brand transition-all duration-300 text-lg font-semibold placeholder:font-normal placeholder:text-text-muted/50 shadow-sm disabled:cursor-not-allowed"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                disabled={loading || !form.isPrivate}
                required={form.isPrivate}
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-4 h-14 text-lg font-black shadow-xl shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-1 transition-all duration-300 bg-brand text-surface rounded-xl border-none flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-surface"
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
                  Creating Room...
                </>
              ) : (
                <>
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create Room
                </>
              )}
            </Button>
          </form>

          {message && (
            <div
              className={`mt-6 p-4 rounded-xl text-center text-sm font-bold flex items-center justify-center gap-2 ${message.type === "success" ? "bg-green-50 text-green-600 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"} relative z-10 animate-fade-in`}
            >
              {message.type === "success" ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              {message.text}
            </div>
          )}
        </Card>
      </div>
    </Section>
  );
}

export default NewRoom;
