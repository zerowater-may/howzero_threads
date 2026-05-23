# HowZero Wiki Log

## [2026-05-20] ingest | HowZero initial project brain

- `howzero` 저장소를 Obsidian에서 바로 열 수 있는 vault로 보고 `wiki/` 합성 레이어를 생성했다.
- 원문으로 `AGENTS.md`, `docs/persona-howzero.md`, `docs/persona-howzero-identity.md`, `docs/MARKETING-MASTER-STRATEGY.md`, `docs/howzero-product-lineup-market-research.md`, `docs/brand-messaging-creative-assets.md`, `docs/social-media-positioning.md`, `brands/INDEX.md`, `brands/howzero/INDEX.md`, `pyproject.toml`, `howzero-web/package.json`을 사용했다.
- 생성 페이지: [[HowZero Overview]], [[HowZero Persona]], [[HOWAAA Methodology]], [[HowZero Audience]], [[HowZero Product Lineup]], [[HowZero Content Strategy]], [[HowZero Brand Messaging]], [[HowZero Content Pipeline]], [[HowZero Technical System]], [[HowZero Source Map]], [[HowZero Open Questions]].
- 다음 인제스트 후보: `docs/strategy/`, `docs/marketing/`, `docs/superpowers/specs/`, `docs/superpowers/plans/`, `brands/howzero/howzero_script/`의 대표 샘플.

## [2026-05-20] ingest | HowZero commerce script brain

- 목적: 유튜브 레퍼런스를 받아 하우제로 커머스 대본으로 바꾸기 위한 전용 지식 구조를 만들었다.
- 원문으로 `docs/strategy/2026-05-20-ai-detail-page-section-prompts.md`, `docs/strategy/2026-05-20-s003-pitch-mingun-manutag-automation.md`, `docs/strategy/2026-05-13-howzero-commerce-benchmark.md`, `brands/howzero/howzero_script/S-001-commerce-intro-ai-detail-page.md`, `brands/howzero/howzero_script/S-002-commerce-smartstore-manutag.md`를 사용했다.
- 생성 페이지: [[HowZero Commerce Brain]], [[HowZero Commerce Persona]], [[AI Detail Page Playbook]], [[ManuTag Automation Playbook]], [[Commerce Script Rules]], [[Commerce Hook Library]], [[YouTube Reference Library]], [[YouTube Reference Analysis Template]].
- 핵심 합성: 커머스 톤은 “셀러 노가다 → 데이터 기반 자동화 → 리스크 가드 → 바로 실행”이다. 레퍼런스 영상은 베끼지 않고 훅/구조/빈틈을 뽑아 하우제로식 대본으로 재구성한다.
- 다음 인제스트 후보: S-001/S-002의 `-READ.md`, `-DESIGN.md`, 새 유튜브 레퍼런스 URL, `docs/marketing/2026-05-13-commerce-howzero-seller-analysis.md`.

## [2026-05-20] query | S-002 commerce longform rewrite from wiki

- 요청: wiki 기반으로 S-002 스마트스토어 마누태그 롱폼 대본을 다시 작성.
- 참조 페이지: [[HowZero Commerce Brain]], [[HowZero Commerce Persona]], [[Commerce Script Rules]], [[ManuTag Automation Playbook]], [[Commerce Hook Library]].
- 산출물: `brands/howzero/howzero_script/S-002-commerce-smartstore-manutag-READ-v2.md`.
- 변경 방향: 기존 v1보다 첫 30초 손실 훅을 강화하고, “태그는 많이 넣는 게임이 아니라 정확하게 넣는 게임”이라는 축으로 데이터, 자동화, 어뷰징 경계선을 연결했다.

## [2026-05-20] query | S-002 natural rewrite with web research

