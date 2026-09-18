# SRS — 어떻게 만들 것인가

> 개발자·AI 중심 관리 문서. SRS 항목 1개 ≈ GitHub 이슈 1개 ≈ PR 1개를 원칙으로 한다.
> 각 항목은 수용 기준(AC)을 가져야 `loop-ready` 라벨을 붙일 수 있다.

- 버전: v0
- 최종 수정: 2026-09-16

## M0 — 기반

### SRS-001 Expo 앱 스캐폴딩
- 추적: PRD-005 · 이슈: #1
- 내용: Expo(TypeScript, expo-router) 프로젝트 생성, 폴더 구조 `src/` 정리.
- AC:
  - [x] `npx expo start` 후 Expo Go에서 기본 화면 표시 (2026-09-17 실기기 확인, tunnel 접속)
  - [x] `npx tsc --noEmit` 통과

### SRS-002 품질 도구 및 CI
- 추적: PRD-005 · 이슈: #2
- 내용: ESLint, Prettier, Jest + React Native Testing Library, GitHub Actions(lint → typecheck → test).
- AC:
  - [x] `npm run lint`, `npm test` 로컬 통과 (2026-09-18, `format:check`·`typecheck` 포함)
  - [ ] PR에서 Actions 워크플로 성공

## M1 — MVP

### SRS-010 대시보드 상태 저장소
- 추적: PRD-001 · 이슈: #3
- 내용: Zustand + persist(AsyncStorage). 대시보드 = `WidgetInstance[]`(id, type, config, order).
- AC:
  - [ ] 추가/삭제/순서 변경 액션 단위 테스트
  - [ ] 앱 재시작 후 구성 유지

### SRS-011 대시보드 화면
- 추적: PRD-001 · 이슈: #4
- 내용: 세로 스택 레이아웃, 위젯 추가(타입 선택) / 삭제 / 위아래 이동 UI.
- AC:
  - [ ] 위젯 0개 빈 상태 안내 표시
  - [ ] 추가·삭제·이동이 화면과 저장소에 반영

### SRS-012 위젯 레지스트리 + Text 위젯
- 추적: PRD-005 · 이슈: #5
- 내용: `WidgetDefinition { type, configSchema(zod), Renderer, ConfigEditor }` 레지스트리. 첫 위젯은 정적 Text.
- AC:
  - [ ] 레지스트리에 없는 타입은 오류 카드로 안전하게 표시
  - [ ] 잘못된 config는 zod 검증 실패 메시지 표시

### SRS-013 HTTP JSON 데이터 소스 + Text/Table 뷰
- 추적: PRD-002, PRD-006 · 이슈: #6
- 내용: TanStack Query로 GET 요청, 경로 표현식으로 값 추출, Text/Table 렌더러. 헤더에 secure-store 키 참조.
- AC:
  - [ ] 로딩/오류/빈 데이터 상태 표시
  - [ ] 추출 로직 단위 테스트

### SRS-014 TimeSeries 뷰
- 추적: PRD-003 · 이슈: #7
- 내용: 배열 데이터의 x(시간)/y(값) 필드 매핑, `react-native-gifted-charts` 선 그래프.
- AC:
  - [ ] 필드 매핑 변환 단위 테스트
  - [ ] 실기기에서 그래프 표시

### SRS-015 HTTP Action 위젯
- 추적: PRD-004, PRD-006 · 이슈: #8
- 내용: 버튼 → method/url/headers/body 전송, 응답 상태 표시, 실행 전 확인 옵션.
- AC:
  - [ ] 성공/실패 결과 표시
  - [ ] 요청 구성 로직 단위 테스트

### SRS-016 API 키 관리 화면
- 추적: PRD-006 · 이슈: #9
- 내용: `expo-secure-store`에 이름-값 저장, 위젯 설정에서 `{{secret:NAME}}` 형식으로 참조.
- AC:
  - [ ] 키 값은 화면·로그·저장소(AsyncStorage)에 평문 노출되지 않음
  - [ ] 치환 로직 단위 테스트
