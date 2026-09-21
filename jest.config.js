const preset = require('jest-expo/jest-preset');

// 차트 패키지는 최신 문법으로 배포되어 변환이 필요하다.
// jest-expo 기본 목록을 덮어쓰지 않고, 예외 목록에만 덧붙인다.
const [defaultPattern, ...restPatterns] = preset.transformIgnorePatterns ?? [];
const transformIgnorePatterns = [
  defaultPattern.replace(
    'node_modules/(?!',
    'node_modules/(?!react-native-gifted-charts|gifted-charts-core|',
  ),
  ...restPatterns,
];

module.exports = {
  ...preset,
  setupFiles: [...(preset.setupFiles ?? []), '<rootDir>/jest.setup.js'],
  transformIgnorePatterns,
};
