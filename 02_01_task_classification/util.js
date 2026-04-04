import { readFile } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function readInputCsv() {
  const content = await readFile(resolve(__dirname, "workspace/input.csv"), "utf-8");
  const [headerLine, ...rows] = content.trim().split("\n");
  const headers = headerLine.split(",");
  return rows.map((row) => {
    const [code, ...rest] = row.split(",");
    const description = rest.join(",").replace(/^"|"$/g, "");
    return { code, description };
  });
}

async function postVerify(prompt) {
  const body = {
    apikey: process.env.AI_DEVS_API_KEY,
    task: "categorize",
    answer: { prompt }
  };

  const response = await fetch("https://hub.ag3nts.org/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
  return data;
}

export const categorize = (prompt) => postVerify(prompt);
export const reset = () => postVerify("reset");
