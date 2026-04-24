# 용감한용팀장 (@brave._.yong_) 브랜드 프리셋

## 기본 정보

- **인스타 핸들**: `@brave._.yong_` (언더스코어 포함, 끝에 _ 필수)
- **이름**: 용감한용팀장
- **분야**: 글로벌 소싱/구매대행 + 네이버 SEO + 정책 분석
- **한 줄 소개**: 20채 부동산 보유 직장인이 하루 1~2시간으로 월 순수익 700~800만 원. 가짜는 가고 진짜만 남는다.
- **배경**: 8살 아이 키우며 직장 다니는 평범한 가장이자, 부동산 20채 보유 투자자. 현금 흐름 필요해 구매대행 시작. 철저한 시스템화/자동화로 안정 수익 구축.

## 레퍼런스 자료

- **NotebookLM (용팀장 자료 모음)**: https://notebooklm.google.com/notebook/1f2d441a-232f-48e1-9cec-085c5d7f3e90
  - 정책 분석/콘텐츠 제작 시 우선 참고
  - 계정: hedgehogcandy23@gmail.com

## 타겟 오디언스

- 안정적 현금 흐름 필요한 직장인/자산가 (예: 결혼 앞둔 30대)
- 매출 100~200만 원에 갇힌 초보/소규모 셀러
- 육아와 병행 가능한 투잡 찾는 주부
- 프로그램 '딸깍'에 의존하다 회의감 느낀 사람들

## 톤앤매너

- **팩트 폭격기**: "사업은 아파봐야 성장한다", "감으로만 올리면 시간만 버린다"
- **논리/데이터/증명 기반**: 매출 인증, 관세청 원본 문서, 실시간 네이버 검색 결과로 입증
- **도발 + 독려**: "대부분 듣고도 행동 안 할 것" → "끝까지 보는 당신은 준비된 1%"
- **본질 중심**: 대량등록/AI 딸깍 비판. 효자상품 발굴 + SEO 최적화가 진짜
- 뼈 때리는 직설 + 따뜻한 멘토링 균형

## 컬러 팔레트

### Primary
| 이름 | HEX | 용도 |
|------|-----|------|
| Deep Maroon | `#3F0000` | CTA 버튼, 다크 형광펜, 핵심 강조 |

### Secondary (보조)
| 이름 | HEX | 용도 |
|------|-----|------|
| Warm Rose | `#E8B4B4` | 붉은 형광펜 하이라이트. 본문 내 키워드 강조 |
| Muted Wine | `#8B2020` | 중간 톤. 서브헤딩, 아이콘, 구분선 |
| Dark Crimson | `#5A0000` | 다크 배경 내 포인트. 그라디언트 끝 색상 |

### Accent
| 이름 | HEX | 용도 |
|------|-----|------|
| Gold Highlight | `#FFCA28` | 숫자/매출/성과 강조용 노란 형광펜 |
| Gold Light | `#FFD54F` | 골드 형광펜 밝은 톤 |

### Neutral
| 이름 | HEX | 용도 |
|------|-----|------|
| Warm Cream | `#FAF8F5` | 따뜻한 크림 배경 (본문) |
| Dark Red-Black | `#1A0A0A` | 다크 배경 (CTA/HOOK) |
| Text Primary | `#1A1A1A` | 본문 텍스트 |
| Text Secondary | `#555555` | 보조 텍스트 |

### 컬러 사용 규칙
- 형광펜은 3종만: 붉은(`#E8B4B4`) · 골드(`#FFCA28`) · 다크(`#3F0000` + 흰 텍스트)
- CTA 버튼: `#3F0000` 배경 + 흰 텍스트
- 다크 슬라이드: `#1A0A0A` 배경 + `#E8B4B4` 또는 골드 강조
- **배경 그라디언트 금지.** 형광펜 내 `linear-gradient`만 허용.
- Hook 슬라이드는 다크 배경 + 검정 그라디언트 (얼굴 배경 사용 시 radial gradient로 분위기 연출)

## 타이포그래피

- **Headline**: `Black Han Sans` (강렬한 고딕, weight 400)
- **Body**: `Noto Sans KR` weight 700/900
- **Whisper/Comment**: `Gaegu` weight 700 (손글씨)

