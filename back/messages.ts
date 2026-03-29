/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoClient } from "mongodb";
import { ROOM_DB } from "./defines";
import { type DRequest, type VotingRecord } from "@shared/shared-types";

function extractRoomId(url: URL): string | undefined {
  const parts = url.pathname.split("/");
  const idx = parts.indexOf("room");
  return idx !== -1 && idx + 1 < parts.length ? parts[idx + 1] : undefined;
}

export async function ADD_MESSAGE(
  url: URL,
  body: string | null,
): Promise<Response> {
  try {
    if (!body) return new Response("Missing request body", { status: 400 });
    const { sentBy, title, details } = JSON.parse(body);
    const roomID = extractRoomId(url);
    if (!roomID || !sentBy || !title || !details) {
      return new Response("Missing required fields", { status: 400 });
    }

    const dRequest: DRequest = {
      id:
        new Date().getTime().toString() +
        Math.random().toString(36).substring(7),
      timeStamp: new Date(),
      sentBy,
      title,
      details,
      votingHistory: [],
    };

    const uri = Bun.env.CONNECTION_STRING || "";
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const rooms = client.db(Bun.env.DB_NAME).collection(ROOM_DB);
      const updateResult = await rooms.updateOne(
        { roomID },
        { $push: { requests: dRequest } as any },
      );
      if (updateResult.modifiedCount > 0) {
        return new Response(JSON.stringify(dRequest), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } else {
        return new Response("Room not found", { status: 404 });
      }
    } finally {
      await client.close();
    }
  } catch (err) {
    console.error("Error adding message:", err);
    return new Response("Error adding message", { status: 500 });
  }
}

export async function GET_MESSAGES(url: URL): Promise<Response> {
  try {
    const roomID = extractRoomId(url);
    if (!roomID) return new Response("Missing roomID", { status: 400 });

    const uri = Bun.env.CONNECTION_STRING || "";
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const rooms = client.db(Bun.env.DB_NAME).collection(ROOM_DB);
      const room = await rooms.findOne({ roomID });
      if (!room) return new Response("Room not found", { status: 404 });

      const requests = room.requests || [];
      return new Response(JSON.stringify({ requests }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } finally {
      await client.close();
    }
  } catch (err) {
    console.error("Error getting messages:", err);
    return new Response("Error getting messages", { status: 500 });
  }
}

export async function REMOVE_MESSAGE(
  url: URL,
  body: string | null,
): Promise<Response> {
  try {
    if (!body) return new Response("Missing request body", { status: 400 });
    const { messageId } = JSON.parse(body);
    const roomID = extractRoomId(url);
    if (!roomID || !messageId)
      return new Response("Missing roomID or messageId", { status: 400 });

    const uri = Bun.env.CONNECTION_STRING || "";
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const rooms = client.db(Bun.env.DB_NAME).collection(ROOM_DB);
      const updateResult = await rooms.updateOne(
        { roomID },
        { $pull: { requests: { id: messageId } } as any },
      );
      if (updateResult.modifiedCount > 0) {
        return new Response("Message removed", { status: 200 });
      } else {
        return new Response("Room or message not found", { status: 404 });
      }
    } finally {
      await client.close();
    }
  } catch (err) {
    console.error("Error removing message:", err);
    return new Response("Error removing message", { status: 500 });
  }
}

export async function ADD_VOTE(
  url: URL,
  body: string | null,
): Promise<Response> {
  try {
    if (!body) return new Response("Missing request body", { status: 400 });
    const { messageId, username, upvote } = JSON.parse(body);
    const roomID = extractRoomId(url);
    if (!roomID || !messageId || !username || upvote === undefined) {
      return new Response("Missing required fields", { status: 400 });
    }

    const uri = Bun.env.CONNECTION_STRING || "";
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const rooms = client.db(Bun.env.DB_NAME).collection(ROOM_DB);

      // Remove any existing vote from this user for this message
      await rooms.updateOne(
        { roomID, "requests.id": messageId },
        { $pull: { "requests.$.votingHistory": { username } } as any },
      );

      // Add the new vote
      const vote: VotingRecord = { username, upvote };
      const updateResult = await rooms.updateOne(
        { roomID, "requests.id": messageId },
        { $push: { "requests.$.votingHistory": vote } as any },
      );

      if (updateResult.modifiedCount > 0) {
        return new Response("Vote added", { status: 200 });
      } else {
        return new Response("Room or message not found", { status: 404 });
      }
    } finally {
      await client.close();
    }
  } catch (err) {
    console.error("Error adding vote:", err);
    return new Response("Error adding vote", { status: 500 });
  }
}

export async function REMOVE_VOTE(
  url: URL,
  body: string | null,
): Promise<Response> {
  try {
    if (!body) return new Response("Missing request body", { status: 400 });
    const { messageId, username } = JSON.parse(body);
    const roomID = extractRoomId(url);
    if (!roomID || !messageId || !username) {
      return new Response("Missing required fields", { status: 400 });
    }

    const uri = Bun.env.CONNECTION_STRING || "";
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const rooms = client.db(Bun.env.DB_NAME).collection(ROOM_DB);

      const updateResult = await rooms.updateOne(
        { roomID, "requests.id": messageId },
        { $pull: { "requests.$.votingHistory": { username } } as any },
      );

      if (updateResult.modifiedCount > 0) {
        return new Response("Vote removed", { status: 200 });
      } else {
        return new Response("Room or message not found, or no vote to remove", {
          status: 404,
        });
      }
    } finally {
      await client.close();
    }
  } catch (err) {
    console.error("Error removing vote:", err);
    return new Response("Error removing vote", { status: 500 });
  }
}
