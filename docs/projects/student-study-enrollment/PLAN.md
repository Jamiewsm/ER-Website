# 학생 스터디 신청 API

학생이 인증된 계정으로 기존 심화 스터디 반에 신청하고, 기존 edu_confirm_registration과 edu_claim_registrations를 통해 승인 후 입장한다.

포털 PR과 함께 검토한다. 기존 수강 데이터는 보존하며 이번 두 기수에만 enrollment_open을 설정한다. 기본과정 신청을 허용하지 않는다. apply_source별 유일 인덱스와 기존 등록과 같은 기수 잠금으로 중복 신청을 막는다.
