export const tools = [
  {
    type: "function",
    name: "fetchCityCoordinates",
    description: "Fetch latitude/longitude coordinates for a given city name using OpenStreetMap Nominatim",
    parameters: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "Name of the city to geocode"
        }
      },
      required: ["city"],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "fetchSuspectLocations",
    description: "Fetch GPS coordinates where a suspect was seen",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "First name of the suspect"
        },
        surname: {
          type: "string",
          description: "Last name of the suspect"
        }
      },
      required: ["name", "surname"],
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
