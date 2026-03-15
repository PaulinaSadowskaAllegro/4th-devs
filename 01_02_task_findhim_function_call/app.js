import { processQuery } from "./src/executor.js";
import { api } from "./src/config.js";
import { tools, handlers } from "./src/tools/index.js";
import { loadFromFile, saveOutput } from "./helpers.js";

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

  const plantsJson = JSON.stringify(
    Object.entries(plants).map(([city, data]) => ({ city, code: data.code })),
    null, 2
  );
  const suspectsJson = JSON.stringify(
    suspects.map(s => ({ name: s.name, surname: s.surname, born: s.born })),
    null, 2
  );

  const result = await processQuery(
    `You are an investigator. Follow these steps in order:

1. Call fetchSuspectLocations with the full suspects array to get GPS locations for all suspects.
2. Call fetchCityCoordinates with the full cities array to get GPS coordinates for all power plant cities.
3. Call the distance-calculation tool with the suspect locations and plant coordinates to find the suspect who was ever closest to any plant.
4. Call fetchAccessLevel for that one suspect (use their name, surname, and born year from the suspects list below).
5. Return the final report.

Suspects (name, surname, born):
${suspectsJson}

Power plants (city, code):
${plantsJson}`,
    { ...config, text: { format: reportSchema } }
  );
  saveOutput(result, "result.json");
  console.log(`\nFinal result:\n${result}`);
};

main().catch(console.error);
