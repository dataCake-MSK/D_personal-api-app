# 리포트: 보안 유의사항과 상시 적용 규칙

- 작성: 2026-09-20
- 상태: 확정(규칙은 `CLAUDE.md`에 반영)
- 범위: ① Public 저장소이기 때문에 생기는 위험 ② 이 앱(개인 API 대시보드)의 구조상 생기는 위험 ③ 개발 환경·자동화의 위험

## 1. 요약
- 가장 큰 위험은 **비밀 값(API 키·토큰)이 저장소나 앱 번들에 들어가는 것**이다. 한 번 Public에 올라가면 지운 뒤에도 유출된 것으로 봐야 하며, 키를 폐기·재발급하는 수밖에 없다.
- 두 번째는 **개인 정보가 문서에 남는 것**이다. 개인 서버 주소, 집 좌표, 계정 ID 같은 값은 코드보다 문서·일지·리포트에서 새어 나가기 쉽다.
- 세 번째는 **앱에 저장한 값의 보관 위치**다. 대시보드 구성은 AsyncStorage(평문), 키는 SecureStore(암호화)로 분리되어 있어야 한다.
- 현재 적용된 방어: Secret scanning + Push protection(활성), 커밋 전 패턴 점검(`commit` 스킬), SecureStore 사용(SRS-016), CI 검증.
- 이번에 추가로 정한 규칙은 8장과 `CLAUDE.md` "보안" 절에 있다.

## 2. Public 저장소이기 때문에 생기는 위험

| # | 위험 | 왜 문제인가 | 대응 |
|---|---|---|---|
| P1 | 키·토큰 커밋 | 커밋 이력에 남아 되돌려도 조회 가능. 봇이 수분 내 스캔 | Push protection(활성), `commit` 스킬 패턴 점검, `.env*` 커밋 금지 |
| P2 | 개인 식별 정보 노출 | 문서·일지·스크린샷의 집 좌표·개인 URL·이메일·기기명 | 문서에 실제 값 대신 자리표시자(`<내 서버>`), 좌표는 공개 지점(서울시청 등) |
| P3 | 내부 엔드포인트 공개 | 개인 서버 주소가 알려지면 공격 대상이 됨 | URL은 앱 설정에만 입력, 저장소에는 예시만 |
| P4 | GitHub Actions 악용 | 외부인이 PR을 열어 워크플로를 실행시킬 수 있음. `pull_request_target`은 저장소 권한으로 실행돼 특히 위험 | `pull_request` 트리거만 사용(현재 그러함), `pull_request_target`·self-hosted runner 금지 |
| P5 | Actions 권한 과다 | 기본 토큰 권한이 넓으면 워크플로 침해 시 피해가 큼 | `permissions: contents: read` 명시, 서드파티 액션은 커밋 SHA로 고정 |
| P6 | 의존성 취약점 방치 | Public 저장소는 취약점도 공개 | Dependabot 보안 업데이트 활성화(현재 비활성 → 켤 것), `npm audit` 주기 확인 |
| P7 | 이슈·PR 본문 유출 | 오류 로그를 그대로 붙이면 토큰·경로가 함께 들어감 | 로그는 앞뒤를 잘라 붙이고 키 부분은 `***`로 |

## 3. 이 앱 구조상 생기는 위험

| # | 위험 | 대응 | 상태 |
|---|---|---|---|
| A1 | API 키가 평문 저장 | 키는 `expo-secure-store`(iOS Keychain / Android Keystore)에만, 대시보드 구성(AsyncStorage)에는 **이름 참조**(`{{secret:NAME}}`)만 | 적용(SRS-016) |
| A2 | 키가 화면·로그에 노출 | 입력은 `secureTextEntry`, 목록은 이름 + 마스킹, 저장 후 입력란 비움, 치환 결과는 요청 직전에만 사용 | 적용 |
| A3 | 오류 메시지에 키 포함 | 요청 실패 시 헤더·URL 전체를 그대로 보여주지 않기. 표시 전에 비밀 값 자리표시자로 되돌리기 | **#6·#8에서 적용 필요** |
| A4 | 임의 URL 호출(SSRF 유사) | 사용자가 넣는 URL이므로 앱 스스로 위험. 최소한 `https://`만 허용하고 `http://`는 경고 | **#6에서 적용 필요** |
| A5 | 응답을 그대로 렌더 | 텍스트로만 표시(HTML/스크립트 실행 없음). RN은 기본적으로 안전하나 WebView 도입 시 위험 | WebView 도입 시 ADR |
| A6 | 대시보드 export/import | 나중에 구성을 내보낼 때 키 참조가 아니라 실제 키가 섞이지 않도록 | 기능 추가 시 검토 |
| A7 | 전송 위젯 오작동 | 버튼 한 번에 외부로 요청이 나감(삭제 API 등) | 실행 전 확인 옵션(SRS-015에 이미 포함) |

