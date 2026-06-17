#!/usr/bin/env node
// Editorial/source-shape review gate for ER premium chemistry cards.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CHEMISTRY_DIR = path.join(ROOT, 'docs/report-content/chemistry');
const args = new Set(process.argv.slice(2));
const PROMOTE_REVIEWED = args.has('--promote-reviewed');

const VALID_STATUSES = new Set(['draft', 'reviewed', 'gold_sample', 'approved']);
const CUSTOMER_BANNED_PATTERNS = [
  /source_note|<sources|<\/source>|Complete Enneagram|Chestnut|pp\./i,
  /이 조합의 화학|조합 화학|화학/,
  /복음|죄|회개|거짓 자아/,
  /自己的|外界|可靠的|機會|誰|运作|Comfort Zone|优越感|盲点|道理|我知道了|形成|自己/,
  /자폐적|편집증|자기 혐오|밀리터리|벙커|늑대|포식자|폭풍의 왕/,
  /[ぁ-ゟァ-ヿ一-龯]/,
];

const SUBTYPE_REVIEW_RULES = {
  sp_1: [['책임', '기준', '점검', '정리', '루틴', '완벽', '실수'], ['걱정', '불편', '긴장', '자기 비판', '엄격']],
  so_1: [['원칙', '기준', '모범', '가르치', '공동체', '사회'], ['옳', '올바르', '개선', '개혁']],
  sx_1: [['이상', '열정', '개혁', '옳', '더 나은'], ['가까운', '관계', '사람']],
  sp_2: [['사랑받', '챙김', '도움', '특별', '착하', '매력'], ['필요', '욕구', '받']],
  so_2: [['그룹', '공동체', '사람', '영향력', '필요'], ['돕', '세우', '조력', '연결']],
  sx_2: [['사랑', '상대', '파트너', '관계'], ['매력', '헌신', '선택', '끌']],
  sp_3: [['가치', '안전', '증명', '성취', '탁월', '유능', '결과'], ['겸손', '조용', '일', '돕']],
  so_3: [['성공', '인정', '성과', '이미지', '평판', '무대'], ['그룹', '사람', '사회', '모두']],
  sx_3: [['매력', '중요한 사람', '상대', '관계'], ['증명', '인정', '최고', '헌신', '보여']],
  sp_4: [['고통', '아픔', '결핍', '견디', '내면'], ['성취', '결과', '분석', '혼자', '드러내지']],
  so_4: [['결핍', '외로움', '감정'], ['표현', '나누', '인정', '사회', '그룹']],
  sx_4: [['비교', '경쟁', '강렬', '감정', '결핍'], ['관계', '인정', '진짜', '창작', '성취']],
  sp_5: [['공간', '자원', '경계', '조용', '혼자'], ['지식', '분석', '관찰', '독창', '깊이']],
  so_5: [['지식', '전문', '관점', '가치', '검증'], ['그룹', '공동', '기여', '사회']],
  sx_5: [['깊고 완전한', '완전한', '신뢰', '연결'], ['물러나', '불완전', '검증', '마음']],
  sp_6: [['안전', '신뢰', '따뜻', '관계', '불안'], ['검증', '관찰', '준비', '동맹', '사람']],
  so_6: [['규칙', '시스템', '기준', '의무', '안전'], ['불안', '검증', '분석', '권위']],
  sx_6: [['두려움', '위험', '강함', '정면', '스릴'], ['안전', '전략', '유머', '확인']],
  sp_7: [['기회', '자원', '옵션', '즐거', '풍요'], ['안전', '네트워크', '계획', '불안']],
  so_7: [['좋은', '목적', '이상', '헌신', '팀'], ['즐거움', '자기', '비전', '주도권', '안전']],
  sx_7: [['가능성', '매료', '강렬', '몰입', '상상'], ['현실', '반복', '안전', '관계', '확인']],
  sp_8: [['자원', '영역', '자율', '독립', '생존'], ['확보', '침범', '선택권', '만족']],
  so_8: [['사람', '공동체', '그룹', '수호', '보호'], ['부당', '연대', '기준', '나서']],
  sx_8: [['강렬', '관계', '가까운', '연결'], ['붙잡', '소유', '주도권', '독점', '충성']],
  sp_9: [['루틴', '공간', '안정', '편안', '익숙'], ['평화', '몸', '질서', '변화']],
  so_9: [['공동체', '그룹', '사람', '참여', '일'], ['자기 자신', '뒤로', '조용히', '나서는', '봉사']],
  sx_9: [['가까운', '관계', '상대', '연결'], ['맞추', '융합', '자기 목소리', '조화', '지키']],
};

