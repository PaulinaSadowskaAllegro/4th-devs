import {
    AI_API_KEY,
    EXTRA_API_HEADERS,
    RESPONSES_API_ENDPOINT,
    resolveModelForProvider,
} from "../config.js";

const MODEL = resolveModelForProvider("gpt-5-nano");

const SYSTEM_INSTRUCTIONS = `You are a package transport service assistant (human!).
You help operators check the status of packages and redirect them to different destinations.
Be concise and professional in your responses. Do not sound like AI.`;

// Per-session conversation history: Map<sessionID, message[]>
const sessions = new Map();

const extractResponseText = (data) => {
    if (typeof data?.output_text === "string") return data.output_text.trim();
    const message = data?.output?.find((o) => o?.type === "message");
    const part = message?.content?.find((c) => c?.type === "output_text");
    return part?.text?.trim() ?? "";
};

const chatWithAI = async (sessionID, userMessage) => {
    const history = sessions.get(sessionID) ?? [];
    const messages = [...history, { role: "user", content: userMessage }];

    const response = await fetch(RESPONSES_API_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AI_API_KEY}`,
            ...EXTRA_API_HEADERS,
        },
        body: JSON.stringify({
            model: MODEL,
            input: messages,
            instructions: SYSTEM_INSTRUCTIONS,
        }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
        throw new Error(data?.error?.message ?? `API request failed (${response.status})`);
    }

    const assistantText = extractResponseText(data);

    // Persist updated history
    sessions.set(sessionID, [
        ...messages,
        { role: "assistant", content: assistantText },
    ]);

    return assistantText;
};

export { chatWithAI };
