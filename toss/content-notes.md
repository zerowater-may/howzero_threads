# TossInvest Content Notes

## AX / Commerce 판별

이 자료는 커머스 판매 자동화보다 AX 본체에 가깝다. 주제 축은 "금융 데이터와 주문 API를 업무 자동화 시스템으로 다루는 법"이다. 콘텐츠에서는 투자 수익률 약속이 아니라 API 자동화, 리스크 통제, 데이터 파이프라인을 중심으로 잡는다.

## 한 줄 포지셔닝

증권 API가 열렸다는 건 "주식 자동매매로 돈 벌자"가 아니라, 반복 조회와 리포트와 리스크 알림을 코드가 처리하게 만들 수 있다는 뜻이다.

## 콘텐츠 각도

| 각도 | 핵심 메시지 |
|---|---|
| API 자동화 입문 | OAuth 토큰, rate limit, envelope, 계좌 헤더만 이해하면 구조가 보인다. |
| 금융 데이터 파이프라인 | 현재가, 캔들, 환율, 장 운영 시간을 모으면 매일 리포트 자동화가 된다. |
| 개인 자산 리포트 | holdings, commissions, buying-power를 엮으면 계좌 대시보드를 만들 수 있다. |
| 주문 API 리스크 | 주문 생성보다 검증, dry-run, 금액 제한, 로그가 먼저다. |
| AI 에이전트 연결 | LLM은 판단 보조와 요약에 두고, 주문 실행은 명시 승인으로 분리한다. |

## 영상 후보

1. 토스증권 Open API, 자동매매보다 먼저 만들어야 할 것
2. 주식 API 붙일 때 90%가 놓치는 3가지: 토큰, rate limit, 계좌 헤더
3. 내 계좌 리포트 자동화: 보유 종목, 수수료, 환율을 한 번에 묶기
4. AI한테 주문 버튼을 맡기면 안 되는 이유
5. 실계좌 API를 안전하게 테스트하는 법: MockTransport와 dry-run

## 금지선

- 특정 종목 매수/매도 추천 금지
- 수익 보장, 자동매매 성공률, "돈 복사" 류 표현 금지
- 라이브 키, 계좌번호, access token 화면 노출 금지
- 주문 API 데모는 실계좌 호출 없이 mock/dry-run으로 처리

## 실험 순서

1. `get_prices`, `get_candles`, `get_exchange_rate`로 읽기 전용 리포트 만들기
2. `get_accounts`, `get_holdings`, `get_commissions`로 계좌 요약 만들기
3. `get_buying_power`, `get_sellable_quantity`로 주문 전 검증 UI 만들기
4. `create_order`는 mock 테스트와 명시 승인 플로우가 생긴 뒤에만 다루기