- 요청: S-002 대본을 더 자연스럽게 다듬고 웹서칭으로 보강.
- 확인 자료: 네이버 쇼핑파트너 공식블로그 `검색 잘 되는 좋은 상품 DB를 만들기 위한 가이드 공개`, 네이버 쇼핑검색 SEO & 상품정보 제공 가이드 PDF 사본, 네이버 광고주센터 상품명 가이드.
- 산출물: `brands/howzero/howzero_script/S-002-commerce-smartstore-manutag-READ-v3.md`.
- 반영: “태그는 네이버한테 주는 상품 설명”이라는 구어체 프레임으로 바꾸고, 상품정보/태그 제공 필요성 및 무관 키워드·반복·상품정보 어뷰징 리스크를 근거 기반으로 보강했다.

## [2026-05-20] restructure | Split AX HowZero and Commerce HowZero brains

- 요청: AX 전환 HowZero와 커머스 HowZero가 wiki에서 하나로 섞여 있어 다시 분리.
- 생성 페이지: [[HowZero AX Index]], [[HowZero Commerce Index]], [[HowZero AX Brain]], [[HowZero AX Persona]], [[HOWAAA Marketing AX Playbook]], [[AX Offer Map]], [[HowZero AX Content Strategy]].
- 변경 페이지: [[HowZero Overview]], [[HowZero Persona]], [[HowZero Content Strategy]], [[HowZero Product Lineup]], [[HowZero Brand Messaging]], [[HowZero Commerce Brain]], [[HowZero Commerce Persona]], [[HOWAAA Methodology]], [[HowZero Audience]], [[HowZero Source Map]], [[HowZero Open Questions]], `index.md`.
- 핵심 분리: AX 전환은 "마케팅 자동화, 툴 세팅이 아니라 매출 파이프라인"을 중심으로 무료 마케팅 AX 오딧에 수렴한다. 커머스는 "셀러 노가다를 데이터 기반 AI 자동화로 줄인다"를 중심으로 상세페이지, 마누태그, 상품 등록 리스크를 다룬다.

## [2026-05-20] query | S-002 v4 strengthened with product-name/store-name reference

- 요청: 사용자가 제공한 상품명/스토어명/TEMS/랭킹 점수 강의형 전사로 S-002를 더 보완.
- 산출물: `brands/howzero/howzero_script/S-002-commerce-smartstore-manutag-READ-v4.md`.
- 반영: "상품명/스토어명/태그는 마법이 아니라 상품정보 신호"라는 프레임으로 확장하고, 클릭·판매·리뷰·가격·연관도까지 함께 보는 구조를 추가했다.
- 제외: 인기도 작업 권유, 비공개 점수 단정, 위험한 조작성 표현.

## [2026-05-20] query | S-002 v5 rewritten for China buying-agent examples

- 요청: 사과/닭갈비/들기름 같은 일반 예시를 중국구매대행 키워드 예시로 전부 변경하고, "AI 툴 자랑 영상 아닙니다" 같은 진부한 하우제로 문장을 제거.
- 산출물: `brands/howzero/howzero_script/S-002-commerce-smartstore-manutag-READ-v5-china-buying-agent.md`.
- 반영: 타오바오 소싱, 접이식 캠핑의자, 무타공 욕실 선반, 충전식 LED 무드등, 브랜드 로고 휴대폰 케이스, 여행용 압축 파우치 예시로 교체했다.
- 웹 근거: 네이버 광고 상품명 가이드, 네이버 쇼핑검색 SEO & 상품정보 제공 가이드, 관세청/정책브리핑 해외직구 기준, 국가기술표준원/네이버 고객센터 KC·안전기준 안내.

## [2026-05-20] query | S-002 v6 rebuilt around 1k listing fear and Bulsaja semi-auto SEO

- 요청: 후킹을 상품 등록 한도 축소 불안에서 시작하고, 같은 구매대행 상품을 SEO 없이 올린 경우와 SEO 맞춰 반자동 등록한 경우의 차이를 보여주는 구조로 재작성.
- 산출물: `brands/howzero/howzero_script/S-002-commerce-smartstore-manutag-READ-v6-china-seo-bulsaja.md`.
- 반영: 1만개 대량등록에서 1천개 정밀등록으로 바뀌는 공포, 스마트스토어 SEO 이론, `무타공 욕실 코너선반` A/B 비교, 불사자 확장프로그램 CTA.
- 제거: "AI 툴 자랑 영상 아닙니다"류 문장과 사과/닭갈비/들기름 같은 비구매대행 예시.

