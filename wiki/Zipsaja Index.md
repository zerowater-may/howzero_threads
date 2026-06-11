# Zipsaja Index

> 집사자(zipsaja) 브랜드 작업 진입점. zipsaja 콘텐츠/데이터/페르소나 작업을 시작하면 이 페이지를 먼저 읽는다.

## 정체성 한 줄

**20–30대 부린이·신혼부부를 위한 부동산/내집마련 큐레이션 인스타그램 브랜드.** 노란 사자(+흰 날개) 마스코트 "집사자"가 **반말 친구 톤**으로 서울 실거래 데이터를 정리해주는 카드뉴스 계정. 이름은 "집 사자(buy a house)" + "집 + 사자(lion)"의 이중 의미.

자체 보유 `proptech_db`(서울 300세대 이상 1,377단지 실거래) 기반이라, 반말이지만 숫자는 정확하다는 것이 신뢰의 핵심이다.

## 브랜드 브레인 페이지

| 페이지 | 요약 |
|---|---|
| [[Zipsaja Persona]] | 반말 친구 톤, 타깃 심리, 시각 아이덴티티(베이지+오렌지/Gmarket Sans/마스코트), 톤 가드 |
| [[Zipsaja Content Playbook]] | 댓글싸움 유도 골격, 후크 공식, 대립축, 감정 아크, 캐러셀·릴스 구조, 파이프라인·게시 |
| [[Zipsaja Data Findings]] | 서울 실거래 인사이트 누적(강남 둔화/동북권 급등, 통계 착시, 첫집 현금격차 등) + data.json schema |

브랜드 분리: zipsaja는 [[HowZero AX Index]](AX 전환)·[[HowZero Commerce Index]](커머스 셀러)·[[BraveYong Index]](셀러 교육)와 **별도 브랜드 브레인**이다. AX SaaS 권위, 불사자/마누태그 CTA, 용팀장 자극형 훅을 zipsaja에 섞지 않는다.

## 자산 인벤토리 (`brands/zipsaja/`)

- **pipeline 번들 16개** — 신규 표준(Remotion v1). 실 완성 **15개**(carousel+reels 산출물 보유) + E2E 테스트 스캐폴드 **1개**(빈 폴더, plan 참조용 보존). 빈 스캐폴드 3개는 2026-06-11 삭제.
- **carousel 10종** — `10y-ago`, `gayang`, `husband-wife`, `jeonse-push-map-20260428`, `jeonse-shortage-20260427`, `salary-300`, `sanggye`, `seoul-10y`, `seoul-avg-24py`, `villa-comeback-20260428`
- **reels 7종** — `gayang`, `husband-wife`, `jeonse-shortage-20260427`, `sanggye`, `seoul-10y`, `seoul-price`, `misc`
- **comments** — `zipsaja_comments_general.xlsx` (인스타 댓글 + 이메일 수집)
- **misc** — `zipsaja_misc_firsthome-rage-research/` (첫집 분노/댓글싸움형 리서치 4종)

## pipeline 번들 지도 (주제 클러스터)

훅 출처: IG 캡션 첫 줄(없으면 threads.txt 또는 slug). 수치 상세는 [[Zipsaja Data Findings]].

**A. 강남 ↔ 동북권/용산광진 지역 격차**
> ⚠️ 이 클러스터의 `강남빼고`·`강남은빠지고`·`용산광진`·`대출은막혔는데` 4개 + E클러스터 `만기폭탄` = **동일 (A) 25개 구 dataset을 공유**(훅만 변경). 독립 데이터 포인트로 세지 말 것. 상세 [[Zipsaja Data Findings]].
- `강남빼고다오른서울집값` — 강남만 -2.5% 빠지고 용산 +18.5%, 서울 평균 +5.3%
- `강남은빠지고용산광진이오른이유` — 같은 dataset, 용산·광진이 오른 이유 앵글
- `용산광진-급등에-첫집-현금격차-5억-벌어짐` — 상·하위 21%p 갭 → 첫집 현금격차 5억
- `대출은-막혔는데-서울은-더-올라버린-구` — 규제에도 실거래 평균 상승

**B. 전세/대출규제 (보증금·후보지 압박)**
- `전세난-때문에-월세로-밀려나는-서울-집값-잡으려면-대출-막아야-하나` — 대출규제 vs 전세공급 찬반
- `전세-살라더니-1년-새-보증금-5천-더-필요해짐` — 24평급 전세 중위 +10%(+5천)
- `전세-보증금-올려줬는데-집값-상승분은-집주인이-가져감` — 세입자 vs 집주인
- `신혼부부-3억-모았는데-대출-규제로-1억-더-필요해짐` — 3억 모았는데 1억 더 필요
- `현금-1억-대출껴도-노도강-가능할까-20260504` — 노도강 후보지가 하나씩 지워짐

**C. 부모찬스/세대·저축 격차 (시작선 싸움)**
- `같은-연봉인데-부모찬스-2억이-인생-난이도를-바꿈` — 연봉 싸움이 아니라 시작금 싸움
- `월-200씩-5년-모았는데-집값-상승분보다-작았다` — 성실히 모아도 더 멀어짐
- `월급-들어오자마자-집주인-자동이체-20260506` — 월급 받자마자 집주인이 먼저

**D. 이재명/정책 기준 시계열 검증**
- `이재명-취임이후-서울집값-상승-20260505` — 취임 이후 기간 기준 동일단지 재분석
- `이재명-대통령-당선후-서울-실거래-E2E-검증` — (빈 폴더) 파이프라인 E2E 스모크 테스트. 출력은 gitignore 처리, 검증 기록은 `docs/superpowers/plans/2026-04-24-pipeline-full-orchestration.md` Task 14. 실콘텐츠 아님.

**E. 만기폭탄/통계 착시 (기회냐 함정이냐)**
- `집주인-1만2천건-만기폭탄-첫집러-기회냐-함정이냐` — 다주택 만기제한 리스크
- `집값-내려갔다고-같은집은-23퍼-올랐다-20260504` — 전체 -15.6% 착시 vs 같은집 +22.9%

## 레거시 시리즈 (개별 carousel ↔ reels 매칭)

- 남편이 강남 전세 고집한 결과 — `husband-wife`
- 10년간 서울 어디가 올랐을까 — `seoul-10y` (강남 11위 반전)
- 서울 24평 평균 — `seoul-avg-24py` ↔ reels `seoul-price`
- 상계동 분석 — `sanggye` / 가양동 분석 — `gayang`
- 10년 예적금 vs 집 — `10y-ago` (1.45억 격차, 릴스 없음)

## 빠른 탐색

- 톤/페르소나: [[Zipsaja Persona]]
- 콘텐츠 구조/후크/댓글싸움: [[Zipsaja Content Playbook]]
- 실거래 수치/인사이트: [[Zipsaja Data Findings]]
- 파이프라인 구조 공통: [[HowZero Content Pipeline]]
- 정리 필요 항목: [[HowZero Open Questions]]

## Sources

- `brands/zipsaja/INDEX.md`
- `brands/zipsaja/zipsaja_pipeline_*/` (16개 번들)
- `brands/zipsaja/zipsaja_misc_firsthome-rage-research/`
- `.claude/skills/zipsaja-design/`, `.claude/skills/carousel/brands/zipsaja/`
- `.claude/skills/zipsaja-*` (brief, data-fetch, storyboard, remotion-render, carousel-render, attachments, captions, package-qa, orchestrator)
- 루트 `AGENTS.md` 8절 (콘텐츠 파이프라인)
