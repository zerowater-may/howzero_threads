# hz-os 워크스페이스 고도화 설계 (사이드바·flexible 뷰·캘린더·고객 포털·MCP)

> 2026-07-17. A2Z 딜 파이프라인 위에 노션식 워크스페이스 UX + 고객 포털 + 사내 MCP를 얹는다.
> 사용자 결정(3-way): flexible=기존 데이터 뷰전환+편집 / 고객화면=회사별 고객 포털 / MCP=내부 Claude stdio.

## 원칙

- 기존 A2Z 데이터모델(`companies`/`leads`/`proposals`/`contracts`/`meetings`/`documents`/`activity_log`) 위에만 얹는다. 범용 노션 DB 엔진은 만들지 않는다.
- 새 의존성 최소화: 드래그는 네이티브 HTML5 DnD, 캘린더는 CSS Grid 월간 그리드 자작. MCP만 `@modelcontextprotocol/sdk` 추가(별도 `hz-os/mcp/` 패키지).
- 서버 액션/route는 기존 것 재사용(`moveDealStage`, `getDb` 등). 새 쓰기 경로는 `activity_log`에 기록.

## A. 기반 (공유 파일 — 직접 구현, 선행)

1. **스키마**: `ALTER TABLE companies ADD COLUMN IF NOT EXISTS client_token TEXT;` + `CREATE UNIQUE INDEX IF NOT EXISTS`. 멱등.
2. **좌측 사이드바**: `AppShell`을 상단 탭 → 좌측 사이드바 레이아웃으로 전환. `Sidebar.tsx`(client, `usePathname` active state) — 딜(/)·회사(/companies)·캘린더(/calendar)·대시보드(/dashboard), 하단 로그아웃. `md:` 이상 고정 사이드바, 모바일은 상단 컴팩트 바. lucide 아이콘, 코발트 다크 토큰.
3. **회사 목록**: `/companies` — 회사 카드/행 목록(이름·업종·딜 수·계약 수 → `/c/[id]`).

## B. 독립 기능 (병렬 — 파일 소유 분리)

### B1. flexible 딜 뷰 (소유: `src/app/page.tsx`, `DealKanban.tsx`, 신규 `deals/*`)
- 칸반 ↔ 테이블 뷰 토글(`DealViews.tsx`, client, view state). 캘린더는 별도 사이드바 항목(/calendar)이라 여기선 칸반·테이블만.
- 칸반: 네이티브 드래그로 단계 이동(`draggable`, `onDragStart`/`onDrop` → `moveDealStage`). 기존 드롭다운 이동도 유지.
- 테이블(`DealTable.tsx`): 행=딜, 열=회사·담당자·단계·업종·예산·소스. 담당자/단계 인라인 편집(`assignOwner`/`moveDealStage`). 정렬 헤더.

### B2. 캘린더 (소유: 신규 `src/app/calendar/`, `src/lib/calendar.ts`, `components/calendar/*`)
- `/calendar` 월간 뷰. 소스: `meetings.held_at`(미팅) + `contracts.milestones[].due`(마일스톤). 이벤트 타입별 색/뱃지.
- `MonthCalendar.tsx`(client, 월 이동 prev/next) + `lib/calendar.ts`(해당 월 이벤트 집계 쿼리). 이벤트 클릭 → 해당 `/c/[id]` 또는 `/contracts/[id]`.

### B3. 고객 포털 (소유: 신규 `src/app/client/[token]/`, `src/lib/client-portal.ts`, `src/lib/actions/client.ts`, `/c/[id]` 버튼 추가)
- `companies.client_token`로 인증 없이 접근. `/client/[token]` → 회사 해석 → 렌더:
  - 진행 타임라인: 6단계 파이프라인 중 현재(회사 딜의 max stage) + `activity_log` 최근 이벤트.
  - 받은 제안: `proposals`(status·amount·mm_total, 라인아이템 요약).
  - 계약·마일스톤: `contracts` + `milestones[]` 진척률 막대(done 비율).
  - 산출물: `documents` visibility='shared' 목록(기존 `/share` 문서 링크 재사용 가능).
- staff 셸 없는 미니 레이아웃(`/share` 패턴). CTA/톤은 고객용 존댓말, howzero 브랜드.
- `/c/[id]`에 "고객 링크 생성/복사" 버튼 → `ensureClientToken(companyId)` 액션(토큰 없으면 생성).

### B4. 사내 MCP (소유: 신규 `hz-os/mcp/`, `src/app/api/mcp/`)
- 내부 API: `src/app/api/mcp/route.ts` — Bearer `HZOS_MCP_SECRET`(없으면 `HZOS_INBOUND_SECRET` fallback). action 파라미터로 분기.
  - `list_deals(stage?)`, `get_company(id)`, `move_deal(id, stage)`, `create_proposal(companyId, dealId, lineItems)`, `dashboard_metrics()`, `low_margin_contracts()`.
- stdio 서버: `hz-os/mcp/server.mjs`(`@modelcontextprotocol/sdk`) — 위 tool들을 `HZOS_BASE_URL`+secret로 HTTP 호출. `hz-os/mcp/package.json`, `README.md`(Claude Desktop 등록법).
- PGlite 단일 라이터 회피 위해 DB 직접 접근 대신 포털 HTTP 경유.

## C. 검증
- `npx tsc --noEmit`, `npm run build` 통과.
- 각 기능 순수함수/쿼리 스모크: 캘린더 집계, 마일스톤 진척 계산, MCP action 라우팅.
- 배포는 기존 `howzero-deploy` 재빌드 흐름.

## 산출물 위치
`hz-os/` 내부. MCP만 `hz-os/mcp/` 하위 별도 패키지.
