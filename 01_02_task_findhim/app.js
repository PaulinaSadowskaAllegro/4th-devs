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
import { fetchAccessLevel, fetchSuspectLocations } from "./locationApi.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const MODEL = resolveModelForProvider("openai/gpt-5-nano");

async function saveOutput(output, filename) {
  const outputPath = join(__dirname, filename);
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

function loadFromFile(filename) {
  const path = join(__dirname, filename);
  const content = readFileSync(path, "utf-8");
  return JSON.parse(content);
}

async function buildSusLocationsFile() {
  const suspects = loadFromFile("suspects.json").answer;
  
  console.log(`Found ${suspects.length} suspects.`);

  const results = await Promise.all(
    suspects.map(async (suspect, index) => {
      console.log(suspect);
      const accessLevel = await fetchAccessLevel(suspect);
      const location = await fetchSuspectLocations(suspect);
      console.log(`Suspect ${index + 1}: ${suspect.name} ${suspect.surname}, access level: ${JSON.stringify(accessLevel)}`);
      return { name: suspect.name, surname: suspect.surname, accessLevel, location };
    })
  );

  saveOutput(results, "susLocations.json");
}

async function main() {
  // buildSusLocationsFile();
  const susLocations = loadFromFile("susLocations.json");
  const locations = loadFromFile("findhim_locations.json").power_plants;
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
