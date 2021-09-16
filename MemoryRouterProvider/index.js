// Automatically determine which Next version to export:
const nextVersion = require("next/package.json")
  .version.split(".")
  .map((d) => Number(d));
const isNextV11_1 = nextVersion[0] >= 11 && nextVersion[1] >= 1;

module.exports = isNextV11_1 ? require("./next-11") : require("./next-10");
