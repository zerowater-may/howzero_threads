# HowZero Wiki Log

## 2026-07-19 · update | howzero AX 자산 분리 — 원 레포 정리 (Task 8)

- 요청: howzero AX 사업 자산이 새 레포 `hedgehogcandy/howzero-ax`로 이전·push 완료. 원 레포에서 이전분 삭제 + 포인터 정리.
- 삭제: `docs/ax-business/`, `ax-web/`, `hz-os/`, AX 전환 브레인 wiki 페이지 8개(`HowZero AX Index/Brain/Content Strategy/Persona`, `HowZero Brand Messaging`, `HowZero Audience`, `AX Offer Map`, `HOWAAA Marketing AX Playbook`), `brands/howzero/howzero_misc_youtube-reference-research/`, `brands/howzero/howzero_misc_positioning-playground/`, AX 관련 misc 3개, AX 관련 spec/plan 문서 14개.
- 보존: `docs/persona-howzero.md`, `docs/persona-howzero-identity.md` (사본 정책 — 원본 잔류).
- 변경 페이지: `wiki/index.md`(AX 전환 브레인 섹션을 이전 안내 문구로 교체, 상단 브랜드 표 비고에 이전 표기), `brands/howzero/INDEX.md`(레거시 아카이브 경고 추가), 루트 `AGENTS.md`(프로젝트 구조 트리에서 `ax-web/` 줄을 분리 안내로 교체), `wiki/log.md`.
- 핵심: 이 vault에는 이제 Commerce 축만 남는다. AX 전환 관련 질문/작업은 새 레포 `hedgehogcandy/howzero-ax`의 `persona/`·`strategy/`·`reference/`를 참조한다.


## 2026-06-11 · update | zipsaja 위키화 충돌 5종 정리

- 요청: 위키화 중 발견한 정리 필요 5종을 "충돌 안 나게" 반영하고, 게시 규격은 최신 릴스 폼을 보고 확정.
- ground truth 수집(실측): 빈 번들 4개 모두 `.DS_Store`만, 완성 번들 실측 **15개**. 캐러셀 PNG 전부 **1080×1350**(1개 번들 raw만 2160×2880=2x 3:4, publish-ready는 1080×1350). 릴스 mp4 전부 **1080×1920·9:16·30fps·30s**(publish 파일 `-audio-mapped-ig-safe.mp4`). zipsaja-design `colors_and_type.css`는 **Gmarket Sans**(로컬 TTF, substitution flag 없음) 확정. E2E 기록은 `docs/superpowers/plans/2026-04-24-pipeline-full-orchestration.md` Task 14에 존재.
- 해소: ① 폰트 → Gmarket Sans canonical(legacy Jua 표시). ② 규격 → 캐러셀 1080×1350·릴스 1080×1920 canonical(legacy 1440 표시). ③ E2E → 기록 부재 아님(plan Task 14). ④ 완성 수 → 15개. ⑤ (A) dataset 5개 번들 재사용은 독립 데이터로 세지 않도록 명시.
- 원천 충돌 차단: `.claude/skills/carousel/brands/zipsaja/README.md` 상단에 superseded 배너 추가(폰트·규격 canonical = zipsaja-design).
- 변경 페이지: [[Zipsaja Persona]](폰트 canonical), [[Zipsaja Index]](완성 15개·dataset 재사용 경고·E2E 재구성), [[Zipsaja Data Findings]](E2E 기록 위치), [[HowZero Open Questions]](해소 항목 정리 + 해소 footnote), `wiki/log.md`.
- 후속(삭제 실행, 2026-06-11): 빈 스캐폴드 3개(`부동산-유튜브-성과-TOP-핫영상`, `강남은-숨고르는데-동북권이-달린다-부린이-찬스`, `강남-끝났나-이재명-1년-동북권이-5배-더-올랐다`) 삭제(모두 untracked·`.DS_Store`만). E2E 스캐폴드 보존(plan 출력 경로). pipeline 번들 19→**16**(완성 15 + E2E 1). 소스 `brands/zipsaja/INDEX.md`에 전체 파이프라인 인벤토리 섹션 + wiki 포인터 + canonical 디자인 규격 추가.
- 잔여 open: legacy 1440/Jua 자산 실제 리렌더 시점, (A) dataset 재사용 정책, 게시 성과 데이터 누적 여부.


## 2026-06-11 · ingest | zipsaja(집사자) 브랜드 브레인 위키화

