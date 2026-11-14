# 공개 평가 API 체크리스트

- [x] 현재 저장 경로·권한·공통 helper 확인.
- [x] 계획과 범위·중복 처리 결정 기록.
- [x] 전용 테이블과 접근 제한 migration 작성.
- [x] 입력 검증·Turnstile·중복 처리 함수 작성.
- [x] 공개 함수 설정과 환경 변수 안내 작성.
- [x] 성공·실패·보안·중복·경합 mock 테스트 통과.
- [x] SQL 권한과 제약 검증.
- [x] 기존 PGlite CI job에 API·DB 테스트와 경로 trigger 연결.
- [x] diff 범위와 비밀정보·PII 비수집 확인.
- [x] 논리 단위 커밋과 부모 작업 인계를 위한 검증·운영 적용 조건 정리.
- [x] 재평가 revision 범위를 PostgreSQL integer에 맞추고 21·최댓값 허용 및 음수·소수·초과값 거부 검증.

- [x] 운영 DB migration 적용 (`diagnostic_result_feedback`, RLS, service_role SELECT/INSERT) — 2026-11-14
- [x] Edge Function `submit-assessment-feedback` 배포 (`verify_jwt=false`, v1) — 2026-11-14
- [x] 서버 스모크: origin 거부 / invalid_payload / fake Turnstile → `turnstile_failed` (시크릿 정상)
- [ ] 라이브 브라우저에서 Turnstile 통과 후 실제 체감 평가 1건 저장 확인 (수동)
