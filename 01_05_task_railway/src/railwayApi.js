import { postWithRetry } from "./utils.js";

const ENDPOINT = "https://hub.ag3nts.org/verify";
const apikey = () => process.env.AI_DEVS_API_KEY;

const post = (answer) => {
  const body = { apikey: apikey(), task: "railway", answer };
  console.log(`→ POST ${ENDPOINT}`, JSON.stringify({ ...body, apikey: "***" }));
  return postWithRetry(ENDPOINT, body);
};

/**
 * Show available actions and parameters.
 */
export const help = () =>
  post({ action: "help" });

/**
 * Enable reconfigure mode for the given route.
 * @param {string} route  e.g. "a-1"
 */
export const reconfigure = (route) =>
  post({ action: "reconfigure", route });

/**
 * Get current status for the given route.
 * @param {string} route  e.g. "a-1"
 */
export const getStatus = (route) =>
  post({ action: "getstatus", route });

/**
 * Set route status while in reconfigure mode.
 * @param {string} route  e.g. "a-1"
 * @param {"RTOPEN"|"RTCLOSE"} value
 */
export const setStatus = (route, value) => {
  if (value !== "RTOPEN" && value !== "RTCLOSE") {
    throw new Error(`Invalid value "${value}". Allowed: RTOPEN, RTCLOSE`);
  }
  return post({ action: "setstatus", route, value });
};

/**
 * Exit reconfigure mode for the given route.
 * @param {string} route  e.g. "a-1"
 */
export const save = (route) =>
  post({ action: "save", route });
