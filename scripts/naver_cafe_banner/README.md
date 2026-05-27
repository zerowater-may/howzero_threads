# naver_cafe_banner

불사자 네이버 카페 대문용 배너 PNG 렌더러. HTML 템플릿을 Puppeteer 로 960×360 PNG 로 굽는다.

설계 spec: `docs/superpowers/specs/2026-05-27-bulsaja-naver-cafe-renewal-design.md`
실행 plan: `docs/superpowers/plans/2026-05-27-bulsaja-naver-cafe-renewal.md`

## 셋업

```bash
cd scripts/naver_cafe_banner
npm install
```

## 렌더

```bash
# 둘 다
npm run render:all

# 따로
npm run render:braveyong
npm run render:bulsaja
```

산출물:

- `brands/braveyong/braveyong_misc_naver-cafe-banner.png` — 1920×720 px (deviceScaleFactor 2, 표시 960×360)
- `brands/bulsaja/bulsaja_misc_naver-cafe-banner.png` — 동일

## 네이버 카페에 적용하는 절차

1. 두 PNG 를 네이버 카페 스마트에디터에 일단 업로드 (어느 게시판 임시글에 첨부) → `cafefiles.pstatic.net/...png` URL 확인
2. `brands/howzero/howzero_misc_naver-cafe-bulsaja-renewal.html` 열어서 `IMG_BRAVEYONG_URL`, `IMG_BULSAJA_URL` 토큰을 그 URL 로 swap
3. 카페 관리 → 메뉴 관리 → 대문 관리 → HTML 편집 모드에 전체 붙여넣기
4. 미리보기 → 저장

## 카피 / 톤 수정하기

각 배너 카피는 HTML 템플릿 상단에 직접 박혀 있다. `banner-*.html` 의 `.headline`, `.sub`, `.cta`, `.label`, `.badge`, `.right-stamp` 안 텍스트만 수정 후 재렌더하면 된다.

## 디자인 제약 (지킬 것)

- 용팀장 = 순흑백 + 빨간 손글씨 (Gaegu) 액센트. 강한 팩폭 카피.
- 불사자 = 웜 베이지 `#FAF6F0` + 다크 그레이 텍스트. 오렌지 `#FF5A00` 은 CTA 1곳 + 배지 도트만. 대면적 오렌지 X, Sparkles X, 이모지 X. (`~/.claude/skills/bulsaja-design/SKILL.md` 절대 가드)
