# zipsaja — 내집마련 큐레이션 (인스타 캐러셀 + 릴스)

> 20-30대 첫집 구매자 대상. 반말 친구 톤. 베이지 + 오렌지 zipsaja 프리셋.
>
> 📚 브랜드 브레인(wiki 합성): [[Zipsaja Index]] · [[Zipsaja Persona]] · [[Zipsaja Content Playbook]] · [[Zipsaja Data Findings]]
> 🎨 canonical 디자인 시스템: `.claude/skills/zipsaja-design/` — 폰트 **Gmarket Sans**+Gaegu, 게시 규격 **캐러셀 1080×1350(4:5)·릴스 1080×1920(9:16, 30fps, 30s)**. legacy 1080×1440/Jua는 마이그레이션 대상.

## 🎬 시리즈별 자료

| 주제 | 카러셀 | 릴스 | 비고 |
|---|---|---|---|
| **남편이 강남 전세 고집한 결과** | [husband-wife](./zipsaja_carousel_husband-wife/) | [husband-wife](./zipsaja_reels_husband-wife/) (full 30s, raw) | 부부갈등, 댓글 싸움 유도 |
| **10년간 서울 어디가 올랐을까** | [seoul-10y](./zipsaja_carousel_seoul-10y/) | [seoul-10y](./zipsaja_reels_seoul-10y/) (full 30s, 22s, raw) | 강남 11위 반전 |
| **서울 24평 평균** | [seoul-avg-24py](./zipsaja_carousel_seoul-avg-24py/) | [seoul-price](./zipsaja_reels_seoul-price/) (main, 22s, v2, v3, check) | 25개 구 평균 |
| **전세난 때문에 월세로 밀려나는 서울** | [pipeline bundle](./zipsaja_pipeline_전세난-때문에-월세로-밀려나는-서울-집값-잡으려면-대출-막아야-하나/carousel/) | [Remotion reel](./zipsaja_pipeline_전세난-때문에-월세로-밀려나는-서울-집값-잡으려면-대출-막아야-하나/reels/) | 대출규제 vs 전세공급 댓글 싸움 |
| **전세 살라더니 1년 새 보증금 5천 더 필요해짐** | [pipeline bundle](./zipsaja_pipeline_전세-살라더니-1년-새-보증금-5천-더-필요해짐/carousel/) | [Remotion reel](./zipsaja_pipeline_전세-살라더니-1년-새-보증금-5천-더-필요해짐/reels/) | 전년 동기 전세 실거래 상승률 댓글 싸움 |
| **신혼부부 3억 모았는데 대출 규제로 1억 더 필요해짐** | [pipeline bundle](./zipsaja_pipeline_신혼부부-3억-모았는데-대출-규제로-1억-더-필요해짐/carousel/) | [Remotion reel](./zipsaja_pipeline_신혼부부-3억-모았는데-대출-규제로-1억-더-필요해짐/reels/) | 신혼부부 대출규제 댓글 싸움 |
| **같은 연봉인데 부모찬스 2억이 인생 난이도를 바꿈** | [pipeline bundle](./zipsaja_pipeline_같은-연봉인데-부모찬스-2억이-인생-난이도를-바꿈/carousel/) | [Remotion reel](./zipsaja_pipeline_같은-연봉인데-부모찬스-2억이-인생-난이도를-바꿈/reels/) | 부모찬스 vs 시작선 댓글 싸움 |
| **전세 보증금 올려줬는데 집값 상승분은 집주인이 가져감** | [pipeline bundle](./zipsaja_pipeline_전세-보증금-올려줬는데-집값-상승분은-집주인이-가져감/carousel/) | [Remotion reel](./zipsaja_pipeline_전세-보증금-올려줬는데-집값-상승분은-집주인이-가져감/reels/) | 전세 안정 vs 기회비용 |
| **월 200씩 5년 모았는데 집값 상승분보다 작았다** | [pipeline bundle](./zipsaja_pipeline_월-200씩-5년-모았는데-집값-상승분보다-작았다/carousel/) | [Remotion reel](./zipsaja_pipeline_월-200씩-5년-모았는데-집값-상승분보다-작았다/reels/) | 저축 속도 vs 집값 속도 |
| **상계동 분석** | [sanggye](./zipsaja_carousel_sanggye/) | [sanggye](./zipsaja_reels_sanggye/) (main) | — |
| **가양동 분석** | [gayang](./zipsaja_carousel_gayang/) | [gayang](./zipsaja_reels_gayang/) (main) | — |
| **10년 예적금 vs 집** | [10y-ago](./zipsaja_carousel_10y-ago/) | — | 1.45억 격차 |

