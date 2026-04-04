/**
 * Railway task
 */

import { saveToWorkspace } from "./src/utils.js";
import { help, reconfigure, getStatus, setStatus, save } from "./src/railwayApi.js";

const ROUTE = "x-01";

const openRoute = async () => {
  console.log(`[1/4] Enabling reconfigure mode for route ${ROUTE}...`);
  const reconfigureResult = await reconfigure(ROUTE);
  console.log("reconfigure:", reconfigureResult);
  saveToWorkspace("reconfigure", reconfigureResult);

  console.log(`[2/4] Setting status to RTOPEN for route ${ROUTE}...`);
  const setStatusResult = await setStatus(ROUTE, "RTOPEN");
  console.log("setStatus:", setStatusResult);
  saveToWorkspace("setStatus", setStatusResult);

  console.log(`[3/4] Saving configuration for route ${ROUTE}...`);
  const saveResult = await save(ROUTE);
  console.log("save:", saveResult);
  saveToWorkspace("save", saveResult);

  console.log(`[4/4] Verifying status for route ${ROUTE}...`);
  const statusResult = await getStatus(ROUTE);
  console.log("getStatus:", statusResult);
  saveToWorkspace("getStatus", statusResult);
};

const main = async () => {
  console.log("[0] Calling help to verify API...");
  const helpResult = await help();
  console.log("help:", helpResult);
  saveToWorkspace("help", helpResult);

  if (!helpResult.ok) {
    throw new Error(`API verification failed: ${JSON.stringify(helpResult)}`);
  }

  await openRoute();
};

main().catch((err) => {
  console.log("Startup error", err.message);
  process.exit(1);
});
