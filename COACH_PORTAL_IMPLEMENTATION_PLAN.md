# Coach Portal 구현안 (ER Website 맞춤)

## 1) 현재 사이트 기준 결론

현재 프로젝트는 다음 구조입니다.
- 프론트엔드: 단일 `index.html` (Tailwind CDN + Vanilla JS)
- 배포: Cloudflare Pages (`wrangler.toml`)
- 인증: Supabase Auth (`state.user`, `toggleLogin`, `renderMyPage` 존재)
- 백엔드: 별도 서버 없음 (필요 시 Supabase DB/Storage + Edge Functions 사용)

따라서 **7명 코치 전용 과제 업로드/공유 시스템은 바로 확장 가능**합니다.
가장 빠른 경로는:
1. Supabase에 코치 권한 테이블 + 과제/자료/일정 테이블 생성
2. Storage 버킷 생성 (과제 첨부파일)
3. RLS 정책으로 코치만 접근 제한
4. `index.html`에 `coach_portal` 섹션 추가

---

## 2) MVP 범위 (4주 내)

### 필수 기능
1. 코치 로그인 (기존 기능 재사용)
2. 코치 권한 확인 (코치만 포털 접근)
3. 과제 등록/수정/삭제
4. 파일 업로드/다운로드 (PDF, 이미지, 문서)
5. 코치 공용 자료실
6. 주간 스터디/트레이닝 일정 캘린더 리스트

### 제외(2차로 미룸)
1. 실시간 채팅
2. 댓글/멘션
3. 복잡한 승인 워크플로우

---

## 3) DB 설계 (Supabase/Postgres)

아래 SQL을 Supabase SQL Editor에서 실행하면 기본 구조가 만들어집니다.

```sql
-- 0) 확장
create extension if not exists pgcrypto;

-- 1) 역할 enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'coach_role') THEN
    CREATE TYPE coach_role AS ENUM ('head_coach', 'coach');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'material_visibility') THEN
    CREATE TYPE material_visibility AS ENUM ('coaches_only');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE task_status AS ENUM ('draft', 'published', 'archived');
  END IF;
END $$;

-- 2) 코치 프로필 (auth.users와 1:1)
create table if not exists public.coach_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role coach_role not null default 'coach',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) 스터디/트레이닝 일정
create table if not exists public.coach_schedules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  schedule_type text not null check (schedule_type in ('study', 'training')),
  start_at timestamptz not null,
  end_at timestamptz not null,
  location text,
  notes text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4) 과제(게시글)
create table if not exists public.coach_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  due_at timestamptz,
  week_label text, -- 예: 2026-W10
  status task_status not null default 'published',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5) 과제 첨부파일
create table if not exists public.coach_task_files (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.coach_tasks(id) on delete cascade,
  storage_path text not null,
  original_name text not null,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

-- 6) 공용 자료실
create table if not exists public.coach_materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null default 'general', -- study/training/reference/general
  visibility material_visibility not null default 'coaches_only',
  storage_path text not null,
  original_name text not null,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7) 업데이트 시간 트리거
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_coach_profiles_updated_at on public.coach_profiles;
create trigger trg_coach_profiles_updated_at
before update on public.coach_profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_coach_schedules_updated_at on public.coach_schedules;
create trigger trg_coach_schedules_updated_at
before update on public.coach_schedules
for each row execute function public.set_updated_at();

drop trigger if exists trg_coach_tasks_updated_at on public.coach_tasks;
create trigger trg_coach_tasks_updated_at
before update on public.coach_tasks
for each row execute function public.set_updated_at();

drop trigger if exists trg_coach_materials_updated_at on public.coach_materials;
create trigger trg_coach_materials_updated_at
before update on public.coach_materials
for each row execute function public.set_updated_at();

-- 8) 코치 여부 확인 함수
create or replace function public.is_active_coach(_uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.coach_profiles cp
    where cp.user_id = _uid
      and cp.is_active = true
  );
$$;

-- 9) RLS 활성화
alter table public.coach_profiles enable row level security;
alter table public.coach_schedules enable row level security;
alter table public.coach_tasks enable row level security;
alter table public.coach_task_files enable row level security;
alter table public.coach_materials enable row level security;

-- 10) 정책: 코치만 읽기/쓰기
-- profiles
create policy "coaches can view profiles"
on public.coach_profiles
for select
using (public.is_active_coach(auth.uid()));

create policy "head coach can manage profiles"
on public.coach_profiles
for all
using (
  exists (
    select 1 from public.coach_profiles cp
    where cp.user_id = auth.uid()
      and cp.role = 'head_coach'
      and cp.is_active = true
  )
)
with check (
  exists (
    select 1 from public.coach_profiles cp
    where cp.user_id = auth.uid()
      and cp.role = 'head_coach'
      and cp.is_active = true
  )
);

-- schedules
create policy "coaches can read schedules"
on public.coach_schedules
for select
using (public.is_active_coach(auth.uid()));

create policy "coaches can write schedules"
on public.coach_schedules
for insert
with check (public.is_active_coach(auth.uid()) and created_by = auth.uid());

create policy "coaches can update schedules"
on public.coach_schedules
for update
using (public.is_active_coach(auth.uid()))
with check (public.is_active_coach(auth.uid()));

create policy "coaches can delete schedules"
on public.coach_schedules
for delete
using (public.is_active_coach(auth.uid()));

-- tasks
create policy "coaches can read tasks"
on public.coach_tasks
for select
using (public.is_active_coach(auth.uid()));

create policy "coaches can write tasks"
on public.coach_tasks
for insert
with check (public.is_active_coach(auth.uid()) and created_by = auth.uid());

create policy "coaches can update tasks"
on public.coach_tasks
for update
using (public.is_active_coach(auth.uid()))
with check (public.is_active_coach(auth.uid()));

create policy "coaches can delete tasks"
on public.coach_tasks
for delete
using (public.is_active_coach(auth.uid()));

-- task files
create policy "coaches can read task files"
on public.coach_task_files
for select
using (public.is_active_coach(auth.uid()));

create policy "coaches can write task files"
on public.coach_task_files
for insert
with check (public.is_active_coach(auth.uid()) and uploaded_by = auth.uid());

create policy "coaches can delete task files"
on public.coach_task_files
for delete
using (public.is_active_coach(auth.uid()));

-- materials
create policy "coaches can read materials"
on public.coach_materials
for select
using (public.is_active_coach(auth.uid()));

create policy "coaches can write materials"
on public.coach_materials
for insert
with check (public.is_active_coach(auth.uid()) and uploaded_by = auth.uid());

create policy "coaches can update materials"
on public.coach_materials
for update
using (public.is_active_coach(auth.uid()))
with check (public.is_active_coach(auth.uid()));

create policy "coaches can delete materials"
on public.coach_materials
for delete
using (public.is_active_coach(auth.uid()));
```

