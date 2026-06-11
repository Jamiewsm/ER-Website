<!-- 7월 기본과정 모집 funnel 구축 체크리스트 — 완료 시 체크 갱신 -->

# 기본과정 7월 기수 — 작업 체크리스트

## Phase 1 — 모집에 필수 (사이트)

- [x] 결제·환불·얼리버드 정책 설계 (context-notes.md에 기록)
- [x] `basic-course.html` 전용 랜딩 (OG 태그 + 포스터 + 커리큘럼 개요 + 가격/얼리버드 + 환불 규정 + FAQ)
- [x] `css/basic-course-landing.css` 분리 스타일
- [x] 신청 폼 1단계 보강 — 에니어그램 경험 / 신청 경로 / 공동체 약속 동의 (`js/sections/apply.js`, `js/api.js`)
- [x] 스크립트 캐시 버전 범프 (`index.html`)
- [ ] 8주 여정 개요 문구 대표 확인 (실제 커리큘럼과 대조)
- [x] 홈 공지에 기본과정 모집 추가 (`strings.js` + Supabase migration)
- [x] 홈 히어로 기본과정 모집 배너 (`js/basic-course-promo.js`)
- [x] 결제 USD 단일화 · PayPal·Zelle 공지 (`basic-course.html`, `apply.js`)
- [x] 결과지 "다음 단계" 추천에서 7월 한정 기본과정 부스트 (`program-catalog.js`)
- [x] 인스타/카톡 어트리뷰션 링크 — `basic-course.html?apply_source=instagram` (랜딩 CTA가 신청 폼까지 전달)

## Phase 2 — 운영

- [ ] PayPal Business 계정 개설 (대표)
- [ ] 등록 안내 메일 템플릿 (결제 안내 + 환불 규정 동봉)
- [ ] `submit-application` Edge Function의 알림 메일 여부 확인 → 없으면 Resend 연동
- [ ] 2단계 사전 성찰 설문 제작 (첫 기수 구글폼) + 결제 확정자 발송 플로우
- [ ] 신청 상태 관리 (접수 → 연락 → 결제 대기 → 확정) — Supabase 컬럼 또는 시트

## Phase 3 — 수료 후

- [ ] 수료 시점 전문가 양성반 6기(9월) 안내 연결
- [ ] 수료생 후기 수집 → 다음 기수 랜딩 반영
