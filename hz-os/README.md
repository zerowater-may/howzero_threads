# hz-os — howzero AX 프로젝트 포털

영업 미팅(녹음 전사·정보)을 프로젝트 단위로 만들고, 고객과 직원이 양방향으로 소통하며 진행 과정을 함께 보는 포털. 스펙: `../docs/superpowers/specs/2026-07-16-hz-os-portal-design.md`

## 실행

```bash
cp .env.example .env.local   # HZOS_PASSWORD, OPENROUTER_API_KEY 채우기
npm install
npm run dev                  # http://localhost:3400
```

DB는 PGlite(`./.pglite`) 기본, `DATABASE_URL`(Supabase Transaction pooler 6543) 넣으면 실 Postgres로 자동 전환. 스키마는 부팅 시 적용(IF NOT EXISTS). 서버 종료는 Ctrl+C(SIGINT) — SIGTERM kill은 직전 쓰기 유실 가능(ax-web과 동일 특성).

## 핵심 루프

1. 스태프 로그인(HZOS_PASSWORD) → 프로젝트 생성 (상태: 진단→설계→구축→운영)
2. 미팅 전사 붙여넣기 → **AI 분석**(요약+니즈 추출, OpenRouter) → 문서로 변환
3. 문서 트리에서 마크다운 에디터로 작성 (자동저장 2초, 저장마다 버전 스냅샷, 복원 가능)
4. 문서 공개 토글(internal/shared) + 공유 토큰 발급 → 고객에게 `/share/<token>` 링크 전달
5. 고객: 진행 스텝퍼·업데이트·공유 문서 열람, 질문/코멘트 작성 (회원가입 없음)
6. 스태프: 고객 질문 확인·답변, 진행 업데이트 기록

## 구조

- `src/lib/db.ts` — DATABASE_URL/PGlite 어댑터 · `src/lib/auth.ts` — staff HMAC 쿠키 세션 + 공유 토큰
- `src/lib/actions/` — projects/documents/meetings/share 서버 액션 (share만 무인증+토큰 검증)
- `src/app/p/[id]/` — 개요(스텝퍼·타임라인·미팅) / `docs/` 문서 트리+에디터 / `meetings/[mid]` 전사+AI 분석
- `src/app/share/[token]/` — 고객 뷰 (internal 문서는 쿼리 레벨 404)
- 에디터: 마크다운(+GFM: 표·체크리스트) 기반. Plate 블록 에디터 승격은 후속 (기본 레지스트리에 리스트/표 미포함이라 보류)

## 검증

`npm test`(md-export·meeting-analysis) · `npx tsc --noEmit` · `npm run build` · Playwright 실브라우저 E2E 9단계(로그인→생성→공유→고객 왕복) 통과 (2026-07-16)

## 후속 (스펙 §6)

실시간 공동 편집, 인라인 앵커 코멘트, 문서 단위 공유 링크, 조직/멤버 RBAC, 엑셀·이미지 내보내기, 녹음 파일 업로드→자동 전사(mlx-whisper 파이프라인 연결)
