---
name: commit
description: 변경 사항을 논리 단위로 Conventional Commit하고 브랜치 push → PR → 머지 등급에 따른 머지·브랜치 삭제·요약 보고까지 형상관리 전체를 처리한다. "커밋해줘", "PR 올려줘", "머지해줘", 작업 완료 후, 또는 Stop 훅이 형상관리 누락을 알렸을 때 사용.
---

# commit — 자동 형상관리

## 원칙
- main에 직접 커밋·push 하지 않는다.
- 머지 여부는 `CLAUDE.md`의 **머지 등급**을 따른다.
- 비밀 값이 섞였으면 즉시 중단하고 사용자에게 알린다.
- 사용자가 직접 작업 중인 것으로 보이는 무관한 변경은 커밋하지 않고 알린다.

## 절차
1. 상태 파악: `git status`, `git diff`, `git diff --staged`, `git log --oneline -10`, 현재 브랜치, 열린 PR(`gh pr list --head <브랜치>`).
2. 보안 점검: 변경분에서 키/토큰 패턴(`api[_-]?key`, `token`, `secret`, `Bearer `, `sk-`, `gho_`, `ghp_`, `expo_`, 긴 base64/hex 문자열), `.env*` 파일 포함 여부 확인. 의심되면 중단.
3. 브랜치: main이면 추적 ID·성격에 맞게 `feat|fix|docs|chore/SRS-xxx-짧은설명` 브랜치를 만든다. 추적 ID가 없으면 이름만.
4. 문서 동기화(같은 PR에 포함):
   - 기능 변경 → `SRS.md` AC 체크, `traceability.md` PR·상태 칸
   - 오늘 일지 → `journal` 스킬 (오늘 커밋된 작업이 일지에 없으면)
   - 사용자가 새로 배운 개념·시행착오 → `learn` 스킬
   - 계획·결정 상태가 바뀐 리포트 → `## 갱신 (날짜)` 추가
5. 논리 단위 분할: 목적(기능 / 테스트 / 문서 / 설정)별로 파일을 나눠 여러 커밋. `git add <파일>`로 명시적 스테이징(`git add .` 금지).
6. 커밋 메시지: `type(scope): 설명 (SRS-xxx)` — type은 feat, fix, docs, test, refactor, chore, ci. 본문에 "왜"를 1~2줄. 시스템이 지정한 attribution 줄을 끝에 붙인다.
7. push: `git push -u origin <브랜치>`.
8. PR: 열린 PR이 있으면 push로 끝. 없으면 `.github/pull_request_template.md` 형식으로 `gh pr create` (본문에 `Closes #n`, 추적 ID, 수행한 테스트, 머지 등급).
   - PR 번호를 추적표에 적어야 하면 생성 후 번호를 확인해 추가 커밋·push.
9. 머지 등급 판단:
   - 🟢 → CI가 있으면 `gh pr checks <n> --watch`로 통과 확인 → `gh pr merge <n> --merge --delete-branch` → `git switch main && git pull && git fetch --prune`
   - 🟡 / 🔴 → 머지하지 않고 사용자 확인 대기
10. 보고:
    - 머지했으면 **머지까지 한 일 요약**: 변경 내용, 검증 방법·결과, PR·닫힌 이슈 번호, 브랜치 정리 상태
    - 대기면: PR URL, 등급과 이유, 사용자가 확인할 점(실기기 확인 방법 포함)

## 인자
- `--no-pr`: push까지만
- `--local`: 커밋만 (push/PR 없음)
- `--no-merge`: 🟢여도 머지하지 않음
