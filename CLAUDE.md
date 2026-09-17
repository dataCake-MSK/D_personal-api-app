# CLAUDE.md

Expo/React Native 기반 개인용 위젯 대시보드 앱. 1인 개발, **Public 저장소**.

## 작업 방식
- 사용자는 주로 폰(Claude 앱 Remote Control, GitHub 모바일)에서 지시·확인한다. 폰에서 보낸 `!` 명령은 실행되지 않으므로, 대화형 로그인(`gh`, `expo`)은 PC의 별도 터미널이나 기기 코드 방식으로 안내한다.
- 기본: 사용자가 이슈 단위로 대화형 지시 → 결과 보고 → 다음 지시. 지시 범위를 넘는 작업은 하지 않는다.
- `/loop`: `loop-ready` 라벨이 붙은 이슈만, 번호 오름차순으로 1개씩 처리. 이슈당 브랜치 1개·PR 1개. 테스트/CI 실패나 AC가 모호하면 해당 이슈에 코멘트 남기고 중단.

## 용어
- **이슈** = GitHub 이슈만 가리킨다.
- **리포트** = `docs/reports/`의 계획·현황·검토 문서.
- **일지** = `docs/journal/YYYY-MM-DD.md` 일간 일지. **학습 노트** = `docs/learning/`.

## 자동 형상관리
작업 결과를 남기는 일은 요청이 없어도 Claude가 끝까지 처리한다. Stop 훅(`.claude/hooks/stop-vcs-check.js`)이 턴 종료 시 커밋 안 된 변경, push 안 된 커밋, 오늘 일지 누락을 점검해 남아 있으면 종료를 막는다.

1. 파일을 바꾸는 작업은 브랜치에서 한다. main 직접 커밋·push 금지.
2. 작업 단위가 끝나면 `commit` 스킬로 커밋 → push → PR.
3. 같은 PR에 문서 동기화를 포함한다.
   - 추적: SRS AC 체크, `traceability.md` PR·상태
   - 일지: 그날 첫 PR부터 `journal` 스킬로 오늘 일지 갱신(하단 "개발자 퀵 가이드" 포함)
   - 학습: 사용자가 새로 알게 된 개념·시행착오가 있었으면 `learn` 스킬
   - 리포트: 기존 리포트의 계획·결정 상태가 바뀌었으면 `## 갱신 (날짜)` 추가
4. 아래 머지 등급에 따라 머지하거나 사용자 머지를 기다린다.
5. 머지하면 브랜치를 삭제(`gh pr merge --merge --delete-branch`)하고, 머지까지 한 일을 요약해 보고한다(변경·검증·PR/이슈 번호·브랜치 정리).

### 머지 등급
| 등급 | 대상 | 처리 |
|---|---|---|
| 🟢 자체 머지 | 문서만 변경: `docs/journal`, `docs/learning`, `docs/reports`, README, 추적 문서의 번호·체크 반영 / 사용자가 결과를 확인하고 머지를 요청한 PR / (CI 도입 후) 테스트만 추가, 동작 변경 없는 lint·포맷 수정 | CI가 있으면 통과 확인 후 머지 + 요약 보고 |
| 🟡 사용자 머지 | 앱 동작·화면 변경, 의존성 추가·변경, PRD·SRS 내용(범위·AC) 변경, ADR 신규·변경 | PR까지 만들고 확인할 점(실기기 확인 방법 포함)을 보고 |
| 🔴 사전 확인 | 작업 규칙·자동화 변경(`CLAUDE.md`, `.claude/`, `.github/workflows`), 보안·비밀 값·인증, 대량 삭제, 저장소 설정, 배포, 유료 서비스 | 착수 전에 사용자에게 묻고, PR은 사용자 머지 |

- 한 PR에 등급이 섞이면 가장 높은 등급을 따른다.
- 확신이 없으면 한 단계 높은 등급으로 처리한다.

## 요구사항·추적성
- 문서: `docs/requirements/` — NB(니즈 덤프) → PRD(무엇을) → SRS(어떻게) → `traceability.md`
- ID: `NB-001`, `PRD-001`, `SRS-001`, `ADR-0001`. 이슈 제목은 `[SRS-xxx] ...`, PR 본문에 `Closes #n`과 추적 ID.
- 구현 중 요구사항이 바뀌면 SRS를 먼저 고치고, 제품 범위가 바뀌면 PRD도 고친다.
- 되돌리기 어려운 기술 선택은 `docs/architecture/adr/`에 ADR 작성(템플릿 `0000-template.md`).

## Git 규칙
- 브랜치: `feat/SRS-010-dashboard-store`, `fix/…`, `docs/…`, `chore/…`
- 커밋: Conventional Commits, 한국어 설명 허용. 예: `feat(dashboard): 위젯 순서 변경 액션 추가 (SRS-010)`
- 머지 방식: merge commit(`--merge`).
- 스킬: 커밋·PR·머지는 `commit`, 이슈 생성·NB는 `issue`, 리포트는 `report`, 일지는 `journal`, 학습 노트는 `learn`.

## 도식
- 기본은 Mermaid(GitHub에서 바로 렌더링). 시퀀스·컴포넌트 등 표현력이 필요하면 PlantUML(```plantuml 블록) 사용 가능. PlantUML은 GitHub에서 코드로만 보이므로 핵심 그림은 Mermaid로도 제공.

## 보안 (Public 저장소)
- API 키·토큰·개인 엔드포인트 URL을 코드·문서·테스트·커밋 메시지에 넣지 않는다. 앱 내 비밀 값은 `expo-secure-store`만 사용.
- `.env*`는 커밋 금지. 테스트는 공개 API 또는 목(mock) 사용.

## 개발 명령
- Expo SDK 57. API가 자주 바뀌므로 코드 작성 전 버전 문서 확인: https://docs.expo.dev/versions/v57.0.0/
- 폰 미리보기: `npx expo start --tunnel --go`를 백그라운드로 실행(`CI=1`을 주면 자동 새로고침이 꺼지므로 주지 않음). 사용자가 Expo Go에 PC와 같은 Expo 계정으로 로그인하면 개발 서버 목록에 표시됨. 주소는 `curl -s http://127.0.0.1:4040/api/tunnels`의 `public_url`(https → `exp://`로 바꿔 전달).
- 미리보기 서버 관리: 서버를 켠 뒤 약 30분이 지났거나 확인하려던 작업이 끝났는데 아직 켜져 있으면, 계속 켜둘지 끌지 사용자에게 묻는다(자동으로 끄지 않음). 끌 때는 백그라운드 작업을 중지하고 8081 포트·ngrok 프로세스가 남지 않았는지 확인한다.
- 타입 검사: `npx tsc --noEmit`
- 검증(SRS-002 이후): `npm run lint && npx tsc --noEmit && npm test`

## 환경 메모
- Windows. `gh`가 PATH에 없으면 `"C:\Program Files\GitHub CLI\gh.exe"` 사용.
