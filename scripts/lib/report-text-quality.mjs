const DEFAULT_FORBIDDEN_PHRASES = ['조합만의 화학'];
const DEFAULT_IGNORED_PHRASES = [
  'Enneagram',
  'Premium',
  'Report',
  'Page',
  'ER',
  'SX 7w8',
  'sx_7_w8',
  '적응형 에니어그램 심층 진단',
];

export function normalizeKoreanText(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim();
}

function countOccurrences(text, phrase) {
  if (!phrase) return 0;
  let count = 0;
  let offset = 0;
  while (offset < text.length) {
    const index = text.indexOf(phrase, offset);
    if (index === -1) break;
    count += 1;
    offset = index + phrase.length;
  }
  return count;
}

function compactForComparison(text) {
  return normalizeKoreanText(text)
    .replace(/[^\p{Script=Hangul}\p{Letter}\p{Number}]/gu, '')
    .toLowerCase();
}

function shouldIgnore(text, ignoredPhrases = DEFAULT_IGNORED_PHRASES) {
  const normalized = normalizeKoreanText(text);
  if (/^[A-Z0-9\s&/-]+$/.test(normalized) && /[A-Z]/.test(normalized)) return true;
  const compact = compactForComparison(text);
  return ignoredPhrases.some((phrase) => {
    const ignored = compactForComparison(phrase);
    return ignored && (compact === ignored || compact.includes(ignored));
  });
}

function splitSentences(text) {
  return normalizeKoreanText(text)
    .split(/[\n.!?。！？]+/u)
    .map((sentence) => normalizeKoreanText(sentence))
    .filter(Boolean);
}

function tokenizePhraseText(text) {
  return normalizeKoreanText(text)
    .replace(/[^\p{Script=Hangul}\p{Letter}\p{Number}\s]/gu, ' ')
    .split(/\s+/u)
    .map((token) => token.trim())
    .filter(Boolean);
}

export function findForbiddenPhrases(text, forbiddenPhrases = DEFAULT_FORBIDDEN_PHRASES) {
  const normalized = normalizeKoreanText(text);
  return forbiddenPhrases
    .map((phrase) => ({ phrase, count: countOccurrences(normalized, phrase) }))
    .filter((match) => match.count > 0);
}

export function findRepeatedLongSentences(text, options = {}) {
  const minLength = options.minLength || 24;
  const ignoredPhrases = options.ignoredPhrases || DEFAULT_IGNORED_PHRASES;
  const seen = new Map();

  for (const sentence of splitSentences(text)) {
    const key = compactForComparison(sentence);
    if (key.length < minLength || shouldIgnore(sentence, ignoredPhrases)) continue;
    const current = seen.get(key) || { text: sentence, count: 0 };
    current.count += 1;
    seen.set(key, current);
  }

  return [...seen.values()]
    .filter((item) => item.count > 1)
    .sort((a, b) => b.count - a.count || b.text.length - a.text.length);
}

export function findRepeatedLongPhrases(text, options = {}) {
  const minLength = options.minLength || 18;
  const minTokens = options.minTokens || 3;
  const maxTokens = options.maxTokens || 8;
  const ignoredPhrases = options.ignoredPhrases || DEFAULT_IGNORED_PHRASES;
  const tokens = tokenizePhraseText(text);
  const phrases = new Map();

  for (let start = 0; start < tokens.length; start += 1) {
    for (let length = minTokens; length <= maxTokens && start + length <= tokens.length; length += 1) {
      const words = tokens.slice(start, start + length);
      const textValue = words.join(' ');
      const key = compactForComparison(textValue);
      if (key.length < minLength || shouldIgnore(textValue, ignoredPhrases)) continue;
      const current = phrases.get(key) || { text: textValue, count: 0 };
      current.count += 1;
      phrases.set(key, current);
    }
  }

  const repeated = [...phrases.values()]
    .filter((item) => item.count > 1)
    .sort((a, b) => b.text.length - a.text.length || b.count - a.count);

  const selected = [];
  for (const item of repeated) {
    const compact = compactForComparison(item.text);
    const covered = selected.some((existing) => compactForComparison(existing.text).includes(compact));
    if (!covered) selected.push(item);
  }

  return selected.sort((a, b) => b.count - a.count || b.text.length - a.text.length);
}

export function assertReportTextQuality(text, options = {}) {
  const forbidden = findForbiddenPhrases(
    text,
    options.forbiddenPhrases || DEFAULT_FORBIDDEN_PHRASES
  );
  const repeatedSentences = findRepeatedLongSentences(text, options);
  const repeatedPhrases = findRepeatedLongPhrases(text, options);
  const failures = [];

  if (forbidden.length) {
    failures.push(`forbidden phrases: ${forbidden.map((item) => `${item.phrase} (${item.count})`).join(', ')}`);
  }
  if (repeatedSentences.length) {
    failures.push(`repeated sentences: ${repeatedSentences.slice(0, 3).map((item) => `${item.text} (${item.count})`).join(' | ')}`);
  }
  if (repeatedPhrases.length) {
    failures.push(`repeated phrases: ${repeatedPhrases.slice(0, 3).map((item) => `${item.text} (${item.count})`).join(' | ')}`);
  }

  if (failures.length) {
    throw new Error(`Report text quality failed: ${failures.join('; ')}`);
  }
}
