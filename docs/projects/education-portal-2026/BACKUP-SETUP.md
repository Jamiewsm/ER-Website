# 교육 포털 백업 준비와 복원 절차

2026-09-12 작성. 이 문서는 준비 절차이며 실제 운영 DB·Storage 원본의 백업 완료 증거가 아니다. 별도 상시 서버나 LMS, 유료 서비스를 추가하지 않는다. 백업은 코드 배포와 독립적으로 진행한다.

## 운영 상태 확인 — 2026-09-12 03:30 KST

- CoachPortal PR #4는9/11 21:33:22 KST에, ER-Website PR #122는21:33:11 KST에 머지됐다. 현재 공개 포털의 교육 HTML/CSS/JS, index, SW, manifest는 portal main `af2a296`과 일치한다. 이전 `Draft` 상태 기록은 당시의 기록이다.
- 운영 DB에서 `20260908090000`, `20260908091000` migration 기록과 교육 테이블을 확인했다. 교육 테이블14개의 RLS가 켜져 있고 `edu-files`는 비공개다. 교실2개, 수강 관계0개, 성찰 제출0개였다. 이는 실제 사용자 권한 전체 검사나 기존 자료의 복원 성공을 뜻하지 않는다.
- Portal Pages CI34611663050은 Cloudflare 인증 설정이 비어 실패했다. 공개 파일은 현재 main과 일치하지만 해당 Actions 실행으로 배포 성공을 입증할 수 없다. Supabase-only merge의 사이트 배포 추론은 skip이었다. 운영 적용 경로와 시각 기록은 배포 담당자가 확인해야 한다.
- 실제 전체 백업·격리 복원 증거는 아직 없다. 사이트 PR #123과 보류된 공개 공지 SQL은 계속 별도 보류다.

## 준비할 최소 구성

| 구분 | 준비 내용 | 확인 범위 |
|---|---|---|
| DB 접속 | Dashboard의 Connect → Session pooler 호스트,5432, 프로젝트에 맞는 사용자와 기존 DB 암호 | 서비스 키나 MCP 연결만으로 DB dump 접속을 대신할 수 없음 |
| 비공개 설정 | 저장소·동기화 폴더 밖의 `config.json`, `db.pgpass`, `storage-reader.key`, 공개 암호화 수신키 | 파일600, 전용 폴더700, 경로·비밀값 로그 출력 금지 |
| 백업 도구 | PostgreSQL 클라이언트와 공식 age 암호화 바이너리 | 도구 존재와 실제 접속/백업 성공은 별개 |
| 파일 접근 | 운영 프로젝트의 Storage를 읽을 수 있는 서버용 키 | 브라우저 anon/publishable 키만으로 전체 파일 백업을 시도하지 않음 |
| 보관 | 로컬의 날짜별 암호화 사본과 Supabase 밖의 별도 암호화 사본 | iCloud를 쓰면 원격 동기화·다운로드 및 별도 복구키 보관까지 검증 |
| 복원 | 운영 주소를 사용하지 않는 격리 PostgreSQL/Supabase 환경 | Auth/Storage 서비스 검증까지 끝나야 전체 복구 확인 |

기존 DB 암호와 Storage 키는 **채팅에 보내지 않고** 해당 비공개 파일에 직접 입력한다. DB 암호를 모르면 현재 설정을 임의로 초기화하지 않는다. 서비스 키는 모든 자료에 접근할 수 있으므로 Git, 브라우저 코드, PR, 스크린샷에 넣지 않는다. 암호화 개인키도 백업 사본과 따로 보관하고, 다른 기기에서 복원할 수 있는 사본을 확인한다.

## 설정 파일 형식

아래는 예시이며 비밀번호를 포함하지 않는다. 실제 파일은 저장소 밖에서만 작성한다. 경로는 사용하는 컴퓨터에 맞춘다.

```json
{
  "version": 1,
  "projectRef": "osdynbadhtfgoxilgmpy",
  "database": {
    "host": "REPLACE_WITH_SESSION_POOLER_HOST",
    "port": 5432,
    "user": "postgres.osdynbadhtfgoxilgmpy",
    "name": "postgres",
    "passwordFile": "/private/er-backup/db.pgpass"
  },
  "tools": {
    "pgBinDir": "/private/postgresql/bin",
    "ageBinary": "/private/age"
  },
  "storage": { "serviceKeyFile": "/private/er-backup/storage-reader.key" },
  "encryption": { "recipientFile": "/private/er-backup/age-recipient.txt" },
  "destinations": {
    "local": "/private/er-backups",
    "offsite": "/independent-storage/er-backups"
  }
}
```

