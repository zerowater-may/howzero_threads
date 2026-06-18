# HowZero Commerce Brain

## 역할

하우제로 커머스 브레인은 스마트스토어, 쿠팡, 구매대행, 1인 셀러를 대상으로 한 콘텐츠와 대본을 만들기 위한 합성 페이지다.

목표는 AI 도구 소개가 아니라 셀러가 매일 겪는 노가다를 데이터 기반 자동화로 줄이고, 광고법·어뷰징 리스크까지 막아주는 콘텐츠를 만드는 것이다.

이 브레인은 [[HowZero AX Brain]]과 분리한다. AX 전환 브레인은 기업의 마케팅 병목, 리드 누수, CRM 팔로업, 리포팅 자동화를 다룬다. 커머스 브레인은 셀러의 상품 등록, 상세페이지, 태그, 플랫폼 리스크를 다룬다.

## 한 문장 포지셔닝

셀러 1년 차에 월 1억 구조를 만들어보고, 데이터에 빠져 AI 개발자가 된 후, 셀러를 위한 AI 자동화만 박는 중.

## 핵심 프레임

```txt
셀러 노가다
→ 데이터로 구조 파악
→ 자동화로 시간/비용 압축
→ 리스크 가드
→ 바로 실행할 워크플로우
```

## 인제스트 변환 원칙

외부 자료를 받으면 원문을 그대로 따라 쓰지 않는다. 하우제로 커머스 브레인은 자료를 아래 순서로 변환한다.

```txt
원문 자료
→ 셀러가 겪는 실제 고통으로 번역
→ 하우제로 커머스 페르소나 말투로 재작성
→ 상품명/상세페이지/태그/리스크/자동화 중 어디에 들어갈지 분류
→ 대본, 쇼츠, 슬라이드, Excalidraw 자료로 재구성
→ wiki/log.md에 기록
```

예를 들어 네이버 쇼핑 SEO 강의 자료를 받으면 "강의 요약"으로 저장하지 않는다. `상품을 아무렇게나 올리고 매출을 기다리는 초보 셀러`의 문제로 바꾸고, 상품명 구조, 카테고리, 상품속성, 태그, CTA 흐름으로 재구성한다.

## 커머스 콘텐츠가 지켜야 할 5축

| 축 | 의미 | 대본 적용 |
|---|---|---|
| 봉사 톤 | 셀러를 위에서 가르치지 않고 도와준다 | "대표님, 이거 제가 대신 줄여드릴게요" |
| 안티하이프 | AI 신기함보다 업무 단축을 말한다 | "AI 툴 자랑 영상 아닙니다" |
| 데이터 기반 | 감 대신 수치, 빈도, 전환율, 조회수 | 마누태그 빈도, 전환율 4%→5% |
| 현재진행형 | 완성된 척보다 계속 박는 중 | "셀러 노가다 자동화만 박는 중" |
| 리스크 보호 | 광고법, 식약처, 어뷰징을 같이 짚는다 | "노출 늘리려다 계정 죽이면 끝입니다" |

## 현재 핵심 주제

1. [[AI Detail Page Playbook]]: 상세페이지는 디자인이 아니라 고객 설득 순서다.
2. [[ManuTag Automation Playbook]]: 스마트스토어 태그 10칸을 감이 아니라 데이터로 채운다.
3. [[Commerce Script Rules]]: 커머스 롱폼/쇼츠 대본 작성 규칙.
4. [[Commerce Hook Library]]: 제목, 썸네일, 첫 10초 훅 패턴.
5. [[YouTube Reference Library]]: 외부 유튜브 레퍼런스 분석 저장소.

## AX 브레인과 섞지 말 것

| 커머스에서 피할 것 | 이유 |
|---|---|
| GPT-3 SaaS 연매출 10억을 반복 권위로 사용 | 커머스 페르소나에서는 셀러 출신 권위가 더 직접적 |
| B2B AX 컨설턴트처럼 말하기 | 셀러에게 멀고 위에서 가르치는 느낌이 남 |
| 무료 마케팅 AX 오딧 CTA | 커머스 상품/자동화 CTA와 충돌 |
| 전사 AX, CRM, 리드 파이프라인 중심 설명 | 스마트스토어/쿠팡 셀러 문제와 거리가 있음 |

## 우선 콘텐츠 라인

| 순서 | 주제 | 핵심 약속 |
|---|---|---|
| S-001 | AI 상세페이지 | 상세페이지 2주/30만원을 3분/30원으로 압축 |
| S-002 | 마누태그 | 스마트스토어 태그 10칸을 감이 아니라 데이터로 채움 |
| S-003 | 민군 마누태그 자동화 보충 | 엑셀 12단계 노가다를 1초 자동화로 줄임 |

## 관련 페이지

- [[HowZero Commerce Persona]]
- [[AI Detail Page Playbook]]
- [[ManuTag Automation Playbook]]
- [[Commerce Script Rules]]
- [[Commerce Hook Library]]
- [[YouTube Reference Library]]
- [[HowZero Content Strategy]]
- [[HowZero AX Brain]]

## Sources

- `docs/strategy/2026-05-13-howzero-commerce-benchmark.md`
- `docs/strategy/2026-05-20-ai-detail-page-section-prompts.md`
- `docs/strategy/2026-05-20-s003-pitch-mingun-manutag-automation.md`
- `brands/howzero/howzero_script/S-001-commerce-intro-ai-detail-page.md`
- `brands/howzero/howzero_script/S-002-commerce-smartstore-manutag.md`
