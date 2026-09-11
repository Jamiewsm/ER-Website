// 실제 PostgreSQL 경쟁 검사를 위해 외부 접속 없는 일회용 로컬 클러스터를 만든다.
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

export const uid = (n) =>
  `10000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
export const headSQL = `select set_config('request.jwt.claim.sub','${uid(1)}',false); set role authenticated;`;

// Same synthetic legacy tables as education-db.mjs / education-registration.test.mjs.
// Do not import that helper: this runner needs no PGlite or other runtime package.
const bootstrap = `
create schema auth; create schema storage;
create table auth.users(id uuid primary key,email text);
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema public,auth,storage to anon,authenticated;
create table coach_profiles(user_id uuid primary key references auth.users,role text,is_active boolean default true);
create table coach_mentees(id uuid primary key,coach_user_id uuid references auth.users);
create table program_applications(id uuid primary key,contact text,cohort_key text,program_key text,status text,
 payment_region text,payment_currency text,payment_amount_usd numeric,payment_amount_krw bigint);
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets,name text,metadata jsonb default '{}',unique(bucket_id,name));
alter table storage.objects enable row level security;
grant select,insert,update,delete on storage.objects to authenticated;
insert into auth.users values ('${uid(1)}','head@example.test');
insert into coach_profiles values ('${uid(1)}','head_coach',true);
`;

export async function createPostgres() {
  if (!process.env.PG_BIN_DIR)
    throw new Error(
      "PG_BIN_DIR is required; only a binary directory is accepted, never a database URL",
    );
  const bin = process.env.PG_BIN_DIR;
  const directory = await mkdtemp("/tmp/edu-pg-");
  const data = join(directory, "data");
  const children = new Set();
  // Never inherit libpq connection, password, service, or options from the caller.
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !key.startsWith("PG")),
  );
  function launch(command, args) {
    const child = spawn(join(bin, command), args, {
      env,
      stdio: ["pipe", "pipe", "pipe"],
    });
    children.add(child);
    let stdout = "",
      stderr = "",
      finished = false;
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    const done = new Promise((resolve, reject) => {
      child.on("error", reject);
      child.on("close", (code) => {
        finished = true;
        children.delete(child);
        resolve({ code, stdout, stderr });
      });
    });
    // Mark handled immediately; a failed spawn may precede the first wait.
    done.catch(() => {});
    return {
      child,
      done,
      write: (sql) => child.stdin.write(sql + "\n"),
      // EOF must not write a newline after an expected SQL error has already closed psql.
      end: (sql = "") => child.stdin.end(sql ? sql + "\n" : undefined),
      async until(marker) {
        const deadline = Date.now() + 10000;
        while (!stdout.split(/\r?\n/).includes(marker)) {
          if (finished)
            throw new Error(`Session ended before ${marker}: ${stderr}`);
          if (Date.now() >= deadline)
            throw new Error(`Session barrier timeout: ${marker}`);
          await delay(10);
        }
      },
      async value(prefix) {
        const deadline = Date.now() + 10000;
        while (Date.now() < deadline) {
          const line = stdout
            .split(/\r?\n/)
            .find((line) => line.startsWith(prefix));
          if (line) return line.slice(prefix.length);
          if (finished)
            throw new Error(`Session ended before ${prefix}: ${stderr}`);
          await delay(10);
        }
        throw new Error(`Session value timeout: ${prefix}`);
      },
    };
  }
  async function command(name, args) {
    const session = launch(name, args);
    session.end();
    const result = await session.done;
    if (result.code !== 0) throw new Error(`${name} failed: ${result.stderr}`);
    return result.stdout.trim();
  }
  function databaseClient(database) {
    const args = [
      "-X",
      "-qAt",
      "-v",
      "ON_ERROR_STOP=1",
      "-h",
      directory,
      "-p",
      "5432",
      "-U",
      "edu_test",
      "-d",
      database,
    ];
    return {
      session() {
        const session = launch("psql", args);
        session.write("set statement_timeout='15s'; set lock_timeout='12s';");
        return session;
      },
      async query(sql) {
        const session = this.session();
        session.end(sql);
        const result = await session.done;
        if (result.code !== 0) throw new Error(result.stderr);
        return result.stdout.trim();
      },
      async blockedBy(blockedPID, blockerPID) {
        const deadline = Date.now() + 10000;
        while (Date.now() < deadline) {
          const observed = await this.query(
            `select exists(select 1 from pg_locks where pid=${blockedPID} and locktype='advisory' and not granted) and ${blockerPID}=any(pg_blocking_pids(${blockedPID}));`,
          );
          if (observed === "t") return;
          await delay(10);
        }
        throw new Error(
          "Did not observe the second backend waiting for the first backend's advisory lock",
        );
      },
    };
  }
  let started = false;
  const close = async () => {
    for (const child of children) child.kill("SIGTERM");
    if (started)
      await command("pg_ctl", ["-D", data, "-m", "immediate", "-w", "stop"]);
    await rm(directory, { recursive: true, force: true });
  };
  try {
    await command("initdb", [
      "-D",
      data,
      "-U",
      "edu_test",
      "-A",
      "trust",
      "--no-locale",
      "-E",
      "UTF8",
    ]);
    // A private Unix socket only: no network listener, fixed socket port is local to this directory.
    await command("pg_ctl", [
      "-D",
      data,
      "-l",
      join(directory, "server.log"),
      "-o",
      `-k ${directory} -c listen_addresses='' -c max_connections=12`,
      "-w",
      "start",
    ]);
    started = true;
    const admin = databaseClient("postgres");
    await admin.query(
      "create role anon; create role authenticated; create role service_role bypassrls;",
    );
    const version = await admin.query("show server_version;");
    return {
      version,
      close,
      async database(name) {
        if (!/^[a-z_]+$/.test(name))
          throw new Error("Invalid synthetic database name");
        await admin.query(`create database ${name};`);
        const client = databaseClient(name);
        await client.query(bootstrap);
        for (const filename of [
          "20260908090000_education_portal.sql",
          "20260908091000_education_registration_capacity.sql",
        ]) {
          if (filename.includes("091000"))
            await client.query(
              "create function require_head_coach() returns void language plpgsql as $$begin if not public.edu_is_head() then raise exception 'head_coach_required';end if;end$$;",
            );
          await client.query(
            await readFile(
              new URL(`../../supabase/migrations/${filename}`, import.meta.url),
              "utf8",
            ),
          );
        }
        return client;
      },
    };
  } catch (error) {
    await close();
    throw error;
  }
}
