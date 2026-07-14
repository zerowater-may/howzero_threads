# HowZero AX Engagement OS 설계

- 상태: 브레인스토밍 승인
- 승인일: 2026-07-15
- 대상: HowZero 내부 AX 운영자, AX 고객사, Paperclip 실행 에이전트
- 첫 파일럿: 교육·콘텐츠 커머스 파일럿 A

`파일럿 A`는 사용자 요청에 포함된 첫 고객 사례를 저장소·fixture·위키에서 익명화한 내부 명칭이다.

## 1. 결정 요약

HowZero AX는 새 CRM이나 새 에이전트 대시보드를 하나 더 만들지 않는다. 기존 제품의 책임을 다음처럼 분리한다.

```text
ax-web
상담·무료 진단·리드 수집
        ↓
HowZero Engagement OS (howzero-web + Postgres)
고객·영업·계약·프로젝트·단계·결정·승인·산출물의 기준 원장
        ↓ REST API + 외부 ID 매핑
Paperclip / howzero-dashboard
AI 에이전트·Issue·실행·비용·로그를 처리하는 내부 실행 엔진
```

사람이 보는 계약 여정의 기준 객체는 `Engagement`다. Paperclip의 `Company`, `Project`, `Issue`는 고객·계약 원장이 아니라 실행 제어면으로만 사용한다. 관리자와 고객은 같은 Engagement 데이터를 보되 역할과 공개 범위에 따라 서로 다른 화면을 본다.

첫 구현 단위는 화면이 아니라 Engagement 상태 계약과 단계별 스킬 입출력 규격이다. 이후 DB·권한, 내부 관리자, 고객 포털, Paperclip 연동을 순서대로 붙인다.

## 2. 근거와 문제 정의

### 2.1 읽은 원자료

1. 카카오톡 구축 대화 CSV(2026-07-15 내보내기)
   - 2026-07-10부터 2026-07-14까지의 구축 대화 전체
   - 접근정보 수집, 원천 DB 전달, 대시보드 구축, 지표 수정, 광고 연동, 회원·결제 흐름, QA와 추가 요구를 포함한다.
2. 68분 36초 현장 녹음
   - 1시간 8분 36초 녹음 전체를 확인했다.
   - 00:07:30~00:08:20에 한 강의부터 순차 이관하는 원칙, 00:15:32부터 회사 자체 OS 개념, 00:24:00~00:29:40에 퍼널·행동 데이터 요구, 01:00:10~01:07:50에 브레인스토밍→계획→구현→검증 방식이 명시된다.

원자료에는 운영 중인 API·결제·소셜 로그인·서버 관련 비밀값이 평문으로 반복 공유된 정황이 있다. 값은 이 문서나 위키에 복사하지 않는다. 해당 자료를 재사용하기 전 노출값 폐기·회전과 안전한 저장소 이관을 확인해야 한다.

### 2.2 첫 고객 여정에서 확인한 실제 흐름

```text
접근정보 수집
→ 기존 시스템·DB 전달
→ 즉석 프로토타입
→ 카카오톡 중심 QA
→ 직접 배포
→ 지표 오류 발견·수정
→ 다음 요구사항 추가
```

이 흐름으로 통합 대시보드와 운영 기능은 빠르게 만들어졌지만, 다음 문제가 반복됐다.

| 관찰 | 재발 방지 설계 |
|---|---|
| 평문 비밀값 공유 | 모든 인제스트 앞에 비밀 탐지·회전 확인 게이트를 둔다. |
| 구축 후 매출 정의 변경 | UI보다 먼저 `MetricDefinition`을 고객과 승인한다. |
| 과거 퍼널 변경 중 수백 건 유실 | 전면 전환을 금지하고 한 상품 PoC·대사·롤백 후 확대한다. |
| 무료 신청 다수에 강의 식별자 누락 | 데이터 계약과 매핑 커버리지 검사를 통과해야 이관한다. |
| 광고 귀속과 ROAS 계산 오류 | 원천별 계산식·분모·예외를 지표 계약에 고정한다. |
| 소형 서버 자원 부족으로 장애 | 컷오버 전에 용량·복구·관측 가능성 검사를 수행한다. |
| 하루 만에 요구사항 철회 | 요구 변경을 `Decision`으로 남기고 일정·비용 영향을 승인한다. |
| 카카오톡이 사실상 기준 원장 | 카카오톡은 알림만 담당하고 결정·파일은 포털에 기록한다. |

### 2.3 벤치마크에서 가져올 것과 버릴 것

