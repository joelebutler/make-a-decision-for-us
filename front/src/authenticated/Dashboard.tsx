import { Button } from "@front/components/Button";
import { Card } from "@front/components/Card";
import { Section } from "@front/components/Section";
import { NavLink } from "react-router";

function Dashboard() {
  // const { user } = useUser();
  // Placeholder data
  type friend = {
    name: string;
    status: "online" | "offline";
  };
  type lobby = {
    name: string;
    members: number;
  };
  const friends: friend[] = [];
  const lobbies: lobby[] = [];

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
          <h2 className="text-xl font-semibold mb-4">Active Discussions</h2>
          <ul className="space-y-3">
            {lobbies.map((lobby) => (
              <li
                key={lobby.name}
                className="flex items-center justify-between p-2 rounded hover:bg-surface/70 transition"
              >
                <span className="font-medium">{lobby.name}</span>
                <span className="text-xs text-gray-500">
                  {lobby.members} members
                </span>
                <button
                  className="ml-4 px-3 py-1 rounded bg-brand text-white text-xs font-semibold hover:bg-brand/80 transition"
                  disabled
                >
                  Join
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </Section>
  );
}

export default Dashboard;
