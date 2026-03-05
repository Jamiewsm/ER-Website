#!/usr/bin/env python3
from __future__ import annotations

import pathlib
import re
import sys


ROOT = pathlib.Path(__file__).resolve().parents[1]


def fail(message: str) -> None:
    print(f"ERROR: {message}")
    sys.exit(1)


def require_file(path: pathlib.Path) -> None:
    if not path.is_file():
        fail(f"Required file is missing: {path.relative_to(ROOT)}")


def check_frontend_secrets() -> None:
    index_path = ROOT / "index.html"
    content = index_path.read_text(encoding="utf-8")

    if "service_role" in content.lower():
        fail("Frontend must not contain a Supabase service role key.")

    if "window.__ER_SUPABASE_URL" not in content:
        fail("Supabase URL bootstrap variable is missing from index.html.")

    if "window.__ER_SUPABASE_ANON_KEY" not in content:
        fail("Supabase anon key bootstrap variable is missing from index.html.")


def check_wrangler() -> None:
    wrangler_path = ROOT / "wrangler.toml"
    content = wrangler_path.read_text(encoding="utf-8")

    if 'name = "er-coaching-site"' not in content:
        fail("wrangler.toml is missing the expected project name.")

    if "[assets]" not in content or 'directory = "."' not in content:
        fail("wrangler.toml must publish the repository root as static assets.")


def check_migrations() -> None:
    migrations_dir = ROOT / "supabase" / "migrations"
    if not migrations_dir.is_dir():
        fail("supabase/migrations directory is missing.")

    pattern = re.compile(r"^\d{14}_[a-z0-9_]+\.sql$")
    migration_files = sorted(p for p in migrations_dir.iterdir() if p.is_file() and p.suffix == ".sql")
    if not migration_files:
        fail("No Supabase migration files found.")

    for path in migration_files:
        if not pattern.match(path.name):
            fail(f"Invalid migration filename: {path.name}")


def check_required_docs() -> None:
    required = [
        ROOT / "docs" / "git_workflow.md",
        ROOT / "docs" / "supabase_migration_review_checklist.md",
        ROOT / "docs" / "backup_strategy.md",
        ROOT / ".github" / "pull_request_template.md",
    ]
    for path in required:
        require_file(path)


def main() -> None:
    require_file(ROOT / "index.html")
    require_file(ROOT / "wrangler.toml")
    require_file(ROOT / "supabase" / "coach_portal_schema.sql")

    check_frontend_secrets()
    check_wrangler()
    check_migrations()
    check_required_docs()

    print("Repository validation passed.")


if __name__ == "__main__":
    main()
