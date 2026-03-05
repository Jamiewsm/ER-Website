#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import pathlib
import sys
import urllib.error
import urllib.parse
import urllib.request


SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
BACKUP_BUCKETS = [bucket.strip() for bucket in os.environ.get("BACKUP_BUCKETS", "").split(",") if bucket.strip()]
BACKUP_ROOT = pathlib.Path(os.environ.get("BACKUP_ROOT", "backup-output"))


def fail(message: str) -> None:
    print(message, file=sys.stderr)
    sys.exit(1)


def api_request(method: str, path: str, payload: dict | None = None) -> bytes:
    if not SUPABASE_URL or not SERVICE_ROLE_KEY:
        fail("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.")

    url = f"{SUPABASE_URL}{path}"
    data = None
    headers = {
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "apikey": SERVICE_ROLE_KEY,
    }
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    request = urllib.request.Request(url=url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(request) as response:
        return response.read()


def list_objects(bucket: str, prefix: str = "") -> list[dict]:
    raw = api_request(
        "POST",
        f"/storage/v1/object/list/{urllib.parse.quote(bucket, safe='')}",
        {
            "prefix": prefix,
            "limit": 1000,
            "offset": 0,
            "sortBy": {"column": "name", "order": "asc"},
        },
    )
    return json.loads(raw.decode("utf-8"))


def walk_bucket(bucket: str, prefix: str = "") -> list[str]:
    object_paths: list[str] = []
    for item in list_objects(bucket, prefix):
        name = item.get("name")
        if not name:
            continue
        if item.get("id"):
            object_paths.append(f"{prefix}{name}")
            continue
        object_paths.extend(walk_bucket(bucket, f"{prefix}{name}/"))
    return object_paths


def download_object(bucket: str, object_path: str, output_path: pathlib.Path) -> None:
    quoted_bucket = urllib.parse.quote(bucket, safe="")
    quoted_object = urllib.parse.quote(object_path, safe="/")
    data = api_request("GET", f"/storage/v1/object/{quoted_bucket}/{quoted_object}")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_bytes(data)


def main() -> None:
    if not BACKUP_BUCKETS:
        fail("BACKUP_BUCKETS is required.")

    storage_root = BACKUP_ROOT / "storage"
    storage_root.mkdir(parents=True, exist_ok=True)

    for bucket in BACKUP_BUCKETS:
        bucket_root = storage_root / bucket
        bucket_root.mkdir(parents=True, exist_ok=True)
        object_paths = walk_bucket(bucket)
        print(f"Bucket {bucket}: {len(object_paths)} objects")
        for object_path in object_paths:
            try:
                download_object(bucket, object_path, bucket_root / object_path)
            except urllib.error.HTTPError as exc:
                fail(f"Failed to download {bucket}/{object_path}: {exc.code} {exc.reason}")


if __name__ == "__main__":
    main()
