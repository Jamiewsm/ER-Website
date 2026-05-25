<!-- 코덱스/다음 에이전트가 사이트 재구성 작업을 이어받기 위한 인계 문서 -->

# Site Restructure — Handoff

**시작 세션 모델**: Claude Opus 4.7 (Plan mode → 실행)
**시작 날짜**: 2026-05-24
**원본 플랜**: `/Users/jwoo/.claude/plans/cached-munching-porcupine.md`
**현재 브랜치**: `refactor/site-restructure-tier-1-2-3` (local only — push 보류, 사용자가 코덱스에 위임)
**Commit 수**: 5 (f0d2e39, 954fc42, c7af5c2, 601e91b, c07268b)

---

## 0. 작업 배경

사용자 평가: er-coaching.com 의 Hero + 4 카드(Parenting/Couple/Team/Church)는 좋지만, 그 아래부터 "아마추어 같다". 반복 섹션과 정체성 모호함이 문제.

3 Explore agent 분석으로 검증된 핵심 병리:
- 손지영 대표 home/about/coaches 3중 노출
- "기독교 세계관 + 에니어그램 통합" 메시지 3곳 반복
- 운영 원칙 about/community/support 3곳 반복
- 통계 (300명+ 등) community/support 두 곳에 중복
- **치명적**: 목회자·선교사 신청 경로 (`ministry` track) 가 어느 페이지에서도 시작되지 않음

목표: 단일 메시지·단일 경로·단일 책임. 현대 SaaS 사이트 수준의 명료함.

---

## 1. 무엇을 했는가 (완료)

### 1.1. 코드 변경 — 7 commit, 7 파일 (+ HANDOFF 문서)

```
68c3041  refactor(nav+coaches): nav 순서 변경 + 7명 협력 코치를 coaches 페이지로 이동
9d85dc6  refactor(home): Stories 섹션 제거 — 4 카드 후기와 중복
91537d7  docs(site-restructure): 코덱스용 HANDOFF 인계 문서 추가
c07268b  refactor(tone+cta): 헤더 톤 사용자 중심으로 + featured 카드 CTA 위계 강화
601e91b  refactor(nav): 메뉴 정리 — 〔후원·협력 문의〕 nav 제거 + 〔공지사항〕 보조 자료 격하
c7af5c2  refactor(about+community): SSOT 확립 — 손지영 정본은 coaches, 운영 원칙은 about
954fc42  refactor(home): 하단부 재구성 — First Conversation/Who You Meet/Guide Cards 제거
f0d2e39  feat(support+programs): 목회자·선교사 신청 경로 복구 + 정체성 분리
```

**사용자 추가 요청 반영 (2026-05-24 후반)**:
- 홈 Stories 섹션이 4 카드 후기와 중복 → 제거 (`9d85dc6`)
- nav 의 〔코치 소개〕를 〔ER 소개〕 바로 다음으로 이동 + 7명 협력 코치진을 coaches 페이지로 이동 (`68c3041`)

#### support.js (`f0d2e39`)
- 통계 5박스 제거 (300명+/350회+/10곳/7명/20명+) — 정본은 community.js
- "사역지원 운영 방식" 좌측 카드에 **〔사역지원 신청하기〕 1차 CTA** (er-accent 색) 추가 → `renderSection('apply', { track: 'ministry' })`
- "후원이 사용되는 곳" 우측 카드에 **〔후원·협력 문의하기〕 2차 CTA** (outline) 추가 — 기존 버튼을 격하
- 좌/우 카드 상단에 〔받는 분 — 목회자·선교사〕 / 〔주는 분 — 후원·협력〕 배지 추가
- "함께 지키는 운영 원칙" 섹션 제거 → "ER 소개에서 자세히 확인" 한 줄로 대체

#### programs.js (`f0d2e39`)
- `updateProgramView` 의 introEl: `church` 탭일 때 "목회자·선교사 본인은 무료/감면 사역지원 트랙으로 안내드립니다. → 사역지원 보기" 안내 라인 추가
- 가격 정책 박스: `사역지원 트랙` 박스에 `사역지원 보기 →` 링크 버튼 추가

