import http from "http";

const PORT = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 3000;

const serverSample = http.createServer(async (req, res) => {
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

serverSample.listen(PORT);

export { serverSample, PORT };
