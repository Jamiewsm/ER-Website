# ER 교육 포털 — 승인된 설계와 공통 계약

2026-09-08. 사용자가 전체 회의안을 고려해 실행을 승인했다. 설계 재승인을 요청하지 않고 구현·검증·PR까지 진행한다. 배포·merge는 각 저장소 운영 지침을 따른다.

## 운영 기준
- 기본과정은 분기별, 반당 학생 7명, 같은 반에서 8주. 10월 A/B반은 운영 준비 상태로 생성한다. 실제 일정·학생·줌 URL은 운영자가 입력한다. 7월은 8월말 종료이며 기존 기록을 변경하거나 이름으로 자동 연결하지 않는다.
- 멘토는 코치 훈련생이며 보통 2~3명 담당. 한 계정에 여러 과정·반의 student/mentor/instructor 역할을 연결한다. 수석코치는 활성 coach_profiles.role=head_coach로 판정하며 이름·이메일 하드코딩을 하지 않는다.
- 주차별 자기성찰 질문지, 답변 임시저장/제출, 담당 멘토 및 수석 열람, 학생에게 공유한 피드백만 학생 열람. 학생 수료·검정 합격은 자동 부여하지 않는다.
- 교실별 일정·줌·자료·YouTube/강의 링크·예약 공지·댓글·읽음. 기본 외 심화101/201/202·트레이닝도 지원. 자체 채팅·외부 자동 수집·Kakao 발송·시험 엔진은 이번 릴리스 범위 밖.
- 기존 코치 보고서 흐름은 유지. 교육 교실에서 기존 코치 앱의 담당 멘티/보고서로 이동하고 명시적으로 확인한 legacy_mentee_id만 연결한다.

## 데이터 계약 (public, prefix edu_)
UUID PK id default gen_random_uuid. created_at timestamptz default now. 모든 테이블 RLS 및 최소 GRANT. 최신 auth.users/coach_profiles/coach_mentees/program_applications는 기존 의존성. head helper는 security definer/set search_path=''로 자체 체크.
- edu_courses: id, code unique, title, kind (basic/growth/training), description default ''.
- edu_cohorts: id, course_id FK, title, application_cohort_key unique nullable, status (draft/active/completed), starts_on date nullable, ends_on date nullable.
- edu_classes: id, cohort_id FK, title, capacity integer default7, zoom_url text default '', schedule_note text default ''.
- edu_enrollments: id, class_id FK, user_id auth.users FK, display_name text, role student/mentor/instructor, status active/completed/withdrawn. Unique(class_id,user_id,role). Completion manual. Multiple roles allowed. Only head can mutate memberships; row lock serializes student capacity.
- edu_mentor_assignments: id, student_enrollment_id FK, mentor_enrollment_id FK, legacy_mentee_id nullable FK coach_mentees. Both same class valid roles; active assignment unique student; legacy link must match mentor owner. Only head mutations.
- edu_lessons: id,class_id,position positive integer,title,starts_at nullable timestamptz,publish_at nullable timestamptz (null=draft),questions jsonb default[] [{id:string,prompt:string}],resources jsonb default[] [{title:string,url:https URL}],description text default ''. Questions frozen after first submitted answer. Can publish with no questions/resources. Unique(class_id,position).
- edu_submissions: id,lesson_id,student_enrollment_id,answers jsonb default{} (question id to text),submitted_at nullable timestamptz,updated_at. Unique(lesson_id,student_enrollment_id). Only owner active student can insert/update own draft/submit; submitted answers immutable. Server validates question ids/content, stamps submission time. Head+assigned mentor+owner reads. Question snapshot set server side on submit (question_snapshot jsonb).
- edu_feedback: id,submission_id,author_id auth.users default auth.uid(),body text,is_shared boolean defaultfalse,created_at. Assigned active mentor or head writes; shared feedback visible owner; private visible assigned mentor and head only. Author-only update/delete or head. Students cannot write.
- edu_posts: id,class_id,title,body,publish_at nullable(null=draft),created_by auth.users default auth.uid(). Head/instructor writes. Class members read published; head/instructor read drafts.
- edu_comments: id,post_id,author_id default auth.uid(),body,created_at. Only visible post participants write/read. Author edit/delete or head; cannot spoof/change author/post.
- edu_post_reads: post_id,user_id default auth.uid(),read_at defaultnow PK(post_id,user_id). Owner can mark visible posts; head/instructor can list receipts; other users only own.
- edu_attendance: lesson_id,student_enrollment_id,status present/absent/excused, recorded_by default auth.uid(), PK pair. Head/instructor write; own student/assigned mentor/head/instructor read.
- edu_payment_entries: id,enrollment_id,amount numeric positive,currency KRW/USD,due_on date nullable,paid_at nullable timestamptz,note text default''. Head write; own student and head reads. Separate ledger, no payment processing. Currency never aggregated together.
- edu_credentials: id,user_id,kind level2_exam/level2_certificate/level1_certificate,status applied/passed/issued/failed,date_on nullable,note. Head write/own user read. Manual record; no automatic credentialing.

