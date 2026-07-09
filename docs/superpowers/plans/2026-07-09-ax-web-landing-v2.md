# ax-web 랜딩 v2 (다크 + AI OS 노드 캔버스) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 ax-web 랜딩을 스펙(`docs/superpowers/specs/2026-07-09-ax-web-landing-v2-design.md`)대로 전면 다크 리스킨 — shaders 채팅 히어로 + 3D 사원증 오버레이 + @xyflow/react 인터랙티브 "AI OS" 노드 캔버스. 백엔드(`/api/chat`, `/api/leads`, PGlite)는 무변경.

**Architecture:** `page.tsx`는 Server Component 유지. 무거운 것(셰이더/3D/캔버스)은 각각 `"use client"` 래퍼 안에서 `dynamic(..., { ssr: false })` 로드. 카피는 v1 검증 카피 재활용 + 서사만 "기업 OS"로 재편. 표기 `하우제로 → howzero`.

**Tech Stack:** Next.js 16.1.6 · React 19.2.3 · Tailwind 4 · @xyflow/react 12 · @paper-design/shaders-react · three 0.167.1 + @react-three/fiber 9 / drei 10 / rapier 2 + meshline 3 · vitest

**작업 디렉토리:** 모든 명령은 `/Users/howzero/howzero/ax-web` 에서 실행 (별도 표기 없으면).

**레퍼런스 (repo 내):** `docs/superpowers/specs/assets/2026-07-09-ax-landing-v2/` — zip 2개 + flow-*.jpg 5장. zip 추출본이 필요하면 `unzip -o <zip> -d /tmp/ref-lanyard` 식으로 임시 추출.

---

## 주의사항 (전 태스크 공통)

1. **Server Component 함정**: `page.tsx`에 `dynamic(..., {ssr:false})` 직접 쓰면 빌드 에러. 반드시 `"use client"` 파일 안에서만.
2. **v0 브랜딩 금지**: lanyard zip의 `card-base-dark.png`는 v0 로고/QR이 박힌 텍스처라 사용 금지. 카드 텍스처는 캔버스 절차 생성(Task 6).
3. **수치 창작 금지**: 노드 상세 카드에 "자동화 후 N분" 같은 수치 넣지 않는다. 스펙 §4·§8.
4. **실명 금지**: 사원증·랜딩 어디에도 사람 이름 텍스트 넣지 않는다. `Founder · 연매출 10억 SaaS 운영자`만.
5. dev 서버 확인은 `npm run dev` (port 3300). PGlite는 단일 프로세스 전용 — 리드 확인 스크립트는 dev 서버 내리고 실행.

---

### Task 1: 의존성 설치 + 3D 에셋 복사

**Files:**
- Modify: `ax-web/package.json` (npm install이 수정)
- Create: `ax-web/public/card.glb`, `ax-web/public/lanyard-rope.png`

- [ ] **Step 1: 의존성 설치**

```bash
cd /Users/howzero/howzero/ax-web
npm install three@0.167.1 @react-three/fiber@^9.5.0 @react-three/drei@^10.7.7 @react-three/rapier@^2.2.0 meshline@^3.3.1 @paper-design/shaders-react @xyflow/react clsx
npm install -D @types/three@0.167.2
```

버전 근거: lanyard zip이 검증한 조합 그대로(three 0.167.1 + meshline 3.3.1 호환). `framer-motion`은 설치하지 않는다 — 스펙 §5에 있었지만 필요한 모션(포커스 페이드)은 CSS 트랜지션으로 충분 (YAGNI, 구현 노트에 기록).

- [ ] **Step 2: 3D 에셋 복사**

```bash
cd /Users/howzero/howzero
unzip -o docs/superpowers/specs/assets/2026-07-09-ax-landing-v2/v0-irl-event-landing-custom-3-d-lanyard.zip -d /tmp/ref-lanyard
cp /tmp/ref-lanyard/public/card.glb ax-web/public/card.glb
cp /tmp/ref-lanyard/components/ui/lanyard.png ax-web/public/lanyard-rope.png
ls -la ax-web/public/
```

Expected: `card.glb` (약 200KB~1MB), `lanyard-rope.png` 존재.

- [ ] **Step 3: 빌드 무결성 확인**

```bash
cd /Users/howzero/howzero/ax-web && npx tsc --noEmit && npm run build
```

Expected: 통과 (아직 코드 변경 없음 — 의존성 설치가 기존 빌드를 깨지 않는지 확인).

- [ ] **Step 4: Commit**

```bash
cd /Users/howzero/howzero
git add ax-web/package.json ax-web/package-lock.json ax-web/public/card.glb ax-web/public/lanyard-rope.png
git commit -m "chore(ax-web): v2 의존성(three/rapier/xyflow/shaders) + 3D 사원증 에셋"
```

---

### Task 2: 다크 테마 토큰 + 메타데이터 howzero 전환

**Files:**
- Modify: `ax-web/src/app/globals.css`
- Modify: `ax-web/src/app/layout.tsx:4-8`

- [ ] **Step 1: globals.css 전체 교체**

변수 **이름은 유지**하고 값만 다크로 스왑 (기존 마크업의 `var(--paper)` 등 참조가 그대로 동작). `--cobalt`는 오렌지 액센트로 재정의. 파일 전체를 아래로 교체:

```css
@import "tailwindcss";

:root {
  --paper: #0a0a0a;        /* 페이지 배경 (다크) */
  --panel: #111113;        /* 교차 섹션 배경 */
  --card: #161618;         /* 카드 배경 */
  --chat: #040404;         /* 채팅 카드 (shaders 레퍼런스) */
  --ink: #f2f2ef;          /* 본문 텍스트 */
  --dim: #9a9aa0;          /* 보조 텍스트 */
  --line: #26262a;         /* 보더 */
  --cobalt: #f97316;       /* 주 액센트 — 오렌지 (이름은 호환용 유지) */
  --cobalt-deep: #ea580c;
  --signal: #f97316;       /* 숫자 하이라이트 — 액센트와 통일 */
  --warm: #ba9465;         /* 채팅 포커스 보더 (shaders 레퍼런스) */
  --ok: #22c55e;           /* Running 노드 */
  --font-display: "SUIT Variable", "Pretendard Variable", sans-serif;
  --font-body: "Pretendard Variable", -apple-system, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  word-break: keep-all;
}

.display {
  font-family: var(--font-display);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.16;
}

.eyebrow {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  color: var(--cobalt);
  text-transform: uppercase;
}

.num {
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--signal);
  font-variant-numeric: tabular-nums;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--cobalt);
  color: #0a0a0a;
  font-weight: 700;
  padding: 0.875rem 1.75rem;
  border-radius: 0.5rem;
  transition: background 0.15s ease;
}
.btn-primary:hover {
  background: var(--cobalt-deep);
}

/* 노드 캔버스 도트 배경 (섹션 3·4 공용) */
.canvas-dots {
  background-color: #0d0d0f;
  background-image: radial-gradient(#232326 1px, transparent 1px);
  background-size: 16px 16px;
}

a:focus-visible,
button:focus-visible,
input:focus-visible,
textarea:focus-visible {
  outline: 2px solid var(--cobalt);
  outline-offset: 2px;
}

@keyframes rise {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
.rise { animation: rise 0.55s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
.rise-1 { animation-delay: 0.05s; }
.rise-2 { animation-delay: 0.15s; }
.rise-3 { animation-delay: 0.25s; }
.rise-4 { animation-delay: 0.4s; }

@keyframes blink {
  0%, 80%, 100% { opacity: 0.25; }
  40% { opacity: 1; }
}
.typing-dot {
  width: 5px;
  height: 5px;
  border-radius: 9999px;
  background: var(--dim);
  animation: blink 1.2s infinite;
}
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }

/* Running 노드 펄스 뱃지 */
@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
  50% { box-shadow: 0 0 0 5px rgba(34, 197, 94, 0); }
}
.pulse-dot {
  animation: pulse-dot 1.6s infinite;
}

@media (prefers-reduced-motion: reduce) {
  .rise { animation: none; }
  .typing-dot { animation: none; opacity: 0.6; }
  .pulse-dot { animation: none; }
  html { scroll-behavior: auto; }
}
```

