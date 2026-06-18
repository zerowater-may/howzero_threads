# HowZero Ingest Workflow

## 목적

사용자가 자료, 유튜브 전사, 기사, 이미지, 강의 노트, 경쟁 영상, 아이디어를 인제스트해달라고 하면 단순 요약하지 않는다. 자료를 HowZero의 AX 또는 Commerce 브레인에 맞게 변환해 다음 콘텐츠 제작에 바로 쓸 수 있게 만든다.

## 1. 라우팅

먼저 자료가 어느 브레인에 들어갈지 판단한다.

| 자료 성격 | 사용할 브레인 |
|---|---|
| 스마트스토어, 쿠팡, 구매대행, 상세페이지, 상품명, 태그, 마누태그, 불사자, 셀러 교육 | [[HowZero Commerce Index]] |
| 마케팅 AX, 리드, CRM, 랜딩, B2B 컨설팅, 세일즈 파이프라인, 조직 자동화 | [[HowZero AX Index]] |
| 브랜드 공통 톤, 전체 전략, 제품 라인업 | [[HowZero Overview]] |

애매하면 원문을 읽고 대상 고객이 셀러인지 기업/마케팅팀인지 먼저 확정한다.

## 2. Commerce 인제스트

Commerce 자료는 반드시 [[HowZero Commerce Persona]]로 변환한다.

기본 변환:

```txt
원문 자료
→ 셀러가 겪는 실제 고통으로 번역
→ 하우제로 커머스 말투로 재작성
→ 상품명/상세페이지/태그/리스크/자동화 중 어디에 들어갈지 분류
→ 대본, 쇼츠, 슬라이드, Excalidraw 자료로 재구성
→ wiki/log.md에 기록
```

반영 기준:

- 호칭은 `대표님`.
- 권위는 셀러 1년 차 월 1억 구조와 데이터 기반 자동화 경험.
- 말투는 직설적이지만 봉사 톤.
- 구조는 셀러 고통 → 원인 진단 → 데이터/구조 설명 → 실전 순서 → 리스크 가드 → 자동화 CTA.
- CTA는 불사자, 마누태그, 상세페이지 자동화 중 하나로 연결한다.
- 불사자는 제목 전면보다 후반부 CTA, 고정댓글, 설명란에 배치한다.

금지:

- AI 툴 자랑.
- 상위노출 보장.
- 외부 코치 비하.
- 구매대행만 과도하게 좁히기.
- AX 전환 권위 남발.

## 3. 산출물 결정

자료를 인제스트한 뒤 사용자의 요청에 따라 산출물을 만든다.

| 요청 | 산출물 |
|---|---|
| 대본 | `brands/howzero/howzero_script/` |
| 쇼츠 | `brands/howzero/howzero_shorts/` |
| 고객용 강의자료 | `wiki/*.excalidraw.md` 16:9 slide deck |
| 촬영용 맵 | `wiki/*.excalidraw.md` lecture board |
| 전략 정리 | 관련 wiki 페이지 또는 `docs/strategy/` |

## 4. 업데이트 대상

인제스트 후 보통 아래를 갱신한다.

- 관련 플레이북
- [[Commerce Hook Library]]
- [[Commerce Script Rules]]
- [[YouTube Reference Library]]
- [[HowZero Commerce Index]]
- [[HowZero Source Map]]
- [[log]]

## 관련 페이지

- [[HowZero Commerce Index]]
- [[HowZero Commerce Persona]]
- [[HowZero AX Index]]
- [[HowZero AX Persona]]
- [[Commerce Script Rules]]
- [[Commerce Hook Library]]
