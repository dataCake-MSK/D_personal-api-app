---
name: report
description: 개발 진행 계획, 진행 현황, 개발 체계·기술 검토 결과를 docs/reports/ 리포트 문서로 작성·갱신한다. "리포트", "리포트 작성", "리포트로 남겨줘", "검토해서 정리", "진행 계획 정리", "현황 정리" 요청 시 사용. GitHub 이슈 생성은 issue 스킬.
---

# report — 리포트 작성

> "이슈"는 GitHub 이슈만 가리킨다. 이 스킬의 산출물은 "리포트"다.

## 인자
- 주제 (예: `개발 진행 계획`, `CI 도구 검토`, `현황`)

## 절차
1. 사실 수집 — 추측하지 않는다.
   - 현황: `gh issue list --state all --json number,title,state,labels,milestone,updatedAt --limit 200`, `gh pr list --state all --limit 50`
   - 요구사항: `docs/requirements/SRS.md`, `traceability.md`
   - 외부 기술 검토: 공식 문서를 WebFetch/WebSearch로 확인하고 참고 링크를 남긴다. 확인 못 한 내용은 "확인 필요"로 표시.
2. 같은 주제의 기존 리포트가 있으면 새 파일 대신 `## 갱신 (YYYY-MM-DD)` 섹션을 추가한다.
3. 새 리포트는 `docs/reports/YYYY-MM-DD-<주제-kebab-case>.md`.
   - 첫 줄 `# 리포트: <제목>`, 다음 줄에 작성일·상태(제안/확정/완료)·관련 이슈
   - 구성: 요약 → 현황(표) → 분석/계획 → 결정 필요 사항 → 참고
   - 사용자가 폰(GitHub 모바일)으로 읽으므로 표·짧은 문장 위주, 도식은 Mermaid 우선(필요 시 PlantUML 병기)
4. `docs/reports/README.md` 목록 갱신.
5. 결정 필요 사항이 있으면 응답에서 사용자에게 짧게 묻는다.
6. 형상관리는 `commit` 스킬 규칙(리포트만 바뀐 경우 자체 머지 대상).