- [ ] **Step 2: layout.tsx 메타데이터 교체**

`metadata` 객체만 아래로 교체 (폰트 링크는 유지):

```tsx
export const metadata: Metadata = {
  title: "howzero — 당신 회사만의 AI 운영 OS",
  description:
    "반복업무 시간, 어떻게 0으로 만드나. 연매출 10억 이커머스 SaaS를 직접 자동화해본 운영자가 프로세스 정립부터 자동화까지 — 회사만의 AI 운영 OS를 만듭니다.",
};
```

- [ ] **Step 3: dev 서버로 육안 확인**

```bash
cd /Users/howzero/howzero/ax-web && npm run dev
```

http://localhost:3300 — 배경 다크, 텍스트 밝은색으로 보이면 OK (레이아웃 깨짐은 Task 8에서 해결하므로 무시). 확인 후 서버 종료.

- [ ] **Step 4: Commit**

```bash
cd /Users/howzero/howzero
git add ax-web/src/app/globals.css ax-web/src/app/layout.tsx
git commit -m "feat(ax-web): 다크 테마 토큰 + howzero 메타데이터"
```

---

### Task 3: `하우제로 → howzero` 전면 치환 (시스템 프롬프트 포함)

**Files:**
- Modify: `ax-web/src/lib/prompt.ts` (하우제로 등장 위치)
- Modify: `ax-web/src/lib/prompt.test.ts` (기대값에 하우제로가 있으면)
- Modify: `ax-web/src/components/HeroChat.tsx:10` (인사말)

- [ ] **Step 1: 등장 위치 전수 확인**

```bash
cd /Users/howzero/howzero/ax-web && grep -rn "하우제로" src/
```

Expected: `prompt.ts`(시스템 프롬프트), `prompt.test.ts`(기대값), `HeroChat.tsx`(인사말), `page.tsx`(네비 로고 — Task 8에서 재작성하므로 여기선 건너뜀) 등이 나온다.

- [ ] **Step 2: page.tsx 제외 전부 `howzero`로 치환**

`prompt.ts`·`prompt.test.ts`·`HeroChat.tsx`의 `하우제로`를 `howzero`로 바꾼다. HeroChat 인사말은 아래로 교체:

```ts
const GREETING: Msg = {
  role: "assistant",
  content:
    "무엇을 자동화하고 싶으세요? CS 응대, 상품 등록, 정산, 리포트 — 요즘 대표님 시간을 제일 많이 잡아먹는 반복업무를 편하게 말씀해주세요.",
};
```

- [ ] **Step 3: 테스트 실행**

```bash
cd /Users/howzero/howzero/ax-web && npm test
```

Expected: PASS (prompt.test.ts 기대값을 치환에 맞춰 수정했으므로).

- [ ] **Step 4: Commit**

```bash
cd /Users/howzero/howzero
git add ax-web/src/lib/prompt.ts ax-web/src/lib/prompt.test.ts ax-web/src/components/HeroChat.tsx
git commit -m "feat(ax-web): 하우제로→howzero 표기 통일 (프롬프트·인사말)"
```

---

### Task 4: OS 캔버스 프리셋 데이터 (TDD)

**Files:**
- Create: `ax-web/src/components/os-canvas/presets.ts`
- Test: `ax-web/src/components/os-canvas/presets.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`ax-web/src/components/os-canvas/presets.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { PRESETS, PRESET_ORDER } from "./presets";

