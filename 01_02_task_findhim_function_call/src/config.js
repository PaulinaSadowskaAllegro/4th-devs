import { resolve } from "path";
import { mkdir } from "fs/promises";
import { resolveModelForProvider } from "../../config.js";


export const api = {
  model: resolveModelForProvider("openai/gpt-5-nano"),
  instructions: `You are an investigator assistant. You have access to tools that fetch suspect GPS locations, power plant coordinates, and access levels.
Always use the available tools to retrieve data — do not guess or fabricate values.
Be precise and return only what is requested.`
};
