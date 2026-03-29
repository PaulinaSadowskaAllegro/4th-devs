import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * POST JSON to a URL with automatic retry on 5xx errors.
 * @param {string} url
 * @param {object} body
 * @returns {Promise<object>} Parsed JSON response
 */
export const postWithRetry = async (url, body) => {
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (response.status >= 500) {
      lastError = new Error(`Server error: ${response.status}`);
      console.log(`Attempt ${attempt}/${MAX_RETRIES} failed with ${response.status}. Retrying in ${RETRY_DELAY_MS}ms...`);
      if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY_MS);
      continue;
    }

    return response.json();
  }

  throw lastError;
};

/**
 * Save data as a JSON code block in a markdown file inside the workspace folder.
 * @param {string} filename  Filename without extension, e.g. "help"
 * @param {object} data
 */
export const saveToWorkspace = (filename, data) => {
  const md = `# ${filename}\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n`;
  const outputPath = join(__dirname, "..", "workspace", `${filename}.md`);
  writeFileSync(outputPath, md, "utf-8");
  console.log(`Response saved to ${outputPath}`);
};
