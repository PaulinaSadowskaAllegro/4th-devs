import { processQuery } from "./src/executor.js";
import { api } from "./src/config.js";
import { tools, handlers } from "./src/tools/index.js";
import { loadFromFile, saveOutput } from "./helpers.js";

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

  // Step 1: fetch GPS coordinates for every suspect
  const result = await processQuery(
    `You are an investigator trying to identify which suspect visited a power plant.

You have the following data:

SUSPECTS (name, surname, born):
${suspectsJson}

POWER PLANTS (city, plant code in format PWR0000PL):
${plantsJson}

Follow these steps in order:

STEP 1 — Call fetchSuspectLocations once with the full list of suspects as the "suspects" array. It returns an array of { name, surname, locations } for each person.

STEP 2 — Call fetchCityCoordinates once with the full list of power plants as the "cities" array (each item has "city" and "code"). It returns an array of { city, code, lat, lon }.

STEP 3 — Using the Haversine formula, calculate the distance (in meters) between each suspect's recorded locations and each power plant. Find the single suspect who was ever closest to any power plant.

STEP 4 — For that one suspect only, call fetchAccessLevel(name, surname, born) to retrieve their access level.

STEP 5 — Return a JSON report with the following fields:
{
  "name": "<first name>",
  "surname": "<last name>",
  "plant": "<city name of the nearest plant>",
  "plantCode": "<code in format PWR0000PL>",
  "closestDistanceMeters": <number>,
  "accessLevel": "<access level>"
}`,
    config
  );
  saveOutput(result, "result.json");
  console.log(`\nFinal result:\n${result}`);
};

main().catch(console.error);
