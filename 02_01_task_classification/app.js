/**
 * Classification task
 */
import { categorize, reset, readInputCsv } from "./util.js";

const prompt = (id, description) => `Classify item as DNG (weapons, combat tools) or NEU (electronics, reactor parts, tools). Reply with only DNG or NEU. ID:${id} DESC:${description}`;

const main = async () => {
  const items = await readInputCsv();
  let processed = 0;
  for (const { code, description } of items) {
    processed++;
    console.log(`${processed}/${items.length}: ${code} - ${description}`);
    const result = await categorize(prompt(code, description));
    if (result?.code < 0) {
      console.log(`Aborting after ${processed} item(s) due to error code ${result.code}`);
      await reset();
      return;
    }
  }
  console.log(`Done. Processed ${processed}/${items.length} items.`);
  await reset();
};

main().catch((err) => {
  console.log("Startup error", err.message);
  process.exit(1);
});
