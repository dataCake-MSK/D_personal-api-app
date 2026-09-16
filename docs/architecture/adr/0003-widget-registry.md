# ADR-0003 위젯 레지스트리(플러그인) 구조와 데이터 소스/뷰 분리

- 상태: 승인
- 날짜: 2026-09-16
- 관련: PRD-002~005, SRS-012~015

## 맥락
최소 위젯으로 시작해 종류를 점진 확장해야 한다. 위젯마다 대시보드 코드를 고치면 확장 비용이 커진다.

## 결정
- 위젯 타입은 `WidgetDefinition { type, configSchema(zod), Renderer, ConfigEditor }`로 레지스트리에 등록한다.
- 입력 위젯은 `DataSource`(예: HTTP JSON)와 `View`(Text/Table/TimeSeries)를 조합한다.
- 출력 위젯은 `Action`(예: HTTP 요청) 계열로 분리한다.
- 대시보드는 `WidgetInstance { id, type, config, order }` 배열로 직렬화한다.

## 대안
- 위젯별 독립 컴포넌트 하드코딩: 초기엔 단순하나 소스×뷰 조합마다 중복.

## 결과
- 새 위젯 = 정의 1개 추가. 소스·뷰 조합 재사용.
- 설정 스키마 버전 변경 시 마이그레이션 필요 → config에 `version` 필드 유지.
