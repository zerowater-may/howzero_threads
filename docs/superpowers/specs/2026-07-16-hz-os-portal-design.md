# hz-os — howzero AX 프로젝트 포털 스펙

> 2026-07-16 · 목표: 영업 미팅(녹음·정보)을 프로젝트 단위로 만들고, 고객·직원이 양방향으로 소통하며 진행 과정을 보는 SaaS.
> 레퍼런스: manyfast.io 에디터 기능 세트(블록 에디터·트리 뷰·코멘트·보기 전용 공유·RBAC·내보내기·AI·버전). **기능 동등, 구현·디자인은 자체(shadcn)** — 카피·디자인 모방 금지.

## 1. 포지션

윤자동 벤치마킹에서 확인한 "2~3일마다 화면 확인" 프로세스를 제품화한 것. 왕십리 사례에서 수동으로 한 일(녹음 → 전사 → 니즈 정리 → 고객 공유)을 시스템으로.

## 2. 스택

- `hz-os/` 신규 Next.js(App Router) + Tailwind v4 + **shadcn/ui** (다크, ax-web 코발트 토큰 계승), port 3400
- 에디터: **Plate** (shadcn registry 배포 에디터) — 블록 편집(제목/리스트/표/코드/인용/이미지/체크리스트), 마크다운 단축키
- DB: ax-web 패턴 재사용 — `DATABASE_URL`(postgres.js) / 로컬 PGlite 폴백. 스키마 부팅 적용(IF NOT EXISTS)
- AI: OpenRouter(기존 키) — 전사 요약·니즈 추출·문서 초안
- 전사: 로컬 mlx-whisper 파이프라인은 운영자 수동(후속 자동화), MVP는 전사 텍스트 업로드/붙여넣기

## 3. 역할 모델 (MVP)

- **staff**: env 비밀번호 로그인(단일 계정) → 세션 쿠키. 전체 CRUD
- **client**: 프로젝트별 **초대 토큰 링크** `/share/<token>` — 회원가입 없음. 열람 + 코멘트 작성만
- RBAC 확장(조직/멤버)은 후속

## 4. 데이터 모델

- `projects` id, name, client_name, status(진단|설계|구축|운영), share_token, created_at
- `documents` id, project_id, parent_id(트리), title, content(JSON, Plate), visibility(internal|shared), updated_at
- `doc_versions` id, document_id, content, saved_at — 저장 시 스냅샷(형상관리 MVP)
- `meetings` id, project_id, title, held_at, transcript(TEXT), summary(TEXT), needs(JSON)
- `updates` id, project_id, body, kind(progress|decision|ask), author_role(staff|client), created_at — 진행 타임라인
- `comments` id, project_id, target_type(document|update|meeting), target_id, author_role, author_name, body, created_at — 양방향 소통

## 5. 화면

- `/login` — staff 비밀번호
- `/` — 프로젝트 리스트(상태 뱃지, 최근 업데이트)
- `/p/[id]` — 개요: 상태 스텝퍼(진단→설계→구축→운영), 업데이트 타임라인(+작성), 미팅 목록, 공유 링크 관리
- `/p/[id]/docs` + `/docs/[docId]` — 좌측 문서 트리(디렉토리 뷰) + Plate 에디터, 저장 시 버전 스냅샷, 문서별 공개 여부 토글, 마크다운 내보내기
- `/p/[id]/meetings/[mid]` — 전사 뷰어 + "AI 요약/니즈 추출" 버튼 → summary/needs 저장 → 문서로 변환 버튼
- `/share/[token]` — 고객 뷰: 개요·shared 문서·업데이트 열람 + 코멘트 작성(이름 입력). internal 문서 비노출

## 6. manyfast 기능 대응표

| manyfast | hz-os MVP | 후속 |
|---|---|---|
| 블록 에디터 | Plate (shadcn) | 실시간 공동 편집(CRDT) |
| 트리/디렉토리 뷰 | 문서 트리 사이드바 | 드래그 정렬 |
| 코멘트/피드백 | comments (문서·업데이트·미팅) | 인라인 앵커 코멘트 |
| 보기 전용 공유 | share_token 고객 뷰 | 문서 단위 링크 |
| RBAC | staff/client 2역할 | 조직·멤버·권한 |
| 형상관리 | doc_versions 스냅샷+목록 | diff 뷰 |
| 내보내기 | 마크다운 | 엑셀·이미지 |
| AI | 전사 요약·니즈 추출·문서 초안 | 와이어프레임류는 비목표 |

## 7. 비목표 (MVP)

실시간 동시 편집, 결제, 조직 가입, 와이어프레임 생성, 모바일 앱. 보안: staff 쿠키 httpOnly, 토큰 32바이트 랜덤, internal 문서는 share 라우트에서 쿼리 레벨 차단.

## 8. 검증 게이트

vitest(토큰/트리/버전 로직), tsc, build, E2E: 프로젝트 생성→문서 작성→고객 링크 열람→고객 코멘트→staff 확인 왕복.
