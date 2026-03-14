import { readdir, readFile, writeFile, unlink, mkdir, stat } from "fs/promises";
import { resolveSandboxPath } from "../utils/sandbox.js";

export const handlers = {
  async fetchCityCoordinates(city) {
    return this.fetchCityCoordinates(city);
  },

  async fetchSuspectLocations({ name, surname, apikey = process.env.AI_DEVS_API_KEY } = {}) {
    return this.fetchSuspectLocations({ name, surname, apikey });

  },

  async fetchAccessLevel({ name, surname, born, apikey = process.env.AI_DEVS_API_KEY }) {
    return this.fetchAccessLevel({ name, surname, born, apikey });
  },
};
