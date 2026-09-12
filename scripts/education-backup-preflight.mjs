// 로컬 준비 상태만 읽어 점검하며 연결, 백업, 복구, 파일 쓰기를 실행하지 않는다.
import { access, lstat, open, realpath, stat } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT = "osdynbadhtfgoxilgmpy";
const CHECKOUT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const privateMode = (info, mode) =>
  info.uid === process.getuid() && (info.mode & 0o7777) === mode;
const usable = (value) =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  !/(<[^>]*>|\$\{|placeholder|(?:replace|change|set)[_ -]?me|(?:replace|change|your|set|insert|fill)[_ -]|todo|tbd|unknown|missing|not[_ -](?:set|configured)|^x{3,}$|^(?:password|secret|null|undefined)$)/i.test(
    value.trim(),
  );
const absolute = (value) => usable(value) && isAbsolute(value);
const within = (root, path) => {
  const rel = relative(root, path);
  return (
    rel === "" ||
    (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel))
  );
};

// A dedicated pgpass entry prevents wildcard/first-match surprises in a later backup.
function parsePgpass(text) {
  const lines = text
    .split(/\r?\n/)
    .filter((line) => line.trim() && !line.startsWith("#"));
  if (lines.length !== 1) return null;
  const fields = [""];
  for (let i = 0; i < lines[0].length; i++) {
    const char = lines[0][i];
    if (char === "\\") {
      const next = lines[0][++i];
      if (next !== ":" && next !== "\\") return null;
      fields[fields.length - 1] += next;
    } else if (char === ":") fields.push("");
    else fields[fields.length - 1] += char;
  }
  return fields.length === 5 ? fields : null;
}

function serverKeyShape(value) {
  const key = value.trim();
  if (!usable(key)) return false;
  if (/^sb_secret_[A-Za-z0-9_-]+$/.test(key)) return true;
  if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(key))
    return false;
  try {
    const payload = JSON.parse(
      Buffer.from(key.split(".")[1], "base64url").toString("utf8"),
    );
    return (
      payload?.role === "service_role" &&
      (payload.ref === undefined || payload.ref === PROJECT)
    );
  } catch {
    return false;
  }
}