## [2026-05-20] query | S-002 v6 menuTag and search-recognition update

- 요청: 태그사전, 검색 반영 태그, `menuTag`, 가격비교/단일상품 차이, 상품명과 태그 키워드 분리 기준을 현재 v6 대본에 추가.
- 산출물: 기존 `brands/howzero/howzero_script/S-002-commerce-smartstore-manutag-READ-v6-china-seo-bulsaja.md`를 새 버전 없이 직접 업데이트.
- 반영: 검색 인식영역(카테고리, 상품속성, 태그, 브랜드/제조사), 태그사전 숫자, 직접 입력 태그 미반영 가능성, `menuTag` 확인, 상품명은 메인 키워드·태그는 서브 키워드라는 구조.

## [2026-05-21] ingest | Bulsaja commerce copilot persona

- 요청: 불사자가 어떤 프로그램인지 페르소나를 만든 뒤 제목을 다시 잡는 방향 검토.
- 생성 페이지: [[Bulsaja Commerce Copilot]].
- 핵심 정의: 불사자는 완전 자동 대량등록기가 아니라, 타오바오 상품을 스마트스토어 SEO에 맞게 반자동으로 정리해주는 셀러용 크롬 확장프로그램이다.

## [2026-05-21] decision | Keep Bulsaja out of public title

- 요청: 불사자 이름이 제목에 들어가면 안 될 것 같다는 피드백.
- 반영: [[Bulsaja Commerce Copilot]]과 [[Commerce Hook Library]]에 "불사자는 제목 전면이 아니라 후반 CTA/고정댓글/설명란에서 등장"하도록 가이드 수정.
- 제목 방향: 검색어와 불안은 `타오바오 구매대행`, `스마트스토어 상품명`, `SEO`, `대량등록`, `태그 10칸`으로 잡고, 불사자는 해결 도구로만 연결한다.

## [2026-05-21] update | S-002 product-name structure script and Excalidraw

- 요청: `왜 내 상품은 노출되지 않을까?` 방향으로 기존 S-002 대본을 업데이트하고, 백화점 비유와 흐름을 Excalidraw로 시각화.
- 산출물: `brands/howzero/howzero_script/S-002-commerce-smartstore-manutag-READ-v6-china-seo-bulsaja.md`, [[S-002 Smartstore Product Name Flow.excalidraw]].
- 반영: 상품명이 제일 중요하다는 축으로 재정렬했다. 백화점 비유를 통해 카테고리=층/코너, 상품속성=매대 설명표, 태그=보조 표지판, 브랜드/제조사=판매처 정보, 상품명=큰 간판으로 설명한다.
- 방향: 구매대행만 전면에 놓지 않고 국내위탁, 사입, 해외구매대행 모두에 적용되는 스마트스토어 상품명 구조로 확장했다. 불사자는 후반 CTA에서 반복 작업을 줄이는 확장프로그램으로 연결한다.

## [2026-05-21] update | S-002 intro benchmarked for careless listing sellers

- 요청: 상품을 아무렇게나 등록하고 매출이 나길 기다렸던 초보 셀러를 타겟으로 잡고, 숫자형 제목과 벤치마킹 전개에 맞춰 도입부 변경.
- 산출물: 기존 `brands/howzero/howzero_script/S-002-commerce-smartstore-manutag-READ-v6-china-seo-bulsaja.md` 직접 업데이트.
- 반영: 최종 제목을 `상품 100개 올렸는데 안 팔리는 이유, 상품명 구조가 틀렸습니다`로 변경. 도입부는 "시간과 노력만으로 해결되지 않는다 → 상품 수가 성과를 보장하지 않는다 → 잘하는 셀러는 기본 패시브로 상품명 구조를 본다 → 오늘은 상품명과 키워드부터 깐다" 흐름으로 재작성했다.

