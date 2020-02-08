module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec).ts?(x)'],
  moduleNameMapper: {
    "@orch/(.*)$": "<rootDir>/packages/$1/src/",
  }
}
