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

const closestSuspectSchema = {
  type: "json_schema",
  name: "closest_suspect",
  strict: true,
  schema: {
    type: "object",
    properties: {
      name: { type: "string" },
      surname: { type: "string" },
      plant: { type: "string" },
      plantCode: { type: "string" },
      closestDistanceMeters: { type: "number" }
    },
    required: ["name", "surname", "plant", "plantCode", "closestDistanceMeters"],
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
  
  console.log(`Found ${suspects.length} suspects.`);
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

  // Step 3a: find the closest suspect to any plant
  const step3a = await processQuery(
    `You are an investigator. You have suspect GPS locations and power plant GPS coordinates.
Calculate which suspect was ever geographically closest to any power plant using precise spherical earth distance calculation.
Return the result with the suspect's name, surname, nearest plant and distance.

Suspect locations:
${JSON.stringify(step1, null, 2)}

Plant coordinates:
${JSON.stringify(step2, null, 2)}`,
    { ...config, text: { format: closestSuspectSchema } }
  );
  saveOutput(step3a, "step3a_closest_suspect.json");
  console.log(`\nClosest suspect:\n${step3a}`);

  const closest = typeof step3a === "string" ? JSON.parse(step3a) : step3a;
  const suspectData = suspects.find(s => s.name === closest.name && s.surname === closest.surname);

  // Step 3b: fetch access level for the identified suspect
  const step3b = await processQuery(
    `You are an investigator. You have identified the suspect closest to a power plant.
Call fetchAccessLevel to retrieve their access level.

Suspect: ${JSON.stringify({ name: closest.name, surname: closest.surname, born: suspectData?.born })}`,
    { ...config, text: { format: reportSchema } }
  );
  saveOutput(step3b, "step3b_result.json");
  console.log(`\nFinal result:\n${step3b}`);
};

main().catch(console.error);
