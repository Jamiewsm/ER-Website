import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.117.2';
import { z } from 'npm:zod@4.6.5';

type Client = SupabaseClient;
type ToolResult = { content: { type: 'text'; text: string }[]; isError?: boolean };
type Registrar = {
  registerTool: (name: string, definition: Record<string, unknown>, handler: (input: any) => Promise<ToolResult>) => void;
};

const uuid = z.string().uuid();
const limit = z.number().int().min(1).max(50).default(20);
const read = { readOnlyHint: true, destructiveHint: false, openWorldHint: false };
const write = { readOnlyHint: false, destructiveHint: false, openWorldHint: false };

function result(value: unknown): ToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(value) }] };
}

function checked<T>(response: { data: T; error: { message: string } | null }): T {
  if (response.error) throw new Error(response.error.message);
  return response.data;
}

export function registerEducationTools(server: Registrar, db: Client) {
  server.registerTool('education_context', {
    title: '교육포털 내 권한 확인',
    description: '현재 로그인 계정의 교육포털 역할을 확인합니다. 다른 작업 전에 호출하세요.',
    inputSchema: z.object({}), annotations: read,
  }, async () => result(checked(await db.rpc('edu_context'))));

  server.registerTool('education_classes', {
    title: '내 수업 조회',
    description: '로그인 계정이 볼 수 있는 교육 반과 기수 정보를 조회합니다.',
    inputSchema: z.object({ limit }), annotations: read,
  }, async ({ limit: count }) => result(checked(await db.from('edu_classes')
    .select('id,cohort_id,title,capacity,schedule_note,zoom_url')
    .order('created_at', { ascending: false }).limit(count))));

  server.registerTool('education_lessons', {
    title: '수업과 자료 조회',
    description: '지정한 반의 수업, 공개 시각, 설명과 자료 메타데이터를 조회합니다. 비공개 항목은 RLS가 걸러냅니다.',
    inputSchema: z.object({ class_id: uuid, limit }), annotations: read,
  }, async ({ class_id, limit: count }) => result(checked(await db.from('edu_lessons')
    .select('id,class_id,position,title,starts_at,publish_at,description,resources')
    .eq('class_id', class_id).order('position').limit(count))));

  server.registerTool('education_posts', {
    title: '수업 공지 조회',
    description: '지정 반에서 볼 수 있는 공지와 교사 전용 초안을 확인합니다.',
    inputSchema: z.object({ class_id: uuid, limit }), annotations: read,
  }, async ({ class_id, limit: count }) => result(checked(await db.from('edu_posts')
    .select('id,class_id,title,body,publish_at,created_at,created_by')
    .eq('class_id', class_id).order('created_at', { ascending: false }).limit(count))));

  server.registerTool('education_submissions', {
    title: '과제 제출 조회',
    description: '한 수업의 과제 제출 상태를 조회합니다. 답변 원문은 별도 상세 조회에서 필요한 제출물만 확인하세요.',
    inputSchema: z.object({ lesson_id: uuid, limit }), annotations: read,
  }, async ({ lesson_id, limit: count }) => result(checked(await db.from('edu_submissions')
    .select('id,lesson_id,student_enrollment_id,submitted_at,updated_at')
    .eq('lesson_id', lesson_id).order('updated_at', { ascending: false }).limit(count))));

  server.registerTool('education_submission_detail', {
    title: '제출 답변 상세 조회',
    description: '실제 제출물 ID 한 건의 답변을 권한 범위 안에서 조회합니다.',
    inputSchema: z.object({ id: uuid }), annotations: read,
  }, async ({ id }) => result(checked(await db.from('edu_submissions')
    .select('id,lesson_id,student_enrollment_id,answers,submitted_at,updated_at')
    .eq('id', id).maybeSingle())));

  server.registerTool('education_feedback', {
    title: '과제 피드백 조회',
    description: '지정한 제출물에 대해 권한이 허용하는 피드백만 조회합니다.',
    inputSchema: z.object({ submission_id: uuid, limit }), annotations: read,
  }, async ({ submission_id, limit: count }) => result(checked(await db.from('edu_feedback')
    .select('id,submission_id,body,is_shared,author_id,created_at')
    .eq('submission_id', submission_id).order('created_at', { ascending: false }).limit(count))));

  server.registerTool('education_create_draft_post', {
    title: '수업 공지 초안 작성',
    description: '지정 반의 교사 전용 비공개 공지 초안을 만듭니다. 학생에게 공개하려면 별도 공개 작업이 필요합니다.',
    inputSchema: z.object({ class_id: uuid, title: z.string().trim().min(1).max(200), body: z.string().max(10000) }),
    annotations: write,
  }, async ({ class_id, title, body }) => result(checked(await db.from('edu_posts')
    .insert({ class_id, title, body, publish_at: null }).select('id,class_id,title,body,publish_at').single())));

  server.registerTool('education_add_private_feedback', {
    title: '비공개 과제 피드백 작성',
    description: '제출물에 멘토 또는 수석코치만 보는 피드백을 작성합니다. 학생에게 자동 공유되지 않습니다.',
    inputSchema: z.object({ submission_id: uuid, body: z.string().trim().min(1).max(20000) }),
    annotations: write,
  }, async ({ submission_id, body }) => result(checked(await db.from('edu_feedback')
    .insert({ submission_id, body, is_shared: false }).select('id,submission_id,body,is_shared,created_at').single())));
}

