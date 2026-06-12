<!-- 7월 기본과정 8주 모집 funnel 작업의 의사결정 기록 — 다음 세션은 이 문서로 맥락 복원 -->

# 기본과정 8주 (2026년 7월 기수) — Context Notes

## 확정된 사실 (대표 답변, 2026-06-11)

- 멘토링은 **코치-학생 1:1** (포스터 표기가 맞고, 지원서 초안의 "소그룹 멘토링"은 폐기).
- 개강일·강의 요일·시간은 **등록자가 모이면 시간대를 조율해 확정** (사전 고정 없음).
- 사업자 등록은 **한국**. 수강생은 전 세계 분산 (한국 + 미주 교민 중심).
- **정원 최대 10명.**

## 설계 결정과 근거

### 결제 (Phase 2 — 수동 PayPal·Zelle, 2026-06-12 확정)
- **USD 단일 가격** — $300 정가, 얼리버드 $270 (6/24까지 입금 완료).
- 미국 사업자 등록 없이 Stripe 운영이 어려워 **수동 입금으로 회귀** (2026-06-12).
- 헤드 코치 **결제 안내 메일** → PayPal·Zelle·(선택) 은행 송금 → 입금 확인 후 **등록 확정**.
- **자리 확정 = 입금 확인 순** (선착순 10명).
- 결제 계좌는 Supabase Secrets (`BASIC_COURSE_PAYPAL_EMAIL`, `BASIC_COURSE_ZELLE_*`, `BASIC_COURSE_BANK_INSTRUCTIONS`).

### 가격 · 얼리버드
- 정가 **$300 USD**.
- 얼리버드 **6/24(수)까지 결제 완료 시 $270** (10%).
- **2인 동반(부부·지인) 1인 $270** — 얼리버드와 중복 적용 불가.
- 목회자·선교사 장학은 기존 ministry 트랙으로 개별 문의.
- 모집 마감 7/5(일), 정원 차면 조기 마감.

### 환불 규정 (공정위 통신강좌 기준보다 초기 구간 후함)
1. 개강 전 — 전액 환불.
2. 첫 주 안심 보장 — 1주차 강의·멘토링 후에도 2주차 시작 전 요청 시 전액 환불.
3. 2주차 시작 후 ~ 4주차 시작 전 — 50% 환불.
4. 4주차 시작 후 — 환불 불가. 사정상 중단은 다음 기수 이월 1회 허용.
5. 최소 인원 미달 등 주최 측 사정으로 폐강 시 — 전액 환불.

### 지원서 2단계 분리 (전환 보호)
- **1단계 (사이트 신청 폼, 3분)**: 기본 정보 + 에니어그램 경험 + 신청 경로 + 공동체 약속 요약 동의. → `js/sections/apply.js`의 `renderJulyBasicCourseApply`에 구현.
- **2단계 (사전 성찰 설문, 15-20분)**: 결제·등록 확정자에게 메일로 발송. 지원서 초안의 §2(교회·사역), §3-2·3(유형 추측), §6(기대 영역), §7(씨름), §8(성찰), §9-2(나눔 마음), §10(약속 전문), §11(기도 제목). 첫 기수는 구글폼으로 시작.
- 근거: $300 과정에 40+ 필드 폼은 전환 킬러. 결제한 사람이 성찰 설문을 더 정성껏 작성함.

## 구현 현황 (이 세션)

- `basic-course.html` 신설 — 전용 랜딩. 카톡 공유 시 포스터 미리보기를 위한 og:image 포함 (해시 라우팅 `/#apply`는 OG가 안 먹히는 문제 해결).
- `css/basic-course-landing.css` 신설 — parenting-workshop-landing.css와 같은 미감, bc- 프리픽스로 분리 (페이지 간 결합 방지).
- `js/sections/apply.js` — 기본과정 폼에 1단계 필드 3종 추가 (경험/경로/약속 동의).
- `js/api.js` — 신규 필드를 접수 메시지에 합성 (다른 폼과 하위 호환).

## Phase 2·3 구현 (2026-06-11)

- `program_applications` 테이블 + 헤드 코치 RPC (`admin_list_program_applications`, `admin_update_program_application_status`).
- Edge Functions: `submit-application` (접수·메일), `notify-program-application` (결제/성찰/수료 메일).
- 코치 포털 **코치 승인** 화면에 7월 기본과정 신청 목록·상태·메일 버튼.
- 운영 문서: `OPS_WORKFLOW.md`, `PRE_SURVEY_QUESTIONS.md`, `EDGE_FUNCTIONS_SETUP.md`.
- 랜딩: 수료생 이야기, 8주 다음 양성반 6기 안내 섹션.

## 프로덕션 검증 (2026-06-11)

- DB: `program_applications` 테이블·컬럼 OK. RPC `admin_list_program_applications` / `admin_update_program_application_status` 동작 확인.
- Edge: `submit-application` v7 (verify_jwt false), `notify-program-application` v1 (verify_jwt true) ACTIVE.
- `submit-application` OPTIONS 200, 빈 POST → `missing_required_fields` (정상).
- `notify-program-application` 은 **apikey + Bearer** 필요. 코치 UI `applications.js`에 apikey 헤더 추가 (20260611b).
- 공지: Supabase `public_notices` 에 7월 기본과정 모집 공지 존재.
- 랜딩: er-coaching.com/basic-course 에 수료생·양성반 섹션 노출 확인.

## 미확정 · 후속 확인 필요

- **8주 여정 개요**(랜딩의 1-2주/3-6주/7-8주 구분)는 합리적 추정 — 실제 커리큘럼과 대조해 대표 확인 필요.
- Resend **Secrets** 설정 (대표·인프라) — 미설정 시 메일은 skip, DB 접수는 정상.
- Google Form URL 생성 후 `BASIC_COURSE_PRE_SURVEY_URL` secret 등록.
- PayPal Business 계정 개설 여부 (대표 액션).
- 홈 공지·결과지 추천 부스트는 사용자의 미커밋 작업(js/strings.js, index.html)과 겹쳐서 보류 — 그 작업이 커밋된 뒤 진행.
- 전문가 양성반 5기(7월)와 동시 모집 — 노출 지점마다 대상 구분 문구 필요.
