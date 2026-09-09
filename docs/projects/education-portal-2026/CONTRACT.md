# ER 교육 포털 — 승인된 설계와 공통 계약

2026-09-08 실행 승인, 2026-09-09 공개 안내 보류 지시 반영. DB·포털 준비와 검증·PR 작업은 계속한다. 공개 웹사이트 PR #123은 사용자의 추가 수정 및 별도 공개 지시 전까지 배포하지 않는다. 배포·merge 담당은 Cursor CLI다.

## 운영 기준
- 기본과정은 분기별, 반당 학생 7명, 같은 반에서 8주. 10월 A/B반은 운영 준비 상태로 생성한다. 일정은 학생들의 가능 시간을 취합한 뒤 확정하며, 실제 학생·줌 URL과 함께 운영자가 입력한다. 7월은 8월말 종료이며 기존 기록을 변경하거나 이름으로 자동 연결하지 않는다.
- 현재 코치훈련의 운영 구분은 2026년 10~12월 3분기다. 2027년 신규 2기와 별도 기수로 관리하며, 실제 일정은 학생 가능 시간 취합 후 확정한다.
- 멘토는 코치 훈련생이며 보통 2~3명 담당. 한 계정에 여러 과정·반의 student/mentor/instructor 역할을 연결한다. 수석코치는 활성 coach_profiles.role=head_coach로 판정하며 이름·이메일 하드코딩을 하지 않는다.
- 주차별 자기성찰 질문지, 답변 임시저장/제출, 담당 멘토 및 수석 열람, 학생에게 공유한 피드백만 학생 열람. 학생 수료·검정 합격은 자동 부여하지 않는다.
- 교실별 일정·줌·자료·YouTube/강의 링크·예약 공지·댓글·읽음. 기본 외 심화101/201/202·트레이닝도 지원. 자체 채팅·외부 자동 수집·Kakao 발송·시험 엔진은 이번 릴리스 범위 밖.
- 기존 코치 보고서 흐름은 유지. 교육 교실에서 기존 코치 앱의 담당 멘티/보고서로 이동하고 명시적으로 확인한 legacy_mentee_id만 연결한다.

## 데이터 계약 (public, prefix edu_)
UUID PK id default gen_random_uuid. created_at timestamptz default now. 모든 테이블 RLS 및 최소 GRANT. 최신 auth.users/coach_profiles/coach_mentees/program_applications는 기존 의존성. head helper는 security definer/set search_path=''로 자체 체크.
- edu_courses: id, code unique, title, kind (basic/growth/training), description default ''.
- edu_cohorts: id, course_id FK, title, application_cohort_key unique nullable, status (draft/active/completed), starts_on date nullable, ends_on date nullable.
- edu_classes: id, cohort_id FK, title, capacity integer default7, zoom_url text default '', schedule_note text default ''.
- edu_enrollments: id, class_id FK, user_id auth.users FK, display_name text, role student/mentor/instructor, status active/completed/withdrawn. Unique(class_id,user_id,role). Completion manual. Multiple roles allowed. Only head can mutate memberships; one cohort advisory lock serializes student placement and registration reservations.
- edu_mentor_assignments: id, student_enrollment_id FK, mentor_enrollment_id FK, legacy_mentee_id nullable FK coach_mentees. Both same class valid roles; active assignment unique student; legacy link must match mentor owner. Only head mutations.
- edu_lessons: id,class_id,position positive integer,title,starts_at nullable timestamptz,publish_at nullable timestamptz (null=draft),questions jsonb default[] [{id:string,prompt:string}],resources jsonb default[] [{title:string,url:https URL}],description text default ''. Questions frozen after first submitted answer. Can publish with no questions/resources. Unique(class_id,position).
- edu_submissions: id,lesson_id,student_enrollment_id,answers jsonb default{} (question id to text),submitted_at nullable timestamptz,updated_at. Unique(lesson_id,student_enrollment_id). Only owner active student can insert/update own draft/submit; submitted answers immutable. Server validates question ids/content, stamps submission time. Owner reads saved drafts and submissions, including after withdrawal. Head and assigned mentor read submitted answers only. Question snapshot set server side on each draft save and final submission (question_snapshot jsonb).
- edu_feedback: id,submission_id,author_id auth.users default auth.uid(),body text,is_shared boolean defaultfalse,created_at. Assigned active mentor or head writes; shared feedback visible owner; private visible assigned mentor and head only. Author-only update/delete or head. Students cannot write.
- edu_posts: id,class_id,title,body,publish_at nullable(null=draft),created_by auth.users default auth.uid(). Head/instructor writes. Class members read published; head/instructor read drafts.
- edu_comments: id,post_id,author_id default auth.uid(),body,created_at. Only visible post participants write/read. Author edit/delete or head; cannot spoof/change author/post.
- edu_post_reads: post_id,user_id default auth.uid(),read_at defaultnow PK(post_id,user_id). Owner can mark visible posts; head/instructor can list receipts; other users only own.
- edu_attendance: lesson_id,student_enrollment_id,status present/absent/excused, recorded_by default auth.uid(), PK pair. Head/instructor write; own student/assigned mentor/head/instructor read.
- edu_payment_entries: id,enrollment_id,amount numeric positive,currency KRW/USD,due_on date nullable,paid_at nullable timestamptz,note text default''. Head write; own student and head reads. Separate ledger, no payment processing. Currency never aggregated together.
- edu_credentials: id,user_id,kind level2_exam/level2_certificate/level1_certificate,status applied/passed/issued/failed,date_on nullable,note. Head write/own user read. Manual record; no automatic credentialing.

