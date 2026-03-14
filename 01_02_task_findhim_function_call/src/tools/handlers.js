import { fetchCityCoordinates, fetchSuspectLocations, fetchAccessLevel } from "./api_calls.js";

export const handlers = {
  async fetchCityCoordinates({ city }) {
    return fetchCityCoordinates(city);
  },

  async fetchSuspectLocations({ name, surname }) {
    return fetchSuspectLocations({ name, surname });
  },

  async fetchAccessLevel({ name, surname, born }) {
    return fetchAccessLevel({ name, surname, born });
  },
};

