import { MongoClient } from 'mongodb';
import { APIEndpoints, USER_DB } from './defines';
import type { User } from '@shared/shared-types';

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
            return new Response("User registered successfully");
        } catch (err) {
            console.error("Error registering user:", err);
            return new Response("Error registering user", { status: 500 });
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
        const result = await users.insertOne({ username: user.username, password: user.password, email: user.email });
        console.log(`New user created with the following id: ${result.insertedId}`);
    }
    catch (err) {
        console.error("Error with MongoDB:", err);
    } finally {
        await client.close();
    }
}