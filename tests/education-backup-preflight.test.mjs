// 합성 비밀 파일만 사용해 읽기 전용 사전 점검과 정보 비노출을 검증한다.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  chmod,
  link,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rm,
  stat,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { inspectBackupPrerequisites } from "../scripts/education-backup-preflight.mjs";

const SCRIPT = fileURLToPath(
  new URL("../scripts/education-backup-preflight.mjs", import.meta.url),
);
const HOST = "aws-0-ap-northeast-2.pooler.supabase.com";
const PROJECT = "osdynbadhtfgoxilgmpy";
const PASSWORD = "synthetic-pass:with\\escapes";
const KEY = "sb_secret_synthetic_63dfac89_R4T7Y2";
const escape = (value) => value.replace(/\\/g, "\\\\").replace(/:/g, "\\:");
const blocked = (report, code) =>
  assert.ok(
    report.checks.some((check) => check.code === code && !check.ok),
    code,
  );

async function fixture(t) {
  const root = await realpath(
    await mkdtemp(join(tmpdir(), "education-preflight-")),
  );
  t.after(() => rm(root, { recursive: true, force: true }));
  const path = (name) => join(root, name);
  for (const name of ["repo", "bin", "local", "offsite"])
    await mkdir(path(name), { mode: 0o700 });
  const write = (name, text, mode = 0o600) =>
    writeFile(path(name), text, { mode });
  await write(
    "db.pgpass",
    `${HOST}:5432:postgres:postgres.${PROJECT}:${escape(PASSWORD)}\n`,
  );
  await write("storage.key", KEY);
  // Deliberately shape-only: the preflight must never claim encryption verification.
  await write("recipient.txt", `age1${"q".repeat(58)}\n`);
  // Presence checks must never execute these synthetic tools.
  for (const name of ["pg_dump", "pg_dumpall", "pg_restore", "psql", "age"])
    await write(
      `bin/${name}`,
      `#!/bin/sh\nprintf invoked > '${path("tool-was-executed")}'\nexit 97\n`,
      0o700,
    );
  const config = {
    version: 1,
    projectRef: PROJECT,
    database: {
      host: HOST,
      port: 5432,
      user: `postgres.${PROJECT}`,
      name: "postgres",
      passwordFile: path("db.pgpass"),
    },
    tools: { pgBinDir: path("bin"), ageBinary: path("bin/age") },
    storage: { serviceKeyFile: path("storage.key") },
    encryption: { recipientFile: path("recipient.txt") },
    destinations: { local: path("local"), offsite: path("offsite") },
  };
  const save = () => write("config.json", JSON.stringify(config));
  await save();
  const inspect = () =>
    inspectBackupPrerequisites(path("config.json"), {
      repositoryRoot: path("repo"),
    });
  return { root, path, write, config, save, inspect };
}

test("exact pgpass with escaped colon and backslash passes only local prerequisites", async (t) => {
  const f = await fixture(t);
  const report = await f.inspect();
  assert.equal(report.status, "LOCAL_PREREQUISITES_PRESENT");
  for (const flag of [
    "backupCreated",
    "restoreVerified",
    "credentialsVerified",
    "encryptionVerified",
    "offsiteVerified",
  ])
    assert.equal(report[flag], false);
  assert.ok(report.limitations.some((text) => text.includes("버전")));
  assert.ok(report.limitations.some((text) => text.includes("물리적 독립성")));
  assert.ok(report.limitations.some((text) => text.includes("체크섬")));
});

test("placeholder values cannot masquerade as completed configuration", async (t) => {
  const f = await fixture(t);
  f.config.database.host = "<session-pooler-host>";
  f.config.tools.ageBinary = "/REPLACE_ME/age";
  await f.save();
  await f.write("storage.key", "YOUR_SERVICE_KEY");
  await f.write(
    "db.pgpass",
    `${HOST}:5432:postgres:postgres.${PROJECT}:CHANGE_ME`,
  );
  const report = await f.inspect();
  assert.equal(report.status, "BLOCKED");
  for (const code of [
    "DATABASE_TARGET",
    "TOOL_AGE",
    "STORAGE_KEY_CONTENT",
    "PGPASS_ENTRY",
  ])
    blocked(report, code);
});

