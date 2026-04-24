# 최고수준 (@highestlevel33) 브랜드 프리셋

## 기본 정보

- **핸들**: @highestlevel33
- **이름**: 최고수준
- **분야**: AI 시대 1인 기업 / 케이스 스터디 / 창업 스토리텔링
- **한 줄 소개**: AI 도구로 혼자 수천억 매출을 만드는 1인 유니콘 시대의 케이스 스터디를 뼈 때리는 스토리텔링으로 전달.
- **포맷**: 인스타그램 캐러셀 (사진 중심 매거진 스타일, 9장)

## 타겟 오디언스

- AI로 1인 창업을 꿈꾸는 사람
- 스타트업/테크 케이스 스터디에 관심 있는 직장인
- "1인 유니콘" 트렌드에 민감한 얼리어답터
- 해외 테크 소식을 한글로 소비하고 싶은 사람들

## 톤앤매너

- **뼈 때리는 팩트 나열**: "시드 투자 0원", "직원은 동생 엘리엇 1명", "첫해 매출이 5,500억이 됐다"
- **다(~다) 체 종결**: "팔았다", "시작했다", "대체한다" — 신문 기사/르포 톤
- **숫자 강박**: 모든 문장에 구체적 숫자. $179, 25만 명, 2,600만원, 2개월, 1조.
- **볼드 키워드 강조**: 핵심 단어만 **볼드** 처리. 형광펜 없이 볼드만으로 시선 유도.
- **영문 고유명사 원문 유지**: ChatGPT, Claude, Medvi, Hims & Hers, Geocities 등
- **카테고리 태그**: 슬라이드 좌상단에 `Case Study`, `Founder`, `Origin`, `Launch`, `AI Stack`, `vs Hims&Hers`, `Impact` 등 영문 태그 pill

### 좋은 문장 예시
- "노숙자출신 아저씨가 이 AI툴 쓰고 혼자 1조 매출"
- "월 $179 다이어트약, 25만 명에게 팔았다"
- "그는 노숙자 출신이었다"
- "2,600만원으로 2개월 만에 런칭"
- "AI 1명이 1,000명을 대체한다"

### 나쁜 문장 (이 스타일에서 금지)
- "여러분도 할 수 있습니다!" (동기부여 톤 → 르포 톤 깨짐)
- "꿀팁 알려드릴게요~" (친근 톤 → 이 계정은 냉정한 팩트)
- 이모지, 반말, 질문형 훅

## 디자인 토큰

| 요소 | 값 |
|------|------|
| **배경 (본문 영역)** | `#FFFFFF` (순백) |
| **배경 (CTA 슬라이드)** | `#FFFFFF` (순백 — 미니멀) |
| **사진 영역** | 슬라이드 상단 50~60% (풀 블리드 사진) |
| **텍스트 영역** | 슬라이드 하단 40~50% (순백 배경) |
| **텍스트** | `#1a1a1a` |
| **카테고리 태그** | `#1a1a1a` 텍스트 + `rgba(255,255,255,0.85)` 배경 pill (사진 위) |
| **메타 라벨** | `#E91E63` (핫핑크) — 카테고리 소제목 (MEDVI, AGE 5, 7 AI TOOLS 등) |
| **CTA 텍스트** | `#E91E63` (핫핑크) — "댓글에 '최고수준' 입력!" |
| **구분선** | `#1a1a1a` 2px solid, 24px 너비 (제목 위 짧은 바) |
| **Headline 폰트** | `Noto Sans KR 900` (Extra Bold) |
| **Body 폰트** | `Noto Sans KR 400~700` |
| **Meta 폰트** | 영문 sans-serif, letter-spacing 넓게 (2~4px), uppercase |
| **핸들** | `@highestlevel33` 우상단, 연한 회색 |

### Google Fonts CDN

```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap" rel="stylesheet">
```

## 규칙 — 스타일 DNA

### 반드시 할 것

