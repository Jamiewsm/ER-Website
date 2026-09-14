// 기본 8주 과정의 강의계획안과 자기관찰보고서 안내 메일을 생성한다.
const course = {
  title: 'ER 에니어그램 기본 8주 과정',
  term: '2026년 10월',
  goal: '에니어그램을 기독교적 관점에서 심도 있게 이해하고, 자신의 성숙과 타인의 성장을 돕는 도구로 활용합니다.',
  format: '총 24시간 강의 (주 3시간 × 8주) 및 주 1회 멘토링',
  delivery: '온라인 (Zoom)',
  instructor: '손지영',
  email: 'myjiji82@gmail.com',
  biography: [
    '한양대학교 역사학과 졸업',
    '전 YWAM 중동 선교사',
    'Enneagram Spectrum (IEA accredited program) certified instructor and coach (Advanced)',
    'Enneagram for Restoration 설립자',
    '개인 세션 100회 이상 진행',
    '기관 강의, 세미나 및 수련회 강의 다수',
    'SOIM Education Leadership Instructor',
    'Arizona State University 심리학 석사 과정 재학 중',
  ],
  sessions: [
    'Introduction, 중심과 하위유형',
    '장형 1',
    '장형 2',
    '가슴형 1',
    '가슴형 2',
    '머리형 1',
    '머리형 2',
    '다양한 하위이론 / 에니어그램의 활용과 성장',
  ],
  scheduleNote: '세부 수업 날짜는 반별 일정에 따라 안내드립니다. 인터뷰 일정에 따라 날짜와 강의 주제가 달라질 수 있습니다.',
  reportIntro: '수업을 시작하기 전, 평소 자신의 생각과 감정, 말과 행동을 관찰한 내용을 A4 1장 내외로 자유롭게 작성해 주세요. 에니어그램 사전 지식은 필요하지 않습니다.',
  reportGuide: '“나는 어떤 사람인가”를 중심으로, 중요하게 여기는 가치와 관계의 패턴, 반복하는 반응 등을 구체적인 경험과 함께 적어 주세요. 외향성·내향성 등 MBTI에서 떠올린 관찰이나, 다른 사람에게 자주 듣는 평가를 곁들여도 좋습니다.',
  questionGuide: '아래 질문은 글의 방향을 찾기 위한 도움 질문입니다. 마음에 와닿는 질문을 선택해 자유롭게 서술해 주세요. 모든 질문에 답할 필요는 없으며, 나누기 편한 범위에서 작성하시면 됩니다.',
  questions: [
    '삶에서 가장 중요하게 여기는 가치는 무엇인가요? 어떤 영역에 열정이 있으며, 어디에서 에너지를 얻나요?',
    '자신의 장점과 은사는 무엇인가요? 속한 그룹이나 공동체에 어떤 방식으로 기여하나요?',
    '편안하고 건강한 상태일 때는 어떤 모습인가요? 반대로 지치거나 스트레스를 받을 때는 어떤 모습인가요?',
    '자신의 연약한 영역은 무엇인가요? 무엇에 특별히 민감하고, 어떤 상황에서 감정적·신체적으로 반응하나요? 가장 두렵게 느끼는 일이나 피하고 싶은 최악의 상황은 무엇인가요?',
    '앞서 적은 연약함과 두려움으로부터 자신을 보호하기 위해 어떻게 행동하나요? 살아남거나 안전을 확보하기 위해 의식적·무의식적으로 사용해 온 전략이 있나요?',
    '가장 간절히 원하는 것은 무엇인가요? 안전, 공감, 성취, 인정, 안락, 관계, 연대 등 자신에게 중요한 욕구를 떠올려 보세요.',
    '그러한 욕구를 채우기 위해 찾아낸 효과적인 방법에는 무엇이 있나요?',
    '어린 시절에는 어떤 아이였나요? 부모님과 가족들은 어떤 성격을 지녔나요?',
  ],
  books: [
    '완전한 에니어그램 · 비어트리스 체스넛 · 연경문화사 · 2018',
    '변화가 필요할 때 에니어그램 · 수잔 스태빌 · IVP · 2024',
    '세상을 바라보는 아홉 가지 렌즈 · Jerome Wagner · 학지사 · 2016',
    '에니어그램의 지혜 · 돈 리처드 리소, 러스 허드슨 · 한문화 · 2015',
  ],
  channels: [
    '김현경 작가의 “어느 별에서 왔니” · 유튜브 채널',
    'Chestnut Paes Enneagram Academy · 영어 유튜브 채널',
  ],
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);
}

const paragraphStyle = 'margin:0 0 16px;font-size:15px;line-height:1.8;color:#303a35';
const headingStyle = 'margin:30px 0 12px;font-size:20px;line-height:1.5;color:#18251f';

function listHtml(items: string[], ordered = false): string {
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag} style="margin:0 0 16px;padding-left:22px;color:#303a35;font-size:14px;line-height:1.8">${items.map((item) => `<li style="margin:0 0 9px;padding-left:3px">${escapeHtml(item)}</li>`).join('')}</${tag}>`;
}

export function buildBasicCourseWelcomeHtml(input: { name: string }): string {
  const rows = course.sessions.map((topic, index) => `<tr><td style="width:54px;padding:12px 10px;border-bottom:1px solid #e3e7e4;font-size:14px;vertical-align:top;white-space:nowrap">${index + 1}회차</td><td style="padding:12px 10px;border-bottom:1px solid #e3e7e4;font-size:14px;line-height:1.6">${escapeHtml(topic)}</td></tr>`).join('');
  return `<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${course.title} | ${course.term}</title></head>