describe("os-canvas presets", () => {
  it("4개 프리셋이 정의돼 있다", () => {
    expect(PRESET_ORDER).toEqual(["cs", "settle", "content", "order"]);
    for (const key of PRESET_ORDER) expect(PRESETS[key]).toBeDefined();
  });

  for (const key of ["cs", "settle", "content", "order"] as const) {
    describe(key, () => {
      it("노드 id가 유니크하다", () => {
        const ids = PRESETS[key].nodes.map((n) => n.id);
        expect(new Set(ids).size).toBe(ids.length);
      });

      it("엣지 source/target이 존재하는 노드를 가리킨다", () => {
        const ids = new Set(PRESETS[key].nodes.map((n) => n.id));
        for (const e of PRESETS[key].edges) {
          expect(ids.has(e.source)).toBe(true);
          expect(ids.has(e.target)).toBe(true);
        }
      });

      it("첫 노드는 trigger, running 노드는 정확히 1개이고 마지막(나가는 엣지 없음)이다", () => {
        const { nodes, edges } = PRESETS[key];
        expect(nodes[0].data.kind).toBe("trigger");
        const running = nodes.filter((n) => n.data.kind === "running");
        expect(running).toHaveLength(1);
        const outgoing = edges.filter((e) => e.source === running[0].id);
        expect(outgoing).toHaveLength(0);
      });

      it("모든 노드에 label과 detail 설명이 있다", () => {
        for (const n of PRESETS[key].nodes) {
          expect(n.data.label.length).toBeGreaterThan(0);
          expect(n.data.detail.length).toBeGreaterThan(10);
        }
      });
    });
  }
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
cd /Users/howzero/howzero/ax-web && npx vitest run src/components/os-canvas/presets.test.ts
```

Expected: FAIL — `Cannot find module './presets'`.

- [ ] **Step 3: presets.ts 구현**

스펙 §4의 4개 파이프라인 확정안 그대로. 상세 설명(detail)에 수치 없음 — "이 단계가 하는 일"만.

`ax-web/src/components/os-canvas/presets.ts`:

```ts
// 스펙 §4 확정 파이프라인. 수치(before/after) 창작 금지 — 04-persona 원칙.
export type OsNodeKind = "trigger" | "ai" | "gate" | "running";
export type PresetKey = "cs" | "settle" | "content" | "order";

export interface OsNodeData {
  label: string;
  sub: string;      // 노드 카드 안 한 줄 보조 텍스트
  detail: string;   // 클릭 시 상세 카드 본문
  kind: OsNodeKind;
  [key: string]: unknown; // @xyflow/react Node.data 제약 충족
}

export interface OsPresetNode {
  id: string;
  position: { x: number; y: number };
  data: OsNodeData;
  type: "os";
}

export interface OsPresetEdge {
  id: string;
  source: string;
  target: string;
}

export interface OsPreset {
  label: string;
  nodes: OsPresetNode[];
  edges: OsPresetEdge[];
}

export const PRESET_ORDER: PresetKey[] = ["cs", "settle", "content", "order"];

// 가로 배치: x 간격 230, y는 살짝 지그재그 (레퍼런스 flow-*.jpg 느낌)
function n(
  id: string,
  i: number,
  kind: OsNodeKind,
  label: string,
  sub: string,
  detail: string,
): OsPresetNode {
  return {
    id,
    type: "os",
    position: { x: i * 230, y: i % 2 === 0 ? 0 : 48 },
    data: { label, sub, detail, kind },
  };
}

function chain(ids: string[]): OsPresetEdge[] {
  return ids.slice(0, -1).map((s, i) => ({ id: `${s}-${ids[i + 1]}`, source: s, target: ids[i + 1] }));
}

export const PRESETS: Record<PresetKey, OsPreset> = {
  cs: {
    label: "CS 응대",
    nodes: [
      n("cs-1", 0, "trigger", "문의 수신", "채널 통합 인입", "스마트스토어·쿠팡·카카오채널 등 흩어진 문의를 한 곳으로 모읍니다. 여기가 프로세스 정립의 시작입니다."),
      n("cs-2", 1, "ai", "AI 분류", "유형·긴급도 판정", "반품/배송/상품 문의를 유형별로 나누고 긴급 건을 앞으로 보냅니다. 분류 기준은 귀사 운영 규칙으로 만듭니다."),
      n("cs-3", 2, "ai", "답변 생성", "우리 회사 말투로", "과거 응대 기록과 상품 데이터를 근거로 답변 초안을 만듭니다. 근거 없는 답은 만들지 않고 사람에게 넘깁니다."),
      n("cs-4", 3, "gate", "휴먼 검수", "사람이 지키는 게이트", "환불·클레임 등 민감 건은 반드시 사람이 확인하고 보냅니다. 어디까지 자동으로 보낼지는 함께 정합니다."),
      n("cs-5", 4, "ai", "발송", "채널별 자동 회신", "승인된 답변을 각 채널 형식에 맞춰 보냅니다."),
      n("cs-6", 5, "running", "로그·학습", "운영 중", "모든 응대가 기록으로 남고, 반복되는 유형은 다음 분류·답변 규칙에 반영됩니다. 이 축적이 회사의 OS가 됩니다."),
    ],
    edges: chain(["cs-1", "cs-2", "cs-3", "cs-4", "cs-5", "cs-6"]),
  },
  settle: {
    label: "정산·리포트",
    nodes: [
      n("st-1", 0, "trigger", "판매 데이터 수집", "채널별 자동 취합", "마켓별 정산 내역·매출 데이터를 사람이 내려받지 않고 자동으로 모읍니다."),
      n("st-2", 1, "ai", "정산 대사", "장부 대조", "채널 정산금과 내부 장부를 대조해 차이 나는 줄을 찾아냅니다."),
      n("st-3", 2, "ai", "이상치 감지", "새는 돈 탐지", "수수료 오적용·누락 건처럼 평소 패턴과 다른 항목을 표시합니다."),
      n("st-4", 3, "gate", "휴먼 확인", "사람이 지키는 게이트", "이상치로 표시된 건은 사람이 판단합니다. 돈이 걸린 결정은 자동으로 처리하지 않습니다."),
      n("st-5", 4, "running", "리포트 생성·발송", "운영 중", "주간·월간 리포트가 정해진 형식으로 만들어져 대표님 메일함에 도착합니다."),
    ],
    edges: chain(["st-1", "st-2", "st-3", "st-4", "st-5"]),
  },
  content: {
    label: "콘텐츠 제작",
    nodes: [
      n("ct-1", 0, "trigger", "소재 수집", "반응 데이터 기반", "잘 터진 콘텐츠·후기·질문을 자동으로 모아 소재 후보로 쌓습니다."),
      n("ct-2", 1, "ai", "초안 생성", "형식별 변환", "상세페이지·SNS·블로그 등 채널별 형식에 맞는 초안을 만듭니다."),
      n("ct-3", 2, "ai", "브랜드 톤 변환", "우리 말투 적용", "회사가 정한 톤 가이드에 맞춰 문장을 다듬습니다. 톤 가이드 정립부터 함께 합니다."),
      n("ct-4", 3, "gate", "휴먼 승인", "사람이 지키는 게이트", "발행 전 최종 확인은 사람이 합니다. 브랜드를 지키는 건 사람의 일입니다."),
      n("ct-5", 4, "running", "발행 예약", "운영 중", "승인된 콘텐츠가 채널별로 예약 발행되고 결과가 기록됩니다."),
    ],
    edges: chain(["ct-1", "ct-2", "ct-3", "ct-4", "ct-5"]),
  },
  order: {
    label: "주문·재고",
    nodes: [
      n("od-1", 0, "trigger", "주문 수신", "채널 통합", "여러 판매 채널의 주문을 한 흐름으로 모읍니다."),
      n("od-2", 1, "ai", "재고 확인", "실시간 대조", "주문과 현재고를 대조해 품절 위험·과재고 신호를 만듭니다."),
      n("od-3", 2, "ai", "발주 제안", "근거 있는 제안", "판매 속도와 리드타임을 근거로 발주 수량을 제안합니다. 결정이 아니라 제안입니다."),
      n("od-4", 3, "gate", "휴먼 승인", "사람이 지키는 게이트", "발주 확정은 사람이 합니다. 현금이 나가는 결정은 자동화하지 않습니다."),
      n("od-5", 4, "running", "발주·입고 추적", "운영 중", "승인된 발주가 실행되고 입고까지 상태가 자동으로 추적·기록됩니다."),
    ],
    edges: chain(["od-1", "od-2", "od-3", "od-4", "od-5"]),
  },
};
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
cd /Users/howzero/howzero/ax-web && npx vitest run src/components/os-canvas/presets.test.ts
```

Expected: PASS (프리셋 4개 × 4 테스트).

- [ ] **Step 5: Commit**

```bash
cd /Users/howzero/howzero
git add ax-web/src/components/os-canvas/
git commit -m "feat(ax-web): OS 캔버스 프리셋 4종 데이터 + 무결성 테스트"
```

---

### Task 5: 인터랙티브 노드 캔버스 (커스텀 노드 + 탭 + 상세 카드 + 모바일 폴백)

**Files:**
- Create: `ax-web/src/components/os-canvas/nodes.tsx`
- Create: `ax-web/src/components/os-canvas/FlowCanvas.tsx`
- Create: `ax-web/src/components/os-canvas/OsCanvas.tsx`

- [ ] **Step 1: 커스텀 노드 컴포넌트**

`ax-web/src/components/os-canvas/nodes.tsx`:

```tsx
"use client";

import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { OsNodeData, OsNodeKind } from "./presets";

// 레퍼런스(flow-*.jpg)의 카드형 노드 — 다크 재해석
const KIND_STYLE: Record<OsNodeKind, { border: string; badge: string; badgeText: string }> = {
  trigger: { border: "border-[var(--line)]", badge: "bg-zinc-700", badgeText: "TRIGGER" },
  ai: { border: "border-[var(--cobalt)]/60", badge: "bg-[var(--cobalt)]", badgeText: "AI" },
  gate: { border: "border-dashed border-[var(--dim)]", badge: "bg-zinc-600", badgeText: "HUMAN" },
  running: { border: "border-[var(--ok)]/70", badge: "bg-[var(--ok)]", badgeText: "RUNNING" },
};

export function OsNode({ data, selected }: NodeProps<Node<OsNodeData>>) {
  const s = KIND_STYLE[data.kind];
  return (
    <div
      className={`w-[200px] cursor-pointer rounded-lg border bg-[var(--card)] px-3.5 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-shadow ${s.border} ${
        selected ? "ring-2 ring-[var(--cobalt)]" : ""
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-[var(--dim)]" />
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-[var(--ink)]">{data.label}</span>
        <span
          className={`flex items-center gap-1 rounded px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[9px] font-semibold text-black ${s.badge} ${
            data.kind === "running" ? "pulse-dot" : ""
          }`}
        >
          {s.badgeText}
        </span>
      </div>
      <p className="mt-1 text-xs text-[var(--dim)]">{data.sub}</p>
      <Handle type="source" position={Position.Right} className="!bg-[var(--dim)]" />
    </div>
  );
}

export const nodeTypes = { os: OsNode };
```

- [ ] **Step 2: FlowCanvas (react-flow 래퍼, 클라이언트 전용)**

`ax-web/src/components/os-canvas/FlowCanvas.tsx`:

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  applyNodeChanges,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeTypes } from "./nodes";
import { PRESETS, type PresetKey, type OsNodeData } from "./presets";

interface Props {
  preset: PresetKey;
  onSelect: (data: OsNodeData | null) => void;
}

export default function FlowCanvas({ preset, onSelect }: Props) {
  const [nodes, setNodes] = useState<Node<OsNodeData>[]>(PRESETS[preset].nodes);

  // 탭 전환 시 노드셋 교체 + 선택 해제
  useEffect(() => {
    setNodes(PRESETS[preset].nodes);
    onSelect(null);
  }, [preset, onSelect]);

  const onNodesChange = useCallback(
    (changes: NodeChange<Node<OsNodeData>>[]) => setNodes((ns) => applyNodeChanges(changes, ns)),
    [],
  );

  return (
    <div className="canvas-dots h-[420px] w-full rounded-xl border border-[var(--line)]">
      <ReactFlow
        nodes={nodes}
        edges={PRESETS[preset].edges.map((e) => ({
          ...e,
          animated: true,
          style: { stroke: "#3f3f46" },
        }))}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={(_, node) => onSelect(node.data)}
        onPaneClick={() => onSelect(null)}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        nodesConnectable={false}
        deleteKeyCode={null}
        colorMode="dark"
      />
    </div>
  );
}
```

- [ ] **Step 3: OsCanvas (탭 + 상세 카드 + 모바일 폴백 오케스트레이션)**

`ax-web/src/components/os-canvas/OsCanvas.tsx`:

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { PRESETS, PRESET_ORDER, type PresetKey, type OsNodeData } from "./presets";

// react-flow는 SSR 불가 — 클라이언트 래퍼(이 파일) 안에서 dynamic 로드 (스펙 §5 주의)
const FlowCanvas = dynamic(() => import("./FlowCanvas"), {
  ssr: false,
  loading: () => (
    <div className="canvas-dots h-[420px] w-full animate-pulse rounded-xl border border-[var(--line)]" />
  ),
});

export default function OsCanvas() {
  const [preset, setPreset] = useState<PresetKey>("cs");
  const [selected, setSelected] = useState<OsNodeData | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const onSelect = useCallback((d: OsNodeData | null) => setSelected(d), []);

  return (
    <div>
      {/* 업무별 프리셋 탭 */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="업무별 자동화 파이프라인">
        {PRESET_ORDER.map((key) => (
          <button
            key={key}
            role="tab"
            aria-selected={preset === key}
            onClick={() => setPreset(key)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              preset === key
                ? "border-[var(--cobalt)] bg-[var(--cobalt)] text-black"
                : "border-[var(--line)] bg-transparent text-[var(--dim)] hover:text-[var(--ink)]"
            }`}
          >
            {PRESETS[key].label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {isMobile ? (
          /* 모바일 폴백 — 같은 정보의 세로 스텝 리스트 (스펙 §4) */
          <ol className="space-y-3">
            {PRESETS[preset].nodes.map((node, i) => (
              <li key={node.id} className="rounded-lg border border-[var(--line)] bg-[var(--card)] p-4">
                <div className="flex items-center gap-2">
                  <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--cobalt)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-bold">{node.data.label}</span>
                  <span className="text-xs text-[var(--dim)]">{node.data.sub}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--dim)]">{node.data.detail}</p>
              </li>
            ))}
          </ol>
        ) : (
          <>
            <FlowCanvas preset={preset} onSelect={onSelect} />
            <p className="mt-2 text-xs text-[var(--dim)]">
              노드를 끌어서 움직이고, 클릭하면 각 단계가 하는 일을 볼 수 있습니다.
            </p>
            {/* 상세 카드 */}
            <div
              aria-live="polite"
              className={`mt-4 rounded-xl border border-[var(--line)] bg-[var(--card)] p-5 transition-opacity ${
                selected ? "opacity-100" : "opacity-60"
              }`}
            >
              {selected ? (
                <>
                  <p className="text-sm font-bold">
                    {selected.label} <span className="ml-1 font-normal text-[var(--dim)]">{selected.sub}</span>
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--dim)]">{selected.detail}</p>
                </>
              ) : (
                <p className="text-sm text-[var(--dim)]">노드를 클릭하면 이 자리에 단계 설명이 나옵니다.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 타입 체크**

```bash
cd /Users/howzero/howzero/ax-web && npx tsc --noEmit
```

Expected: PASS. (`@xyflow/react` 제네릭 시그니처가 버전에 따라 다를 수 있음 — 에러 시 `NodeProps<Node<OsNodeData>>` 부분을 설치된 v12 시그니처에 맞춰 조정.)

- [ ] **Step 5: Commit**

```bash
cd /Users/howzero/howzero
git add ax-web/src/components/os-canvas/
git commit -m "feat(ax-web): 인터랙티브 OS 노드 캔버스 — 커스텀 노드·프리셋 탭·상세 카드·모바일 폴백"
```

---

### Task 6: 히어로 채팅 다크 리스킨 + 셰이더 오브

**Files:**
- Create: `ax-web/src/components/hero/ShaderFx.tsx`
- Modify: `ax-web/src/components/HeroChat.tsx`

- [ ] **Step 1: ShaderFx (LiquidMetal 오브 + PulsingBorder, 클라이언트 전용 + 폴백)**

`ax-web/src/components/hero/ShaderFx.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";

// WebGL 실패 시(로드 에러 포함) 정적 오렌지 원으로 폴백 — 스펙 §6
const LiquidMetal = dynamic(
  () => import("@paper-design/shaders-react").then((m) => m.LiquidMetal),
  { ssr: false, loading: () => <OrbFallback /> },
);
const PulsingBorder = dynamic(
  () => import("@paper-design/shaders-react").then((m) => m.PulsingBorder),
  { ssr: false, loading: () => null },
);

function OrbFallback() {
  return <div className="h-[56px] w-[56px] rounded-full bg-[var(--cobalt)]/40 blur-sm" />;
}

// shaders-chat-app 레퍼런스 파라미터 이식 (오렌지 팔레트)
export function Orb() {
  return (
    <div className="relative flex h-[80px] w-[80px] items-center justify-center">
      <LiquidMetal
        style={{ height: 80, width: 80, filter: "blur(14px)", position: "absolute" }}
        colorBack="hsl(0, 0%, 0%, 0)"
        colorTint="hsl(29, 77%, 49%)"
        repetition={4}
        softness={0.5}
        shiftRed={0.3}
        shiftBlue={0.3}
        distortion={0.1}
        contour={1}
        shape="circle"
        scale={0.58}
        rotation={50}
        speed={5}
      />
      <LiquidMetal
        style={{ height: 80, width: 80 }}
        colorBack="hsl(0, 0%, 0%, 0)"
        colorTint="hsl(29, 77%, 49%)"
        repetition={4}
        softness={0.5}
        shiftRed={0.3}
        shiftBlue={0.3}
        distortion={0.1}
        contour={1}
        shape="circle"
        scale={0.58}
        rotation={50}
        speed={5}
      />
    </div>
  );
}

export function FocusBorder({ active }: { active: boolean }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center transition-opacity duration-700"
      style={{ opacity: active ? 1 : 0 }}
    >
      <PulsingBorder
        style={{ height: "146.5%", minWidth: "143%" }}
        colorBack="hsl(0, 0%, 0%)"
        roundness={0.18}
        thickness={0}
        softness={0}
        intensity={0.3}
        bloom={2}
        spots={2}
        spotSize={0.25}
        pulse={0}
        smoke={0.35}
        smokeSize={0.4}
        scale={0.7}
        speed={1}
        colors={[
          "hsl(29, 70%, 37%)",
          "hsl(32, 100%, 83%)",
          "hsl(4, 32%, 30%)",
          "hsl(25, 60%, 50%)",
          "hsl(0, 100%, 10%)",
        ]}
      />
    </div>
  );
}
```

- [ ] **Step 2: HeroChat 다크 리스킨**

`HeroChat.tsx`에서 — 로직(send/스트리밍/폴백)은 **한 줄도 바꾸지 않는다**. 변경은:

1. import 추가 + 포커스 상태:

```tsx
import { Orb, FocusBorder } from "@/components/hero/ShaderFx";
// 컴포넌트 안:
const [focused, setFocused] = useState(false);
```

2. 최상위 JSX를 아래 구조로 교체 (기존 메시지 map·form 내용물은 유지하되 클래스만 다크로):

```tsx
return (
  <div className="relative">
    {/* 오브 + 안내 라인 — 포커스 시 페이드아웃 (shaders 레퍼런스 모션을 CSS로) */}
    <div
      className="flex items-center gap-2 transition-all duration-500"
      style={{ opacity: focused ? 0 : 1, transform: focused ? "translateY(8px)" : "none" }}
    >
      <Orb />
      <p className="text-sm font-light text-white/40">진단 대화는 무료고, 기록은 진단 준비에만 씁니다</p>
    </div>

    <div className="relative">
      <FocusBorder active={focused} />
      <div
        id="hero-chat"
        className="relative z-10 flex h-[480px] flex-col overflow-hidden rounded-2xl border bg-[var(--chat)] transition-colors duration-500"
        style={{ borderColor: focused ? "var(--warm)" : "#3d3d3d" }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-[#242424] px-4 py-3">
          <span className="font-[family-name:var(--font-mono)] text-xs tracking-widest text-[var(--dim)]">
            howzero · 무료 진단 대화
          </span>
          <span className="flex items-center gap-1.5 font-[family-name:var(--font-mono)] text-xs text-[var(--dim)]">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
            상담 가능
          </span>
        </div>
        {/* 메시지 — 기존 map 그대로, 말풍선 클래스만 교체 */}
        {/*   user:      "max-w-[85%] rounded-lg rounded-br-sm bg-[var(--cobalt)] px-3.5 py-2.5 text-sm leading-relaxed text-black" */}
        {/*   assistant: "max-w-[85%] rounded-lg rounded-bl-sm bg-[#1a1a1c] px-3.5 py-2.5 text-sm leading-relaxed text-[var(--ink)]" */}
        {/*   failed 안내: border-[#242424] bg-[#1a1a1c] 로 변경 */}
        {/* 입력 form — 기존 로직 그대로, 클래스만: */}
        {/*   form: "flex gap-2 border-t border-[#242424] p-3" */}
        {/*   input: "min-w-0 flex-1 rounded-lg border border-[#3d3d3d] bg-transparent px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--dim)]/60" */}
        {/*     + onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} */}
        {/*   button: "shrink-0 rounded-lg bg-[var(--cobalt)] px-4 py-2.5 text-sm font-semibold text-black transition-opacity disabled:opacity-40" */}
      </div>
    </div>
  </div>
);
```

주석으로 표시한 클래스 교체를 실제 JSX에 적용한다 (메시지 map/form의 로직·속성은 그대로).

- [ ] **Step 3: 육안 확인**

```bash
cd /Users/howzero/howzero/ax-web && npm run dev
```

http://localhost:3300 — 채팅 카드가 #040404 다크, 인풋 포커스 시 보더가 웜톤으로 바뀌고 PulsingBorder 점화, 오브가 위에 떠 있으면 OK. 채팅 전송(스트리밍)이 여전히 동작하는지 1회 확인. 서버 종료.

- [ ] **Step 4: Commit**

```bash
cd /Users/howzero/howzero
git add ax-web/src/components/hero/ShaderFx.tsx ax-web/src/components/HeroChat.tsx
git commit -m "feat(ax-web): 히어로 채팅 다크 리스킨 + 리퀴드메탈 오브·펄싱 보더"
```

---

### Task 7: 3D 사원증 오버레이 (howzero 텍스처 절차 생성 + 물리 + 클릭 스크롤 + 폴백)

**Files:**
- Create: `ax-web/src/components/hero/lanyard-texture.ts`
- Create: `ax-web/src/components/hero/LanyardScene.tsx`
- Create: `ax-web/src/components/hero/LanyardBadge.tsx`

- [ ] **Step 1: howzero 카드 텍스처 절차 생성**

v0 브랜딩 PNG를 쓰지 않고 캔버스로 그린다. 텍스처 레이아웃(1376×1376, 카드 앞면 ≈ 좌측 절반, 텍스트 우정렬 x=633)은 레퍼런스 CardTemplate 좌표를 계승.

`ax-web/src/components/hero/lanyard-texture.ts`:

```ts
// card.glb UV 기준: 1376×1376 정사각 텍스처, 앞면 ≈ x 0~688 영역. (레퍼런스 CardTemplate 좌표 계승)
// 실명 금지 — 스펙 §3. 문구는 Founder 크리덴셜만.
const SIZE = 1376;

export function makeHowzeroCardTexture(): string {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // 배경 (앞·뒷면 공통)
  ctx.fillStyle = "#050505";
  ctx.fillRect(0, 0, SIZE, SIZE);

  const RIGHT = SIZE / 2 - 55; // 앞면 우측 여백선 (레퍼런스와 동일)

  // 앞면 상단 — 워드마크
  ctx.fillStyle = "#f97316";
  ctx.font = "800 110px 'Pretendard Variable', sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("howzero", 55, 190);

  ctx.fillStyle = "#9a9aa0";
  ctx.font = "500 40px 'IBM Plex Mono', monospace";
  ctx.fillText("AX EXECUTION PARTNER", 55, 280);

  // 앞면 하단 — 크리덴셜 (레퍼런스 name 슬롯 y≈976)
  ctx.textAlign = "right";
  ctx.fillStyle = "#ffffff";
  ctx.font = "600 52px 'IBM Plex Mono', monospace";
  ctx.fillText("FOUNDER", RIGHT, SIZE - 460);
  ctx.fillStyle = "#9a9aa0";
  ctx.font = "500 40px 'Pretendard Variable', sans-serif";
  ctx.fillText("연매출 10억 SaaS 운영자", RIGHT, SIZE - 396);

  // 오렌지 포인트 라인
  ctx.fillStyle = "#f97316";
  ctx.fillRect(55, SIZE - 340, 200, 6);

  // 뒷면 (x 740~1320) — 미니 워드마크만
  ctx.textAlign = "center";
  ctx.fillStyle = "#f97316";
  ctx.font = "800 72px 'Pretendard Variable', sans-serif";
  ctx.fillText("howzero", 1030, 640);

  return canvas.toDataURL("image/png");
}
```

- [ ] **Step 2: LanyardScene — 3D 물리 씬 포트**

레퍼런스 `components/ui/lanyard.tsx`(`/tmp/ref-lanyard`)를 기반으로 하되: 컨트롤/공유 UI 제거, 텍스처는 `makeHowzeroCardTexture()` 결과 고정, 카드 "클릭"(드래그 아님 — 이동 6px 미만·400ms 미만) 시 `onCardClick` 호출.

`ax-web/src/components/hero/LanyardScene.tsx` — 레퍼런스 파일을 복사한 뒤 아래 diff만 적용:

```tsx
/* eslint-disable react/no-unknown-property */
"use client";
// 레퍼런스 lanyard.tsx 대비 변경점:
// 1) import lanyard png 모듈 → 고정 경로 '/lanyard-rope.png'
// 2) props: cardTextureUrl 필수 → 내부에서 makeHowzeroCardTexture() 사용, onCardClick 추가
// 3) Band의 pointerDown/Up에서 클릭 판정 (이동<6px && 시간<400ms → onCardClick())
// 4) 컨트롤 UI 전부 제거, Canvas만 렌더

// ... (레퍼런스 Band/Canvas 구조 그대로. 아래는 변경되는 핵심부만 발췌)

import { useEffect, useRef, useState } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { useGLTF, useTexture, Environment, Lightformer } from "@react-three/drei";
import {
  BallCollider, CuboidCollider, Physics, RigidBody,
  useRopeJoint, useSphericalJoint, type RigidBodyProps,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import * as THREE from "three";
import { makeHowzeroCardTexture } from "./lanyard-texture";

extend({ MeshLineGeometry, MeshLineMaterial });

export default function LanyardScene({ onCardClick }: { onCardClick: () => void }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 20], fov: 20 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true }}
      onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), 0)}
    >
      <ambientLight intensity={Math.PI} />
      <Physics gravity={[0, -40, 0]} timeStep={1 / 60}>
        <Band onCardClick={onCardClick} />
      </Physics>
      <Environment blur={0.75}>
        {/* 레퍼런스의 Lightformer 4개 그대로 */}
        <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
      </Environment>
    </Canvas>
  );
}

function Band({ onCardClick, maxSpeed = 50, minSpeed = 0 }: { onCardClick: () => void; maxSpeed?: number; minSpeed?: number }) {
  // ... 레퍼런스 Band 그대로 (refs, joints, useFrame 루프, RigidBody 4개+card, meshline band)
  // 변경 1 — 텍스처:
  const [cardTexture, setCardTexture] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    const url = makeHowzeroCardTexture();
    if (!url) return;
    new THREE.TextureLoader().load(url, (t) => {
      t.flipY = false;
      t.colorSpace = THREE.SRGBColorSpace;
      setCardTexture(t);
    });
  }, []);
  // meshPhysicalMaterial 의 map={cardTexture ?? materials.base.map}

  // 변경 2 — 클릭 판정 (카드 group 의 pointer 핸들러에 추가):
  const downRef = useRef<{ x: number; y: number; t: number } | null>(null);
  // onPointerDown 기존 drag 로직 앞에:
  //   downRef.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY, t: Date.now() };
  // onPointerUp 기존 drag(false) 뒤에:
  //   const d = downRef.current;
  //   if (d && Math.hypot(e.nativeEvent.clientX - d.x, e.nativeEvent.clientY - d.y) < 6 && Date.now() - d.t < 400) onCardClick();

  // 변경 3 — 로프 텍스처: useTexture('/lanyard-rope.png')
  // (나머지는 레퍼런스와 동일하므로 생략 — 복사 후 위 3가지만 반영)
  return null as never; // ← 실제 구현에서는 레퍼런스 JSX 반환
}
```

**구현 지침**: 위 발췌의 "레퍼런스 그대로" 부분은 `/tmp/ref-lanyard/components/ui/lanyard.tsx` 109~278행(Band 전체)을 복사해서 변경점 3가지만 반영한다. `useGLTF('/card.glb')`, `isMobile` 분기는 제거(이 컴포넌트는 데스크톱 전용 — Badge 래퍼가 보장).

- [ ] **Step 3: LanyardBadge — 오버레이 래퍼 (게이팅 + 폴백 + 스크롤 페이드)**

`ax-web/src/components/hero/LanyardBadge.tsx`:

```tsx
"use client";

import { Component, type ReactNode, useEffect, useState } from "react";
import dynamic from "next/dynamic";

const LanyardScene = dynamic(() => import("./LanyardScene"), { ssr: false, loading: () => null });

// WebGL 실패 시 미표시 — 스펙 §3·§6 (이미지 폴백 없음)
class SilentBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function LanyardBadge() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // lg 이상 + WebGL 가능일 때만 로드 (모바일 미표시 — 스펙 §3)
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setEnabled(mq.matches && hasWebGL());
    update();
    mq.addEventListener("change", update);

    // 히어로를 벗어나면 페이드아웃
    const onScroll = () => setVisible(window.scrollY < window.innerHeight * 0.7);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      aria-hidden
      className="fixed right-4 top-14 z-40 h-[60vh] w-[280px] transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
    >
      <SilentBoundary>
        <LanyardScene
          onCardClick={() => document.getElementById("founder")?.scrollIntoView({ behavior: "smooth" })}
        />
      </SilentBoundary>
    </div>
  );
}
```

- [ ] **Step 4: 타입 체크 + 육안 확인**

```bash
cd /Users/howzero/howzero/ax-web && npx tsc --noEmit && npm run dev
```

확인 (데스크톱 뷰포트): 우상단에 사원증이 줄에 매달려 떨어지고, 드래그하면 흔들리고, 카드 앞면에 howzero 워드마크·FOUNDER 문구가 보이고, 짧게 클릭하면 스크롤 이동(#founder는 Task 8에서 생기므로 지금은 무동작이어도 OK). 텍스트가 뒤집혀 보이면 `lanyard-texture.ts`에서 `ctx.save(); ctx.translate(0, SIZE); ctx.scale(1, -1);` 로 y축 반전 후 그리는 보정 적용. 확인 후 서버 종료.

- [ ] **Step 5: Commit**

```bash
cd /Users/howzero/howzero
git add ax-web/src/components/hero/
git commit -m "feat(ax-web): 3D 사원증 오버레이 — howzero 절차 텍스처·rapier 물리·클릭 스크롤·폴백"
```

---

### Task 8: page.tsx 전면 재구성 + 진행방식 타임라인 + 폼 다크 + 마이크로 CTA

**Files:**
- Create: `ax-web/src/components/MicroCta.tsx`
- Create: `ax-web/src/components/ProcessTimeline.tsx`
- Modify: `ax-web/src/components/ContactForm.tsx` (클래스만)
- Modify: `ax-web/src/app/page.tsx` (전체 교체)

- [ ] **Step 1: MicroCta (채팅으로 스크롤 + 포커스)**

`ax-web/src/components/MicroCta.tsx`:

```tsx
"use client";

export default function MicroCta({ label = "→ 우리 회사도 되는지 물어보기" }: { label?: string }) {
  return (
    <button
      onClick={() => {
        document.getElementById("hero-chat")?.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          document.querySelector<HTMLInputElement>("#hero-chat input")?.focus({ preventScroll: true });
        }, 600);
      }}
      className="mt-8 font-[family-name:var(--font-mono)] text-sm font-semibold text-[var(--cobalt)] hover:underline"
    >
      {label}
    </button>
  );
}
```

- [ ] **Step 2: ProcessTimeline (정적 가로 4노드 — 캔버스와 같은 시각 언어)**

`ax-web/src/components/ProcessTimeline.tsx`:

```tsx
// 서버 컴포넌트 — 인터랙션 없음 (스펙 §2 #4)
const STEPS = [
  ["01", "진단", "업무 인벤토리 → 시간/빈도 → 오류 비용. 새는 곳을 숫자로 특정", "TRIGGER"],
  ["02", "설계", "자동화 적합성 판정과 우선순위. 효과 큰 것부터, 안 되는 건 안 된다고", "AI"],
  ["03", "구축", "직접 만듭니다. 기존 툴 연동부터 커스텀 개발까지 — 외주 하청 없음", "AI"],
  ["04", "운영", "굴러가는지까지 책임. 팀이 직접 쓰도록 정착시키고 유지보수", "RUNNING"],
] as const;

export default function ProcessTimeline() {
  return (
    <ol className="canvas-dots mt-10 grid gap-6 rounded-xl border border-[var(--line)] p-6 md:grid-cols-4 md:gap-0">
      {STEPS.map(([num, title, desc, badge], i) => (
        <li key={num} className="relative md:px-3">
          {i < 3 && (
            <span
              aria-hidden
              className="absolute right-[-12px] top-8 hidden h-px w-6 border-t border-dashed border-[var(--dim)]/40 md:block"
            />
          )}
          <div
            className={`rounded-lg border bg-[var(--card)] p-5 ${
              badge === "RUNNING" ? "border-[var(--ok)]/70" : badge === "AI" ? "border-[var(--cobalt)]/40" : "border-[var(--line)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-[family-name:var(--font-mono)] text-sm font-semibold text-[var(--cobalt)]">{num}</span>
              <span
                className={`rounded px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[9px] font-semibold text-black ${
                  badge === "RUNNING" ? "bg-[var(--ok)] pulse-dot" : badge === "AI" ? "bg-[var(--cobalt)]" : "bg-zinc-600"
                }`}
              >
                {badge}
              </span>
            </div>
            <h3 className="display mt-2 text-xl">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--dim)]">{desc}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 3: ContactForm 다크 클래스 스왑**

로직 무변경. 클래스만: `bg-white` → `bg-[var(--card)]`, 인풋들 `border-[var(--line)] bg-white` → `border-[var(--line)] bg-[var(--panel)] text-[var(--ink)]` (3개 input + 1개 textarea + 완료 메시지 박스).

- [ ] **Step 4: page.tsx 전체 교체**

```tsx
import HeroChat from "@/components/HeroChat";
import ContactForm from "@/components/ContactForm";
import MicroCta from "@/components/MicroCta";
import ProcessTimeline from "@/components/ProcessTimeline";
import OsCanvas from "@/components/os-canvas/OsCanvas";
import LanyardBadge from "@/components/hero/LanyardBadge";

// 카피 원천: docs/ax-business/04(서사)·06(메시지 뱅크)·07(차별점)·10(오퍼·가격)
// v2 스펙: docs/superpowers/specs/2026-07-09-ax-web-landing-v2-design.md
export default function Home() {
  return (
    <main>
      <LanyardBadge />

      {/* ── 네비 ── */}
      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--paper)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <span className="display text-lg">
            howzero<span className="text-[var(--cobalt)]">.</span>
          </span>
          <nav className="flex items-center gap-6 text-sm font-medium text-[var(--dim)]">
            <a href="#os" className="hidden hover:text-[var(--ink)] sm:block">OS 설계도</a>
            <a href="#process" className="hidden hover:text-[var(--ink)] sm:block">진행 방식</a>
            <a href="#pricing" className="hidden hover:text-[var(--ink)] sm:block">가격</a>
            <a href="#contact" className="btn-primary !px-4 !py-2 text-sm">무료 진단</a>
          </nav>
        </div>
      </header>

      {/* ── 1. 히어로: 채팅 센터 (C안) ── */}
      <section className="mx-auto flex max-w-4xl flex-col items-center px-5 pb-24 pt-16 text-center lg:pt-24">
        <p className="eyebrow rise rise-1">AX EXECUTION PARTNER — howzero</p>
        <h1 className="display rise rise-2 mt-4 text-4xl sm:text-5xl lg:text-6xl">
          반복업무 시간,
          <br />
          어떻게 0으로 만드나
        </h1>
        <p className="rise rise-3 mt-6 max-w-2xl text-lg leading-relaxed text-[var(--dim)]">
          단건 자동화가 아니라, 당신 회사만의 AI 운영 OS를 만듭니다.
          <br />
          연매출 <span className="num">10억</span> 이커머스 SaaS를 직접 운영하며 우리 회사부터 자동화했습니다 —{" "}
          검증한 것만 팝니다.
        </p>
        <div className="rise rise-4 mt-10 w-full max-w-3xl text-left">
          <HeroChat />
          <p className="mt-3 text-center text-xs text-[var(--dim)]">
            대화 내용은 진단 준비에만 사용됩니다. 폼이 편하시면{" "}
            <a href="#contact" className="text-[var(--cobalt)] underline">여기로</a>.
          </p>
        </div>
      </section>

      {/* ── 2. 시간이 새는 곳 ── */}
      <section className="border-y border-[var(--line)] bg-[var(--panel)]">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <p className="eyebrow">WHERE TIME LEAKS</p>
          <h2 className="display mt-3 max-w-2xl text-3xl sm:text-4xl">
            대표님 회사에서 시간이 새는 곳, 대부분 여기입니다
          </h2>
          {/* 수치는 셀러 증언 — blockquote 인용 맥락 유지, 독립 스탯 타일 금지 (스펙 §2) */}
          <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
            <blockquote className="border-l-2 border-[var(--line)] pl-5">
              <p className="text-lg font-semibold leading-relaxed">
                &ldquo;CS 티켓 하나에 <span className="num">8~12분</span>. 하루 30건이면{" "}
                <span className="num">5시간</span>이다. 대표가 그 5시간에 할 일이 정말 이건가.&rdquo;
              </p>
              <p className="mt-2 text-sm text-[var(--dim)]">셀러 증언 — 반복 문의 · 주문/배송 확인 · 반품 응대</p>
            </blockquote>
            <blockquote className="border-l-2 border-[var(--line)] pl-5">
              <p className="text-lg font-semibold leading-relaxed">
                &ldquo;사람을 줄이라는 게 아니다. <span className="text-[var(--cobalt)]">다음 채용을 미루라는</span>{" "}
                거다.&rdquo;
              </p>
              <p className="mt-2 text-sm text-[var(--dim)]">신입이 할 일의 몇 %가 반복업무인지부터 계산</p>
            </blockquote>
            <blockquote className="border-l-2 border-[var(--line)] pl-5">
              <p className="text-lg font-semibold leading-relaxed">
                &ldquo;재발송 한 번, 달래기 환불 한 번. 장부에는 한 줄도 안 잡히지만 마진은 알고 있다.&rdquo;
              </p>
              <p className="mt-2 text-sm text-[var(--dim)]">실수 비용 — 사람 문제가 아니라 구조 문제</p>
            </blockquote>
            <blockquote className="border-l-2 border-[var(--line)] pl-5">
              <p className="text-lg font-semibold leading-relaxed">
                &ldquo;매출이 2배가 되면 일도 2배가 되는 구조라면, 그 회사는{" "}
                <span className="text-[var(--cobalt)]">2배 매출을 못 받는다</span>.&rdquo;
              </p>
              <p className="mt-2 text-sm text-[var(--dim)]">대표가 병목인 회사는 대표의 하루가 매출 상한선</p>
            </blockquote>
          </div>
          <MicroCta />
        </div>
      </section>

      {/* ── 3. ★ 당신 회사의 OS — 인터랙티브 노드 캔버스 ── */}
      <section id="os" className="mx-auto max-w-6xl px-5 py-20">
        <p className="eyebrow">YOUR COMPANY&apos;S OS</p>
        <h2 className="display mt-3 max-w-3xl text-3xl sm:text-4xl">
          단건 자동화는 금방 복제됩니다.
          <br />
          회사 프로세스에 맞춘 운영 OS는 복제가 어렵습니다
        </h2>
        <p className="mt-4 max-w-2xl text-[var(--dim)]">
          프로세스와 데이터가 회사마다 다르고, 그걸 정립하는 과정 자체가 자산이 되기 때문입니다. 그래서 순서가
          중요합니다:
        </p>
        {/* 4단계 스텝퍼 */}
        <ol className="mt-6 flex flex-wrap items-center gap-2 font-[family-name:var(--font-mono)] text-sm">
          {["프로세스 정립", "플로우 정립", "잘게 쪼개기", "자동화"].map((step, i) => (
            <li key={step} className="flex items-center gap-2">
              {i > 0 && <span className="text-[var(--dim)]">→</span>}
              <span
                className={`rounded-full border px-3.5 py-1.5 ${
                  i === 3
                    ? "border-[var(--ok)]/70 text-[var(--ok)]"
                    : "border-[var(--line)] text-[var(--ink)]"
                }`}
              >
                {step}
              </span>
            </li>
          ))}
        </ol>
        <div className="mt-8">
          <OsCanvas />
        </div>
        <MicroCta />
      </section>

      {/* ── 4. 진행 방식 ── */}
      <section id="process" className="border-y border-[var(--line)] bg-[var(--panel)]">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <p className="eyebrow">PROCESS</p>
          <h2 className="display mt-3 text-3xl sm:text-4xl">진단 없이 견적 없습니다</h2>
          <p className="mt-4 max-w-2xl text-[var(--dim)]">
            AI 도입을 팔지 않습니다. 진단에서 &lsquo;주당 몇 시간이 어느 업무에서 새는지&rsquo;부터 숫자로
            뽑아드립니다. 판단은 숫자 보고 하면 됩니다.
          </p>
          <ProcessTimeline />
          <MicroCta />
        </div>
      </section>

      {/* ── 5. 창업자 + howzero 팀 ── */}
      <section id="founder" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
        <p className="eyebrow">TRACK RECORD</p>
        <h2 className="display mt-3 text-3xl sm:text-4xl">팔기 전에, 내가 썼다</h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--dim)]">
          저는 AI 컨설턴트가 되려고 AI를 배운 게 아닙니다. 제 이커머스 SaaS를{" "}
          <span className="num">연매출 10억</span> 규모로 직접 운영하면서, 반복업무에 갈리는 제 직원들의 일을
          먼저 자동화해야 했을 뿐입니다. 그 자동화가 실제로 굴러가는 걸 확인한 다음에야, 남의 회사에도 팔기
          시작했습니다.
        </p>
        <p className="mt-4 border-l-2 border-[var(--cobalt)] pl-4 font-[family-name:var(--font-mono)] text-sm text-[var(--dim)]">
          우리 첫 고객은 우리 회사였다 — 검증한 것만 판다.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--card)] p-6">
            <p className="num text-2xl">연매출 10억</p>
            <h3 className="mt-2 font-bold">이커머스 셀러 SaaS 운영</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--dim)]">
              4050 셀러를 위한 AI 도구 &lsquo;불사자&rsquo;를 직접 만들어 운영 중. 상품 데이터·크롤링·결제까지
              풀스택으로 굴리는 실제 사업.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--card)] p-6">
            <p className="font-[family-name:var(--font-mono)] text-2xl font-semibold">SaaS 연쇄 구축</p>
            <h3 className="mt-2 font-bold">하입덕 등 복수 제품 출시</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--dim)]">
              기획부터 개발·운영까지 외주 없이 직접. 전략만 말하는 컨설팅이 아니라 만들 수 있는 손이 있습니다.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--card)] p-6">
            <p className="font-[family-name:var(--font-mono)] text-2xl font-semibold">사내 자동화 실전</p>
            <h3 className="mt-2 font-bold">내 직원들의 반복업무부터 제거</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--dim)]">
              CS·정산·콘텐츠 업무를 먼저 우리 회사에서 자동화. 실패도 우리 돈으로 먼저 해봤습니다.
            </p>
          </div>
        </div>
        <MicroCta />
      </section>

      {/* ── 6. 가격 ── */}
      <section id="pricing" className="border-y border-[var(--line)] bg-[var(--panel)]">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <p className="eyebrow">PRICING</p>
          <h2 className="display mt-3 text-3xl sm:text-4xl">가격을 숨기지 않습니다</h2>
          <p className="mt-4 max-w-2xl text-[var(--dim)]">
            국내 AX 컨설팅 대부분이 &lsquo;상담 후 견적&rsquo;입니다. 우리는 기준가를 먼저 공개합니다. 아래는
            파일럿 기간 기준가이며, 진단 후 업무 범위에 따라 확정됩니다.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <div className="flex flex-col rounded-xl border border-[var(--line)] bg-[var(--card)] p-7">
              <h3 className="display text-xl">무료 진단</h3>
              <p className="num mt-3 text-3xl">0원</p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--dim)]">
                30분 대화 + 업무 인벤토리 리포트. 어디서 몇 시간이 새는지 숫자로 받아보세요. 진단만 받고
                끝내셔도 됩니다.
              </p>
              <a href="#contact" className="btn-primary mt-6 justify-center">진단 신청</a>
            </div>
            <div className="flex flex-col rounded-xl border-2 border-[var(--cobalt)] bg-[var(--card)] p-7">
              <h3 className="display text-xl">착수 — 오딧 + 구축</h3>
              <p className="num mt-3 text-3xl">300~700만원</p>
              <p className="mt-1 font-[family-name:var(--font-mono)] text-xs text-[var(--dim)]">
                셀러/소규모 기준 · SMB 700~2,000만원
              </p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--dim)]">
                우선순위 1~2개 업무를 실제로 자동화해 인도. 결과는 시간·비용 before/after로 보고합니다.
              </p>
              <a href="#contact" className="btn-primary mt-6 justify-center">상담 신청</a>
            </div>
            <div className="flex flex-col rounded-xl border border-[var(--line)] bg-[var(--card)] p-7">
              <h3 className="display text-xl">운영 리테이너</h3>
              <p className="num mt-3 text-3xl">월 50~150만원</p>
              <p className="mt-1 font-[family-name:var(--font-mono)] text-xs text-[var(--dim)]">
                셀러/소규모 기준 · SMB 월 150~500만원
              </p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--dim)]">
                구축한 자동화의 모니터링·개선 + 새 업무 자동화 확장. 필요 없으면 언제든 종료.
              </p>
              <a href="#contact" className="btn-primary mt-6 justify-center">상담 신청</a>
            </div>
          </div>
          <p className="mt-6 text-xs text-[var(--dim)]">
            GPT 구독료만 내는 회사와 업무 구조를 바꾼 회사 — 1년 뒤 차이는 급여 명세서에서 드러납니다.
          </p>
        </div>
      </section>

      {/* ── 7. CTA + 폼 ── */}
      <section id="contact" className="mx-auto max-w-3xl scroll-mt-20 px-5 py-20">
        <p className="eyebrow text-center">FREE DIAGNOSIS</p>
        <h2 className="display mt-3 text-center text-3xl sm:text-4xl">
          어디서 시간이 새는지,
          <br />
          숫자로 받아보세요
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-[var(--dim)]">
          연락처만 남기시면 1영업일 내 연락드립니다. 진단은 무료고, 영업 전화로 괴롭히지 않습니다.
        </p>
        <div className="mt-10">
          <ContactForm />
        </div>
      </section>

      <footer className="border-t border-[var(--line)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-8 text-xs text-[var(--dim)] sm:flex-row">
          <span className="font-[family-name:var(--font-mono)]">© 2026 howzero</span>
          <span>당신 회사만의 AI 운영 OS를 만드는 AX 실행 파트너</span>
        </div>
      </footer>
    </main>
  );
}
```

- [ ] **Step 5: 잔여 `하우제로` 없는지 확인 + 테스트 + 빌드**

```bash
cd /Users/howzero/howzero/ax-web
grep -rn "하우제로" src/ && echo "잔여 있음 — 치환 필요" || echo "clean"
npm test && npx tsc --noEmit && npm run build
```

Expected: `clean` + 테스트/타입/빌드 전부 통과.

- [ ] **Step 6: Commit**

```bash
cd /Users/howzero/howzero
git add ax-web/src/
git commit -m "feat(ax-web): v2 페이지 재구성 — OS 서사 7섹션·타임라인·마이크로 CTA·폼 다크"
```

---

### Task 9: 검증 게이트 (E2E 수동 체크 + README 갱신)

**Files:**
- Modify: `ax-web/README.md` (구조 설명 v2 반영)

- [ ] **Step 1: 전체 자동 검증**

```bash
cd /Users/howzero/howzero/ax-web && npm test && npx tsc --noEmit && npm run build
```

Expected: vitest 전부 PASS (prompt/ratelimit/presets), tsc 0 errors, build 성공.

- [ ] **Step 2: 수동 E2E 체크리스트** (`npm run dev` 켜고 데스크톱+모바일 뷰포트)

- [ ] 채팅: 메시지 전송 → 스트리밍 응답 수신
- [ ] 채팅 포커스: 보더 웜톤 전환 + PulsingBorder 점화
- [ ] 사원증(lg+): 드래그로 흔들림 / 짧은 클릭 → #founder 스크롤 / 스크롤 내리면 페이드아웃
- [ ] 사원증 텍스처: howzero 워드마크 정방향 표시 (v0 흔적 없음)
- [ ] OS 캔버스: 탭 4개 전환 / 노드 드래그 / 노드 클릭 → 상세 카드 / Running 뱃지 펄스
- [ ] 모바일(<768px): 캔버스 대신 세로 리스트, 사원증 미표시
- [ ] 마이크로 CTA: 클릭 → 채팅으로 스크롤 + 인풋 포커스
- [ ] 폼 제출 → 접수 완료 메시지
- [ ] 리드 저장 확인 (dev 서버 **내리고**):

```bash
cd /Users/howzero/howzero/ax-web
node -e "const {PGlite}=require('@electric-sql/pglite');new PGlite('./.pglite').query('SELECT source,name,contact,pain_summary,created_at FROM leads ORDER BY id DESC LIMIT 5').then(r=>console.table(r.rows))"
```

- [ ] **Step 3: README 구조 섹션 갱신**

README의 "## 구조" 부분에 추가:

```markdown
- `src/components/hero/` — ShaderFx(오브·펄싱보더) + LanyardBadge/LanyardScene(3D 사원증)
- `src/components/os-canvas/` — 인터랙티브 OS 노드 캔버스 (presets 4종 + react-flow)
- v2 스펙: `../docs/superpowers/specs/2026-07-09-ax-web-landing-v2-design.md`
```

- [ ] **Step 4: 최종 Commit**

```bash
cd /Users/howzero/howzero
git add ax-web/README.md
git commit -m "docs(ax-web): README v2 구조 반영"
```

---

## Self-Review 결과 (플랜 작성 시점)

- 스펙 §2~§8 전 요구사항 → Task 2(테마)·3(표기)·4-5(캔버스)·6(채팅)·7(사원증)·8(페이지/타임라인/CTA/폼)·9(검증)로 커버. §9 스코프 제외 항목은 플랜에 없음(의도).
- 스펙 §5의 `framer-motion`은 CSS 트랜지션으로 대체(Task 1 근거 명시) — 스펙 대비 유일한 의도적 편차.
- LanyardScene은 레퍼런스 278행 포트라 플랜에는 변경점 3가지+발췌만 수록, 원본 참조 경로 명시 — "Similar to" 금지 원칙의 예외가 아니라 외부 레퍼런스 복사 지시임.