#### home.js (`954fc42` + `9d85dc6`)
- `founder` 변수 제거 (Who You Meet 섹션과 함께 삭제됨)
- **3 섹션 삭제** (라인 181-282):
  - First Conversation (Hero 톤 모순)
  - Who You Meet (대표 중복)
  - Guide Cards (분류 비일관)
- **Stories 섹션은 처음 추가했다가 사용자 피드백으로 다시 제거** (`9d85dc6`): 4 카드 안에 이미 후기 highlight 가 있어 직후 별도 Stories 가 중복으로 인식
- 최종 추가: Start Here — 진단 테스트 1차 CTA + 프로그램 둘러보기 2차 CTA
- 최종 home 구조: Hero + 4 카드 → Start Here CTA (2 섹션)

#### about.js (`c7af5c2` + `68c3041`)
- Founder 섹션 (사진 + 자격 4 박스, 라인 110-148) 삭제
- 대신 er-dark 배경의 〔코치 소개 보기〕(er-accent CTA) + 〔프로그램 보기〕(outline) 박스로 교체
- 손지영 사진·자격은 coaches.js 가 정본
- **"함께하는 코치진" 7명 이니셜 섹션 제거** (`68c3041`): coaches.js 가 7명 협력 코치 정본

#### community.js (`c7af5c2` + `c07268b`)
- "이 사역을 운영하는 방식" 4 박스 제거 (라인 103-120)
- 대신 "내 경우는 어디에 가까운가요?" 박스 추가:
  - 양육/부부/팀/교회 4 진입 카드 → programs (individual/individual/business/church)
  - 진단 테스트 CTA
- 헤더 톤 사용자 중심으로: "Stories / 먼저 회복을 경험한 분들의 이야기" — 메타 표현 ("이 섹션은 ...") 제거

#### index.html (`601e91b` + `68c3041`)
- 데스크톱 nav 10개 → 8개 (〔후원·협력 문의〕, 〔공지사항〕 제거)
- 모바일 nav 동일하게 〔후원·협력 문의〕 제거, 〔공지사항〕은 medium-weight 보조 항목으로 격하
- footer sitemap 에서도 〔후원·협력 문의〕 제거 (support 페이지에 통합)
- 〔공지사항〕은 footer sitemap 유지
- **nav 순서 변경** (`68c3041`): ER 소개 → **코치 소개** → 진단 테스트 → 유형 알아보기 → 서비스 안내 → 전문가 양성반 → 회복 이야기 → 사역지원. 정체성 카테고리 (ER 소개 + 코치 소개) 가 인접 묶음. 데스크톱/모바일/footer 모두 동일.

#### support.js (헤더 톤, `c07268b`)
- "Ministry Support / 사역지원과 후원" 으로 변경
- "목회자·선교사 본인은 무료/감면 사역지원 / 사역을 함께 세워주시는 분은 후원·협력" — 두 트랙(받는 분/주는 분) 즉시 안내
- 기존 무거운 운영 정책 첫 문장 제거

#### programs.js (CTA 위계, `c07268b`)
- featured 카드 (`c.featured = true`, 현재 "회복 여정 패키지") 신청 버튼: outline → er-accent 1차 CTA 로 승격
- 비featured 카드는 기존 outline 2차 유지

### 1.2. SSOT 검증 결과

ripgrep 으로 검증된 정본 위치:

| 자산 | 정본 | 비고 |
|---|---|---|
| 기독교 세계관 문구 | `about.js:41` | 1곳만 hit |
| 협력 기반의 사역 | `about.js:37` | 1곳만 hit |
| 통계 300명+ | `community.js:30` | 1곳만 hit |
| 7명 협력 코치 (김수잔 외) | `coaches.js:135` | 1곳만 hit (`68c3041`) |
| 손지영 사진 (`son-profile-picture`) | `coaches.js` (via ER_STRINGS) | sections 인라인 0 hit |
| 자격 4 (Enneagram Spectrum 등) | `coaches.js` (via ER_STRINGS) | sections 인라인 0 hit |
| First Conversation / "아직 무엇이 문제인지" | (없음) | 완전 제거 |

