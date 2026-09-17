# 앱 기술 스택 기초: Jest, Zustand, persist/AsyncStorage, TanStack Query

## 핵심 개념

### Jest — 테스트 실행기
- JavaScript/TypeScript 코드를 자동으로 검사하는 **테스트 러너**. `*.test.ts` 파일을 찾아 실행하고 통과/실패를 알려준다.
- Expo에서는 `jest-expo` 프리셋으로 설정한다.
- **React Native Testing Library(RNTL)**: 컴포넌트를 가상으로 렌더링하고 "화면에 '위젯 없음' 문구가 보이는가", "버튼을 누르면 목록이 늘어나는가"처럼 사용자 관점으로 검사하는 도구. Jest 위에서 동작한다.

```ts
test('위젯을 추가하면 개수가 1 늘어난다', () => {
  addWidget({ type: 'text' });
  expect(getWidgets()).toHaveLength(1);
});
```

### Zustand — 앱 상태 저장소
- 여러 화면이 함께 쓰는 데이터(예: 대시보드의 위젯 목록)를 한곳에 두는 **상태 관리 라이브러리**.
- Redux보다 코드가 훨씬 짧다. `create()`로 저장소를 만들고 컴포넌트에서 훅으로 꺼내 쓴다.

```ts
const useDashboard = create((set) => ({
  widgets: [],
  addWidget: (w) => set((s) => ({ widgets: [...s.widgets, w] })),
}));
```

### persist + AsyncStorage — 앱을 꺼도 남게 하기
- Zustand 상태는 기본적으로 메모리에만 있어서 앱을 끄면 사라진다.
- **persist**: Zustand 미들웨어. 상태가 바뀔 때마다 저장소에 자동 저장하고, 앱 시작 시 복원한다.
- **AsyncStorage**: React Native의 기기 내 **키-값 저장소**(웹의 localStorage와 비슷). persist의 저장 위치로 쓴다.
- ⚠️ AsyncStorage는 **암호화되지 않는다** → API 키 같은 비밀 값은 `expo-secure-store`(iOS Keychain / Android Keystore 기반)에 따로 저장한다.

### TanStack Query — 외부 API 데이터 관리
- 예전 이름은 React Query. 외부 API 호출 결과(**서버 상태**)를 다루는 라이브러리.
- 직접 만들면 번거로운 것들을 대신 처리한다.
  - 로딩 중 / 오류 / 성공 상태 (`isLoading`, `error`, `data`)
  - 결과 캐시(같은 요청 반복 안 함), 실패 시 재시도
  - 주기적 재조회(`refetchInterval`) → 나중에 위젯 자동 갱신에 활용 가능

```ts
const { data, isLoading, error } = useQuery({
  queryKey: ['widget', id],
  queryFn: () => fetch(url).then((r) => r.json()),
});
```

## 이 프로젝트 적용
| 기술 | 역할 | 관련 |
|---|---|---|
| Jest + RNTL | 단위·컴포넌트 테스트 | SRS-002 (#2) |
| Zustand + persist(AsyncStorage) | 대시보드 구성(위젯 목록) 저장 | SRS-010 (#3) |
| TanStack Query | 위젯의 API 데이터 조회 | SRS-013 (#6) |
| expo-secure-store | API 키 보관 | SRS-016 (#9) |

- 선택 이유: [ADR-0004](../architecture/adr/0004-state-and-data-stack.md)

## 구분 요령
- **앱 안에서 내가 만든 데이터**(위젯 목록, 설정) → Zustand
- **외부 서버에서 받아온 데이터**(API 응답) → TanStack Query
- **비밀 값** → secure-store

## 참고
- Jest: https://jestjs.io
- Zustand: https://zustand.docs.pmnd.rs
- TanStack Query: https://tanstack.com/query
- Expo 테스트: https://docs.expo.dev/develop/unit-testing/
