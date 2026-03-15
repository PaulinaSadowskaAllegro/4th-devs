/**
 * Native tool definitions — plain JS functions in OpenAI function format.
 *
 * These are "native" tools that run directly in the same process,
 * as opposed to MCP tools which are called through the protocol.
 * The agent treats both identically via the unified handler map.
 */

import { checkPackage, redirectPackage } from "./packagesApiMock.js";

export const nativeTools = [
  {
    type: "function",
    name: "checkPackage",
    description: "Check the status and location of a package",
    parameters: {
      type: "object",
      properties: {
        packageid: { type: "string", description: "The package ID to check, e.g. PKG12345678" }
      },
      required: ["packageid"],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "redirectPackage",
    description: "Redirect a package to a different destination",
    parameters: {
      type: "object",
      properties: {
        packageid: { type: "string", description: "The package ID to redirect" },
        destination: { type: "string", description: "The destination code, e.g. PWR3847PL" },
        code: { type: "string", description: "The security code provided by the operator" }
      },
      required: ["packageid", "destination", "code"],
      additionalProperties: false
    },
    strict: true
  }
];

export const nativeHandlers = {
  checkPackage: {
    label: "native",
    execute: ({ packageid }) => checkPackage(packageid)
  },
  redirectPackage: {
    label: "native",
    execute: ({ packageid, destination, code }) => redirectPackage(packageid, destination, code)
  }
};

