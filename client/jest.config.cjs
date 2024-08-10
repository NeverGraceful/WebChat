module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleNameMapper: {
      "\\.(css|less|sass|scss)$": "identity-obj-proxy",
      "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/__mocks__/fileMock.js",
      "d3": "<rootDir>/node_modules/d3/dist/d3.min.js",
      "^d3-(.*)$": "<rootDir>/node_modules/d3-$1/dist/d3-$1.min.js"
    },
    roots: ["<rootDir>/src", "<rootDir>/__tests__"],
    moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json", "node"],
    testMatch: ["**/__tests__/**/*.test.{ts,tsx,js,jsx}"],
    collectCoverageFrom: ["src/**/*.{ts,tsx,js,jsx}", "!<rootDir>/node_modules/"],
    coverageReporters: ["json", "lcov", "text", "html"],
    transform: {
      '^.+\\.tsx?$': [
        'ts-jest',
        {
          diagnostics: {
            ignoreCodes: [1343]
          },
          astTransformers: {
            before: [
              {
                path: 'node_modules/ts-jest-mock-import-meta', 
                options: { metaObjectReplacement: { url: 'https://www.url.com' } }
              }
            ]
          }
        }
      ]
    }
  };  