### Google Fonts
```
https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Gaegu:wght@400;700&family=Noto+Sans+KR:wght@400;700;900&display=swap
```

### 사이즈 가이드 (1080x1440 기준)
| 역할 | 폰트 | 사이즈 | 비고 |
|------|------|--------|------|
| Cover Title | Black Han Sans | 148~172px | letter-spacing: -4~-6px |
| Title MD | Black Han Sans | 78px | 슬라이드 타이틀 |
| Title LG | Black Han Sans | 104px | CTA 타이틀 |
| Body LG | Noto Sans KR 900 | 44px | 본문 강조 |
| Body MD | Noto Sans KR 700 | 36px | 일반 본문 |
| Body SM | Noto Sans KR 700 | 28px | 부가 설명 (회색) |
| Whisper | Gaegu 700 | 32~42px | rotate: -1deg |
| Num Label | Black Han Sans | 100px | 슬라이드 번호 |
| Stat Num | Black Han Sans | 80~104px | 숫자 강조 |

## 형광펜 스타일

```css
/* 붉은 강조 (메인) */
.hl-red {
  background: linear-gradient(170deg, transparent 10%, #E8B4B4 15%, #d4a0a0 50%, #E8B4B4 85%, transparent 90%);
  padding: 2px 10px; display: inline;
  box-decoration-break: clone; -webkit-box-decoration-break: clone;
}
/* 노란 강조 (숫자/성과) */
.hl-gold {
  background: linear-gradient(168deg, transparent 10%, #FFD54F 15%, #FFCA28 50%, #FFD54F 85%, transparent 90%);
  padding: 2px 10px; display: inline;
  box-decoration-break: clone; -webkit-box-decoration-break: clone;
}
/* 진한 강조 (경고/도발) */
.hl-dark {
  background: linear-gradient(172deg, transparent 8%, #3F0000 14%, #5A0000 50%, #3F0000 86%, transparent 92%);
  color: #fff; padding: 2px 10px; display: inline;
  box-decoration-break: clone; -webkit-box-decoration-break: clone;
}
```

## 슬라이드 규격

- **크기**: 1080 × 1440px (3:4 비율)
- **분량**: 10~12장 (디테일 있을 경우 12~13장)
- **padding**: `80px 80px 120px`
- **필수 슬라이드**: HOOK (다크) · 훅 확인 · Value 슬라이드 다수 · CTA (다크)

## 슬로건/캐치프레이즈

- "가짜는 가고 진짜만 남는다"
- "진짜 셀러의 시대가 왔다"
- "부동산 있는 직장인이 왜 또 부업을 하나"
- "은행원도 몰랐던 직장인 N잡의 세계"

## CTA 패턴

- "단톡방 참여하기 (고정 댓글)"
- "무료 강의 신청"
- "더 자세한 정책 분석은 @brave._.yong_"
- 단톡방 유입 → 무료/유료 강의 퍼널

## 관련 파일

- `components.md` — 재사용 HTML/CSS 컴포넌트 라이브러리 (callout, stat-card, vs-grid, steps, check-list, frame-card 등)
- `caption-templates.md` — 캡션 3종 템플릿 (훅/팩트폭격/스토리텔링)
- `engagement-playbook.md` — 설문·스토리 스티커·배포 운영 가이드
- `assets/` — 로고, 이미지 에셋 (현재 비어있음)

## 하우제로와의 차이점

| | 하우제로 | 용감한용팀장 |
|---|---|---|
| **분야** | AI 자동화/SaaS | 구매대행/네이버 SEO |
| **색감** | 크림 + 파스텔 형광펜 | 따뜻한 크림 + 붉은/골드 |
| **Headline** | 붓펜 손글씨 (Nanum Pen Script) | 강렬한 고딕 (Black Han Sans) |
| **톤** | 안티하이프, 차분한 직설 | 팩트 폭격, 도발 + 독려 |
| **CTA** | 무료 오딧 신청 | 단톡방 유입 |
| **Accent** | 연두/핑크/레몬 파스텔 | 붉은/골드/다크 |
