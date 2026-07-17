# hz-os 프로젝트 타임라인·간트 + AI 고객언어 진행판 설계

> 2026-07-17. 고객사 개발 프로젝트의 진행을 hz-os에서 타임라인/간트로 보고, 고객 대시보드는 AI가 고객사 언어로 요약해 보여준다(staff는 원문).

## 배경 — SHCO 실데이터

`/Users/howzero/shco/admin` = SHCO 코스 플랫폼 리뉴얼(Next.js). 진행은 superpowers 플랜 8단계로 추적:
| seq | 단계 | 완료/전체 | % | 상태 |
|---|---|---|---|---|
| 1 | Foundation (호스트분리·스키마·세션) | 41/44 | 93 | active(거의완료) |
| 2 | 공개 프론트엔드·블루프린트 | 63/67 | 94 | active |
| 3 | Kakao·무료신청 | 50/75 | 67 | active |
| 4 | Toss 결제·수강 | 11/39 | 28 | active |
| 5 | 알림(Solapi) | 0/59 | 0 | todo |
| 6 | 어드민 운영 | 0/33 | 0 | todo |
| 7 | 마이그레이션·컷오버 | 0/35 | 0 | todo |
| 8 | 통합·런칭 | 0/36 | 0 | todo |

원천: `shco/admin/docs/superpowers/plans/*.md`의 체크박스(`- [x]`/`- [ ]`). 단계명·산출물·태스크는 `...-shco-platform-master.md`.

## 원칙
- hz-os 기존 데이터모델(companies·projects·client_token) 위에 얹는다. shco 플랜을 hz-os `phases`로 시드.
- 날짜가 실제로 없으므로 **간트는 순서(seq)+진행률 채움 막대** 기본. `target_at`가 있으면 날짜축도 지원(둘 다 가능 = "간트로 보거나 등등").
- AI 지역화는 OpenRouter(hz-os에 `OPENROUTER_API_KEY` 존재). 결과는 `phases.summary_client`에 **캐시**(매 로드마다 호출 금지).

## 데이터 모델 (신규, 멱등 ALTER)
```sql
ALTER TABLE companies ADD COLUMN IF NOT EXISTS client_lang TEXT DEFAULT 'ko';

CREATE TABLE IF NOT EXISTS phases (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company_id BIGINT,
  project_id BIGINT,
  seq INT NOT NULL DEFAULT 0,
  name TEXT NOT NULL,            -- 원문 단계명
  deliverable TEXT,             -- 원문 산출물 한 줄
  detail TEXT,                  -- 원문 태스크 목록(markdown)
  tasks_total INT NOT NULL DEFAULT 0,
  tasks_done INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'todo',  -- todo/active/done
  start_at DATE,
  target_at DATE,
  summary_client TEXT,          -- AI 고객언어 요약(캐시)
  client_lang TEXT,             -- 생성 언어 스냅샷
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phases_project ON phases(project_id);
CREATE INDEX IF NOT EXISTS idx_phases_company ON phases(company_id);
```
status 규칙: tasks_done=0 → todo, 0<done<total → active, done>=total → done.

## 컴포넌트/라우트
1. **`lib/phases.ts`**: getPhases(projectId) / getPhasesByCompany(companyId), 진행률·상태 파생, 프로젝트 롤업(전체 %).
2. **`GanttTimeline.tsx`** (client): 단계별 가로 막대(seq 순). 막대 = 상태색 + 진행률 채움 + 태스크수 + 산출물. 뷰 토글: "진행률"(순서 기반) ↔ "일정"(target_at 있으면 날짜축). 오늘 마커. AI요약이 있으면 각 단계 아래 접힘/펼침.
3. **staff — 프로젝트 페이지** `/p/[id]`: GanttTimeline(원문: name·deliverable·detail·태스크수). "AI 고객요약 생성/갱신" 버튼(localizePhases 액션).
4. **client — 고객 포털** `/client/[token]`: 회사의 대표 프로젝트 타임라인을 GanttTimeline으로, 단, **summary_client(고객언어)**를 본문으로. 원문 태스크 목록은 숨김. 없으면 "요약 준비 중" 빈상태.
5. **`lib/ai-localize.ts`**: localizePhases(projectId, lang) — 각 단계 원문(name+deliverable+detail+진행률)을 OpenRouter로 고객언어 plain 요약 생성 → phases.summary_client 캐시. 실패시 원문 fallback 금지, 에러 표시. 프롬프트: "개발 용어 제거, 고객사 대표가 이해할 businesss 언어, 현재 무엇이 되고 있고 다음이 무엇인지 2-3문장, {lang}로."
6. **시드**: `/api/seed-shco/route.ts` (POST, Bearer=HZOS_MCP_SECRET||HZOS_INBOUND_SECRET, 멱등) — SHCO 회사(client_lang='ko')+프로젝트+8단계 phases 생성/갱신(위 표 데이터 하드코딩 시드). PGlite 단일라이터라 실행 중 서버가 소유 → 로컬·프로덕션 각각 1회 curl.

## 검증
- `npm run build`·tsc clean.
- 시드 후 Playwright: staff `/p/[id]` 간트 렌더(8단계·진행률), AI요약 생성 버튼→summary_client 채움, client `/client/[token]` 고객언어 타임라인.
- 프로덕션: 시드 curl → 스모크.

## 산출물 위치
`hz-os/` 내부. 배포는 기존 howzero-deploy 재빌드(키 인증 확립됨).
