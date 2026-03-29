import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { APIEndpoints, type Room } from "@shared/shared-types";
import { Card } from "@front/components/Card";
import { Section } from "@front/components/Section";

function RoomPage() {
  const { id } = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoom() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${APIEndpoints.ROOM_BASE}${id}`);
        if (!res.ok) {
          throw new Error(await res.text());
        }
        const data = await res.json();
        setRoom(data);
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
    if (id) fetchRoom();
  }, [id]);

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
    <Section>
      <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">{room.name}</h1>
          <div className="mb-2 text-sm text-text/70 text-center">
            Room ID: <span className="font-mono">{room.id}</span>
          </div>
          <div className="mb-2 text-sm text-text/70 text-center">
            Created by: {room.createdBy?.username || "Unknown"}
          </div>
          <div className="mb-2 text-sm text-text/70 text-center">
            Created at:{" "}
            {room.createdAt
              ? new Date(room.createdAt).toLocaleString()
              : "Unknown"}
          </div>
          <div className="mb-2 text-sm text-text/70 text-center">
            {room.isPrivate ? "Private" : "Public"} |{" "}
            {room.isAnonymous ? "Anonymous" : "Not Anonymous"}
          </div>
        </Card>
      </div>
    </Section>
  );
}

export default RoomPage;