- 요청: "zipsaja도 다 위키화해줘". 기존엔 [[HowZero Content Pipeline]] 안에 파이프라인 구조 4줄로만 언급됐고 전용 페이지·log 기록이 0건이었다.
- 소스: `brands/zipsaja/INDEX.md`, `zipsaja_pipeline_*`(19개 번들의 data.json·brief·storyboard·captions), `zipsaja_misc_firsthome-rage-research/`(분노형 리서치 4종), `.claude/skills/zipsaja-design/`(SKILL/README/colors_and_type.css/AGENTS), `.claude/skills/carousel/brands/zipsaja/`, `.claude/skills/zipsaja-*`, 루트 `AGENTS.md` 8절. 4개 병렬 서브에이전트로 페르소나·콘텐츠구조·데이터·자산지도 채굴.
- 생성 페이지: [[Zipsaja Index]], [[Zipsaja Persona]], [[Zipsaja Content Playbook]], [[Zipsaja Data Findings]].
- 변경 페이지: `wiki/index.md`(별도 브랜드 브레인 표에 zipsaja 추가 + 빠른 탐색), [[HowZero Open Questions]](Zipsaja 섹션 신설), [[HowZero Content Pipeline]](교차링크), `wiki/log.md`.
- 핵심 합성: zipsaja는 [[BraveYong Index]]처럼 **별도 브랜드 브레인**. 정체성 = 20–30대 부린이·신혼부부 대상 부동산 큐레이션 인스타, 노란 사자 마스코트 "집사자", 반말 친구 톤, 자체 `proptech_db` 실거래 데이터 기반. 콘텐츠 공식 = **댓글싸움형**(공감→데이터 충격→격차 산수→규제 원인→면책→양자택일 질문). 거시 인사이트 = 강남 둔화/동북권 급등, 대출규제에도 상승, 하락장 통계 착시(같은집 +22.9%), 첫집 현금격차 확대, 매수·전세 동시 봉쇄.
- 가드: zipsaja 톤은 [[BraveYong Persona]]의 자극형 훅("끝났다/망한다/90%가 모르는")과 정반대. 존댓말·이모지·그라디언트·2인칭 "당신"·투자 권유·개인 조롱·단정 금지. 분노는 키우되 개인 비난과 단정은 회피.
- 발견/정리 필요: pipeline 19개 중 완성 ~12개(빈 폴더 3 + HyperFrames-only 1), (A) 25개 구 dataset이 5개 번들에 재사용(독립 데이터로 세지 말 것), 폰트 충돌(현행 Gmarket Sans vs 레거시 Jua), E2E 검증 번들 산출물 부재 → 모두 [[HowZero Open Questions]] Zipsaja 섹션에 기록.


## 2026-06-04 · ingest | 백만장자 앤더슨 쿠팡 3가지 리스크 → S-004 하우제로 커머스 대본

- 요청: vidIQ MCP로 `https://youtu.be/ZYbKUUrbatI`를 읽고, 하우제로 커머스 페르소나로 구조 분석·벤치마킹·좌/우 Playground를 제작.
- 소스: vidIQ `vidiq_get_videos_by_ids`, `vidiq_video_transcript`, `vidiq_score_title`(메인 제목 후보 83점).
- 생성 산출물: `brands/howzero/howzero_script/S-004-commerce-coupang-3-loss-holes.md`, `brands/howzero/howzero_misc_coupang-3-loss-holes-playground/index.html`.
- 변경 페이지: [[YouTube Reference Library]], [[Commerce Hook Library]], [[Commerce Script Rules]], `wiki/index.md`, `brands/howzero/INDEX.md`, `wiki/log.md`.
- 핵심 합성: 원본의 “쿠팡 초보가 손해 보는 3가지”를 느슨하게 재해석하지 않고, `미비한 시장 분석 → 전략 없는 광고비 → 상품과 사랑에 빠짐 → 초보 소싱 기준 → 실제 상품 예시 → 프로그램 데모` 순서를 거의 그대로 유지한다. 치환 지점은 앤더슨 팀 프로그램이 아니라 불사자에서 운영하는 신규 `쿠팡스카우터`(쿠팡 상품 화면에서 판매량·조회수·매출·전환율 확인)다.
- 사용자 피드백 반영: 이전 버전의 “하우제로식 기준표/자동화” 중심 해석은 과하게 달랐으므로, 대본과 Playground를 원본 구조·내용 밀착형으로 재작성하고 사용자 제공 스크린샷 2장을 `howzero_misc_coupang-3-loss-holes-playground/assets/`에 반영했다.
- 가드: 수익·노출·순위 보장, AI 만능론, 레퍼런스 제작자 비판 금지. 판매량·조회수·매출·전환율은 판단 보조 데이터로 설명한다.


