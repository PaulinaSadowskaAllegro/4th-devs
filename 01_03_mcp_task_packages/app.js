import { server, CHAT_PORT } from "./src/chatServer.js";

const sendChatMessage = async (sessionID, msg) => {
    const res = await fetch(`http://localhost:${CHAT_PORT}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionID, msg }),
    });
    return res.json();
};

const main = async () => {
    const sessionID = "session-001";

    const reply2 = await sendChatMessage(sessionID, "Can you check the status of PKG12345678?");
    console.log("Assistant:", reply2.msg);

    const reply3 = await sendChatMessage(sessionID, "Can you redirect it to 123 New Address St. with code REDIRECT123?");
    console.log("Assistant:", reply3.msg);

    server.close();
};

main().catch(console.error);
