export declare const MemoryRouterProvider: typeof import("./next-13.5").MemoryRouterProvider;
// Automatically try to export the correct version:
try {
  module.exports = require("./next-13.5");
} catch (firstErr) {
  try {
    module.exports = require("./next-13");
  } catch {
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
}
