import { processQuery } from "./src/executor.js";
import { api } from "./src/config.js";
import { tools, handlers } from "./src/tools/index.js";
import { loadFromFile, saveOutput } from "./helpers.js";

const suspectLocationsSchema = {
  type: "json_schema",
  name: "suspect_locations",
  strict: true,
  schema: {
    type: "object",
    properties: {
      suspects: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            surname: { type: "string" },
            locations: { type: "array", items: { type: "object", properties: { lat: { type: "string" }, lon: { type: "string" } }, required: ["lat", "lon"], additionalProperties: false } }
          },
          required: ["name", "surname", "locations"],
          additionalProperties: false
        }
      }
    },
    required: ["suspects"],
    additionalProperties: false
  }
};

const plantCoordsSchema = {
  type: "json_schema",
  name: "plant_coords",
  strict: true,
  schema: {
    type: "object",
    properties: {
      plants: {
        type: "array",
        items: {
          type: "object",
          properties: {
            city: { type: "string" },
            code: { type: "string" },
            lat: { type: "string" },
            lon: { type: "string" }
          },
          required: ["city", "code", "lat", "lon"],
          additionalProperties: false
        }
      }
    },
    required: ["plants"],
    additionalProperties: false
  }
};

const reportSchema = {
  type: "json_schema",
  name: "investigation_report",
  strict: true,
  schema: {
    type: "object",
    properties: {
      name: { type: "string" },
      surname: { type: "string" },
      plant: { type: "string" },
      plantCode: { type: "string" },
      closestDistanceMeters: { type: "number" },
      accessLevel: { type: "string" }
    },
    required: ["name", "surname", "plant", "plantCode", "closestDistanceMeters", "accessLevel"],
    additionalProperties: false
  }
};

const config = {
  model: api.model,
  tools,
  handlers,
  instructions: api.instructions
};

const main = async () => {
  const suspects = loadFromFile("suspects.json").answer;
  const plants = loadFromFile("findhim_locations.json").power_plants;
  
 /* console.log(`Found ${suspects.length} suspects.`);
  console.log(`Found ${Object.keys(plants).length} power plants.`);

  const plantsJson = JSON.stringify(
    Object.entries(plants).map(([city, data]) => ({ city, code: data.code })),
    null, 2
  );
  const suspectsJson = JSON.stringify(
    suspects.map(s => ({ name: s.name, surname: s.surname, born: s.born })),
    null, 2
  );

const step1 = await processQuery(
    `You are an investigator. Call fetchSuspectLocations once with the full "suspects" array below to get recorded GPS coordinates for all suspects.

Suspects: ${suspectsJson}`, { ...config, text: { format: suspectLocationsSchema } });
  saveOutput(step1, "step1_suspect_locations.json");

  // Step 2: fetch GPS coordinates for every power plant city
  const step2 = await processQuery(
    `Call fetchCityCoordinates once with the full "cities" array below to get GPS coordinates for all power plant cities.
Power plants:
${plantsJson}`, { ...config, text: { format: plantCoordsSchema } });
  saveOutput(step2, "step2_plant_coords.json");
*/

const step1 = loadFromFile("step1_suspect_locations.json");
const step2 = loadFromFile("step2_plant_coords.json");
console.log("Step 1 - suspect locations:", JSON.stringify(step1, null, 2));
console.log("Step 2 - plant coordinates:", JSON.stringify(step2, null, 2));

  // Step 3: compare distances, find the closest suspect, fetch their access level
  const step3 = await processQuery(
    `You are an investigator. Using the Haversine formula:
1. Compare suspect locations with plant coordinates to find which suspect was ever closest to any plant.
2. For that one suspect only, call fetchAccessLevel with { name, surname, born }.
3. Return a report: { name, surname, plant, plantCode, closestDistanceMeters, accessLevel }

Suspect locations:
${step1}

Plant coordinates:
${step2}`,
    { ...config, text: { format: reportSchema } }
  );
 // saveOutput(step3, "step3_result.json");
  console.log(`\nFinal result:\n${step3}`);
};

main().catch(console.error);
