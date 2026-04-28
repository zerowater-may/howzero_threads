---
name: pipeline
description: 브랜드 선택 + 주제 입력 → zipsaja 데이터 수집 + 캐러셀·Remotion 릴스·첨부자료·캡션 생성 + QA 대기 상태 기록. 트리거 — `/pipeline`, "파이프라인 돌려", "콘텐츠 생성 시작".
---

# Brand Content Pipeline 마스터 스킬

`/pipeline <brand> <주제>` 진입점. zipsaja는 데이터 수집 후 같은 번들 안에 캐러셀, Remotion 릴스, 첨부자료, 캡션까지 자동 생성한다. 자동 생성이 끝나면 `status="qa-pending"`으로 남기고 `package-qa` 단계는 `pending` 상태로 둔다.

## 지원 브랜드

| 브랜드 | 데이터 소스 | 상태 |
|---|---|---|
| zipsaja | SSH hh-worker-2 → proptech_db (real_prices × complexes) | ✅ 데이터 + 콘텐츠 생성 + QA 대기 |
| howzero | 없음 (주제 텍스트만, 향후 추가) | ⏳ Plan 2+ |
| braveyong | 없음 (주제 텍스트만, 향후 추가) | ⏳ Plan 2+ |

## 사용

```bash
# zipsaja (데이터 자동 페치 + 콘텐츠 자동 생성)
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
├── pipeline-state.json   # 상태 + 메타데이터 + data 블록 + artifact 경로
├── data.json             # zipsaja: 25개 구 dataset
├── carousel/
│   ├── slides.html
│   └── slide-01.png ...
├── reels/
│   ├── full.mp4
│   └── zipsaja-reel-22s.mp4
├── attachments/
│   ├── seoul-price-data.xlsx
│   └── seoul-price-insights.pdf
└── captions/
    ├── instagram.txt
    ├── threads.txt
    └── linkedin.txt
```

- `slug`는 주제에서 자동 추출 (공백 → 하이픈, 특수문자 제거, 한글 유지).
- `pipeline-state.json` 은 PipelineState dataclass 직렬화. 자동 생성 완료 시 `status="qa-pending"`이며, QA 완료 전에는 `completed`로 표시하지 않는다. 실패 시 `status="failed"` + `failed_at` 필드로 재개 가능.

## 환경 변수

- `PG_PASSWORD` — proptech_db 비밀번호. `.env` 파일 없이 쓸 경우 필수.

비밀번호 획득:
```bash
ssh hh-worker-2 'grep DATABASE_URL /opt/proptech/.env'
```

## zipsaja Remotion v1

zipsaja는 `zipsaja-remotion-v1` stateful DAG를 사용한다.
`python3 -m scripts.pipeline zipsaja <주제>`는 `pipeline-state.json`에 Remotion 워크플로우 메타데이터를 기록한 뒤 다음 단계를 자동으로 이어서 실행한다.

1. `scripts.zipsaja_data_fetch`
2. `scripts.content_carousel`
3. `scripts.content_reels` (Remotion)
4. `scripts.content_attachments`
5. `scripts.content_captions`
6. `package-qa`는 수동/전용 QA 단계로 `pending` 유지

현재 자동 CLI는 별도 브리프와 스토리보드를 생성하지 않으므로 `brief`, `storyboard`는 `skipped`로 기록한다. 신규 zipsaja 릴스는 Remotion만 사용한다. HyperFrames는 신규 산출물에 사용하지 않는다.

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
