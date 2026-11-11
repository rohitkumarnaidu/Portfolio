import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { diagnostics: false, tsconfig: { allowJs: true } }],
  },
  // sanitize-html >= 2.18 pulls htmlparser2, domhandler and domutils, which
  // are ESM only. Jest runs this suite as CommonJS, so those packages have to
  // be transformed instead of ignored.
  transformIgnorePatterns: [
    'node_modules/(?!(htmlparser2|domhandler|domutils|domelementtype|dom-serializer|entities)/)',
  ],
  collectCoverageFrom: ['**/*.(t|j)s', '!**/*.module.ts', '!main.ts'],
  coverageDirectory: '../coverage',
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 40,
      lines: 40,
      statements: 40,
    },
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

export default config;
