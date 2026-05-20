// ER 에니어그램 테스트 공유 상수 — arrowLines, instinct labels, type names.
// test.js (단독 페이지) + app-adaptive-data.js (구 임베드) 양쪽이 import.

// 9 type 의 스트레스/통합 화살표 (Chestnut + Riso-Hudson 표준).
const arrowLines = {
  1: { stress: 4, growth: 7 },
  2: { stress: 8, growth: 4 },
  3: { stress: 9, growth: 6 },
  4: { stress: 2, growth: 1 },
  5: { stress: 7, growth: 8 },
  6: { stress: 3, growth: 9 },
  7: { stress: 1, growth: 5 },
  8: { stress: 5, growth: 2 },
  9: { stress: 6, growth: 3 },
};

// 본능 한국어 라벨.
const INSTINCT_LABELS = {
  sp: '자기보호 (sp)',
  sx: '일대일 (sx)',
  so: '사회 (so)',
};

// Type 한국어 이름 (subtypes_27.md 와 정렬).
const TYPE_NAMES = {
  1: '개혁가',
  2: '조력자',
  3: '성취자',
  4: '개인주의자',
  5: '사색가',
  6: '충성가',
  7: '열정가',
  8: '도전자',
  9: '평화주의자',
};

const TestShared = { arrowLines, INSTINCT_LABELS, TYPE_NAMES };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TestShared;
}
if (typeof window !== 'undefined') {
  window.TestShared = Object.assign(window.TestShared || {}, TestShared);
}
