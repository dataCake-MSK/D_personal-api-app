---
name: issue
description: NB/SRS 문서 항목이나 대화 내용으로 GitHub 이슈를 생성·갱신하고 라벨·마일스톤·추적표를 연결한다. "이슈 만들어줘", "SRS 이슈로 등록", "니즈 적어둬", 이슈 리포트 요청 시 사용.
---

# issue — 이슈 생성과 추적성 관리

## 모드
- `srs <ID...|all>`: SRS 항목을 이슈로 등록
- `nb "<내용>"`: 니즈를 `docs/requirements/NB.md`에 새 NB 항목으로 추가하고 `type:needs` 이슈 생성
- `report`: 열린 이슈 현황 리포트 (마일스톤별 진행률, loop-ready 목록, 오래된 이슈)

## srs 절차
1. `docs/requirements/SRS.md`에서 대상 항목을 읽는다.
2. 중복 확인: `gh issue list --search "SRS-xxx in:title" --state all`. 있으면 새로 만들지 않고 번호만 기록.
3. `SRS-to-issue.md` 형식으로 본문 작성, 제목 `[SRS-xxx] 제목`.
4. `gh issue create --title ... --body-file <임시파일> --label ... --milestone ...`
5. AC가 구체적·검증 가능하면 사용자에게 `loop-ready` 라벨 부여 여부를 제안(직접 붙이지 않음, 사용자가 명시하면 붙임).
6. `SRS.md` 항목의 `이슈: -`를 `이슈: #n`으로, `traceability.md`의 Issue 칸을 갱신.
7. 문서 변경은 `commit` 스킬 규칙으로 커밋.

## nb 절차
1. `NB.md` 마지막 번호 + 1로 항목 추가(상태 `new`, 등록일 오늘 날짜).
2. `gh issue create --label type:needs`로 이슈 생성, 본문에 NB ID.
3. PRD 승격이 필요해 보이면 제안만 한다(PRD는 사람 중심 문서).

## report 절차
- `gh issue list --state open --json number,title,labels,milestone,updatedAt --limit 200` 등으로 집계해 표로 보고. 요청 시 `docs/journal/`의 해당 월 일지에 반영.
