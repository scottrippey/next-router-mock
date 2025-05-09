module.exports = {
  ...require("../../jest.config"),
  rootDir: ".",
  moduleNameMapper: {
    // Ensure we "lock" the next version for these tests:
    "^next/(.*)$": "<rootDir>/node_modules/next/$1",
  },
};
