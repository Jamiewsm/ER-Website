---
name: er-education-operations
description: Use the authenticated ER education portal connection to check classes, lessons, submissions, and feedback or prepare private drafts.
---

# ER 교육포털 운영

- 먼저 `education_context`로 현재 계정의 역할을 확인한다.
- 반, 수업, 제출물 ID는 목록 조회에서 받은 실제 값을 사용한다. 추측하지 않는다.
- 학생 답변과 피드백은 필요한 항목만 조회하고 대화에 최소한으로 인용한다.
- 공지 작성은 비공개 초안으로만 수행한다. 학생 공개가 필요하면 포털에서 검토 후 공개하도록 안내한다.
- 피드백은 비공개로만 작성한다. 학생 공유는 포털에서 검토한다.
- 작성 요청이 실패했거나 결과가 불분명하면 자동 재시도하지 말고 공지·피드백 목록에서 저장 여부를 확인한다.
- 권한 오류를 우회하려고 다른 계정이나 관리자 키를 요청하지 않는다.
- 운영 도구에 없는 결제, 등록 확정, 대량 변경, 삭제는 가능한 것처럼 말하지 않는다.
