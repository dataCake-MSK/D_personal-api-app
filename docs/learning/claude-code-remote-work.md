# Claude Code 원격 작업 환경: Scratchpad, Remote Control, gh 설치 삽질

## 핵심 개념

### Scratchpad
- Claude Code가 세션마다 제공하는 **임시 작업 폴더**(Windows 임시 디렉터리 아래). 프로젝트 저장소 밖에 있다.
- 일회성 스크립트나 중간 결과물을 두는 곳이라 git에 섞이지 않는다.
- 예: SRS.md를 읽어 이슈 9개를 한 번에 만든 `srs-issues.js`를 여기서 만들어 실행했다. 저장소엔 결과(이슈·문서 변경)만 남았다.

### Remote Control
- PC에서 돌고 있는 Claude Code 세션에 **폰(Claude 앱)으로 접속**해 대화하는 기능. `/remote-control`로 연결.
- 실제 명령 실행은 PC에서 일어난다 → PC와 세션이 켜져 있어야 한다.

### `!` 접두사
- 입력창에 `! 명령`을 치면 Claude를 거치지 않고 셸 명령을 바로 실행한다.
- **폰(Remote Control)에서 보낸 `!`는 명령으로 실행되지 않고 일반 메시지로 전달됐다.** 폰에서는 "이 명령 실행해줘"라고 요청하면 된다.

## 삽질 / 주의점 (2026-09-16)
1. **설치 직후 `gh: command not found`**
   - 원인: 프로그램 설치 시 시스템 PATH는 바뀌지만, **이미 열려 있던 프로그램은 옛 PATH를 그대로 들고 있다.**
   - Claude Code만 재시작해도 부족했다. Claude Code를 띄운 **터미널 → 그 터미널을 띄운 IDE(VS Code 등)**까지 옛 PATH를 물려준다.
   - 해결: IDE를 완전히 재시작하거나, 전체 경로 `"C:\Program Files\GitHub CLI\gh.exe"`로 실행.
2. **명령 오타**: `gh auto refresh` → 올바른 명령은 `gh auth refresh`.
3. **기기 인증 코드 만료**: `gh auth login --web`은 코드 승인을 기다리는 동안 실행 중이어야 한다. 승인 전에 세션을 끝내면 코드가 무효가 돼 다시 받아야 했다.
4. **자동 모드 권한 차단**: 사용자가 명시하지 않은 계정 권한 부여 명령은 auto mode가 막았다. 사용자가 직접 요청하자 실행됐다.

## 훅(hook) 다루기 (2026-09-18)
- 훅은 `.claude/settings.json`에 등록하고, **세션이 시작될 때 읽힌다.** 훅을 설치한 세션에는 적용되지 않으므로 재시작(또는 `/hooks`) 후에 확인한다.
- Stop 훅은 Claude가 턴을 끝내려 할 때 실행된다. `{"decision":"block","reason":…}`을 출력하면 종료가 막히고 Claude가 그 이유를 받아 이어서 처리한다.
- 입력 JSON의 `stop_hook_active`가 true면 그대로 통과시켜야 무한 반복을 피할 수 있다.
- 훅 스크립트는 표준 입력으로 JSON을 받으므로, 터미널에서 `echo '{}' | node <스크립트>`로 미리 확인할 수 있다.
- 설치한 세션에서는 auto mode가 훅 시험 실행을 "자기 수정"으로 보고 막을 수 있다. 재시작 후에는 막히지 않았다.

## 참고
- Claude Code 문서: https://docs.claude.com/en/docs/claude-code
- 훅: https://docs.claude.com/en/docs/claude-code/hooks
