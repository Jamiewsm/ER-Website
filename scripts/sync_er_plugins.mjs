#!/usr/bin/env node
// Keep the local Codex packages aligned with the reviewed plugin sources in this repo.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// An automation can run the reviewed script from origin/main via a temporary file.
const root = process.env.ER_PLUGIN_SOURCE_ROOT || dirname(dirname(fileURLToPath(import.meta.url)));
const personalRoot = join(homedir(), 'plugins');
const helper = join(homedir(), '.codex/skills/.system/plugin-creator/scripts/update_plugin_cachebuster.py');
const names = ['er-education', 'er-coach', 'er-website'];
const files = ['.codex-plugin/plugin.json', '.mcp.json', 'skills/operations/SKILL.md'];
const apply = process.argv.includes('--apply');
const refIndex = process.argv.indexOf('--ref');
const ref = refIndex >= 0 ? process.argv[refIndex + 1] : null;
if (refIndex >= 0 && (!ref || ref.startsWith('--'))) throw new Error('--ref requires a Git ref');

function sourceBytes(name, file) {
  if (ref) return execFileSync('git', ['show', `${ref}:plugins/${name}/${file}`], { cwd: root });
  return readFileSync(join(root, 'plugins', name, file));
}

function sameFile(fromBytes, to, file) {
  if (!existsSync(to)) return false;
  if (file !== '.codex-plugin/plugin.json') return fromBytes.equals(readFileSync(to));
  const source = JSON.parse(fromBytes.toString('utf8'));
  const installed = JSON.parse(readFileSync(to, 'utf8'));
  installed.version = String(installed.version || '').split('+codex.')[0];
  return JSON.stringify(source) === JSON.stringify(installed);
}

if (apply && !existsSync(helper)) {
  throw new Error('plugin-creator cachebuster helper not found; install/update that skill first.');
}

let changed = 0;
for (const name of names) {
  const target = join(personalRoot, name);
  const dirty = files.some((file) => {
    const to = join(target, file);
    return !sameFile(sourceBytes(name, file), to, file);
  });
  if (!dirty) continue;
  changed++;
  console.log(`${name}: local package differs from reviewed source`);
  if (!apply) continue;
  for (const file of files) {
    const to = join(target, file);
    mkdirSync(dirname(to), { recursive: true });
    writeFileSync(to, sourceBytes(name, file));
  }
  execFileSync('python3', [helper, target], { stdio: 'inherit' });
  execFileSync('codex', ['plugin', 'add', `${name}@personal`], { stdio: 'inherit' });
}

console.log(changed ? `${changed} package(s) ${apply ? 'updated' : 'need update'}.` : 'All local packages match.');
if (changed && !apply) process.exitCode = 1;
