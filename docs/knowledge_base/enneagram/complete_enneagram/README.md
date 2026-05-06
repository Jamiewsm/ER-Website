---
kb_id: complete_enneagram
title: "The Complete Enneagram - Agent Knowledge Base"
source_pdf: "/Users/Joeyswoo/Downloads/Complete_Enneagram.pdf"
source_title: "The Complete Enneagram: 27 Paths to Greater Self-Knowledge"
source_author: "Beatrice Chestnut"
source_pages: 535
source_size: "2.7M"
source_sha256: "d6e3648137de01cc51537243b0211cb81d68220c68a1dd4139d270cac25c8ca1"
created_at: "2026-05-05"
artifact_type: "derived_index_and_summary"
language: "ko-KR with English source terms"
---

# Complete Enneagram 지식베이스

이 폴더는 `/Users/Joeyswoo/Downloads/Complete_Enneagram.pdf`를 기반으로 만든 에이전트 검색/참조용 Markdown 지식베이스입니다.

중요: 이 산출물은 PDF 원문 전체를 그대로 전사한 파일이 아닙니다. 원문 저작권을 존중하기 위해 장문 복제 대신, AI agent가 빠르게 검색하고 원문 위치를 찾아갈 수 있도록 `요약`, `진단 단서`, `페이지 참조`, `검색 키워드` 중심으로 재구성했습니다.

원본 검증값: `sha256 d6e3648137de01cc51537243b0211cb81d68220c68a1dd4139d270cac25c8ca1`.

## 파일 구성

- [source_page_index.md](./source_page_index.md): PDF 메타데이터, 장별 페이지 범위, 장 내부 섹션 앵커, 27개 하위유형 색인.
- [complete_enneagram_kb.md](./complete_enneagram_kb.md): 진단 테스트 설계에 바로 쓰기 좋은 타입별 핵심 구조, 본능/하위유형, countertype, 문항 설계 포인트.
- [type_pair_disambiguation.md](./type_pair_disambiguation.md): Appendix의 36개 타입쌍 감별 섹션을 페이지 참조와 함께 정리한 인덱스.

## 에이전트 사용 규칙

1. 먼저 `complete_enneagram_kb.md`에서 타입, passion, defense, subtype, countertype 키워드로 검색한다.
2. 원문 맥락이 필요하면 `source_page_index.md`의 PDF page ref를 따라 `/Users/Joeyswoo/Downloads/Complete_Enneagram.pdf`를 확인한다.
3. 두 타입 점수가 비슷하면 `type_pair_disambiguation.md`에서 해당 pair를 찾고, 감별 질문을 설계한다.
4. 답변이나 테스트 로직에 원문을 장문 인용하지 않는다. 필요한 경우 짧은 문구만 확인용으로 쓰고, 대부분은 요약/해석/페이지 참조로 처리한다.

## 빠른 검색 예시

```bash
rg "Sexual Six|countertype|Strength/Beauty" docs/knowledge_base/enneagram/complete_enneagram
rg "Type Five|Avarice|Isolation|Castle" docs/knowledge_base/enneagram/complete_enneagram
rg "Twos and Eights|2 vs 8|Social Two" docs/knowledge_base/enneagram/complete_enneagram
```

## 페이지 참조 기준

모든 `pNNN` 표기는 PDF 파일의 물리 페이지 번호입니다. 책의 인쇄 페이지 번호와 다를 수 있으므로, 에이전트는 `pypdf` 또는 PDF 뷰어의 페이지 이동 기준으로 참조하세요.
