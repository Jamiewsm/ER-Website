import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const homeSource = readFileSync(new URL('../js/sections/home.js', import.meta.url), 'utf8');
const programsSource = readFileSync(new URL('../js/sections/programs.js', import.meta.url), 'utf8');

test('home mobile layout keeps trust stats compact and program cards touch-friendly', () => {
  assert.match(homeSource, /grid grid-cols-2[^"\n]*md:grid-cols-4/);
  assert.match(homeSource, /mt-8 grid gap-4 sm:grid-cols-2/);
  assert.match(homeSource, /inline-flex min-h-11 w-full items-center justify-center rounded-xl/);
  assert.doesNotMatch(homeSource, /관계·부부 코칭 보기/);
});

test('shared mobile navigation exposes 44px touch targets', () => {
  assert.match(indexHtml, /id="mobile-header-auth-btn"[^>]*min-h-11/);
  assert.match(indexHtml, /aria-label="메뉴 열기"/);
  assert.match(indexHtml, /\.mobile-nav-link \{[\s\S]*?min-height: 2\.75rem;/);
});

test('program filters and compact text actions expose 44px touch targets', () => {
  assert.match(programsSource, /inline-flex min-h-11 items-center justify-center whitespace-nowrap/);
  assert.doesNotMatch(programsSource, /whitespace-nowrap px-5 py-2\.5 rounded-full/);
  assert.match(programsSource, /inline-flex min-h-11 items-center gap-1 text-xs font-bold/);
  assert.match(programsSource, /class="min-h-11 w-full rounded-xl px-4/);
});
