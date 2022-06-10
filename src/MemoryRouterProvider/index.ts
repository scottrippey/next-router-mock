export type { MemoryRouterProvider } from "./next-12";
// Automatically try to export the correct version:
try {
  module.exports = require("./next-12");
} catch (firstErr) {
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
