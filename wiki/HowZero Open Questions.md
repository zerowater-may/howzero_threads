# HowZero Open Questions

## 브랜드/상품

- HOWAAA를 최상위 브랜드로 밀 것인지, 하우제로 개인 브랜드의 하위 방법론으로 둘 것인지.
- AX 전환 HowZero와 Commerce HowZero를 같은 채널 안에서 시리즈로 나눌지, 완전히 별도 채널/랜딩으로 분리할지.
- 두 브레인이 같은 로고/컬러를 공유할지, 커머스에는 별도 보조 아이덴티티를 둘지.
- 무료 AI 오딧의 실제 리포트 형식과 최소 산출물.
- 200만원 자동화 구축 스탠다드의 정확한 포함 범위와 제외 범위.
- 템플릿 팩을 Claude Code 중심으로 계속 가져갈지, Codex/Make/Zapier 버전도 병행할지.

## 콘텐츠

- 유튜브 첫 10개 롱폼 주제의 최종 우선순위.
- 하우제로 본체 콘텐츠와 커머스 셀러 분기의 채널 분리 여부.
- AX 전환 콘텐츠에서 "GPT-3 SaaS 연매출 10억"을 얼마나 전면에 둘지.
- 커머스 콘텐츠에서 불사자/Bulsaja CTA와 하우제로 개인 브랜드를 어떤 비율로 연결할지.
- “SaaS 연매출 10억” 메시지를 어떤 채널에서 얼마나 직접적으로 쓸지.
- 저장소 내 대량 raw 콘텐츠 8,000개 이상을 어떤 기준으로 선별/압축할지.
- S-003 민군 마누태그 영상의 `-READ.md`와 `-DESIGN.md`를 실제 제작 파일로 생성할지.
- 커머스 레퍼런스를 매번 위키에 요약 저장할지, 검증된 레퍼런스만 저장할지.
- 불사자/Bulsaja CTA를 무료 체험, 패널 데모, 오딧 신청 중 어느 것으로 통일할지.

## BraveYong

- BraveYong과 HowZero Commerce를 같은 셀러/커머스 주제 안에서 어떻게 분리할지.
- 용팀장 성과/증거 소재의 공개 가능 범위와 최신 검증 기준.
- BraveYong 콘텐츠에서 불사자/마누태그/하우제로 자동화 CTA를 연결할지 여부.
- `brands/mkt/`에 남아 있는 용팀장 카러셀을 `brands/braveyong/`으로 이동할지 여부.
- BraveYong 전용 키워드/SEO 데이터 소스를 만들지 여부.

## Zipsaja

- (A) 25개 구 dataset이 5개 번들에 재사용됨. 같은 컷 재포장을 어디까지 허용하고 신규 dataset을 언제 다시 뽑을지(양산 vs 데이터 신선도).
- 레거시 1080×1440 / Jua 자산(`.claude/skills/carousel/brands/zipsaja/`, 일부 `zipsaja-design/ui_kits/`)을 언제 1080×1350 / Gmarket Sans로 실제 리렌더할지(문서상 canonical은 확정, 자산 마이그레이션은 미실행).
- zipsaja 실제 게시 여부·성과(저장/도달/댓글) 데이터를 wiki로 누적할지.

> **해소(2026-06-11)**: ① 폰트 충돌 → **Gmarket Sans** canonical(legacy Jua는 표시 처리). ② 게시 규격 → **캐러셀 1080×1350(4:5)·릴스 1080×1920(9:16, 30fps, 30s)** canonical(legacy 1440 표시). ③ E2E "기록 부재" → 실제로는 plan Task 14에 기록 존재. ④ 완성 번들 수 → 실측 **15개**. ⑤ 빈 스캐폴드 3개 삭제, E2E 1개 보존 → pipeline 번들 **16개**. 상세 [[Zipsaja Persona]]·[[Zipsaja Data Findings]]·[[Zipsaja Index]].

## 운영

- Obsidian `wiki/`를 git 추적 대상으로 계속 둘지, 별도 개인 vault로 분리할지.
- `wiki/` 인제스트를 수동 명령으로만 할지, watcher/cron으로 반자동화할지.
- `index.md`만으로 충분한 규모인지, 향후 qmd/검색 스크립트가 필요한지.

## 기술

- `howzero-web` README가 create-next-app 기본 상태라 실제 운영 구조와 불일치한다. 별도 README 업데이트가 필요하다.
- 서버 `/opt/howzero`와 로컬 저장소의 차이를 어떻게 추적할지.
- 콘텐츠 생성/게시 pipeline의 dry-run과 실제 게시 권한을 어떤 UI로 분리할지.

## 관련 페이지

- [[HowZero Overview]]
- [[HowZero Source Map]]
- [[HowZero Product Lineup]]
- [[HowZero Technical System]]
- [[BraveYong Open Questions]]
- [[Zipsaja Index]]