## [2026-05-21] create | S-002 lecture Excalidraw board

- 요청: 대본을 보면서 콘텐츠 촬영할 수 있는 Excalidraw 강의자료 생성.
- 산출물: [[S-002 Smartstore Product Name Lecture Board.excalidraw]].
- 구성: 훅/타겟, 상품등록 전 5가지 체크, 오늘 영상의 약속, 네이버쇼핑 백화점 비유, 같은 상품 A/B 비교, 무료 확장프로그램 CTA를 한 장 보드로 정리했다.

## [2026-05-21] create | S-002 PPT-style Excalidraw slide deck

- 요청: 고객과 같이 보면서 설명할 수 있도록 PPT처럼 넘기는 강의자료로 재구성.
- 산출물: [[S-002 Smartstore Product Name Slide Deck.excalidraw]].
- 구성: 16:9 슬라이드 10장. 제목/문제제기, 원인 진단, 잘 파는 셀러 기본값, 상품명의 역할, 백화점 비유, 상품등록 전 5가지 체크, 나쁜 상품명 예시, 좋은 상품명 예시, 확장프로그램 역할, 마무리 CTA 순서다.

## [2026-05-21] governance | AGENTS-first wiki ingest workflow

- 요청: `CLAUDE.md`는 반드시 `AGENTS.md`를 읽게 하고, 모든 지침은 `AGENTS.md` 원본으로 작성. 자료 인제스트 시 하우제로 커머스 페르소나, 구조, 말투로 변환되게 설정.
- 산출물: 루트 `AGENTS.md`/`CLAUDE.md`, `wiki/AGENTS.md`, `wiki/CLAUDE.md`, [[HowZero Ingest Workflow]].
- 반영: "자료 인제스트 기본값" 규칙을 추가했다. 스마트스토어/쿠팡/구매대행/상세페이지/상품명/태그/불사자 자료는 [[HowZero Commerce Index]]와 [[HowZero Commerce Persona]]를 읽고 커머스 말투와 CTA로 재구성한다.

## [2026-05-21] ingest | Bulsaja feature benefit content map

- 요청: firelion의 `BULSAJA-FEATURE-BENEFIT-CONTENT-MAP.md`를 보고 불사자 프로그램을 wiki화하고, 하우제로 커머스가 이론 → 매출/성과 증거 → 프로그램 자동화 → CTA 구조의 대본을 계속 만들 수 있게 인덱스 생성.
- 원문: `/Users/zerowater/Dropbox/zerowater/firelion/bulsaja/bulsaja-issue/marketing/BULSAJA-FEATURE-BENEFIT-CONTENT-MAP.md`.
- 산출물: [[Bulsaja Index]].
- 변경: [[Bulsaja Commerce Copilot]]을 크롬 확장 중심 정의에서 올인원 셀러 솔루션 정의로 확장했다. 소싱/키워드, 상품명/등록 SEO, 이미지/상세페이지, 멀티마켓 등록, 리뷰/상품기획, 운영/성과/광고, 리스크/검수, 조직/교육 축으로 정리했다.
- 추가: firelion `marketing/AGENTS.md`와 `marketing/CLAUDE.md`를 생성해 불사자 마케팅 원문을 하우제로 커머스 위키, 페르소나, 대본 구조로 연결했다.

## [2026-05-22] ingest | BraveYong lecture and content brain setup

