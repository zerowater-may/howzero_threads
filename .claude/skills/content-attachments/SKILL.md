---
name: content-attachments
description: pipeline data.json → Excel (.xlsx, raw 25개 구 데이터) + PDF (A4 인사이트 요약). 인스타 "댓글 달면 보내드려요" 리드매그넷 파일용.
---

# content-attachments 스킬

데이터 파일 러버용 Excel + 인사이트 요약 러버용 PDF 동시 생성.

## 사용

```bash
python3 -m scripts.content_attachments \
  --data brands/zipsaja/zipsaja_pipeline_<slug>/data.json \
  --out brands/zipsaja/zipsaja_pipeline_<slug>/attachments/
```

## 산출물

```
{out}/
├── seoul-price-data.xlsx       # openpyxl — 25개 구 전체 raw + 서식
└── seoul-price-insights.pdf    # weasyprint — A4, 상/하 변동률 요약 + 전체 테이블
```

## Excel 구조

| Row | Content |
|---|---|
| 1 | 제목 (merged A:D, 오렌지 굵은) |
| 2 | 기간·출처 (merged, 회색 이탤릭) |
| 3 | 헤더 (지역/취임 전/취임 후/변동률%) — 오렌지 배경 |
| 4-28 | 25개 구 데이터 — 양수 변동률 오렌지, 음수 파랑 |

## PDF 구조

1페이지 이내에 요약 박스(상/하 변동률, 평균) + 전체 25행 테이블.

## 요구사항

- openpyxl >= 3.1
- Node.js + Puppeteer (content_carousel의 node_modules 공유)
- 대신 weasyprint는 macOS libgobject 링크 이슈로 제거됨
