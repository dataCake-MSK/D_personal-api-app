# ADR-0004 상태·데이터 스택: Zustand, TanStack Query, zod, gifted-charts

- 상태: 승인
- 날짜: 2026-09-16
- 관련: SRS-010, SRS-013, SRS-014, SRS-016

## 맥락
대시보드 구성 영속화, API 데이터 캐시/재시도, 사용자 입력 설정 검증, 차트 표시가 필요하다.

## 결정
- 앱 상태/영속화: Zustand + persist(AsyncStorage)
- 서버 데이터: TanStack Query
- 설정 검증: zod
- 비밀 값: expo-secure-store
- 차트: react-native-gifted-charts

## 대안
- Redux Toolkit: 1인 앱엔 보일러플레이트 과다.
- MMKV: 빠르지만 Expo Go 미지원(Dev Build 필요).
- victory-native: 기능 풍부하나 Skia 의존·무거움. gifted-charts로 한계가 보이면 교체 ADR 작성.

## 결과
- Expo Go에서 그대로 동작, 학습 곡선 낮음.
