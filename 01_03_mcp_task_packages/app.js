import { resolveModelForProvider } from "../config.js";
import http from "http";

const model = resolveModelForProvider("gpt-5-nano");

const PORT = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 3000;

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    if (req.method === "POST" && url.pathname === "/test-post/") {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const body = JSON.parse(Buffer.concat(chunks).toString());
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Hello world", your_data: body }));
        return;
    }
    if (req.method === "GET" && url.pathname === "/") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Hello world");
        return;
    }
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
});

server.listen(PORT);

const main = async () => {
   console.log(`Listening on http://localhost:${PORT}`);

   // Test GET /
   const getRes = await fetch(`http://localhost:${PORT}/`);
   console.log(`GET /  → ${getRes.status}`, await getRes.text());

   // Test POST /test-post/
   const postRes = await fetch(`http://localhost:${PORT}/test-post/`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ hello: "world" }),
   });
   console.log(`POST /test-post/  → ${postRes.status}`, await postRes.json());

  // server.close();
};

main().catch(console.error);
