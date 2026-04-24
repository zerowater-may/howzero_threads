# 불사자 디자인 슬래시 커맨드 모음집

> UI/UX 작업 시 상황에 맞는 커맨드를 선택하세요.
> 모든 커맨드는 `/{커맨드명}` 또는 `/{커맨드명} {대상}` 형태로 실행합니다.

---

## 작업 흐름별 추천 순서

```
새 UI 제작:        /frontend-design → /typeset → /colorize → /animate → /polish
디자인 리뷰:        /critique → /audit-ui → /web-guidelines → /web-a11y
출시 전 마무리:     /polish → /harden → /optimize-ui → /audit-ui
기존 UI 개선:       /critique → /arrange → /typeset → /colorize → /animate
디자인 시스템:      /teach-impeccable → /extract → /normalize
```

---

## 1. 제작 (Build)

### `/frontend-design`
프로덕션급 프론트엔드 UI를 높은 디자인 품질로 제작. 웹사이트, 랜딩 페이지, 대시보드, React 컴포넌트 등.
```
/frontend-design 셀러 대시보드 메인 페이지
/frontend-design 가격 비교 랜딩 페이지
```

### `/ui-ux`
UI/UX 종합 디자인. 50+ 스타일, 161 컬러 팔레트, 57 폰트 페어링, 10개 스택 지원.
```
/ui-ux 글래스모피즘 스타일로 로그인 모달 디자인
/ui-ux 다크모드 대시보드 설계
```

### `/shadcn`
shadcn/ui 컴포넌트 설치, 설정, 구현. React Hook Form + Zod, Tailwind 테마 포함.
```
/shadcn 데이터 테이블 컴포넌트 구현
/shadcn 폼 빌더 (React Hook Form + Zod)
```

---

## 2. 시각 조정 (Visual Tuning)

### `/bolder`
안전하거나 밋밋한 디자인을 시각적으로 더 강렬하게. 임팩트 증가, 사용성 유지.
```
/bolder 현재 랜딩 페이지 히어로 섹션
/bolder CTA 버튼과 가격 카드
```

### `/quieter`
너무 강렬하거나 공격적인 디자인을 차분하게 톤다운. 품질과 임팩트는 유지.
```
/quieter 배너 애니메이션이 너무 화려함
/quieter 컬러가 과하게 쓰인 대시보드
```

### `/colorize`
단색이거나 시각적 흥미가 부족한 UI에 전략적 컬러 추가.
```
/colorize 모노톤 설정 페이지
/colorize 데이터 차트에 의미 있는 컬러 부여
```

### `/typeset`
폰트 선택, 위계, 사이즈, 웨이트 일관성, 가독성 개선.
```
/typeset 블로그 본문 타이포그래피
/typeset 대시보드 전체 폰트 위계 정리
```

### `/arrange`
레이아웃, 간격, 시각적 리듬 개선. 단조로운 그리드와 약한 위계 수정.
```
/arrange 상품 목록 카드 레이아웃
/arrange 설정 페이지 섹션 간격
```

---

## 3. 경험 개선 (Experience)

### `/animate`
목적 있는 애니메이션, 마이크로인터랙션, 모션 이펙트 추가.
```
/animate 페이지 전환 효과
/animate 버튼 호버/클릭 피드백
```

### `/delight-ui`
인터페이스에 기쁨, 개성, 예상치 못한 즐거운 터치 추가.
```
/delight-ui 업로드 성공 축하 화면
/delight-ui 빈 상태 일러스트레이션
```

### `/onboard-ui`
온보딩 플로우, 빈 상태(empty state), 첫 사용자 경험 설계/개선.
```
/onboard-ui 신규 가입자 첫 화면
/onboard-ui 키워드 분석 빈 상태 디자인
```

### `/clarify`
불명확한 UX 카피, 에러 메시지, 마이크로카피, 라벨, 안내 문구 개선.
```
/clarify 결제 실패 에러 메시지
/clarify 플랜 비교표 설명 문구
```

### `/overdrive`
기존 한계를 넘는 기술적으로 야심찬 UI. 셰이더, 60fps 테이블, 스프링 물리, 스크롤 애니메이션 등.
```
/overdrive 상품 갤러리에 3D 카드 플립
/overdrive 무한 스크롤 가상화 테이블
```

