# ER-Website: 현재 메인(PR #14 리팩터 후) vs 운영(er-coaching.com) 점검 보고서

**작성일**: 2025-03-07  
**범위**: 내용 비교, 메시지 패키징·한국어 표현, 로직·기능 검증

---

## 1. 라이브 사이트와의 비교 한계

- **er-coaching.com**은 메인 HTML만 내려주고, 본문(홈/소개/프로그램 등)은 클라이언트 JS로 `#main-content`에 주입됩니다.
- 일반 HTTP fetch로는 해시 라우팅 후 렌더된 콘텐츠를 가져올 수 없어, **동일 문장 수준의 직접 비교는 불가**했습니다.
- 따라서 **현재 로컬(리팩터 후) 코드베이스 기준**으로 내용·로직을 점검했습니다.

---

## 2. 내용 점검 (콘텐츠, 반복, 한국어 표현)

### 2.1 수정 완료한 항목

| 항목 | 위치 | 내용 |
|------|------|------|
| 푸터 Partnership 영역 배경 클래스 | `index.html` 345행 | `bg-gray-` → `bg-gray-50` (잘못된 클래스명 수정) |

### 2.2 확인이 필요한 표현 (한국어·용어)

| 위치 | 현재 문구 | 비고 |
|------|-----------|------|
| `main.js` contentData.types.labels | **7번 명령한 사람** | 에니어그램 7번은 보통 “열정적인 사람”(Enthusiast)으로 번역됩니다. “명령한”은 8번(리더/강한 사람)과 혼동될 수 있어, **7번 → “열정적인 사람”** 검토 권장. |
| `main.js` updateProgramView | **인턴쉽 과정** | 표준 표기는 “**인턴십**”(internship)입니다. “인턴쉽” → “인턴십” 수정 권장. |

### 2.3 의도된 혼용 (수정 불필요로 판단)

| 문구 | 설명 |
|------|------|
| **Original Design** (푸터, 홈 카피) | 브랜드/신학 용어로 한영 혼용이 의도된 것으로 보임. |
| **에니어그램** | 통일된 표기 사용. (일부 “에니어그램” 표기 검색됨 – 동일 단어.) |

### 2.4 메시지 패키징·반복

- **섹션별 문구**: 홈, 소개, 프로그램, 자료실, 함께한 이야기, 동역과 후원, 상담 신청, 마이페이지, 코치 포털 등이 `main.js`의 `render*()` 및 `contentData` 등에 분산되어 있습니다.
- **반복**: “상담 신청하기”, “문의 신청하기”, “renderSection('apply')” 등 동일 CTA가 여러 섹션에 반복되며, 의도된 강조로 보입니다.
- **제안**: 추후 다국어/일괄 문구 수정을 고려하면 `contentData` 또는 별도 `strings.js`로 문구를 더 모아두면 유지보수에 유리합니다. 현재 구조만으로도 동작에는 문제 없습니다.

---

## 3. 로직·기능 점검

### 3.1 스크립트 로드 순서 및 전역 의존성

- **순서**: `config.js` → `supabase-client.js` → `auth.js` → `api.js` → `coach-portal.js` → `main.js`
- **의존 관계**:
  - `supabase-client.js`: `window.SUPABASE_CONFIG` 사용.
  - `auth.js`: `window.state`, `window.supabaseClient`, `renderSection`, `closeAuthModal` 등 사용; `handleDesktopAuthClick`, `openAuthModal`, `toggleLogin`, `closeAuthModal`은 `window`에 명시 부여됨.
  - `api.js`: `handleApplySubmit`, `initApplyTurnstile` 전역; `window.state`, `window.SUPABASE_CONFIG` 사용.
  - `coach-portal.js`: `closeDesktopAccountMenu`, `renderSection`, `openCoachApp` 사용; `openCoachApp`은 `main.js` 내부에 정의되어 전역으로 노출됨.
- **결론**: 현재 로드 순서와 전역 노출로 **로직상 문제 없음**.

### 3.2 라우팅 및 첫 화면