## 🏗 파이프라인 번들 (전체 19개)

신규 표준(zipsaja-remotion-v1). 위 "시리즈별 자료"는 매칭 시리즈 위주 view이고, 아래가 전체 인벤토리다. 실 완성 **18개** + E2E 테스트 스캐폴드 **1개**. 주제 클러스터·수치 합성은 [[Zipsaja Index]] / [[Zipsaja Data Findings]].

**A. 강남↔동북권/용산광진 지역 격차** — ⚠️ 아래 4개 + E클러스터 `만기폭탄` = 동일 (A) 25개 구 dataset 공유(훅만 변경)
- [강남빼고다오른서울집값](./zipsaja_pipeline_강남빼고다오른서울집값/) · [강남은빠지고용산광진이오른이유](./zipsaja_pipeline_강남은빠지고용산광진이오른이유/) · [용산광진-급등에-첫집-현금격차-5억-벌어짐](./zipsaja_pipeline_용산광진-급등에-첫집-현금격차-5억-벌어짐/) · [대출은-막혔는데-서울은-더-올라버린-구](./zipsaja_pipeline_대출은-막혔는데-서울은-더-올라버린-구/)

**B. 전세/대출규제**
- [전세난-때문에-월세로-밀려나는-서울…](./zipsaja_pipeline_전세난-때문에-월세로-밀려나는-서울-집값-잡으려면-대출-막아야-하나/) · [전세-살라더니-1년-새-보증금-5천-더…](./zipsaja_pipeline_전세-살라더니-1년-새-보증금-5천-더-필요해짐/) · [전세-보증금-올려줬는데-집값-상승분은-집주인이-가져감](./zipsaja_pipeline_전세-보증금-올려줬는데-집값-상승분은-집주인이-가져감/) · [신혼부부-3억-모았는데-대출-규제로-1억-더-필요해짐](./zipsaja_pipeline_신혼부부-3억-모았는데-대출-규제로-1억-더-필요해짐/) · [현금-1억-대출껴도-노도강-가능할까](./zipsaja_pipeline_현금-1억-대출껴도-노도강-가능할까-20260504/)

**C. 부모찬스/세대·저축 격차**
- [같은-연봉인데-부모찬스-2억이-인생-난이도를-바꿈](./zipsaja_pipeline_같은-연봉인데-부모찬스-2억이-인생-난이도를-바꿈/) · [월-200씩-5년-모았는데-집값-상승분보다-작았다](./zipsaja_pipeline_월-200씩-5년-모았는데-집값-상승분보다-작았다/) · [월급-들어오자마자-집주인-자동이체](./zipsaja_pipeline_월급-들어오자마자-집주인-자동이체-20260506/)

**D. 이재명/정책 시계열**
- [이재명-취임이후-서울집값-상승](./zipsaja_pipeline_이재명-취임이후-서울집값-상승-20260505/)

**E. 만기폭탄/통계 착시**
- [집주인-1만2천건-만기폭탄-첫집러-기회냐-함정이냐](./zipsaja_pipeline_집주인-1만2천건-만기폭탄-첫집러-기회냐-함정이냐/) · [집값-내려갔다고-같은집은-23퍼-올랐다](./zipsaja_pipeline_집값-내려갔다고-같은집은-23퍼-올랐다-20260504/)