---

## 4) Storage 설계

Supabase Storage 버킷 2개 생성:
1. `coach-task-files` (과제 첨부)
2. `coach-materials` (공유 자료)

경로 규칙 예시:
- `coach-task-files/{task_id}/{timestamp}_{filename}`
- `coach-materials/{category}/{timestamp}_{filename}`

권장 파일 제한:
- 허용 확장자: `pdf, doc, docx, ppt, pptx, xls, xlsx, png, jpg, jpeg, webp, mp4`
- 최대 용량: `30MB` (영상은 100MB 별도 정책 가능)

Storage 정책도 DB와 동일하게 **active coach만 접근**으로 설정.

---

## 5) 화면 구조 (index.html 확장)

현재 `renderSection` 패턴을 그대로 유지하고 아래 섹션 추가:

1. `coach_portal` (코치 홈)
- 이번 주 스케줄 요약
- 최근 과제 5개
- 최근 자료 5개

2. `coach_tasks` (과제 목록)
- 필터: 주차/상태
- 버튼: 과제 등록

3. `coach_task_detail` (과제 상세)
- 제목/설명/마감일
- 첨부파일 목록/다운로드

4. `coach_task_editor` (과제 작성/수정)
- 텍스트 입력 + 파일 업로드

5. `coach_materials` (자료실)
- 카테고리 탭
- 업로드 + 검색

6. `coach_schedule` (주간 일정)
- 리스트 뷰부터 시작 (캘린더 UI는 2차)
- 스터디/트레이닝 타입 구분

### 네비게이션 추가
- 로그인 사용자가 코치이면 우상단 버튼에서 `My Page` 대신 `Coach Portal` 진입
- 코치가 아니면 기존 `My Page` 유지

---

## 6) 프론트엔드 함수 설계 (현재 코드 스타일에 맞춤)

추가 state:
```js
state.isCoach = false;
state.coachProfile = null;
```

추가 함수:
1. `async function loadCoachProfile()`
- `coach_profiles` 조회
- `is_active` true면 `state.isCoach = true`

2. `async function guardCoachAccess()`
- 비로그인: 로그인 모달
- 로그인 but 코치 아님: 접근 차단 UI

3. `async function fetchCoachDashboard()`
- schedules/tasks/materials 최근 데이터 병렬 조회

4. `async function createCoachTask(payload, files)`
- `coach_tasks` insert
- 파일은 Storage 업로드 후 `coach_task_files` insert

5. `async function fetchCoachTasks(filters)`
6. `async function createCoachMaterial(payload, file)`
7. `async function fetchCoachSchedules(weekStart, weekEnd)`

---

## 7) 개발 순서 (권장 일정)

### Week 1
1. Supabase 테이블/enum/RLS 생성
2. 코치 7명 계정 생성 + `coach_profiles` 입력
3. Storage 버킷/정책 생성
4. 코치 권한 체크 함수 연결 (`loadCoachProfile`)

### Week 2
1. `coach_portal`, `coach_tasks`, `coach_task_editor` UI 추가
2. 과제 CRUD + 첨부파일 업로드 연결
3. 권한 체크/에러 처리

### Week 3
1. `coach_materials` UI + 업로드/다운로드
2. `coach_schedule` UI + CRUD
3. 모바일 반응형 점검

### Week 4
1. QA (권한 우회, 파일 정책, 잘못된 입력)
2. 코치 파일럿 테스트(7명)
3. 개선 후 운영 배포

---

## 8) 운영 체크리스트

1. Supabase Auth 이메일 인증 ON
2. 코치 계정 외 가입자는 `coach_profiles` 미등록(자동 차단)
3. RLS 테스트 케이스 필수
- 코치 아닌 계정으로 `coach_tasks` 조회 실패 확인
- 로그인 안 한 상태 API 호출 실패 확인
4. 파일 업로드 시 MIME/용량 검증
5. 백업: 주 1회 DB 백업 스냅샷

---

## 9) 다음 단계 (바로 실행)

1. 위 SQL을 Supabase에 적용
2. 코치 7명 `auth.users` 생성 후 `coach_profiles` insert
3. `index.html`에 `coach_portal` 섹션 추가 시작

초기 파일 구조가 단일 HTML이라 유지보수를 위해 2차에서 아래 분리를 권장:
- `/js/auth.js`
- `/js/coach-portal.js`
- `/js/supabase-api.js`
- `/css/coach-portal.css`

하지만 1차 MVP는 지금 구조에서도 충분히 구현 가능합니다.
