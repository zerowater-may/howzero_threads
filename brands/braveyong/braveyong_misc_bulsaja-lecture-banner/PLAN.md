# 용팀장 강의 배너 v2 — Higgsfield 배경 교체 계획서

> 현재 banner.html은 단색 다크 그라데이션 + CSS 그리드 텍스처. 인물(face.jpg)·텍스트·CTA는 그대로 유지하고 **배경 레이어만 AI 생성 시네마틱 백드롭으로 교체**하는 게 목표.

## 1. 결정해야 할 항목

| 항목 | 후보 | 권장 |
|---|---|---|
| 모델 | `soul_location` / `soul_cinematic` / `gpt_image_2` | **`soul_location`** — 스킬 가이드 명시 "no-people scenes → best in class" |
| aspect ratio | `21:9` / `16:9` | **`21:9`** — 가장 wide. 5:1 배너에 맞춰 위·아래 crop |
| 생성 장수 | 1 / 2 / 3 | **3장 변주** — 컨셉 A·B·C 각 1장 |
| 예상 크레딧 | (확인 필요) | `higgsfield model get soul_location --json` 에서 cost 확인 후 진행 |
| 한국어 텍스트 위험 | — | **없음** — 배경에만 쓰고 카피는 HTML 오버레이라 깨질 일 X |

## 2. 컨셉 변주 3종 (sketches.html 에서 시각 비교)

### A. 시네마틱 스튜디오 백드롭
> 깊은 검정 배경 + 골드 림 라이트 (뒤쪽) + 오른쪽에서 들어오는 따뜻한 amber/orange highlight + 미세 volumetric smoke. 강의 강사 인터뷰 세트 느낌.

**프롬프트 안:**
```
Dark cinematic studio backdrop, deep void black,
subtle gold rim lighting glowing from behind,
warm amber and orange highlights drifting in from camera-right,
faint volumetric smoke haze, no people, no text, no objects,
premium lecture promo set, photorealistic professional studio,
anamorphic lens flare, moody atmosphere, ultra-wide composition
```

### B. 추상 라이트빔 / 골드 파티클
> 검정 베이스 + 대각선 골드·오렌지 빛줄기 + 미세 입자. 더 추상적·이벤트성. 인물 위에 깔려도 가독 좋음.

**프롬프트 안:**
```
Abstract dark backdrop with diagonal warm gold and orange light beams,
fine golden particles floating, deep black base,
soft volumetric god rays, premium event promo backdrop,
no people, no text, no objects, cinematic depth,
ultra-wide horizontal composition, subtle bokeh
```

### C. 콘크리트 + 골드 액센트 (랜딩 v2 톤)
> face.jpg 원본 배경(콘크리트 + 빨간 레이저)과 톤 매칭. 미니멀한 텍스처 벽 + 우측 골드 스폿라이트. 가장 톤 일관성.

**프롬프트 안:**
```
Dark moody concrete wall texture, soft top-down spotlight from above,
warm gold accent light pooling on the right side,
no people, no text, no objects, premium minimal interview backdrop,
subtle wall imperfections, photorealistic studio,
ultra-wide horizontal composition
```

## 3. 합성 워크플로우

```
1. higgsfield generate create soul_location --aspect_ratio 21:9 --wait
   (컨셉 A/B/C 각 1번 = 총 3 호출)
2. 결과 URL 다운로드 → backdrop-A.jpg / backdrop-B.jpg / backdrop-C.jpg
3. banner.html 의 .banner 배경 교체:
     background:
       linear-gradient(rgba(10,10,10,.55), rgba(10,10,10,.75)),   <- 가독성 dim
       url('./backdrop-X.jpg') center/cover no-repeat;
4. capture.mjs 로 1x/2x/3x/4x PNG 재추출
5. Finder 에서 결과 확인
```

## 4. 합성 시 가독성 가드

- 인물 영역(좌측 460px): 어차피 원형 grayscale face 라 배경 영향 적음
- **텍스트 영역(중앙): 배경 위에 어두운 그라데이션 오버레이 필수** — `rgba(10,10,10,0.55~0.75)` 정도. 안 그러면 marker 노란색·white 헤드라인 contrast 망가짐
- CTA pill(우측): white pill 자체가 강해서 배경 영향 적음

## 5. 진행 게이트

- [ ] **스케치 검토** — sketches.html PNG 보고 A/B/C 중 선택 (또는 다 폐기)
- [ ] **컨셉 확정** 후에야 실제 higgsfield 호출 (크레딧 사용)
- [ ] 호출 전 `higgsfield model get soul_location --json` 으로 정확한 cost 확인
- [ ] 결과 1장 받아 합성 → 만족하면 나머지 2장 / 불만족이면 prompt 튜닝 후 1장 더

## 6. 예상 소요

- 스케치 단계: **크레딧 0** (CSS mock)
- 실제 생성 단계: 컨셉 1개 확정 시 3 generation × `soul_location` 1 unit. 1000 크레딧 중 미미한 비중일 가능성 큼. 정확히는 model get 후 확인.