## 2026-06-02 · ingest | Nate Herk AI Automation AX 레퍼런스

- 요청: `https://www.youtube.com/@nateherk` 채널을 분석해 HowZero wiki에 레퍼런스로 정리.
- 소스: vidIQ MCP `vidiq_channel_stats`, `vidiq_channel_videos`, `vidiq_get_videos_by_ids`; YouTube RSS `UC2ojq-nuP8ceeHqiroeKhBA`; 영상 설명란 공개 링크(Skool, Uppit AI, podcast application).
- 생성 페이지: [[AX Reference Library]], [[Nate Herk Reference]].
- 변경 페이지: [[HowZero AX Index]], [[HowZero AX Content Strategy]], `wiki/index.md`, `wiki/log.md`.
- 핵심 합성: Nate Herk는 `AI 툴 출시 대응 → 실습형 워크플로우 → AI OS → 무료 Skool → 유료 Plus/구축/제휴` 퍼널이 강하다. HowZero는 이 구조를 가져오되 Claude Code 중심 제목을 그대로 쓰지 않고, 대표의 리드, 리포트, 콘텐츠, 제안서, 팔로업 자동화로 번역해야 한다.
- 주의: 투자/트레이딩 자동화 소재는 수익 약속이 아니라 대표 브리핑, 시장 모니터링, 리스크 알림으로 제한한다.

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

## 2026-05-29 · S-003 계절 선점 소싱 대본 기획 (커머스 / 불사자 무료 CTA)

- 작업: 하우제로 커머스 페르소나로 "AI 키워드 소싱 + 계절성" 주제의 유튜브 롱폼(8~12분) 대본 기획서 생성.
- vidIQ MCP 활용: keyword_research(스마트스토어 95.5K, 쿠팡소싱 33.5K, 상품소싱 11.4K / "AI 상품 소싱"·"계절상품" = 검색량 0 확인), score_title(후보 5개 비교 → 84점 1위 선정). outliers/trending은 한국 비즈 니치 semantic 매칭이 약해 keyword 데이터 중심으로 판단.
- 핵심 제약: 무료 키워드 프로그램(= 불사자 AI 키워드 소싱/분석 기능, 1개월 무료 체험)이 영상의 목적. "프로그램 목적 vs 불사자 후반부 등장 원칙" 긴장을 가치선행 하이브리드 + 데모 클라이맥스 + 3중 CTA 배치(예고→데모→CTA)로 해소.
- 산출물: `brands/howzero/howzero_script/S-003-commerce-seasonal-sourcing.md` (7챕터 10분 연출 + vidIQ 근거 + 팩트체크 + 톤 체크리스트).
- 변경 페이지: [[Commerce Hook Library]](S-003 제목/썸네일·검색량 0 학습 추가), `brands/howzero/INDEX.md`(S-002·S-003 표 추가).

## 2026-06-01 · ingest | BraveYong 6/8 무료강의 → 200만원 전환 퍼널

- 작업: 용팀장 무료강의 초안(120분 큐시트, 4단 후크, 200만원 유료 전환 오퍼)을 BraveYong 커머스 브레인에 인제스트.
- 원문 보관: Downloads에만 있던 초안을 `brands/braveyong/braveyong_misc_free-webinar-2026-06-08-funnel-draft.md`로 복사(tracked).
- 생성 페이지: [[BraveYong Free Webinar Funnel]] — 사실(큐시트/매출산식) / 페르소나 변환 멘트 / 4단 후크 구조 / 금지·조심 표현 4분리.
- 변경 페이지: [[BraveYong Index]], `wiki/index.md`(BraveYong 표 + 빠른 탐색), [[BraveYong Open Questions]](6/8 퍼널 섹션 신규).
- 핵심 합성: 초안에 [[BraveYong Persona]] 톤 가드 위반 후보 다수 식별 — 상위노출 보장("등록 순간 1페이지"), 리스크 제로(구매대행 "위험 없음"), 허위 마감/희소성("오늘만 1,000만원 상당"), 검증 안 된 자산·수익 단정(부동산 20채 등), "1,000개 1달"이 효자상품 10개 철학과 충돌. 강의 확정 전 점검 필요로 명시.
- 열린 질문: 6/8 무료강의의 200만원 오퍼가 [[BraveYong AI Selling Bootcamp]](5주 오프라인, 6/13)와 같은 상품인지 별개 온라인/불사자 상품인지 미확정 → 사용자 확인 필요.

