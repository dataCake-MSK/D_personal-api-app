# Expo 스캐폴딩과 폰(Expo Go) 원격 미리보기

## 핵심 개념
- **Expo Go**: 스토어에서 받는 Expo 앱 실행기. 내 앱을 설치하지 않고 개발 서버에 접속해 실행한다. **스토어 버전은 최신 SDK만 지원**하므로 프로젝트도 최신 SDK(현재 57)로 만든다.
- **개발 서버(Metro)**: PC에서 `npx expo start`로 띄우며, 코드를 저장하면 폰 화면이 자동 갱신된다.
- **연결 방식**
  | 방식 | 조건 |
  |---|---|
  | LAN(기본) | PC와 폰이 같은 Wi‑Fi |
  | tunnel (`--tunnel`) | 인터넷만 되면 어디서든. ngrok 공개 주소(`…exp.direct`) 사용, 조금 느림 |
- **Expo 계정 로그인**: PC(`npx expo login`)와 폰의 Expo Go에 같은 계정으로 로그인하면, 폰의 개발 서버 목록에 프로젝트가 나타나 QR·URL 없이 탭으로 연다.

## 이 프로젝트 적용 (#1, PR #12)
1. `create-expo-app`은 빈 폴더에만 생성되므로 scratchpad에 만든 뒤 필요한 파일만 복사
2. 초기화 스크립트(`reset-project`)로 예제 화면 제거, `src/app` 구조 유지
3. `npx expo start --tunnel --go`를 Claude가 백그라운드 실행
4. PC에서 `npx expo login` → 폰 Expo Go에서 같은 계정 로그인 → 목록에서 프로젝트 탭 → 화면 확인

- 요청: 폰에서 "앱 띄워줘" / 끝나면 "서버 꺼줘"

## 삽질 / 주의점
1. **폰 Expo Go에 URL 입력란이 없었다.** 터미널 QR은 폰 화면에서 스캔할 수 없어, 계정 로그인 방식으로 해결했다.
2. **`npx expo login --browser` 실패**: 인증이 끝나면 PC의 `localhost`로 돌아오는 구조라 폰에서는 완료할 수 없다. PC의 별도 터미널에서 아이디·비밀번호로 로그인했다. 폰에서 보낸 `!` 명령은 입력을 받을 수 없다.
3. **`CI=1`로 실행하면 자동 새로고침(watch)이 꺼진다.** 백그라운드 실행에서도 `CI`를 주지 않는다.
4. **`@expo/ngrok`을 전역 설치했는데 Expo가 못 찾았다.** 프로젝트 개발 의존성(`npm i -D @expo/ngrok`)으로 설치해 해결했다.
5. **백그라운드 실행 시 터미널에 주소·QR이 안 나온다.** ngrok 로컬 API(`http://127.0.0.1:4040/api/tunnels`)의 `public_url`로 주소를 얻는다.
6. 로그인 전 주소는 `…-anonymous-8081.exp.direct`, 로그인 후는 `…-<계정>-8081.exp.direct`로 바뀌므로 서버 재시작 후엔 새 주소를 써야 한다.

## 화면 테스트 주의점 (RNTL 14, 2026-09-20)
- `render`뿐 아니라 **`fireEvent`도 Promise를 반환**한다. `await`을 빠뜨리면 버튼을 눌러도 화면이 갱신되기 전에 검증이 실행돼, 모달이 안 열린 것처럼 보인다.
```tsx
await render(<DashboardScreen />);
await fireEvent.press(screen.getByText('+ 위젯 추가'));
```
- 화면 테스트는 "글자가 보이는가" 수준까지만 확인한다. 배치·터치감·실제 기기 동작은 Expo Go로 봐야 한다.

## 패키지 고를 때 (2026-09-22)
- **Expo Go는 미리 포함된 네이티브 모듈만 쓸 수 있다.** 같은 기능이라도 커뮤니티 패키지(`react-native-linear-gradient`)가 아니라 Expo 패키지(`expo-linear-gradient`)를 설치해야 Expo Go에서 동작한다.
- 차트 라이브러리처럼 다른 패키지에 의존하는 경우, 그 의존 패키지가 Expo Go 호환인지도 확인한다(`react-native-gifted-charts`는 두 gradient 패키지 중 설치된 쪽을 쓴다).
- 설치는 `npx expo install`을 쓴다. SDK에 맞는 버전을 골라 준다. `npx expo install --check`로 어긋난 버전을 확인할 수 있다.
- 일부 패키지는 최신 문법 그대로 배포되어 Jest가 읽지 못한다. 이때는 `transformIgnorePatterns`의 예외 목록에 추가하되, **jest-expo 기본 목록을 덮어쓰지 말고 이어받아** 수정한다.

## 참고
- Expo CLI (`--tunnel`): https://docs.expo.dev/more/expo-cli/
- Expo Go: https://expo.dev/go
- 관련 리포트: [모바일 미리보기 방법](../reports/2026-09-17-mobile-app-preview.md)
