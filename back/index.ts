/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import { ROOM_DB, SYSTEM_INSTRUCTIONS, USER_DB } from "./defines";
import {
  API,
  type Room,
  type GeminiRequest,
  type User,
  type Friendship,
} from "@shared/shared-types";
import { signJwt, verifyJwt } from "./jwt";
import { GenerateContentResponse, GoogleGenAI } from "@google/genai";
import {
  ADD_MESSAGE,
  GET_MESSAGES,
  REMOVE_MESSAGE,
  ADD_VOTE,
  REMOVE_VOTE,
} from "./messages";

const ai = new GoogleGenAI({});

const PORT = process.env.PORT || 8000;
console.log(`Starting server on port ${PORT}...`);

Bun.serve({
  port: PORT,
  async fetch(req) {
    console.log("Received request:", req.method, req.url);
    const url = new URL(req.url);

    if (url.pathname.startsWith("/api/") || url.pathname === "/api") {
      return await Route(req, url);
    }

    const filePath = `../front/dist${url.pathname === "/" ? "/index.html" : url.pathname}`;
    try {
      const file = Bun.file(filePath);
      if (await file.exists()) return new Response(file);
    } catch (e) {
      console.error("Error serving file, falling back to index:", e);
    }
    return new Response(Bun.file("../front/dist/index.html"));
  },
});

//==================================================================================
// routing
//==================================================================================
async function Route(request: Request, url: URL): Promise<Response> {
  const body = await request.text();
  let workingPathname = url.pathname.replace("/api", "");

  //*********************************************
  // user & login
  //*********************************************

  if (workingPathname.startsWith(API.LOGIN) && request.method === "POST")
    return await LOGIN(body);
  else if (
    workingPathname.startsWith(API.REGISTER) &&
    request.method === "POST"
  )
    return await REGISTER(body);
  else if (workingPathname.startsWith(API.GET_USER) && request.method === "GET")
    return await API_GET_USER(request);
  //*********************************************
  // themes
  //*********************************************
  else if (
    workingPathname.startsWith(API.CHANGE_THEME) &&
    request.method === "PATCH"
  )
    return await CHANGE_THEME(body);
  else if (
    workingPathname.startsWith(API.GET_THEME) &&
    request.method === "GET"
  )
    return await GET_THEME(url);
  //*********************************************
  // rooms
  //*********************************************
  else if (workingPathname.startsWith(API.ROOM_BASE)) {
    workingPathname = workingPathname.replace(API.ROOM_BASE, "");
    console.log(workingPathname);
    if (
      workingPathname.endsWith(API.ROOM_LEAVE) &&
      request.method === "PATCH"
    ) {
      return await LEAVE_ROOM(request, url, body);
    } else if (
      workingPathname.endsWith(API.ADD_TO_ROOM) &&
      request.method === "PATCH"
    ) {
      return await ADD_TO_ROOM(url, body);
    } else if (
      workingPathname.endsWith(API.ADD_MESSAGE) &&
      request.method === "POST"
    ) {
      return await ADD_MESSAGE(url, body);
    } else if (
      workingPathname.endsWith(API.GET_MESSAGES) &&
      request.method === "GET"
    ) {
      return await GET_MESSAGES(url);
    } else if (
      workingPathname.endsWith(API.REMOVE_MESSAGE) &&
      request.method === "DELETE"
    ) {
      return await REMOVE_MESSAGE(url, body);
    } else if (
      workingPathname.endsWith(API.ADD_VOTE) &&
      request.method === "PATCH"
    ) {
      return await ADD_VOTE(url, body);
    } else if (
      workingPathname.endsWith(API.REMOVE_VOTE) &&
      request.method === "DELETE"
    ) {
      return await REMOVE_VOTE(url, body);
    } else if (
      workingPathname === API.CREATE_ROOM &&
      request.method === "POST"
    ) {
      return await CREATE_ROOM(body);
    } else if (request.method === "DELETE") {
      return await DELETE_ROOM(url);
    } else if (request.method === "GET") {
      const roomID = url.pathname.split("/").pop();
      console.log(roomID);
      return await getRoomById(roomID);
    }
  }

  //*********************************************
  // friends list
  //*********************************************
  else if (workingPathname.startsWith(API.FRIEND_BASE)) {
    workingPathname = url.pathname.replace(API.FRIEND_BASE, "");
    if (workingPathname.startsWith(API.ADD_FRIEND) && request.method === "POST")
      ADD_FRIEND(body);
    else if (
      workingPathname.startsWith(API.ACCEPT_FRIEND) &&
      request.method === "PATCH"
    )
      ACCEPT_PENDING_FRIEND(body);
    else if (
      workingPathname.startsWith(API.GET_FRIENDS_LIST) &&
      request.method === "GET"
    )
      GET_FRIENDS_LIST(url);
    else if (
      workingPathname.startsWith(API.REMOVE_FRIEND) &&
      request.method === "DELETE"
    )
      REMOVE_FRIEND(body);
  }

  //*********************************************
  // gemini api
  //*********************************************
  if (workingPathname.startsWith(API.CALL_GEMINI) && request.method === "POST")
    return await CALL_GEMINI(body);

  return new Response("Not Found", { status: 404 });
}

