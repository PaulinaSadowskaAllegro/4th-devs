export const tools = [
  {
    type: "function",
    name: "fetchCityCoordinates",
    description: "Fetch GPS coordinates for a list of cities. Returns an array of { city, code, lat, lon }.",
    parameters: {
      type: "object",
      properties: {
        cities: {
          type: "array",
          description: "List of cities to geocode",
          items: {
            type: "object",
            properties: {
              city: { type: "string", description: "Name of the city" },
              code: { type: "string", description: "Plant code in format PWR0000PL" }
            },
            required: ["city", "code"],
            additionalProperties: false
          }
        }
      },
      required: ["cities"],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "fetchSuspectLocations",
    description: "Fetch GPS coordinates for a list of suspects. For each person calls /api/location and returns an array of { name, surname, locations }.",
    parameters: {
      type: "object",
      properties: {
        suspects: {
          type: "array",
          description: "List of suspects to look up",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "First name of the suspect" },
              surname: { type: "string", description: "Last name of the suspect" }
            },
            required: ["name", "surname"],
            additionalProperties: false
          }
        }
      },
      required: ["suspects"],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "fetchAccessLevel",
    description: "Fetch the access level of a person",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "First name of the person"
        },
        surname: {
          type: "string",
          description: "Last name of the person"
        },
        born: {
          type: "number",
          description: "Birth year of the person"
        }
      },
      required: ["name", "surname", "born"],
      additionalProperties: false
    },
    strict: true
  }
];