<body style="margin:0;padding:0;background:#f4f6f5;font-family:Arial,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;-webkit-text-size-adjust:100%">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:100%;max-width:640px;border-collapse:collapse;background:#ffffff;border:1px solid #e3e7e4"><tr><td style="padding:28px 24px">
<p style="margin:0 0 12px;font-size:12px;font-weight:bold;letter-spacing:1px;color:#17634b">ENNEAGRAM FOR RESTORATION</p>
<h1 style="margin:0 0 8px;font-size:25px;line-height:1.45;color:#18251f">${course.title}</h1>
<p style="margin:0 0 28px;font-size:15px;color:#59675f">${course.term} · 강의계획안 및 자기관찰보고서 안내</p>
<p style="${paragraphStyle}">${escapeHtml(input.name)}님, 안녕하세요.<br>함께 배움을 시작하게 되어 반갑습니다. 강의계획안과 개강 전 작성하실 자기관찰보고서를 안내드립니다.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border-left:3px solid #238162"><tr><td style="padding:4px 0 4px 16px;font-size:14px;line-height:1.8;color:#303a35"><strong>개강</strong> ${course.term}<br><strong>구성</strong> ${course.format}<br><strong>진행</strong> ${course.delivery}<br><strong>강사</strong> ${course.instructor} · <a href="mailto:${course.email}" style="color:#17634b">${course.email}</a></td></tr></table>
<h2 style="${headingStyle}">과정 목표</h2><p style="${paragraphStyle}">${course.goal}</p>
<h2 style="${headingStyle}">회차별 강의 주제</h2>
<table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;color:#303a35;text-align:left"><thead><tr><th scope="col" style="width:54px;padding:11px 10px;background:#f3f5f4;border-bottom:1px solid #dce2de;font-size:13px">회차</th><th scope="col" style="padding:11px 10px;background:#f3f5f4;border-bottom:1px solid #dce2de;font-size:13px">주제</th></tr></thead><tbody>${rows}</tbody></table>
<p style="margin:12px 0 16px;font-size:13px;line-height:1.8;color:#59675f">${course.scheduleNote}</p>
<h2 style="${headingStyle}">자기관찰보고서 작성 안내</h2>
<p style="${paragraphStyle}">${course.reportIntro}</p><p style="${paragraphStyle}">${course.reportGuide}</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#faf7f1;border:1px solid #e8dfd0"><tr><td style="padding:16px;font-size:14px;line-height:1.8;color:#303a35"><strong>분량</strong> A4 1장 내외 · 자유 서술<br><strong>제출 기한</strong> 수업 시작 전까지<br><strong>제출처</strong> <a href="mailto:${course.email}" style="color:#17634b">${course.email}</a><br>이메일에 본인의 이름과 수강 반을 함께 적어 보내 주세요.</td></tr></table>
<h3 style="margin:24px 0 12px;font-size:16px;line-height:1.6;color:#18251f">작성을 돕는 질문</h3><p style="${paragraphStyle}">${course.questionGuide}</p>${listHtml(course.questions, true)}
<h2 style="${headingStyle}">강사 소개</h2><p style="${paragraphStyle}"><strong>${course.instructor}</strong> · <a href="mailto:${course.email}" style="color:#17634b">${course.email}</a></p>${listHtml(course.biography)}
<h2 style="${headingStyle}">참고 및 추천 도서</h2>${listHtml(course.books)}
<h2 style="${headingStyle}">추천 콘텐츠</h2>${listHtml(course.channels)}
<p style="margin:28px 0 0;font-size:15px;line-height:1.8;color:#303a35">수업과 자기관찰보고서에 관한 문의는 강사 이메일로 보내 주세요.<br>감사합니다.<br><strong>Enneagram for Restoration</strong></p>
</td></tr></table>
</td></tr></table></body></html>`;
}

export function buildBasicCourseWelcomeText(input: { name: string }): string {
  return [
    `${course.title} | ${course.term}`,
    '강의계획안 및 자기관찰보고서 안내',
    '',
    `${input.name}님, 안녕하세요.`,
    '함께 배움을 시작하게 되어 반갑습니다. 강의계획안과 개강 전 작성하실 자기관찰보고서를 안내드립니다.',
    '',
    `개강: ${course.term}`,
    `구성: ${course.format}`,
    `진행: ${course.delivery}`,
    `강사: ${course.instructor} · ${course.email}`,
    '', '과정 목표', course.goal,
    '', '회차별 강의 주제',
    ...course.sessions.map((topic, index) => `${index + 1}회차 | ${topic}`),
    course.scheduleNote,
    '', '자기관찰보고서 작성 안내', course.reportIntro, '', course.reportGuide,
    '', '분량: A4 1장 내외 · 자유 서술', '제출 기한: 수업 시작 전까지',
    `제출처: ${course.email}`, '이메일에 본인의 이름과 수강 반을 함께 적어 보내 주세요.',
    '', '작성을 돕는 질문', course.questionGuide, '',
    ...course.questions.map((question, index) => `${index + 1}. ${question}`),
    '', '강사 소개', `${course.instructor} · ${course.email}`,
    ...course.biography.map((line) => `- ${line}`),
    '', '참고 및 추천 도서', ...course.books.map((book) => `- ${book}`),
    '', '추천 콘텐츠', ...course.channels.map((channel) => `- ${channel}`),
    '', '수업과 자기관찰보고서에 관한 문의는 강사 이메일로 보내 주세요.',
    '감사합니다.', 'Enneagram for Restoration',
  ].join('\n');
}
