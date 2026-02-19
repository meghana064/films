export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/tests/**/*.test.js'],
  moduleFileExtensions: ['js'],
  forceExit: true,
  testTimeout: 10000,
  setupFiles: ['<rootDir>/tests/setup.js'],
};
