# AX 자동화 컨설팅 사업 — Phase 1 (리서치 & 전략) 설계

- 작성일: 2026-07-08
- 상태: 승인됨 (approach B)
- 범위: **Phase 1 (시장조사 & 전략, .md 산출물)**. Phase 2(랜딩+AI 챗봇+리드 DB)는 별도 스펙.

---

## 1. 배경 & 목표

AI/AX(AI Transformation) 자동화 컨설팅·에이전시 사업을 시작한다. 도메인이 이커머스이므로 **국내 이커머스 셀러·브랜드부터 시작 → SMB → 대기업으로 확장**한다. 향후 5년 기업 자동화 수요 증가를 전제로 한다.

**영업에 내세울 실적(자산):**
- **bulsaja(불사자)** — 4050 이커머스 셀러 AI SaaS, bulsaja.com, 연매출 10억 SaaS 운영 경험
- **hypeduck** — 멀티repo SaaS. `OPENROUTER_API_KEY` + `services/openrouter.js` 보유 (Phase 2 챗봇에 재사용)
- **braveyong(용팀장)** — 이커머스 셀러 교육/랜딩/포트폴리오 자산
- **직원 업무 자동화** 실전 경험
- **howzero-web** — Next.js 16 + React 19 + Tailwind 4 + shadcn + Postgres + BullMQ (Phase 2 랜딩 스택 재사용)

**UI/UX 레퍼런스(Phase 2용):** `ai-team-ax-*.png` = "AI TEAM"(alphabrothers) AX 컨설팅 사이트. 파란 포인트, 큰 한글 헤드라인, "시간 94% 단축" 식 사례집, 문제정의→AX설계→실행→성과측정→유지보수 플로우.

**확정 사항(2026-07-08):** 새 전용 브랜드 네이밍 · monorepo 새 Next.js 앱 · 상담 챗봇+리드 캡처 MVP · Phase 1 먼저.

---

## 2. 접근 방식 — B (2단계 Workflow + 포지셔닝 게이트)

### Stage 1 — 리서치 (Workflow 팬아웃)
차원별 멀티에이전트 병렬 조사. 각 에이전트는 web search + `insane-search`(차단 사이트 크롤링) 사용. 핵심 주장은 **적대적 검증(refute) 다수결** 통과분만 채택.

조사 차원(팬아웃):
1. 해외 AX/자동화 에이전시·컨설팅 벤치마킹 (US/EU/글로벌) — 서비스 구성, 가격모델, 포지셔닝
2. 이커머스 특화 자동화 유스케이스·수요 (해외+국내)
3. 국내 경쟁사(AI팀/alphabrothers 등) + 각사 마케팅 채널·콘텐츠 방식
4. 소구점/pain 시그널 (커뮤니티·리뷰·SNS에서 실제 대표들의 자동화 고민)
5. 콘텐츠·마케팅 벤치마킹 (쓰레드/IG릴스/유튜브 롱폼에서 AX·자동화 크리에이터가 어떻게 하나)

산출: 검증된 사실 + 근거 URL 목록.

### 게이트 (사용자 확정)
조사 요약 + **브랜드 네이밍 후보** + 포지셔닝 1페이지 제시 → 사용자가 방향 확정. 확정 전 Stage 2 합성 시작 안 함.

### Stage 2 — 전략 합성 (Workflow)
확정 포지셔닝을 입력으로 페르소나·타겟·소구점·차별점·세일즈 질문·콘텐츠 전략·사업계획서·1년 로드맵 생성.

---

## 3. 산출물 (전부 `docs/ax-business/`)

| # | 파일 | 내용 | Stage |
|---|---|---|---|
| 00 | `00-overview.md` | Phase 1 인덱스 + 방법론 + 출처 마스터 목록 | 1→2 |
| 01 | `01-market-overseas-ax.md` | 해외 AX/자동화 에이전시 벤치마킹 (크롤링 근거·URL) | 1 |
| 02 | `02-competitors-korea.md` | 국내 경쟁사 + 각사 마케팅 채널·방식 | 1 |
| 03 | `03-brand-naming.md` | 새 브랜드 네이밍 후보 + 도메인/상표 스크리닝 + 추천 | 1(게이트) |
| 04 | `04-persona-founder.md` | 실적 기반 대표 페르소나 | 2 |
| 05 | `05-target-segments.md` | 타겟 세그먼트(1인→대기업, 이커머스 우선) + 세그먼트별 니즈 | 2 |
| 06 | `06-value-prop-소구점.md` | 소구점 분석 | 2 |
| 07 | `07-differentiation.md` | 차별점 (실적·풀스택·실전 운영) | 2 |
| 08 | `08-sales-discovery-questions.md` | 세일즈 질문리스트 (고객 pain/자동화 니즈 발굴) | 2 |
| 09 | `09-content-strategy.md` | 콘텐츠 전략 + 경쟁사 마케팅 벤치마킹 | 2 |
| 10 | `10-business-plan.md` | Asana business-plan 템플릿 구조 기반 사업계획서 | 2 |
| 11 | `11-goals-milestones-1yr.md` | Asana goals-and-milestones 기반 1년 분기별 로드맵 | 2 |

참고 템플릿:
- https://asana.com/ko/templates/business-plan
- https://asana.com/ko/templates/company-goals-and-milestones

---

## 4. 검증 / Definition of Done

- 핵심 사실·수치는 **출처 URL 명시**. 적대적 검증 통과분만 확정. 불확실은 `⚠️ 미확인`으로 표기(날조 금지).
- 각 Stage 종료 시: 산출물 파일 존재 + 내부 링크 무결성 + 출처 목록 채워짐 확인.
- Phase 1은 코드 없음 → "검증" = 근거·출처·내부 일관성.
- 모든 산출물은 한글, 페르소나 톤(직설·데이터 기반·과장 배제)을 따른다.

---

## 5. 범위 밖 (Phase 2 이후)

- 랜딩 페이지 / AI 챗봇 히어로 / 리드 DB 설계 / 로컬 개발
- 실제 광고 집행, 실제 게시
- 브랜드 로고/비주얼 디자인 시스템 (네이밍 확정 후 별도)

---

## 6. 리스크

- 크롤링 차단 → `insane-search` 폴백 체인으로 완화, 그래도 안 되면 `⚠️ 미확인` 표기.
- 조사 광범위 → Workflow 팬아웃 + 차원 분할로 커버, 완결성 크리틱 에이전트로 누락 점검.
- 포지셔닝 오류 상속 → 게이트에서 사용자 확정으로 차단.
