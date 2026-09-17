# GitHub 활용: gh, CI 워크플로, Secret scanning, 라벨, 마일스톤

## 핵심 개념

### gh — GitHub CLI
- 터미널에서 GitHub를 조작하는 공식 명령어 도구. 웹에서 누르던 작업을 명령으로 한다.
- 예: `gh issue create`(이슈 생성), `gh pr create`(PR 생성), `gh pr view 10`(PR 상태), `gh repo create`(저장소 생성)
- Claude Code가 이슈·PR을 자동으로 다룰 수 있는 통로다.
- 로그인 토큰에는 **scope(권한 범위)**가 있다. `repo`만으로는 `.github/workflows/` 파일을 push할 수 없어 `workflow` scope를 추가했다.

### CI 워크플로 (GitHub Actions)
- 이 프로젝트에서 "CI 워크플로"는 **`.github/workflows/ci.yml` 파일로 정의하는 GitHub Actions 자동 검사**를 뜻한다.
- 동작: PR을 올리거나 push하면 GitHub 서버가 깨끗한 가상 머신에서
  1. 코드 내려받기 → 2. `npm ci`(의존성 설치) → 3. `npm run lint`(코드 규칙) → 4. `npx tsc --noEmit`(타입 검사) → 5. `npm test`(테스트)
- 결과가 PR 화면에 ✅/❌로 표시된다 → **폰에서 PR만 보고도 머지해도 되는지 판단**할 수 있다.
- AI가 만든 PR을 사람이 전부 읽지 않아도 되게 해주는 최소 안전장치다.
- 브랜치 보호 규칙에서 "CI 통과 필수"로 설정하면 ❌인 PR은 머지 버튼이 막힌다.

### Secret scanning / Push protection
- **Secret scanning**: GitHub가 저장소의 코드와 커밋 이력에서 알려진 형식의 비밀 값(AWS 키, GitHub 토큰, OpenAI 키 등)을 찾아 경고한다. Public 저장소는 무료다.
- **Push protection**: 한 단계 더 나아가, 비밀 값이 들어간 커밋은 **push 자체를 거부**한다. 올라간 뒤 지우는 것보다 훨씬 안전하다(Public에 한 번 올라가면 이미 유출된 것으로 봐야 함).
- 한계: 알려진 형식만 잡는다. 개인 서버 URL, 직접 만든 토큰은 못 잡으므로 커밋 전 점검(`commit` 스킬)과 병행한다.

### 라벨 (Labels)
- 이슈·PR에 붙이는 **태그**. 여러 개 동시에 붙일 수 있다. 목적은 분류와 필터링이다.
- 이 저장소 라벨 체계:
  | 라벨 | 의미 |
  |---|---|
  | `type:feature/bug/docs/chore/needs` | 작업 종류 |
  | `area:widget/dashboard/infra` | 영역 |
  | `priority:high/low` | 우선순위 |
  | `loop-ready` | AC가 명확해 AI가 `/loop`로 알아서 처리해도 되는 이슈 |
- 필터 예: 이슈 검색창에 `is:open label:loop-ready`

### 마일스톤 (Milestones)
- 이슈·PR을 **목표 단위로 묶는 그룹**. 이슈 1개는 마일스톤 1개에만 속한다.
- 닫힌 이슈 비율로 **진행률(%)**을 자동 표시하고, 마감일을 설정할 수 있다.
- 이 저장소: `M0 기반`(스캐폴딩·CI) → `M1 MVP`(대시보드·기본 위젯)
- 라벨은 "무슨 종류냐", 마일스톤은 "어느 목표(릴리스)에 들어가냐"로 구분하면 쉽다.

## 이 프로젝트 적용
- 이슈 생성: `issue` 스킬이 라벨·마일스톤을 자동으로 붙인다.
- CI: SRS-002 (#2)에서 `.github/workflows/ci.yml` 추가 예정.
- 저장소 설정: secret scanning + push protection 활성화 완료 (2026-09-16).

## 삽질 / 주의점
- `gh auth login` 기본 토큰에는 `workflow` scope가 없다 → CI 파일 push 전 `gh auth refresh -s workflow` 필요.
- 자세한 설치·PATH 문제는 [claude-code-remote-work.md](claude-code-remote-work.md) 참고.

## 참고
- GitHub CLI: https://cli.github.com/manual/
- GitHub Actions: https://docs.github.com/actions
- Secret scanning: https://docs.github.com/code-security/secret-scanning
- 마일스톤: https://docs.github.com/issues/using-labels-and-milestones-to-track-work
