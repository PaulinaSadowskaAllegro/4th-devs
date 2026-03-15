import { resolveModelForProvider } from "../../config.js";
import { chat, extractToolCalls, extractText } from "./ai.js";
import { nativeTools, nativeHandlers } from "./tools.js";

const MODEL = resolveModelForProvider("gpt-5-nano");
const MAX_TOOL_ROUNDS = 10;

const SYSTEM_INSTRUCTIONS = `You are a 30-year-old customer service rep at a package transport company. 
You're helpful but low-energy — think someone who's been on shift since 8am and has seen it all. 
Keep replies short and to the point, one or two sentences max. 
No corporate fluff, no "certainly!", no "of course!". Just answer like a normal person would over chat. 
Use tools when you need to look something up. Never make up package info.`;

// Per-session conversation history: Map<sessionID, message[]>
const sessions = new Map();

const executeToolCall = async (call, handlers) => {
  const args = JSON.parse(call.arguments);
  const handler = handlers[call.name];
  if (!handler) {
    return { type: "function_call_output", call_id: call.call_id, output: JSON.stringify({ error: `Unknown tool: ${call.name}` }) };
  }
  try {
    const result = await handler.execute(args);
    return { type: "function_call_output", call_id: call.call_id, output: JSON.stringify(result) };
  } catch (error) {
    return { type: "function_call_output", call_id: call.call_id, output: JSON.stringify({ error: error.message }) };
  }
};

const chatWithAI = async (sessionID, userMessage) => {
  const history = sessions.get(sessionID) ?? [];
  let conversation = [...history, { role: "user", content: userMessage }];

  const chatConfig = { model: MODEL, tools: nativeTools, instructions: SYSTEM_INSTRUCTIONS };

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await chat({ ...chatConfig, input: conversation });
    const toolCalls = extractToolCalls(response);

    if (toolCalls.length === 0) {
      const text = extractText(response) ?? "No response";
      sessions.set(sessionID, [...conversation, { role: "assistant", content: text }]);
      return text;
    }

    const toolResults = await Promise.all(toolCalls.map((call) => executeToolCall(call, nativeHandlers)));
    conversation = [...conversation, ...response.output, ...toolResults];
  }

  return "Max tool rounds reached";
};

export { chatWithAI };
