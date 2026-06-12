#!/usr/bin/env python3
# supabase/functions 소스에서 deploy_edge_function 인자 JSON 생성
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FN_ROOT = ROOT / "supabase" / "functions"
PROJECT_ID = "osdynbadhtfgoxilgmpy"

SPECS = {
    "submit-application": {
        "entrypoint_path": "submit-application/index.ts",
        "verify_jwt": False,
        "files": [
            "submit-application/index.ts",
            "_shared/cors.ts",
            "_shared/email-templates.ts",
            "_shared/resend.ts",
            "_shared/turnstile.ts",
        ],
    },
    "notify-program-application": {
        "entrypoint_path": "notify-program-application/index.ts",
        "verify_jwt": True,
        "files": [
            "notify-program-application/index.ts",
            "_shared/cors.ts",
            "_shared/email-templates.ts",
            "_shared/program-pricing.ts",
            "_shared/resend.ts",
            "_shared/head-coach.ts",
        ],
    },
}


def build(fn: str) -> dict:
    spec = SPECS[fn]
    files = []
    for rel in spec["files"]:
        files.append({"name": rel, "content": (FN_ROOT / rel).read_text(encoding="utf-8")})
    return {
        "project_id": PROJECT_ID,
        "name": fn,
        "entrypoint_path": spec["entrypoint_path"],
        "verify_jwt": spec["verify_jwt"],
        "files": files,
    }


def main() -> int:
    if len(sys.argv) != 2 or sys.argv[1] not in SPECS:
        print(f"usage: build_mcp_deploy_from_disk.py <{'|'.join(SPECS)}>", file=sys.stderr)
        return 1
    json.dump(build(sys.argv[1]), sys.stdout)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
