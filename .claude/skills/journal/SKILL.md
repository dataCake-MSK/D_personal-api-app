---
name: journal
description: git 커밋·GitHub 이슈/PR·ADR·학습노트를 집계해 docs/journal/YYYY-MM.md 월간 일지와 이슈 리포트를 작성·갱신한다. "월간 일지", "이번 달 정리", "회고" 요청 시 사용.
---

# journal — 월간 일지

## 인자
- `YYYY-MM` (생략 시 이번 달)

## 절차
1. 기간 계산: 해당 월 1일 ~ 말일(이번 달이면 오늘까지).
2. 수집:
   - `git log --since=<시작> --until=<끝> --pretty=format:"%h %ad %s" --date=short`
   - `gh pr list --state merged --search "merged:<시작>..<끝>" --json number,title,mergedAt`
   - `gh issue list --state closed --search "closed:<시작>..<끝>" --json number,title,labels`
   - `gh issue list --state open --json number,title,labels,milestone`
   - 기간 내 추가/수정된 `docs/architecture/adr/*`, `docs/learning/*` (`git log --name-only`로 확인)
3. `docs/journal/YYYY-MM.md`를 아래 형식으로 작성. 파일이 있으면 사용자가 직접 쓴 내용은 보존하고 집계 섹션만 갱신.
4. 수치는 실제 조회 결과만 사용하고 추측하지 않는다. Public 저장소이므로 개인 정보·비밀 값 제외.
5. `commit` 스킬 규칙으로 `docs(journal): YYYY-MM 월간 일지` 커밋.

## 형식
```markdown
# YYYY-MM 월간 일지

## 요약
(3줄 이내)

## 지표
| 커밋 | 머지된 PR | 닫힌 이슈 | 열린 이슈 |

## 주요 활동
- 날짜: 내용 (#PR)

## 완료한 이슈 / PR
## 결정 사항 (ADR)
## 이슈 리포트
- 마일스톤별 진행률, 막힌 이슈, loop-ready 대기 목록
## 배운 점 (docs/learning 링크)
## 다음 달 계획
```
