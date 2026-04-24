# 하이아웃풋클럽 (@highoutputclub) 브랜드 프리셋

## 기본 정보

- **핸들**: @highoutputclub
- **이름**: HIGH OUTPUT CLUB (하이아웃풋클럽)
- **슬로건**: "결국 해내는 사람들"
- **분야**: 1인 사업가 비즈니스 교육 / 숫자 감각 / 재무·회계 리터러시 / 피어러닝 커뮤니티
- **한 줄 소개**: 1인 사업가, 브랜드 오너, 프리랜서의 성장을 돕는 온라인 교육 & 피어러닝 커뮤니티. 감이 아니라 숫자로 사업한다.

## 타겟 오디언스

- 1인 사업가 / 브랜드 오너 / 프리랜서
- "내 것"을 하는 사람들 — 독립적 비즈니스 운영자
- 매출은 나지만 숫자(재무/회계) 감각이 부족한 창업가
- 감으로 사업하다 한계를 느끼는 사람들

## 톤앤매너

- **존댓말 + 코칭 톤**: "~하세요", "~입니다", "~봐야 합니다"
- **논리적 설득**: 주장 → 이유 → 실행 방법 3단 구조
- **팩트 기반**: 젠틀몬스터, 이카루스 등 실제 기업 케이스로 증명
- **실용적 교육**: 이론이 아니라 "당장 해볼 수 있는 것" 중심
- **핵심 문구 반복**: "이익은 의견이고, 현금은 사실입니다" 같은 원라이너로 앵커링
- **위협/도발 없음**: 차분한 전문가 톤. 불안 조장 대신 실력 축적 강조

### 좋은 문장 예시
- "이익은 의견이고, 현금은 사실입니다"
- "감으로 선택하는 습관이 반복되면 나중에 큰 크 다칠 여지가 있습니다"
- "숫자 감각은 고차원 수학이 아닙니다. 더하기 빼기가 거의 전부이고, 반복만이 감각을 키웁니다"
- "성장률이 높아도 현금이 고갈되면 오히려 더 위험할 수 있습니다"

### 나쁜 문장 (이 스타일에서 금지)
- "이거 모르면 망합니다" (위협 → 톤 깨짐)
- "단 3일만에 매출 10배!" (과장 → 신뢰 깨짐)
- 반말 / 친근 톤 (커뮤니티 브랜드지만 콘텐츠는 전문가 톤 유지)

## 디자인 토큰

| 요소 | 값 |
|------|------|
| **배경** | `#0a0a0a` ~ `#111111` (딥 블랙) + 반투명 사진 오버레이 |
| **텍스트 (본문)** | `#FFFFFF` (순백) |
| **텍스트 (보조)** | `rgba(255,255,255,0.7)` (연한 흰색) |
| **Headline 액센트** | `#00D4FF` (시안/민트) — 번호, 제목, 핵심 키워드 |
| **강조 볼드** | `#FFFFFF` 볼드 — 본문 내 핵심 문장 |
| **Headline 폰트** | `Noto Sans KR 900` (Extra Bold) |
| **Body 폰트** | `Noto Sans KR 400~700` |
| **번호 폰트** | `Noto Sans KR 900` + 시안 컬러 |
| **푸터 텍스트** | `rgba(255,255,255,0.5)` 작은 사이즈 |
| **CTA 강조** | `#00D4FF` 배경 + 검정 텍스트 (인라인 pill) |

### Google Fonts CDN

```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap" rel="stylesheet">
```

## 규칙 — 스타일 DNA

### 반드시 할 것