---

## 4. 품질 검증 (Quality)

### `/critique`
UX 관점에서 디자인 효과 평가. 시각적 위계, 정보 구조, 감성적 공명 피드백.
```
/critique 현재 가격 페이지 디자인
/critique 모바일 소싱기 UI
```

### `/audit-ui`
접근성, 성능, 테마, 반응형 종합 감사. 심각도별 이슈 + 권고안 리포트.
```
/audit-ui 대시보드 전체 페이지
/audit-ui 관리자 페이지
```

### `/web-guidelines`
UI 코드를 Web Interface Guidelines에 맞춰 검사.
```
/web-guidelines 랜딩 페이지 리뷰
/web-guidelines 셀러 대시보드 UX 체크
```

### `/web-a11y`
WCAG 2.1 기준 웹 접근성 구현/점검. ARIA, 키보드, 스크린 리더, 시맨틱 HTML.
```
/web-a11y 로그인/가입 폼 접근성
/web-a11y 데이터 테이블 키보드 네비게이션
```

---

## 5. 출시 준비 (Ship-Ready)

### `/polish`
출시 전 최종 품질 패스. 정렬, 간격, 일관성, 디테일 이슈 수정.
```
/polish 가격 페이지 최종 점검
/polish 전체 대시보드 디테일 수정
```

### `/harden`
에러 처리, i18n 지원, 텍스트 오버플로우, 엣지 케이스 관리 강화.
```
/harden 업로드 폼 에러 처리
/harden 긴 상품명 오버플로우 대응
```

### `/optimize-ui`
로딩 속도, 렌더링, 애니메이션, 이미지, 번들 사이즈 성능 개선.
```
/optimize-ui 대시보드 초기 로딩 속도
/optimize-ui 이미지 갤러리 렌더링
```

### `/adapt`
다양한 화면 크기, 디바이스, 플랫폼에 적응. 반응형 디자인.
```
/adapt 모바일 가격 페이지
/adapt 태블릿 대시보드 레이아웃
```

---

## 6. 시스템 & 정리 (System)

### `/distill`
불필요한 복잡성 제거, 본질만 남기기. 단순하고 강력하고 깨끗하게.
```
/distill 설정 페이지가 너무 복잡함
/distill 네비게이션 메뉴 단순화
```

### `/extract`
재사용 가능한 컴포넌트, 디자인 토큰, 패턴을 추출하여 디자인 시스템에 통합.
```
/extract 반복되는 카드 컴포넌트
/extract 컬러/폰트/간격 토큰 정리
```

### `/normalize`
디자인 시스템에 맞춰 일관성 확보.
```
/normalize 버튼 스타일 통일
/normalize 간격/패딩 시스템 정리
```

### `/teach-impeccable`
프로젝트 디자인 컨텍스트를 수집하여 AI 설정에 저장. **프로젝트당 1회만 실행.**
```
/teach-impeccable
```

---

## 빠른 참조표

| 상황 | 커맨드 |
|------|--------|
| "새 페이지 만들어줘" | `/frontend-design` |
| "디자인이 밋밋해" | `/bolder` → `/colorize` |
| "디자인이 너무 화려해" | `/quieter` → `/distill` |
| "글씨가 안 읽혀" | `/typeset` |
| "간격이 이상해" | `/arrange` |
| "에러 메시지가 불친절해" | `/clarify` |
| "애니메이션 넣고 싶어" | `/animate` |
| "재미있는 UI 원해" | `/delight-ui` → `/overdrive` |
| "접근성 체크해줘" | `/web-a11y` → `/audit-ui` |
| "출시 전인데 점검해줘" | `/polish` → `/harden` → `/optimize-ui` |
| "컴포넌트 정리하고 싶어" | `/extract` → `/normalize` |
| "모바일 대응 안 돼" | `/adapt` |
| "전체적으로 리뷰해줘" | `/critique` → `/web-guidelines` |
| "첫 화면이 허전해" | `/onboard-ui` |
| "shadcn 쓰고 싶어" | `/shadcn` |
| "디자인 시스템 세팅" | `/teach-impeccable` |
