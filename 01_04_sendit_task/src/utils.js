import { writeFileSync } from "fs";
import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function verify(declaration) {
  const answer = {
    "declaration": declaration,
  };
  const output = { task: "sendit", answer: answer, apikey: process.env.AI_DEVS_API_KEY };
  console.log(`\nSending to verify: ${JSON.stringify(output, null, 2)}`);

  const verifyResponse = await fetch("https://hub.ag3nts.org/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(output)
  });

  const verifyData = await verifyResponse.json();
  console.log(`\nVerify response: ${JSON.stringify(verifyData, null, 2)}`);
}

export async function loadFromFile(filename) {
  const path = join(__dirname, filename);
  const content = await readFile(path, "utf-8");
  return JSON.parse(content);
}

export async function saveOutput(output, filename) {
  const outputPath = join(__dirname, filename);
  writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");
  console.log(`\nOutput saved to ${outputPath}`);
}