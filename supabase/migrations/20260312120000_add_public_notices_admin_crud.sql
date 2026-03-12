create table if not exists public.public_notices (
  id uuid primary key default gen_random_uuid(),
  legacy_key integer unique,
  tag text not null default '안내',
  title text not null,
  summary text,
  body text not null,
  body_is_html boolean not null default false,
  published_at date not null default current_date,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.public_notices enable row level security;

drop trigger if exists trg_public_notices_updated_at on public.public_notices;
create trigger trg_public_notices_updated_at
before update on public.public_notices
for each row execute function public.set_updated_at();

drop policy if exists "public can read notices" on public.public_notices;
create policy "public can read notices"
on public.public_notices
for select
using (true);

drop policy if exists "admins can insert notices" on public.public_notices;
create policy "admins can insert notices"
on public.public_notices
for insert
with check (
  lower(coalesce(auth.jwt()->>'email', '')) = 'campus.12000@gmail.com'
  or public.is_head_coach(auth.uid())
);

drop policy if exists "admins can update notices" on public.public_notices;
create policy "admins can update notices"
on public.public_notices
for update
using (
  lower(coalesce(auth.jwt()->>'email', '')) = 'campus.12000@gmail.com'
  or public.is_head_coach(auth.uid())
)
with check (
  lower(coalesce(auth.jwt()->>'email', '')) = 'campus.12000@gmail.com'
  or public.is_head_coach(auth.uid())
);

drop policy if exists "admins can delete notices" on public.public_notices;
create policy "admins can delete notices"
on public.public_notices
for delete
using (
  lower(coalesce(auth.jwt()->>'email', '')) = 'campus.12000@gmail.com'
  or public.is_head_coach(auth.uid())
);

insert into public.public_notices (legacy_key, tag, title, summary, body, body_is_html, published_at)
values
(
  1,
  '모집중',
  'SOIM 에니어그램 전문가반 5기 모집',
  '온라인 8주 과정 강의과 1:1 멘토링',
  '<p class="text-gray-600 leading-relaxed break-keep">에니어그램을 "아는 단계"에서 끝내지 않고, 삶과 현장에 적용하는 단계까지 함께 갑니다. 전문가반 5기에서는 기초 이론부터 적용까지 매주 심화 수업과 과제로 훈련하고, 1:1 멘토링과 강의 피드백을 통해 실제 강의·코칭 현장에서 자신 있게 사용할 수 있도록 돕습니다. 수료 후에는 (선택사항) 스터디 그룹과 코칭 실습으로 이어지며, 정식 코치 활동을 준비할 수 있습니다.</p><div class="mt-6 grid gap-3"><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">기간</span><span class="text-sm text-gray-700">8주</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">대상</span><span class="text-sm text-gray-700 break-keep">에니어그램을 단순한 성격 이해를 넘어, <br> 기독교 세계관 안에서 "자기 이해와 타인 돌봄"(코칭·강의)에 <br> 실제로 적용하고자 하는 분</span></div><div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"><span class="text-xs font-bold text-gray-500 w-20">지원마감</span><span class="text-sm text-gray-700">2025.01.15</span></div></div>',
  true,
  date '2025-01-15'
),
(
  2,
  '안내',
  '홈페이지 리뉴얼 안내',
  '리뉴얼 진행 중이며 일부 기능은 준비 중입니다.',
  '<p class="text-gray-600 leading-relaxed break-keep">ER 홈페이지는 더 나은 정보 제공을 위해 리뉴얼 중입니다. 일부 메뉴와 기능(로그인/공지 확장 등)은 순차적으로 업데이트됩니다.</p>',
  true,
  date '2024-12-20'
)
on conflict (legacy_key) do update set
  tag = excluded.tag,
  title = excluded.title,
  summary = excluded.summary,
  body = excluded.body,
  body_is_html = excluded.body_is_html,
  published_at = excluded.published_at,
  updated_at = now();
