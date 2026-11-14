# 작업 맥락

- 2026-10-13: 기존 cwd는 이동됐고 실제 리포는 `Desktop/지영/ER/Visual Studio Code/ER-Website`다. 기존 추적 파일 수정은 없고 untracked output/tmp/.claude는 사용자 산출물로 보존한다.
- 현재 origin/main은 `6b3d710`; 최신 AGENTS는 Codex의 PR 병합·CI 배포 조율을 허용한다. 직접 wrangler 배포는 금지한다. 사이트와 검사 변경은 별도 PR로 분리한다.
- `js/test.js`가 영어 사용자에게 한국어 결과 전용이라는 안내를 표시한다. 본문 데이터와 렌더러를 함께 현지화해야 해결된다. 새 런타임 파일은 기존 deploy allowlist에서 빠질 수 있어 현재 모듈 안에서 처리한다.
- 실제 운영은 `word-narrative-v2`; `tests/simulate.mjs`는 미로드 `test-scoring.js` helper를 검증한다. 합성 입력으로 얻은 통과율은 실제 사용자 판별 정확도가 아니다.
- 자동화 paused 상태는 그대로 유지하며 이번 사용자 수동 요청만 수행한다. 별도 진행 중인 PR #160/#161은 검사 평가 기능에 대한 참고이며 이번 수정에 자동 병합하지 않는다.

- 최종 통합 145/145 및 관련 site 53/53 통과. 실제 Chrome 한국어·영어 320/375/1280px 완료/저장 복원/공유/인쇄 정상. 영어 콘텐츠 216개 한글 없음, 한국어216개 JSON 기존과동일.
- v2 빠른 응답 감지 최소 응답을 8로 보완했다. 기존20 기준과 가중치는 유지한다. 7개 이하/누락타이밍/정상속도 오탐 방지 검사 추가.
- 실제 Supabase 실험 테이블은 개인정보 없는 집계로0건 확인. 독립 상담 확인 자료가 없어 실측 정확도 또는 자기보고 일치율을 제시하지 않는다.
- PR #169(site) 병합 및 production 배포 성공과 실제 메뉴 이름 반영 확인. 영어 결과/분석기는 별도 test PR으로 제출한다.

- PR #170(test) 병합 commit0d89d959 및 CI38363480410 전체success. 실제 production KO/EN검사·복원·공유·인쇄·320/375/1280px 확인. runtime JS/CSS5개 sourcehash일치,HTMLCloudflare beacon 정규화후일치. 운영증거·체크리스트·리뷰 완료상태 갱신.
