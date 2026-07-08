# 하우제로 AX 사업 Phase 1 — 전략 문서 인덱스

> 사업: 기업의 반복업무를 AI로 자동화하는 AX(AI Transformation) 실행 파트너. 진입 시장은 국내 이커머스 셀러/D2C → SMB → 대기업, 브랜드·메시지는 업종 중립.
> 브랜드명은 **하우제로(HowZero)로 확정**됐고(→ §4), 전 문서 본문에 반영 완료됐다.
> 원칙: 직설·데이터 기반·과장 배제. 모든 수치는 출처 인라인, 검증 실패 항목은 `⚠️ 미확인`, refuted 수치는 인용 금지.

---

## 1. 이 폴더 사용법 — 읽는 순서

| 목적 | 읽는 순서 |
|---|---|
| **전체 파악 (처음)** | 이 문서 → [_research/decisions.md](_research/decisions.md)(확정 결정) → [10-business-plan.md](10-business-plan.md)(사업 전체 요약) → 나머지 |
| **시장·경쟁 근거 확인** | [01](01-market-overseas-ax.md) → [02](02-competitors-korea.md) → [07](07-differentiation.md) |
| **고객·메시지 설계** | [05](05-target-segments.md) → [06](06-value-prop-소구점.md) → [04](04-persona-founder.md) |
| **실행 (영업·콘텐츠)** | [08](08-sales-discovery-questions.md) → [09](09-content-strategy.md) → [11](11-goals-milestones-1yr.md) |
| **수치의 검증 상태 확인** | [_research/stage1-findings.json](_research/stage1-findings.json)(verdict 원본) + [_research/positioning-brief.md](_research/positioning-brief.md)(가설·리스크) |

문서 간 의존 관계: 01·02(리서치 근거) → 04~07(포지셔닝·메시지) → 08·09(실행 도구) → 10·11(계획·목표). 03은 네이밍 발산 이력 보존용이다.

---

## 2. 문서 01~11 한 줄 요약

| # | 문서 | 한 줄 요약 |
|---|---|---|
| 01 | [01-market-overseas-ax.md](01-market-overseas-ax.md) | 해외 AI/AX 시장(CAGR 23~32%)·에이전시 12곳·3층 과금 구조('착수 오딧+빌드 → 리테이너' 하이브리드)·이커머스 자동화 유스케이스 벤치마킹과 시사점 5개 |
| 02 | [02-competitors-korea.md](02-competitors-korea.md) | 국내 경쟁사 14곳 지도(3층 구조), AI팀(알파브라더스) 심층 분석, 채널별 마케팅 방식, 그리고 우리가 파고들 빈자리 5개(정량 사례집·공개 가격·유튜브 빌드·니치 뉴스레터·무료 템플릿) |
| 03 | [03-brand-naming.md](03-brand-naming.md) | 네이밍 3라운드(커머스형 12개 → 업종 중립 6개 → 5관점 발산 50개) 발산·심사 이력 — 최종은 기존 브랜드 하우제로 승계로 확정(§9) |
| 04 | [04-persona-founder.md](04-persona-founder.md) | 창업자 서사("팔기 전에 내가 썼다" — bulsaja 연매출 10억 운영)와 브랜드 페르소나·말투 규칙·금지 표현·신뢰 신호 자산 8개의 단일 원본 |
| 05 | [05-target-segments.md](05-target-segments.md) | 세그먼트 4개(S1 이커머스 셀러 → S2 SMB → S3 중견 → S4 대기업)의 pain·지불의사 가설·접근 채널·우선순위와 5년 확장 경로 |
| 06 | [06-value-prop-소구점.md](06-value-prop-소구점.md) | 대표가 자동화에 돈 내는 이유 5축(시간·인건비·실수 비용·성장 병목·경쟁 불안) × 세그먼트 매트릭스 + 소구점별 카피 뱅크 + 반론 처리 6개 |
| 07 | [07-differentiation.md](07-differentiation.md) | 차별점 5개(자기 회사 먼저 자동화한 운영자·이커머스 도메인 깊이·풀스택·정량 사례집·투명 가격 하이브리드) + 포지셔닝 맵 + 취약점 정직 평가 5개 |
| 08 | [08-sales-discovery-questions.md](08-sales-discovery-questions.md) | 영업 상담용 4단계 진단 프레임(인벤토리→시간/빈도→오류 비용→적합성)과 영역별 딥다이브 질문, 정량화 스크립트, 레드플래그 9개, 클로징 스크립트 |
| 09 | [09-content-strategy.md](09-content-strategy.md) | 4채널(쓰레드·릴스·유튜브·뉴스레터) × 4필러(케이스·내 회사 공개·트렌드 번역·pain 공감) 콘텐츠 전략과 리드 퍼널, 첫 90일 캘린더 |
| 10 | [10-business-plan.md](10-business-plan.md) | Asana 5섹션 구조의 사업계획서 — 오퍼 3단 퍼널, 가격 가설 밴드, SWOT, 1인+AI 에이전트 조직, 재무 시나리오 3개(보수/기본/공격, 전부 가설) |
| 11 | [11-goals-milestones-1yr.md](11-goals-milestones-1yr.md) | 1년(2026.07~2027.06) 목표 G1~G4와 분기별 마일스톤 — 분기마다 검증할 가정과 중단/피벗 기준을 명시 |

