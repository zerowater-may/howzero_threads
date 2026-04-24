# HowZero Dashboard Rebrand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fork paperclipai/paperclip → hedgehogcandy/howzero-dashboard, rebrand to HowZero with light blue theme + Korean/English i18n.

**Architecture:** pnpm monorepo (server + ui + cli + packages). UI is React+Vite+Tailwind4. Server is Express+Drizzle+PostgreSQL. Branding is spread across 18 packages, 50+ env vars, CSS theme vars, and hard-coded UI strings.

**Tech Stack:** TypeScript, React 19, Vite 6, Tailwind CSS 4, Express 5, Drizzle ORM, pnpm workspaces

---

## Task 1: Fork 및 레포 초기화

**Files:**
- Modify: root `package.json`
- Modify: `pnpm-workspace.yaml` (verify)
- Modify: `.git/config` (remote)

- [ ] **Step 1: 레포를 새 디렉토리로 복사**

```bash
cp -R /Users/zerowater/Dropbox/zerowater/paperclip /Users/zerowater/Dropbox/zerowater/howzero-dashboard
cd /Users/zerowater/Dropbox/zerowater/howzero-dashboard
rm -rf .git
git init
```

- [ ] **Step 2: GitHub 레포 생성 및 연결**

```bash
gh repo create hedgehogcandy/howzero-dashboard --private --source=. --remote=origin
```

- [ ] **Step 3: 초기 커밋**

```bash
git add -A
git commit -m "초기 커밋: paperclip 포크 기반"
```

---

## Task 2: 전체 문자열 치환 — 패키지명 및 브랜딩

**Files:** 모든 `package.json` (18개), 모든 소스 파일

- [ ] **Step 1: 패키지명 치환 (@paperclipai → @howzero)**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero-dashboard

# package.json 내 패키지 이름/의존성 치환
find . -name "package.json" -not -path "*/node_modules/*" -exec sed -i '' \
  -e 's/@paperclipai\//@howzero\//g' \
  -e 's/"paperclipai"/"howzero-cli"/g' \
  -e 's/"paperclip"/"howzero"/g' \
  -e 's/paperclipai\/paperclip/hedgehogcandy\/howzero-dashboard/g' {} +
