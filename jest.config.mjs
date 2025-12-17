/** @type {import('jest').Config} */
export default {
  testEnvironment: "node",

  testMatch: ["**/tests/**/*.spec.js"],

  testTimeout: 30000,
  maxWorkers: 1,

  clearMocks: true,
  restoreMocks: true,

  verbose: true,
};
