import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import vm from 'node:vm';

const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const programsSource = readFileSync(new URL('../js/sections/programs.js', import.meta.url), 'utf8');
const applySource = readFileSync(new URL('../js/sections/apply.js', import.meta.url), 'utf8');
const homeSource = readFileSync(new URL('../js/sections/home.js', import.meta.url), 'utf8');
const communitySource = readFileSync(new URL('../js/sections/community.js', import.meta.url), 'utf8');
const stringsSource = readFileSync(new URL('../js/strings.js', import.meta.url), 'utf8');
const appStateSource = readFileSync(new URL('../js/app-state.js', import.meta.url), 'utf8');
const deployTracksSource = readFileSync(new URL('../scripts/deploy-tracks.mjs', import.meta.url), 'utf8');

test('main-site identity is church and Christian ministry focused', () => {
  assert.match(indexHtml, /기독교 세계관과 에니어그램을 통합해 개인과 가정, 교회와 사역 공동체/);
  assert.match(indexHtml, /사역팀 팀워크/);
  assert.match(indexHtml, /목회자·선교사 사역지원/);
  assert.match(indexHtml, /assets\/er-social-share-landing\.jpg/);
  assert.match(homeSource, /기독교 에니어그램으로 회복을 배우는 곳/);
  assert.match(homeSource, /가정과 교회 공동체 안에서 관계와 소명을 회복/);
  assert.match(homeSource, /\/teamwork-seminar/);
  assert.match(homeSource, /교인 대상 부모·부부 세미나와는 별도/);
});

test('enterprise consulting details are removed from active main-site content', () => {
  const activeContent = [indexHtml, programsSource, applySource, stringsSource, appStateSource].join('\n');

  for (const forbidden of [
    /개인·가정·기업/,
    /기업\/조직/,
    /기업\/팀 프로그램/,
    /기업\/팀 워크숍 문의/,
    /비즈니스\/조직 워크숍/,
    /채용·배치 자문/,
    /\$2,000–\$5,000/,
    /\$5,000부터/,
    /tab: 'business'/,
    /focus: 'team'/,
  ]) {
    assert.doesNotMatch(activeContent, forbidden);
  }

  assert.doesNotMatch(programsSource, /\bbusiness:\s*\{/);
  assert.doesNotMatch(stringsSource, /\bbusiness:\s*\{/);
});

test('Business links are explicit handoffs, not internal service tabs', () => {
  assert.match(indexHtml, /<a href="https:\/\/business\.er-coaching\.com\/"/);
  assert.match(programsSource, /https:\/\/business\.er-coaching\.com\/programs/);
  assert.match(applySource, /https:\/\/business\.er-coaching\.com\/contact/);

  const context = {
    state: {
      currentPayload: { tab: 'business' },
      programFilter: 'business',
      latestTestResult: {},
    },
    publicTestimonials: { stories: [] },
    window: {},
  };
  vm.createContext(context);
  vm.runInContext(readFileSync(new URL('../js/app-helpers.js', import.meta.url), 'utf8'), context);
  vm.runInContext(programsSource, context, { filename: 'js/sections/programs.js' });
  vm.runInContext(applySource, context, { filename: 'js/sections/apply.js' });

  assert.match(context.renderPrograms(), /ER Business 프로그램 보기/);
  assert.match(context.renderApply({ focus: 'team' }), /business\.er-coaching\.com\/contact/);
  assert.match(
    context.renderApply({ track: 'org', focus: 'church' }),
    /value="교회 공동체 워크숍 문의" data-focus="church" selected/,
  );

  let routedApply = null;
  context.renderSection = (sectionId, payload) => {
    routedApply = { sectionId, payload };
  };
  context.state.programFilter = 'church';
  context.openProgramApply();
  assert.equal(routedApply.sectionId, 'apply');
  assert.equal(routedApply.payload.track, 'org');
  assert.equal(routedApply.payload.focus, 'teamwork_seminar');
  context.state.programFilter = 'individual';
  context.openProgramApply();
  assert.equal(routedApply.payload.track, 'paid');
  assert.equal(routedApply.payload.focus, 'couple');

  context.state.currentPayload = { tab: 'unknown' };
  context.state.programFilter = 'unknown';
  assert.match(context.renderPrograms(), /관계·부부 코칭/);
  assert.doesNotMatch(context.renderPrograms(), /tab-individual|tab-church|updateProgramView\('church'\)/);
  assert.match(programsSource, /filterType !== 'individual' && filterType !== 'church'/);

  context.state.currentPayload = { tab: 'church' };
  context.state.programFilter = 'church';
  const churchPage = context.renderPrograms();
  assert.match(churchPage, /사역팀 팀워크/);
  assert.doesNotMatch(churchPage, /tab-individual|관계·부부 코칭과 사역팀/);
});

test('church programs and forms stay intact with ministry-specific language', () => {
  assert.match(programsSource, /title: '사역팀 팀워크'/);
  assert.match(programsSource, /목사·전도사·평신도 사역자/);
  assert.match(programsSource, /applyFocus: 'teamwork_seminar'/);
  assert.doesNotMatch(programsSource, /title: '부모교육 세미나'/);
  assert.match(applySource, /ministry_team:\s*\[/);
  assert.match(applySource, /사역팀 팀워크·소통 문의/);
  assert.match(communitySource, /label: '사역팀'.*사역자 팀워크/);
  assert.match(communitySource, /ER이 섬기는 영역/);
  assert.doesNotMatch(communitySource, /impactChart/);
  assert.doesNotMatch(stringsSource, /교회·공동체 프로그램 비중/);
  assert.match(indexHtml, /Parenting/);
  assert.match(indexHtml, /에니어그램 교육/);
  assert.match(stringsSource, /4주 부모교육 워크숍 — 일정 확정 전/);
});

test('site deploy includes every changed runtime source', () => {
  assert.match(deployTracksSource, /'js\/app-state\.js'/);
  assert.match(deployTracksSource, /'js\/strings\.js'/);
  assert.match(deployTracksSource, /'js\/sections\/\*\*'/);
  assert.match(deployTracksSource, /'assets\/er-social-share-landing\.jpg'/);
});