function readCards() {
  return fs.readdirSync(CHEMISTRY_DIR)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => {
      const filePath = path.join(CHEMISTRY_DIR, name);
      return { filePath, card: JSON.parse(fs.readFileSync(filePath, 'utf8')) };
    });
}

function statusCounts(cards) {
  const counts = {};
  for (const { card } of cards) {
    counts[card.status] = (counts[card.status] || 0) + 1;
  }
  return counts;
}

function formatStatusCounts(counts) {
  return ['gold_sample', 'reviewed', 'approved', 'draft']
    .filter((status) => counts[status])
    .map((status) => `${status}=${counts[status]}`)
    .join(', ');
}

function groupMatches(text, terms) {
  return terms.some((term) => text.includes(term));
}

function reviewCard(card) {
  const issues = [];
  const key = card.combination_key || 'unknown';
  const fullText = JSON.stringify(card);
  const customerText = JSON.stringify({ ...card, faith_optional: [] });
  const subtypeKey = `${card.dominant_instinct}_${card.core}`;
  const motifGroups = SUBTYPE_REVIEW_RULES[subtypeKey];

  if (!VALID_STATUSES.has(card.status)) {
    issues.push(`${key}: invalid status ${card.status}`);
  }

  for (const pattern of CUSTOMER_BANNED_PATTERNS) {
    const target = /복음|죄|회개|거짓 자아/.test(String(pattern)) ? customerText : fullText;
    if (pattern.test(target)) {
      issues.push(`${key}: customer-facing banned/source/tone pattern ${pattern} found`);
    }
  }

  if (!motifGroups) {
    issues.push(`${key}: no subtype review rule for ${subtypeKey}`);
  } else {
    motifGroups.forEach((terms, index) => {
      if (!groupMatches(fullText, terms)) {
        issues.push(`${key}: missing subtype motif group ${index + 1} for ${subtypeKey} (${terms.join('/')})`);
      }
    });
  }

  if (!Array.isArray(card.display?.one_page_body) || card.display.one_page_body.length !== 3) {
    issues.push(`${key}: display.one_page_body should be exactly 3 paragraphs for PDF consistency`);
  }

  if (!Array.isArray(card.display?.bullets) || card.display.bullets.length !== 3) {
    issues.push(`${key}: display.bullets should be exactly 3 items for one-page layout`);
  }

  if (!card.practical_insights?.strengths?.length || !card.practical_insights?.overuse_risks?.length) {
    issues.push(`${key}: practical insights are incomplete`);
  }

  return issues;
}

function promoteReviewed(cards) {
  for (const { filePath, card } of cards) {
    if (card.status !== 'draft') continue;
    card.status = 'reviewed';
    fs.writeFileSync(filePath, `${JSON.stringify(card, null, 2)}\n`);
  }
}

function main() {
  if (!fs.existsSync(CHEMISTRY_DIR)) {
    console.error(`Missing directory: ${path.relative(ROOT, CHEMISTRY_DIR)}`);
    process.exit(1);
  }

  let cards = readCards();
  const issues = cards.flatMap(({ card }) => reviewCard(card));

  if (issues.length > 0) {
    console.error(`FAIL: review gate found ${issues.length} issue(s)`);
    issues.forEach((issue) => console.error(`  ${issue}`));
    process.exit(1);
  }

  if (PROMOTE_REVIEWED) {
    promoteReviewed(cards);
    cards = readCards();
  }

  const counts = statusCounts(cards);
  console.log(`Review gate: ${cards.length}/${cards.length} chemistry cards pass`);
  console.log(`Status counts: ${formatStatusCounts(counts)}`);
}

main();
