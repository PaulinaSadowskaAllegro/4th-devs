import { fetchCityCoordinates, fetchSuspectLocations, fetchAccessLevel } from "./api_calls.js";

export const handlers = {
  async fetchCityCoordinates({ cities }) {
    const results = await Promise.all(
      cities.map(async ({ city, code }) => {
        const [result] = await fetchCityCoordinates(city);
        return { city, code, lat: result?.lat, lon: result?.lon };
      })
    );
    return results;
  },

  async fetchSuspectLocations({ suspects }) {
    const results = await Promise.all(
      suspects.map(async ({ name, surname }) => {
        const locations = await fetchSuspectLocations({ name, surname });
        return { name, surname, locations };
      })
    );
    return results;
  },

  async fetchAccessLevel({ name, surname, born }) {
    return fetchAccessLevel({ name, surname, born });
  },
};

