# Git 브랜치·PR·머지 기초와 이력 읽는 법

## 핵심 개념

### 브랜치 → PR → 머지 흐름
```
이슈(#n) ─→ 작업 브랜치 ─→ 커밋들 ─→ PR ─→ 머지(main) ─→ 이슈 자동 닫힘 ─→ 브랜치 삭제
 할 일        작업 공간       기록       검토 요청    반영
```
- **브랜치**: main을 건드리지 않고 작업하는 별도 갈래.
- **PR(Pull Request)**: "이 브랜치를 main에 합쳐도 될까요?"라는 검토 요청 페이지. 변경 파일·설명·CI 결과가 모인다.
- **승인(Approve)과 머지는 다르다.** 승인은 리뷰어가 "괜찮다"고 표시하는 선택 단계이고, 머지는 실제로 합치는 동작이다. 이 저장소는 승인 없이 머지할 수 있다.
- PR 본문에 `Closes #n`이 있으면 머지 시 해당 이슈가 자동으로 닫힌다.

### 커밋 종류 (부모 커밋 수로 구분)
| 종류 | 부모 수 | 설명 |
|---|---|---|
| 첫 커밋(root) | 0 | 저장소의 첫 커밋 |
| 일반 커밋 | 1 | 파일 변경 기록 |
| 머지 커밋 | 2+ | 두 갈래가 합쳐진 지점. `Merge: <main 쪽> <브랜치 쪽>` 줄이 붙는다 |

- revert(되돌리기), cherry-pick(다른 브랜치 커밋 복사), squash(여러 커밋을 하나로)는 결과적으로 일반 커밋이다.

### GitHub 머지 방식 3가지
| 방식 | 결과 |
|---|---|
| **Create a merge commit** (이 저장소 기본) | 작업 커밋 유지 + 머지 커밋 추가. 그래프에 갈래가 남음 |
| Squash and merge | 작업 커밋을 하나로 합쳐 main에 일반 커밋 1개 |
| Rebase and merge | 작업 커밋을 main 끝에 이어 붙임. 머지 커밋 없음 |

### gh (GitHub CLI)
- GitHub 공식 명령줄 도구. 웹에서 누르던 동작을 명령으로 한다.
- `gh pr merge 12 --merge --delete-branch` = 웹의 **Merge pull request** 버튼 + 브랜치 삭제. **머지 커밋은 PC가 아니라 GitHub 서버에서 만들어지고**, 로컬은 그 결과를 pull로 받는다.
- 로그인한 계정 권한으로 동작하므로 이력에는 계정 명의로 남는다.

### 머지 후 브랜치 삭제
- 머지하면 브랜치 커밋이 main에 모두 들어가므로 브랜치는 지운다. 커밋 기록과 PR 페이지는 남고, PR 화면에서 브랜치 복구도 가능하다.
- 저장소 설정 "Automatically delete head branches"를 켜면 웹·모바일에서 머지할 때도 자동 삭제된다.

## 이 프로젝트 적용: 이력 읽는 법
```
*   7bbf521 Merge pull request #12 from dataCake-MSK/feat/SRS-001-expo-scaffold   ← 머지 커밋
|\
| * 04098f8 docs: SRS-001 완료 반영 …                                          ← 브랜치의 일반 커밋
| * 65cd5ee chore(app): Expo SDK 57 … 스캐폴딩
|/
*   388da64 Merge pull request #11 …                                             ← 이전 main
```
- `git log --oneline --graph`로 보면 갈래 구조가 보인다.
- 머지 커밋 작성자 `MrAutoFin` = GitHub 계정 `dataCake-MSK`의 표시 이름(GitHub 서버가 계정 명의로 생성). 일반 커밋 작성자 = 로컬 git 설정(`Minsung Kang`).
- `Co-Authored-By: Claude …` = Claude와 공동 작성 표시, `Claude-Session` = 작업한 세션 링크.

## 머지 충돌 (2026-09-19, PR #17)
- **왜 생기나**: 두 PR이 같은 파일의 같은 위치를 각자 고치면, 먼저 머지된 쪽 이후 나중 PR이 "Conflicting"이 되어 GitHub 머지 버튼이 막힌다. 이번에는 #16(zustand)과 #17(zod)이 `package.json` 의존성 목록 끝에 각각 한 줄씩 추가했다.
- **폰에서 보이는 모습**: PR 화면에 "This branch has conflicts that must be resolved"가 뜨고 머지할 수 없다. 이때는 "충돌 해결해줘"라고 요청하면 된다.
- **해결 원리**: 작업 브랜치에 최신 main을 합친 뒤, 충돌 표시(`<<<<<<<`, `=======`, `>>>>>>>`) 사이에서 남길 내용을 고른다. 의존성은 둘 다 필요하므로 양쪽을 유지했다.
- `package-lock.json`처럼 **자동 생성 파일은 손으로 고치지 않고** 한쪽을 기준으로 둔 뒤 도구(`npm install`)로 다시 만든다.
- **예방**: 같은 파일을 건드릴 PR은 순서대로 머지하거나, 먼저 머지된 뒤에 다음 PR을 최신 main 기준으로 갱신한다.

## 폰에서 이력 확인
| 알고 싶은 것 | 볼 곳 |
|---|---|
| 뭐가 반영됐나 | GitHub 모바일 → Pull requests → Closed |
| 요구사항 진행 | Issues → Closed, Milestones, `docs/requirements/traceability.md` |
| 날짜별 활동 | `docs/journal/YYYY-MM-DD.md` |
| 커밋 흐름 | 저장소 → Commits |

## 참고
- GitHub 머지 방식: https://docs.github.com/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/about-pull-request-merges
- 브랜치 자동 삭제: https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-the-automatic-deletion-of-branches
