<!-- ER 프리미엄 진단 결과지 콘텐츠 시스템의 진입점 -->
# ER Premium Report Content

이 폴더는 ER 에니어그램 프리미엄 결과지 업그레이드의 SSOT입니다.

## 목적

- Anara에서 만든 근거 기반 초안과 ChatGPT 편집본을 채팅에 흩어두지 않고 파일로 고정합니다.
- Cursor/Codex/Claude는 이 폴더의 스펙과 JSON을 읽고 웹 결과지, PDF, DB 전환을 구현합니다.
- 54개 조합을 단순 조립하지 않고 `core + instinct + wing`이 만나 생기는 화학 작용을 별도 데이터로 관리합니다.

## 파일

- `PROJECT_PLAN.md` — PM 진행 계획, 단계, 사용자에게 요청할 일
- `CONTENT_SPEC.md` — 조각 블록, 화학 카드, 화면 표시 필드 스키마
- `LANGUAGE_LAYERS.md` — 일반 사용자용 회복 언어 + 신앙 선택 문장 규칙
- `chemistry/*.json` — 조합별 화학 카드. 현재 골드 샘플: `sx_7_w8.json`

## 현재 우선순위

1. `sx_7_w8.json`을 골드 샘플로 확정합니다.
2. 결과지 화면에 "이 조합만의 화학" 섹션을 붙입니다.
3. PDF에서 해당 섹션의 길이, 리듬, 여백을 확인합니다.
4. 같은 스키마로 나머지 조합을 Anara/ChatGPT 배치 작업으로 확장합니다.

## 검증

```bash
node scripts/verify_report_content.mjs
```