```

- [ ] **Step 2: 소스 코드 import 경로 치환**

```bash
# TypeScript/JS 소스 내 @paperclipai → @howzero
find . \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.mjs" \) \
  -not -path "*/node_modules/*" -exec sed -i '' \
  -e 's/@paperclipai\//@howzero\//g' {} +
```

- [ ] **Step 3: 환경변수 접두사 치환 (PAPERCLIP_ → HOWZERO_)**

```bash
find . \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.sh" -o -name "*.yml" -o -name "*.yaml" -o -name "*.env*" -o -name "Dockerfile*" -o -name "docker-compose*" \) \
  -not -path "*/node_modules/*" -exec sed -i '' \
  -e 's/PAPERCLIP_/HOWZERO_/g' {} +
```

- [ ] **Step 4: 나머지 paperclip 문자열 치환**

```bash
# 소문자 paperclip → howzero (변수명, 경로, 키 등)
find . \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.mjs" -o -name "*.json" -o -name "*.md" -o -name "*.yml" -o -name "*.yaml" -o -name "*.sh" -o -name "*.css" \) \
  -not -path "*/node_modules/*" -not -path "*/.git/*" -exec sed -i '' \
  -e 's/paperclip\.theme/howzero.theme/g' \
  -e 's/paperclip-commit-metrics/howzero-commit-metrics/g' \
  -e 's/hermes-paperclip-adapter/hermes-howzero-adapter/g' \
  -e 's/create-paperclip-plugin/create-howzero-plugin/g' {} +
```

- [ ] **Step 5: 사용자 표시 텍스트 치환 (Paperclip → HowZero)**

```bash
find . \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" -exec sed -i '' \
  -e 's/Paperclip/HowZero/g' {} +
```

주의: lucide-react `<Paperclip>` 아이콘 import는 그대로 유지해야 함 (이건 클립 아이콘임).

- [ ] **Step 6: lucide Paperclip 아이콘 import 복원**

```bash
# Paperclip 아이콘은 lucide-react 컴포넌트이므로 원복
find . \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" -exec sed -i '' \
  -e 's/from "lucide-react".*HowZero/from "lucide-react"...Paperclip/g' {} +
```

수동 확인 필요: `grep -rn "HowZero" ui/src/components/ --include="*.tsx" | grep -i lucide` 로 확인 후 직접 수정.

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "브랜딩 치환: paperclip → howzero (패키지명, import, env vars, UI 텍스트)"
```

---

## Task 3: CSS 테마 — enrichlabs 스타일 라이트 UI

**Files:**
- Modify: `ui/src/index.css`
- Modify: `ui/src/context/ThemeContext.tsx`

- [ ] **Step 1: index.css 테마 변수 교체**

`:root` 섹션을 다음으로 교체:

```css
:root {
  color-scheme: light;
  --radius: 12px;
  --background: #FAFBFC;
  --foreground: #1A1A2E;
  --card: #FFFFFF;
  --card-foreground: #1A1A2E;
  --popover: #FFFFFF;
  --popover-foreground: #1A1A2E;
  --primary: #2563EB;
  --primary-foreground: #FFFFFF;
  --secondary: #F1F5F9;
  --secondary-foreground: #334155;
  --muted: #F8FAFC;
  --muted-foreground: #64748B;
  --accent: #EFF6FF;
  --accent-foreground: #1E40AF;
  --destructive: #EF4444;
  --destructive-foreground: #FFFFFF;
  --border: #E2E8F0;
  --input: #E2E8F0;
  --ring: #2563EB;
  --chart-1: #2563EB;
  --chart-2: #10B981;
  --chart-3: #F59E0B;
  --chart-4: #8B5CF6;
  --chart-5: #EC4899;
  --sidebar: #FFFFFF;
  --sidebar-foreground: #1A1A2E;
  --sidebar-primary: #2563EB;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: #EFF6FF;
  --sidebar-accent-foreground: #1E40AF;
  --sidebar-border: #F1F5F9;
  --sidebar-ring: #2563EB;
}
```

- [ ] **Step 2: dark 테마 제거**

`index.css`에서 `.dark { ... }` 블록 전체 삭제.
dark mode 스크롤바 스타일링 블록도 삭제.

- [ ] **Step 3: radius 변수 통일**

```css
@theme inline {
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
}
```

- [ ] **Step 4: ThemeContext 수정 — light only**

`ui/src/context/ThemeContext.tsx`를 수정하여:
- 기본 테마를 `"light"`로 고정
- `toggleTheme` 함수를 no-op으로 변경
- `document.documentElement`에서 `.dark` 클래스 제거 보장

```typescript
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Force light theme always
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", "#FFFFFF");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: "light", toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

- [ ] **Step 5: Pretendard 폰트 적용**

`ui/index.html`에 추가:

```html
<link rel="stylesheet" as="style" crossorigin
  href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
```

`ui/src/index.css` body에 추가:

```css
body {
  font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
}
```

- [ ] **Step 6: 커밋**

```bash
git add -A
git commit -m "테마 변경: enrichlabs 스타일 라이트 UI (블루 액센트, 라운드, Pretendard)"
```

---

## Task 4: i18n 시스템 구축

**Files:**
- Create: `ui/src/i18n/ko.json`
- Create: `ui/src/i18n/en.json`
- Create: `ui/src/i18n/index.ts`
- Create: `ui/src/context/I18nContext.tsx`

- [ ] **Step 1: 한국어 번역 파일 생성**

`ui/src/i18n/ko.json`:

```json
{
  "nav": {
    "dashboard": "업무현황판",
    "agents": "AI 직원",
    "issues": "업무",
    "myIssues": "내 업무",
    "projects": "프로젝트",
    "routines": "루틴",
    "goals": "목표",
    "approvals": "승인 요청",
    "costs": "비용",
    "activity": "활동 내역",
    "inbox": "알림함",
    "settings": "설정",
    "skills": "스킬",
    "orgChart": "조직도",
    "companies": "회사 목록"
  },
  "agent": {
    "title": "AI 직원",
    "newAgent": "AI 직원 추가",
    "status": "상태",
    "idle": "대기 중",
    "running": "실행 중",
    "paused": "일시 정지",
    "stopped": "중지됨",
    "adapter": "실행 엔진",
    "reportsTo": "상위 직원",
    "budget": "예산",
    "capabilities": "담당 업무"
  },
  "issue": {
    "title": "업무",
    "newIssue": "업무 추가",
    "open": "진행 중",
    "closed": "완료",
    "backlog": "대기",
    "inProgress": "진행 중",
    "done": "완료",
    "priority": "우선순위",
    "assignee": "담당자",
    "description": "설명",
    "comments": "코멘트",
    "documents": "문서"
  },
  "project": {
    "title": "프로젝트",
    "newProject": "프로젝트 추가",
    "workspace": "작업공간"
  },
  "dashboard": {
    "title": "업무현황판",
    "activeAgents": "활동 중인 AI 직원",
    "openIssues": "진행 중인 업무",
    "recentActivity": "최근 활동"
  },
  "approval": {
    "title": "승인 요청",
    "approve": "승인",
    "reject": "거부",
    "pending": "대기 중"
  },
  "goal": {
    "title": "목표",
    "newGoal": "목표 추가"
  },
  "routine": {
    "title": "루틴",
    "schedule": "스케줄",
    "enabled": "활성",
    "disabled": "비활성"
  },
  "costs": {
    "title": "비용",
    "monthly": "월간",
    "daily": "일간"
  },
  "settings": {
    "title": "설정",
    "company": "회사 설정",
    "instance": "인스턴스 설정",
    "general": "일반",
    "experimental": "실험적 기능"
  },
  "common": {
    "save": "저장",
    "cancel": "취소",
    "delete": "삭제",
    "edit": "수정",
    "create": "생성",
    "search": "검색",
    "filter": "필터",
    "loading": "로딩 중...",
    "noResults": "결과 없음",
    "confirm": "확인",
    "back": "뒤로",
    "close": "닫기",
    "export": "내보내기",
    "import": "가져오기"
  },
  "auth": {
    "signIn": "로그인",
    "signUp": "회원가입",
    "signOut": "로그아웃",
    "email": "이메일",
    "password": "비밀번호"
  },
  "brand": {
    "name": "HowZero",
    "tagline": "AI 직원이 일하고, 대표님은 확인만"
  }
}
```

- [ ] **Step 2: 영어 번역 파일 생성**

`ui/src/i18n/en.json`:

```json
{
  "nav": {
    "dashboard": "Dashboard",
    "agents": "AI Employees",
    "issues": "Tasks",
    "myIssues": "My Tasks",
    "projects": "Projects",
    "routines": "Routines",
    "goals": "Goals",
    "approvals": "Approvals",
    "costs": "Costs",
    "activity": "Activity",
    "inbox": "Inbox",
    "settings": "Settings",
    "skills": "Skills",
    "orgChart": "Org Chart",
    "companies": "Companies"
  },
  "agent": {
    "title": "AI Employees",
    "newAgent": "Add AI Employee",
    "status": "Status",
    "idle": "Idle",
    "running": "Running",
    "paused": "Paused",
    "stopped": "Stopped",
    "adapter": "Engine",
    "reportsTo": "Reports To",
    "budget": "Budget",
    "capabilities": "Capabilities"
  },
  "issue": {
    "title": "Tasks",
    "newIssue": "New Task",
    "open": "Open",
    "closed": "Closed",
    "backlog": "Backlog",
    "inProgress": "In Progress",
    "done": "Done",
    "priority": "Priority",
    "assignee": "Assignee",
    "description": "Description",
    "comments": "Comments",
    "documents": "Documents"
  },
  "project": {
    "title": "Projects",
    "newProject": "New Project",
    "workspace": "Workspace"
  },
  "dashboard": {
    "title": "Dashboard",
    "activeAgents": "Active AI Employees",
    "openIssues": "Open Tasks",
    "recentActivity": "Recent Activity"
  },
  "approval": {
    "title": "Approvals",
    "approve": "Approve",
    "reject": "Reject",
    "pending": "Pending"
  },
  "goal": {
    "title": "Goals",
    "newGoal": "New Goal"
  },
  "routine": {
    "title": "Routines",
    "schedule": "Schedule",
    "enabled": "Enabled",
    "disabled": "Disabled"
  },
  "costs": {
    "title": "Costs",
    "monthly": "Monthly",
    "daily": "Daily"
  },
  "settings": {
    "title": "Settings",
    "company": "Company Settings",
    "instance": "Instance Settings",
    "general": "General",
    "experimental": "Experimental"
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "search": "Search",
    "filter": "Filter",
    "loading": "Loading...",
    "noResults": "No results",
    "confirm": "Confirm",
    "back": "Back",
    "close": "Close",
    "export": "Export",
    "import": "Import"
  },
  "auth": {
    "signIn": "Sign In",
    "signUp": "Sign Up",
    "signOut": "Sign Out",
    "email": "Email",
    "password": "Password"
  },
  "brand": {
    "name": "HowZero",
    "tagline": "Your AI employees work, you just review"
  }
}
```

- [ ] **Step 3: i18n hook 생성**

`ui/src/i18n/index.ts`:

```typescript
import ko from "./ko.json";
import en from "./en.json";

export type Locale = "ko" | "en";
export type TranslationKeys = typeof ko;

const translations: Record<Locale, TranslationKeys> = { ko, en };

export function getTranslation(locale: Locale): TranslationKeys {
  return translations[locale] ?? translations.ko;
}

/**
 * Resolve a dotted key path like "nav.dashboard" to a value.
 */
