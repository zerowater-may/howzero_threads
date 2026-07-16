# hz-os A to Z — 고객사 라이프사이클 관리 고도화 스펙

> 2026-07-16 · deep-research(dalpha 온톨로지 · pluuug 영업정산 올인원 · kmong AX) 종합.
> 목표: 고객사가 랜딩 상담으로 들어오면 리드→진단→제안→계약→구축→운영 A to Z를 hz-os 하나로 관리.

## 1. 핵심 재설계 — 루트를 프로젝트에서 고객사(Company)로

현재 hz-os는 project가 루트다. 온톨로지 관점(dalpha)에서 **company(고객사)를 테넌트 루트**로 올린다. 프로젝트/계약/딜/온톨로지 엔티티는 전부 `company_id`로 격리·귀속. 고객사의 운영 온톨로지는 프로젝트가 끝나도 남는 자산(재계약 시 재사용).

## 2. 파이프라인 6단계 (pluuug 딜 + kmong 진행)

`상담신청 → 진단 → 제안 → 계약 → 구축 → 운영` — 값 테이블로 커스텀 가능.

| 단계 | 하는 일 | 산출물 |
|---|---|---|
| lead | ax-web 리드 → 딜 카드 승격, UTM 귀속, 담당 배정 | 딜 카드 |
| diagnose | 미팅 AI 니즈추출 → 병목/업무/도구 온톨로지 엔티티 + ROI 정렬 | 운영 OS 온톨로지, 병목 우선순위 |
| propose | 임팩트맵 근거 M/M 견적·제안서, 열람/수락 추적 | 제안서(버전) |
| contract | 1계약=1진실페이지: 히스토리·정산·지출·실시간 마진 | 계약 통합페이지, 마일스톤 |
| build | 액션 상태머신 타임라인, 산출물 검수, 투입공수→마진 | Deliverable, 간트 |
| operate | baseline→성과 측정, 정산·세금계산서, 재계약 근거 | before/after 대시보드, 정산 |

## 3. 데이터 모델 (기존 유지 + 확장)

기존 유지: projects, documents, doc_versions, meetings, updates, comments, leads(인바운드).

신규/확장:
- **companies** — 테넌트 루트. 사업자정보(번호·상호·대표·주소, 세금계산서용)·업종·규모·설정(시급/마진임계). leads·projects가 `company_id` FK로 연결.
- **leads 확장** — `company_id`, `stage`(파이프라인), `owner`, `utm_source/campaign/content`. 인바운드 리드가 딜로.
- **activity_log** — append-only 이벤트 `(company_id, object_type, object_id, actor, verb, from_state, to_state, payload, ts)`. 자동 히스토리·전환율·지연 플래그·타임라인 원천.
- **objects** — 온톨로지 엔티티 단일테이블+JSONB `(id, company_id, type, label, state, props)`. type: process/task/tool/automation/bottleneck/metric/deliverable/owner.
- **edges** — typed 그래프 `(company_id, src_id, dst_id, rel_type)`. rel_type: uses/owned_by/replaces/measures/blocks/produces. 재귀 CTE로 순회(전용 그래프DB 불필요).
- **proposals** — `(deal_id, line_items[], mm_formula, version, status[sent/viewed/accepted])`.
- **contracts** — `(company_id, deal_id, proposal_id, amount, file, milestones[], status)`. projects에 `contract_id` 추가. 마진 = amount − Σtimelog − Σexpense(파생).
- **settlements** — `(contract_id, milestone_id, 예정금액·일, 입금매칭상태, tax_invoice)`.
- **metric_readings** — `(metric_object_id, ts, value, is_baseline)`. 배포→운영 시 baseline 강제.
- **timelogs** — `(member_id, contract_id, 투입공수, 인건비단가)`.

설계 원칙(pluuug): 한 번 입력한 값은 FK 참조로 흐르고 재입력·복사 금지. 상태변화는 전부 activity_log 이벤트. 대시보드는 저장 없이 집계 뷰. 모든 테이블 `company_id NOT NULL` + 쿼리레벨 격리.

## 4. MVP 구현 순서 (이번 세션)

1. **companies** + 기존 leads/projects 마이그레이션 (실데이터 보존)
2. **딜 파이프라인 칸반** — leads stage/owner/utm, 인바운드 문의함 → 칸반 뷰, 리드→딜 승격
3. **activity_log** — 상태전이 이벤트
4. **온톨로지(objects+edges)** — 미팅 니즈 → 병목 엔티티 + ROI 정렬 임팩트맵
5. **제안+계약** — M/M 견적, 계약 통합페이지(실시간 마진), projects 연결
6. **운영 대시보드** — 파이프라인 KPI·전환율·마진·현금흐름·UTM ROI

later: 정산 홈택스 API, 은행 자동매칭, RBAC·고객사 게스트뷰, AI 진단/설계 에이전트 고도화, 크로스 고객사 온톨로지 템플릿.

## 5. 하위호환 / 마이그레이션

기존 실데이터(왕십리 프로젝트, 인바운드 리드) 보존. 스키마는 IF NOT EXISTS + ALTER ADD COLUMN. project는 삭제하지 않고 company 하위로 재배치(company_id 백필: client_name 기준 company 생성).

## 6. 검증

vitest(roi 스코어·마진 파생·마이그레이션 멱등성), tsc, build, E2E: 리드→딜 승격→진단 온톨로지→제안→계약→대시보드 집계 왕복. 배포는 batch_server Coolify 재배포(deploy.sh).
