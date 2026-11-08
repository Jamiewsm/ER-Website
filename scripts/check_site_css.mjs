// 배포용 CSS가 현재 템플릿과 일치하고 동적 유형 색상을 포함하는지 확인한다.
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const config = require('../tailwind.config.cjs');
const directory = mkdtempSync(join(tmpdir(), 'er-site-css-'));

try {
    const output = join(directory, 'site-tailwind.css');
    const build = spawnSync(process.execPath, [
        require.resolve('tailwindcss/lib/cli.js'),
        '--config', 'tailwind.config.cjs',
        '--input', 'css/site-tailwind.input.css',
        '--output', output,
        '--minify',
    ], { cwd: root, encoding: 'utf8' });
    assert.equal(build.status, 0, build.stderr || build.error?.message || 'CSS build failed');

    const committed = readFileSync(new URL('../css/site-tailwind.css', import.meta.url), 'utf8');
    assert.equal(committed, readFileSync(output, 'utf8'), 'CSS is stale. Run npm run build:css.');
    for (const className of config.safelist) {
        assert.ok(committed.includes(`.${className}{`), `Missing dynamic utility: ${className}`);
    }
    const guide = readFileSync(new URL('../js/sections/types-guide.js', import.meta.url), 'utf8');
    for (const [, background] of guide.matchAll(/\bbg:\s*["'](bg-[a-z]+-50)["']/g)) {
        const className = background.replace('50', '400');
        assert.ok(committed.includes(`.${className}{`), `Missing computed type color: ${className}`);
    }

    const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    assert.match(html, /<link[^>]+href="css\/site-tailwind\.css(?:\?[^\"]*)?"[^>]*>/);
    assert.doesNotMatch(html, /cdn\.tailwindcss\.com|tailwind\.config\s*=/);
    console.log(`OK: production CSS matches source (${Buffer.byteLength(committed)} bytes); dynamic type colors included.`);
} finally {
    rmSync(directory, { recursive: true, force: true });
}
