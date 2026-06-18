# YouTube -> Carousel Pipeline Result

- URL: `https://youtu.be/oTxHFTjY_fY?si=xuGtUFKH1wsygA3n`
- 영상 ID: `oTxHFTjY_fY`
- 제목: `직장인 부동산 투자자가 온라인 셀링을 시작한 이유`
- 브랜드: `braveyong`
- 최종 산출물: 10장 인스타그램 캐러셀 PNG
- 리메이크: v7 dy1.mag 매거진 포맷 + 원본 영상 맥락 복구

## A. 수집

- MCPTube ingest: 완료
  - 저장 위치: `source/mcptube-wiki/`
  - 주의: MCPTube transcript는 YouTube subtitle API 429로 비었음.
  - Gemini 기반 분류/wiki page export는 생성됨.
- yt_highlights fallback: 완료
  - transcript segment: 659개
  - scene: 215개
  - highlight span: 12개
  - frame: 23장
- 고화질 보정: 완료
  - 기존 yt-dlp 소스가 640x360으로 받아져 프레임이 저화질로 보였음
  - 4K 소스 `source/highres/oTxHFTjY_fY.mp4` 재다운로드
  - 캐러셀 사용 프레임 6장 `2160x1216`로 재추출
- agent 분할: 완료
  - `agents/collection/` — Transcript, Frame, Wiki, Source Risk
  - `agents/brief/` — Claim, Counter, Persona, CTA
  - `agents/storyboard/` — slide-agent-01 ~ slide-agent-10
  - `agents/render/` — Layout, Copy Fit, Visual, Render
  - `agents/qa/` — Fact Check, Overclaim, IG Crop, Brand Tone, Publish Check

## B. 해석

- `idea-brief.md` v2 작성
- `storyboard.md` v7 작성
- 핵심 프레임:
  - 부동산 20개 정도를 보유한 투자자도 현금흐름을 따로 고민했다는 원본 맥락
  - 월급만으로 노후 대비가 어렵다는 영상 초반 문제 제기
  - 온라인 셀링은 큰돈을 묶지 않고 상품 하나씩 반응을 보는 선택지로 해석
  - 네이버 상위노출은 상품명/카테고리/키워드 검증 문제
  - AI 딸깍/쉽게 번다 프레임은 피하고, 기준과 시스템화 메시지로 정리
  - 매출 인증은 보장이나 자랑이 아니라 구조를 뜯어보는 장면으로 처리

## C. 렌더

- `slides.html` 생성
- `capture.mjs`로 2160x2700 PNG 10장 캡처
- `contact-sheet.png` 생성
- 영상 캡처 프레임은 `frames/`에 포함
- v7 디자인 포맷 반영:
  - dy1.mag 레퍼런스 기반 1080x1350 매거진형 레이아웃
  - 풀블리드 커버 + 흰 배경 + 큰 사진 + 중앙 본문 + 밑줄 강조
  - 하단 우측 검정 진행 마커
  - 마지막 검정 CTA 슬라이드는 상품명/카테고리/팔린 상품 키워드 체크로 마감