## RPCs
- edu_context() -> jsonb {is_head:boolean,is_coach:boolean,user_id:uuid}. authenticated only.
- edu_add_member(p_class_id uuid,p_email text,p_display_name text,p_role text,p_application_id uuid DEFAULT NULL) -> edu_enrollments. Head only; exact normalized existing auth user email, user must first sign up through portal. No exposed auth directory. Repeated assignment updates the existing membership safely at full capacity. Passing the existing application ID converts its reserved seat atomically; application and class must belong to the same cohort.
- edu_link_application(p_enrollment_id uuid,p_application_id uuid) -> void. Head only; confirms the same cohort and exact email when the application contact is a valid email; phone/mixed contact requires explicit head-verified mapping. ADD nullable application_id on enrollment FK program_applications unique WHERE nonnull. Head-only application listing stays existing admin RPC. UI explicit selected application ID.

## Storage
Private bucket edu-files, 10MB max. Paths lesson/<lesson uuid>/<random>-filename or submission/<submission uuid>/<random>-filename. Lesson read tied to lesson publication/member; submission read tied to submission row visibility (draft owner only). Write lesson head/instructor; submission active owner draft only. submitted files immutable. UI only uses short lived signed URL, never public URLs. A resource url can be storage:lesson/... internally; safe URL helper distinguishes storage path from external https. Submission attachments list via storage list under own/authorized prefix. Deny anon everything.

## UI contract
New /education.html in CoachPortal-WebApp. Shares js/config.js and js/supabase-client.js and Supabase auth session, but own entrypoint because existing auth intentionally requires coach profile. Email/password sign in/sign up/password reset. Empty account can sign in and sees no classes until head enrolls. Head UI creates courses/cohorts/classes, assigns members by email, mentors, publishes lessons/posts, marks attendance/completion and payment/credentials. Student/mentor roles cannot grant themselves access. UI does not depend on uncommitted original files. Link from existing app login and More view. No real student data in fixtures.

## Delivery
Site PR #123: education pathway copy and public capacity information remain ON HOLD for user edits and a separate publication instruction. Backend PR (supabase track): additive migration, RLS tests, October capacity14 for two planned classes instead of8, current graduation copy. Education migrations preserve all existing public.public_notices fields. Held notice copy is entirely commented out in supabase/manual/education-public-notices.pending.sql, outside migrations, and is review-only. Portal PR: new files/integration + tests. After verified backup/restore, Cursor CLI applies DB then portal; the site is not part of that deployment sequence. Operator enters actual questions, links and enrollments, and confirms times after collecting student availability; no fabricated curriculum or participant records.

## 구현 보완
원문 질문은 선택 입력으로 보존하고, 제출 시 한 가지 이상의 성찰을 요구한다. 기본과정 정원은 active와 completed 학생을 포함하며 멘토는 제외한다. 기수의 application_cohort_key와 반 정원 합계를 신청 예약에 사용한다. 추가 서버나 DB 프로젝트를 만들지 않는다. 운영 적용 전 DATA-PRESERVATION.md의 백업 및 복원 조건을 충족한다.


## 2026-09-09 운영 보완

- 정원은 active/completed 학생 배정과 아직 배정에 연결되지 않은 payment_pending/confirmed 신청 예약을 합산한다. 같은 신청과 학생을 두 번 세지 않는다. 정원 감소, 직접 신청 상태 수정, 신청 연결 해제에도 같은 기준을 적용한다.
- 수강 종료 또는 수업 비공개 후에도 본인은 내 기록 → 내 성찰 보관함에서 저장한 질문과 답변을 읽는다. 초안은 계속 본인만 볼 수 있다.
- 기존 코치 권한이 있는 멘토에게만 보고서 링크를 표시한다. 확인된 기존 멘티 연결은 해당 코치포털 카드로 이동하며 추가 권한을 만들지 않는다.
- 향후 과목은 Parenting(자녀양육), 부부관계, 목회와 사역, 리더십 등으로 안내한다. 강사명·미확정 과목번호·개강일·수강료를 임의로 확정하지 않는다.
- 현재 사용자 지정 merge·배포 담당은 Cursor CLI다. 구체적 실행 상태는 CoachPortal PR #4의 EXECUTION-PLAN.md, 검증 근거는 VERIFICATION.md를 확인한다.
