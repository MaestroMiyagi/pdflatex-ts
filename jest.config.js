module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  // Force Jest to exit after tests complete
  forceExit: true,
  // Clear timers and mocks after each test
  clearMocks: true,
  // Timeout for tests
  testTimeout: 30000,
  // Detect open handles for debugging
  detectOpenHandles: false,
}
