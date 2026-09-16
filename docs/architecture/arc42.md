# 아키텍처 문서 (arc42 최소 세트)

> 필요한 섹션만 유지한다. 다이어그램은 [c4.md](c4.md), 결정은 [adr/](adr/).

## 1. 목표와 제약
- 품질 목표: 위젯 확장 용이성(PRD-005), 비밀 값 안전성(PRD-006), 1인 개발 속도
- 제약: Expo Go 호환 라이브러리 우선, MVP 백엔드 없음(ADR-0002), Public 저장소

## 3. 시스템 컨텍스트
사용자 ↔ 모바일 앱 ↔ 사용자가 등록한 외부 HTTP API들. 상세는 c4.md L1.

## 5. 빌딩 블록
| 블록 | 책임 | 위치(예정) |
|---|---|---|
| Dashboard | 위젯 인스턴스 목록 관리·렌더 | `src/features/dashboard` |
| Widget Registry | 위젯 정의 등록·조회 | `src/widgets/registry.ts` |
| Data Sources | 외부 데이터 조회·추출 | `src/widgets/sources` |
| Views | Text/Table/TimeSeries 렌더러 | `src/widgets/views` |
| Actions | 외부로 요청 전송 | `src/widgets/actions` |
| Secrets | secure-store 래퍼, 치환 | `src/lib/secrets` |

## 8. 횡단 관심사
- 오류 처리: 위젯 단위 Error Boundary — 한 위젯 오류가 대시보드 전체를 깨지 않음
- 보안: 비밀 값은 secure-store만, 로그 출력 금지
- 테스트: 순수 로직(추출·치환·스토어) 단위 테스트 우선

## 9. 결정
- [ADR-0001](adr/0001-expo-react-native.md) Expo + RN + TS
- [ADR-0002](adr/0002-client-direct-api-calls.md) 백엔드 없는 직접 호출
- [ADR-0003](adr/0003-widget-registry.md) 위젯 레지스트리
- [ADR-0004](adr/0004-state-and-data-stack.md) 상태·데이터 스택

## 11. 리스크 / 기술 부채
| 리스크 | 대응 |
|---|---|
| 기기에 API 키 저장 | secure-store 사용, 민감 API는 백엔드 도입 시 이관 |
| 차트 라이브러리 한계 | 뷰 추상화로 교체 비용 제한 |
| 문서가 코드보다 앞서감 | 스킬로 자동 갱신, 템플릿 최소화 |
