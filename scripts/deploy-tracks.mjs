// Site/test deploy track allowlists and premium test guard markers (SSOT)
export const DEFAULT_SITE = 'https://er-coaching.com';

/** Only these paths may change on site deploy. Test runtime is preserved from live. */
export const SITE_OVERLAY_GLOBS = [
  'index.html',
  'js/sections/**',
  'child-type-test/**',
  'css/style.css',
  'apply.html',
  'basic-course.html',
  'parenting-workshop.html',
  'parents-brochure.html',
  'parents-workshop.html',
  'favicon.ico',
  'favicon*.png',
  'js/parents-workshop-promo.js',
  'js/program-catalog.js',
  'js/app-core.js',
  'js/config.js',
  'js/strings.js',
  'js/sections/**',
  'images/**',
  'ER-logo-*.png',
  'wrangler.toml',
  '.assetsignore',
];

/** Test runtime — only updated via test-only bundle deploy, never site full deploy. */
export const TEST_RUNTIME_ALLOWLIST = [
  'test.html',
  'css/test.css',
  'js/test.js',
  'js/diagnostic-experiment.js',
  'js/diagnostic-report-content.js',
  'js/report-support-materials.js',
  'test-results/background.png',
  'test-results/background_card.png',
  'test-results/background_vase.png',
  'test-results/backgrdound_road.png',
];

/** Required in js/test.js — legacy pre-premium test must not return to main or live. */
export const PREMIUM_TEST_REQUIRED_MARKERS = [
  'buildResponseQualitySnapshot',
  'buildConfidenceExplanation',
  'center_auto_1',
  'instinct_attention_1',
  'tb_2_9_1',
  'er-report-application-map',
  'SUBTYPE_BEHAVIOR_ITEMS',
];

/** Legacy markers that must NOT appear once premium test is canonical. */
export const LEGACY_TEST_FORBIDDEN_MARKERS = [
  "id:'t2', triad:[2,3,4]",
  "id:'t5', triad:[5,6,7]",
  "id:'t8', triad:[8,9,1]",
];

/** test.html must load premium support layer. */
export const PREMIUM_TEST_HTML_MARKERS = [
  'js/report-support-materials.js',
  'js/diagnostic-experiment.js',
  'css/test.css',
  'js/test.js',
];

/** Never upload these paths from deploy bundles (wrangler asset size / secret leak). */
export const DEPLOY_BUNDLE_EXCLUDE_DIRS = [
  '.git',
  'node_modules',
  '.github',
  '.claude',
  '.cursor',
  '.wrangler',
  '.playwright-cli',
  'supabase',
  'docs',
  'tests',
  'scripts',
];

export function assertPremiumTestSource(testJs, testHtml) {
  const errors = [];
  for (const marker of PREMIUM_TEST_REQUIRED_MARKERS) {
    if (!testJs.includes(marker)) errors.push(`missing required marker: ${marker}`);
  }
  for (const marker of LEGACY_TEST_FORBIDDEN_MARKERS) {
    if (testJs.includes(marker)) errors.push(`legacy marker forbidden: ${marker}`);
  }
  for (const marker of PREMIUM_TEST_HTML_MARKERS) {
    if (!testHtml.includes(marker)) errors.push(`test.html missing: ${marker}`);
  }
  return errors;
}
