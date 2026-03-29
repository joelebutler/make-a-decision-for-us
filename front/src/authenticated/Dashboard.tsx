import { Button } from "@front/components/Button";
import { Card } from "@front/components/Card";
import { Section } from "@front/components/Section";
import { useUser } from "@front/components/UserContext";
import { useEffect, useState } from "react";
import { APIEndpoints, type Room } from "@shared/shared-types";
import { NavLink } from "react-router";

function Dashboard() {
  // const { user } = useUser();
  // Placeholder data
  type friend = {
    name: string;
    status: "online" | "offline";
  };

  type lobby = {
    id: string;
    name: string;
    members: number;
  };
  const { user, refreshUser } = useUser();
  refreshUser();
  const friends: friend[] = [];

  const [lobbies, setLobbies] = useState<lobby[]>([]);

  // Refresh user on mount
  useEffect(() => {
    console.log("Dashboard mounted, refreshing user...");
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch lobbies when user.ownedLobbies changes
  useEffect(() => {
    async function fetchLobbies() {
      if (!user?.ownedLobbies || user.ownedLobbies.length === 0) {
        setLobbies([]);
        return;
      }
      const results: lobby[] = await Promise.all(
        user.ownedLobbies.map(async (roomId) => {
          try {
            const res = await fetch(`${APIEndpoints.ROOM_BASE}${roomId}`);
            if (!res.ok) throw new Error();
            const data: Room = await res.json();
            return { id: roomId, name: data.name, members: 1 };
          } catch {
            return { id: roomId, name: roomId, members: 1 };
          }
        }),
      );
      setLobbies(results);
    }
    fetchLobbies();
  }, [user]);

  return (
    <Section>
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <>
                <p>No friends found.</p>
              </>
            )}
          </ul>
        </Card>

        {/* Main Actions */}

        <Button className="md:col-span-1 p-2">Decide for Me</Button>
        <Button className="md:col-span-1 p-2">Join Existing</Button>
        <NavLink to="/room/new">
          <Button className="w-full md:col-span-1 p-2">Start a room</Button>
        </NavLink>

        {/* Active Discussions / Lobbies */}
        <Card className="md:col-span-3 min-h-50">
          <h2 className="text-xl font-semibold mb-4">Active Decisions</h2>
          <ul className="space-y-3">
            {lobbies.length > 0 ? (
              lobbies.map((lobby) => (
                <li
                  key={lobby.name}
                  className="flex items-center justify-between p-2 rounded hover:bg-surface/70 transition"
                >
                  <span className="font-medium">{lobby.name}</span>
                  <span className="text-xs text-gray-500">
                    {lobby.members} members
                  </span>
                  <NavLink to={`/room/${lobby.id}`}>
                    <button className="ml-4 px-3 py-1 rounded bg-brand text-white text-xs font-semibold hover:bg-brand/80 transition">
                      Join
                    </button>
                  </NavLink>
                </li>
              ))
            ) : (
              <p>No active decisions. Create or join a room to get started!</p>
            )}
          </ul>
        </Card>
      </div>
    </Section>
  );
}

export default Dashboard;
