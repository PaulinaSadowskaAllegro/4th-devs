import { server, CHAT_PORT } from "./src/chatServer.js";

const send = async (sessionID, msg) => {
    const res = await fetch(`http://localhost:${CHAT_PORT}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionID, msg }),
    });
    const { msg: reply } = await res.json();
    console.log(`[${sessionID}] 👤 ${msg}`);
    console.log(`[${sessionID}] 🤖 ${reply}\n`);
};

const main = async () => {
    await send("alice", "Hi, where is my package PKG12345678?");
    await send("bob", "Check PKG87654321 for me.");
    await send("alice", "Can you redirect it to PWR6132PL? Code is REDIRECT123.");
    await send("carol", "I need to redirect PKG11111111 to KRK1234PL, code ABC999.");
    await send("bob", "Is it delayed?");
    await send("dave", "What was the last package we discussed?");
    await send("carol", "Did it go through?");
    await send("alice", "What confirmation did you get?");

    server.close();
};

main().catch(console.error);