export async function inspectBackupPrerequisites(
  configPath,
  { repositoryRoot = CHECKOUT } = {},
) {
  const checks = [];
  const add = (code, ok, description) => checks.push({ code, ok, description });
  const report = () => ({
    status: checks.every((check) => check.ok)
      ? "LOCAL_PREREQUISITES_PRESENT"
      : "BLOCKED",
    backupCreated: false,
    restoreVerified: false,
    credentialsVerified: false,
    encryptionVerified: false,
    offsiteVerified: false,
    checks,
    limitations: [
      "실제 연결과 자격 증명·키 유효성은 확인하지 않았습니다.",
      "도구 실행과 버전 호환성은 확인하지 않았습니다.",
      "age 수신키의 체크섬·실제 암호화·복호화는 확인하지 않았습니다.",
      "외부 보관소의 물리적 독립성과 지속 보관 여부는 확인하지 않았습니다.",
      "백업 생성과 복구 검증을 실행하지 않았습니다.",
    ],
  });
  let repo;
  try {
    repo = await realpath(repositoryRoot);
  } catch {
    add("CHECKOUT_UNAVAILABLE", false, "체크아웃 경계를 확인할 수 없습니다.");
    return report();
  }

  async function readPrivate(path, code, label) {
    let handle;
    try {
      if (!absolute(path)) throw new Error();
      const canonical = await realpath(path);
      const info = await lstat(path);
      const parent = await lstat(dirname(path));
      if (
        within(repo, canonical) ||
        !info.isFile() ||
        info.nlink !== 1 ||
        !privateMode(info, 0o600) ||
        !parent.isDirectory() ||
        !privateMode(parent, 0o700)
      )
        throw new Error();
      handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
      const opened = await handle.stat();
      if (
        opened.ino !== info.ino ||
        opened.dev !== info.dev ||
        !opened.isFile() ||
        opened.nlink !== 1 ||
        !privateMode(opened, 0o600) ||
        opened.size > 65536
      )
        throw new Error();
      const content = await handle.readFile("utf8");
      add(code, true, `${label}: 비공개 파일과 상위 폴더 권한 확인.`);
      return content;
    } catch {
      add(
        code,
        false,
        `${label}: 체크아웃 밖의 본인 소유 일반 파일(600), 상위 폴더(700)가 필요합니다.`,
      );
      return null;
    } finally {
      if (handle) await handle.close();
    }
  }

  const raw = await readPrivate(configPath, "CONFIG_FILE", "설정");
  if (raw === null) return report();
  let config;
  try {
    config = JSON.parse(raw);
    if (!config || Array.isArray(config) || config.version !== 1)
      throw new Error();
  } catch {
    add("CONFIG_FORMAT", false, "버전 1 JSON 설정이 필요합니다.");
    return report();
  }
  add("CONFIG_FORMAT", true, "버전 1 JSON 설정 확인.");
  add(
    "PROJECT_REF",
    config.projectRef === PROJECT,
    "대상 프로젝트 식별자 일치가 필요합니다.",
  );

  const db = config.database ?? {};
  const databaseValid =
    typeof db.host === "string" &&
    usable(db.host) &&
    /^[a-z0-9-]+\.pooler\.supabase\.com$/.test(db.host) &&
    db.port === 5432 &&
    db.user === `postgres.${PROJECT}` &&
    db.name === "postgres";
  add(
    "DATABASE_TARGET",
    databaseValid,
    "대상 프로젝트의 세션 풀러 호스트·포트·계정 설정 확인.",
  );
  const pgpass = await readPrivate(db.passwordFile, "PGPASS_FILE", "DB 암호");
  if (pgpass !== null) {
    const fields = parsePgpass(pgpass);
    const expected = [db.host, String(db.port), db.name, db.user];
    add(
      "PGPASS_ENTRY",
      Boolean(
        databaseValid &&
        fields &&
        expected.every(
          (value, i) => fields[i] === value && !fields[i].includes("*"),
        ) &&
        usable(fields[4]),
      ),
      "DB 암호 파일에는 와일드카드 없는 정확한 대상 항목 하나와 실제 암호가 필요합니다.",
    );
  }

  const key = await readPrivate(
    config.storage?.serviceKeyFile,
    "STORAGE_KEY_FILE",
    "Storage 키",
  );
  if (key !== null)
    add(
      "STORAGE_KEY_CONTENT",
      serverKeyShape(key),
      "서버용 Storage 키 형식이 필요합니다. 공개 키는 허용하지 않으며 서명·권한은 미검증입니다.",
    );
  const recipient = await readPrivate(
    config.encryption?.recipientFile,
    "AGE_RECIPIENT_FILE",
    "암호화 수신자",
  );
  if (recipient !== null)
    add(
      "AGE_RECIPIENT_CONTENT",
      !/PRIVATE KEY/i.test(recipient) &&
        /^age1[023456789acdefghjklmnpqrstuvwxyz]{58}$/.test(recipient.trim()),
      "단일 age 공개 수신자의 문자 형식만 확인합니다. 체크섬·암호화는 미검증이며 개인키는 허용하지 않습니다.",
    );

  const toolConfig = config.tools ?? {};
  const pgDirValid = absolute(toolConfig.pgBinDir);
  for (const [code, path] of [
    ...["pg_dump", "pg_dumpall", "pg_restore", "psql"].map((name) => [
      `TOOL_${name.toUpperCase()}`,
      pgDirValid ? join(toolConfig.pgBinDir, name) : null,
    ]),
    ["TOOL_AGE", toolConfig.ageBinary],
  ]) {
    let ok = false;
    try {
      if (absolute(path) && (await stat(path)).isFile()) {
        await access(path, constants.X_OK);
        ok = true;
      }
    } catch {
      /* Report presence only, without paths or operating-system error text. */
    }
    add(code, ok, "필요 도구의 실행 가능한 파일 존재 확인; 실행하지 않음.");
  }

  const destinations = {};
  for (const name of ["local", "offsite"]) {
    let ok = false;
    try {
      const path = config.destinations?.[name];
      if (!absolute(path)) throw new Error();
      const canonical = await realpath(path);
      const info = await stat(canonical);
      if (
        !info.isDirectory() ||
        within(repo, canonical) ||
        (name === "local" && !privateMode(info, 0o700))
      )
        throw new Error();
      await access(canonical, constants.W_OK | constants.X_OK);
      destinations[name] = canonical;
      ok = true;
    } catch {
      /* Never create a missing destination during inspection. */
    }
    add(
      `DESTINATION_${name.toUpperCase()}`,
      ok,
      name === "local"
        ? "로컬 보관소: 체크아웃 밖의 본인 소유 폴더(700)가 필요합니다."
        : "외부 보관소: 체크아웃 밖의 쓰기 가능한 기존 폴더가 필요합니다.",
    );
  }
  const { local, offsite } = destinations;
  add(
    "DESTINATIONS_SEPARATE",
    Boolean(
      local && offsite && !within(local, offsite) && !within(offsite, local),
    ),
    "보관소 두 곳은 동일 경로나 서로의 상·하위 폴더일 수 없습니다.",
  );
  return report();
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const args = process.argv.slice(2);
  const configPath =
    args.length === 2 && args[0] === "--config" ? args[1] : undefined;
  try {
    const result = await inspectBackupPrerequisites(configPath);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    process.exitCode = result.status === "LOCAL_PREREQUISITES_PRESENT" ? 0 : 1;
  } catch {
    process.stdout.write(
      `${JSON.stringify({
        status: "BLOCKED",
        backupCreated: false,
        restoreVerified: false,
        credentialsVerified: false,
        encryptionVerified: false,
        offsiteVerified: false,
        checks: [
          {
            code: "INSPECTION_FAILED",
            ok: false,
            description: "로컬 사전 점검을 완료하지 못했습니다.",
          },
        ],
      })}\n`,
    );
    process.exitCode = 1;
  }
}
