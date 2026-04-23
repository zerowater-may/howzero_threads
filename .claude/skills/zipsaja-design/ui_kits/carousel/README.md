# Carousel UI Kit

Instagram-feed 캐러셀 한 종 — 집사자의 유일한 출력 표면.

- **사이즈**: 1080×1440px (3:4)
- **장 수**: 10장 (커버 → 도입 → 조건 → 매물 5개 → 정리 → CTA). 샘플은 8장 수록.
- **공통 chrome**: `slide.css` (`.zs-slide`, `.zs-num`, `.zs-foot`, `.zs-bubble`).
- **토큰**: `../../colors_and_type.css` import 필수.

## 파일

| 파일 | 슬라이드 | 역할 |
|------|---------|------|
| `index.html` | — | 8장 그리드 미리보기 |
| `slide.css` | — | 슬라이드 chrome (footer / num / bubble) |
| `slide-01-cover.html` | 01 | HOOK — 큰 hero + 마스코트 |
| `slide-02-intro.html` | 02 | HOOK CONFIRM — 조건 도입 |
| `slide-03-conditions.html` | 03 | VALUE — 조건 4개 (크림 배경) |
| `slide-04-listing.html` | 04 | VALUE — 매물 #1 디테일 |
| `slide-05-listing.html` | 05 | VALUE — 매물 #2 디테일 |
| `slide-06-checkpoint.html` | 06 | VALUE — Check Point 노란 박스 |
| `slide-07-summary.html` | 07 | VALUE — 5개 요약 (크림 배경) |
| `slide-08-cta.html` | 08 | CTA — 다크 + DM 유도 |

## 패턴 메모

- 슬라이드마다 마스코트 1마리 + 말풍선 1개 (필수는 아님, 그러나 시그니처).
- 슬라이드 번호는 우상단 노란 pill (`.zs-num`).
- footer 좌측 `@zipsaja` 핸들 + 마스코트 미니, 우측 페이지 번호 + `→`.
- 다크 슬라이드는 CTA 1장에서만. 마스코트는 `filter:invert(1)` 로 흰색 처리.
- 강조 컬러는 노란 1색만. 그라디언트·이모지 금지 (단 매물 메타에 일부 유니코드 사용 — 디자이너가 라인 아이콘으로 교체 권장).

## TODO / 한계

- 슬라이드 09(추가 정보) 누락 — 8장만 작성. 콘텐츠 따라 9, 10장으로 확장.
- 매물 메타에 임시 유니코드 (🚇 🏫 등) 사용. 브랜드 룰엔 이모지 금지이므로 Lucide 라인 아이콘으로 교체 권장.
- 마스코트 12종 중 4종만 첨부됨 (hero / blank / surprise / angry). 나머지 표정 추가 시 더 풍부한 톤 표현 가능.