- 요청: `/Users/zerowater/Downloads/용팀장_강의_노하우_총정리.md`를 보고 기존 howzero처럼 용팀장 `braveyong` 폴더와 wiki를 세팅.
- 원문 보관: `brands/braveyong/braveyong_misc_lecture-content-knowhow.md`.
- 폴더 세팅: `brands/braveyong/braveyong_script/`, `braveyong_shorts/`, `braveyong_carousel_raw/`, `braveyong_newsletter/`, `braveyong_linkedin/`에 README를 추가했다.
- 생성 페이지: [[BraveYong Index]], [[BraveYong Brain]], [[BraveYong Persona]], [[BraveYong Lecture Playbook]], [[BraveYong Content Pipeline]], [[BraveYong Source Map]], [[BraveYong Open Questions]].
- 변경 페이지: `brands/INDEX.md`, `brands/braveyong/INDEX.md`, `brands/braveyong/braveyong_persona.md`, `wiki/index.md`, [[HowZero Content Pipeline]], [[HowZero Source Map]], [[HowZero Open Questions]].
- 핵심 합성: BraveYong은 하우제로 커머스와 주제는 겹치지만 별도 화자/CTA를 가진다. 중심은 글로벌 위탁판매, 구매대행, 스마트스토어/쿠팡 셀러의 막힘을 SEO, 데이터, 상세페이지, AI 시스템 강의로 바꾸는 것이다.

## [2026-05-23] create | BraveYong AI Selling Bootcamp wiki page

- 요청: 6주 오프라인 AI 셀링 실전반 기획·랜딩 산출물을 braveyong 커리큘럼 제작 부분에 위키로 정리.
- 원문: `docs/superpowers/specs/2026-05-22-braveyong-ai-selling-offline-landing-design.md` (2026-05-22 개정, 오빵 일본 구매대행 펀딩 상세페이지 벤치마크 반영 확장 15블록).
- 구현 산출물: `brands/braveyong/braveyong_landing_ai-selling/index.html` + `README.md` + `CHECKLIST.md` + `assets/landing-desktop.png`, `assets/landing-mobile.png`.
- 생성 페이지: [[BraveYong AI Selling Bootcamp]] — 상품 기본값, 6주 커리큘럼 표, 랜딩 확장 15블록(✚ 신뢰 증거·반론 차단·비교표·소수정예), 톤 가드(차용/금지), 신청서 11문항, 운영 입력 필요 사항, 후속 콘텐츠 시드, 원문/산출물 경로.
- 변경 페이지: [[BraveYong Index]](중심 노트·빠른 탐색에 추가), [[BraveYong Lecture Playbook]](유료 강의 커리큘럼 섹션 + 링크), [[BraveYong Source Map]](유료 강의 산출물 표 추가), `wiki/index.md`(BraveYong 표·빠른 탐색에 추가).
- 핵심 합성: 무료 콘텐츠용 [[BraveYong Lecture Playbook]]과 분리해 유료 6주 오프라인 부트캠프 전용 페이지를 둔다. 오빵 펀딩 상세페이지의 구조(신뢰 증거·반론 차단·비교표·소수정예)는 차용하되, 매출 단정·"리스크 제로"·딸깍 자동화·마감 카운트다운 카피는 [[BraveYong Persona]] 금지 표현과 충돌하므로 절대 차용하지 않는다.

## [2026-05-23] refine | BraveYong AI Selling landing — 손글씨·진정성 액센트 추가

- 요청: 랜딩이 AI스러워 보임. 진정성·손글씨 톤 강화.
- 진단: CSS로 만든 가짜 작업화면 mock(상품명·AI분석·상세기획) 3개가 가장 AI슬롭 느낌. 균일한 카드 보더·그림자·아이콘도 사람 손맛 없음.
- 변경:
  - Hero CSS mock 3개 → 실사진 교체 placeholder(빈 종이질감 + 카메라 아이콘 + "교체 예정" 손글씨 배지). 운영자가 다음 주 용팀장 스크린샷 찍어 교체.
  - 한글 손글씨 폰트 로드: Nanum Pen Script(서명·강조), Gowun Dodum(메모), Gaegu(보조). Google Fonts.
  - 액센트 7곳: Hero 형광펜("효자상품 10개"), Hero 노란 sticky note 메모(용팀장 한마디 + 펜글씨 서명), AI 정의 형광펜("빠르게 반복하는 구조"), 효자상품 손그림 동그라미("10개"), 왜 용팀장 인용 끝 서명, 가격 1기 카드 안 손그림 화살표 메모, 최종 CTA 아래 서명.
  - subtle SVG noise 종이 질감 overlay(opacity .035)로 인쇄물 톤.
  - 본문은 Pretendard 유지 → 가독성과 진정성 양립.
