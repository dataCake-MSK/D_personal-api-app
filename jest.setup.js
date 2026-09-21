// AsyncStorage는 네이티브 모듈이라 테스트에서는 공식 목으로 대체한다.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// 차트는 애니메이션 타이머가 테스트 종료 후에도 남아 다른 테스트를 깨뜨리므로 빈 컴포넌트로 대체한다.
// (그래프 데이터 변환은 timeseries.test.ts에서 따로 검증한다.)
jest.mock('react-native-gifted-charts', () => ({
  LineChart: () => null,
}));

// expo-secure-store도 네이티브 모듈이라 메모리 저장소로 대체한다.
jest.mock('expo-secure-store', () => {
  const store = new Map();
  return {
    __store: store,
    getItemAsync: jest.fn(async (key) => (store.has(key) ? store.get(key) : null)),
    setItemAsync: jest.fn(async (key, value) => {
      store.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key) => {
      store.delete(key);
    }),
  };
});
