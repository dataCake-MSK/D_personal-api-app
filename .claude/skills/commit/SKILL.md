---
name: commit
description: 현재 변경 사항을 논리 단위로 나눠 Conventional Commit으로 커밋하고, 작업 브랜치 push 후 PR까지 생성한다. "커밋해줘", "PR 올려줘", 작업 완료 후 형상관리 시 사용.
---

# commit — 자동 형상관리

## 원칙
- main에 직접 커밋·push 하지 않는다. 머지는 사용자가 한다.
- 비밀 값이 섞였으면 즉시 중단하고 사용자에게 알린다.

## 절차
1. 상태 파악: `git status`, `git diff`, `git diff --staged`, `git log --oneline -10`, 현재 브랜치.
2. 보안 점검: 변경분에서 키/토큰 패턴(`api[_-]?key`, `token`, `secret`, `Bearer `, `sk-`, 긴 base64/hex 문자열), `.env*` 파일 포함 여부 확인. 의심되면 중단.
3. 브랜치: main이면 추적 ID·성격에 맞게 `feat|fix|docs|chore/SRS-xxx-짧은설명` 브랜치를 만든다. 추적 ID를 모르면 관련 이슈/SRS에서 찾고, 없으면 ID 없이 이름만.
4. 논리 단위 분할: 서로 다른 목적(기능 / 테스트 / 문서 / 설정)이 섞여 있으면 파일 단위로 나눠 여러 커밋. `git add <파일>`로 명시적 스테이징(`git add .` 금지).
5. 커밋 메시지: `type(scope): 설명 (SRS-xxx)` — type은 feat, fix, docs, test, refactor, chore, ci. 본문에는 "왜"를 1~2줄. 시스템이 지정한 Co-Authored-By 줄을 끝에 붙인다.
6. 문서 동기화 확인: 기능 변경이면 `docs/requirements/SRS.md` AC 체크와 `traceability.md`의 PR/상태 칸을 함께 갱신해 `docs` 커밋에 포함.
7. push: `git push -u origin <브랜치>`.
8. PR: 이미 열린 PR이 있으면 push로 끝. 없으면 `.github/pull_request_template.md` 형식으로 `gh pr create` (본문에 `Closes #n`, 추적 ID, 수행한 테스트). 
9. 보고: 커밋 목록, 브랜치, PR URL을 짧게.

## 인자
- `--no-pr`: push까지만
- `--local`: 커밋만 (push/PR 없음)
