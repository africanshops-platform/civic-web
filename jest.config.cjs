// Mirrors the alias table in vite.config.mjs's resolve.alias — keep the two in
// sync; a module that resolves under Vite but not here (or vice versa) means
// this list has drifted from vite.config.mjs.
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  // vite-jsconfig-paths resolves bare `src/...` imports from jsconfig.json's
  // baseUrl: "./" — modulePaths reproduces that for Jest's resolver.
  modulePaths: ['<rootDir>'],
  moduleNameMapper: {
    '^@fuse/(.*)$': '<rootDir>/src/@fuse/$1',
    '^@history$': '<rootDir>/src/@history',
    '^@history/(.*)$': '<rootDir>/src/@history/$1',
    '^@lodash$': '<rootDir>/src/@lodash',
    '^@lodash/(.*)$': '<rootDir>/src/@lodash/$1',
    '^@mock-api/(.*)$': '<rootDir>/src/@mock-api/$1',
    '^@schema$': '<rootDir>/src/@schema',
    '^@schema/(.*)$': '<rootDir>/src/@schema/$1',
    '^app/store$': '<rootDir>/src/app/store',
    '^app/store/(.*)$': '<rootDir>/src/app/store/$1',
    '^app/shared-components/(.*)$': '<rootDir>/src/app/shared-components/$1',
    '^app/configs/(.*)$': '<rootDir>/src/app/configs/$1',
    '^app/theme-layouts/(.*)$': '<rootDir>/src/app/theme-layouts/$1',
    '^app/utils/(.*)$': '<rootDir>/src/app/utils/$1',
    '^app/AppContext$': '<rootDir>/src/app/AppContext',
    '^app/main/(.*)$': '<rootDir>/src/app/main/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg|webp|ttf|woff|woff2)$': '<rootDir>/jest.fileMock.cjs',
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
};
