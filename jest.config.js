module.exports = {
  verbose: true,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\.tsx?$': 'ts-jest',
  },
  transformIgnorePatterns: [],
  testRegex: '.*/__tests__/.*\.(test|spec)\.(jsx?|tsx?)$',
};
