# HowZero Wiki — AGENTS.md

> `wiki/`는 HowZero의 Obsidian/Codex 영속 위키다. 이 폴더의 작업 지침 원본은 이 파일이다.

---

## 1. 시작 순서

wiki 관련 작업을 시작하면 반드시 아래 순서로 읽는다.

1. 루트 `AGENTS.md`
2. `wiki/AGENTS.md`
3. `wiki/index.md`
4. 작업 축에 맞는 중심 페이지

작업 축:

- AX 전환 작업: `wiki/HowZero AX Index.md`
- 커머스 작업: `wiki/HowZero Commerce Index.md`
- 공통 정리: `wiki/HowZero Overview.md`, `wiki/HowZero Source Map.md`

---

## 2. 역할

`wiki/`는 원문 저장소가 아니다. 원문을 빠르게 찾고, 질문에 답하고, 다음 대본/기획/도식 작업을 이어가기 위한 합성 레이어다.

- 원문: `docs/`, `brands/`, `scripts/`, `src/`, `howzero-web/`
- 합성: `wiki/`
- 작업 기록: `wiki/log.md`
- 진입점: `wiki/index.md`

원문을 wiki 내용으로 대체하지 않는다.

---

## 3. 업데이트 규칙

새 자료를 반영하거나 대본/도식/전략을 바꾸면 함께 업데이트한다.

1. 관련 주제 페이지
2. `wiki/index.md`
3. `wiki/log.md`

커머스 작업이면 보통 아래 페이지를 확인한다.

- `wiki/HowZero Commerce Index.md`
- `wiki/HowZero Commerce Brain.md`
- `wiki/HowZero Commerce Persona.md`
- `wiki/Commerce Script Rules.md`
- `wiki/Commerce Hook Library.md`
- `wiki/Bulsaja Index.md`
- `wiki/ManuTag Automation Playbook.md`
- `wiki/Bulsaja Commerce Copilot.md`

AX 전환 작업이면 보통 아래 페이지를 확인한다.

- `wiki/HowZero AX Index.md`
- `wiki/HowZero AX Brain.md`
- `wiki/HowZero AX Persona.md`
- `wiki/HOWAAA Marketing AX Playbook.md`
- `wiki/AX Offer Map.md`

---

## 4. 자료 인제스트 기본 워크플로우

사용자가 자료, 유튜브 전사, 기사, 이미지, 강의 노트, 경쟁 영상, 아이디어를 "인제스트해줘"라고 하면 아래 순서로 처리한다.

1. 원문 성격을 판별한다.
   - 스마트스토어, 쿠팡, 구매대행, 상세페이지, 상품명, 태그, 마누태그, 불사자, 셀러 교육이면 Commerce.
   - 마케팅 AX, 리드, CRM, 랜딩, B2B 컨설팅, 세일즈 파이프라인이면 AX 전환.
2. 해당 브레인의 Index와 Persona를 먼저 읽는다.
   - Commerce: `HowZero Commerce Index.md`, `HowZero Commerce Persona.md`
   - AX: `HowZero AX Index.md`, `HowZero AX Persona.md`
3. 원문을 그대로 요약하지 않는다. 아래 네 가지를 분리해 저장한다.
   - 원문에서 얻은 사실/논리
   - 하우제로 페르소나로 바꿀 메시지
   - 대본/슬라이드/도식에 쓸 구조
   - 금지하거나 조심할 표현
4. 관련 wiki 페이지를 업데이트한다.
5. 필요하면 산출물 파일을 만든다.
   - 대본: `brands/howzero/howzero_script/`
   - Excalidraw: `wiki/*.excalidraw.md`
   - 전략/기획: `docs/strategy/` 또는 관련 wiki 페이지
6. `wiki/index.md`와 `wiki/log.md`를 업데이트한다.

### Commerce 인제스트 변환 규칙

Commerce 자료는 항상 하우제로 커머스 페르소나로 변환한다.

- 대상: 스마트스토어, 쿠팡, 구매대행, 1인 셀러.
- 호칭: 대표님.
- 권위: 셀러 1년 차 월 1억 구조, 데이터 기반 자동화 경험.
- 말투: 직설적이지만 봉사 톤. "대표님이 하던 노가다를 줄여드린다"가 중심.
- 구조: 셀러 고통 → 원인 진단 → 데이터/구조 설명 → 실전 순서 → 리스크 가드 → 불사자/마누태그/상세페이지 자동화 CTA.
- 불사자 연결형 대본은 `wiki/Bulsaja Index.md`의 이론 → 매출/성과 증거 → 프로그램 자동화 → CTA 구조를 따른다.
- 금지: AI 툴 자랑, 상위노출 보장, 외부 코치 비하, 구매대행만 과도하게 좁히기, AX 전환 권위 남발.

Commerce 자료를 인제스트한 뒤 대본을 요청받으면 `Commerce Script Rules.md`, `Commerce Hook Library.md`, 관련 플레이북을 반드시 반영한다.

---

## 5. 분리 원칙

HowZero에는 두 개의 브레인이 있다. 섞지 않는다.

| 축 | 대상 | 목적 |
|---|---|---|
| AX 전환 | 기업 대표, 1인 사업자, 마케팅팀 | 마케팅 병목 진단, 콘텐츠-리드-팔로업-리포팅 자동화 |
| Commerce | 스마트스토어, 쿠팡, 구매대행 셀러 | 상세페이지, 상품등록, 태그, 플랫폼 리스크 자동화 |

커머스 대본에서 AX 권위나 SaaS 10억 메시지를 기본값으로 쓰지 않는다. AX 랜딩/컨설팅 문서에서 불사자, 마누태그, 상품 태그 CTA를 기본값으로 쓰지 않는다.

---

## 6. Excalidraw 규칙

Obsidian Excalidraw 파일은 `.excalidraw.md`로 만든다.

- frontmatter에 `excalidraw-plugin: parsed`를 넣는다.
- `tags`에 `excalidraw`를 포함한다.
- `related`에 관련 wiki 페이지를 연결한다.
- `## Text Elements` 섹션은 비워둔다.
- Drawing JSON의 element id는 8자리 alphanumeric 랜덤 ID를 사용한다.
- 고객용 강의자료는 한 장 맵보다 16:9 슬라이드형 deck을 우선한다.

---

## 7. 지침 파일 규칙

이 폴더의 지침 원본은 `AGENTS.md`다.

`CLAUDE.md`는 Claude Code가 `AGENTS.md`를 반드시 읽게 하는 포인터로만 둔다. 새 규칙은 `CLAUDE.md`에 직접 추가하지 말고 이 파일에 추가한다.
