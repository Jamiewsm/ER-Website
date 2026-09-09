# ER 교육 운영 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 최신 교육 안내와 기존 코치포털에 연결된 과정별 온라인 교실을 제공한다.
**Architecture:** 공개 사이트, Supabase 데이터·권한, 동일 계정의 교육 교실을 분리된 PR로 전달한다. 기존 보고서·숙제 이력은 보존하고 새 구조와 명시적으로 연결한다.
**Tech Stack:** 기존 정적 HTML/CSS/JavaScript, Supabase Auth/Postgres/Storage, Node test. 런타임 의존성 추가 없음.
**Spec:** CONTRACT.md

## 최신 실행 경계 — 2026-09-09

공개 사이트 PR #123은 사용자 추가 수정 및 별도 공개 지시까지 배포를 보류한다. DB·포털 준비는 계속하되 교육 migration에서 `public.public_notices`를 변경하지 않는다. 공지 초안은 전체 주석인 `supabase/manual/education-public-notices.pending.sql`에서 검토한다. 현재 코치훈련은 2026년 10~12월 3분기이며 2027년 신규 2기와 구분한다. 일정은 학생 가능 시간 취합 후 확정한다. 아래 작업 항목은 구현 계획이며 실제 완료 근거는 VERIFICATION.md를 따른다.

## Global Constraints
- 기본과정 8주, 반당 학생7, 여러 반과 여러 역할. 실제 질문지/일정/학생 데이터는 만들지 않는다.
- 개인 성찰은 소유자·담당 멘토·head만 조회. head는 기존 DB 역할로만 판정.
- 기존 사용자 파일 보존. 별도 worktree에서 작업. site/supabase PR 분리. 직접 merge/wrangler 금지.

## Task 1: 공개 과정 안내 — 공개 배포 보류
Files: js/sections/coach-training.js, index.html, basic-course.html, js/sections/apply.js, js/sections/home.js, js/basic-course-promo.js, js/strings.js, js/program-catalog.js, tests/basic-course-october-site.test.mjs.
- [ ] 기존 안내와 테스트에서 이전 8명/격주/2개월/1년 조건을 확인한다.
- [ ] 기본수료 후 검정과101 병행 가능, 2급+101 후1급 지원을 표시한다. 201은 선택,202 내용 미공개. 날짜/가격/장학금은 승인된 회의 기록 그대로.
- [ ] 기본과정 정원을 반당7명으로 일치시키고 A/B 확정 날짜는 만들지 않는다.
- [ ] node --test tests/basic-course-october-site.test.mjs tests/render-smoke.test.mjs tests/program-catalog-routing.test.mjs 실행 후 site 전용 커밋/PR.

## Task 2: 데이터·권한과 등록 연계
Files: supabase/migrations/20260908090000_education_portal.sql, tests/education-portal-rls.test.mjs, supabase/functions/_shared/program-pricing.ts, supabase/functions/_shared/email-templates.ts, tests/basic-course-october-supabase.test.mjs.
- [ ] CONTRACT의 테이블/RPC/스토리지 정책을 추가한다. 기존 자료는 수정·삭제하지 않는다.
- [ ] 실제 Postgres 호환 테스트에서 A반학생/B반학생/담당멘토/다른멘토/head/anon 역할을 나누고 SELECT/INSERT/UPDATE/storage 권한을 검증한다.
- [ ] 신청 단계의 기존8명 제한을 10월 계획14명으로 바꾸되 다른 기수에 일괄 적용하지 않는다. advisory lock 유지, head-only 정원 처리 검증.
- [ ] 최신 수료 메일 문구를 반영하되 교육 DB migration은 기존 공개 공지를 보존한다. 보류 공지 초안은 migrations 밖의 검토 전용 파일에 유지하며 기존 적용 migration 이력은 편집하지 않는다.
- [ ] RLS 테스트와 기존 supabase 관련 테스트를 실행한 뒤 별도 supabase PR.

## Task 3: 교육 교실
Files: education.html, education.css, js/education-api.js, js/education-model.js, js/education-render.js, js/education-app.js, tests/education-portal.test.js, index.html, js/portal-cards.js.
- [ ] 익명로그인/빈 계정/학생/복수역할/head 상태를 분리한다. edu_context를 기준으로 허용된 데이터만 불러온다.
- [ ] 반별 홈·수업·과제·공지·멘토링·운영 화면을 구현한다. head 운영 CRUD와 계정 이메일로 배정, 실제 일정·질문지·링크 입력을 포함한다.
- [ ] 자기성찰은 질문별 입력, 임시저장/제출 분리, 제출후 내용고정, 첨부·피드백·읽음·댓글·출석·납부/수료를 연결한다.
- [ ] 단위 테스트: 링크 scheme 검증, HTML escaping, 역할복합, 반·회차 선택, 날짜/통화, 빈상태 및 에러. API 응답 실패는 화면에 표시하고 중복제출 잠금.
- [ ] 모바일/데스크탑 브라우저와 주요 역할별 흐름을 테스트. 기존 코치앱 회귀 테스트 후 별도 portal PR.

## Task 4: 통합·전달
- [ ] SQL과 프런트 필드/RPC 계약을 비교하고 리뷰 결과를 수정한다.
- [ ] 검증된 백업·복원 후 backend 적용→portal 배포 순서와 사이트 별도 보류, 운영자 초기설정과 rollback 제한을 RUNBOOK.md에 기록한다.
- [ ] 실제 운영 데이터와 메일은 전송하지 않고 검증 결과·PR·미적용 부분을 보고한다.