## 4. 개발 환경·자동화 위험

| # | 위험 | 대응 |
|---|---|---|
| E1 | 터널 주소 공개 | `expo start --tunnel`은 인터넷에서 접근 가능한 주소를 만든다. 확인이 끝나면 서버를 끈다(규칙 적용됨) |
| E2 | 토큰을 대화로 전달 | Expo·GitHub 토큰을 채팅에 붙여넣지 않기. 필요하면 PC 터미널에서 로그인 |
| E3 | `EXPO_PUBLIC_` 환경변수 | 앱 번들에 평문으로 박힌다. 비밀 값에 쓰지 않기 |
| E4 | 빌드·배포 자격증명 | EAS 토큰 등은 GitHub Secrets에만, 로그 출력 금지 |
| E5 | AI 자동 작업 | 자체 머지 대상에서 보안 관련 변경은 제외(🔴 유지) |

## 5. 현재 저장소 설정 점검 (2026-09-20)
| 항목 | 상태 |
|---|---|
| 공개 여부 | Public |
| Secret scanning | ✅ 활성 |
| Push protection | ✅ 활성 |
| Dependabot 보안 업데이트 | ❌ 비활성 → **켜는 것 권장** |
| CI 트리거 | `pull_request`, `push(main)` — `pull_request_target` 미사용 ✅ |
| CI 토큰 권한 | 미지정 → `permissions: contents: read` 명시 권장 |
| 액션 버전 | `actions/checkout@v4`, `actions/setup-node@v4` (공식 액션, 태그 고정) |

## 6. 만약 키가 새어 나갔다면
1. **키를 먼저 폐기·재발급**한다. 커밋을 지우는 것보다 우선이다.
2. 저장소에서 제거(이력 재작성이 필요하면 별도 작업)하고, 어디에 쓰였는지 확인한다.
3. 일지에 남기고, 같은 실수가 반복되지 않도록 규칙·점검 항목을 고친다.

## 7. 커밋 전 점검 항목 (PR 체크리스트로 사용)
- [ ] 키·토큰·비밀번호 문자열이 없는가 (`api[_-]?key`, `token`, `secret`, `Bearer `, `sk-`, `gho_`, `ghp_`)
- [ ] `.env*`, 인증서(`*.p8`, `*.p12`, `*.key`, `*.pem`)가 포함되지 않았는가
- [ ] 문서·일지·리포트에 개인 URL·좌표·계정 정보가 없는가
- [ ] 테스트가 실제 키 없이 목으로 동작하는가
- [ ] 오류 메시지·로그에 비밀 값이 들어갈 경로가 없는가

## 8. 상시 적용 규칙 (CLAUDE.md 반영)
1. 모든 작업에서 위 7장 점검을 커밋 전에 수행한다.
2. 비밀 값은 `expo-secure-store`에만 저장하고, 다른 저장소·상태·로그에 복사하지 않는다. 치환 결과는 요청 직전에만 사용한다.
3. 네트워크 오류·응답을 화면이나 로그에 표시할 때 비밀 값이 포함되지 않도록 가린다.
4. 사용자 입력 URL은 `https://`를 기본으로 하고 `http://`는 경고를 표시한다.
5. 문서에 실제 엔드포인트·좌표·계정 대신 자리표시자나 공개 예시를 쓴다.
6. 보안 관련 변경(인증, 키 취급, 권한, 저장소 설정, CI 권한)은 🔴 등급으로 착수 전에 사용자에게 확인한다.
7. 의존성 추가 시 다운로드 수·최근 갱신·대안 유무를 확인하고, 불필요하게 넓은 권한을 요구하는 패키지는 쓰지 않는다.

## 9. 결정 필요 사항
| # | 결정 | 권장 |
|---|---|---|
| S1 | Dependabot 보안 업데이트 활성화 | 켜기 (Public 저장소는 무료) |
| S2 | CI에 `permissions: contents: read` 추가 | 적용 |
| S3 | PR 템플릿에 보안 점검 항목 추가 | 적용 |

## 참고
- Expo 환경변수 보안: https://docs.expo.dev/guides/environment-variables/
- expo-secure-store: https://docs.expo.dev/versions/latest/sdk/securestore/
- GitHub Actions 보안 강화: https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions
- GitHub Secret scanning: https://docs.github.com/code-security/secret-scanning
