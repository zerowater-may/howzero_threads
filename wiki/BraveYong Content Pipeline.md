# BraveYong Content Pipeline

## 역할

`brands/braveyong/`는 용감한 용팀장 원문, 대본, 카러셀, 릴스, 캡션을 담는 중심 폴더다. 새 자료를 반영하면 이 페이지와 `brands/braveyong/INDEX.md`를 같이 갱신한다.

## 브랜드 폴더 구조

| 경로 | 의미 |
|---|---|
| `brands/braveyong/INDEX.md` | 브랜드 자산 지도 |
| `brands/braveyong/braveyong_persona.md` | 브랜드 페르소나 원본 |
| `brands/braveyong/braveyong_misc_lecture-content-knowhow.md` | 강의/콘텐츠 노하우 원문 자료 |
| `brands/braveyong/braveyong_script/` | 롱폼 강의/유튜브 대본 |
| `brands/braveyong/braveyong_shorts/` | 쇼츠/릴스 대본 |
| `brands/braveyong/braveyong_carousel_raw/` | 카러셀 raw 텍스트 |
| `brands/braveyong/braveyong_newsletter/` | 뉴스레터/장문 교육 글 |
| `brands/braveyong/braveyong_linkedin/` | 링크드인/스레드형 글 |
| `brands/braveyong/braveyong_carousel_*` | 실제 PNG/HTML 카러셀 |
| `brands/braveyong/braveyong_reels_*` | 릴스 mp4 |
| `brands/braveyong/braveyong_captions_*.txt` | 캡션/자막 |

## 파일 prefix

| 폴더 | prefix | 용도 |
|---|---|---|
| `braveyong_script/` | `Y-001-*` | 롱폼 강의 대본 |
| `braveyong_shorts/` | `YS-001-*` | 쇼츠/릴스 대본 |
| `braveyong_carousel_raw/` | `YC-001-*` | 카러셀 raw 원고 |
| `braveyong_newsletter/` | `YN-001-*` | 뉴스레터 |
| `braveyong_linkedin/` | `YL-001-*` | 링크드인/스레드 |

## 새 자료 인제스트

1. 원문은 `brands/braveyong/` 안에 type prefix로 보관한다.
2. 전략/노하우 자료는 `braveyong_misc_*.md`로 둔다.
3. 영상 전사나 자막은 `braveyong_captions_*.txt` 또는 해당 카러셀/릴스 폴더 안에 둔다.
4. wiki에는 원문 전체 복사가 아니라 [[BraveYong Brain]], [[BraveYong Persona]], [[BraveYong Lecture Playbook]]에 합성해 반영한다.
5. `wiki/index.md`, [[BraveYong Source Map]], `wiki/log.md`를 같이 갱신한다.

## 콘텐츠 생성 기준

```txt
주제/원문
-> BraveYong Brain으로 문제 축 분류
-> Persona 말투 적용
-> Lecture Playbook으로 구조화
-> script/shorts/carousel_raw/newsletter/linkedin 중 산출물 선택
-> 브랜드 INDEX와 wiki/log 갱신
```

## pipeline 상태

현재 braveyong은 zipsaja처럼 별도 데이터 페처가 없다. `scripts.pipeline braveyong <topic>`은 주제 텍스트 기반 state를 만드는 수준으로 취급한다. 실제 SEO 예시, 키워드 수치, 판매 수치가 필요한 콘텐츠는 별도 검증 자료를 붙인다.

## 관련 페이지

- [[BraveYong Index]]
- [[BraveYong Brain]]
- [[BraveYong Source Map]]
- [[HowZero Content Pipeline]]

## Sources

- `brands/braveyong/INDEX.md`
- `brands/INDEX.md`
- `AGENTS.md`
