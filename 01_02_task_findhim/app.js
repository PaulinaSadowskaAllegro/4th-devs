import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  AI_API_KEY,
  EXTRA_API_HEADERS,
  RESPONSES_API_ENDPOINT,
  resolveModelForProvider
} from "../config.js";
import { extractResponseText } from "./helpers.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const MODEL = resolveModelForProvider("openai/gpt-5-nano");

async function saveOutput(output) {
  const outputPath = join(__dirname, "output.json");
  writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");
  console.log(`\nOutput saved to ${outputPath}`);
}

async function verify() {
  const output = { task: "findhim", answer: [], apikey: process.env.AI_DEVS_API_KEY };
  console.log(`\n${JSON.stringify(output, null, 2)}`);

  const verifyResponse = await fetch("https://hub.ag3nts.org/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(output)
  });

  const verifyData = await verifyResponse.json();
  console.log(`\nVerify response: ${JSON.stringify(verifyData, null, 2)}`);
}

async function main() {
  const suspectsPath = join(__dirname, "suspects.json");
  const content = readFileSync(suspectsPath, "utf-8");
  const suspects = JSON.parse(content).answer;


  console.log(`Found ${suspects.length} people matching criteria. Classifying in one batch call...`);

  if (suspects.length > 50) {
    console.log("Something sus, please verify!");
    return;
  }

}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
