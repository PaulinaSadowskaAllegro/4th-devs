import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  AI_API_KEY,
  EXTRA_API_HEADERS,
  RESPONSES_API_ENDPOINT,
  resolveModelForProvider
} from "../config.js";
import { extractResponseText } from "./helpers.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseCSV(content) {
  const lines = content.trim().split("\n");
  const headers = lines[0].split(",");
  return lines.slice(1).map(line => {
    const fields = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        fields.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    fields.push(current);
    return Object.fromEntries(headers.map((h, i) => [h, fields[i] ?? ""]));
  });
}

const MODEL = resolveModelForProvider("openai/gpt-5-nano");

async function batchExtractOccupations(rows) {
  const input = rows
    .map((row, i) => `[${i}] ${row.job}`)
    .join("\n");

  const response = await fetch(RESPONSES_API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${AI_API_KEY}`,
      ...EXTRA_API_HEADERS
    },
    body: JSON.stringify({
      model: MODEL,
      input: `Classify each job description below into occupation categories.\nEach line starts with [index].\n\n${input}`,
      text: { format: batchOccupationSchema }
    })
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    const message = data?.error?.message ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  const outputText = extractResponseText(data);
  if (!outputText) throw new Error("Missing text output in API response");

  const { results } = JSON.parse(outputText);
  // Return occupations indexed by position
  return results.reduce((acc, { index, occupations }) => {
    acc[index] = occupations;
    return acc;
  }, {});
}

const OCCUPATION_VALUES = ["IT", "transport", "edukacja", "medycyna", "praca z ludźmi", "praca z pojazdami", "praca fizyczna"];

const OCCUPATION_GUIDELINES = `Assign ALL categories from the list that apply based on the Polish job description. A job may match more than one category:
- "IT" — software, programming, computers, IT systems
- "transport" — driving, logistics, freight, shipping, delivery, fleet, warehousing, transport coordination, supply chain
- "edukacja" — teaching, training, education, tutoring
- "medycyna" — medicine, healthcare, nursing, pharmacy, biology/biochemistry research related to health
- "praca z ludźmi" — HR, customer service, social work, management, sales, psychology
- "praca z pojazdami" — vehicle mechanics, auto electricians, car repair, vehicle maintenance
- "praca fizyczna" — manual labour, construction, plumbing, installation, physical/industrial work not covered above`;

const batchOccupationSchema = {
  type: "json_schema",
  name: "batch_occupations",
  strict: true,
  schema: {
    type: "object",
    properties: {
      results: {
        type: "array",
        description: "One entry per input record, in the same order.",
        items: {
          type: "object",
          properties: {
            index: { type: "number", description: "The [index] from the input line." },
            occupations: {
              type: "array",
              items: { type: "string", enum: OCCUPATION_VALUES },
              description: OCCUPATION_GUIDELINES
            }
          },
          required: ["index", "occupations"],
          additionalProperties: false
        }
      }
    },
    required: ["results"],
    additionalProperties: false
  }
};

function calculateAge(birthDate) {
  const birth = new Date(birthDate);
  const currentYear = 2026;
  const birthYear = birth.getFullYear();
  const birthMonth = birth.getMonth(); // 0-based
  const birthDay = birth.getDate();
  // Compare against March 11, 2026
  const today = new Date(2026, 2, 11); // month is 0-based
  let age = currentYear - birthYear;
  const birthdayThisYear = new Date(currentYear, birthMonth, birthDay);
  if (birthdayThisYear > today) {
    age -= 1;
  }
  return age;
}

async function main() {
  const csvPath = join(__dirname, "people.csv");
  const content = readFileSync(csvPath, "utf-8");
  const people = parseCSV(content);

  const filtered = people.filter(row => {
    if (row.gender !== "M") return false;
    if (row.birthPlace !== "Grudziądz") return false;
    const age = calculateAge(row.birthDate);
    if (age < 20 || age > 40) return false;
    return true;
  });

  console.log(`Found ${filtered.length} people matching criteria. Classifying in one batch call...`);

  if (filtered.length > 50) {
    console.log("Something sus, please verify!");
    return;
  }

  const occupationsByIndex = await batchExtractOccupations(filtered);

  const answer = [];
  for (let i = 0; i < filtered.length; i++) {
    const row = filtered[i];
    const occupations = occupationsByIndex[i] ?? [];
    console.log(`${row.name} ${row.surname} --> ${occupations.join(", ")}`);
    if (occupations.includes("transport")) {
      answer.push({
        name: row.name,
        surname: row.surname,
        gender: row.gender,
        born: new Date(row.birthDate).getFullYear(),
        city: row.birthPlace,
        tags: occupations
      });
    }
  }

  const output = { task: "people", answer, apikey: process.env.AI_DEVS_API_KEY };
  console.log(`\n${JSON.stringify(output, null, 2)}`);

  const verifyResponse = await fetch("https://hub.ag3nts.org/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(output)
  });

  const verifyData = await verifyResponse.json();
  console.log(`\nVerify response: ${JSON.stringify(verifyData, null, 2)}`);
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