검증 명령:
```bash
rg -n "기독교 세계관" js/sections/
rg -n "협력 기반의 사역|빠른 해결보다 형성" js/sections/
rg -n "300명" js/sections/
rg -n "son-profile-picture" js/sections/
rg -n "Enneagram Spectrum|IEA Accredited|SOIM GLTC|DTS Counseling" js/sections/
rg -n "First Conversation|아직 무엇이 문제인지" js/sections/
```

### 1.3. 로컬 검증
- 5 파일 괄호/백틱 균형 OK (grep count 일치)
- Python http.server 8765 응답 정상 (HTTP 200)
- Node 없음 → `node --check` 실행 불가 (코덱스 환경에서 재실행 권장)

---

## 2. 무엇을 하고 있는가 (진행 중 / 보류)

### 2.1. PUSH / PR — 사용자가 코덱스에 위임
- 현재 commit 3개가 `refactor/site-restructure-tier-1-2-3` 브랜치에 local 상태
- Claude 환경에 GitHub 인증 없음 (SSH 키 / gh CLI / HTTPS 토큰 전부 없음)
- main 으로 직접 push 도 auto mode classifier 가 차단
- **코덱스 작업**: 이 브랜치를 push 하고 PR 열기 (#19 정도)
  ```bash
  git push -u origin refactor/site-restructure-tier-1-2-3
  gh pr create --title "refactor: site restructure (Tier 1-2 + home 3.1)" \
    --body "Plan: /Users/jwoo/.claude/plans/cached-munching-porcupine.md"
  ```

### 2.2. Tier 3 추가 작업 (이 세션에서 진행 중)
세션 진행 중 상태를 이 문서 §3 에 실시간 갱신.

---

## 3. 더 해야 할 일 (남은 작업)

원본 플랜의 Tier 3 / 추가 점검 항목.

### 3.1. Tier 3.2 — 분류 체계 일관화 [상태: DONE (Opus 4.7 세션)]

`index.html` nav 정리 적용:
- 데스크톱 nav 10개 → 8개
- 〔후원·협력 문의〕 제거 (support 페이지에 〔사역지원 신청〕〔후원·협력 문의〕 두 CTA로 통합됨)
- 〔공지사항〕 데스크톱 nav 제거, 모바일은 보조 톤으로 격하
- footer sitemap 에서도 〔후원·협력 문의〕 제거

**추가 격하 후보 (사용자 결정 필요)**:
- 〔전문가 양성반〕 — 일반 방문자 동선과 무관. nav 격하 검토.
- 〔유형 알아보기〕 — 진단 테스트 결과 페이지에 흡수하는 것도 가능.
- 이 둘은 사용자 의사가 분명히 없으므로 보수적으로 유지 중.

### 3.2. Tier 3.3 — CTA 위계 시각화 [상태: DONE (Opus 4.7 세션)]

3 단계 위계 적용 결과:
- **1차 (er-accent / er-dark 큰 버튼)**:
  - support.js 〔사역지원 신청하기〕 ✅
  - home.js Start Here 〔무료 진단 시작하기〕 ✅
  - about.js Next Step 〔코치 소개 보기〕 ✅
  - community.js Next Step 〔먼저 진단 테스트 해보기〕 ✅
  - programs.js featured 카드 신청 버튼 ✅ (`c07268b`)
- **2차 (outline 버튼)**:
  - support.js 〔후원·협력 문의하기〕 ✅
  - home.js Start Here 〔프로그램 둘러보기〕 ✅
  - about.js Next Step 〔프로그램 보기〕 ✅
  - programs.js 비featured 카드 ✅
- **3차 (텍스트 링크)**:
  - 각 페이지 보조 안내 (예: support.js 의 "ER 소개에서 확인", programs.js church 탭의 "사역지원 보기")

**의도적 보존**:
- coaches.js 의 코치별 〔상담 신청하기〕 — 모든 코치 카드가 동등한 entity 이므로 동일 위계가 정당. 변경 안함.
- 홈 4 카드 각각의 〔ER팀과 상담해보세요〕 — 4 대상이 동등하므로 동일 위계 정당. 변경 안함.

### 3.3. 기타 섹션 점검 — types-guide / coach-training / notices [상태: DONE 점검만]

손대지 않은 페이지 빠른 평가:

- **types-guide.js** (18.7KB): 9 유형 × 3 subtype × 풍부한 데이터. 정보 자료로서 정합성 있음. 변경 권장 안함.
- **coach-training.js** (9.2KB): 8주 전문가 양성반 — 3 단계 흐름이 깔끔. 콘텐츠 자체는 문제 없음. nav 격하만 향후 검토 후보.
- **notices.js** (20.2KB): 공지사항 시스템 (list/detail/editor/skeleton). 대부분 UI logic. 정상 작동 시 변경 불필요.

### 3.4. 마이크로 디테일 (선택)

- ~~**support.js 헤더 톤**~~ [DONE in `c07268b`]: "Ministry Support / 사역지원과 후원" 으로 두 트랙 즉시 안내.
- ~~**community.js 헤더 톤**~~ [DONE in `c07268b`]: "Stories / 먼저 회복을 경험한 분들의 이야기" 사용자 시점.
- **about.js 운영 원칙 4 박스**: 현재 about.js 라인 30-46. 이제 정본이 됐으니, 4개 박스 제목(우리가 지향하는 회복 / 운영 방식 / 핵심 접근 / 협력 구조)이 의도대로 명확한지 사용자와 확인. [TODO — 사용자 검토 필요]
- **home.js fallbackStory**: 라인 4 에 정의된 fallbackStory (`ER은 각 사람과 공동체의 실제 이야기를 먼저 듣고...`) — publicTestimonials.stories 가 비어있을 때만 쓰이므로 거의 안 쓰임. 그대로 둬도 OK.
- **community.js 4 카드 매핑**: 양육/부부 → individual, 팀 → business, 교회 → church. 양육과 부부가 둘 다 individual 로 가는 게 자연스러운지 확인 (현재는 적절).

### 3.5. 후속 점검 항목 (이 세션에서 발견)

- ~~**about.js의 "함께하는 코치진" 섹션**~~ [DONE in `68c3041`]: coaches.js 하단으로 이동 완료.
- **7명 협력 코치 풍부화**: 현재 이니셜 카드만 표시. 사진/역할/한 줄 소개 등이 준비되면 strings.js 의 `coaches.list` 에 손지영처럼 추가 → coaches.js 의 풍부한 카드로 자동 렌더링됨. 그때까지는 이니셜 카드 유지.
- **`coach-training.js` nav 격하**: 일반 방문자 동선이 아니므로 nav 에서 빼고 footer 만 유지하는 것도 가능. 다만 모집 시즌엔 노출이 필요하므로 운영 결정.
- **`/Users/Joeyswoo/Downloads/Complete_Enneagram.pdf` 의 reference**: types-guide.js 가 KB pNNN 인용 패턴을 따르는지 점검 (CLAUDE.md 의 KB 사용 원칙).

### 3.5. 검증 작업 (Tier 1 plan §7)

코덱스가 PR 만들기 전후로 권장:

```bash
# 문법 검증 (코덱스 환경에서)
node --check js/sections/home.js
node --check js/sections/about.js
node --check js/sections/coaches.js
node --check js/sections/community.js
node --check js/sections/support.js
node --check js/sections/programs.js

# 라이브 플레이라이트 E2E
# 1. support → 〔사역지원 신청하기〕 클릭 → apply 페이지의 첫 select option = '목회자 사역지원 신청'
# 2. support → 〔후원·협력 문의하기〕 클릭 → apply 페이지의 첫 select option = '후원 문의'
# 3. home → 〔무료 진단 시작하기〕 → test 페이지
# 4. home → 후기 3 카드의 "더 많은 회복 이야기 보기" → community
# 5. programs church 탭 → 사역지원 보기 링크 → support
# 6. community Next Step 의 4 카드 → 각 programs 탭
# 7. home 에 "First Conversation" 문구 부재 확인
# 8. home 에 "Who You Meet" 섹션 부재 확인
# 9. 모바일/데스크톱 양쪽 가로 overflow 없음
```

---

## 4. 파일 위치 빠른 참조

| 항목 | 경로 |
|---|---|
| 원본 플랜 | `/Users/jwoo/.claude/plans/cached-munching-porcupine.md` |
| 이 인계 문서 | `docs/_meta/site-restructure/HANDOFF.md` |
| 변경된 파일 | `js/sections/{home,about,coaches,community,support,programs}.js` |
| 미변경 (점검 후보) | `js/sections/{types-guide,coach-training,notices,apply,test-embed,account,pages}.js` |
| nav / Tailwind config | `index.html` (라인 56-106 config, 220-310 nav) |
| ER_STRINGS (코치 정본) | `js/strings.js` |
| Cloudflare 배포 | `wrangler.toml` (project: `er-coaching-site`) |

---

## 5. 작업 원칙 — 코덱스에게

1. **돌이켜야 할 변경은 하지 말 것**: 이번 작업의 SSOT 원칙 (손지영은 coaches, 운영 원칙은 about, 통계는 community) 을 깨지 않기.
2. **반복은 비용**: 새 섹션·메시지를 추가할 때 SSOT 검증 (`rg` 명령) 으로 다른 곳에 중복이 없는지 확인.
3. **작업 단위 commit**: 한 commit 메시지가 한 문장으로 설명 가능해야 함.
4. **검증 없이 끝내지 말 것**: 코드 변경 후 `node --check`, 라이브 페이지 로드 (`http://127.0.0.1:8765/` 로컬 서버 가능) 까지.
5. **사용자가 좋아한 것 보존**: Hero + 대상별 4 카드 (Parenting/Couple/Team/Church) — 절대 손대지 않기.
6. **이 문서를 갱신**: 작업 진행 시 §3 (남은 작업) 의 상태를 TODO → IN PROGRESS → DONE 으로 업데이트.

---

## 6. 변경 이력

| 날짜 | 작업자 | 내용 |
|---|---|---|
| 2026-05-24 | Claude Opus 4.7 | Tier 1 + Tier 2 + Tier 3.1 (home 재설계) — `f0d2e39` `954fc42` `c7af5c2` |
| 2026-05-24 | Claude Opus 4.7 | Tier 3.2 (nav 정리) + Tier 3.3 (CTA 위계) + 톤 다듬기 — `601e91b` `c07268b` |
| 2026-05-24 | Claude Opus 4.7 | 인계 문서 작성 (이 파일) — `91537d7` |
| 2026-05-24 | Claude Opus 4.7 | 사용자 피드백 반영: 홈 Stories 제거, nav 순서 변경, 7명 코치 about → coaches — `9d85dc6` `68c3041` |
| 2026-05-24 | Claude Opus 4.7 | cache busting (`?v=20260524a`) + 공지사항 2건 (ER 매거진, Parenting 6월 4주) — `5196acf` |
| 2026-05-24 | Claude Opus 4.7 | 〔공지사항〕 nav 복원 (601e91b 결정 번복 — 사용자가 공지사항 적극 활용) — `4a5bb25` |
| (다음) | 코덱스 | `refactor/site-restructure-tier-1-2-3` 브랜치 push + PR 생성 (#19 예상), 사용자 검토 후 §3.4 / §3.5 마이크로 디테일 진행 |