/*
  Begin API Helper functions
*/
async function LOGIN(body: string | null): Promise<Response> {
  try {
    if (!body) {
      return new Response("Missing request body", { status: 400 });
    }
    const { username, password } = JSON.parse(body);
    const user = await getUser({ username, password });
    if (!user) {
      return new Response("Invalid username or password.", { status: 401 });
    }
    // Don't include password in JWT or response
    const token = await signJwt({ username: user.username });
    return new Response(JSON.stringify({ token, user }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Login error:", err);
    return new Response("Login failed", { status: 500 });
  }
}
async function REGISTER(body: string | null): Promise<Response> {
  try {
    if (!body) {
      return new Response("Missing request body", { status: 400 });
    }
    console.log("Registering user with body:", body);
    const user: User = JSON.parse(body);
    await newUser(user);
    return new Response("Successfully registered user", { status: 201 });
  } catch (err) {
    console.error("Error registering user:", err);
    if (typeof err === "string" && err.includes("already exists")) {
      return new Response(err, { status: 409 });
    }
    if (err instanceof Error && err.message.includes("already exists")) {
      return new Response(err.message, { status: 409 });
    }
    return new Response(
      err instanceof Error ? err.message : "Error registering user",
      { status: 500 },
    );
  }
}

async function API_GET_USER(request: Request): Promise<Response> {
  try {
    const auth = request.headers.get("Authorization");
    console.log(`[GET_USER] Request received. Authorization:`, auth);
    if (!auth || !auth.startsWith("Bearer ")) {
      console.log("[GET_USER] Missing or invalid Authorization header");
      return new Response("Missing or invalid Authorization header", {
        status: 401,
      });
    }
    const token = auth.replace("Bearer ", "");
    const payload = await verifyJwt(token);
    console.log(`[GET_USER] Token payload:`, payload);
    if (!payload || !payload.username) {
      console.log("[GET_USER] Invalid or expired token");
      return new Response("Invalid or expired token", { status: 401 });
    }
    const found = await getUser({ username: payload.username } as User);
    console.log(
      `[GET_USER] DB lookup for username: ${payload.username} result:`,
      found,
    );
    if (found) {
      return new Response(JSON.stringify(found), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      console.log("[GET_USER] User not found");
      return new Response("User not found.", { status: 404 });
    }
  } catch (err) {
    console.error("[GET_USER] Error verifying token: ", err);
    return new Response("Invalid token.", { status: 401 });
  }
}
async function GET_THEME(url: URL): Promise<Response> {
  try {
    const username = url.searchParams.get("username");
    if (!username) {
      return new Response("Missing username query parameter", {
        status: 400,
      });
    }
    const user: User = { username }; // Email is not needed for theme retrieval
    const found = await getUser(user);
    if (found) {
      return new Response(JSON.stringify({ theme: found.theme }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response("User not found.", { status: 404 });
    }
  } catch (err) {
    console.error("Error retrieving theme: ", err);
    return new Response("Error retrieving theme", { status: 500 });
  }
}
async function LEAVE_ROOM(request: Request, url: URL, body: string | null) {
  try {
    const bodyText = body || (await request.text());
    if (!bodyText) {
      return new Response("Missing request body", { status: 400 });
    }
    const { username } = JSON.parse(bodyText);
    const pathParts = url.pathname.split("/");
    const roomID = pathParts[pathParts.length - 2];
    if (!roomID || !username) {
      return new Response("Missing roomID or username", { status: 400 });
    }
    const uri = Bun.env.CONNECTION_STRING || "";
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const rooms = client.db(Bun.env.DB_NAME).collection(ROOM_DB);
      const users = client.db(Bun.env.DB_NAME).collection(USER_DB);
      // Remove user from room's members array
      await rooms.updateOne({ roomID }, { $pull: { members: username } });
      // Remove room from user's joinedLobbies array
      await users.updateOne(
        { username },
        { $pull: { joinedLobbies: roomID as any } },
      );
      return new Response("User removed from room and user's joined lobbies", {
        status: 200,
      });
    } finally {
      await client.close();
    }
  } catch (err) {
    console.error("Error removing member from room:", err);
    return new Response("Error removing member from room", { status: 500 });
  }
}

async function ADD_TO_ROOM(url: URL, body: string | null) {
  console.log(
    `Adding member to room ${url.pathname.replace(API.ROOM_BASE, "").replace(API.ADD_TO_ROOM, "")} with body:`,
    body,
  );
  try {
    if (!body) {
      return new Response("Missing request body", { status: 400 });
    }
    const { username, password } = JSON.parse(body);
    const roomID = url.pathname.split("/")[url.pathname.split("/").length - 2];
    if (!roomID || !username) {
      return new Response("Missing roomID or username", { status: 400 });
    }
    const uri = Bun.env.CONNECTION_STRING || "";
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const rooms = client.db(Bun.env.DB_NAME).collection(ROOM_DB);
      const users = client.db(Bun.env.DB_NAME).collection(USER_DB);
      const room = await rooms.findOne({ roomID });
      if (!room) return new Response("Room not found", { status: 404 });

      // Password check
      if (room.password) {
        if (!password) {
          return new Response("Password required", { status: 401 });
        }
        const passwordMatch = await bcrypt.compare(password, room.password);
        if (!passwordMatch) {
          return new Response("Invalid password", { status: 401 });
        }
      }

      // Add user to room's members array if not present
      const updateResult = await rooms.updateOne(
        { roomID },
        { $addToSet: { members: username } },
      );
      // Add room to user's joinedLobbies if not present
      await users.updateOne(
        { username },
        { $addToSet: { joinedLobbies: roomID } },
      );
      if (updateResult.modifiedCount > 0) {
        return new Response("User added to room", { status: 200 });
      } else {
        return new Response("User already in room", { status: 200 });
      }
    } finally {
      await client.close();
    }
  } catch (err) {
    console.error("Error adding member to room:", err);
    return new Response("Error adding member to room", { status: 500 });
  }
}

async function DELETE_ROOM(url: URL) {
  try {
    const pathParts = url.pathname.split("/");
    const roomID = pathParts[pathParts.length - 1];
    if (!roomID) {
      return new Response("Missing roomID", { status: 400 });
    }
    const uri = Bun.env.CONNECTION_STRING || "";
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const rooms = client.db(Bun.env.DB_NAME).collection(ROOM_DB);
      const users = client.db(Bun.env.DB_NAME).collection(USER_DB);
      // Delete the room
      await rooms.deleteOne({ roomID });
      // Remove roomID from all users' ownedLobbies and joinedLobbies
      await users.updateMany(
        {},
        {
          $pull: {
            ownedLobbies: roomID as any,
            joinedLobbies: roomID as any,
          },
        },
      );
      return new Response("Room deleted and removed from all users", {
        status: 200,
      });
    } finally {
      await client.close();
    }
  } catch (err) {
    console.error("Error deleting room:", err);
    return new Response("Error deleting room", { status: 500 });
  }
}

async function CREATE_ROOM(body: string | null) {
  try {
    if (!body) {
      return new Response("Missing request body", { status: 400 });
    }
    const room: Partial<Room> = JSON.parse(body);
    const roomID = await createRoom(room);
    return new Response(JSON.stringify({ roomID }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error creating room:", err);
    return new Response(
      err instanceof Error ? err.message : "Error creating room",
      { status: 500 },
    );
  }
}

async function ADD_FRIEND(body: string | null): Promise<Response> {
  try {
    if (!body) {
      return new Response("Missing request body", { status: 400 });
    }
    const {
      currentUser,
      targetFriend,
    }: { currentUser: User; targetFriend: User } = JSON.parse(body);

    if (!currentUser || !currentUser.username || !targetFriend) {
      return new Response("Missing currentUser or targetUsername", {
        status: 400,
      });
    }

    await addFriend(currentUser, targetFriend);
    return new Response(JSON.stringify({ message: "Friend request sent" }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error adding friend:", err);
    return new Response(
      err instanceof Error ? err.message : "Error adding friend",
      { status: 500 },
    );
  }
}

async function ACCEPT_PENDING_FRIEND(body: string | null): Promise<Response> {
  try {
    if (!body) {
      return new Response("Missing request body", { status: 400 });
    }
    const { user, friendUsername }: { user: User; friendUsername: string } =
      JSON.parse(body);

    if (!user || !user.username || !friendUsername) {
      return new Response("Missing user or friendUsername", { status: 400 });
    }

    await acceptFriend(user, friendUsername);
    return new Response(JSON.stringify({ message: "Friendship accepted" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error accepting friend:", err);
    return new Response(
      err instanceof Error ? err.message : "Error accepting friend",
      { status: 500 },
    );
  }
}

async function GET_FRIENDS_LIST(url: URL): Promise<Response> {
  try {
    const username = url.searchParams.get("username");
    if (!username) {
      return new Response("Missing username query parameter", {
        status: 400,
      });
    }

    const user: User = { username };
    const friends = await getFriendsList(user);

    if (friends === null) {
      return new Response("User not found", { status: 404 });
    }

    return new Response(JSON.stringify({ friends }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error retrieving friends list:", err);
    return new Response("Error retrieving friends list", { status: 500 });
  }
}

async function REMOVE_FRIEND(body: string | null): Promise<Response> {
  try {
    if (!body) {
      return new Response("Missing request body", { status: 400 });
    }

    const { user, friendUsername }: { user: User; friendUsername: string } =
      JSON.parse(body);

    if (!user || !user.username || !friendUsername) {
      return new Response("Missing user or friendUsername", { status: 400 });
    }

    await removeFriend(user, friendUsername);
    return new Response(JSON.stringify({ message: "Friend removed" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error removing friend:", err);
    return new Response(
      err instanceof Error ? err.message : "Error removing friend",
      { status: 500 },
    );
  }
}
async function CALL_GEMINI(body: string | null): Promise<Response> {
  try {
    if (!body) {
      return new Response("Missing request body", { status: 400 });
    }
    const prompt: GeminiRequest = JSON.parse(body);
    const geminiText = await callGemini(prompt);
    return new Response(geminiText, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error calling gemini ai:", err);
    return new Response(
      err instanceof Error ? err.message : "Error calling gemini ai",
      { status: 500 },
    );
  }
}

/*
  END API Helper functions, BEGIN database interaction functions
*/

async function addFriend(currentUser: User, targetFriend: User) {
  const uri = Bun.env.CONNECTION_STRING || "";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const users = client.db(Bun.env.DB_NAME).collection(USER_DB);
    // Find current user by username only
    const resultCurrent = await users.findOne({
      username: currentUser.username,
    });
    const resultTarget = await users.findOne({
      username: targetFriend.username,
    });
    console.log("MongoDB user document:", resultCurrent);
    if (!resultCurrent || !resultTarget) {
      return null;
    }
    // If password is provided, check it (for login)
    if (currentUser.password) {
      const passwordMatch = await bcrypt.compare(
        currentUser.password,
        resultCurrent.password,
      );
      if (!passwordMatch) {
        return null;
      }
    }

    await users.updateOne(
      { username: resultCurrent.username },
      {
        $addToSet: {
          friends: targetFriend.username,
          status: "pending",
        },
      },
    );
    await users.updateOne(
      { username: resultTarget.username },
      {
        $addToSet: {
          friends: currentUser.username,
          status: "pending",
        },
      },
    );
  } catch (err) {
    console.error(err);
    return null;
  } finally {
    await client.close();
  }
}

async function acceptFriend(user: User, friendUsername: string) {
  const uri = Bun.env.CONNECTION_STRING || "";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const users = client.db(Bun.env.DB_NAME).collection(USER_DB);

    const resultCurrent = await users.findOne({ username: user.username });
    const resultTarget = await users.findOne({ username: friendUsername });

    console.log("Current user document:", resultCurrent);
    console.log("Target user document:", resultTarget);

    if (!resultCurrent || !resultTarget) {
      throw new Error("One or both users not found");
    }

    // Update friendship status to accepted for both users
    await users.updateOne(
      { username: user.username, "friends.username": friendUsername },
      { $set: { "friends.$.status": "accepted" } },
    );

    await users.updateOne(
      { username: friendUsername, "friends.username": user.username },
      { $set: { "friends.$.status": "accepted" } },
    );

    console.log(
      `Friendship between ${user.username} and ${friendUsername} accepted`,
    );
    return true;
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    await client.close();
  }
}

async function getFriendsList(user: User): Promise<Friendship[] | null> {
  const uri = Bun.env.CONNECTION_STRING || "";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const users = client.db(Bun.env.DB_NAME).collection(USER_DB);

    const result = await users.findOne({ username: user.username });
    console.log("MongoDB user document:", result);

    if (!result) {
      return null;
    }

    return result.friends || [];
  } catch (err) {
    console.error(err);
    return null;
  } finally {
    await client.close();
  }
}

async function removeFriend(user: User, friendUsername: string) {
  const uri = Bun.env.CONNECTION_STRING || "";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const users = client.db(Bun.env.DB_NAME).collection(USER_DB);

    // Remove friend from current user's friends list
    await users.updateOne(
      { username: user.username },
      { $pull: { friends: { username: friendUsername } as any } },
    );

    // Remove current user from friend's friends list
    await users.updateOne(
      { username: friendUsername },
      { $pull: { friends: { username: user.username } as any } },
    );

    console.log(
      `Removed friendship between ${user.username} and ${friendUsername}`,
    );
    return true;
  } catch (err) {
    console.error("Error removing friend:", err);
    throw err;
  } finally {
    await client.close();
  }
}

async function newUser(user: User) {
  const uri = Bun.env.CONNECTION_STRING || "";
  console.log(uri);
  const client = new MongoClient(uri);
  try {
    const users = client.db(Bun.env.DB_NAME).collection(USER_DB);
    await client.connect();
    console.log("Connected to MongoDB, checking for existing user...");
    const existingUser = await users.findOne({ username: user.username });
    if (existingUser) {
      throw new Error(`Username is taken.`);
    }
    console.log("No existing user found, hashing password...");
    if (!user.password)
      throw new Error("Password is required for registration.");
    const hashedPassword = await bcrypt.hash(user.password, 12);
    console.log("Password hashed, inserting new user...");
    const result = await users.insertOne({
      username: user.username,
      password: hashedPassword,
      email: user.email,
      theme: user.theme || "default",
    });
    console.log(`New user created with the following id: ${result.insertedId}`);
  } catch (err) {
    console.error("Error with MongoDB:", err);
    throw err;
  } finally {
    await client.close();
  }
}

async function getUser(user: User) {
  const uri = Bun.env.CONNECTION_STRING || "";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const users = client.db(Bun.env.DB_NAME).collection(USER_DB);
    // Find user by username only
    const result = await users.findOne({ username: user.username });
    console.log("MongoDB user document:", result);
    if (!result) {
      return null;
    }
    // If password is provided, check it (for login)
    if (user.password) {
      const passwordMatch = await bcrypt.compare(
        user.password,
        result.password,
      );
      if (!passwordMatch) {
        return null;
      }
    }
    // Remove password from returned user object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userData } = result;
    return userData as unknown as User;
  } catch (err) {
    console.error(err);
    return null;
  } finally {
    await client.close();
  }
}

async function CHANGE_THEME(body: string | null) {
  try {
    if (!body) {
      return new Response("Missing request body", { status: 400 });
    }

    const user: User = JSON.parse(body);
    const uri = Bun.env.CONNECTION_STRING || "";
    const client = new MongoClient(uri);

    const users = client.db(Bun.env.DB_NAME).collection(USER_DB);
    await client.connect();
    const result = await users.updateOne(
      { username: user.username },
      { $set: { theme: user.theme } },
    );

    if (!result) throw `No user found for the following id: ${user.username}`;

    if (result.acknowledged) {
      console.log(`Updated user theme to: ${user.theme}`);
    }

    return new Response("Updated theme");
  } catch (err) {
    console.error("Error updating theme: ", err);
    return new Response("Error updating theme", { status: 500 });
  }
}

async function createRoom(room: Partial<Room>): Promise<string> {
  const uri = Bun.env.CONNECTION_STRING || "";
  const client = new MongoClient(uri);
  try {
    const rooms = client.db(Bun.env.DB_NAME).collection(ROOM_DB);
    await client.connect();

    let roomID: string = "";
    let exists = true;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    function genId() {
      let id = "";
      for (let i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return id;
    }
    while (exists) {
      roomID = genId();
      const result = await rooms.findOne({ roomID });
      exists = result !== null;
    }

    const roomToInsert = { ...room, roomID };
    if (room.password) {
      roomToInsert.password = await bcrypt.hash(room.password, 12);
    }
    const result = await rooms.insertOne(roomToInsert);
    console.log(
      `New room created with the following id: ${result.insertedId}, roomID: ${roomID}`,
    );

    if (room.createdBy) {
      const users = client.db(Bun.env.DB_NAME).collection(USER_DB);
      await users.updateOne(
        { username: room.createdBy.username },
        { $addToSet: { ownedLobbies: roomID } },
      );
      console.log(
        `Added roomID: ${roomID} to user: ${room.createdBy.username}'s ownedLobbies array`,
      );
    }
    return roomID;
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    await client.close();
  }
}

// Fetch a room by its roomID
async function getRoomById(roomID?: string): Promise<Response> {
  if (!roomID) {
    return new Response("Missing roomID", { status: 400 });
  }
  const uri = Bun.env.CONNECTION_STRING || "";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const rooms = client.db(Bun.env.DB_NAME).collection(ROOM_DB);
    const found = await rooms.findOne({ roomID });
    if (!found) {
      return new Response("Room not found", { status: 404 });
    }
    // Indicate if the room is locked with a password and remove it from response
    found.isLocked = !!found.password;
    if (found.password) delete found.password;
    console.log(`Fetched room with id: ${roomID}`);
    return new Response(JSON.stringify(found), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error fetching room:", err);
    return new Response("Error fetching room", { status: 500 });
  } finally {
    await client.close();
  }
}

async function callGemini(request: GeminiRequest) {
  const sendContents: string =
    SYSTEM_INSTRUCTIONS + "\n\n" + JSON.stringify(request);

  console.log("making request to gemini genai:", sendContents);
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: sendContents,
    });
    console.log(response.text);
    return response.text;
  } catch (err) {
    console.log(err);
    throw err;
  }
}