export function registerCoachTools(server: Registrar, db: Client) {
  server.registerTool('coach_profile', {
    title: '내 코치 계정 확인',
    description: '현재 로그인 계정의 코치 역할과 활성 상태를 확인합니다.',
    inputSchema: z.object({}), annotations: read,
  }, async () => {
    const { data, error } = await db.auth.getUser();
    if (error) throw new Error(error.message);
    const user = data.user;
    if (!user) throw new Error('로그인이 필요합니다.');
    return result(checked(await db.from('coach_profiles')
      .select('user_id,display_name,role,is_active').eq('user_id', user.id).maybeSingle()));
  });

  server.registerTool('coach_tasks', {
    title: '코치 과제 조회',
    description: '현재 계정에 허용된 코치 과제의 최근 목록을 조회합니다.',
    inputSchema: z.object({ limit }), annotations: read,
  }, async ({ limit: count }) => result(checked(await db.from('coach_tasks')
    .select('id,title,description,due_at,week_label,status,created_by,created_at')
    .order('created_at', { ascending: false }).limit(count))));

  server.registerTool('coach_materials', {
    title: '코치 자료 조회',
    description: '현재 계정에 허용된 자료 목록과 외부 링크를 조회합니다. 비공개 파일 URL은 반환하지 않습니다.',
    inputSchema: z.object({ limit }), annotations: read,
  }, async ({ limit: count }) => result(checked(await db.from('coach_materials')
    .select('id,title,description,category,external_url,created_at')
    .order('created_at', { ascending: false }).limit(count))));

  server.registerTool('coach_schedules', {
    title: '코치 일정 조회',
    description: '조회 시작 시각 이후의 코치 일정을 확인합니다.',
    inputSchema: z.object({ from: z.string().datetime({ offset: true }), limit }), annotations: read,
  }, async ({ from, limit: count }) => result(checked(await db.from('coach_schedules')
    .select('id,title,schedule_type,start_at,end_at,location,created_by')
    .gte('end_at', from).order('start_at').limit(count))));

  server.registerTool('coach_create_draft_task', {
    title: '코치 과제 초안 작성',
    description: '자신의 코치 과제를 초안 상태로 만듭니다. 첨부파일은 지원하지 않습니다.',
    inputSchema: z.object({ title: z.string().trim().min(1).max(200), description: z.string().max(10000) }),
    annotations: write,
  }, async ({ title, description }) => {
    const { data, error } = await db.auth.getUser();
    if (error) throw new Error(error.message);
    const user = data.user;
    if (!user) throw new Error('로그인이 필요합니다.');
    return result(checked(await db.from('coach_tasks')
      .insert({ title, description, status: 'draft', created_by: user.id })
      .select('id,title,description,status,created_at').single()));
  });
}

export function registerWebsiteTools(server: Registrar, db: Client) {
  server.registerTool('website_applications', {
    title: '과정 신청 현황 조회',
    description: '수석코치 계정으로 최근 과정 신청 목록을 조회합니다. 서버의 기존 관리자 RPC가 권한을 검사합니다.',
    inputSchema: z.object({ program_key: z.string().max(100).nullable().default(null), limit }), annotations: read,
  }, async ({ program_key, limit: count }) => {
    const rows = checked(await db.rpc('admin_list_program_applications', { p_program_key: program_key, p_limit: count }));
    return result((rows || []).map((row: Record<string, unknown>) => ({
      id: row.id, program_key: row.program_key, cohort_key: row.cohort_key,
      status: row.status, created_at: row.created_at, confirmed_at: row.confirmed_at,
    })));
  });

  server.registerTool('website_application_detail', {
    title: '과정 신청 상세 조회',
    description: '최근 최대 500건의 목록에서 특정 신청서의 운영 정보를 조회합니다. 민감한 답변은 필요한 경우에만 사용하세요.',
    inputSchema: z.object({ id: uuid }), annotations: read,
  }, async ({ id }) => {
    const rows = checked(await db.rpc('admin_list_program_applications', { p_program_key: null, p_limit: 500 }));
    return result((rows || []).find((row: { id: string }) => row.id === id) || null);
  });

  server.registerTool('website_update_application_status', {
    title: '과정 신청 처리 상태 변경',
    description: '수석코치 계정으로 미확정 신청만 연락 완료·결제 대기·대기 중 하나로 바꿉니다. 확정·취소·등록 연동된 신청은 서버에서 거부합니다.',
    inputSchema: z.object({ id: uuid, status: z.enum(['contacted', 'payment_pending', 'waitlisted']) }),
    annotations: write,
  }, async ({ id, status }) => result(checked(await db.rpc('er_mcp_update_application_status', {
    p_id: id, p_status: status,
  }))));
}
