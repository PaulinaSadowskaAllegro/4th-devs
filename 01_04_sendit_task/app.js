
import { createMcpClient, listMcpTools } from "./src/mcp/client.js";
import { run } from "./src/agent.js";
import { nativeTools } from "./src/native/tools.js";
import { saveOutput } from "./src/utils.js";

const IMAGE_TEXT_RECOGNITION_QUERY = `Classify all images in the workspace/images/ folder.
Prepare transcription of text from that images.`;


const main = async () => {
  console.log("Starting sendIt agent...");

  let mcpClient;

  try {
    console.log("Connecting to MCP server...");
    mcpClient = await createMcpClient();
    const mcpTools = await listMcpTools(mcpClient);
    console.log(`MCP: ${mcpTools.map((tool) => tool.name).join(", ")}`);
    console.log(`Native: ${nativeTools.map((tool) => tool.name).join(", ")}`);

    console.log("Starting image classification...");
    const result = await run(IMAGE_TEXT_RECOGNITION_QUERY, { mcpClient, mcpTools });
    console.log("Classification complete");
    console.log(result.response);
    await saveOutput(result.response, "../workspace/excluded_routes.json");
  } catch (error) {
    throw error;
  } finally {
    if (mcpClient) {
      await mcpClient.close().catch(() => {});
    }
  }
};

main().catch((err) => {
  console.log("Agent error:", err.message);
  process.exit(1);
});