export function t(translations: TranslationKeys, key: string): string {
  const parts = key.split(".");
  let current: unknown = translations;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return key;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : key;
}
```

- [ ] **Step 4: I18nContext 생성**

`ui/src/context/I18nContext.tsx`:

```tsx
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { type Locale, type TranslationKeys, getTranslation, t as tFn } from "../i18n";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  translations: TranslationKeys;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "howzero.locale";

function detectLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "ko" || stored === "en") return stored;
  } catch {}
  const browserLang = navigator.language?.toLowerCase() ?? "";
  if (browserLang.startsWith("ko")) return "ko";
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);
  const translations = getTranslation(locale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try { localStorage.setItem(STORAGE_KEY, newLocale); } catch {}
  }, []);

  const t = useCallback((key: string) => tFn(translations, key), [translations]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, translations }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
```

- [ ] **Step 5: App.tsx에 I18nProvider 래핑**

`ui/src/App.tsx`에서 최상위에 `<I18nProvider>` 추가:

```tsx
import { I18nProvider } from "./context/I18nContext";

// 기존 providers 위에 감싸기:
<I18nProvider>
  <ThemeProvider>
    {/* ... existing app ... */}
  </ThemeProvider>
</I18nProvider>
```

- [ ] **Step 6: 커밋**

```bash
git add -A
git commit -m "i18n 시스템 추가: 한국어/영어 지원 (useI18n hook, 브라우저 감지)"
```

---

## Task 5: 사이드바 + 네비게이션 한국어/영어 적용

**Files:**
- Modify: `ui/src/components/Sidebar.tsx`
- Modify: `ui/src/components/SidebarNavItem.tsx`
- Modify: `ui/src/components/SidebarAgents.tsx`
- Modify: `ui/src/components/SidebarProjects.tsx`
- Modify: `ui/src/components/CompanyRail.tsx`
- Modify: `ui/src/components/MobileBottomNav.tsx`
- Modify: `ui/src/components/BreadcrumbBar.tsx`
- Modify: `ui/src/context/BreadcrumbContext.tsx`

- [ ] **Step 1: BreadcrumbContext에서 "Paperclip" → "HowZero" 확인**

`ui/src/context/BreadcrumbContext.tsx`에서 document title이 "HowZero"로 바뀌었는지 확인. Task 2의 치환에서 처리되었을 것이나 검증 필요:

```bash
grep -n "HowZero\|Paperclip" ui/src/context/BreadcrumbContext.tsx
```

- [ ] **Step 2: Sidebar 컴포넌트에 useI18n 적용**

`ui/src/components/Sidebar.tsx`에서 하드코딩된 라벨을 `t()` 호출로 교체. 예:

```tsx
import { useI18n } from "../context/I18nContext";

