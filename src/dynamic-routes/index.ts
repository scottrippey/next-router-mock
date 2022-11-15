export declare const createDynamicRouteParser: typeof import("./next-13").createDynamicRouteParser;
// Automatically try to export the correct version:
try {
  module.exports = require("./next-13");
} catch (firstErr) {
  try {
    module.exports = require("./next-12");
  } catch {
    try {
      module.exports = require("./next-11");
    } catch {
      try {
        module.exports = require("./next-10");
      } catch {
        throw firstErr;
      }
    }
  }
}