- **다크 배경 + 사진 오버레이**: 순수 검정이 아니라 관련 사진(금속 바 차트, 지폐, 노트북, 분기별 리포트 등)을 어둡게 깔고(`brightness(0.2~0.3)`) 그 위에 텍스트 배치. 프리미엄/에디토리얼 느낌.
- **시안 번호 제목**: 모든 본문 슬라이드는 `XX. 제목문장` 형태. 번호와 제목은 `#00D4FF` 시안. 마침표 포함.
- **3단 구조**: 시안 제목 → 흰색 설명 2~3줄 → 볼드 핵심 문장 or 불릿 리스트
- **체크 불릿**: 실행 항목은 `✔` 체크마크 + 볼드 텍스트
- **원형 번호 불릿**: 순서가 있는 항목은 `①②③` 형태
- **푸터 바**: 모든 슬라이드 하단에 `하이아웃풋클럽 | 결국 해내는 사람들` (좌) + `@highoutputclub` (우). 연한 흰색, 작은 폰트.
- **커버 슬라이드**: 큰 흰색 볼드 제목 + 아래 작은 서브카피. 배경은 주제와 관련된 3D 오브젝트/사진.
- **CTA 슬라이드**: "댓글로 'OO'을 남겨주시면 원문 아티클을 DM으로 보내드립니다!" 패턴. 키워드를 시안 pill로 강조.
- **마지막 슬라이드**: 커뮤니티 단체 사진 + 커뮤니티 소개 + 부트캠프/이벤트 안내.

### 절대 하지 말 것

| 금지 | 이유 |
|------|------|
| 밝은 배경 (흰색/크림) | 다크 프리미엄이 브랜드 정체성 |
| 여러 색상 혼용 | 시안 하나 + 흰색만. 다른 액센트 금지 |
| 손글씨/캐주얼 폰트 | Noto Sans KR 고딕 계열만 |
| 이모지 | 체크마크(✔), 원형숫자(①)만 허용 |
| 반말/캐주얼 톤 | 전문가 존댓말 유지 |
| 과장/하이프 | "10배 성장", "단 3일" 류 금지 |
| 그라디언트 텍스트/네온 효과 | 시안은 flat color만 |
| 마스코트/캐릭터 | 사진 기반 비주얼만 사용 |

## 공통 컴포넌트 CSS

```css
body {
  font-family: 'Noto Sans KR', sans-serif;
  color: #fff;
  background: #0a0a0a;
}

.slide {
  width: 1080px; height: 1350px;
  background: #0a0a0a;
  position: relative;
  overflow: hidden;
}

/* 배경 사진 오버레이 */
.slide-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: brightness(0.25);
  z-index: 0;
}

.slide-content {
  position: relative;
  z-index: 1;
  padding: 80px 70px 100px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 시안 번호 제목 */
.hoc-title {
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 900;
  font-size: 52px;
  line-height: 1.3;
  color: #00D4FF;
  margin-bottom: 40px;
}

/* 본문 */
.hoc-body {
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 400;
  font-size: 32px;
  line-height: 1.7;
  color: rgba(255,255,255,0.85);
}
.hoc-body strong {
  font-weight: 700;
  color: #fff;
}

/* 볼드 핵심 문장 */
.hoc-emphasis {
  font-weight: 700;
  font-size: 34px;
  color: #fff;
  line-height: 1.6;
  margin-top: 30px;
}

/* 체크 불릿 리스트 */
.hoc-checklist {
  list-style: none;
  padding: 0;
  margin-top: 36px;
}
.hoc-checklist li {
  font-weight: 700;
  font-size: 32px;
  color: #fff;
  line-height: 1.6;
  margin-bottom: 12px;
}
.hoc-checklist li::before {
  content: '✔ ';
  color: #00D4FF;
}

/* 원형 번호 리스트 */
.hoc-numlist {
  text-align: center;
  margin-top: 30px;
}
.hoc-numlist p {
  font-size: 30px;
  line-height: 1.8;
  color: rgba(255,255,255,0.85);
}

/* CTA pill — 시안 배경 */
.hoc-cta-pill {
  display: inline-block;
  background: #00D4FF;
  color: #0a0a0a;
  font-weight: 900;
  font-size: 34px;
  padding: 8px 28px;
  border-radius: 8px;
  margin: 8px 0;
}

/* 커버 제목 */
.hoc-cover-title {
  font-weight: 900;
  font-size: 76px;
  line-height: 1.2;
  color: #fff;
  text-align: center;
}

.hoc-cover-sub {
  font-weight: 400;
  font-size: 28px;
  color: rgba(255,255,255,0.6);
  text-align: center;
  margin-top: 24px;
}

/* 푸터 */
.hoc-footer {
  position: absolute;
  bottom: 30px;
  left: 70px;
  right: 70px;
  display: flex;
  justify-content: space-between;
  font-size: 22px;
  color: rgba(255,255,255,0.4);
  z-index: 1;
}
```

