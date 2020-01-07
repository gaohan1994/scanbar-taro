
module.exports = {
  verbose: true,
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js'
  ],
  rootDir: __dirname,
  testPathIgnorePatterns: [
    "\\.snap$",
    "<rootDir>/node_modules/"
  ],
  testMatch: [
    '<rootDir>/src/components/**/*.test.js',
    '<rootDir>/src/components/**/test.js',
    '<rootDir>/src/reducers/__test__/*.spec.ts',
  ],
  transform: {
    "^.+\\.(js)$": "<rootDir>/node_modules/babel-jest",
    "\\.(ts|tsx)$": "ts-jest"
  },
  globals: {
    "ts-jest": {
      babelConfig: true,
      tsConfig: "<rootDir>/tsconfig.json",
      diagnostics: false
    }
  },
  moduleNameMapper: {
    react: 'nervjs',
    'react-addons-test-utils': 'nerv-test-utils',
    'react-dom': 'nervjs',
    'weui': '<rootDir>/__mock__/styleMock.js',
    '\\.(css|less|sass|scss)$': '<rootDir>/__mock__/styleMock.js'
  }
}

// "jest": {
//   "moduleFileExtensions": [
//     "ts",
//     "tsx",
//     "js"
//   ],
//   "transform": {
//     "^.+\\.(js)$": "<rootDir>/node_modules/babel-jest",
//     "\\.(ts|tsx)$": "ts-jest"
//   },
//   "testRegex": "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$",
//   "testPathIgnorePatterns": [
//     "\\.snap$",
//     "<rootDir>/node_modules/"
//   ],
//   "globals": {
//     "ts-jest": {
//       "babelConfig": true,
//       "tsConfig": "<rootDir>/tsconfig.json",
//       "diagnostics": false
//     }
//   },
//   "cacheDirectory": ".jest/cache"
// }