- 검증: Playwright 데스크톱(1280) + 모바일(390)에서 sticky note·photo placeholder·서명·동그라미·화살표 메모 element 캡처로 확인. 콘솔 에러 0.
- 변경 파일: `brands/braveyong/braveyong_landing_ai-selling/index.html`, `README.md`, `CHECKLIST.md`(S 섹션 추가), `assets/landing-desktop.png`·`landing-mobile.png` 갱신.

## [2026-05-23] implement | BraveYong AI Selling Landing v2 (포트폴리오 스타일, Next.js + Vercel 준비)

- 요청: 포트폴리오 zip 템플릿 스타일·코드로 강의 결제 랜딩 v2 제작 + 실제 자료(얼굴, 후기 54장) 매핑 + Vercel 배포 준비.
- 자료: `brands/braveyong/용감한용팀장/` (얼굴 1장 + 채널 배너 1장 + 후기 캡처 54장). 스터디 현장·작업화면 사진은 폴더에 없음 → placeholder 유지.
- 산출물: `brands/braveyong/braveyong_landing_ai-selling-v2-portfolio/` (Next.js 15 + shadcn/ui + Tailwind v4 + Pretendard/Geist/Nanum Pen Script/Gowun Dodum).
- 구조: 18블록 (Hero · STRIP · 신뢰 · 후기 토글+lightbox · 문제 · AI 정의 · 효자상품 · 6주 커리큘럼 Accordion · 운영 · 왜 용팀장 · 졸업 스터디 · 반론 차단 · 비교표 · 가격 · 소수정예 · 신청 구글폼 iframe · FAQ · 최종 CTA) + Footer + 모바일 sticky CTA.
- 톤: 순흑백 모노톤 + 노란 형광펜 1톤 + 손글씨 액센트 6곳. 다크/라이트 토글(next-themes system 기본). 글로벌 SVG noise overlay.
- 결제: 페이지 외부(용팀장 수동 안내). 신청서는 구글폼 iframe. Phase 2 후보 — Toss Payments + 자체 DB(spec에 명시).
- 검증: Playwright 데스크톱(1280) 풀페이지 + 라이트·다크 hero + 후기 그리드 펼침 캡처. 콘솔 에러 0.
- v1(`braveyong_landing_ai-selling/`)은 그대로 보존, v2와 동시 운영 가능.
- 기획서 spec: `docs/superpowers/specs/2026-05-23-braveyong-ai-selling-landing-v2-portfolio-style-design.md`.

## [2026-05-24] ingest | BraveYong persona interview asset

- 요청: 용팀장님 인터뷰 전사를 BraveYong 페르소나 asset으로 wiki화.
- 원문 보관/합성 asset: `brands/braveyong/braveyong_misc_persona-interview-family-seo-seller.md` — 직장인 현금흐름, 육아아빠 생활 장면, 부동산/자산 대비 현금흐름, 대량등록 탈출, 상품명/SEO/효자상품, 시스템화, 강의 과장 경계, 월 1회 스터디를 정리.
- 생성 페이지: [[BraveYong Persona Asset Interview]].
- 변경 페이지: `brands/braveyong/INDEX.md`, `brands/braveyong/braveyong_persona.md`, [[BraveYong Index]], [[BraveYong Brain]], [[BraveYong Persona]], [[BraveYong AI Selling Bootcamp]], [[BraveYong Source Map]], [[BraveYong Open Questions]], `wiki/index.md`.
- 핵심 합성: 용팀장은 단순 고수 셀러가 아니라 직장·육아·현금흐름·SEO 검증·시스템화를 연결하는 생활형 현업 셀러다. 랜딩/대본에서는 큰 수익 숫자보다 등원, 공유오피스, 순위 모니터링, CS 분리, 월 1회 스터디 같은 장면을 신뢰 증거로 우선 사용한다.
- 가드: 전사에 포함된 수익, 매출, 부동산, 직장 관련 숫자는 공개 사용 전 본인 확인과 최신 기준 확인이 필요하다.

