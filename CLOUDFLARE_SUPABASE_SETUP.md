# Cloudflare Pages + Supabase 설정 가이드

이 문서는 `ER-Website`를 GitHub Pages에서 Cloudflare Pages로 옮기고, Supabase 로그인(Auth + DB)을 연결하는 최소 절차입니다.

## 1) Cloudflare Pages로 이전

1. Cloudflare Dashboard -> `Workers & Pages` -> `Create` -> `Pages` 선택
2. `Connect to Git`에서 현재 GitHub 저장소 연결
3. 빌드 설정
- Framework preset: `None`
- Build command: 비워두기
- Build output directory: `/` (루트)
4. 배포 완료 후 Pages 기본 도메인 확인 (`*.pages.dev`)

## 2) 커스텀 도메인 연결 (er-coaching.com)

1. Pages 프로젝트 -> `Custom domains` -> `Set up a custom domain`
2. `er-coaching.com` 입력
3. 안내되는 DNS 레코드를 Cloudflare DNS에서 적용
- 기존 GitHub Pages의 `A`, `CNAME` 레코드는 제거/교체
4. SSL 상태가 `Active`가 될 때까지 대기

## 3) Supabase 프로젝트 생성

1. Supabase Dashboard -> `New project`
2. 프로젝트 생성 후 `Project Settings` -> `API`에서 확인
- `Project URL`
- `anon public key`

## 4) 인증 공급자 설정 (Auth)

1. Supabase -> `Authentication` -> `Providers`
2. Email provider 활성화
3. Google 로그인 사용 시 Google provider 활성화 후 Client ID/Secret 입력
4. `Authentication` -> `URL Configuration` 설정
- Site URL: `https://er-coaching.com`
- Redirect URLs:
  - `https://er-coaching.com`
  - `https://<your-project>.pages.dev`

## 5) 사이트 코드에 Supabase 키 입력

파일: `index.html`

아래 값을 실제 프로젝트 값으로 채우세요.

```html
<script>
  window.__ER_SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
  window.__ER_SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
</script>
```

주의: `anon key`는 공개키라 프론트에 노출 가능하지만, `service_role key`는 절대 넣지 않습니다.

## 6) 배포 후 확인 체크리스트

1. 상단 사용자 아이콘 클릭 시 로그인 모달 오픈
2. Email 회원가입/로그인 동작 확인
3. Google 로그인 성공 후 `My Page` 진입 확인
4. 로그아웃 동작 확인
5. 모바일 메뉴의 `마이페이지 / 로그인` 라벨 상태 확인

## 7) 권장 후속 작업

1. Supabase DB에 `profiles` 테이블 추가 (이름/전화번호/동의여부 등)
2. RLS(Row Level Security) 정책 활성화
3. Google Form 신청서를 Supabase 테이블 저장으로 전환
4. 관리자용 대시보드(신청 내역 조회) 추가