// 컴포넌트 내부:
const { t } = useI18n();

// "Dashboard" → t("nav.dashboard")
// "Agents" → t("nav.agents")
// "Issues" → t("nav.issues")
// "Projects" → t("nav.projects")
// "Routines" → t("nav.routines")
// "Goals" → t("nav.goals")
// "Approvals" → t("nav.approvals")
// "Activity" → t("nav.activity")
// "Costs" → t("nav.costs")
```

- [ ] **Step 3: 언어 전환 토글 추가**

사이드바 하단 또는 설정에 언어 전환 버튼 추가:

```tsx
const { locale, setLocale } = useI18n();

<button
  onClick={() => setLocale(locale === "ko" ? "en" : "ko")}
  className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded"
>
  {locale === "ko" ? "EN" : "한국어"}
</button>
```

- [ ] **Step 4: 주요 페이지 타이틀에 i18n 적용**

각 페이지 (Dashboard.tsx, Agents.tsx, Issues.tsx 등)의 페이지 헤더/타이틀 텍스트를 `t()` 호출로 교체.

- [ ] **Step 5: 커밋**

```bash
git add -A
git commit -m "네비게이션/사이드바 i18n 적용 + 언어 전환 토글"
```

---

## Task 6: 빌드 확인 및 정리

**Files:**
- Modify: `README.md`
- Modify: `.env.example`
- Modify: `docker-compose.yml`

- [ ] **Step 1: pnpm install로 의존성 확인**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero-dashboard
pnpm install
```

