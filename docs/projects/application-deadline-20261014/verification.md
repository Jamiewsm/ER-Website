# 서버 신청 마감 검증 — 2026-10-14

PR #173 자동 리뷰의 [P2 지적](https://github.com/Jamiewsm/ER-Website/pull/173#discussion_r4267577928)을 별도 `supabase` track으로 보완한다. 기준 main은 PR #172이며 site 파일은 수정하지 않는다.

- 브라우저 catalog와 동일한 기존 승인 마감(`2026-09-28T23:59:59-07:00`)을 서버 시각으로 검사한다. 요청 본문의 시각이나 다음 기수 값으로 재개할 수 없다.
- 기본과정 모집 마감 시 409 `recruitment_closed`를 DB client 생성·Turnstile 검증·저장·메일 호출 전에 반환한다.
- 기존 program/cohort key·수강료·접수/메일 로직, Parenting/일반 상담/심화 과정 동작은 보존한다. 기존 신청/학생/제출 데이터를 수정하는 SQL이나 migration은 없다.
- 신규 11개 회귀검사는 기본과정 aliases/category 추론, 합성 클라이언트 시각·미승인 미래 기수, 마감 시각 경계, 유효하지 않은 서버 시각, 다른 프로그램의 기존 접수 유지, 브라우저/서버 마감 일치를 검사한다. 관련 Node 검사 **68/68 통과**.
- 기존 운영 `submit-application` version 35의 6개 파일이 main과 동일함을 Supabase MCP 읽기 전용으로 확인했다. 배포 시 그 파일들과 신규 helper만 포함하고 기존 `verify_jwt=false`를 유지한다. 권한·secret·프로젝트 설정 변경은 없다.
- 최종 site+서버 검증 사본의 모의 회귀검사 **442/442 통과**. 별도 독립 검토에서 추가 회귀 발견이 없었고 검토자의 서버 검사도 68/68을 통과했다.
- 현재 이 변경은 로컬 준비만 완료하며 외부 push·새 PR·병합·배포를 보류한다. 명시적 운영 반영 승인 후 정상 GitHub CI/PR 병합을 거쳐 기존 Supabase 연결로 이 함수만 배포한다. 저장소의 Cloudflare 자동 배포는 Supabase-only PR을 skip한다.
- 실제 신청 POST·메일·결제는 검증하지 않는다. 배포 후 함수 metadata 및 7개 파일 내용만 다시 읽어 main과 대조한다. 로컬 검사는 완전히 합성 DB/메일/보안 API를 사용한다.

## MacBook 후속 보완 — 기존 필수 이메일·공동체 약속

- iCloud 원본의 전체 unstaged 상태가 미확정이므로 검증된 Git bundle에서 별도 로컬 branch를 만들었다. 기준 서버 커밋은 `1543d1c3c186a13f2c75cf1f77c35b5ccd90690f`이며 원본은 수정하지 않는다. Track은 `supabase`다.
- 기존 10월 신청 문서의 자동 안내용 필수 이메일, 기본과정 폼의 `type="email" required`, 기존 `covenant_agree` 필수 checkbox와 boolean `covenant_agreed` 전송 계약을 확인했다. 수업·멘토링 이야기 비밀 유지, 상호 존중, 성실한 참여의 기존 공동체 약속이며 신규 이용약관·개인정보·마케팅 동의나 질문을 추가하지 않는다.
- 모집 중 기본과정은 기존 `type=email`의 [HTML 단일 주소 구문](https://html.spec.whatwg.org/multipage/input.html#email-state-(type=email))을 서버에서도 검사한다. 잘못된 형식·문자열 안에 삽입된 주소·여러 주소·잘못된 도메인 label·배열/객체 등 타입 오류는 400으로 거부한다. 양끝 공백, 대문자·하위 도메인·plus·apostrophe 및 HTML이 허용하는 local-part 문자를 유지하고, 검증된 정규화 주소 전체를 메일 수신자로 사용한다. 실제 도메인·메일함의 도달 가능성을 확인하는 검사가 아니다.
- 서약은 실제 boolean `true`만 허용한다. 누락·null·false·문자열 true/false/on·숫자·배열·객체는 400 `covenant_required`로 거부한다. 모두 DB client·보안 API·저장·메일 이전에 검사한다. 마감 guard와 기존 기본 필드 검사는 우선 유지한다.
- 기존 일반 상담·양육 워크숍의 전화번호 연락처·선택 서약, 심화 과정·결제 지역의 기존 보정, 기수·수강료·정원과 기존 등록 데이터를 변경하지 않는다. 기존 HTML·동의 문구·checkbox도 수정하지 않는다.
- 초기 접수와 등록 안내 복구는 `_shared/resend.ts`의 같은 전체 주소 검증을 사용한다. 복구도 검증된 기본과정 주소를 그대로 사용하여 발송 준비 실패 후 apostrophe/! 주소가 잘리는 것을 방지한다. 기존 메모형 기본과정 연락처와 다른 과정은 기존 추출 호환을 유지하며, 기존 신청 행이나 동의 값을 수정하지 않는다.
- 최종 57개 회귀검사를 추가했다. 최초 검사는 기존 핸들러의 누락으로 인한 20개 실패를 확인한 뒤 보완했다. 독립 검토에서 추출기로 apostrophe/! 주소를 잘라내는 호환성 문제를 지적하여 추가 8개 실패를 재현하고 HTML 구문 검사·수신자 전체 전달로 보완했다. 재검토의 복구 수신자 지적도 4개 실패를 재현하여 보완했다. 최종 관련 서버 검사는 **125/125**, 사이트 `6c9612f`와 합성한 전체 모의 Node 검사는 **499/499**, 새 변경의 `git diff --check`는 통과했다. 독립 PostgreSQL 동시성 검사 2개는 기존과 동일하게 제외한다.
- 이 후속 보완은 `submit-application`, `notify-program-application`과 두 함수가 사용하는 `resend.ts` 변경을 포함한다. 운영 반영 승인 후에는 두 함수 모두 해당 helper로 일치시켜야 한다. 이번에는 배포하지 않으며 함수 설정·secret·권한을 변경하지 않는다.
- Node 22.16.0·기존 PGlite 0.5.8을 사용했다. 테스트 환경은 운영 자격증명을 상속하지 않고 외부 fetch·소켓을 차단한다. localhost fixture에 필요한 샌드박스 재실행만 허용했다. 실제 신청·메일·운영 DB·새 패키지 설치·push·merge·deploy는 실행하지 않는다.
