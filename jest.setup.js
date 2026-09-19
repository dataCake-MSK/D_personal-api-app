// AsyncStorage는 네이티브 모듈이라 테스트에서는 공식 목으로 대체한다.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
