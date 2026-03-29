import { Button } from "@front/components/Button";
import { Card } from "@front/components/Card";
import { Section } from "@front/components/Section";
import { useUser } from "@front/components/UserContext";
import { useEffect, useState } from "react";
import { API, type Room } from "@shared/shared-types";
import { NavLink } from "react-router";
import Dialog from "@front/components/Dialog";

interface Lobby {
  id: string;
  name: string;
  description?: string;
  members: string[] | string;
}

const Dashboard = () => {
  const { user, refreshUser } = useUser();
  const [ownedLobbies, setOwnedLobbies] = useState<Lobby[]>([]);
  const [joinedLobbies, setJoinedLobbies] = useState<Lobby[]>([]);
  const [showingJoinDialog, setShowingJoinDialog] = useState(false);

  // Refresh user on mount
  useEffect(() => {
    setOwnedLobbies([]);
    setJoinedLobbies([]);
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch owned and joined lobbies separately
  useEffect(() => {
    const fetchLobbies = async () => {
      // Clear lists immediately so UI does not show stale data

      const owned = user?.ownedLobbies || [];
      const joined = user?.joinedLobbies || [];

      // Fetch owned lobbies
      const ownedResults: Lobby[] = await Promise.all(
        owned.map(async (roomID) => {
          try {
            const res = await fetch(API.BASE + API.ROOM_BASE + "/" + roomID);
            if (!res.ok) throw new Error();
            const data: Room = await res.json();
            return {
              id: roomID,
              name: data.name,
              description: data.problemDescription,
              members: Array.isArray(data.members) ? data.members : "Unknown",
            };
          } catch {
            return { id: roomID, name: roomID, members: "Unknown" };
          }
        }),
      );
      setOwnedLobbies(ownedResults);

      // Fetch joined lobbies (excluding those already owned)
      const joinedFiltered = joined.filter((id) => !owned.includes(id));
      const joinedResults: Lobby[] = await Promise.all(
        joinedFiltered.map(async (roomID) => {
          try {
            const res = await fetch(API.BASE + API.ROOM_BASE + "/" + roomID);
            if (!res.ok) throw new Error();
            const data: Room = await res.json();
            return {
              id: roomID,
              name: data.name,
              description: data.problemDescription,
              members: Array.isArray(data.members) ? data.members : "Unknown",
            };
          } catch {
            return { id: roomID, name: roomID, members: "Unknown" };
          }
        }),
      );
      setJoinedLobbies(joinedResults);
    };
    fetchLobbies();
  }, [user]);

  return (
    <Section className="min-h-[90vh]">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Welcome & Actions Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-text leading-tight w-full truncate">
              Welcome back,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-hover">
                {user?.username || "Friend"}
              </span>
            </h1>
            <p className="text-lg text-text-muted mt-2 font-medium">
              Manage your active decisions and groups.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="px-6 py-3 font-bold shadow-sm hover:bg-surface-elevated transition-all duration-300 rounded-xl border-2 border-brand/20 bg-transparent text-text flex items-center justify-center gap-2"
              onClick={() => setShowingJoinDialog(true)}
            >
              <svg
                className="w-5 h-5 opacity-70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              Join Existing
            </Button>
            <Dialog open={showingJoinDialog} setOpen={setShowingJoinDialog} />
            <NavLink to="/room/new" className="flex flex-col sm:block">
              <Button className="w-full px-6 py-3 font-bold shadow-xl shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-0.5 transition-all duration-300 rounded-xl bg-brand text-surface flex items-center justify-center gap-2 border-none">
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Start a New Room
              </Button>
            </NavLink>
          </div>
        </div>

        <div className="w-full space-y-8">
          {/* Main content - Lobbies */}
          <Card className="p-8 border-brand/10 shadow-sm shadow-brand/5 bg-surface/80 backdrop-blur-sm rounded-3xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

            <h2 className="text-2xl font-black mb-8 flex items-center gap-3 relative z-10">
              <div className="p-2 bg-brand/10 text-brand rounded-xl">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              Your Active Decisions
            </h2>

            {/* Owned Lobbies */}
            <div className="mb-10 relative z-10">
              <h3 className="text-lg font-bold text-text-muted mb-4 tracking-wide uppercase text-sm flex items-center gap-2">
                Rooms You Manage
              </h3>
              {ownedLobbies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ownedLobbies.map((lobby) => (
                    <div
                      key={lobby.id}
                      className="p-5 rounded-2xl border-2 border-surface-elevated hover:border-brand/30 bg-surface shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between h-full"
                    >
                      <div className="mb-5">
                        <h4 className="font-extrabold text-xl text-text truncate mb-1">
                          {lobby.name}
                        </h4>
                        {lobby.description && (
                          <p className="text-sm font-medium text-text-muted mb-3 line-clamp-2">
                            {lobby.description}
                          </p>
                        )}
                        <p className="text-sm font-semibold text-brand/80 bg-brand/5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                          </svg>
                          {lobby.members !== "Unknown"
                            ? `${lobby.members.length} members`
                            : "Unknown members"}
                        </p>
                      </div>
                      <div className="flex gap-2 mt-auto pt-2">
                        <NavLink to={`/room/${lobby.id}`} className="flex-1">
                          <button className="w-full py-2.5 bg-brand/10 text-brand font-bold rounded-xl hover:bg-brand hover:text-surface transition-all duration-200">
                            View Room
                          </button>
                        </NavLink>
                        <button
                          className="px-4 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-600 hover:text-white transition-all duration-200 shadow-sm"
                          onClick={async (e) => {
                            e.preventDefault();
                            if (!user) return;
                            const res = await fetch(
                              API.BASE + API.ROOM_BASE + "/" + lobby.id,
                              { method: "DELETE" },
                            );
                            if (res.ok) {
                              setOwnedLobbies((prev) =>
                                prev.filter((l) => l.id !== lobby.id),
                              );
                            }
                          }}
                        >
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-brand/20 rounded-2xl bg-surface-subtle">
                  <p className="text-text-muted font-medium">
                    You haven't created any rooms yet.
                  </p>
                </div>
              )}
            </div>

            {ownedLobbies.length > 0 && joinedLobbies.length > 0 && (
              <hr className="my-8 border-t-2 border-surface-elevated relative z-10" />
            )}

            {/* Joined Lobbies */}
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-text-muted mb-4 tracking-wide uppercase text-sm flex items-center gap-2">
                Rooms You've Joined
              </h3>
              {joinedLobbies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {joinedLobbies.map((lobby) => (
                    <div
                      key={lobby.id}
                      className="p-5 rounded-2xl border-2 border-surface-elevated hover:border-brand/30 bg-surface shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between h-full"
                    >
                      <div className="mb-5">
                        <h4 className="font-extrabold text-xl text-text truncate mb-1">
                          {lobby.name}
                        </h4>
                        {lobby.description && (
                          <p className="text-sm font-medium text-text-muted mb-3 line-clamp-2">
                            {lobby.description}
                          </p>
                        )}
                        <p className="text-sm font-semibold text-brand/80 bg-brand/5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                          </svg>
                          {lobby.members !== "Unknown"
                            ? `${lobby.members.length} members`
                            : "Unknown members"}
                        </p>
                      </div>
                      <div className="flex gap-2 mt-auto pt-2">
                        <NavLink to={`/room/${lobby.id}`} className="flex-1">
                          <button className="w-full py-2.5 bg-brand/10 text-brand font-bold rounded-xl hover:bg-brand hover:text-surface transition-all duration-200">
                            View Room
                          </button>
                        </NavLink>
                        <button
                          className="px-4 py-2.5 bg-text-muted/10 text-text font-bold rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200 shadow-sm"
                          onClick={async (e) => {
                            e.preventDefault();
                            if (!user) return;
                            await fetch(
                              API.BASE +
                                API.ROOM_BASE +
                                "/" +
                                lobby.id +
                                API.ROOM_LEAVE,
                              {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                  username: user.username,
                                }),
                              },
                            );
                            refreshUser();
                          }}
                        >
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
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-brand/20 rounded-2xl bg-surface-subtle">
                  <p className="text-text-muted font-medium">
                    You haven't joined any rooms yet.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Section>
  );
};

export default Dashboard;
