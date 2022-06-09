/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  globals: {
    'ts-jest': {
      tsconfig: false,
      isolatedModules: true,
    },
  },
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': '@swc/jest',
  },
  verbose: true,
  testTimeout: 90000,
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/lib/api/*.ts',
    '<rootDir>/lib/infra/*.ts',
    '<rootDir>/lib/*.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 100,
    },
  },
};
