---
name: content-captions
description: pipeline data.json → Instagram/Threads/LinkedIn 3 플랫폼별 캡션 .txt 파일. Anthropic API 사용. zipsaja 반말 톤, 인스타는 리드매그넷, Threads는 2~3줄 훅.
---

# content-captions 스킬

Claude Sonnet 4.6 으로 3 플랫폼별 캡션을 생성. 각 플랫폼의 포맷·길이·톤을 프롬프트에서 강제.

## 사용

```bash
export ANTHROPIC_API_KEY=sk-...
python3 -m scripts.content_captions \
  --data brands/zipsaja/zipsaja_pipeline_<slug>/data.json \
  --out brands/zipsaja/zipsaja_pipeline_<slug>/captions/
```

## 산출물

```
{out}/
├── instagram.txt    # ~2200자, 댓글 리드매그넷 훅 맨 앞, 해시태그 5-7개
├── threads.txt      # 2~3줄, 140자 이내, 해시태그 없음, 강한 논쟁/반전 훅
└── linkedin.txt     # 1500-2000자, 인사이트 중심, 해시태그 3-5개
```

## 플랫폼별 규칙

- **Instagram**: "댓글에 '엑셀' 또는 'PDF' 쓰면 보내줄게" 훅을 첫 문단 맨 앞 배치.
- **Threads**: 개후킹 2~3줄. 첫 줄은 논쟁 질문/반전/정면 반박, 둘째 줄은 핵심 수치, 셋째 줄은 선택지 질문. 해시태그 금지.
- **LinkedIn**: 해석·시사점 중심. 숫자 나열 금지.

모든 플랫폼 공통: zipsaja 반말 톤, 이모지 절제, 도발/위협 톤 금지.

## 요구사항

- `ANTHROPIC_API_KEY` 환경 변수
- `anthropic>=0.69` 패키지
- 1회 실행당 약 3회 API 호출 (각 플랫폼 별도)
