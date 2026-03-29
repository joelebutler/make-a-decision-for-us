import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { ROOM_DB, USER_DB } from './defines';
import { APIEndpoints, type Room, type User } from '@shared/shared-types';

Bun.serve({
    port: Bun.env.PORT,
    async fetch(req) {
        console.log("Received request:", req.method, req.url);
        const url = new URL(req.url);

        if (url.pathname.startsWith('/api/') || url.pathname === '/api') {
            return await Route(req, url);
        }

        const filePath = `../front/dist${url.pathname === '/' ?     '/index.html' : url.pathname}`;
        try {
            const file = Bun.file(filePath);
            if (await file.exists())
                return new Response(file)
        
        } catch (e) {
            console.error("Error serving file, falling back to index:", e);
        }
        return new Response(Bun.file('../front/dist/index.html'));
    }
})

async function Route(request: Request, url: URL): Promise<Response> {
    const body = await request.text();
    if (url.pathname == APIEndpoints.REGISTER && request.method === 'POST') {
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
            return new Response((err instanceof Error ? err.message : "Error registering user"), { status: 500 });
        }
    }

    if (url.pathname == APIEndpoints.GET_USER && request.method === 'POST') {
        try {
            if (!body) {
                return new Response("Missing request body", { status: 400 });
            }
            const user: User = JSON.parse(body);
            const found = await getUser(user);
            if (found) {
                // Return user data as JSON
                return new Response(JSON.stringify(found), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            } else {
                return new Response("Invalid username or password.", { status: 404 });
            }
        } catch (err) {
            console.error("Error finding user: ", err);
            return new Response("Invalid username or password.", { status: 404 });
        }
    }

    if (url.pathname == APIEndpoints.CHANGE_THEME && request.method === 'PATCH') {
        try {
            if (!body) {
                return new Response("Missing request body", { status: 400 });
            }
            const user: User = JSON.parse(body);
            await updateTheme(user);
            return new Response("Updated theme")
        } catch (err) {
            console.error("Error updating theme: ", err);
            return new Response("Error updating theme", { status: 500 });
        }
    }

    if (url.pathname == APIEndpoints.GET_THEME && request.method === 'GET') {
        try {
            const username = url.searchParams.get("username");
            if (!username) {
                return new Response("Missing username query parameter", { status: 400 });
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
    
    // GET /api/room/:id - fetch a room by roomId
    if (url.pathname.startsWith(APIEndpoints.ROOM_BASE) && request.method === 'GET') {
        const roomId = url.pathname.split('/').pop();
        return await getRoomById(roomId);
    }

    if (url.pathname == APIEndpoints.CREATE_ROOM && request.method === 'POST') {
        try {
            if (!body) {
                return new Response("Missing request body", { status: 400 });
            }
            const room: Partial<Room> = JSON.parse(body);
            const roomId = await createRoom(room);
            return new Response(JSON.stringify({ roomId }), {
                status: 201,
                headers: { "Content-Type": "application/json" },
            });
        } catch (err) {
            console.error("Error creating room:", err);
            return new Response((err instanceof Error ? err.message : "Error creating room"), { status: 500 });
        }
    }
    
    return new Response("Not Found", { status: 404 });

}

async function newUser(user: User) {
    const uri = Bun.env.CONNECTION_STRING || "";
    console.log(uri)
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
        if (!user.password) throw new Error("Password is required for registration.");
        const hashedPassword = await bcrypt.hash(user.password, 12);
        console.log("Password hashed, inserting new user...");
        const result = await users.insertOne({ username: user.username, password: hashedPassword, email: user.email, theme: user.theme || "default" });
        console.log(`New user created with the following id: ${result.insertedId}`);
    }
    catch (err) {
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
        if (!result) {
            return null;
        }
        if (!user.password) throw "Password is required for login.";
        // Compare password hash
        const passwordMatch = await bcrypt.compare(user.password, result.password);
        if (!passwordMatch) {
            return null;
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

async function updateTheme(user: User) {
    const uri = Bun.env.CONNECTION_STRING || "";
    const client = new MongoClient(uri);
    try {
        const users = client.db(Bun.env.DB_NAME).collection(USER_DB)
        await client.connect();
        const result = await users.updateOne({ username: user.username }, { $set: { theme: user.theme } });
        
        if (!result) throw `No user found for the following id: ${user.username}`;
        
        if (result.acknowledged) {
            console.log(`Updated user theme to: ${user.theme}`);
        }
        
    } catch (err) {
        console.log(err);
    }
}

async function createRoom(room: Partial<Room>): Promise<string> {
    const uri = Bun.env.CONNECTION_STRING || "";
    const client = new MongoClient(uri);
    try {
        const rooms = client.db(Bun.env.DB_NAME).collection(ROOM_DB);
        await client.connect();

        let roomId: string = "";
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
            roomId = genId();
            const result = await rooms.findOne({ roomId });
            exists = result !== null;
        }

        const roomToInsert = { ...room, roomId };
        if (room.password) {
            roomToInsert.password = await bcrypt.hash(room.password, 12);
        }
        const result = await rooms.insertOne(roomToInsert);
        console.log(`New room created with the following id: ${result.insertedId}, roomId: ${roomId}`);

        if (room.createdBy) {
            const users = client.db(Bun.env.DB_NAME).collection(USER_DB);
            await users.updateOne(
                { username: room.createdBy.username },
                { $addToSet: { ownedRooms: roomId } }
            );
            console.log(`Added roomId: ${roomId} to user: ${room.createdBy.username}'s ownedRooms array`);
        }
        return roomId;
    } catch (err) {
        console.error(err);
        throw err
    } finally {
        await client.close();
    }
}

    // Fetch a room by its roomId
    async function getRoomById(roomId?: string): Promise<Response> {
        if (!roomId) {
            return new Response("Missing roomId", { status: 400 });
        }
        const uri = Bun.env.CONNECTION_STRING || "";
        const client = new MongoClient(uri);
        try {
            await client.connect();
            const rooms = client.db(Bun.env.DB_NAME).collection(ROOM_DB);
            const found = await rooms.findOne({ roomId });
            if (!found) {
                return new Response("Room not found", { status: 404 });
            }
            // Remove password from response
            if (found.password) delete found.password;
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