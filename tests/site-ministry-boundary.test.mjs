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
  assert.match(indexHtml, /교회·사역팀/);
  assert.match(indexHtml, /목회자·선교사 사역지원/);
  assert.match(indexHtml, /assets\/er-social-share-ministry\.png/);
  assert.match(homeSource, /기독교 에니어그램으로 회복을 배우는 곳/);
  assert.match(homeSource, /가정과 교회 공동체 안에서 관계와 소명을 회복/);
  assert.match(homeSource, /focus: 'ministry_team'/);
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
  vm.runInContext(programsSource, context, { filename: 'js/sections/programs.js' });
  vm.runInContext(applySource, context, { filename: 'js/sections/apply.js' });

  assert.match(context.renderPrograms(), /ER Business 프로그램 보기/);
  assert.match(context.renderApply({ focus: 'team' }), /business\.er-coaching\.com\/contact/);
  assert.match(
    context.renderApply({ track: 'org', focus: 'church' }),
    /<option selected>교회 공동체 워크숍 문의<\/option>/,
  );

  let routedApply = null;
  context.renderSection = (sectionId, payload) => {
    routedApply = { sectionId, payload };
  };
  context.state.programFilter = 'church';
  context.openProgramApply();
  assert.equal(routedApply.sectionId, 'apply');
  assert.equal(routedApply.payload.track, 'org');
  assert.equal(routedApply.payload.focus, 'church');
  context.state.programFilter = 'individual';
  context.openProgramApply();
  assert.equal(routedApply.payload.track, 'paid');
  assert.equal(routedApply.payload.focus, undefined);

  context.state.currentPayload = { tab: 'unknown' };
  context.state.programFilter = 'unknown';
  assert.match(context.renderPrograms(), /관계·부부/);
  assert.match(programsSource, /filterType !== 'individual' && filterType !== 'church'/);
});

test('church programs and forms stay intact with ministry-specific language', () => {
  assert.match(programsSource, /title: '교회·사역팀 프로그램'/);
  assert.match(programsSource, /교회·선교단체·사역팀/);
  assert.match(programsSource, /applyFocus: 'church'/);
  assert.match(applySource, /ministry_team:\s*\{/);
  assert.match(applySource, /사역팀 소통·갈등 프로그램 문의/);
  assert.match(communitySource, /label: '사역팀'.*tab: 'church'/);
  assert.match(communitySource, /ER이 집중하는 자리/);
  assert.doesNotMatch(communitySource, /impactChart/);
  assert.doesNotMatch(stringsSource, /교회·공동체 프로그램 비중/);
  assert.match(indexHtml, /Parenting/);
  assert.match(indexHtml, /전문가 과정/);
});

test('site deploy includes every changed runtime source', () => {
  assert.match(deployTracksSource, /'js\/app-state\.js'/);
  assert.match(deployTracksSource, /'js\/strings\.js'/);
  assert.match(deployTracksSource, /'js\/sections\/\*\*'/);
  assert.match(deployTracksSource, /'assets\/er-social-share-ministry\.png'/);
});