에러가 나면 패키지명 치환에서 누락된 부분을 수정.

- [ ] **Step 2: TypeScript 타입 체크**

```bash
pnpm typecheck
```

타입 에러 수정 (주로 import 경로 변경에서 발생).

- [ ] **Step 3: UI 빌드 확인**

```bash
pnpm --filter @howzero/ui build
```

- [ ] **Step 4: 서버 빌드 확인**

```bash
pnpm --filter @howzero/server build
```

- [ ] **Step 5: .env.example 업데이트**

```bash
sed -i '' 's/PAPERCLIP_/HOWZERO_/g' .env.example
```

- [ ] **Step 6: README.md 업데이트**

기본 정보 HowZero로 변경:

```markdown
# HowZero Dashboard

AI 직원 업무 관리 대시보드. Paperclip 오픈소스 기반.

## 시작하기

\`\`\`bash
pnpm install
pnpm dev
\`\`\`
```

- [ ] **Step 7: docker-compose.yml 확인**

서비스 이름 및 env 변수가 howzero로 바뀌었는지 확인.

- [ ] **Step 8: 최종 커밋 + 푸시**

```bash
git add -A
git commit -m "빌드 수정 + README/env/docker 업데이트"
git push -u origin main
```

---

## Task Summary

| Task | 내용 | 예상 시간 |
|------|------|----------|
| 1 | Fork + 레포 초기화 | 5분 |
| 2 | 전체 문자열 치환 (패키지/코드/env) | 15분 |
| 3 | CSS 테마 (라이트 블루 + Pretendard) | 10분 |
| 4 | i18n 시스템 (ko/en JSON + hook + context) | 15분 |
| 5 | 사이드바/네비 i18n 적용 + 언어 토글 | 20분 |
| 6 | 빌드 확인 + 정리 | 15분 |
