import { fetchCityCoordinates, fetchSuspectLocations, fetchAccessLevel } from "./api_calls.js";

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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

  findClosestSuspectToPlant({ suspects, plants }) {
    let best = null;

    for (const suspect of suspects) {
      if (!Array.isArray(suspect.locations)) continue;
      for (const loc of suspect.locations) {
        const sLat = parseFloat(loc.lat);
        const sLon = parseFloat(loc.lon);
        if (isNaN(sLat) || isNaN(sLon)) continue;

        for (const plant of plants) {
          const pLat = parseFloat(plant.lat);
          const pLon = parseFloat(plant.lon);
          if (isNaN(pLat) || isNaN(pLon)) continue;

          const dist = haversineMeters(sLat, sLon, pLat, pLon);
          if (!best || dist < best.closestDistanceMeters) {
            best = {
              name: suspect.name,
              surname: suspect.surname,
              plant: plant.city,
              plantCode: plant.code,
              closestDistanceMeters: Math.round(dist)
            };
          }
        }
      }
    }

    return best ?? { error: "No valid locations found" };
  },
};

