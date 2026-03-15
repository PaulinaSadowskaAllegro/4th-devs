import http from "http";
import { chatWithAI } from "./chat.js";

const CHAT_PORT = process.env.CHAT_PORT ? parseInt(process.env.CHAT_PORT) : 3002;

const readBody = async (req) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    return JSON.parse(Buffer.concat(chunks).toString());
};

const server = http.createServer(async (req, res) => {
    if (req.method === "POST" && req.url === "/api/chat") {
        const { sessionID, msg } = await readBody(req);

        console.log(`[chat] session=${sessionID} msg="${msg}"`);

        const reply = await chatWithAI(sessionID, msg);

        console.log(`[chat] session=${sessionID} reply="${reply}"`);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ msg: reply }));
        return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
});

server.listen(CHAT_PORT, () => {
    console.log(`[chat] Listening on http://localhost:${CHAT_PORT}/api/chat`);
});

export { server, CHAT_PORT };