- `parseSectionHash()`: `#sectionId?query` 파싱 후 `sectionId`·`payload` 반환.
- `runAppInit()`: `document.readyState === 'loading'`이면 `DOMContentLoaded` 후 실행, 아니면 즉시 실행 → `renderSection(initialRoute.sectionId, …)` 호출.
- **결론**: 해시 기반 라우팅 및 첫 화면 렌더링 **정상**.

### 3.3 인증 및 로그인 모달

- 데스크톱/모바일 로그인 버튼: `runAppInit()`에서 `addEventListener`로 `handleDesktopAuthClick` / `toggleLogin` 연결.
- 모달 닫기: `#auth-modal-close-btn`에 `addEventListener`로 `closeAuthModal` 연결; 배경 클릭 시에도 `closeAuthModal` 호출.
- **결론**: 로그인 창 열기·닫기 **정상**.

### 3.4 진단 테스트(영어/한국어)

- `setAdaptiveTestLanguage(lang)`가 `window.setAdaptiveTestLanguage`로 노출됨.
- `renderTest()`에서 iframe `src`에 `lang=${langParam}&_=${cacheBuster}` 포함.
- `test.js`는 `URLSearchParams(window.location.search)`에서 `lang=en` 여부로 `pageLang` 결정.
- **결론**: English Test / 한국어 테스트 전환 **정상**.

### 3.5 상담 신청 폼 및 Turnstile

- `renderSection('apply')` 후 `setTimeout(() => initApplyTurnstile(), 0)` 호출.
- 폼 `onsubmit="handleApplySubmit(event, ...)"` → `api.js`의 `handleApplySubmit` 호출; Supabase Edge Function `submit-application` 호출.
- **결론**: 적용 로직 **정상**. (실제 제출 성공 여부는 Supabase/Edge Function 설정에 따름.)

### 3.6 코치 포털·마이페이지

- `openMyAccount`, `openCoachPortalFromMenu`, `openCoachAppFromMenu`는 `coach-portal.js`에서 전역 함수로 정의.
- `handleLogoutFromMenu`, `closeDesktopAccountMenu`는 `auth.js`에서 정의·사용.
- `loadCoachPortalDashboard`, `loadCoachAdminUsers`, `loadCoachTasks`, `loadCoachMaterials`, `loadCoachSchedules`, `loadCoachNotes`는 `main.js`에서 정의되며, `renderSection`의 해당 case에서 `setTimeout`으로 호출.
- **결론**: 메뉴에서의 이동 및 코치 전용 로드 **정상**.

### 3.7 기타

- **모바일 메뉴**: `toggleMobileMenu()`로 `#mobile-menu`의 `hidden` 토글; `renderSection` 시 `mobile-menu`에 `hidden` 부여해 닫음.
- **차트**: `initCharts('home')`, `initCharts('community')`가 해당 섹션 렌더 후 `setTimeout`으로 호출됨.

---

## 4. 요약 및 권장 사항

### 4.1 수정 반영된 사항

- 푸터 Partnership 영역 `bg-gray-` → `bg-gray-50` 수정 완료.

### 4.2 권장 수정 (내용)

1. **7번 유형 라벨**: “명령한 사람” → “열정적인 사람” 등 7번에 맞는 표현으로 변경 검토.
2. **인턴십 표기**: “인턴쉽” → “인턴십” 수정 권장.

### 4.3 로직·기능

- 리팩터 후에도 **스크립트 순서, 전역 함수 노출, 라우팅, 인증, 진단 테스트, 상담 신청, 코치 포털** 흐름상 **기능적 결함은 발견되지 않았습니다.**
- 배포 후에는 다음을 한 번씩 확인하는 것을 권장합니다.
  - 로그인/로그아웃 후 마이페이지·코치 포털 이동
  - 상담 신청 폼 제출 및 Turnstile 동작
  - 진단 테스트 한국어/English 전환 및 결과 표시
  - GitHub 반영 → Supabase/Cloudflare 배포 파이프라인 동작

---

*이 보고서는 현재 로컬 ER-Website 코드베이스와 라이브 사이트 구조를 기준으로 작성되었습니다.*