## 2026-06-01 · update | BraveYong 6/8 무료강의 = 부트캠프 같은 상품 확정

- 사용자 확인: 6/8 무료강의의 200만원 오퍼는 [[BraveYong AI Selling Bootcamp]]와 **같은 상품**, 무료강의 초안이 최신, 일정은 **6/8**(구 6/13 폐기).
- 변경 페이지: [[BraveYong AI Selling Bootcamp]](역할에 최신 기준 노트 + 운영 기준 표를 6/8 전환 입구·200만원·불사자 풀버전·평생 스터디·평생 VOD로 갱신, 6/13 폐기), [[BraveYong Free Webinar Funnel]](상품 관계 확정 노트 + Open Question 1번 해소), [[BraveYong Open Questions]](퍼널 항목 해소 표시).
- 보존 원칙: 형식(오프라인 5주 vs 온라인 피벗)은 미명시라 기존 오프라인 구조를 삭제하지 않고 무료강의 입구로 연결만 함. 피벗 확정 시 부트캠프 형식 갱신 필요로 남김.

## 2026-06-01 · update | BraveYong 유료강의 형식 = 오프라인 5회만 확정

- 사용자 확인: 200만원 본강의는 **토요일 오프라인 5회(강남/선릉)만**. 오히려 온라인이 없어짐 — 수요일 줌 보강·온라인 VOD 제거.
- 변경 페이지: [[BraveYong AI Selling Bootcamp]](형식 확정 노트 + 구성 행을 오프라인 5회만으로, 최대 차별점에서 평생 VOD 제거), [[BraveYong Free Webinar Funnel]](상품 관계 노트·오퍼 C·Open Question 형식 확정 반영), [[BraveYong Open Questions]](형식 항목 해소), `wiki/index.md`(BraveYong 표 "6주 오프라인"→"토요일 오프라인 5회, 온라인 없음").
- 메모: 무료강의 초안의 "평생 VOD" 당일 혜택은 초안 아이디어로 표시. 실제 상품을 온라인 강의처럼 표현하지 않도록 가드 추가.

## 2026-06-01 · ingest | BraveYong 무료강의 벤치마크 — 빌리브로 임찬 세일즈 웨비나

- 작업: 용팀장 6/8 무료강의 벤치마크용으로 잘된 무료강의→유료전환 웨비나(빌리브로 임찬, 영상 `aXuFaCEkQ58`)를 vidIQ 트랜스크립트로 분석.
- 소스: vidIQ `vidiq_video_transcript`(79K자, 타임스탬프 없음). `vidiq_video_watch`는 영상 길이로 타임아웃 → 트랜스크립트 1차 소스. PPT 원본 `~/Downloads/26_05_28 [유튜브] 무료세마나.key`(슬라이드 ~50, .iwa Snappy-protobuf라 본문 자동추출 보류).
- 생성: `brands/braveyong/braveyong_misc_ref-billiebro-free-webinar/`(SCRIPT.md 정제 대본 + STRUCTURE.md 구조분석 + README.md), `wiki/BraveYong Webinar Benchmark.md`.
- 변경: [[BraveYong Index]], `wiki/index.md`(BraveYong 표 + 빠른 탐색).
- 핵심 합성: 골격 = 권위 선점 → 참여형 고통 공감 → 사례 고조 → 오픈북 본론 실연 → 영웅서사 인간화 → 수강생 라이브 인터뷰 → "Q&A" 빙자 세일즈(72%) → 좌석 카운트다운 클로징. 감정 아크 공감→고조→확신→세일즈→만족. 추정 2~2.5시간.
- 톤 가드 경고: 상위노출 보장 떡밥/가구매 산식, 전액환불·순익 보장, 좌석 카운트다운 허위 긴급성, 거액 가격 앵커는 [[BraveYong Persona]]·[[BraveYong AI Selling Bootcamp]] 금지선과 충돌 → 골격만 차용, 표현은 순화. 변환 타깃은 [[BraveYong Free Webinar Funnel]].
- 다음 단계: 사용자 지시 후 용팀장 포맷(6/8 무료강의, 오프라인 5회 200만원)으로 변환.