**F. 신축 vs 구축 / 예산 트레이드오프**
- [5억-서울-신축은-단-4곳-나머지는-다-구축](./zipsaja_pipeline_5억-서울-신축은-단-4곳-나머지는-다-구축/) — 🟢 **게시완료(2026-06-11)** IG carousel `6a2a2d03893fa31c7d85ef27` · Threads [DZbkp9siD2-](https://www.threads.com/@zipsaja_/post/DZbkp9siD2-). 5억대 매매 2,115건 중 신축 0.8%(4곳), 결국 구축. 영끌 신축 vs 구축 입성 댓글싸움

**G. 반도체 셔세권 / 직군 타겟 (네이버 실거래)**
- [하이닉스-성과급-11억-셔세권-vs-이천본진-4억](./zipsaja_pipeline_하이닉스-성과급-11억-셔세권-vs-이천본진-4억/) — 🟢 **게시완료(2026-06-11)** IG [릴스](https://www.instagram.com/reel/DZce_gska_t/)·[캐러셀](https://www.instagram.com/p/DZcfMMdl-ko/) · [Threads](https://www.threads.com/@zipsaja_/post/DZcfYR_Dhxm). 성과급 11억으로 동탄역 국평(14.7억)도 못 가는데 하이닉스 본진 이천은 4.1억. 셔세권 프리미엄 vs 본진 가성비 + 반도체 직군 태그 유도. **경기 데이터는 proptech에 없어 네이버 실거래 스크래핑으로 수집**

**H. 정권별 비교 / 시계열 (proptech 실거래 매칭)**
- [역대정부-취임1년-서울집값-실거래-문재인1위-윤석열꼴찌](./zipsaja_pipeline_역대정부-취임1년-서울집값-실거래-문재인1위-윤석열꼴찌/) — 🟢 **게시완료(2026-06-11)** IG [릴스](https://www.instagram.com/reel/DZci2TTDCFX/)·[캐러셀](https://www.instagram.com/p/DZcjCsnjlIZ/) · [Threads](https://www.threads.com/@zipsaja_/post/DZcjQhMiId5). 역대 대통령 취임 1년 서울 아파트 변동률(동일단지·평형 매칭): 문재인 +16.9%(1위)·이재명 +14.8%·윤석열 -17.1%(꼴찌). 노무현은 데이터 2006~라 제외. 정권 부동산 책임론 댓글싸움. 릴스 = 막대그래프 데이터 영상

**테스트** — [이재명-대통령-당선후-서울-실거래-E2E-검증](./zipsaja_pipeline_이재명-대통령-당선후-서울-실거래-E2E-검증/) (E2E 스모크 테스트 출력 경로, 빈 폴더 보존. 기록: `docs/superpowers/plans/2026-04-24-pipeline-full-orchestration.md` Task 14)

> 2026-06-11: 빈 스캐폴드 3개(`부동산-유튜브-성과-TOP-핫영상`, `강남은-숨고르는데-동북권이-달린다-부린이-찬스`, `강남-끝났나-이재명-1년-동북권이-5배-더-올랐다`) 삭제.

## 🗨 댓글 자료

- [zipsaja_comments_general.xlsx](./zipsaja_comments_general.xlsx) — 인스타 댓글 + 이메일 수집

## 🧪 잡종

- [zipsaja_misc_firsthome-rage-research/](./zipsaja_misc_firsthome-rage-research/) — 서울 첫집 분노/댓글싸움형 리서치 4종
- [zipsaja_reels_misc/](./zipsaja_reels_misc/) — 1080x1920 변형, smoke test, header check, slide1 cover demo 등

## 📌 브랜드 톤

- **타깃**: 신혼/첫집 구매 20-30대
- **톤**: 반말, 친구처럼, 데이터 기반 직설
- **금지**: 과장, 투자 권유, 미혼 무주택 비하
- **CTA 패턴**: "댓글로 알려줘 / DM 보내봐 / 저장해두고 다시 봐"
