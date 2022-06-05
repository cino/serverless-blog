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
        '<rootDir>/dist/**/*.ts',
    ],
    // Temp removed.
    // coverageThreshold: {
    //     global: {
    //         branches: 75,
    //         functions: 80,
    //         statements: 80,
    //     },
    // },
};