---

## 3. 방법론 — 이 문서들이 만들어진 방식

1. **2단계 Workflow + 포지셔닝 게이트** (2026-07-09 확정, 접근 방식 B)
   - **Stage 1 (리서치)**: 5개 차원(해외 에이전시 / 국내 경쟁사 / 셀러 pain 시그널 / 콘텐츠 마케팅 / 이커머스 자동화)을 **에이전트 수십 개 병렬 조사**로 수집 → [_research/stage1-findings.json](_research/stage1-findings.json)(83KB, verdict 포함)에 집적.
   - **게이트**: findings를 근거로 포지셔닝·오퍼 범위·브랜드 전략을 사용자와 확정 → [_research/decisions.md](_research/decisions.md)에 게이트 기록, [_research/positioning-brief.md](_research/positioning-brief.md)에 가설·리스크 정리.
   - **Stage 2 (전략 문서)**: 확정 결정과 검증 통과 findings만으로 01~11 작성.
2. **적대적 검증(verdict)**: 조사된 모든 수치를 원출처로 재검증해 confirmed / corrected / refuted 판정. **refuted 수치는 전 문서에서 인용 금지** — 대표 사례: AI팀 '리서치 94% 단축', Otrium 'CS 65% 완전자동', HelloPrint '70% 자동화·100→28명', '챗봇 티켓 40% 즉시 감소', '풀서비스 리테이너 월 $20K'. 벤더 자기보고 수치는 그 사실을 반드시 명시하고, 미검증 항목은 `⚠️ 미확인`, 검증 전 주장은 **가설**로 표기한다.
3. **가설의 분기 배치**: 남은 핵심 가설(국내 지불의사, 마진 누수 앵글 경쟁 강도, 레드오션 회피)은 방치하지 않고 11 문서의 Q1~Q3에 검증 방법·판정 시점·중단/피벗 기준과 함께 배치했다.

---

## 4. 확정 결정 요약 ([_research/decisions.md](_research/decisions.md) 인용)

| 날짜 | 결정 | 내용 |
|---|---|---|
| 2026-07-08 | 브랜드 전략 | 새 전용 브랜드 (howzero 개인 브랜드 아님 → 이후 07-09에 하우제로 승계로 변경) |
| 2026-07-08 | 코드 위치 | 이 monorepo에 새 Next.js 앱 (Phase 2) |
| 2026-07-08 | 챗봇 MVP | 상담 어시스턴트 + 리드 캡처 (RAG/스코어링은 이후) |
| 2026-07-08 | 진행 순서 | Phase 1(리서치·전략) → Phase 2(랜딩·제품) |
| 2026-07-09 | 접근 방식 | B: 2단계 Workflow + 포지셔닝 게이트 |
| 2026-07-09 | **초기 오퍼** | **반복업무 전반 AX**(진단→설계→구축→운영, AI팀 스타일). CS·반품·재고 '마진 누수' 앵글은 이커머스 세그먼트용 서브 오퍼 |
| 2026-07-09 | **브랜드명** | **하우제로(HowZero) 확정** — 3라운드 발산 끝에 기존 브랜드 승계. 문서의 `하우제로` 토큰은 하우제로로 일괄 치환 예정 |