- [크몽 AX](https://kmong.com/ax)의 `업무 파악 → 진단·PoC → 구축·연동 → 측정·최적화` 흐름과 기존 시스템·직원 정착·보안을 먼저 확인하는 접근을 채택한다.
- [플러그](https://www.pluuug.com/)와 [플러그 영업관리](https://www.pluuug.com/features/sales)의 영업 파이프라인, 자동 히스토리, 다음 행동, 지연·전환 지표를 내부 운영 화면의 참고 모델로 사용한다.
- 플러그 전체를 복제하지 않는다. 첫 버전은 전자서명, 결제, 입금 대사, 세금계산서 발행을 직접 제공하지 않고 상태·금액·파일만 관리한다.

## 3. 목표와 제외 범위

### 3.1 목표

1. 두 번째 고객을 코드 수정 없이 등록하고 업종 팩을 선택해 AX 여정을 시작할 수 있다.
2. 리드부터 운영 개선까지 모든 단계에 입력, 자동 검사, 산출물, 담당 승인, 해제 조건이 있다.
3. HowZero는 영업·프로젝트·위험·다음 행동을 한 원장에서 관리한다.
4. 고객은 자기 회사의 단계, 할 일, 결정, 일정, 산출물, 승인, 합의된 성과만 본다.
5. Paperclip은 AI 실행과 비용·로그를 담당하고 HowZero 원장을 대체하지 않는다.
6. 파일럿 A 경험은 익명화된 사례와 교육·콘텐츠 커머스 팩으로 위키에 축적한다.

### 3.2 제외 범위

- 전자계약 서명, 결제 수납, 은행 입출금 연동, 세금계산서 발행
- 범용 CRM 또는 플러그의 전체 기능 복제
- 고객의 Paperclip 직접 로그인
- 카카오톡·이메일을 기준 원장으로 사용하는 기능
- 합의된 기준값이 없는 추정 ROI 표시
- 원자료의 비밀값·개인식별정보를 저장소나 위키에 복사하는 작업

## 4. 시스템 경계

### 4.1 `ax-web`: 공개 유입 채널

현재 상담 챗봇, 진단 질문, 연락처 검증, 리드 폼을 재사용한다. 리드를 자체 고립 DB에만 남기지 않고 HowZero Engagement OS의 Opportunity로 인계한다. `ax-web`에는 내부 CRM 화면을 추가하지 않는다.

### 4.2 `howzero-web`: 기준 원장과 양방향 제품

기존 인증, Postgres, BullMQ, 로그·첨부 구조와 고객 포털 셸을 재사용한다. 이 앱이 다음 데이터를 소유한다.

- 고객사와 멤버십
- 리드·영업 기회·다음 행동
- 계약 메타데이터와 파일
- Engagement 단계와 건강 상태
- 요구, 결정, 위험, 지표 정의, 업무, 산출물, 승인
- 공개 범위와 감사 이벤트
- Paperclip 외부 ID 매핑

### 4.3 `howzero-dashboard`: 내부 실행 제어면

원격 저장소의 Company, Project, Issue, Agent, Run, Cost와 REST API를 재사용한다. Issue의 원자적 checkout과 에이전트 adapter·heartbeat·비용 추적은 그대로 활용한다.

다음은 Paperclip에 저장하지 않는다.

- 영업 단계와 예상 매출
- 고객 담당자와 계약 조건
- 견적·청구·정산 상태
- 고객 공개 승인과 납품 원장
- 고객별 성과 기준선

HowZero DB가 Paperclip DB를 직접 수정하지 않는다. REST API와 외부 ID만 연결한다.

## 5. 두 개의 상태 흐름

영업과 구축을 한 상태값에 섞지 않는다.

### 5.1 Opportunity

```text
NEW → QUALIFIED → DISCOVERY → PROPOSAL → WON
 └────────────── 각 수주 전 단계 ─────────→ LOST
```

- `NEW`: 리드가 저장됨
- `QUALIFIED`: 문제·예산·시기·의사결정자 적합성 확인
- `DISCOVERY`: 증거 수집과 진단 진행
- `PROPOSAL`: 범위·가격·일정 제안
- `WON`: 계약 메타데이터와 파일 확인 후 Engagement 생성
- `LOST`: 사유와 재접촉 일자 기록

`LOST`는 `NEW`, `QUALIFIED`, `DISCOVERY`, `PROPOSAL` 어느 단계에서든 이동할 수 있다. 재접촉 시 사유를 남기고 `QUALIFIED`로만 재개한다. `WON` 뒤 계약이 중단되면 Opportunity를 되돌리지 않고 연결된 Engagement를 `CANCELLED`로 종료한다.

### 5.2 Engagement

```text
INTAKE
→ SECURE_ACCESS
→ CURRENT_STATE_AUDIT
→ METRIC_CONTRACT
→ SOLUTION_BLUEPRINT
→ BUILD
→ RECONCILE_UAT
→ CUTOVER_HANDOFF
→ OPERATE_OPTIMIZE
```

모든 단계는 다음 규칙을 공유한다.

```text
입력 충족 → 자동 검사 → 산출물 생성 → 담당자 승인 → 다음 단계 해제
```

Engagement에는 한 개의 현재 단계만 있다. 단계 안의 Task는 병렬 실행할 수 있다. 각 단계 상태는 `NOT_STARTED`, `IN_PROGRESS`, `BLOCKED`, `AWAITING_APPROVAL`, `CHANGES_REQUESTED`, `APPROVED` 중 하나다. 승인 뒤 이전 단계의 전제가 바뀌면 `current_stage` 포인터는 유지하고 이전 단계 revision을 `CHANGES_REQUESTED`, 현재 단계를 `BLOCKED`로 둔다. 재승인 뒤 같은 현재 단계에서 이어간다. 첫 릴리스에는 승인 게이트 우회 기능을 두지 않는다.

Engagement 전체 수명 상태는 `ACTIVE`, `PAUSED`, `COMPLETED`, `CANCELLED`다. 인수 뒤 모든 Engagement가 합의된 측정 기간 동안 `OPERATE_OPTIMIZE`에 들어간다. 지속 운영 계약이 없으면 첫 운영 리뷰에서 `COMPLETED`, 있으면 다음 revision에서 `ACTIVE`를 유지한다. `CANCELLED`는 사유와 고객·HowZero 책임자의 Decision을 요구한다.

자동 검사는 `PASS`, `FAIL`, `NOT_APPLICABLE`과 증거 Artifact, 검사기 버전을 기록한다. `FAIL`은 단계를 차단하고 `NOT_APPLICABLE`은 사유를 요구한다.

| 단계 | 필수 결과 | 해제 조건 |
|---|---|---|
| `INTAKE` | 목표, 담당자, 의사결정자, 범위 초안 | 고객 책임자와 HowZero 담당자 지정 |
| `SECURE_ACCESS` | 시스템 목록, 최소 권한, 비밀 회전 증거 | 평문 비밀 미저장, 접근 검사 통과 |
| `CURRENT_STATE_AUDIT` | 업무·시스템·데이터 흐름, 병목, 위험 | 원천 소유자와 누락 데이터 확인 |
| `METRIC_CONTRACT` | 지표 공식, 원천, 예외, 허용 오차 | 고객 지표 승인자의 인앱 승인 |
| `SOLUTION_BLUEPRINT` | PoC 범위, 연동, 이관, 롤백, UAT | 일정·범위·책임 승인 |
| `BUILD` | 구현 Issue, 실행 결과, 기술 검증 | 필수 Issue 완료와 내부 검토 |
| `RECONCILE_UAT` | 원천 대사, 고객 시나리오, 실패 목록 | 허용 오차 충족, 고객 UAT 승인 |
| `CUTOVER_HANDOFF` | 전환·롤백 기록, 교육, 운영 책임 | 운영자 인수와 복구 검사 |
| `OPERATE_OPTIMIZE` | 실제 성과, 사고, 개선 후보 | 운영 리뷰에서 계속·일시중지·완료 Decision 승인 |

`OPERATE_OPTIMIZE`는 반복 단계다. 고객 책임자와 HowZero 담당자가 운영 리뷰를 승인하면 `CONTINUE`는 stage revision을 올려 다음 측정 주기를 열고, `PAUSE`는 Engagement를 `PAUSED`, `COMPLETE`는 `COMPLETED`로 바꾼다.

### 5.3 승인 계약

승인 유형은 `STAGE_GATE`, `METRIC_CONTRACT`, `BLUEPRINT`, `UAT_ACCEPTANCE`, `ARTIFACT_PUBLISH`, `ARTIFACT_ACCEPTANCE`, `CHANGE_REQUEST`, `HANDOFF`, `OPERATIONS_REVIEW`다. 상태는 `REQUESTED`, `APPROVED`, `CHANGES_REQUESTED`, `REJECTED`, `CANCELLED`다. `CHANGES_REQUESTED`는 같은 단계에서 수정 후 재요청하고, `REJECTED`는 해당 제안·게이트를 종료해 단계를 `BLOCKED`로 둔다. 승인된 요청이 다음 단계에서 소비된 뒤에는 철회하지 않고 새 변경 요청과 Decision을 만든다. 승인자는 인증된 `Membership`이어야 하며 비로그인 `Contact`는 승인할 수 없다. 의사결정자를 승인자로 지정하려면 먼저 조직 사용자로 초대한다.

| 게이트 | 필수 승인자 |
|---|---|
| 인테이크 | 고객 책임자, HowZero 담당자 |
| 보안 접근 | 고객 시스템 책임자, HowZero 담당자 |
| 현행 진단 | 고객 프로세스 책임자, HowZero 담당자 |
| 지표 계약 | 고객 지표 책임자, HowZero 데이터 검토자 |
| 솔루션 설계 | 고객 책임자, HowZero 담당자 |
| 구축 완료 | HowZero 담당자 |
| 대사·UAT | 고객 책임자, HowZero QA 검토자 |
| 전환·인수 | 고객 운영 책임자, HowZero 담당자 |
| 산출물 내부 공개 | HowZero 담당자 (`ARTIFACT_PUBLISH`) |
| 산출물 고객 인수 | 고객 책임자 (`ARTIFACT_ACCEPTANCE`) |
| 운영 리뷰 | 고객 책임자, HowZero 담당자 |

## 6. 스킬 오케스트레이션

### 6.1 코어 스킬

| 스킬 | 책임 | 주요 산출물 |
|---|---|---|
| `ax-engagement-orchestrator` | 현재 단계 확인, 다음 스킬 실행, 승인 대기·재시작 | run 연결, 단계 전환 Event |
| `ax-evidence-ingest` | 회의·채팅·문서에서 사실·요구·결정·위험 분리 | evidence index, 요구·결정 후보 |
| `ax-secure-access` | 비밀 탐지, 회전 확인, 최소 권한 목록화 | access register, 보안 차단 사유 |
| `ax-current-state-audit` | 사람·업무·시스템·데이터 흐름 진단 | current-state map, 병목·위험 |
| `ax-metric-contract` | 지표 공식·원천·예외·허용 오차 확정 | metric definitions, 대사 규칙 |
| `ax-solution-blueprint` | PoC·연동·이관·롤백·UAT 설계 | blueprint, 책임·일정·범위 |
| `ax-build-runner` | 구현 작업을 Paperclip Issue로 분해·실행 | Issue links, 기술 산출물 |
| `ax-qa-reconcile` | 원천 대사와 고객 UAT 증거 관리 | reconciliation report, UAT result |
| `ax-cutover-handoff` | 점진 전환, 롤백, 교육, 운영 인수 | cutover log, runbook, handoff |
| `ax-operations-review` | 실제 성과와 다음 개선 후보 생성 | outcome review, backlog candidates |

### 6.2 공통 실행 계약

각 스킬은 다음 계약을 따른다.

1. 입력은 `Engagement ID`, 현재 단계, 인증된 actor, 관련 artifact ID다.
2. HowZero API에서 현재 원장을 읽고 자기 단계에 필요한 객체만 수정한다.
3. 별도 `state.json`을 기준 원장으로 만들지 않는다. AI 실행용 스냅샷은 읽기 전용·일회성 산출물이다.
4. 논리 작업마다 HowZero가 `ExecutionRequest`를 먼저 만들고 그 ID를 BullMQ `jobId`와 Paperclip `idempotencyKey`로 재사용한다. `(engagement_id, stage_revision, action_kind, target_ref, generation)`은 unique다. 같은 작업의 retry는 generation을 유지하고, 승인된 재실행 Decision만 generation을 올린다.
5. 산출물, 검사 결과, 차단 사유를 구조화해 남긴다.
6. 스킬은 고객 승인을 대신하지 않는다. 승인 요청을 만들고 멈춘다.
7. 오케스트레이터만 통과 조건을 확인해 다음 단계로 전환한다.

`ax-client-portal-sync` 같은 별도 동기화 스킬은 만들지 않는다. 관리자와 고객 포털이 같은 DB를 권한별로 읽으므로 동기화 자체가 필요 없다.

### 6.3 업종 팩

코어는 업종 중립으로 유지하고 업종 팩은 체크리스트·용어·연동 어댑터·대사 규칙만 추가한다.

첫 `education-commerce` 팩은 다음을 포함한다.

- 강의·기수·상품 식별자와 매핑 커버리지
- 결제, 취소, 환불, 재구매의 매출 정의
- 회원·주문·신청 데이터 이관과 증분 동기화
- GA4, Meta, Google Ads, UTM 광고 귀속
- Toss Payments 결제 상태
- Solapi·카카오·RCS 알림 흐름
- 한 강의 PoC, 병행 운영, 롤백 체크리스트

고객별 구현 코드를 코어 스킬에 넣지 않는다.

업종 팩은 버전이 있는 저장소 산출물 `pack.json`과 참조 템플릿·체크리스트로 구성한다. Engagement에는 `pack_id`와 `pack_version`을 기록한다. 팩은 용어, 필수 증거, 기본 지표 정의, 연동 체크리스트, 단계별 추가 검사를 선언하며 실행 코드를 포함하지 않는다. 실제 커넥터 코드는 `howzero-web`의 연동 모듈이 소유하고 팩은 지원 capability만 참조한다.

“코드 수정 없는 두 번째 고객”은 기존 코어와 기존 업종 팩·연동 capability 안에서 조직, 사용자, 팩, 필드 매핑을 설정해 시작할 수 있다는 뜻이다. 새로운 업종 팩이나 미지원 커넥터 개발까지 무코드라는 뜻은 아니다.

### 6.4 스킬 파일의 기준 위치

- 원본은 프로젝트 규칙에 따라 `.claude/skills/<skill>/SKILL.md`에 둔다.
- `.agents/skills/**`와 `docs/ai/**`는 생성 미러로 취급하고 직접 편집하지 않는다.
- 현재 AGENTS.md가 지정한 `scripts/sync_ai_meta.py`가 저장소에 없으므로 첫 하위 프로젝트에서 최소 동기화 스크립트를 복구하고, 원본→미러 검증을 자동화한다.
- 각 스킬은 정상 사례 하나와 차단 사례 하나로 trigger·입력·산출물·게이트를 검증한다.

## 7. 데이터 원장

### 7.1 핵심 객체

- `Organization`: 고객사
- `Membership`: 로그인 사용자, 조직, 역할
- `Contact`: 로그인하지 않는 실무·결정 담당자
- `Opportunity`: 영업 단계, 예상 금액, 담당자, 다음 행동
- `Agreement`: 제안·계약·변경계약의 금액·통화·상태·서명일·지급기한·지급 상태·관련 Artifact
- `Engagement`: 계약 프로젝트, 현재 단계·revision, 담당자, 건강 상태
- `Milestone`: 고객에게 공개할 단계 목표, 예정일, 완료일
- `Requirement`: 요구와 수용 기준
- `Decision`: 선택, 근거, 영향, 결정자
- `Risk`: 가능성, 영향, severity, `OPEN`·`MITIGATED`·`ACCEPTED`·`CLOSED` 상태, 완화책, 소유자
- `MetricDefinition`: 이름, 공식, 단위, 원천, 예외, 허용 오차, baseline 기간·값, 승인자
- `MetricObservation`: 측정 기간·값, 원천 Artifact, 측정 시각, 검증 상태
- `Task`: 고객 또는 내부 담당자의 할 일, 필수 여부, 상태, 기한
- `Comment`: 고객·내부 대화, 대상 객체, 공개 범위
- `Artifact`: 파일·링크·보고서와 공개 상태
- `Integration`: 시스템, 접근 상태, 비밀 저장소 참조, 마지막 검사
- `Approval`: 요청 대상, 승인자, 상태, 결정 시각과 메모
- `Event`: actor, 행위, 대상 ID, 허용 목록 기반의 비민감 변경 메타데이터, 시각
- `ExternalLink`: HowZero 객체와 Paperclip 외부 ID 매핑
- `ExecutionRequest`: 논리 작업의 action kind·target ref·generation, 멱등 키, 큐·Paperclip 상태
- `OutboxEvent`: DB 변경 뒤 BullMQ로 전달해야 하는 내구성 이벤트와 비민감 객체 참조

구현에서는 기존 `users`, 로그, 첨부 구조를 재사용하고 필요한 객체만 추가한다. 한 테이블에 모든 종류를 JSON으로 넣는 범용 레코드 모델은 사용하지 않는다.

`Agreement.kind`는 `PROPOSAL`, `CONTRACT`, `CHANGE_ORDER`, 상태는 `DRAFT`, `SENT`, `ACCEPTED`, `DECLINED`, `VOID`다. 지급 상태는 `NOT_DUE`, `DUE`, `PARTIAL`, `PAID`, `OVERDUE`, `NOT_APPLICABLE`만 기록하며 실제 수납 기능은 제공하지 않는다. Task 상태는 `OPEN`, `IN_PROGRESS`, `BLOCKED`, `DONE`, `CANCELLED`, MetricObservation 검증 상태는 `PENDING`, `VERIFIED`, `REJECTED`다.

### 7.2 역할과 공개 범위

| 역할 | 권한 |
|---|---|
| HowZero 관리자 | 모든 고객, 영업, 원가, 실행 관리 |
| HowZero 담당자 | 배정된 고객의 영업·프로젝트 운영 |
| 고객 책임자 | 자사 Engagement 열람, 결정, 승인 |
| 고객 실무자 | 자사 자료 제출, 댓글, 할 일 수행 |
| 고객 열람자 | 공개된 진행 상황과 산출물 열람 |
| 서비스 에이전트 | 허용된 Engagement API와 Paperclip 실행만 사용 |

모든 서버 조회·수정은 요청 본문의 사용자 ID를 신뢰하지 않고 인증 문맥을 검사한다. 고객 역할은 `organization_id` 멤버십, HowZero 담당자는 명시적 고객 배정, HowZero 관리자는 감사되는 instance-admin claim, 서비스 에이전트는 Organization·Engagement·행위가 제한된 service grant를 사용한다. 전역 `PAPERCLIP_COMPANY_ID`는 제거하고 Organization마다 외부 Company ID를 매핑한다.

고객 공개 데이터와 내부 원가·마진·메모·프롬프트·에이전트 실행 로그는 분리한다. 산출물은 내부 검토 뒤 명시적으로 공개해야 고객에게 보인다.

`Event`에는 이메일·전화번호·이름·비밀값의 변경 전후 원문을 넣지 않는다. 삭제 Event는 불투명한 subject ID와 삭제 사유만 보존한다. AI 실행 스냅샷도 필드 허용 목록을 사용하고 PII는 최소화·가명화하며 run 보존기간이 끝나면 삭제한다.

Engagement 건강 상태는 `ON_TRACK`, `AT_RISK`, `BLOCKED`만 사용한다. 현재 게이트나 실행이 수동 개입을 요구하면 `BLOCKED`, 기한이 지난 필수 Task·Milestone 또는 열린 high Risk가 있으면 `AT_RISK`, 그 외에는 `ON_TRACK`이다.

성과는 승인된 `MetricDefinition`의 baseline 기간·값과 같은 원천에서 계산한 실제 측정값으로만 표시한다. baseline이 없으면 숫자 대신 `측정 전`으로 표시한다.

## 8. 양방향 제품 경험

### 8.1 HowZero 내부 관리자

관리자 화면은 장식용 KPI가 아니라 다음 행동과 지연을 찾는 운영 도구다.

- 영업 인박스: 새 리드, 미응답 시간, 담당자, 다음 행동
- 파이프라인: 단계, 예상 금액, 정체 기간, 전환 사유
- 고객사 상세: 담당자, 계약 메타데이터, Engagement 목록
- Engagement 작업실: 단계 타임라인, 요구·결정·위험·지표·산출물
- 승인 인박스: 고객 답변 또는 내부 검토가 필요한 항목
- 운영 지표: 전환율, 단계별 지연, 프로젝트 건강도, 실제 측정 성과

### 8.2 고객 포털

고객 화면은 한 개의 명확한 다음 행동을 중심으로 구성한다.

- 현재 단계와 전체 여정
- 오늘 해야 할 고객 업무
- 답변이 필요한 결정과 승인
- 일정과 다음 마일스톤
- 검토 가능한 산출물과 변경 이력
- 합의된 지표와 실제 성과

고객에게 내부 원가, 마진, 내부 메모, Paperclip Issue, 에이전트 프롬프트·로그를 노출하지 않는다.

### 8.3 데이터 흐름

```text
고객 제출·댓글·승인
  → Engagement 원장 + 감사 Event + OutboxEvent (한 transaction)
  → 기존 worker가 OutboxEvent를 BullMQ에 전달
  → 단계 게이트 충족 시 Paperclip Issue 생성
  → AI/담당자 작업 완료
  → 내부 검토
  → 공개 승인된 결과만 고객 포털에 노출
```

별도 실시간 동기화 서비스는 만들지 않는다. 기존 API, worker, BullMQ, 페이지 재검증으로 시작한다. worker는 미전달 OutboxEvent를 주기적으로 다시 확인해 DB 저장 성공 뒤 큐 전송이 누락되는 구간을 복구한다. 카카오톡과 이메일은 포털의 해당 업무·결정·승인 화면으로 연결되는 알림만 보낸다.

### 8.4 시각 원칙

기존 HowZero 디자인 토큰을 우선한다. 관리자는 표와 타임라인 중심의 고밀도 편집형 레이아웃, 고객은 단계와 다음 행동 중심의 단순한 레이아웃을 사용한다. 균일한 카드 3열, 장식용 그라데이션, 의미 없는 아이콘·KPI를 사용하지 않는다. 고객 포털은 모바일 접근성을 우선하며 키보드 탐색, 명확한 포커스, 충분한 대비를 유지한다.

## 9. 보안과 개인정보

### 9.1 즉시 조치

원자료에서 노출된 것으로 확인된 운영 비밀은 제품 구축과 별개로 폐기·회전해야 한다. 이 작업은 해당 계정 권한자가 수행하고 HowZero는 값이 아닌 회전 완료 증거만 기록한다.

### 9.2 제품 규칙

- API 키·비밀번호·서비스 계정 JSON을 Engagement DB, 댓글, 산출물, 로그에 저장하지 않는다.
- 댓글·업로드·인제스트에서 비밀 패턴을 검사하고 저장을 거부한 뒤 안전한 저장소 참조를 안내한다.
- `Integration`에는 비밀 저장소 참조, 접근 상태, 권한 범위, 마지막 검사·회전 시각만 둔다.
- 리드 저장은 개인정보 동의를 서버에서 필수 검증한다.
- 필요한 PII 컬럼과 재처리 payload는 기존 `ENCRYPTION_KEY_V1` 체계로 암호화하고, 키 접근 권한을 worker·API 역할별로 제한한다.
- 보존기간 만료 시 원본 PII를 삭제·가명화하고 비민감 열람·삭제 Event만 남긴다.
- 모든 파일 다운로드도 Organization 접근 검사를 거친다.
- 업로드 파일은 허용 MIME·크기·확장자를 검사하고 실행 가능한 콘텐츠를 브라우저에서 직접 렌더하지 않는다.
- 상태 변경과 승인은 append-only Event로 감사할 수 있어야 한다.
- 고객용 앱은 Paperclip API를 직접 호출하지 않는다.

### 9.3 기존 결함 선행 수정

- `howzero-web` 미들웨어가 인증 사용자 ID를 응답 헤더가 아니라 내부 요청 헤더로 전달하도록 수정한다.
- 로그아웃이 실제 refresh token 폐기 경로를 타도록 matcher와 actor 전달을 수정한다.
- `users.is_admin`에 의존하지 않고 조직 멤버십과 역할을 인증 문맥에 포함한다.
- Paperclip의 Approval·Agent mutation에 회사 접근 검사를 추가하고, 승인 actor를 요청 본문이 아니라 인증 세션에서 결정한다.
- Paperclip을 외부 고객용 멀티테넌트 화면으로 공개하지 않는다.

## 10. 실패 처리

- 각각의 승인 요청 생성, 고객 결정, 단계 전환은 해당 상태 변경과 Event·OutboxEvent 기록을 하나의 짧은 DB transaction으로 처리한다. 장시간 고객 승인을 하나의 transaction으로 유지하지 않는다.
- HowZero는 `ExecutionRequest`를 먼저 transaction으로 저장하고 고유 ID를 BullMQ `jobId`로 사용한다. 같은 논리 작업의 재시도는 같은 ID를 재사용한다.
- DB→worker→BullMQ→Paperclip 전달은 at-least-once다. 각 경계의 같은 idempotencyKey와 unique constraint가 사용자에게 보이는 효과를 한 번으로 제한한다.
- Paperclip Issue 생성 API는 동일 ID를 `idempotencyKey`로 받고 회사별 unique constraint로 중복 생성을 막아야 한다. 현재 범용 Issue 생성에 이 계약이 없으므로 Paperclip 연동 하위 프로젝트에서 최소 필드와 검사를 추가한다.
- Paperclip 또는 외부 API 장애 시 Engagement 상태를 유지하고 BullMQ에서 제한 재시도한다. 최종 실패는 담당자 업무와 알림으로 전환한다.
- 웹훅은 서명·중복·순서 검사를 거친다. 재처리에 필요한 정규화 payload만 암호화해 짧은 보존기간으로 저장하고 비밀값은 제외한다. PII가 필요 없는 이벤트는 실패 메타데이터만 보관한다.
- 지표 대사가 허용 오차를 넘으면 UAT를 통과시키지 않는다. 임의 휴리스틱은 고객 승인된 `Decision` 없이는 사용하지 않는다.
- 범위 변경은 기존 요구를 덮어쓰지 않고 새 Decision, 영향, 승인으로 남긴다.
- 고객이 `ARTIFACT_ACCEPTANCE`로 인수한 산출물을 수정할 때는 새 버전을 만들고 내부 `ARTIFACT_PUBLISH`와 고객 인수를 다시 받으며 이전 이력을 보존한다.
- 컷오버는 PoC 대상 단위로 실행하며 실패하면 문서화된 롤백 경로로 복구한다.

## 11. 검증 전략

최소 검증 세트는 다음과 같다.

1. 역할별 Organization 격리와 내부 정보 비노출 API 테스트
2. 허용·거부되는 Opportunity·Engagement 상태 전환 표 테스트
3. Paperclip Issue와 BullMQ 작업 재시도 시 중복 생성 방지 테스트
4. Paperclip 장애·복구와 최종 실패 전환 테스트
5. 지표 허용 오차, 매핑 누락, UAT 차단 테스트
6. 관리자 생성 → 고객 제출 → 승인 → AI 작업 → 내부 검토 → 고객 공개 E2E
7. 익명화한 파일럿 A fixture를 이용한 전체 여정 재생
8. 실제 합의 기준값이 없을 때 ROI를 표시하지 않는 테스트

파일럿 A fixture에는 비밀값, 개인식별정보, 원문 대화 전체를 포함하지 않는다. 요구·결정·실패 유형과 익명화된 최소 샘플만 사용한다.

익명화는 회사·사람·위치·채팅방·파일명을 가명으로 바꾸고 계정 식별자를 삭제하며, 정확한 금액·건수는 테스트 의미를 보존하는 합성값으로 대체하는 것을 뜻한다. 원문 문장을 그대로 인용하지 않는다. fixture와 위키 문서는 비밀·PII 검사를 통과해야 저장할 수 있다.

## 12. 구현 분해와 순서

이 설계는 한 번에 구현하지 않는다. 각 하위 프로젝트는 별도 설계·계획·구현·검증 주기를 가진다.

1. **Engagement 계약 기반**
   - 상태·승인·검사 schema, 전환 validator, 공통 스킬 입출력, 익명화 fixture runner, fixture mode의 `ax-engagement-orchestrator`, AI 메타 동기화 복구
   - 운영 DB·API·Paperclip side effect는 포함하지 않는다.
   - 다음 구현 계획의 대상
2. **진단 스킬 패키지**
   - `ax-evidence-ingest`, `ax-secure-access`, `ax-current-state-audit`, `ax-metric-contract`, `ax-solution-blueprint`을 각각 별도 설계·계획·구현 주기로 만든다.
   - 이 단계의 산출물은 SKILL.md, 참조 자료, 정상·차단 fixture test이며 운영 side effect는 없다.
3. **구축·운영 스킬 패키지**
   - `ax-build-runner`, `ax-qa-reconcile`, `ax-cutover-handoff`, `ax-operations-review`를 각각 별도 설계·계획·구현 주기로 만든다.
   - 이 단계도 계약과 fixture 검증까지만 수행한다.
4. **인증·조직 권한 기반**
   - 기존 인증 결함 수정, instance admin, Organization 멤버십, service grant
5. **원장 DB와 리드 인계**
   - Opportunity·Agreement·Engagement·단계 객체, Event·OutboxEvent, `ax-web` handoff
6. **내부 다음 행동 수직 흐름**
   - 영업 인박스 → 파이프라인 → Engagement 작업실 → 승인 인박스
7. **고객 의사결정 수직 흐름**
   - 고객 Task·Comment → 결정·승인 → Artifact 공개 → 일정·성과
8. **내구성 실행 전달**
   - OutboxEvent → BullMQ → ExecutionRequest, 재시도·최종 실패
9. **Paperclip 실행 수명주기**
   - 회사·프로젝트 매핑, 범용 idempotency, Issue·결과 상태 반영
10. **진단 스킬 운영 활성화**
   - 2번 스킬을 인증된 Engagement API와 연결하고 단계별 E2E를 통과시킨다.
11. **구축·운영 스킬 운영 활성화**
   - 3번 스킬을 ExecutionRequest·Paperclip과 연결하고 실패·재개 E2E를 통과시킨다.
12. **파일럿 A 이력 백필**
   - 과거 결정·지표·산출물 재구성, 보안 회전 확인, 전체 여정 재생
13. **교육·콘텐츠 커머스 팩과 한 강의 PoC**
   - `pack.json`, 지표·매핑·연동 체크리스트, 점진 전환·롤백 검증
14. **위키 축적과 운영 검수**
   - `wiki/HowZero AX Index.md`, `wiki/HowZero Technical System.md`, 신규 AX Engagement OS·첫 고객 사례, `wiki/HowZero Open Questions.md`, `wiki/index.md`, `wiki/log.md` 갱신

## 13. 완료 기준

전체 목표는 다음 증거가 모두 있을 때만 완료다.

1. 새 고객과 사용자를 코드 수정 없이 생성하고 역할별 접근을 부여할 수 있다.
2. 새 Opportunity를 수주 처리하면 Engagement가 생성되고 첫 단계가 열린다.
3. 각 단계는 필수 입력·검사·산출물·승인 없이는 넘어가지 않는다.
4. 관리자와 고객이 같은 원장의 서로 허용된 데이터만 본다.
5. 고객 제출과 승인이 Paperclip 작업으로 이어지고 결과가 내부 검토 후 고객에게 공개된다.
6. 재시도·장애에도 중복 Issue나 상태 유실이 없다.
7. 비밀값은 원장·로그·fixture·위키에 존재하지 않는다.
8. 파일럿 A 자료에 노출된 운영 비밀의 폐기·회전 완료를 해당 권한자가 확인하고, 값이 아닌 확인 증거만 남긴다.
9. 파일럿 A 이력을 익명화해 새 모델로 백필하고 전체 여정을 재생한다.
10. `education-commerce` 팩으로 같은 유형 고객의 데이터·지표·이관 검사를 재사용할 수 있다.
11. HowZero 위키에 설계, 사례, 운영 규칙, 미결정 사항, 변경 로그가 연결된다.
12. 기존 고객 포털의 임의 고정 단가 기반 추정 계산을 제거하고, 합의된 기준값과 실제 측정값이 없으면 성과를 표시하지 않는다.

## 14. 명시적 기본 결정

- 첫 릴리스의 기준 원장은 `howzero-web` Postgres다.
- 관리자와 고객 포털은 `howzero-web` 안에 둔다.
- Paperclip은 내부 실행 제어면으로만 사용한다.
- 영업·계약·정산은 상태·금액·파일을 관리하되 외부 전자서명·결제·세금계산서 연동은 하지 않는다.
- 고객 화면은 단계·할 일·결정·일정·산출물·승인·성과만 공개한다.
- 업종 공통 코어와 `education-commerce` 팩을 분리한다.
- 첫 구현 계획은 12장 1번인 Engagement 계약 기반만 다룬다. 나머지 9개 단계 스킬은 12장 2·3번에서 구현한다.
