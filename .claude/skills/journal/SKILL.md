---
name: journal
description: git 커밋·GitHub 이슈/PR·ADR·학습노트를 집계해 docs/journal/YYYY-MM-DD.md 일간 일지를 작성·갱신한다. "일지", "오늘 정리", "일간 일지", "회고" 요청 시 사용.
---

# journal — 일간 일지

## 인자
- `YYYY-MM-DD` (생략 시 오늘). 여러 날짜를 주면 날짜별로 각각 작성.

## 절차
1. 기간: 해당 날짜 00:00 ~ 23:59 (로컬 시간, +0900).
2. 수집:
   - `git log --all --since="<날짜> 00:00" --until="<날짜> 23:59" --pretty=format:"%h %ad %s" --date=iso`
   - `gh pr list --state merged --search "merged:<날짜>" --json number,title,mergedAt`
   - `gh pr list --state open --json number,title,createdAt` (그날 생성분)
   - `gh issue list --state closed --search "closed:<날짜>" --json number,title`
   - `gh issue list --state open --json number` (개수)
   - 그날 추가/수정된 `docs/architecture/adr/*`, `docs/learning/*`, `docs/issues/*` (`git log --name-only`)
   - 커밋에 드러나지 않은 작업(설정, 조사, 막힌 점)은 대화 맥락에서 보충
3. `docs/journal/YYYY-MM-DD.md`를 아래 형식으로 작성. 파일이 있으면 사용자가 직접 쓴 내용은 보존하고 집계 섹션만 갱신.
4. 활동이 전혀 없는 날은 파일을 만들지 않는다.
5. 수치는 실제 조회 결과만 사용하고 추측하지 않는다. Public 저장소이므로 개인 정보·비밀 값 제외.
6. `commit` 스킬 규칙으로 `docs(journal): YYYY-MM-DD 일간 일지` 커밋.

## 형식
```markdown
# YYYY-MM-DD 일간 일지

## 요약
(1~2줄)

## 지표
| 커밋 | 머지된 PR | 닫힌 이슈 | 열린 이슈 |

## 주요 활동
- 내용 (#이슈/#PR)

## 완료한 이슈 / PR
## 결정 사항 (ADR)
## 막힌 점 / 이슈
## 배운 점 (docs/learning 링크)
## 다음 계획
```