확정 포지셔닝 문안: **"기업의 반복업무를 AI로 자동화하는 AX 실행 파트너 — 내 회사(연매출 10억 SaaS)를 먼저 자동화해본 실전 운영자."**

---

## 5. 미결 사항

| # | 항목 | 상태 | 다음 액션 |
|---|---|---|---|
| 1 | ~~브랜드 토큰 치환~~ | ✅ 완료 (2026-07-09) — 전 문서 하우제로 반영 | AX 서비스용 서브도메인/경로(예: /ax) 전략은 Phase 2에서 결정 (03 §9) |
| 2 | **국내 지불의사 검증** | 착수 300~700만·리테이너 월 50~150만(셀러) 밴드는 해외 벤치마크 기반 가설, 국내 실측 0건 | Q1 파일럿 5개사 인터뷰 → Q3 유료 계약 4건+리테이너 2건으로 판정 (11 문서 리스크 1) |
| 3 | **마진 누수 앵글 경쟁 강도** | 근거 다수가 Reddit 익명 증언·벤더 자기보고. 국내는 채널톡·사이드톡 기진입 | Q1 파일럿 pain 인터뷰 + Q2 앵글별 콘텐츠 반응 비교 (리스크 2) |
| 4 | **레드오션(상품등록) 재진입 위험** | 창업자 자산(bulsaja)이 상품등록 쪽이라 관성 위험 | Q1 파일럿에서 구축 계약으로 이어지는 업무 유형 기록 (리스크 3) |
| 5 | **공개 가격 정책** | '가격을 숨기지 않는다'는 현재 **지향**이지 확정 정책 아님 (04 §4-7) | Q1 랜딩에 게시 후 파일럿 반응으로 v1 확정 (Q3) |
| 6 | **도메인·상표 수동 확인** | 03 문서의 도메인·상표 판단은 전부 추정 | 기존 하우제로 도메인 사용으로 대부분 해소, 잔여분은 03 §6 체크리스트 |
| 7 | **내부 실적 수치화** | bulsaja·직원 자동화의 before/after 실측치가 아직 문서화 전 — 산출 전까지 마케팅에 구체 수치 사용 금지 (07 §2-4) | 사례 0호 문서화 (Q1, 2026-08-31 기한) |
| 8 | **소상공인 AI 지원 예산** | 2026 예산이 고객응대·재고·마케팅 자동화를 명시한다는 노트만 있고 원출처 URL 미확보 ⚠️ | 인용 전 공고 원문 재확인 (Q4 SMB 확장 전) |

---

## 6. 출처 마스터 목록 (중복 제거)

### 시장 규모·가격 벤치마크
- https://www.futuremarketinsights.com/reports/ai-consulting-services-market — AI 컨설팅 시장 2025 $11.07B → 2035 $90.99B, CAGR 23.4% (01·05·06·10)
- https://finance.yahoo.com/news/ai-consulting-support-services-market-090300922.html — GIA 기준 CAGR 31.6% (01·09·10)
- https://digitalagencynetwork.com/ai-agency-pricing/ — 시급·프로젝트·리테이너 벤치마크 (01·05·06·07·08·10·11)
- https://taskip.net/ai-automation-agency-pricing/ — 착수 빌드 $1,500~5,000 (01·05·06·07·09·10·11)

### 이커머스 자동화 정량 앵커
- https://www.klaviyo.com/products/email-marketing/benchmarks — 자동 플로우: 발송 5.3%로 이메일 매출 41% (01·04·05·06·07·08·09·10)
- https://www.klaviyo.com/blog/abandoned-cart-benchmarks — 장바구니 이탈 복구 수신자당 $3.65 (01·06·08·09·10)
- https://yuma.ai/ — 동일 솔루션 고객사별 자동해결률 편차 40%p+ (01·04·06·07·08·09·10·11)
- https://temporal.io/resources/case-studies/gorgias-uses-ai-agents-to-improve-customer-service — Gorgias 반복 지원 최대 60% 자동화(벤더 수치) (01·07·10)