`db.pgpass` 한 줄은 `호스트:5432:postgres:postgres.프로젝트번호:암호` 형식이다. 암호 속 `:`와 `\`는 각각 `\:`와 `\\`로 이스케이프한다. 호스트·DB·사용자에 `*`를 쓰지 않는다. `storage-reader.key`는 실제 서버용 키 한 개, `age-recipient.txt`는 공개 `age1…` 수신키 한 줄이다. 개인 `AGE-SECRET-KEY…`는 수신키 파일에 넣지 않는다.

```sh
node scripts/education-backup-preflight.mjs --config "$HOME/.config/er-education-backup/config.json"
node --test tests/education-backup-preflight.test.mjs
```

검사기는 네트워크에 연결하거나 비밀값을 출력하지 않으며 백업·복원 명령을 실행하지 않는다. 누락/잘못된 파일 권한/심볼릭·하드 링크 비밀파일/자리표시자/와일드카드 암호 항목/저장소 내부 설정/겹친 보관 경로를 발견하면 종료코드1로 중단한다. `LOCAL_PREREQUISITES_PRESENT`도 로컬 전제 조건만 갖췄다는 뜻이다. 접속 인증, 수신키 체크섬과 실제 암호화, 외부 보관의 독립성, 백업 및 복원은 항상 별도 미검증 상태로 표시한다.

## 실제 첫 백업 순서

1. 비공개 설정과 복구키의 별도 보관을 확인한다. 대상 프로젝트 ID·호스트·TLS 연결을 확인하며 연결 제한시간을 둔다. 운영 DB에는 읽기 전용 세션으로 접근한다. PostgreSQL 클라이언트와 서버 버전, extension/관리 스키마를 점검한다. 현재 준비된 로컬 PG18 도구가 운영 PG17과 같다고 기록하지 않는다.
2. DB의 스키마·데이터·소유권·권한·함수·정책, 계정 및 migration 이력을 보존한다. `pg_dump` 한 DB 출력만으로 전역 역할까지 보존했다고 하지 않는다. 역할 암호를 덤프에 넣지 않고 필요한 역할/권한을 따로 보존한다. Supabase CLI 방식은 Docker가 필요하며 `auth`/`storage`의 사용자 정의 정책·트리거와 migration 이력은 별도 확인한다. 관리 스키마/권한 오류를 무시하거나 성공 처리하지 않는다.
3. Storage의 모든 bucket/path/버전/크기 목록을 읽고 실제 원본을 다운로드한다. pagination을 끝까지 읽으며 파일마다 SHA256을 남긴다. DB 스냅샷과 Storage는 하나의 원자적 백업이 아니므로 수집 전후 목록·버전·크기를 비교하고 달라진 파일은 다시 확인한다. 일치하지 않으면 완전한 백업으로 표시하지 않는다. 원격 파일을 삭제하거나 덮어쓰는 명령은 쓰지 않는다.
4. DB·원본·manifest를 age로 암호화한다. 평문 작업 파일이 필요하면 저장소와 동기화 영역 밖의 접근 제한된 작업 폴더만 사용한다. 각 단계의 종료코드와 빈 출력 여부를 확인하고, 실패 시 완료 표식을 만들지 않는다. 암호화 산출물은 날짜·고유 실행번호로 생성하여 이전 사본을 덮어쓰지 않는다.
5. 암호화 사본을 독립 보관 위치에 복사한 뒤 실제로 다시 읽어 크기·SHA256을 비교한다. 로컬 동기화 경로에 파일이 생긴 것만으로 원격 보관을 확인했다고 하지 않는다. 백업 보관기간과 삭제 정책은 별도로 확정하며 이번 준비 도구는 삭제하지 않는다.
6. 운영과 분리되고 외부 메일·웹훅·스케줄 작업·실사용자 접속이 차단된 환경에 복호화·복원한다. 운영 URL, 동일 프로젝트 ID, 운영 DB에 대한 restore/reset은 거부한다. 원본 DB의 extension·암호화/Vault 설정과 실제 Auth/Storage 구성이 필요한 부분을 확인한다. DB dump가 있다고 계정 인증 서비스까지 복구됐다고 하지 않는다.
7. 테이블별 행 수, 질문/답변 원문, 파일 수·크기·해시, 역할/정책과 학생·담당 멘토·수석 권한을 비교한다. 전체 증거가 확인된 뒤에만 백업 완료·복원 완료를 각각 표시한다. 복구 사본의 상태 변경이 원본 운영 서비스에 영향을 주지 않는지 확인한다.

## 완료 기록

`checked_at`, source project/DB version, 도구 버전, 수집 시작/종료시각, 테이블·행·객체 수, 암호화 사본별 크기/해시, 독립 보관 재읽기 결과, 복원 환경과 검증 결과를 비공개 manifest에 기록한다. 경로·신청자·학생 원문이 포함된 manifest는 공개 저장소에 올리지 않는다. 암호화 왕복 합성검사는 도구 검증으로 기록하며 실제 운영 백업과 구분한다.

## 공식 근거

- [Supabase 백업·복원 절차](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)
- [Supabase 백업 범위 — Storage 원본은 별도](https://supabase.com/docs/guides/platform/backups)
- [PostgreSQL pg_dump 범위와 복원](https://www.postgresql.org/docs/current/app-pgdump.html)
- [PostgreSQL 암호 파일 형식·권한](https://www.postgresql.org/docs/current/libpq-pgpass.html)
- [age 공식 구현과 사용법](https://github.com/FiloSottile/age)


## 현재 컴퓨터에서 준비한 항목

- `~/.config/er-education-backup/`에 실제 비밀값이 없는 설정·암호 파일·서버 키 자리표시자와 유효한 공개 암호화 수신키를 준비했다. 개인키는 별도 파일로 같은 비공개 폴더에만 있으며, 저장소·백업 폴더·동기화 폴더에 복사하지 않았다.
- 로컬 날짜별 사본과 iCloud 암호화 사본용 폴더를 준비했다. 폴더 존재는 원격 보관 확인이 아니다. 아직 운영 원본이나 백업 사본이 들어 있지 않다.
- age1.3.2 darwin-arm64 공식 배포물 SHA256 `e2020b073c44f692685a24d6abc378817eb81ffaaf49fd0531ef8565f767f2f5`를 확인했다. 합성 자료 암호화 왕복과 변조된 암호문 거부가 성공했다. 이 도구는 프로젝트 런타임에 포함하지 않는다.
- 첫 백업 실행에 앞서 Session pooler 호스트와 기존 DB 암호, Storage 서버 키를 비공개 파일에 입력하고, 개인키의 독립 보관과 복원 환경을 확인해야 한다. 실제 접속 및 전체 백업/복원은 아직 수행하지 않았다.
