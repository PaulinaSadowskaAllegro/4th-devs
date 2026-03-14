const LOCATION_ENDPOINT = "https://hub.ag3nts.org/api/location";

/**
 * Fetches coordinates where a suspect was seen.
 * @param {{ name: string, surname: string, apikey?: string }} params
 * @returns {Promise<unknown>} API response (usually a list of coordinates)
 */
export async function fetchSuspectLocations({ name, surname, apikey = process.env.AI_DEVS_API_KEY } = {}) {
  if (!name || !surname) {
    throw new Error("Both `name` and `surname` are required.");
  }
  if (!apikey) {
    throw new Error("Missing `apikey` (pass it or set AI_DEVS_API_KEY).");
  }

  const response = await fetch(LOCATION_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apikey, name, surname })
  });

  const raw = await response.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    data = raw;
  }

  if (!response.ok) {
    throw new Error(
      `Location API error ${response.status}: ${typeof data === "string" ? data : JSON.stringify(data)}`
    );
  } 
  
  return data;
}

const ACCESS_LEVEL_ENDPOINT = "https://hub.ag3nts.org/api/accesslevel";

/**
 * Fetches the access level of a person.
 * @param {{ name: string, surname: string, birthYear: number, apikey?: string }} params
 * @returns {Promise<unknown>} API response with access level info
 */
export async function fetchAccessLevel({ name, surname, born, apikey = process.env.AI_DEVS_API_KEY } = {}) {
  if (!name || !surname) {
    throw new Error("Both `name` and `surname` are required.");
  }
  if (born === undefined || born === null) {
    throw new Error("`born` is required.");
  }
  if (!apikey) {
    throw new Error("Missing `apikey` (pass it or set AI_DEVS_API_KEY).");
  }

  const response = await fetch(ACCESS_LEVEL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apikey, name, surname, birthYear: born })
  });

  const raw = await response.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    data = raw;
  }

  if (!response.ok) {
    throw new Error(
      `Access level API error ${response.status}: ${typeof data === "string" ? data : JSON.stringify(data)}`
    );
  }

  return data.accessLevel;
}