- **상단 사진 + 하단 텍스트 2분할**: 모든 본문 슬라이드는 상단에 풀 블리드 사진(50~60%), 하단에 순백 텍스트 영역(40~50%). 매거진/에디토리얼 레이아웃.
- **카테고리 태그 pill**: 사진 위 좌상단에 반투명 흰 배경 pill (`Case Study`, `Founder`, `Origin`, `Launch`, `AI Stack`, `Impact` 등). 둥근 모서리.
- **핫핑크 메타 라벨**: 텍스트 영역 상단에 `#E91E63` 색상의 영문 소문자/대문자 라벨 (예: `MEDVI`, `AGE 5`, `7 AI TOOLS`, `HEAD TO HEAD`, `1 = 1,000`). letter-spacing 넓게.
- **짧은 구분선**: 핫핑크 라벨과 제목 사이에 `#1a1a1a` 색상 짧은 가로선 (약 24px).
- **제목은 2~3줄 임팩트**: Noto Sans KR 900으로 크고 굵게. 줄바꿈으로 리듬.
- **본문은 3~4줄 팩트**: 구체적 숫자 + 볼드 키워드. 간결하게.
- **핸들 우상단**: `@highestlevel33` 연한 회색으로 사진 위 우상단.
- **커버 슬라이드**: 사진 전체 + 하단에 큰 흰 볼드 텍스트 오버레이. 핸들 하단 중앙.
- **CTA 슬라이드**: 순백 배경 + 중앙 정렬. 핸들 + 구분선 + 볼드 제목 + 핫핑크 CTA 문구.

### 절대 하지 말 것

| 금지 | 이유 |
|------|------|
| 컬러 배경 / 그라디언트 | 순백 + 사진만. 매거진 톤 유지 |
| 형광펜 / pill 하이라이트 | 볼드만으로 강조. 형광펜 쓰면 카드뉴스 느낌 남 |
| 이모지 / 아이콘 | 사진과 텍스트만. 미니멀 |
| 마스코트 / 캐릭터 | 실사 사진 기반 |
| 반말 / 친근 톤 | 르포/다큐 톤 유지 (~다 체) |
| 번호 매기기 (01. 02.) | 카테고리 태그로 흐름 표현 |
| 체크리스트 / 불릿 | 문장형 서술만 |

## 공통 컴포넌트 CSS

```css
body {
  font-family: 'Noto Sans KR', sans-serif;
  color: #1a1a1a;
  background: #fff;
}

.slide {
  width: 1080px; height: 1350px;
  background: #fff;
  position: relative;
  overflow: hidden;
}

/* 상단 사진 영역 (50~60%) */
.slide-photo {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 55%;
  background-size: cover;
  background-position: center;
}

/* 카테고리 태그 pill — 사진 위 좌상단 */
.category-tag {
  position: absolute;
  top: 28px; left: 28px;
  background: rgba(255,255,255,0.85);
  color: #1a1a1a;
  font-size: 22px;
  font-weight: 500;
  padding: 8px 20px;
  border-radius: 8px;
  z-index: 2;
}

/* 핸들 — 사진 위 우상단 */
.handle {
  position: absolute;
  top: 30px; right: 28px;
  font-size: 20px;
  color: rgba(255,255,255,0.7);
  z-index: 2;
}

/* 하단 텍스트 영역 */
.slide-text {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 45%;
  background: #fff;
  padding: 40px 48px 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 핫핑크 메타 라벨 */
.meta-label {
  font-size: 20px;
  font-weight: 700;
  color: #E91E63;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 16px;
}

/* 짧은 구분선 */
.divider {
  width: 28px;
  height: 2px;
  background: #1a1a1a;
  margin-bottom: 20px;
}

/* 제목 — 굵은 임팩트 */
.hl-title {
  font-weight: 900;
  font-size: 48px;
  line-height: 1.3;
  color: #1a1a1a;
  margin-bottom: 20px;
}

/* 본문 — 팩트 서술 */
.hl-body {
  font-weight: 400;
  font-size: 28px;
  line-height: 1.7;
  color: #1a1a1a;
}
.hl-body strong {
  font-weight: 700;
}

/* 커버 슬라이드 — 사진 전체 + 하단 텍스트 오버레이 */
.cover-photo {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
}
.cover-text {
  position: absolute;
  bottom: 80px; left: 48px; right: 48px;
  font-weight: 900;
  font-size: 72px;
  line-height: 1.2;
  color: #fff;
  text-shadow: 0 2px 20px rgba(0,0,0,0.5);
}
.cover-handle {
  position: absolute;
  bottom: 40px; left: 48px;
  font-size: 22px;
  color: rgba(255,255,255,0.6);
}

/* CTA 슬라이드 — 순백 미니멀 */
.cta-handle {
  font-size: 24px;
  color: #999;
  letter-spacing: 6px;
  text-align: center;
  margin-bottom: 20px;
}
.cta-divider {
  width: 28px; height: 2px;
  background: #1a1a1a;
  margin: 0 auto 28px;
}
.cta-title {
  font-weight: 900;
  font-size: 52px;
  line-height: 1.3;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 24px;
}
.cta-action {
  font-weight: 700;
  font-size: 28px;
  color: #E91E63;
  text-align: center;
}
```