## RPCs
- edu_context() -> jsonb {is_head:boolean,is_coach:boolean,user_id:uuid}. authenticated only.
- edu_add_member(p_class_id uuid,p_email text,p_display_name text,p_role text) -> edu_enrollments. Head only; exact normalized existing auth user email, user must first sign up through portal. No exposed auth directory. Upsert reactivates safely subject capacity.
- edu_link_application(p_enrollment_id uuid,p_application_id uuid) -> void. Head only; confirms supplied student by exact email if application contact is valid email; otherwise require manual mapping? Prefer no auto mapping and retain explicit head-selected link. ADD nullable application_id on enrollment FK program_applications unique WHERE nonnull. Head-only application listing stays existing admin RPC. UI explicit selected application ID.

## Storage
Private bucket edu-files, 10MB max. Paths lesson/<lesson uuid>/<random>-filename or submission/<submission uuid>/<random>-filename. Lesson read tied to lesson publication/member; submission read tied to submission row visibility (draft owner only). Write lesson head/instructor; submission active owner draft only. submitted files immutable. UI only uses short lived signed URL, never public URLs. A resource url can be storage:lesson/... internally; safe URL helper distinguishes storage path from external https. Submission attachments list via storage list under own/authorized prefix. Deny anon everything.

## UI contract
New /education.html in CoachPortal-WebApp. Shares js/config.js and js/supabase-client.js and Supabase auth session, but own entrypoint because existing auth intentionally requires coach profile. Email/password sign in/sign up/password reset. Empty account can sign in and sees no classes until head enrolls. Head UI creates courses/cohorts/classes, assigns members by email, mentors, publishes lessons/posts, marks attendance/completion and payment/credentials. Student/mentor roles cannot grant themselves access. UI does not depend on uncommitted original files. Link from existing app login and More view. No real student data in fixtures.

## Delivery
Site PR: new education pathway copy + 7-per-class public capacity. Backend PR (supabase track): additive migration, RLS tests, October capacity14 for two planned classes instead of8, current graduation copy. Portal PR: new files/integration + tests. Do not merge/deploy automatically. Operator enters actual questions, links, times and enrollments; no fabricated curriculum or participant records.

## 구현 보완
원문 질문은 선택 입력으로 보존하고, 제출 시 한 가지 이상의 성찰을 요구한다. 기본과정 정원은 active와 completed 학생을 포함하며 멘토는 제외한다. 기수의 application_cohort_key와 반 정원 합계를 신청 예약에 사용한다. 추가 서버나 DB 프로젝트를 만들지 않는다. 운영 적용 전 DATA-PRESERVATION.md의 백업 및 복원 조건을 충족한다.
