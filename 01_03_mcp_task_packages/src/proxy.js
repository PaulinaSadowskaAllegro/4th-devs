import http from "http";

const PACKAGES_API = "https://hub.ag3nts.org/api/packages";
const PROXY_PORT = process.env.PROXY_PORT ? parseInt(process.env.PROXY_PORT) : 3000;

const readBody = async (req) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    return JSON.parse(Buffer.concat(chunks).toString());
};

const forwardToApi = async (payload) => {
    const upstream = await fetch(PACKAGES_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return { status: upstream.status, text: await upstream.text() };
};

const server = http.createServer(async (req, res) => {
    if (req.method === "POST" && req.url === "/api/packages") {
        const body = await readBody(req);
        const { apikey, action, packageid, destination, code } = body;

        if (action === "check") {
            console.log("[proxy] check →", { packageid });
            const { status, text } = await forwardToApi({ apikey, action: "check", packageid });
            console.log("[proxy] check response:", text);
            res.writeHead(status, { "Content-Type": "application/json" });
            res.end(text);
            return;
        }

        if (action === "redirect") {
            console.log("[proxy] redirect →", { packageid, destination });
            const { status, text } = await forwardToApi({ apikey, action: "redirect", packageid, destination, code });
            console.log("[proxy] redirect response:", text);
            res.writeHead(status, { "Content-Type": "application/json" });
            res.end(text);
            return;
        }

        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: `Unknown action: ${action}` }));
        return;
    }

    console.log("[proxy] Unknown request:", req.method, req.url);

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
});

export { server, PROXY_PORT };

