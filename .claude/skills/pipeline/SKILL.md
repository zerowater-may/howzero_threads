---
name: pipeline
description: 브랜드 선택 + 주제 입력 → 데이터 수집 (zipsaja만) + pipeline-state.json 생성. content-* 산출물 스킬들의 기반 스킬. 트리거 — `/pipeline`, "파이프라인 돌려", "콘텐츠 생성 시작".
---

# Brand Content Pipeline 마스터 스킬

`/pipeline <brand> <주제>` 진입점. Phase 1 MVP는 zipsaja용 데이터 수집 + 번들 폴더 초기화까지만 수행. 캐러셀·릴스·첨부자료·캡션은 Plan 2+의 content-* 스킬이 같은 번들에 추가로 기록.

## 지원 브랜드

| 브랜드 | 데이터 소스 | 상태 |
|---|---|---|
| zipsaja | SSH hh-worker-2 → proptech_db (real_prices × complexes) | ✅ MVP 지원 |
| howzero | 없음 (주제 텍스트만, 향후 추가) | ⏳ Plan 2+ |
| braveyong | 없음 (주제 텍스트만, 향후 추가) | ⏳ Plan 2+ |

## 사용

```bash
# zipsaja (데이터 자동 페치)
python3 -m scripts.pipeline zipsaja 이재명 당선후 서울 실거래 변화

# howzero/braveyong (데이터 없이 state만 초기화)
python3 -m scripts.pipeline howzero 1인 기업가 시간관리
```

### 옵션

- `--preset <name>` — SQL 프리셋. MVP는 `leejaemyung-before-after` 하나. (default)
- `--pivot-date YYYY-MM-DD` — 프리셋의 기준 날짜 오버라이드.
- `--min-total-units N` — 단지 최소 세대수 (default 300).

## 산출물

```
brands/{brand}/{brand}_pipeline_{slug}/
├── pipeline-state.json   # 상태 + 메타데이터 + data 블록
└── data.json             # zipsaja: 25개 구 dataset (Plan 2 캐러셀이 소비)
```

- `slug`는 주제에서 자동 추출 (공백 → 하이픈, 특수문자 제거, 한글 유지).
- `pipeline-state.json` 은 PipelineState dataclass 직렬화. 실패 시 `status="failed"` + `failed_at` 필드로 재개 가능.

## 환경 변수

- `PG_PASSWORD` — proptech_db 비밀번호. `.env` 파일 없이 쓸 경우 필수.

비밀번호 획득:
```bash
ssh hh-worker-2 'grep DATABASE_URL /opt/proptech/.env'
```

## 제한 사항 (Plan 1)

- ❌ 캐러셀 생성 — Plan 2에서 `content-carousel` 스킬 추가
- ❌ 릴스 mp4 — Plan 3에서 `content-reels`
- ❌ Excel/PDF — Plan 4에서 `content-attachments`
- ❌ 캡션 (IG/Threads/LinkedIn) — Plan 5에서 `content-captions`

Plan 1의 MVP는 **데이터 확보 + 번들 폴더 초기화**까지. 이후 plan들이 같은 번들에 산출물을 덧붙이는 구조.

## 트러블슈팅

| 증상 | 원인 | 대처 |
|---|---|---|
| `ERROR: --pg-pass or $PG_PASSWORD required` | 비밀번호 미제공 | `export PG_PASSWORD=<from ssh hh-worker-2>` |
| `Unknown brand 'mkt'` | 지원 목록 외 | zipsaja/howzero/braveyong 중 선택 |
| SSH tunnel 타임아웃 | hh-worker-2 접속 실패 | `ssh hh-worker-2 hostname` 먼저 테스트 |
| `unknown preset` | 잘못된 프리셋 이름 | Plan 1은 `leejaemyung-before-after` 하나만 |

## 관련 문서

- 설계 문서: [docs/superpowers/specs/2026-04-24-brand-content-pipeline-design.md](../../../docs/superpowers/specs/2026-04-24-brand-content-pipeline-design.md)
- 구현 계획: [docs/superpowers/plans/2026-04-24-pipeline-mvp.md](../../../docs/superpowers/plans/2026-04-24-pipeline-mvp.md)
- AGENTS.md §8 — 파이프라인 브랜드×데이터 소스 매핑
