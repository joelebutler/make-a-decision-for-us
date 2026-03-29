import { Button } from "@front/components/Button";
import { Card } from "@front/components/Card";
import { Section } from "@front/components/Section";
import { useUser } from "@front/components/UserContext";
import { useEffect, useState } from "react";
import { APIEndpoints, type Room } from "@shared/shared-types";
import { NavLink } from "react-router";
import Dialog from "@front/components/Dialog";

interface Friend {
  name: string;
  status: "online" | "offline";
}

interface Lobby {
  id: string;
  name: string;
  members: string[] | string;
}

const Dashboard = () => {
  const { user, refreshUser } = useUser();
  const [ownedLobbies, setOwnedLobbies] = useState<Lobby[]>([]);
  const [joinedLobbies, setJoinedLobbies] = useState<Lobby[]>([]);
  const [showingJoinDialog, setShowingJoinDialog] = useState(false);
  // Placeholder: friends list is empty
  const friends: Friend[] = [];

  // Refresh user on mount
  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch owned and joined lobbies separately
  useEffect(() => {
    const fetchLobbies = async () => {
      const owned = user?.ownedLobbies || [];
      const joined = user?.joinedLobbies || [];

      // Fetch owned lobbies
      const ownedResults: Lobby[] = await Promise.all(
        owned.map(async (roomID) => {
          try {
            const res = await fetch(`${APIEndpoints.ROOM_BASE}${roomID}`);
            if (!res.ok) throw new Error();
            const data: Room = await res.json();
            return {
              id: roomID,
              name: data.name,
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
            const res = await fetch(`${APIEndpoints.ROOM_BASE}${roomID}`);
            if (!res.ok) throw new Error();
            const data: Room = await res.json();
            return {
              id: roomID,
              name: data.name,
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
    <Section>
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Friends List */}
        <Card className="md:row-span-2">
          <h2 className="text-xl font-semibold mb-4">Friends</h2>
          <ul className="space-y-2">
            {friends.length > 0 ? (
              friends.map((f) => (
                <li key={f.name} className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${f.status === "online" ? "bg-green-500" : "bg-gray-400"}`}
                  ></span>
                  <span>{f.name}</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {f.status}
                  </span>
                </li>
              ))
            ) : (
              <p>No friends found.</p>
            )}
          </ul>
        </Card>

        {/* Main Actions */}
        <Button
          className="md:col-span-1 p-2"
          onClick={() => setShowingJoinDialog(true)}
        >
          Join Existing
        </Button>
        <Dialog open={showingJoinDialog} setOpen={setShowingJoinDialog} />
        <NavLink to="/room/new">
          <Button className="w-full md:col-span-1 p-2">Start a room</Button>
        </NavLink>

        {/* Active Discussions / Lobbies */}
        <Card className="md:col-span-2 min-h-50">
          <h2 className="text-xl font-semibold mb-4">Active Decisions</h2>
          {/* Owned Lobbies */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Owned Lobbies</h3>
            <ul className="space-y-3">
              {ownedLobbies.length > 0 ? (
                ownedLobbies.map((lobby) => (
                  <li
                    key={lobby.id}
                    className="flex items-center justify-between p-2 rounded hover:bg-surface/70 transition"
                  >
                    <span className="font-medium">{lobby.name}</span>
                    <span className="text-xs text-gray-500">
                      {lobby.members !== "Unknown"
                        ? `${lobby.members.length} members`
                        : "Unknown members"}
                    </span>
                    <span>
                      <NavLink to={`/room/${lobby.id}`}>
                        <button className="ml-4 px-3 py-1 rounded bg-brand text-white text-xs font-semibold hover:bg-brand/80 transition">
                          View
                        </button>
                      </NavLink>
                      <button
                        className="ml-4 px-3 py-1 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition"
                        onClick={async (e) => {
                          e.preventDefault();
                          if (!user) return;
                          const res = await fetch(
                            `${APIEndpoints.ROOM_BASE}${lobby.id}`,
                            {
                              method: "DELETE",
                            },
                          );
                          if (res.ok) {
                            setOwnedLobbies((prev) =>
                              prev.filter((l) => l.id !== lobby.id),
                            );
                          }
                        }}
                      >
                        Delete
                      </button>
                    </span>
                  </li>
                ))
              ) : (
                <p>No owned lobbies.</p>
              )}
            </ul>
          </div>
          <hr className="my-6 border-t border-gray-300" />
          {/* Joined Lobbies */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Joined Lobbies</h3>
            <ul className="space-y-3">
              {joinedLobbies.length > 0 ? (
                joinedLobbies.map((lobby) => (
                  <li
                    key={lobby.id}
                    className="flex items-center justify-between p-2 rounded hover:bg-surface/70 transition"
                  >
                    <span className="font-medium">{lobby.name}</span>
                    <span className="text-xs text-gray-500">
                      {lobby.members !== "Unknown"
                        ? `${lobby.members.length} members`
                        : "Unknown members"}
                    </span>
                    <span>
                      <NavLink to={`/room/${lobby.id}`}>
                        <button className="ml-4 px-3 py-1 rounded bg-brand text-white text-xs font-semibold hover:bg-brand/80 transition">
                          View
                        </button>
                      </NavLink>
                      <button
                        className="ml-4 px-3 py-1 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition"
                        onClick={async (e) => {
                          e.preventDefault();
                          if (!user) return;
                          await fetch(
                            `${APIEndpoints.ROOM_BASE}${lobby.id}/leave`,
                            {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ username: user.username }),
                            },
                          );
                          refreshUser();
                        }}
                      >
                        Leave
                      </button>
                    </span>
                  </li>
                ))
              ) : (
                <p>No joined lobbies.</p>
              )}
            </ul>
          </div>
        </Card>
      </div>
    </Section>
  );
};

export default Dashboard;