## 슬라이드 구조 (9장 캐러셀)

1. **커버** — 인물 풀 블리드 사진 + 하단 큰 흰 볼드 제목 + 핸들
2. **Case Study** — 제품/서비스 사진 + 메타 라벨(브랜드명) + 숫자 중심 팩트
3. **Founder** — 창업자 인물 사진 + 메타 라벨(이름) + 배경 스토리
4. **Origin** — 과거 장면 사진 + 메타 라벨(AGE/시기) + 원점 스토리
5. **Launch** — 달러/제품 사진 + 메타 라벨(투자금/기간) + 런칭 팩트
6. **AI Stack** — AI/테크 이미지 + 메타 라벨(도구 수) + 사용 도구 나열
7. **vs 경쟁사** — 사무실/대조 사진 + 메타 라벨(HEAD TO HEAD) + 비교 숫자
8. **Impact** — 상징적 사진 + 메타 라벨(비율) + 결론 메시지
9. **CTA** — 순백 + 핸들 + 구분선 + 제목 + 핫핑크 CTA ("댓글에 'XX' 입력!")

## 사진 소스 가이드

각 슬라이드에 고품질 사진 필요. 소재 유형:
- **인물**: 창업자 실사 / 인터뷰 컷 (자연광, 캐주얼)
- **제품**: 약/앱/서비스 클로즈업 (스톡 가능)
- **장소**: 트레일러파크, 사무실, 공장 등 스토리 배경
- **상징**: 달러 뭉치, 빈 의자들, 서버룸 등 메타포
- **테크**: 회로기판, AI 시각화, 코드 화면

## CTA 패턴

- "댓글에 'XX' 입력!" (핫핑크)
- 키워드는 콘텐츠 주제와 관련된 단어 (예: "최고수준", "AI", "1인기업")
- DM 자동 발송 퍼널 연결

## 다른 브랜드와의 차이점

| | 하우제로 | 하이아웃풋클럽 | **최고수준** |
|---|---|---|---|
| **분야** | AI 자동화 | 1인 사업 재무 | **AI 1인 기업 케이스 스터디** |
| **배경** | 크림 밝은톤 | 딥 블랙 | **순백 + 실사 사진** |
| **레이아웃** | 형광펜 카드뉴스 | 다크 텍스트 중심 | **매거진/에디토리얼 2분할** |
| **액센트** | 파스텔 형광펜 | 시안 #00D4FF | **핫핑크 #E91E63 (메타 라벨만)** |
| **톤** | 안티하이프 직설 | 전문가 존댓말 | **르포/다큐 ~다 체** |
| **강조 방식** | 형광펜 | 시안 번호 제목 | **볼드 키워드만** |
| **CTA** | 무료 오딧 | 댓글 DM + 부트캠프 | **댓글 키워드 입력** |

## 키워드

`highestlevel33`, `최고수준`, `1인유니콘`, `AI케이스스터디`, `매거진레이아웃`, `르포톤`, `사진분할`, `핫핑크메타`, `noto-sans-kr`, `editorial-carousel`
