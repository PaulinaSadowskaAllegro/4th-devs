import { processQuery } from "./src/executor.js";
import { api } from "./src/config.js";
import { tools, handlers } from "./src/tools/index.js";
import { loadFromFile } from "./helpers.js";

const config = {
  model: api.model,
  tools,
  handlers,
  instructions: api.instructions
};

const queries = [
  ""
];

const main = async () => {
  const suspects = loadFromFile("suspects.json").answer;
  const plants = loadFromFile("findhim_locations.json").power_plants;
  
  console.log(`Found ${suspects.length} suspects.`);
  console.log(`Found ${plants} power plants.`);

 /* for (const query of queries) {
    await processQuery(query, config);
  }*/
};

main().catch(console.error);
