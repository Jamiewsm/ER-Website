# 본사이트 포털 직접 진입
Track: site.

마이페이지와 중간 iframe 대신 기본 교육포털로 같은 창에서 바로 이동한다. 메뉴와 안내의 포털 진입 명칭/목적지를 통일하고 로그인 전제 조건을 제거한다. 기존 #login, #mypage, #coach 링크도 호환되게 처리한다. 관리자와 공지 편집을 위한 본사이트 인증 및 #coach_admin 직접 경로는 보존한다. 검사 runtime과 DB를 수정하지 않는다.

포털 작업공간의 신청·코치 승인 기능은 CoachPortal-WebApp에서 별도 구현한다. 본사이트 링크 전환은 기존 education.html 경로를 사용하므로 포털 배포 순서에 의존하지 않는다. 관련 탐색 테스트, 전체 site 테스트와 diff를 확인한 후 semantic commit과 PR을 만든다. merge·배포는 기존 Cursor/CI 절차를 따른다.
