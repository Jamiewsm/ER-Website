# 승인 목록 삭제와 복구

수석코치가 중복·테스트 신청서를 승인 목록에서 숨기고 필요하면 복구한다. 이 동작은 신청 취소나 계정 삭제가 아니다. 기존 신청 상태, 납부 금액, 정원 예약, 교육 등록, 제출, 멘토 배정과 메일 이력을 유지한다.

## 운영 화면

- 버튼 이름은 `승인 목록에서 삭제`로 표시한다.
- 확인 문구는 계정·결제·교육 등록이 유지됨을 설명한다.
- 삭제된 항목은 별도 목록에서 조회·검색·복구한다. 활성 목록의 승인·발송 작업을 삭제 목록에 표시하지 않는다.
- 실제 등록 취소는 기존 등록 취소 기능을 사용한다. 승인 목록에서 삭제해도 학생의 교육포털 접근은 유지된다.

## API 계약

| RPC | 인자 | 결과 |
|---|---|---|
| `admin_archive_program_application` | `p_id uuid` | 삭제 표시가 적용된 신청 행 |
| `admin_restore_program_application` | `p_id uuid` | 삭제 표시가 해제된 같은 신청 행 |
| `admin_list_archived_program_applications` | `p_program_key text = null`, `p_limit integer = 100` | 삭제된 신청만 최신 삭제순으로 반환 |

기존 `admin_list_program_applications`와 `admin_list_program_applications_by_cohort`는 인자를 유지하며 `archived_at is null`인 신청만 반환한다. 조회 제한은 기존과 동일하게 1~500개이다.

새 열은 `archived_at timestamptz`와 `archived_by uuid`이다. 수석코치 검증 후 서버가 시각과 사용자를 기록한다. 반복 삭제는 최초 기록을 유지하고, 복구는 두 값을 함께 지운다. 두 RPC는 행 잠금으로 동시 변경을 직렬화한다. 존재하지 않는 신청은 `application_not_found`와 SQLSTATE `P0002`를 반환한다.

모든 RPC는 활성 수석코치 전용이다. 학생·일반 코치·비활성 수석·익명 사용자에게 실행을 허용하지 않는다. 브라우저의 테이블 직접 조회·입력·수정 권한은 기존처럼 제한한다. 신청 접수 API에는 삭제 필드를 추가하지 않는다.

## 적용과 검증

먼저 `20260920001000_program_application_approval_archive.sql`을 적용한 뒤 이 API를 사용하는 포털을 배포한다. 이 문서는 운영 SQL 실행이나 기존 명단 변경을 수행하지 않는다.

`npm test --prefix tests/education`에 `education-approval-archive.test.mjs`가 포함된다. 실제 신청 스키마와 관리자 RPC, 교육·온보딩 migration을 격리 PGlite에서 적용하여 다음을 검증한다.

- 모든 신청 상태의 삭제·복구, 반복 요청, 없는 신청의 오류.
- 역할별 조회·실행 차단과 직접 테이블 변경 차단.
- 계정·결제·교육 등록·제출·첨부·멘토·메일 기록 및 정원 집계 보존.
- 삭제 목록의 과정 필터, 정렬과 조회 상한.

테스트는 합성 계정과 저장소 메타데이터를 사용한다. 운영 데이터와 실제 메일은 포함하지 않는다. PGlite 검사는 단일 연결이며 독립 PostgreSQL 연결의 경쟁 검사는 별도이다.