test("Storage keys reject frontend keys and accept only server-key structure without authenticating", async (t) => {
  const f = await fixture(t);
  const jwt = (payload) =>
    [
      Buffer.from('{"alg":"HS256"}').toString("base64url"),
      Buffer.from(JSON.stringify(payload)).toString("base64url"),
      "synthetic_signature",
    ].join(".");
  for (const value of [
    "sb_publishable_synthetic_63dfac89",
    "sb_secret_REPLACE_WITH_SERVER_KEY",
    "arbitrary-nonempty-key",
    jwt({ role: "anon", ref: PROJECT }),
    jwt({ role: "authenticated", ref: PROJECT }),
    jwt({ role: "service_role", ref: "another-project" }),
  ]) {
    await f.write("storage.key", value);
    blocked(await f.inspect(), "STORAGE_KEY_CONTENT");
  }
  for (const value of [KEY, jwt({ role: "service_role", ref: PROJECT })]) {
    await f.write("storage.key", value);
    const report = await f.inspect();
    assert.equal(report.status, "LOCAL_PREREQUISITES_PRESENT");
    assert.equal(report.credentialsVerified, false);
    assert.ok(!JSON.stringify(report).includes(value));
  }
});

test("wrong project, transaction pooler port, and untrusted hostname are blocked", async (t) => {
  const f = await fixture(t);
  for (const update of [
    { projectRef: "another-project" },
    { database: { ...f.config.database, port: 6543 } },
    {
      database: {
        ...f.config.database,
        host: "pooler.supabase.com.attacker.test",
      },
    },
    { database: { ...f.config.database, user: "postgres.someone-else" } },
  ]) {
    const original = structuredClone(f.config);
    Object.assign(f.config, update);
    await f.save();
    blocked(
      await f.inspect(),
      update.projectRef ? "PROJECT_REF" : "DATABASE_TARGET",
    );
    Object.assign(f.config, original);
  }
});

test("pgpass rejects wildcard, unrelated, multiple, empty and malformed entries", async (t) => {
  const f = await fixture(t);
  const prefix = `${HOST}:5432:postgres:postgres.${PROJECT}:`;
  for (const text of [
    `*:5432:postgres:postgres.${PROJECT}:secret`,
    `${HOST}:*:postgres:postgres.${PROJECT}:secret`,
    `${HOST}:5432:*:postgres.${PROJECT}:secret`,
    `${HOST}:5432:postgres:*:secret`,
    `another.pooler.supabase.com:5432:postgres:postgres.${PROJECT}:secret`,
    `${prefix}one\n${prefix}two`,
    prefix,
    `${prefix}bad\\escape`,
    `${prefix}unescaped:colon`,
    ...[
      "changeme",
      "REPLACE_WITH_DATABASE_PASSWORD",
      "<db-password>",
      "TODO",
      "xxx",
      "password",
    ].map((value) => `${prefix}${value}`),
  ]) {
    await f.write("db.pgpass", text);
    blocked(await f.inspect(), "PGPASS_ENTRY");
  }
});

test("config and secret files require private ownership modes and no symlinks", async (t) => {
  const f = await fixture(t);
  for (const [name, code] of [
    ["config.json", "CONFIG_FILE"],
    ["db.pgpass", "PGPASS_FILE"],
    ["storage.key", "STORAGE_KEY_FILE"],
    ["recipient.txt", "AGE_RECIPIENT_FILE"],
  ]) {
    await chmod(f.path(name), 0o644);
    blocked(await f.inspect(), code);
    await chmod(f.path(name), 0o600);
    const content = await readFile(f.path(name), "utf8");
    await f.write(`${name}.real`, content);
    await rm(f.path(name));
    await symlink(f.path(`${name}.real`), f.path(name));
    blocked(await f.inspect(), code);
    await rm(f.path(name));
    await f.write(name, content);
  }
  await chmod(f.root, 0o755);
  blocked(await f.inspect(), "CONFIG_FILE");
  await chmod(f.root, 0o700);
  await chmod(f.path("local"), 0o755);
  blocked(await f.inspect(), "DESTINATION_LOCAL");
});

test("public recipient rejects private keys, multiple recipients and malformed input", async (t) => {
  const f = await fixture(t);
  for (const value of [
    "AGE-SECRET-KEY-1SYNTHETIC",
    "-----BEGIN PRIVATE KEY-----",
    `age1${"q".repeat(58)}\nage1${"q".repeat(58)}`,
    `age1${"i".repeat(58)}`,
    "REPLACE_ME",
  ]) {
    await f.write("recipient.txt", value);
    blocked(await f.inspect(), "AGE_RECIPIENT_CONTENT");
  }
});

test("credentials hardlinked into a checkout are rejected", async (t) => {
  const f = await fixture(t);
  for (const [name, code] of [
    ["config.json", "CONFIG_FILE"],
    ["db.pgpass", "PGPASS_FILE"],
    ["storage.key", "STORAGE_KEY_FILE"],
    ["recipient.txt", "AGE_RECIPIENT_FILE"],
  ]) {
    const alias = f.path(`repo/${name}.alias`);
    await link(f.path(name), alias);
    blocked(await f.inspect(), code);
    await rm(alias);
  }
  assert.equal((await f.inspect()).status, "LOCAL_PREREQUISITES_PRESENT");
});

