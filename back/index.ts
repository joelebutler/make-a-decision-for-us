import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { USER_DB } from './defines';
import { APIEndpoints, type User } from '@shared/shared-types';

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
            const user: User = JSON.parse(body);
            await newUser(user);
            return new Response("");
        } catch (err) {
            console.error("Error registering user:", err);
            return new Response("Error registering user", { status: 500 });
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

    if (url.pathname == APIEndpoints.UPDATE && request.method === 'PATCH') {
        try {
            if (!body) {
                return new Response("Missing request body", { status: 400 });
            }
            const user: User = JSON.parse(body);
            await updateUser(user);
            return new Response("Updated theme")
        } catch (err) {
            console.error("Error updating theme: ", err);
            return new Response("Error updating theme", { status: 500 });
        }
    }
    
    return new Response("Not Found", { status: 404 });

}

async function newUser(user: User) {
    const uri = Bun.env.CONNECTION_STRING || "";
    const client = new MongoClient(uri);
    try {
        const users = client.db(Bun.env.DB_NAME).collection(USER_DB);
        await client.connect();
        // Hash the password before storing
        if (!user.password) throw "Password is required for registration.";
        const hashedPassword = await bcrypt.hash(user.password, Bun.env.HASH_SALT_ROUNDS ? parseInt(Bun.env.HASH_SALT_ROUNDS) : 10);
        const result = await users.insertOne({ username: user.username, password: hashedPassword, email: user.email, theme: user.theme });
        console.log(`New user created with the following id: ${result.insertedId}`);
    }
    catch (err) {
        console.error("Error with MongoDB:", err);
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

async function updateUser(user: User) {
    const uri = Bun.env.CONNECTION_STRING || "";
    const client = new MongoClient(uri);
    try {
        const users = client.db(Bun.env.DB_NAME).collection(USER_DB)
        await client.connect();
        const result = await users.updateOne({username: user.username}, { theme: user.theme });
        
        if (!result) throw `No user found for the following id: ${user.username}`;
        
        if (result.acknowledged) {
            console.log(`Updated user theme to: ${user.theme}`);
        }
        
    } catch (err) {
        console.log(err);
    }

}