## [2026-05-24] storytelling | BraveYong AI Selling Landing v2 — 인터뷰 asset 풀 적용 6사이클

- 요청: 페르소나 인터뷰 asset 기반 스토리텔링·감동 카피로 결제 유도. "1000개 → 1만개", "진짜 팔리는 효자상품 10개", 대기업 직장인 → 부업 스토리. /loop 30분.
- asset 소스: `brands/braveyong/braveyong_misc_persona-interview-family-seo-seller.md`, [[BraveYong Persona Asset Interview]].
- 가드: 매출/부동산 수치 단정 금지, 가격 숫자 노출 금지.
- 6 사이클 누적 결과 (커밋 `ab2b9740 → 42cab22b`):
  - 사이클 1: Hero 임팩트(1만개 strikethrough → 효자상품 10개 형광펜), Origin Story 5단계 타임라인(대기업 직장인 → 부업 → 모니터 받침 효자상품 → SEO·시스템화 → 6주 강의), 왜 용팀장 인터뷰 scene 6개.
  - 사이클 2: 효자상품에 타오바오 모니터 받침 실제 장면, 졸업 "강의 진짜 가치는 졸업 후", 가격 "녹화강의가 아니라 6주 동안 같이" + "쉽게 돈 버는 건 아닙니다 그런데 되는 방향은 맞습니다" 인터뷰 인용, 신청 받습니다/정중히 사양 매트릭스.
  - 사이클 3: 문제 trade-off("1만 개 시간 누가 돌려주나요" / "자는 동안에도 검색되는 효자상품"), 반론 4→6종(SEO 한 줄 공식·하루 1시간 누구나 회의), 커리큘럼 각 주차에 "현장 장면" 워밍 박스, 최종 CTA "자산은 있어도 매월 들어오는 돈은 별도".
  - 사이클 4: 비교표 6→7행(SEO 검증 행 신규, 인터뷰 톤), 소수정예 굴레 호소, FAQ 답변 인터뷰 톤.
  - 사이클 5: **critical fix** — scarcity 카드에 가격 180만원 템플릿 잔존 발견 즉시 수정, sticky/final CTA 라벨 일관성("특별가" 가격 단어 제거), 가격 카드에 결제 정당화 한 줄 "받는 건 6주가 아니라 효자상품 10개와 사람들".
  - 사이클 6: 일관성 grep audit 통과(가격 숫자 0, 톤 충돌 위반 0, CTA 라벨 일관), Footer 인터뷰 클로징 "강의 한 번 듣고 끝나는 시장이 아닙니다. 계속 같이 공부하는 사람이 남습니다."
- 변경 페이지: [[BraveYong AI Selling Bootcamp]](v2 실제 적용 표 + 가격 노출 정책 섹션), `brands/braveyong/braveyong_landing_ai-selling-v2-portfolio/README.md`(19블록 + GlassNav/StickyCTA 반영 + 가격 정책 명시).
- 산출물: 16개 컴포넌트, 5개 검증 캡처, 19블록 구조, 데스크톱·모바일 풀페이지 캡처.
- 핵심 합성: 6 사이클로 인터뷰 asset이 페이지 전 섹션에 자연스럽게 분포됨. "강의를 사세요"가 아니라 "당신의 시간과 가족을 지킬 구조를 같이 만들자"라는 스토리텔링으로 고액 강의 결제를 정당화. 가격은 페이지 어디에도 숫자로 노출되지 않으며, "신청서 검토 후 개별 안내"가 디자인 자체로 선별을 표현한다.
