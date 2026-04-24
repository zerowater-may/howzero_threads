# HowZero Dashboard - Paperclip Rebrand Spec

> **Date**: 2026-04-01
> **Source**: paperclipai/paperclip (MIT) → hedgehogcandy/howzero-dashboard

---

## Overview

Paperclip AI 에이전트 관리 플랫폼을 "HowZero" 브랜드로 리브랜딩. 마케팅 자동화 B2B SaaS 고객(대표/경영진)이 AI 직원 업무현황을 확인하는 대시보드로 전환.

## Scope

### 1. 브랜딩 치환

| From | To |
|------|-----|
| `paperclip` | `howzero` |
| `Paperclip` | `HowZero` |
| `PAPERCLIP` | `HOWZERO` |
| `@paperclipai/*` | `@howzero/*` |
| `paperclipai/paperclip` | `hedgehogcandy/howzero-dashboard` |

### 2. 테마 — enrichlabs 스타일 라이트 UI

Dark mode 제거. Light only.

```css
:root {
  --background: #FAFBFC;
  --foreground: #1A1A2E;
  --primary: #2563EB;          /* Blue-600 */
  --primary-foreground: #FFFFFF;
  --secondary: #F1F5F9;        /* Slate-100 */
  --secondary-foreground: #334155;
  --muted: #F8FAFC;
  --muted-foreground: #64748B;
  --accent: #EFF6FF;           /* Blue-50 */
  --accent-foreground: #1E40AF;
  --card: #FFFFFF;
  --card-foreground: #1A1A2E;
  --border: #E2E8F0;
  --input: #E2E8F0;
  --ring: #2563EB;
  --sidebar: #FFFFFF;
  --sidebar-primary: #2563EB;
  --sidebar-accent: #EFF6FF;
  --sidebar-border: #F1F5F9;
  --radius: 12px;
}
```

Font: `Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif`

### 3. i18n — 한국어 + 영어

JSON 기반 번역 파일:

```
ui/src/i18n/
  ko.json
  en.json
  index.ts    # useTranslation hook
```

Key terms:

| Key | ko | en |
|-----|-----|-----|
| agent | AI 직원 | AI Employee |
| agents | AI 직원 목록 | AI Employees |
| issue | 업무 | Task |
| issues | 업무 목록 | Tasks |
| dashboard | 업무현황판 | Dashboard |
| project | 프로젝트 | Project |
| workspace | 작업공간 | Workspace |
| run | 실행 기록 | Run History |
| approval | 승인 요청 | Approval |
| goal | 목표 | Goal |
| routine | 루틴 | Routine |
| activity | 활동 내역 | Activity |
| inbox | 알림함 | Inbox |
| settings | 설정 | Settings |
| company | 회사 | Company |
| costs | 비용 | Costs |
| org_chart | 조직도 | Org Chart |

### 4. 레포 구조

```
hedgehogcandy/howzero-dashboard/
├── cli/          (CLI 도구)
├── packages/     (adapters, db, shared, plugins)
├── server/       (Express 백엔드)
├── ui/           (React + Vite 프론트엔드)
├── docker/
├── docs/
└── scripts/
```

### 5. Out of Scope (Phase 2)

- 마케팅 랜딩페이지
- 에이전트 프리셋 (이커머스 CS, 마케팅 콘텐츠)
- 커스텀 대시보드 위젯
- 모바일 앱

---

## Implementation Steps

1. Fork paperclip → howzero-dashboard 레포 생성
2. 전체 `paperclip` → `howzero` 문자열 치환 (파일명 + 내용)
3. CSS 테마 변수 교체 (dark mode 제거, blue accent)
4. Pretendard 폰트 적용
5. i18n 시스템 구축 (ko.json, en.json, useTranslation hook)
6. UI 컴포넌트에 번역 키 적용
7. border-radius 12px 적용
8. 빌드 확인 + 로컬 실행 테스트
