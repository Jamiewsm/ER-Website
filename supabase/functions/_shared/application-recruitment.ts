// 웹 catalog에서 승인된 10월 기수 마감과 동일한 시각. 신규 기수는 별도 승인 후 갱신한다.
export const BASIC_COURSE_RECRUITMENT_END = '2026-09-28T23:59:59-07:00';

export function isBasicCourseRecruitmentOpen(now: number = Date.now()): boolean {
  return Number.isFinite(now) && now <= Date.parse(BASIC_COURSE_RECRUITMENT_END);
}
