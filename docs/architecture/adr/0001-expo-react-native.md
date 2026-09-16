# ADR-0001 Expo + React Native + TypeScript 채택

- 상태: 승인
- 날짜: 2026-09-16
- 관련: PRD-005, SRS-001

## 맥락
1인 개발로 모바일 앱을 빠르게 반복 개발해야 하고, AI(Claude Code) 주도 개발 비중이 높다.

## 결정
Expo SDK(최신) + React Native + TypeScript, 라우팅은 expo-router.

## 대안
- React Native CLI: 네이티브 설정 부담 큼.
- Flutter: Dart 생태계, 웹/JS 지식 재사용 불가.
- 네이티브(Swift/Kotlin): 플랫폼 2벌 개발.

## 결과
- Expo Go로 실기기 즉시 확인, EAS Build/Update로 배포·OTA 가능.
- 네이티브 모듈이 필요하면 Dev Build(prebuild)로 전환. `android/`, `ios/`는 생성물로 보고 커밋하지 않는다.
