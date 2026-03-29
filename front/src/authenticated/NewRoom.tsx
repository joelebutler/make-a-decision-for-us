import { Button } from "@front/components/Button";
import { Card } from "@front/components/Card";
import { Section } from "@front/components/Section";
import { useState } from "react";
import { useUser } from "@front/components/UserContext";
import { Switch } from "@front/components/Switch";
import { Tooltip } from "@front/components/Tooltip";
import { FiInfo } from "react-icons/fi";
import { APIEndpoints, type Message } from "@shared/shared-types";

import type { User, Room } from "@shared/shared-types";
import { useNavigate } from "react-router";

type FormState = {
  name: string;
  isPrivate: boolean;
  password?: string;
  isAnonymous: boolean;
};

function NewRoom() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    isPrivate: false,
    password: "",
    isAnonymous: false,
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
        isPrivate: form.isPrivate,
        isAnonymous: form.isAnonymous,
        password: form.isPrivate ? form.password : undefined,
        createdBy,
        createdAt: new Date(),
      };
      const res = await fetch(APIEndpoints.CREATE_ROOM, {
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
        if (data && data.roomId) {
          navigate("/room/" + data.roomId);
        } else {
          setMessage({
            type: "error",
            text: "Room created but no roomId returned.",
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
    <Section>
      <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">Create a Room</h1>
          <form
            className="flex flex-col gap-4"
            autoComplete="off"
            onSubmit={handleSubmit}
          >
            <div>
              <label
                htmlFor="name"
                className="text-sm font-medium text-text/80"
              >
                Room Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="My Difficult Decision"
                className="px-4 py-2 text-sm rounded border border-brand/30 bg-surface/60 focus:outline-none focus:ring-2 focus:ring-brand w-full"
                required
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                disabled={loading}
              />
            </div>

            <div className="flex items-center gap-2 w-full">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <label
                  className="text-sm font-medium text-text/80 whitespace-nowrap"
                  htmlFor="isAnonymous"
                >
                  Anonymous Room
                </label>
                <Tooltip content="If enabled, requests in this room will not be associated with usernames. This is useful for sensitive or unbiased decisions.">
                  <FiInfo className="w-4 h-4 text-brand cursor-pointer" />
                </Tooltip>
              </div>
              <div className="shrink-0">
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

            <div className="flex items-center gap-2 w-full">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <label
                  className="text-sm font-medium text-text/80 whitespace-nowrap"
                  htmlFor="isPrivate"
                >
                  Private Room
                </label>
              </div>
              <div className="shrink-0">
                <Switch
                  name={"isPrivate"}
                  checked={form.isPrivate}
                  onChange={(val) => setForm((f) => ({ ...f, isPrivate: val }))}
                  aria-label="Private Room"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-text/80"
              >
                Room Password
              </label>
              <input
                type="password"
                name="password"
                placeholder={
                  form.isPrivate ? "mysupersecretpassword" : "Room is public..."
                }
                className="px-4 py-2 text-sm rounded border border-brand/30 bg-surface/60 focus:outline-none focus:ring-2 focus:ring-brand w-full disabled:bg-text/5 disabled:italic"
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
              className="w-full mt-2 px-2 py-1"
              disabled={loading}
            >
              {loading ? "Creating room..." : "Create Room"}
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
        </Card>
      </div>
    </Section>
  );
}

export default NewRoom;
