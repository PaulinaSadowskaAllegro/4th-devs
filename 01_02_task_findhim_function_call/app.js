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
import { fetchAccessLevel, fetchSuspectLocations, fetchCityCoordinates } from "./locationApi.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const MODEL = resolveModelForProvider("openai/gpt-5-nano");

async function saveOutput(output, filename) {
  const outputPath = join(__dirname, filename);
  writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");
  console.log(`\nOutput saved to ${outputPath}`);
}

async function extractIfSuspectWasNearPlant(text) {
  const response = await fetch(RESPONSES_API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${AI_API_KEY}`,
      ...EXTRA_API_HEADERS
    },
    body: JSON.stringify({
      model: MODEL,
      input: `You are given a suspect's recorded GPS coordinates and a list of power plant locations (also as GPS coordinates).

Your task:
1. For each of the suspect's recorded locations, calculate the distance to every power plant using the Haversine formula to account for Earth's curvature.
2. Find the single closest power plant across all recorded locations.
3. Set "decision" to true if the suspect was ever within 5 km of any power plant, otherwise false.
4. Set "closest" to the shortest distance (in meters) between any of the suspect's locations and any power plant.
5. Set "closestPlant" to the name of the power plant that was closest to any of the suspect's locations.

Input data (JSON): ${text}`,
      text: { format: plantSchema }
    })
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    const message = data?.error?.message ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  const outputText = extractResponseText(data);

  if (!outputText) {
    throw new Error("Missing text output in API response");
  }

  return JSON.parse(outputText);
}

const plantSchema = {
  type: "json_schema",
  name: "plant_location_closeness",
  strict: true,
  schema: {
    type: "object",
    properties: {
      decision: {
        type: "boolean",
        description: "True if the suspect was ever within 5 km of any power plant, otherwise false."
      },
      closest: {
        type: ["number", "null"],
        description: "Distance in meters to the closest power plant across all of the suspect's recorded locations. Use null if unclear."
      },
      closestPlant: {
        type: ["string", "null"],
        description: "Name of the power plant that was closest to any of the suspect's recorded locations. Use null if unclear."
      }
    },
    required: ["decision", "closest", "closestPlant"],
    additionalProperties: false
  }
};


async function verify(answer) {
  const output = { task: "findhim", answer: answer, apikey: process.env.AI_DEVS_API_KEY };
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

async function buildPlantLocationsFile(locations) {
  const cityCoords = await Promise.all(
    Object.keys(locations).map(async (city) => {
      const [result] = await fetchCityCoordinates(city);
      return { city, lat: result?.lat, lon: result?.lon };
    })
  );
  console.log("City coordinates:", JSON.stringify(cityCoords, null, 2));
  await saveOutput(cityCoords, "city_coords.json");
}

async function main() {
  // buildSusLocationsFile();
  // buildPlantLocationsFile(locations);
 /* const susLocations = loadFromFile("susLocations.json");
  const plants = loadFromFile("findhim_locations.json").power_plants;
  const locations = loadFromFile("city_coords.json");

  const decisions = await Promise.all(
    susLocations.map(async (suspect) => {
      const input = { suspect, plantsLocations: locations };
      const decision = await extractIfSuspectWasNearPlant(JSON.stringify(input));
      return { name: suspect.name, surname: suspect.surname, ...decision };
    })
  );

  console.log(`\nFinal decisions: ${JSON.stringify(decisions, null, 2)}`);

  await saveOutput(decisions, "final_decisions.json");*/

  const suspect = loadFromFile("final_decisions.json");
  const plants = loadFromFile("findhim_locations.json").power_plants;
  const answer = {
    "name": suspect.name,
    "surname": suspect.surname,
    "accessLevel": "7",
    "powerPlant": plants[suspect.closestPlant],
  };

  console.log(`\nAnswer: ${JSON.stringify(answer, null, 2)}`);

  verify(answer);
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
