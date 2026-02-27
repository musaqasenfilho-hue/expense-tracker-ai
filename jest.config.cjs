/** @type {import('jest').Config} */
// Jest setup for Next.js + TypeScript component/unit tests.
const config = {
  // JSDOM is required for React Testing Library and browser-like APIs.
  testEnvironment: 'jsdom',
  // Global matchers such as `toBeInTheDocument`.
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Keep "@/..." imports working in tests.
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Compile TS/TSX test files via ts-jest without a separate Babel layer.
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
  },
}

module.exports = config
