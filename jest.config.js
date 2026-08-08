/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  passWithNoTests: true,
  verbose: true,
  prettierPath: null,
  // ✅ ДОБАВЬТЕ ЭТИ НАСТРОЙКИ:
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          module: 'commonjs',
          target: 'ES2021',
          strict: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
        },
      },
    ],
  },

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  moduleFileExtensions: ['ts', 'js', 'json'],
}
