---
name: zipsaja-design
description: Use this skill to generate well-branded interfaces and assets for 집사자 (zipsaja), a Korean Instagram real-estate carousel brand for 20–30s first-home buyers. Covers Instagram carousel cards (1080×1440), brand voice (반말 친구 톤), the orange-on-beige + black-bordered visual system, mascot usage, and ready-made UI kit components.
user-invocable: true
---

# 집사자 (zipsaja) Design Skill

집사자는 **20–30대 부린이·신혼부부를 위한 부동산 큐레이션 인스타그램 계정**이다. 노란 사자 마스코트가 반말로 친구처럼 매물을 정리해준다. 시각 톤은 **베이지 배경 + 오렌지 액센트 + 검은 굵은 테두리**.

## 시작하기

1. **`README.md` 를 먼저 읽어라.** 브랜드 보이스·시각 토큰·금지 사항이 모두 정리되어 있다.
2. **`colors_and_type.css` 를 모든 출력물에 import** 하라. 여기에 색·타이포·핵심 패턴(`.zs-pill` `.zs-box` `.zs-box-cream` `.zs-box-check` `.zs-hl` `.zs-stamp`) 이 다 들어 있다.
3. **`ui_kits/carousel/`** 의 컴포넌트와 샘플 10장 캐러셀을 참조하라. 이게 사실상 유일한 출력 표면이다.
4. **`assets/mascots/`** 에서 마스코트 PNG 를 골라 써라. 표정으로 톤을 잡는다 (10종: hero / default / blank / smile / happy / shining / surprise / worried / angry / side).

## 결과물 만드는 규칙

- **반드시 반말. 친근한 친구 톤.** 존댓말·도발·위협·이모지 금지.
- **오렌지 (`#EA2E00`) 는 유일한 액센트.** 그라디언트 금지. 형광펜도 오렌지만.
- **베이지 (`#F0E7D6`) 가 캔버스 기본 배경.** 흰색은 사진 박스 등 보조용.
- **검은 3px 테두리 + 16px radius** 가 모든 박스의 기본형.
- **슬라이드 = 1080×1440 (3:4)**, 10장 구성: 커버 → 도입 → 조건 → 매물 5개 → 정리 → CTA.
- **슬라이드 = 1메시지** 원칙. 빈 공간은 디자인의 일부.
- 마스코트 말풍선은 **Gaegu** 폰트. 헤드라인·본문은 **Gmarket Sans** (Bold/Medium), 폴백 **Noto Sans KR**.

## 출력 형식

- **시각 산출물 (캐러셀, 목업, 일회성 프로토)** — 자산을 `assets/` 에서 복사하고 자체 완결적 HTML 을 작성해 사용자에게 보여라. PNG 가 필요하면 1080×1440 으로 캡처하라.
- **프로덕션 코드** — `colors_and_type.css` 를 import 하고 README 의 시각 가이드 + 컴포넌트 패턴을 따라라.

## 사용자가 컨텍스트 없이 이 스킬을 호출했다면

먼저 묻는다:
- 무엇을 만들 건가? (단일 슬라이드 / 10장 캐러셀 / 인스타 스토리 / 프로필 비주얼?)
- 매물·주제·예산·지역 정보가 있는가?
- 마스코트 표정 선호가 있는가? (안 정해주면 hero 기본)

그 다음 expert designer 처럼 HTML 산출물을 만들어 보여라.
