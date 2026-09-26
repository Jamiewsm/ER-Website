// 등록 확정과 미제출 알림을 포털 진입 중심의 짧은 메일로 구성한다.
export type OnboardingKind = 'welcome' | 'reminder_3d' | 'reminder_1d';
export type OnboardingDelivery = {
  ok: boolean;
  reason?: string;
  delivery_id?: string;
  application_id?: string;
  recipient?: string;
  name?: string;
  course_title?: string;
  cohort_title?: string;
  class_title?: string;
  schedule_note?: string;
  starts_at?: string;
  due_at?: string | null;
};

function escapeOnboardingHtml(value: unknown): string {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

export function educationPortalUrl(value: string): string {
  const url = new URL(value || 'https://coach.er-coaching.com/education.html');
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error('invalid_education_portal_url');
  }
  return url.href;
}

function onboardingDate(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error('invalid_onboarding_date');
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric',
    weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false,
  }).format(date) + ' (한국 시간)';
}

export function buildEducationOnboardingEmail(delivery: OnboardingDelivery, kind: OnboardingKind, portalUrl: string) {
  const welcome = kind === 'welcome';
  const basicWelcome = welcome && /기본\s*과정/.test(delivery.course_title || '');
  const studentGuideUrl = 'https://coach.er-coaching.com/assets/guides/er-basic-student-guide.pdf';
  const name = delivery.name || '수강생';
  const title = basicWelcome ? '에니어그램 기본과정에 오신 것을 환영합니다' : welcome ? '등록이 확정되었습니다' : '자기관찰보고서 제출을 안내드립니다';
  const intro = basicWelcome
    ? `${name} 학우님, 안녕하세요. ER 대표 손지영입니다. 기본과정 등록이 확정되었습니다. 함께 배움을 시작하게 되어 반갑습니다. 8주 동안 자신을 더 깊이 이해하고, 일상에서 회복과 성장을 함께 연습해 가길 기대합니다.`
    : welcome
    ? `${name}님, 결제 확인과 과정 등록이 완료되었습니다. ER과 함께하는 배움에 오신 것을 환영합니다.`
    : `${name}님, 아직 자기관찰보고서 제출이 확인되지 않아 안내드립니다. 내 교실에서 작성 중인 내용을 이어서 작성하고 제출하실 수 있습니다.`;
  const rows = [
    ['과정', delivery.course_title || 'ER 교육과정'],
    ['기수 · 반', [delivery.cohort_title, delivery.class_title].filter(Boolean).join(' · ')],
    ...(welcome ? [['첫 수업', onboardingDate(delivery.starts_at) || '내 교실에서 일정을 확인해 주세요.']] : []),
    ['자기관찰보고서 제출 기한', onboardingDate(delivery.due_at) || (welcome ? '제출 기한은 추후 안내' : '')],
  ].filter(([, value]) => value);
  const accountGuide = basicWelcome
    ? `반드시 수강 신청서에 적은 이메일로 회원가입(계정 만들기)해 주세요.\n회원님의 신청 이메일: ${delivery.recipient}\n\n① Gmail로 신청하셨다면 ‘Google 로그인’에서 위 신청 이메일과 같은 Google 계정을 선택해 주세요. 처음 로그인하면 포털 계정이 만들어지므로 별도로 ‘계정 만들기’를 누를 필요가 없습니다.\n② 카카오 계정의 이메일로 신청하셨다면, 카카오에서 포털에 전달하는 이메일이 위 신청 이메일과 같은 경우 ‘카카오 로그인’을 이용하실 수 있습니다. 처음 로그인하면 포털 계정이 만들어집니다. 카카오톡을 사용하거나 카카오 메일 주소가 있다는 것만으로 자동 연결되는 것은 아닙니다.\n③ 그 외 이메일이거나 소셜 계정의 이메일이 다르다면, 위 신청 이메일과 비밀번호를 입력하고 ‘계정 만들기’를 누른 뒤 인증 메일을 확인해 주세요.\n\n이미 위 신청 이메일로 만든 포털 계정이 있다면 기존 방식으로 로그인해 주세요. 어떤 방법을 선택하든 로그인 계정의 이메일과 신청 이메일이 같아야 등록된 반이 연결됩니다. 다른 이메일로 새 계정을 만들지 마시고, 연결이 되지 않으면 이 메일에 회신해 주세요.`
    : `처음 참여하신다면 신청 이메일(${delivery.recipient})로 회원가입한 뒤 인증 메일을 확인해 주세요. 기존 계정이 있다면 같은 이메일의 계정으로 로그인해 주세요. 이메일 인증 후 등록된 반이 내 교실에 연결됩니다.`;
  const guide = basicWelcome
    ? '교육포털 홈의 ‘수업 전 준비’에서 강의계획안을 확인하고 자기관찰보고서를 작성해 주세요. 부담 없이, 나누기 편한 범위에서 적어 주시면 됩니다.'
    : welcome
    ? '내 교실의 ‘수업 전 준비’에서 강의계획안을 읽고 자기관찰보고서를 작성해 주세요. 작성 안내와 도움 질문도 함께 확인하실 수 있습니다.'
    : '자기관찰보고서의 내용은 포털에서만 확인할 수 있습니다. 이미 담당자에게 별도로 제출하셨거나 도움이 필요하시면 이 메일에 회신해 주세요.';
  const usageGuide = '수업 교재와 주차별 과제, 멘토 피드백도 교육포털에서 확인하실 수 있습니다. 해외에 계신 분은 포털 설정에서 표시 시간대를 선택해 주세요. 각 회차의 정확한 일정과 Zoom 입장 링크는 교육포털에서 확인하실 수 있습니다.';
  const help = '로그인이나 포털 이용에 도움이 필요하시면 이 메일에 회신해 주세요.';
  const footer = basicWelcome ? '여러분과 함께할 8주를 기대합니다.\n손지영 드림\nEnneagram for Restoration · 대표' : '감사합니다.\nEnneagram for Restoration · ER 교육 운영팀';
  const text = [title, intro, rows.map(([label, value]) => `${label}: ${value}`).join('\n'), guide,
    `내 교실 시작하기\n${portalUrl}`, ...(welcome ? [accountGuide] : []),
    ...(basicWelcome ? [usageGuide, `교육포털 사용 안내 PDF\n${studentGuideUrl}`, help] : []), footer].join('\n\n');
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f7f7f5;color:#26332e;font-family:Arial,'Apple SD Gothic Neo','Malgun Gothic',sans-serif${basicWelcome ? ';word-break:keep-all;overflow-wrap:anywhere' : ''}"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:32px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:auto;background:#fff;border-top:5px solid #338f70;border-radius:12px"><tr><td style="padding:32px 28px"><p style="margin:0 0 24px;color:#338f70;font-size:13px;font-weight:bold;letter-spacing:1px">ENNEAGRAM FOR RESTORATION</p><h1 style="margin:0 0 20px;font-size:25px;line-height:1.45">${escapeOnboardingHtml(title)}</h1><p style="margin:0 0 24px;font-size:15px;line-height:1.8">${escapeOnboardingHtml(intro)}</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #e5e7e4;border-bottom:1px solid #e5e7e4">${rows.map(([label, value]) => `<tr><td style="padding:10px 12px 10px 0;font-size:13px;color:#66716b;vertical-align:top;width:34%">${escapeOnboardingHtml(label)}</td><td style="padding:10px 0;font-size:14px;line-height:1.6">${escapeOnboardingHtml(value)}</td></tr>`).join('')}</table><p style="margin:24px 0;font-size:15px;line-height:1.8">${escapeOnboardingHtml(guide)}</p><p style="margin:28px 0"><a href="${escapeOnboardingHtml(portalUrl)}" style="display:inline-block;background:#338f70;color:#fff;text-decoration:none;padding:14px 24px;border-radius:8px;font-size:15px;font-weight:bold">내 교실 시작하기</a></p>${welcome ? `<p style="margin:0 0 24px;padding:16px;background:#f7f3ea;border-radius:8px;font-size:13px;line-height:1.8">${escapeOnboardingHtml(accountGuide).replace(/\n/g, '<br>')}</p>` : ''}${basicWelcome ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.8">${escapeOnboardingHtml(usageGuide)}</p><p style="margin:0 0 24px;font-size:15px;line-height:1.8"><a href="${studentGuideUrl}" style="color:#277456;text-decoration:underline">교육포털 사용 안내 PDF</a></p><p style="margin:0 0 24px;font-size:15px;line-height:1.8">${escapeOnboardingHtml(help)}</p>` : ''}<p style="margin:28px 0 0;border-top:1px solid #e5e7e4;padding-top:22px;font-size:13px;line-height:1.8;color:#66716b">${escapeOnboardingHtml(footer).replace(/\n/g, '<br>')}</p></td></tr></table></td></tr></table></body></html>`;
  return { subject: basicWelcome ? '[ER] 에니어그램 기본과정에 오신 것을 환영합니다' : welcome ? '[ER] 등록 확정 및 내 교실 이용 안내' : '[ER] 자기관찰보고서 제출 안내', html, text };
}