## 슬라이드 구조 (9장 캐러셀)

1. **커버** — 큰 흰색 볼드 제목 + 서브카피 + 주제 관련 3D/사진 배경
2. **01. 첫 번째 포인트** — 시안 번호 제목 + 설명 + 기업 케이스 이미지
3. **02. 두 번째 포인트** — 시안 번호 제목 + 원형 번호 리스트 (①②③)
4. **03. 세 번째 포인트** — 시안 번호 제목 + 불릿 리스트 (성장성/수익성/안정성/효율성)
5. **04. 네 번째 포인트** — 시안 번호 제목 + 체크 리스트 (✔)
6. **05. 다섯 번째 포인트** — 시안 번호 제목 + 다이어그램/차트 포함
7. **06. 여섯 번째 포인트** — 시안 번호 제목 + 축 분류 프레임워크
8. **CTA** — "더 많은 인사이트가 궁금하다면?" + 댓글 DM 유도 + 멤버십 토크 썸네일
9. **커뮤니티 소개** — 단체 사진 + "HIGH OUTPUT CLUB" 로고 + 부트캠프 신청 안내

## CTA 패턴

- "댓글로 'OO'을 남겨주시면 원문 아티클을 DM으로 보내드립니다!"
- 키워드는 시안 pill로 강조 (예: `'사업'`)
- 마지막 슬라이드에서 부트캠프/사전알림 유도
- "지금, 프로필 링크에서 <지옥의 매출 부트캠프> 사전알림을 할 수 있습니다"

## 비주얼 소스

배경 사진으로 사용할 소재 유형:
- 메탈릭 3D 바 차트 (매출/수익 시각화)
- 지폐/현금 클로즈업 (현금 흐름 주제)
- 노트/수첩 클로즈업 (숫자 노트 주제)
- 분기별 리포트/달력 (시간축 주제)
- 커뮤니티 단체 사진 (마지막 슬라이드)

모든 배경 사진은 `filter: brightness(0.2~0.3)`으로 어둡게 처리.

## 다른 브랜드와의 차이점

| | 하우제로 | 용감한용팀장 | 집사자 | 데일리AI툰 | **하이아웃풋클럽** |
|---|---|---|---|---|---|
| **분야** | AI 자동화 | 구매대행/SEO | 부동산 | AI 웹툰 | **1인 사업 재무** |
| **배경** | 크림 밝은톤 | 따뜻한 크림 | 순백 | 순백 | **딥 블랙 + 사진** |
| **액센트** | 파스텔 형광펜 | 붉은/골드 | 노란 pill | 빨간 리본 | **시안 (#00D4FF)** |
| **톤** | 안티하이프 직설 | 팩트 폭격 도발 | 친구 반말 | 부부 유머 | **전문가 존댓말** |
| **CTA** | 무료 오딧 | 단톡방 | 팔로우/저장 | 없음 | **댓글 DM + 부트캠프** |
| **Headline** | Nanum Pen Script | Black Han Sans | Jua | Black Han Sans | **Noto Sans KR 900** |

## 키워드

`highoutputclub`, `하이아웃풋클럽`, `결국해내는사람들`, `1인사업가`, `숫자감각`, `재무리터러시`, `다크프리미엄`, `시안액센트`, `코칭톤`, `noto-sans-kr`
