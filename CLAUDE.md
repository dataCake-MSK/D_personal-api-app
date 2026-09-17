# CLAUDE.md

Expo/React Native 기반 개인용 위젯 대시보드 앱. 1인 개발, **Public 저장소**.

## 작업 방식
- 기본: 사용자가 이슈 단위로 대화형 지시 → 결과 보고 → 다음 지시. 지시 범위를 넘는 작업은 하지 않는다.
- `/loop`: `loop-ready` 라벨이 붙은 이슈만, 번호 오름차순으로 1개씩 처리. 이슈당 브랜치 1개·PR 1개. 테스트/CI 실패나 AC가 모호하면 해당 이슈에 코멘트 남기고 중단.
- 머지는 사용자가 한다. main에 직접 push 금지.

## 요구사항·추적성
- 문서: `docs/requirements/` — NB(니즈 덤프) → PRD(무엇을) → SRS(어떻게) → `traceability.md`
- ID: `NB-001`, `PRD-001`, `SRS-001`, `ADR-0001`. 이슈 제목은 `[SRS-xxx] ...`, PR 본문에 `Closes #n`과 추적 ID.
- 구현 중 요구사항이 바뀌면 SRS를 먼저 고치고, 제품 범위가 바뀌면 PRD도 고친다.
- 되돌리기 어려운 기술 선택은 `docs/architecture/adr/`에 ADR 작성(템플릿 `0000-template.md`).

## Git 규칙
- 브랜치: `feat/SRS-010-dashboard-store`, `fix/…`, `docs/…`, `chore/…`
- 커밋: Conventional Commits, 한국어 설명 허용. 예: `feat(dashboard): 위젯 순서 변경 액션 추가 (SRS-010)`
- 커밋·PR은 `commit` 스킬, 이슈 생성·이슈 리포트(`docs/issues/`)는 `issue` 스킬, 일간 일지(`docs/journal/YYYY-MM-DD.md`)는 `journal` 스킬, 학습 정리는 `learn` 스킬 사용.

## 도식
- 기본은 Mermaid(GitHub에서 바로 렌더링). 시퀀스·컴포넌트 등 표현력이 필요하면 PlantUML(```plantuml 블록) 사용 가능. PlantUML은 GitHub에서 코드로만 보이므로 핵심 그림은 Mermaid로도 제공.

## 보안 (Public 저장소)
- API 키·토큰·개인 엔드포인트 URL을 코드·문서·테스트·커밋 메시지에 넣지 않는다. 앱 내 비밀 값은 `expo-secure-store`만 사용.
- `.env*`는 커밋 금지. 테스트는 공개 API 또는 목(mock) 사용.

## 개발 명령
- Expo SDK 57. API가 자주 바뀌므로 코드 작성 전 버전 문서 확인: https://docs.expo.dev/versions/v57.0.0/
- 폰 미리보기: `npx expo start --tunnel --go`를 백그라운드로 실행. 사용자가 Expo Go에 같은 Expo 계정으로 로그인하면 개발 서버 목록에 표시됨. 주소는 `curl -s http://127.0.0.1:4040/api/tunnels`의 `public_url`(https → `exp://`로 바꿔 전달).
- 타입 검사: `npx tsc --noEmit`
- 검증(SRS-002 이후): `npm run lint && npx tsc --noEmit && npm test`

## 환경 메모
- Windows. `gh`가 PATH에 없으면 `"C:\Program Files\GitHub CLI\gh.exe"` 사용.