### 셀러 pain 시그널 (1차 증언)
- https://www.reddit.com/r/ecommerce/comments/1r3bsx3/has_anyone_managed_to_reduce_customer_support/ — CS=3번째 비용, 티켓당 8~12분, 반품 왕복 최고가 티켓 (04~10)
- https://www.reddit.com/r/ecommerce/comments/1jxk63w/what_are_your_biggest_repetitive_challenges_in/ — 재고 동기화·멀티채널 등록 pain (05·06·07·08·09·10)
- https://sidetalk.kr/blog/17043 — '직원 채용 전 FAQ 20개부터' (05)
- https://www.threads.com/@kimtbot/post/DSjhvydEUHo/ — bulsaja 셀러 커뮤니티 언급 (04·07)

### 국내 경쟁사 (직접 검증)
- https://ai-team.kr/ · https://www.alphabrothers.co.kr/ · https://www.alphabrothers.co.kr/business — AI팀(알파브라더스) (02·07)
- https://www.ax-con.com/ — AX-Consulting (02·05·07)
- https://axpartner.co.kr/ — AX PARTNER (02·05·06)
- https://databridge.co.kr/services.html — DataBridge (02·05)
- https://n8nkorea.co.kr/ · https://n8n.io/ — n8n Korea (02·06)
- https://nextgenai.kr/ — 넥스트젠AI (02·05·06)
- https://leviosa.ai.kr/ — 레비오사 AI (02·05·07)
- https://dalpha.so/ — 달파 (02·07)
- https://jocodingax.ai/ — 조코딩 AX 파트너스 (02·06·09)

### 국내 경쟁사 (재검증 실패 — medium~low)
- https://wrtnax.io/ (원문 403, 보도자료 기반) · https://www.ideakey.co.kr/ — (02·07)
- https://www.skax.co.kr/ax-services/ax-consulting · https://fastcampus.co.kr/biz_online_n8n · https://kmong.com/gig/723021 — (02·05)

### 해외 에이전시 12곳 (01 문서 표)
- https://www.axeautomation.co/ai-automation-agency · https://automationagency.com/pricing · https://markovate.com · https://hatchworks.com · https://smartsites.com · https://botsify.com · https://latenode.com · https://sigmoidal.io · https://www.e2msolutions.com · https://agent.nexus · https://www.accenture.com · https://www.deloitte.com

### 해외 콘텐츠 마케팅 벤치마크
- https://nicksaraev.com/ · https://nicksaraevskool.com/ — Nick Saraev / LeftClick / Maker School (02·04·07·09·10)
- https://www.youtube.com/@nateherk · https://www.nateherk.com/about · https://communityhunter.com/reviews/ai-automation-society-nate-herk/ — Nate Herk 무료→유료 Skool 퍼널 (02·09)
- https://www.youtube.com/@LiamOttley · https://automationatlas.io/creators/liam-ottley/ — Liam Ottley / AAA 모델 (02·09)
- https://www.atakinteractive.com/blog/17-ai-youtubers-were-actually-watching-right-now — practitioner 크리덴셜 프레임 (02·04·07·09·10)
- https://news.bensbites.com/ — 니치 밀집 뉴스레터 모델 (02·09·10)
- https://www.readless.app/blog/best-ai-newsletters-to-subscribe — (02)

### 문서 구조 템플릿
- https://asana.com/ko/templates/business-plan — 10 문서 5섹션 구조
- https://asana.com/ko/templates/company-goals-and-milestones — 11 문서 목표·마일스톤 구조

### 내부 근거
- [_research/decisions.md](_research/decisions.md) — 확정 결정(게이트 기록)
- [_research/positioning-brief.md](_research/positioning-brief.md) — 포지셔닝 가설·리스크 3개
- [_research/stage1-findings.json](_research/stage1-findings.json) — Stage 1 병렬 조사 findings + 검증 verdict 원본
- [_research/asana-template-structures.md](_research/asana-template-structures.md) — 템플릿 구조 노트
