import { server, CHAT_PORT } from "./chatServer.js";
import { checkPackage, redirectPackage } from "./packagesApi.js";

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

    const reply1 = await sendChatMessage(sessionID, "Hello, I need help with a package.");
    console.log("Assistant:", reply1.msg);

    const reply2 = await sendChatMessage(sessionID, "Can you check the status of PKG12345678?");
    console.log("Assistant:", reply2.msg);

    server.close();
};

main().catch(console.error);
