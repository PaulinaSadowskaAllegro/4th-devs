
import { createMcpClient, listMcpTools } from "./src/mcp/client.js";
import { run } from "./src/agent.js";
import { nativeTools } from "./src/native/tools.js";
import { saveOutput, verify } from "./src/utils.js";
import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const IMAGE_TEXT_RECOGNITION_QUERY = `Classify all images in the workspace/images/ folder.
Prepare transcription of text from that images.`;

const TRANSIT_FORM_TASK = `
Prepare transit form based on package data defined in workspace/reference folder.
`

const runAgent = async () => {
  console.log("Starting sendIt agent...");

  let mcpClient;

  try {
    console.log("Connecting to MCP server...");
    mcpClient = await createMcpClient();
    const mcpTools = await listMcpTools(mcpClient);

    console.log("Starting the task...");
    const result = await run(TRANSIT_FORM_TASK, { mcpClient, mcpTools });
    console.log(result.response);
    await saveOutput(result.response, "../workspace/result.json");
  } catch (error) {
    throw error;
  } finally {
    if (mcpClient) {
      await mcpClient.close().catch(() => {});
    }
  }
};

const main = async () => {
 // await runAgent();
  
  const form = await readFile(join(__dirname, "workspace/output/form.txt"), "utf-8");
  verify(form).catch((err) => {
    console.log("Verification error:", err.message);
  });
}

main().catch((err) => {
  console.log("Agent error:", err.message);
  process.exit(1);
});


