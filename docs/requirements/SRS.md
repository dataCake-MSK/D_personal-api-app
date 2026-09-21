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
  - [x] PR에서 Actions 워크플로 성공 (2026-09-18, PR #15에서 41초 통과)

## M1 — MVP

### SRS-010 대시보드 상태 저장소
- 추적: PRD-001 · 이슈: #3
- 내용: Zustand + persist(AsyncStorage). 대시보드 = `WidgetInstance[]`(id, type, config). **순서는 배열 순서를 단일 기준으로 삼는다**(별도 `order` 필드를 두면 배열과 어긋날 수 있어 제외).
- AC:
  - [x] 추가/삭제/순서 변경 액션 단위 테스트 (2026-09-18, 6개)
  - [x] 앱 재시작 후 구성 유지 (2026-09-18, 저장→복원 테스트)

### SRS-011 대시보드 화면
- 추적: PRD-001 · 이슈: #4
- 내용: 세로 스택 레이아웃, 위젯 추가(타입 선택 → 해당 위젯의 `ConfigEditor`로 설정 입력) / 삭제 / 위아래 이동 UI.
- AC:
  - [x] 위젯 0개 빈 상태 안내 표시 (2026-09-20)
  - [x] 추가·삭제·이동이 화면과 저장소에 반영 (2026-09-20, 화면 테스트 5개)
  - [x] 실기기(Expo Go) 확인 — 추가·삭제·이동·재시작 유지 (2026-09-20)

### SRS-012 위젯 레지스트리 + Text 위젯
- 추적: PRD-005 · 이슈: #5
- 내용: `WidgetDefinition { type, label, configSchema(zod), Renderer }` 레지스트리. 첫 위젯은 정적 Text. **`ConfigEditor`는 설정 입력 화면을 만드는 SRS-011에서 추가한다.**
- AC:
  - [x] 레지스트리에 없는 타입은 오류 카드로 안전하게 표시 (2026-09-18)
  - [x] 잘못된 config는 zod 검증 실패 메시지 표시 (2026-09-18)
  - [x] 한 위젯의 오류가 다른 위젯 렌더링을 막지 않음 (arc42 8장 반영)

### SRS-013 HTTP JSON 데이터 소스 + Text/Table 뷰
- 추적: PRD-002, PRD-006 · 이슈: #6
- 내용: TanStack Query로 GET 요청, **점 표기 경로**(`data.items[0].price`)로 값 추출, Text/Table 렌더러. 헤더에 `{{secret:NAME}}` 참조(SRS-016).
- 테스트용 공개 API(D1): 인증 없는 JSON은 **Open-Meteo**(`https://api.open-meteo.com/v1/forecast?latitude=37.57&longitude=126.98&hourly=temperature_2m`), 인증 헤더·전송 확인은 **httpbin**(`https://httpbin.org/bearer`, `https://httpbin.org/post`). 단위 테스트는 실제 호출 없이 목 응답 사용.
- AC:
  - [x] 로딩/오류/빈 데이터 상태 표시 (2026-09-20)
  - [x] 추출 로직 단위 테스트 (2026-09-20, 경로·요청·표 변환 14개 + 위젯 7개)
  - [x] 실기기(Expo Go) 확인 — Open-Meteo 텍스트·테이블 표시 (2026-09-20)

### SRS-014 TimeSeries 뷰
- 추적: PRD-003 · 이슈: #7
- 내용: 배열 데이터의 x(시간)/y(값) 필드 매핑, `react-native-gifted-charts` 선 그래프.
- AC:
  - [ ] 필드 매핑 변환 단위 테스트
  - [ ] 실기기에서 그래프 표시

### SRS-015 HTTP Action 위젯
- 추적: PRD-004, PRD-006 · 이슈: #8
- 내용: 버튼 → method/url/headers/body 전송, 응답 상태 표시, 실행 전 확인 옵션. **응답 본문은 표시하지 않는다**(요청 헤더를 그대로 돌려주는 서버가 있어 비밀 값이 노출될 수 있음).
- AC:
  - [x] 성공/실패 결과 표시 (2026-09-21)
  - [x] 요청 구성 로직 단위 테스트 (2026-09-21, 9개)
  - [x] 실기기(Expo Go) 확인 — httpbin으로 전송·확인 흐름 (2026-09-21)

### SRS-017 위젯 설정 수정
- 추적: PRD-001 · 이슈: #26
- 내용: 대시보드의 위젯 카드에서 "수정"으로 기존 설정을 불러와 고칠 수 있다. 추가 화면과 같은 `ConfigEditor`를 재사용한다.
- AC:
  - [x] 기존 설정값이 입력란에 채워진 상태로 열린다 (2026-09-20)
  - [x] 저장하면 화면과 저장소의 설정이 바뀐다 (2026-09-20)
  - [x] 검증에 실패하면 저장되지 않고 이유를 보여준다 (2026-09-20)
  - [x] 실기기(Expo Go) 확인 (2026-09-21)

### SRS-016 API 키 관리 화면
- 추적: PRD-006 · 이슈: #9
- 내용: `expo-secure-store`에 이름-값 저장, 위젯 설정에서 `{{secret:NAME}}` 형식으로 참조. 목록에는 **이름만** 보관하고 값은 보안 저장소에서만 읽는다.
- AC:
  - [x] 키 값은 화면·로그·저장소(AsyncStorage)에 평문 노출되지 않음 (2026-09-20, 화면은 이름과 마스킹만 표시)
  - [x] 치환 로직 단위 테스트 (2026-09-20, 10개)
  - [x] 실기기(Expo Go) 확인 — 저장·삭제·재시작 후 유지 (2026-09-20)