test("destinations reject aliases, ancestors, checkout paths and missing directories", async (t) => {
  const f = await fixture(t);
  await symlink(f.path("local"), f.path("local-alias"));
  await mkdir(f.path("local/nested"), { mode: 0o700 });
  for (const offsite of [
    f.path("local"),
    f.path("local-alias"),
    f.path("local/nested"),
    f.root,
  ]) {
    f.config.destinations.offsite = offsite;
    await f.save();
    blocked(await f.inspect(), "DESTINATIONS_SEPARATE");
  }
  f.config.destinations.offsite = f.path("repo");
  await f.save();
  blocked(await f.inspect(), "DESTINATION_OFFSITE");
  f.config.destinations.offsite = f.path("not-created");
  await f.save();
  blocked(await f.inspect(), "DESTINATION_OFFSITE");
  await assert.rejects(stat(f.path("not-created")), { code: "ENOENT" });
});

test("config and secret paths inside the checkout or its aliases are rejected", async (t) => {
  const f = await fixture(t);
  await f.write("repo/config.json", JSON.stringify(f.config));
  blocked(
    await inspectBackupPrerequisites(f.path("repo/config.json"), {
      repositoryRoot: f.path("repo"),
    }),
    "CONFIG_FILE",
  );
  await f.write("repo/storage.key", KEY);
  await symlink(f.path("repo"), f.path("repo-alias"));
  f.config.storage.serviceKeyFile = f.path("repo-alias/storage.key");
  await f.save();
  blocked(await f.inspect(), "STORAGE_KEY_FILE");
});

test("CLI errors are JSON, nonzero, and never expose secret contents or private paths", async (t) => {
  const f = await fixture(t);
  for (const args of [[], ["--config", f.path("missing-secret-path")]]) {
    const run = spawnSync(process.execPath, [SCRIPT, ...args], {
      encoding: "utf8",
    });
    assert.equal(run.status, 1);
    assert.equal(JSON.parse(run.stdout).status, "BLOCKED");
    assert.equal(run.stderr, "");
    assert.ok(!run.stdout.includes(f.root));
  }
  await f.write("config.json", `{ invalid json ${PASSWORD} ${KEY}`);
  const run = spawnSync(
    process.execPath,
    [SCRIPT, "--config", f.path("config.json")],
    { encoding: "utf8" },
  );
  assert.equal(run.status, 1);
  blocked(JSON.parse(run.stdout), "CONFIG_FORMAT");
  for (const sensitive of [f.root, PASSWORD, KEY])
    assert.ok(!`${run.stdout}${run.stderr}`.includes(sensitive));
});

test("CLI succeeds with filesystem writes/processes denied and network calls trapped", async (t) => {
  const f = await fixture(t);
  await f.write(
    "deny-effects.mjs",
    `
    import net from 'node:net';
    import tls from 'node:tls';
    import http from 'node:http';
    import https from 'node:https';
    import dgram from 'node:dgram';
    import dns from 'node:dns';
    import { syncBuiltinESMExports } from 'node:module';
    const deny = () => { throw new Error('NETWORK_FORBIDDEN'); };
    globalThis.fetch = deny;
    net.Socket.prototype.connect = deny;
    tls.connect = deny;
    http.request = http.get = https.request = https.get = deny;
    dgram.createSocket = deny;
    for (const name of ['lookup','resolve','resolve4','resolve6','reverse']) {
      dns[name] = deny; dns.promises[name] = deny;
    }
    syncBuiltinESMExports();
  `,
  );
  const snapshot = async (dir) => {
    const rows = [];
    for (const name of (await readdir(dir)).sort()) {
      const path = join(dir, name),
        info = await stat(path);
      rows.push([
        path,
        info.mode,
        info.mtimeMs,
        info.isDirectory() ? null : await readFile(path, "utf8"),
      ]);
      if (info.isDirectory()) rows.push(...(await snapshot(path)));
    }
    return rows;
  };
  const before = await snapshot(f.root);
  const run = spawnSync(
    process.execPath,
    [
      "--permission",
      "--allow-fs-read=*",
      "--import",
      f.path("deny-effects.mjs"),
      SCRIPT,
      "--config",
      f.path("config.json"),
    ],
    { encoding: "utf8" },
  );
  assert.equal(run.status, 0, run.stderr || run.stdout);
  assert.equal(JSON.parse(run.stdout).status, "LOCAL_PREREQUISITES_PRESENT");
  assert.deepEqual(await snapshot(f.root), before);
  for (const sensitive of [f.root, PASSWORD, KEY])
    assert.ok(!`${run.stdout}${run.stderr}`.includes(sensitive));
});
