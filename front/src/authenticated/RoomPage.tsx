import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { APIEndpoints, type Room } from "@shared/shared-types";
import { Card } from "@front/components/Card";
import { Section } from "@front/components/Section";
import { useUser } from "@front/components/UserContext";

function RoomPage() {
  const { id } = useParams();
  const { user } = useUser();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [friends] = useState<{ name: string; status: "online" | "offline" }[]>(
    [],
  ); // Placeholder friends list
  useEffect(() => {
    async function fetchRoomAndJoin() {
      setLoading(true);
      setError(null);
      try {
        // Fetch room info
        console.log("Fetching room info for ID:", id);
        const res = await fetch(`${APIEndpoints.ROOM_BASE}${id}`);
        if (!res.ok) {
          throw new Error(await res.text());
        }
        const data: Room = await res.json();
        setRoom(data);

        // Add user to room's member list if not already present
        console.log("Room members:", data.members);
        console.log("Current user:", user?.username);
        if (user && data && !data.members.includes(user.username)) {
          await fetch(
            `${APIEndpoints.ROOM_BASE}${id}${APIEndpoints.ADD_TO_ROOM}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username: user.username }),
            },
          );
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchRoomAndJoin();
  }, [id, user]);

  if (loading)
    return (
      <Section>
        <Card>Loading room...</Card>
      </Section>
    );
  if (error)
    return (
      <Section>
        <Card className="text-red-500">{error}</Card>
      </Section>
    );
  if (!room)
    return (
      <Section>
        <Card>Room not found.</Card>
      </Section>
    );
  return (
    <div className="flex-1 flex flex-col h-full min-h-[80vh] w-full p-2 md:p-6">
      {/* Mobile View */}
      <div className="flex-1 flex flex-col gap-4 md:hidden">
        <Card className="flex items-center justify-center text-center p-4">
          <div>
            <div className="text-xs uppercase tracking-wider mt-1">
              {room.name}
            </div>
            <div className="text-lg text-nowrap font-bold break-all">
              {room.roomID}
            </div>
          </div>
        </Card>

        <Card className="flex flex-col p-4 gap-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            Friends
          </div>
          <ul className="space-y-2">
            {friends.length === 0 && (
              <li className="text-gray-400 text-sm">No friends online.</li>
            )}
            {friends.map((friend, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    friend.status === "online" ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></span>
                <span className="text-sm">{friend.name}</span>
                <span className="ml-auto text-xs text-gray-500">
                  {friend.status}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="flex flex-1 flex-col p-4 gap-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            Main Content
          </div>
          <div className="flex-1 flex items-center justify-center text-gray-400">
            {/* Placeholder for main content */}
            Coming soon...
          </div>
        </Card>
      </div>
      {/* Desktop View */}
      <div
        className="hidden md:flex flex-1 h-full w-full max-w-6xl mx-auto"
        style={{ minHeight: "60vh" }}
      >
        <div className="grid grid-cols-1 grid-rows-4 gap-4 md:grid-cols-[1fr_4fr] md:grid-rows-[1fr_4fr] h-full w-full">
          {/* Top Left: Room ID */}
          <Card className="flex items-center justify-center text-center p-4 min-h-25 md:col-start-1 md:col-end-2 md:row-start-1 md:row-end-2">
            <div>
              <div className="text-lg text-nowrap font-bold break-all">
                {room.roomID}
              </div>
            </div>
          </Card>

          {/* Top Right: Room Name */}
          <Card className="flex items-center justify-center text-center p-4 min-h-25 md:col-start-2 md:col-end-3 md:row-start-1 md:row-end-2">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Room Name
              </div>
              <div className="text-lg font-bold">{room.name}</div>
            </div>
          </Card>

          {/* Bottom Left: Friends List */}
          <Card className="flex flex-col p-4 min-h-50 overflow-auto md:col-start-1 md:col-end-2 md:row-start-2 md:row-end-3">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Friends
            </div>
            <ul className="space-y-2">
              {friends.length === 0 && (
                <li className="text-gray-400 text-sm">No friends online.</li>
              )}
              {friends.map((friend, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      friend.status === "online"
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  ></span>
                  <span className="text-sm">{friend.name}</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {friend.status}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Bottom Right: Main Content */}
          <Card className="flex flex-col p-4 min-h-50 md:col-start-2 md:col-end-3 md:row-start-2 md:row-end-3">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Main Content
            </div>
            <div className="flex-1 flex items-center justify-center text-gray-400">
              {/* Placeholder for main content */}
              Coming soon...
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default RoomPage;
