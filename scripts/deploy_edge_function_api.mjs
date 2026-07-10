#!/usr/bin/env node
// Supabase Management API로 Edge Function 1개 배포 (multipart + zip)
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const PROJECT_REF = 'osdynbadhtfgoxilgmpy';

export async function deployEdgeFunctionViaApi(accessToken, payload) {
  const tempRoot = mkdtempSync(join(tmpdir(), 'er-edge-fn-'));
  const zipPath = join(tempRoot, 'bundle.zip');

  try {
    const topLevel = new Set();
    for (const file of payload.files) {
      const target = join(tempRoot, 'src', file.name);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, file.content, 'utf8');
      topLevel.add(file.name.split('/')[0]);
    }

    const srcDir = join(tempRoot, 'src');
    const zipArgs = ['-r', zipPath, ...topLevel];
    const zipped = spawnSync('zip', zipArgs, { cwd: srcDir, encoding: 'utf8' });
    if (zipped.status !== 0) {
      throw new Error(zipped.stderr || zipped.stdout || 'zip_failed');
    }

    const zipBytes = readFileSync(zipPath);
    const metadata = {
      name: payload.name,
      entrypoint_path: payload.entrypoint_path,
      verify_jwt: payload.verify_jwt,
    };

    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' }),
    );
    form.append(
      'file',
      new Blob([zipBytes], { type: 'application/zip' }),
      'function.zip',
    );

    const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/functions/deploy?slug=${encodeURIComponent(payload.name)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    });

    const text = await response.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }

    if (!response.ok) {
      const err = new Error(typeof parsed === 'object' && parsed?.message ? parsed.message : text);
      err.status = response.status;
      err.body = parsed;
      throw err;
    }

    return parsed;
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const name = process.argv[2];
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!name || !token) {
    console.error('usage: SUPABASE_ACCESS_TOKEN=... node scripts/deploy_edge_function_api.mjs <function-name>');
    process.exit(1);
  }
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const built = spawnSync('python3', [join(root, 'scripts/build_mcp_deploy_from_disk.py'), name], {
    cwd: root,
    encoding: 'utf8',
  });
  if (built.status !== 0) {
    console.error(built.stderr || built.stdout);
    process.exit(1);
  }
  const payload = JSON.parse(built.stdout);
  try {
    await deployEdgeFunctionViaApi(token, payload);
    console.log(`OK ${name}`);
  } catch (err) {
    console.error(`FAIL ${name}:`, err.status || '', err.body || err.message);
    process.exit(1);
  }
}
