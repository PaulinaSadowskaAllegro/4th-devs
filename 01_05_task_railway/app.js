/**
 * Railway task
 */

import { postWithRetry, saveToWorkspace } from "./src/utils.js";

const HELP_ENDPOINT = "https://hub.ag3nts.org/verify";

const callHelp = async () => {
  const data = await postWithRetry(HELP_ENDPOINT, {
    apikey: process.env.AI_DEVS_API_KEY,
    task: "railway",
    answer: { action: "help" }
  });
  console.log("Help response", data);
  saveToWorkspace("help", data);
  return data;
};

const main = async () => {
  await callHelp();
};

main().catch((err) => {
  console.log("Startup error", err.message);
  process.exit(1);
});
