import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import vm from 'node:vm';

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}

const landing = read('basic-course.html');
const apply = read('js/sections/apply.js');
const promo = read('js/basic-course-promo.js');
const home = read('js/sections/home.js');
const training = read('js/sections/coach-training.js');
const notices = read('js/strings.js');
const catalog = read('js/program-catalog.js');
const octoberNotice = notices.slice(notices.indexOf('{ id: 8'), notices.indexOf('{ id: 7'));

test('October basic course publishes matching KRW and USD prices across active entry points', () => {
  for (const source of [landing, apply, promo, home, notices, catalog]) {
    assert.match(source, /₩450,000/);
    assert.match(source, /\$330/);
    assert.doesNotMatch(source, /₩470,000/);
  }
  for (const source of [landing, promo, home, octoberNotice]) {
    assert.doesNotMatch(source, /₩420,000|₩380,000|\$300|\$270/);
  }
  assert.doesNotMatch(apply, /에니어그램 기본과정 8주 \(\$300 \/ ₩420,000\)/);
  assert.doesNotMatch(catalog, /basic_course:\s*\{[^}]*total:\s*300/);
});

test('October public copy states seven students per class and allows planned sections', () => {
  for (const source of [landing, apply, promo, home, octoberNotice, catalog]) {
    assert.match(source, /클래스당 7명/);
    assert.match(source, /분반/);
    assert.doesNotMatch(source, /정원[^<\n']*8명|>8명</);
  }
  assert.match(landing, /멘토는 정원 외/);
  assert.match(landing, /최소 2개 클래스 운영을 계획 중/);
  assert.match(landing, /분반과 일정은 아직 미확정/);
  assert.match(catalog, /정원 수로 폼을 자동 폐쇄하지 않는다/);
  assert.doesNotMatch(read('js/coach/applications.js'), /정원\(8명\)/);
});

test('October application route uses October focus and collects region-aware payment preferences', () => {
  assert.match(landing, /focus=enneagram_basic_october/);
  assert.doesNotMatch(landing, /focus=enneagram_basic_july/);
  assert.match(apply, /focus: 'enneagram_basic_october'/);
  assert.match(apply, /name="payment_region" required/);
  assert.match(apply, /name="payment_preference" required/);
  assert.match(apply, /name="installment_preference"/);
  assert.match(apply, /name="kakao_id"/);
  assert.match(apply, /name="is_full_time_ministry"/);
  assert.match(apply, /name="ministry_context"/);
  assert.match(apply, /name="is_proxy_application"/);
  assert.match(apply, /name="proxy_name"/);
  assert.match(apply, /name="proxy_relationship"/);
  assert.match(apply, /name="proxy_contact"/);
  assert.match(apply, /name="payer_name"/);
  assert.match(apply, /value="kr_bank"/);
  assert.match(apply, /value="zelle"/);
  assert.match(apply, /value="venmo"/);
  assert.doesNotMatch(apply, /value="(?:kr_card|kakao_pay|naver_pay|paypal|card_installment)"/);
  assert.match(landing, /카카오뱅크 3333-37-8817302/);
  assert.match(apply, /카카오뱅크 3333-37-8817302/);
});

test('expert course is an umbrella journey and has no standalone application CTA', () => {
  assert.match(training, /기본과정에서 시작해 심화 성장과 코치 트레이닝/);
  for (const source of [training, landing, catalog, notices, read('index.html')]) {
    assert.doesNotMatch(source, /격주|2개월 이상|1년 코칭스쿨|연말 리트릿|연간 독서 3권/);
  }
  assert.match(training, /href="\/basic-course\.html"/);
  assert.doesNotMatch(training, /renderSection\('apply'/);
  assert.doesNotMatch(training, /신청\/문의|코치양성 문의/);
  assert.doesNotMatch(notices, /전문가 양성반 5기·6기 모집/);
  assert.doesNotMatch(notices, /양성반 안내 보기|양성반 신청/);
});

function renderTraining() {
  const context = vm.createContext({});
  vm.runInContext(training, context);
  return vm.runInContext('renderCoachTraining()', context);
}

test('rendered pathway permits parallel exam and 101 participation and requires both for level 1', () => {
  const html = renderTraining();
  assert.match(html, /기본과정 수료 후 두 과정을 병행할 수 있습니다/);
  assert.match(html, /101 참여에 2급 자격은 필요하지 않습니다/);
  assert.match(html, /2급 자격 취득과 심화성장101 수료/);
  assert.match(html, /기본과정 8주 수료/);
  assert.match(html, /분기별 개설/);
  assert.match(html, /클래스당 학생 7명, 멘토 별도/);
  assert.match(html, /자동 부여되지는 않습니다/);
  assert.doesNotMatch(html, /education\.html|심화 성장 202/);
  assert.match(html, /href="\/basic-course\.html"/);
});

test('rendered education details preserve approved dates, fees and training duration', () => {
  const html = renderTraining();
  const exam = html.slice(html.indexOf('id="education-exam-title"'), html.indexOf('aria-labelledby="education-growth-title"'));
  assert.match(exam, /2026년 9월 말 온라인 시행 예정/);
  assert.match(exam, /정확한 날짜는 미정/);
  assert.match(exam, /기본 개념, 고착, 동기/);
  assert.match(exam, /객관식/);
  assert.match(exam, /문제집을 제공할 예정/);
  assert.match(exam, /₩30,000/);
  const growth = html.slice(html.indexOf('id="education-growth-title"'), html.indexOf('aria-labelledby="education-training-title"'));
  assert.match(growth, /2026년 10월~12월 · 주 1회, 회당 약 2시간 · 참여형 수업/);
  assert.match(growth, /총 ₩150,000 · 월 ₩50,000씩 3회/);
  const coach = html.slice(html.indexOf('id="education-training-title"'), html.indexOf('aria-labelledby="education-parenting-title"'));
  assert.match(coach, /2027 코치 트레이닝 2기 · 1급 과정/);
  assert.match(coach, /실제 교육 9개월, 전체 일정 11개월/);
  assert.match(coach, /2~4월 · 2학기 6~8월 · 3학기 10~12월 · 5월·9월 방학/);
  assert.match(coach, /주 1회 온라인 · 전문 강사 트랙 월 2회, Formation 월 1회, 코칭 스킬 월 1회 · 통합 실습은 기회별/);
  assert.match(coach, /총 ₩1,200,000 · 월 ₩100,000씩 12회/);
  assert.match(coach, /12회는 납부 횟수이며 교육 기간과는 다릅니다/);
  for (const course of [growth, coach]) assert.match(course, /전임사역자 및 사모에게는 수강료 50%/);
});

test('future growth subjects are examples without unconfirmed instructors or course requirements', () => {
  const html = renderTraining();
  const future = html.slice(html.indexOf('id="education-parenting-title"'));
  assert.match(future, /앞으로 개설할 심화성장 과목/);
  for (const subject of ['Parenting(자녀양육)', '부부관계', '목회와 사역', '리더십']) {
    assert.ok(future.includes(subject), subject);
  }
  assert.match(future, /선택하여 참여하는 성장 과정의 예시/);
  assert.match(future, /개설 일정과 내용은 확정 후 안내/);
  assert.doesNotMatch(html, /서초윤/);
  assert.doesNotMatch(future, /심화성장20[2-9]|₩|강사|코치가|지원 조건|월요일|화요일|수요일|목요일|금요일|토요일|일요일/);
});
