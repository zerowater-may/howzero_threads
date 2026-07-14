# HowZero AX Engagement 계약 기반 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 운영 시스템을 변경하지 않는 fixture 모드에서 Opportunity·Engagement 상태 계약, 승인·검사 게이트, 공통 스킬 입출력, 익명화된 파일럿 A 여정 재생, `ax-engagement-orchestrator` 스킬과 AI 메타 미러를 검증 가능하게 만든다.

**Architecture:** 표준 라이브러리만 사용하는 `src/howzero_ax` 패키지가 상태와 전환 규칙의 단일 실행 계약을 소유한다. JSON fixture는 읽기 전용 입력이며 기준 원장이 아니다. `.claude/skills`가 스킬 원본이고, 새 스킬 경로만 명시적으로 `.agents/skills`와 `docs/ai/skills`로 복제한다. 이 단계에는 운영 DB, API, BullMQ, Paperclip, 외부 알림, UI side effect가 없다.

**Tech Stack:** Python 3.10+, dataclasses, Enum, argparse, json, pathlib, pytest, uv

---

## 구현 범위

이번 계획은 승인된 설계의 12장 1번만 구현한다.

- Opportunity 전환 표
- Engagement 9단계와 수명·단계 상태
- 승인 유형·상태·역할, 검사 상태
- 공통 스킬 입력·출력 계약
- 단계 게이트 전환 판단
- `OPERATE_OPTIMIZE`의 계속·일시중지·완료 판단
- 익명화된 파일럿 A 정상·보안 차단 fixture
- fixture 전용 CLI
- `ax-engagement-orchestrator` 원본 스킬과 참조 문서
- 원본→미러 동기화 스크립트 복구

이번 계획에 포함하지 않는다.

- `howzero-web`, `ax-web`, `howzero-dashboard` 수정
- 운영 DB schema·API·인증·조직 권한
- BullMQ·Paperclip·외부 API 호출
- 나머지 9개 단계 스킬 구현
- 고객·관리자 UI
- 실자료·원문 대화·녹음·비밀값·개인식별정보 저장
- wiki 갱신과 파일럿 이력 백필

## 파일 구조

~~~text
AGENTS.md                                           # 동기화 규칙 수정
src/howzero_ax/
├── __init__.py
├── contract.py
├── fixture_runner.py
└── transitions.py
tests/howzero_ax/
├── fixtures/
│   ├── pilot-a-happy-path.json
│   └── pilot-a-secure-access-blocked.json
├── test_contract.py
├── test_fixture_runner.py
├── test_skill_metadata.py
├── test_sync_ai_meta.py
└── test_transitions.py
.claude/skills/ax-engagement-orchestrator/
├── SKILL.md
└── references/
    └── engagement-contract.md
.agents/skills/ax-engagement-orchestrator/       # 생성 미러
docs/ai/skills/ax-engagement-orchestrator/       # 생성 미러
scripts/sync_ai_meta.py
~~~

## 계약 결정

- 계약 버전은 `howzero.ax.engagement.v1`로 고정한다.
- fixture ID, actor ID, artifact ID는 불투명한 합성 식별자만 쓴다.
- 모든 단계는 코어가 고정한 필수 check ID와 단계별 필수 승인자를 요구한다.
- `PASS`, `FAIL`, `NOT_APPLICABLE` 검사 모두 증거 artifact와 검사기 버전을 요구한다.
- 필수 여부와 관계없이 `FAIL`은 차단한다. `NOT_APPLICABLE`은 사유가 없으면 계약 오류다.
- 승인은 Organization·Membership·현재 단계·현재 revision에 귀속된다. 과거 revision 승인은 재사용하지 않는다.
- 운영 action은 승인 내용에 결합하며 필수 승인자 간 action이 다르거나
  같은 Membership이 양측 역할을 자칭하면 차단한다.
- 이전 단계 revision 무효화와 비어 있거나 동일한 양측 Decision ID를 사용한 취소를 validator가 차단한다.
- 오케스트레이터는 전환 결정을 반환할 뿐 fixture 파일이나 외부 상태를 변경하지 않는다.
- 정상 fixture는 9단계를 순서대로 재생하고 첫 운영 리뷰에서 `COMPLETED`로 끝난다.
- 차단 fixture는 실제 비밀값 없이 `SECURE_ACCESS` 검사 실패만 재현한다.
- AI 메타 동기화는 `--skill`을 필수로 하고 파일을 삭제하지 않는다. 구현 중에는 `--skill ax-engagement-orchestrator`만 사용해 기존 미러 변경을 보존한다.

---

### Task 1: 상태·승인·검사와 공통 스킬 계약

**Files:**

- Create: `src/howzero_ax/__init__.py`
- Create: `src/howzero_ax/contract.py`
- Create: `tests/howzero_ax/test_contract.py`

- [ ] **Step 1: 실패하는 계약 테스트 작성**

`tests/howzero_ax/test_contract.py`를 다음 내용으로 만든다.

~~~python
import pytest

from howzero_ax.contract import (
    CONTRACT_VERSION,
    ApprovalRecord,
    ApprovalRole,
    ApprovalStatus,
    ApprovalType,
    CheckResult,
    CheckStatus,
    ContractError,
    EngagementStage,
    OperationsAction,
    OpportunityStage,
    SkillRunInput,
    SkillRunOutput,
    SkillRunStatus,
    STAGE_ORDER,
)


def test_contract_version_and_stage_order_are_stable():
    assert CONTRACT_VERSION == "howzero.ax.engagement.v1"
    assert [stage.value for stage in STAGE_ORDER] == [
        "INTAKE",
        "SECURE_ACCESS",
        "CURRENT_STATE_AUDIT",
        "METRIC_CONTRACT",
        "SOLUTION_BLUEPRINT",
        "BUILD",
        "RECONCILE_UAT",
        "CUTOVER_HANDOFF",
        "OPERATE_OPTIMIZE",
    ]
    assert OpportunityStage.WON.value == "WON"
    assert EngagementStage.OPERATE_OPTIMIZE.value == "OPERATE_OPTIMIZE"


def test_not_applicable_check_requires_reason():
    with pytest.raises(ContractError, match="reason"):
        CheckResult.from_dict(
            {
                "check_id": "mapping_coverage",
                "required": True,
                "status": "NOT_APPLICABLE",
                "reason": "",
                "evidence_artifact_ids": ["art_fixture_evidence"],
                "checker_version": "fixture-1",
            }
        )


def test_check_requires_evidence_and_checker_version():
    with pytest.raises(ContractError, match="evidence_artifact_ids"):
        CheckResult.from_dict(
            {
                "check_id": "required_fields",
                "required": True,
                "status": "PASS",
                "reason": "",
                "evidence_artifact_ids": [],
                "checker_version": "fixture-1",
            }
        )


def test_common_skill_input_and_output_parse_without_pii_payloads():
    run_input = SkillRunInput.from_dict(
        {
            "contract_version": CONTRACT_VERSION,
            "execution_request_id": "exec_fixture_001",
            "engagement_id": "eng_fixture_pilot_a",
            "organization_id": "org_fixture_pilot_a",
            "stage": "METRIC_CONTRACT",
            "stage_revision": 1,
            "actor_id": "membership_fixture_reviewer",
            "actor_roles": ["HOWZERO_DATA_REVIEWER"],
            "artifact_ids": ["art_fixture_metric_source"],
            "pack_id": "education-commerce",
            "pack_version": "1.0.0",
        }
    )
    run_output = SkillRunOutput.from_dict(
        {
            "contract_version": CONTRACT_VERSION,
            "execution_request_id": "exec_fixture_001",
            "skill_name": "ax-metric-contract",
            "status": "AWAITING_APPROVAL",
            "artifact_ids": ["art_fixture_metric_contract"],
            "checks": [
                {
                    "check_id": "metric_formula_complete",
                    "required": True,
                    "status": "PASS",
                    "reason": "",
                    "evidence_artifact_ids": ["art_fixture_metric_contract"],
                    "checker_version": "fixture-1",
                }
            ],
            "approval_types_requested": ["METRIC_CONTRACT"],
            "blockers": [],
        }
    )

    assert run_input.stage is EngagementStage.METRIC_CONTRACT
    assert run_input.stage_revision == 1
    assert run_output.status is SkillRunStatus.AWAITING_APPROVAL
    assert run_output.checks[0].status is CheckStatus.PASS
    assert ApprovalStatus.APPROVED.value == "APPROVED"


def test_common_contract_rejects_unexpected_payload_fields():
    with pytest.raises(ContractError, match="허용되지 않은 필드"):
        SkillRunInput.from_dict(
            {
                "contract_version": CONTRACT_VERSION,
                "execution_request_id": "exec_fixture_001",
                "engagement_id": "eng_fixture_pilot_a",
                "organization_id": "org_fixture_pilot_a",
                "stage": "INTAKE",
                "stage_revision": 1,
                "actor_id": "membership_fixture_owner",
                "actor_roles": ["HOWZERO_OWNER"],
                "artifact_ids": [],
                "pack_id": "education-commerce",
                "pack_version": "1.0.0",
                "customer_contact": "redacted",
            }
        )


def test_operations_approval_binds_the_approved_action():
    approval = ApprovalRecord.from_fixture(
        {
            "approval_id": "ap_fixture_operations_client",
            "approval_type": "OPERATIONS_REVIEW",
            "approver_role": "CLIENT_OWNER",
            "approver_membership_id": "membership_fixture_client_owner",
            "organization_id": "org_fixture_pilot_a",
            "status": "APPROVED",
            "approved_action": "COMPLETE",
        },
        stage=EngagementStage.OPERATE_OPTIMIZE,
        stage_revision=1,
    )

    assert approval.approver_role is ApprovalRole.CLIENT_OWNER
    assert approval.approval_type is ApprovalType.OPERATIONS_REVIEW
    assert approval.approved_action is OperationsAction.COMPLETE
~~~

- [ ] **Step 2: 계약 테스트가 import 오류로 실패하는지 확인**

Run:

~~~bash
uv run --extra dev pytest tests/howzero_ax/test_contract.py -q
~~~

Expected: `ModuleNotFoundError: No module named 'howzero_ax'`.

- [ ] **Step 3: 계약 타입 구현**

`src/howzero_ax/contract.py`를 다음 내용으로 만든다.

~~~python
from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Mapping, TypeVar


CONTRACT_VERSION = "howzero.ax.engagement.v1"


class ContractError(ValueError):
    """계약 입력이 구조 또는 불변식을 위반했을 때 발생한다."""


class OpportunityStage(str, Enum):
    NEW = "NEW"
    QUALIFIED = "QUALIFIED"
    DISCOVERY = "DISCOVERY"
    PROPOSAL = "PROPOSAL"
    WON = "WON"
    LOST = "LOST"


class EngagementStage(str, Enum):
    INTAKE = "INTAKE"
    SECURE_ACCESS = "SECURE_ACCESS"
    CURRENT_STATE_AUDIT = "CURRENT_STATE_AUDIT"
    METRIC_CONTRACT = "METRIC_CONTRACT"
    SOLUTION_BLUEPRINT = "SOLUTION_BLUEPRINT"
    BUILD = "BUILD"
    RECONCILE_UAT = "RECONCILE_UAT"
    CUTOVER_HANDOFF = "CUTOVER_HANDOFF"
    OPERATE_OPTIMIZE = "OPERATE_OPTIMIZE"


class LifecycleStatus(str, Enum):
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class StageStatus(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    BLOCKED = "BLOCKED"
    AWAITING_APPROVAL = "AWAITING_APPROVAL"
    CHANGES_REQUESTED = "CHANGES_REQUESTED"
    APPROVED = "APPROVED"


class ApprovalType(str, Enum):
    STAGE_GATE = "STAGE_GATE"
    METRIC_CONTRACT = "METRIC_CONTRACT"
    BLUEPRINT = "BLUEPRINT"
    UAT_ACCEPTANCE = "UAT_ACCEPTANCE"
    ARTIFACT_PUBLISH = "ARTIFACT_PUBLISH"
    ARTIFACT_ACCEPTANCE = "ARTIFACT_ACCEPTANCE"
    CHANGE_REQUEST = "CHANGE_REQUEST"
    HANDOFF = "HANDOFF"
    OPERATIONS_REVIEW = "OPERATIONS_REVIEW"


class ApprovalStatus(str, Enum):
    REQUESTED = "REQUESTED"
    APPROVED = "APPROVED"
    CHANGES_REQUESTED = "CHANGES_REQUESTED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"


class ApprovalRole(str, Enum):
    CLIENT_OWNER = "CLIENT_OWNER"
    CLIENT_SYSTEM_OWNER = "CLIENT_SYSTEM_OWNER"
    CLIENT_PROCESS_OWNER = "CLIENT_PROCESS_OWNER"
    CLIENT_METRIC_OWNER = "CLIENT_METRIC_OWNER"
    CLIENT_OPERATIONS_OWNER = "CLIENT_OPERATIONS_OWNER"
    HOWZERO_OWNER = "HOWZERO_OWNER"
    HOWZERO_DATA_REVIEWER = "HOWZERO_DATA_REVIEWER"
    HOWZERO_QA_REVIEWER = "HOWZERO_QA_REVIEWER"


class CheckStatus(str, Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    NOT_APPLICABLE = "NOT_APPLICABLE"


class OperationsAction(str, Enum):
    CONTINUE = "CONTINUE"
    PAUSE = "PAUSE"
    COMPLETE = "COMPLETE"


class SkillRunStatus(str, Enum):
    SUCCEEDED = "SUCCEEDED"
    BLOCKED = "BLOCKED"
    AWAITING_APPROVAL = "AWAITING_APPROVAL"
    FAILED = "FAILED"


STAGE_ORDER = tuple(EngagementStage)


STAGE_SKILLS = {
    EngagementStage.INTAKE: "ax-evidence-ingest",
    EngagementStage.SECURE_ACCESS: "ax-secure-access",
    EngagementStage.CURRENT_STATE_AUDIT: "ax-current-state-audit",
    EngagementStage.METRIC_CONTRACT: "ax-metric-contract",
    EngagementStage.SOLUTION_BLUEPRINT: "ax-solution-blueprint",
    EngagementStage.BUILD: "ax-build-runner",
    EngagementStage.RECONCILE_UAT: "ax-qa-reconcile",
    EngagementStage.CUTOVER_HANDOFF: "ax-cutover-handoff",
    EngagementStage.OPERATE_OPTIMIZE: "ax-operations-review",
}


STAGE_APPROVAL_TYPES = {
    EngagementStage.INTAKE: ApprovalType.STAGE_GATE,
    EngagementStage.SECURE_ACCESS: ApprovalType.STAGE_GATE,
    EngagementStage.CURRENT_STATE_AUDIT: ApprovalType.STAGE_GATE,
    EngagementStage.METRIC_CONTRACT: ApprovalType.METRIC_CONTRACT,
    EngagementStage.SOLUTION_BLUEPRINT: ApprovalType.BLUEPRINT,
    EngagementStage.BUILD: ApprovalType.STAGE_GATE,
    EngagementStage.RECONCILE_UAT: ApprovalType.UAT_ACCEPTANCE,
    EngagementStage.CUTOVER_HANDOFF: ApprovalType.HANDOFF,
    EngagementStage.OPERATE_OPTIMIZE: ApprovalType.OPERATIONS_REVIEW,
}


STAGE_APPROVER_ROLES = {
    EngagementStage.INTAKE: (
        ApprovalRole.CLIENT_OWNER,
        ApprovalRole.HOWZERO_OWNER,
    ),
    EngagementStage.SECURE_ACCESS: (
        ApprovalRole.CLIENT_SYSTEM_OWNER,
        ApprovalRole.HOWZERO_OWNER,
    ),
    EngagementStage.CURRENT_STATE_AUDIT: (
        ApprovalRole.CLIENT_PROCESS_OWNER,
        ApprovalRole.HOWZERO_OWNER,
    ),
    EngagementStage.METRIC_CONTRACT: (
        ApprovalRole.CLIENT_METRIC_OWNER,
        ApprovalRole.HOWZERO_DATA_REVIEWER,
    ),
    EngagementStage.SOLUTION_BLUEPRINT: (
        ApprovalRole.CLIENT_OWNER,
        ApprovalRole.HOWZERO_OWNER,
    ),
    EngagementStage.BUILD: (ApprovalRole.HOWZERO_OWNER,),
    EngagementStage.RECONCILE_UAT: (
        ApprovalRole.CLIENT_OWNER,
        ApprovalRole.HOWZERO_QA_REVIEWER,
    ),
    EngagementStage.CUTOVER_HANDOFF: (
        ApprovalRole.CLIENT_OPERATIONS_OWNER,
        ApprovalRole.HOWZERO_OWNER,
    ),
    EngagementStage.OPERATE_OPTIMIZE: (
        ApprovalRole.CLIENT_OWNER,
        ApprovalRole.HOWZERO_OWNER,
    ),
}


STAGE_REQUIRED_CHECK_IDS = {
    EngagementStage.INTAKE: ("intake_goal_scope_owners_complete",),
    EngagementStage.SECURE_ACCESS: (
        "plaintext_secret_absent",
        "minimum_access_verified",
    ),
    EngagementStage.CURRENT_STATE_AUDIT: (
        "source_owner_and_gaps_confirmed",
    ),
    EngagementStage.METRIC_CONTRACT: (
        "metric_formula_source_tolerance_complete",
    ),
    EngagementStage.SOLUTION_BLUEPRINT: (
        "poc_migration_rollback_uat_defined",
    ),
    EngagementStage.BUILD: ("required_build_issues_reviewed",),
    EngagementStage.RECONCILE_UAT: (
        "reconciliation_within_tolerance",
    ),
    EngagementStage.CUTOVER_HANDOFF: (
        "rollback_recovery_and_training_verified",
    ),
    EngagementStage.OPERATE_OPTIMIZE: (
        "operations_review_evidence_complete",
    ),
}


EnumType = TypeVar("EnumType", bound=Enum)


def enum_value(enum_type: type[EnumType], value: object, field: str) -> EnumType:
    try:
        return enum_type(value)
    except (TypeError, ValueError) as exc:
        allowed = ", ".join(item.value for item in enum_type)
        raise ContractError(f"{field}: 허용값은 {allowed}") from exc


def require_text(value: object, field: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ContractError(f"{field}: 비어 있지 않은 문자열이 필요함")
    return value.strip()


def require_positive_int(value: object, field: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value < 1:
        raise ContractError(f"{field}: 1 이상의 정수가 필요함")
    return value


def string_tuple(value: object, field: str, *, allow_empty: bool) -> tuple[str, ...]:
    if not isinstance(value, list):
        raise ContractError(f"{field}: 문자열 배열이 필요함")
    result = tuple(require_text(item, f"{field}[]") for item in value)
    if not allow_empty and not result:
        raise ContractError(f"{field}: 한 개 이상 필요함")
    return result


def require_mapping(value: object, field: str) -> Mapping[str, object]:
    if not isinstance(value, Mapping):
        raise ContractError(f"{field}: 객체가 필요함")
    return value


def reject_unknown_fields(
    data: Mapping[str, object],
    allowed: set[str],
    field: str,
) -> None:
    unknown = sorted(set(data) - allowed)
    if unknown:
        raise ContractError(
            f"{field}: 허용되지 않은 필드: {', '.join(unknown)}"
        )


@dataclass(frozen=True)
class CheckResult:
    check_id: str
    required: bool
    status: CheckStatus
    reason: str
    evidence_artifact_ids: tuple[str, ...]
    checker_version: str

    @classmethod
    def from_dict(cls, data: Mapping[str, object]) -> "CheckResult":
        reject_unknown_fields(
            data,
            {
                "check_id",
                "required",
                "status",
                "reason",
                "evidence_artifact_ids",
                "checker_version",
            },
            "check",
        )
        required = data.get("required")
        if not isinstance(required, bool):
            raise ContractError("required: boolean이 필요함")
        status = enum_value(CheckStatus, data.get("status"), "status")
        reason_value = data.get("reason", "")
        if not isinstance(reason_value, str):
            raise ContractError("reason: 문자열이 필요함")
        reason = reason_value.strip()
        if status in {CheckStatus.FAIL, CheckStatus.NOT_APPLICABLE} and not reason:
            raise ContractError(f"reason: {status.value} 검사에는 사유가 필요함")
        return cls(
            check_id=require_text(data.get("check_id"), "check_id"),
            required=required,
            status=status,
            reason=reason,
            evidence_artifact_ids=string_tuple(
                data.get("evidence_artifact_ids"),
                "evidence_artifact_ids",
                allow_empty=False,
            ),
            checker_version=require_text(
                data.get("checker_version"),
                "checker_version",
            ),
        )


@dataclass(frozen=True)
class ApprovalRecord:
    approval_id: str
    approval_type: ApprovalType
    approver_role: ApprovalRole
    approver_membership_id: str
    organization_id: str
    status: ApprovalStatus
    approved_action: OperationsAction | None
    stage: EngagementStage
    stage_revision: int

    @classmethod
    def from_fixture(
        cls,
        data: Mapping[str, object],
        *,
        stage: EngagementStage,
        stage_revision: int,
    ) -> "ApprovalRecord":
        reject_unknown_fields(
            data,
            {
                "approval_id",
                "approval_type",
                "approver_role",
                "approver_membership_id",
                "organization_id",
                "status",
                "approved_action",
            },
            "approval",
        )
        approval_type = enum_value(
            ApprovalType,
            data.get("approval_type"),
            "approval_type",
        )
        status = enum_value(ApprovalStatus, data.get("status"), "status")
        action_value = data.get("approved_action")
        approved_action = (
            enum_value(
                OperationsAction,
                action_value,
                "approved_action",
            )
            if action_value is not None
            else None
        )
        if (
            approval_type is ApprovalType.OPERATIONS_REVIEW
            and status is ApprovalStatus.APPROVED
            and approved_action is None
        ):
            raise ContractError(
                "approved_action: 승인된 운영 리뷰에는 결정이 필요함"
            )
        if (
            approval_type is not ApprovalType.OPERATIONS_REVIEW
            and approved_action is not None
        ):
            raise ContractError(
                "approved_action: 운영 리뷰 승인에만 사용할 수 있음"
            )
        return cls(
            approval_id=require_text(data.get("approval_id"), "approval_id"),
            approval_type=approval_type,
            approver_role=enum_value(
                ApprovalRole,
                data.get("approver_role"),
                "approver_role",
            ),
            approver_membership_id=require_text(
                data.get("approver_membership_id"),
                "approver_membership_id",
            ),
            organization_id=require_text(
                data.get("organization_id"),
                "organization_id",
            ),
            status=status,
            approved_action=approved_action,
            stage=stage,
            stage_revision=stage_revision,
        )


@dataclass(frozen=True)
class StageDependencyChange:
    stage: EngagementStage
    invalidated_revision: int
    decision_id: str
    resolved: bool
    resolution_approval_ids: tuple[str, ...]

    @classmethod
    def from_dict(
        cls,
        data: Mapping[str, object],
    ) -> "StageDependencyChange":
        reject_unknown_fields(
            data,
            {
                "stage",
                "invalidated_revision",
                "decision_id",
                "resolved",
                "resolution_approval_ids",
            },
            "dependency_change",
        )
        resolved = data.get("resolved")
        if not isinstance(resolved, bool):
            raise ContractError("resolved: boolean이 필요함")
        return cls(
            stage=enum_value(EngagementStage, data.get("stage"), "stage"),
            invalidated_revision=require_positive_int(
                data.get("invalidated_revision"),
                "invalidated_revision",
            ),
            decision_id=require_text(data.get("decision_id"), "decision_id"),
            resolved=resolved,
            resolution_approval_ids=string_tuple(
                data.get("resolution_approval_ids"),
                "resolution_approval_ids",
                allow_empty=True,
            ),
        )


@dataclass(frozen=True)
class CancellationRequest:
    reason: str
    client_decision_id: str
    howzero_decision_id: str

    @classmethod
    def from_dict(
        cls,
        data: Mapping[str, object],
    ) -> "CancellationRequest":
        reject_unknown_fields(
            data,
            {
                "reason",
                "client_decision_id",
                "howzero_decision_id",
            },
            "cancellation",
        )
        return cls(
            reason=require_text(data.get("reason"), "reason"),
            client_decision_id=require_text(
                data.get("client_decision_id"),
                "client_decision_id",
            ),
            howzero_decision_id=require_text(
                data.get("howzero_decision_id"),
                "howzero_decision_id",
            ),
        )


@dataclass(frozen=True)
class OpportunityTransitionContext:
    lost_reason: str = ""
    recontact_on: str = ""
    reopen_reason: str = ""
    agreement_artifact_ids: tuple[str, ...] = ()


@dataclass(frozen=True)
class EngagementSnapshot:
    engagement_id: str
    organization_id: str
    lifecycle_status: LifecycleStatus
    current_stage: EngagementStage
    stage_revision: int
    stage_status: StageStatus
    checks: tuple[CheckResult, ...]
    approvals: tuple[ApprovalRecord, ...]
    invalidated_dependencies: tuple[StageDependencyChange, ...] = ()


@dataclass(frozen=True)
class SkillRunInput:
    contract_version: str
    execution_request_id: str
    engagement_id: str
    organization_id: str
    stage: EngagementStage
    stage_revision: int
    actor_id: str
    actor_roles: tuple[str, ...]
    artifact_ids: tuple[str, ...]
    pack_id: str
    pack_version: str

    @classmethod
    def from_dict(cls, data: Mapping[str, object]) -> "SkillRunInput":
        reject_unknown_fields(
            data,
            {
                "contract_version",
                "execution_request_id",
                "engagement_id",
                "organization_id",
                "stage",
                "stage_revision",
                "actor_id",
                "actor_roles",
                "artifact_ids",
                "pack_id",
                "pack_version",
            },
            "skill_input",
        )
        version = require_text(data.get("contract_version"), "contract_version")
        if version != CONTRACT_VERSION:
            raise ContractError(f"지원하지 않는 contract_version: {version}")
        return cls(
            contract_version=version,
            execution_request_id=require_text(
                data.get("execution_request_id"),
                "execution_request_id",
            ),
            engagement_id=require_text(data.get("engagement_id"), "engagement_id"),
            organization_id=require_text(
                data.get("organization_id"),
                "organization_id",
            ),
            stage=enum_value(EngagementStage, data.get("stage"), "stage"),
            stage_revision=require_positive_int(
                data.get("stage_revision"),
                "stage_revision",
            ),
            actor_id=require_text(data.get("actor_id"), "actor_id"),
            actor_roles=string_tuple(
                data.get("actor_roles"),
                "actor_roles",
                allow_empty=False,
            ),
            artifact_ids=string_tuple(
                data.get("artifact_ids"),
                "artifact_ids",
                allow_empty=True,
            ),
            pack_id=require_text(data.get("pack_id"), "pack_id"),
            pack_version=require_text(data.get("pack_version"), "pack_version"),
        )


@dataclass(frozen=True)
class SkillRunOutput:
    contract_version: str
    execution_request_id: str
    skill_name: str
    status: SkillRunStatus
    artifact_ids: tuple[str, ...]
    checks: tuple[CheckResult, ...]
    approval_types_requested: tuple[ApprovalType, ...]
    blockers: tuple[str, ...]

    @classmethod
    def from_dict(cls, data: Mapping[str, object]) -> "SkillRunOutput":
        reject_unknown_fields(
            data,
            {
                "contract_version",
                "execution_request_id",
                "skill_name",
                "status",
                "artifact_ids",
                "checks",
                "approval_types_requested",
                "blockers",
            },
            "skill_output",
        )
        version = require_text(data.get("contract_version"), "contract_version")
        if version != CONTRACT_VERSION:
            raise ContractError(f"지원하지 않는 contract_version: {version}")
        checks_value = data.get("checks")
        if not isinstance(checks_value, list):
            raise ContractError("checks: 객체 배열이 필요함")
        approval_values = data.get("approval_types_requested")
        if not isinstance(approval_values, list):
            raise ContractError("approval_types_requested: 문자열 배열이 필요함")
        return cls(
            contract_version=version,
            execution_request_id=require_text(
                data.get("execution_request_id"),
                "execution_request_id",
            ),
            skill_name=require_text(data.get("skill_name"), "skill_name"),
            status=enum_value(SkillRunStatus, data.get("status"), "status"),
            artifact_ids=string_tuple(
                data.get("artifact_ids"),
                "artifact_ids",
                allow_empty=True,
            ),
            checks=tuple(
                CheckResult.from_dict(require_mapping(item, "checks[]"))
                for item in checks_value
            ),
            approval_types_requested=tuple(
                enum_value(ApprovalType, item, "approval_types_requested[]")
                for item in approval_values
            ),
            blockers=string_tuple(
                data.get("blockers"),
                "blockers",
                allow_empty=True,
            ),
        )
~~~

`src/howzero_ax/__init__.py`를 다음 내용으로 만든다.

~~~python
"""HowZero AX Engagement 계약과 fixture 오케스트레이션."""

from .contract import CONTRACT_VERSION

__all__ = ["CONTRACT_VERSION"]
~~~

- [ ] **Step 4: 계약 테스트 통과 확인**

Run:

~~~bash
uv run --extra dev pytest tests/howzero_ax/test_contract.py -q
~~~

Expected: `6 passed`.

- [ ] **Step 5: 계약 단위 커밋**

~~~bash
git add src/howzero_ax/__init__.py src/howzero_ax/contract.py tests/howzero_ax/test_contract.py
git commit -m "기능: AX Engagement 계약 타입 추가"
~~~

---

### Task 2: Opportunity·Engagement 전환 validator

**Files:**

- Create: `src/howzero_ax/transitions.py`
- Create: `tests/howzero_ax/test_transitions.py`

- [ ] **Step 1: 실패하는 전환표 테스트 작성**

`tests/howzero_ax/test_transitions.py`를 다음 내용으로 만든다.

~~~python
import pytest

from howzero_ax.contract import (
    ApprovalRecord,
    ApprovalStatus,
    CancellationRequest,
    CheckResult,
    CheckStatus,
    EngagementSnapshot,
    EngagementStage,
    LifecycleStatus,
    OpportunityTransitionContext,
    OpportunityStage,
    OperationsAction,
    STAGE_APPROVAL_TYPES,
    STAGE_APPROVER_ROLES,
    STAGE_REQUIRED_CHECK_IDS,
    StageDependencyChange,
    StageStatus,
)
from howzero_ax.transitions import (
    DecisionKind,
    evaluate_cancellation,
    evaluate_engagement,
    opportunity_transition_allowed,
)


def passing_checks(stage: EngagementStage) -> tuple[CheckResult, ...]:
    return tuple(
        CheckResult(
            check_id=check_id,
            required=True,
            status=CheckStatus.PASS,
            reason="",
            evidence_artifact_ids=(f"art_fixture_{check_id}",),
            checker_version="fixture-1",
        )
        for check_id in STAGE_REQUIRED_CHECK_IDS[stage]
    )


def approvals_for(
    stage: EngagementStage,
    revision: int = 1,
    *,
    action: OperationsAction | None = None,
):
    approval_type = STAGE_APPROVAL_TYPES[stage]
    return tuple(
        ApprovalRecord(
            approval_id=f"ap_fixture_{stage.value.lower()}_{role.value.lower()}",
            approval_type=approval_type,
            approver_role=role,
            approver_membership_id=f"membership_fixture_{role.value.lower()}",
            organization_id="org_fixture_pilot_a",
            status=ApprovalStatus.APPROVED,
            approved_action=action,
            stage=stage,
            stage_revision=revision,
        )
        for role in STAGE_APPROVER_ROLES[stage]
    )


def snapshot(
    stage: EngagementStage,
    *,
    revision: int = 1,
    stage_status: StageStatus = StageStatus.APPROVED,
    lifecycle_status: LifecycleStatus = LifecycleStatus.ACTIVE,
    checks=None,
    approvals=None,
    invalidated_dependencies=(),
) -> EngagementSnapshot:
    return EngagementSnapshot(
        engagement_id="eng_fixture_pilot_a",
        organization_id="org_fixture_pilot_a",
        lifecycle_status=lifecycle_status,
        current_stage=stage,
        stage_revision=revision,
        stage_status=stage_status,
        checks=tuple(checks if checks is not None else passing_checks(stage)),
        approvals=tuple(
            approvals if approvals is not None else approvals_for(stage, revision)
        ),
        invalidated_dependencies=tuple(invalidated_dependencies),
    )


@pytest.mark.parametrize(
    ("current", "target", "context", "allowed"),
    [
        (OpportunityStage.NEW, OpportunityStage.QUALIFIED, None, True),
        (
            OpportunityStage.NEW,
            OpportunityStage.LOST,
            OpportunityTransitionContext(
                lost_reason="현재 우선순위와 맞지 않음",
                recontact_on="2026-10-01",
            ),
            True,
        ),
        (OpportunityStage.NEW, OpportunityStage.LOST, None, False),
        (OpportunityStage.QUALIFIED, OpportunityStage.DISCOVERY, None, True),
        (OpportunityStage.DISCOVERY, OpportunityStage.PROPOSAL, None, True),
        (
            OpportunityStage.PROPOSAL,
            OpportunityStage.WON,
            OpportunityTransitionContext(
                agreement_artifact_ids=("art_fixture_agreement",),
            ),
            True,
        ),
        (OpportunityStage.PROPOSAL, OpportunityStage.WON, None, False),
        (
            OpportunityStage.PROPOSAL,
            OpportunityStage.WON,
            OpportunityTransitionContext(
                agreement_artifact_ids=("",),
            ),
            False,
        ),
        (
            OpportunityStage.LOST,
            OpportunityStage.QUALIFIED,
            OpportunityTransitionContext(
                reopen_reason="재접촉 뒤 시기 조건이 충족됨",
            ),
            True,
        ),
        (OpportunityStage.LOST, OpportunityStage.QUALIFIED, None, False),
        (OpportunityStage.LOST, OpportunityStage.NEW, None, False),
        (OpportunityStage.WON, OpportunityStage.PROPOSAL, None, False),
        (OpportunityStage.NEW, OpportunityStage.WON, None, False),
    ],
)
def test_opportunity_transition_table(current, target, context, allowed):
    assert (
        opportunity_transition_allowed(current, target, context=context)
        is allowed
    )


def test_each_approved_stage_advances_to_the_next_stage():
    ordered = list(EngagementStage)
    for current, expected_next in zip(ordered, ordered[1:]):
        decision = evaluate_engagement(snapshot(current))
        assert decision.kind is DecisionKind.ADVANCE
        assert decision.next_stage is expected_next
        assert decision.next_revision == 1


def test_arbitrary_pass_check_cannot_bypass_stage_contract():
    arbitrary = CheckResult(
        check_id="caller_defined_pass",
        required=True,
        status=CheckStatus.PASS,
        reason="",
        evidence_artifact_ids=("art_fixture_arbitrary",),
        checker_version="fixture-1",
    )

    decision = evaluate_engagement(
        snapshot(EngagementStage.SECURE_ACCESS, checks=[arbitrary])
    )

    assert decision.kind is DecisionKind.BLOCK
    assert "stage_check_missing:plaintext_secret_absent" in decision.reasons
    assert "stage_check_missing:minimum_access_verified" in decision.reasons


def test_optional_failed_check_also_blocks_stage():
    optional_failure = CheckResult(
        check_id="additional_security_observation",
        required=False,
        status=CheckStatus.FAIL,
        reason="추가 검사에서 차단 조건이 발견됨",
        evidence_artifact_ids=("art_fixture_optional_failure",),
        checker_version="fixture-1",
    )

    decision = evaluate_engagement(
        snapshot(
            EngagementStage.SECURE_ACCESS,
            checks=(
                *passing_checks(EngagementStage.SECURE_ACCESS),
                optional_failure,
            ),
        )
    )

    assert decision.kind is DecisionKind.BLOCK
    assert "check_failed:additional_security_observation" in decision.reasons


def test_failed_required_check_blocks_even_if_stage_says_approved():
    stage = EngagementStage.SECURE_ACCESS
    failed = CheckResult(
        check_id="plaintext_secret_absent",
        required=True,
        status=CheckStatus.FAIL,
        reason="원문 값 없이 차단 흐름만 재현함",
        evidence_artifact_ids=("art_fixture_security_scan",),
        checker_version="fixture-1",
    )

    decision = evaluate_engagement(snapshot(stage, checks=[failed]))

    assert decision.kind is DecisionKind.BLOCK
    assert "check_failed:plaintext_secret_absent" in decision.reasons


def test_missing_current_revision_approval_waits():
    stage = EngagementStage.METRIC_CONTRACT
    stale = tuple(
        ApprovalRecord(
            approval_id=approval.approval_id,
            approval_type=approval.approval_type,
            approver_role=approval.approver_role,
            approver_membership_id=approval.approver_membership_id,
            organization_id=approval.organization_id,
            status=approval.status,
            approved_action=approval.approved_action,
            stage=approval.stage,
            stage_revision=1,
        )
        for approval in approvals_for(stage)
    )

    decision = evaluate_engagement(snapshot(stage, revision=2, approvals=stale))

    assert decision.kind is DecisionKind.WAIT
    assert any(reason.startswith("approval_missing:") for reason in decision.reasons)


def test_cross_organization_approval_does_not_satisfy_gate():
    stage = EngagementStage.INTAKE
    approvals = list(approvals_for(stage))
    approval = approvals[0]
    approvals[0] = ApprovalRecord(
        approval_id=approval.approval_id,
        approval_type=approval.approval_type,
        approver_role=approval.approver_role,
        approver_membership_id=approval.approver_membership_id,
        organization_id="org_fixture_other",
        status=approval.status,
        approved_action=approval.approved_action,
        stage=approval.stage,
        stage_revision=approval.stage_revision,
    )

    decision = evaluate_engagement(snapshot(stage, approvals=approvals))

    assert decision.kind is DecisionKind.WAIT
    assert "approval_missing:CLIENT_OWNER" in decision.reasons


def test_same_membership_cannot_approve_both_required_roles():
    stage = EngagementStage.INTAKE
    approvals = list(approvals_for(stage))
    first = approvals[0]
    second = approvals[1]
    approvals[1] = ApprovalRecord(
        approval_id=second.approval_id,
        approval_type=second.approval_type,
        approver_role=second.approver_role,
        approver_membership_id=first.approver_membership_id,
        organization_id=second.organization_id,
        status=second.status,
        approved_action=second.approved_action,
        stage=second.stage,
        stage_revision=second.stage_revision,
    )

    decision = evaluate_engagement(snapshot(stage, approvals=approvals))

    assert decision.kind is DecisionKind.BLOCK
    assert decision.reasons == ("approval_actor_conflict",)


def test_unresolved_previous_stage_change_blocks_current_stage():
    change = StageDependencyChange(
        stage=EngagementStage.METRIC_CONTRACT,
        invalidated_revision=1,
        decision_id="decision_fixture_metric_change",
        resolved=False,
        resolution_approval_ids=(),
    )

    decision = evaluate_engagement(
        snapshot(
            EngagementStage.SOLUTION_BLUEPRINT,
            invalidated_dependencies=(change,),
        )
    )

    assert decision.kind is DecisionKind.BLOCK
    assert "dependency_invalidated:METRIC_CONTRACT:r1" in decision.reasons


def test_resolved_dependency_requires_reapproval_evidence():
    change = StageDependencyChange(
        stage=EngagementStage.METRIC_CONTRACT,
        invalidated_revision=1,
        decision_id="decision_fixture_metric_change",
        resolved=True,
        resolution_approval_ids=(),
    )

    decision = evaluate_engagement(
        snapshot(
            EngagementStage.SOLUTION_BLUEPRINT,
            invalidated_dependencies=(change,),
        )
    )

    assert decision.kind is DecisionKind.BLOCK
    assert decision.reasons == (
        "dependency_resolution_evidence_missing:METRIC_CONTRACT:r1",
    )


@pytest.mark.parametrize(
    ("action", "kind", "lifecycle", "revision"),
    [
        (
            OperationsAction.CONTINUE,
            DecisionKind.CONTINUE,
            LifecycleStatus.ACTIVE,
            2,
        ),
        (
            OperationsAction.PAUSE,
            DecisionKind.PAUSE,
            LifecycleStatus.PAUSED,
            1,
        ),
        (
            OperationsAction.COMPLETE,
            DecisionKind.COMPLETE,
            LifecycleStatus.COMPLETED,
            1,
        ),
    ],
)
def test_operations_review_actions(action, kind, lifecycle, revision):
    decision = evaluate_engagement(
        snapshot(
            EngagementStage.OPERATE_OPTIMIZE,
            approvals=approvals_for(
                EngagementStage.OPERATE_OPTIMIZE,
                action=action,
            ),
        )
    )

    assert decision.kind is kind
    assert decision.next_lifecycle_status is lifecycle
    assert decision.next_revision == revision


def test_operations_review_conflicting_approved_actions_block():
    stage = EngagementStage.OPERATE_OPTIMIZE
    approvals = list(approvals_for(stage, action=OperationsAction.CONTINUE))
    approval = approvals[1]
    approvals[1] = ApprovalRecord(
        approval_id=approval.approval_id,
        approval_type=approval.approval_type,
        approver_role=approval.approver_role,
        approver_membership_id=approval.approver_membership_id,
        organization_id=approval.organization_id,
        status=approval.status,
        approved_action=OperationsAction.COMPLETE,
        stage=approval.stage,
        stage_revision=approval.stage_revision,
    )

    decision = evaluate_engagement(snapshot(stage, approvals=approvals))

    assert decision.kind is DecisionKind.BLOCK
    assert decision.reasons == ("operations_action_conflict",)


def test_cancellation_requires_both_decision_references():
    request = CancellationRequest.from_dict(
        {
            "reason": "양측 합의로 구축을 종료함",
            "client_decision_id": "decision_fixture_client_cancel",
            "howzero_decision_id": "decision_fixture_howzero_cancel",
        }
    )

    decision = evaluate_cancellation(
        snapshot(EngagementStage.SOLUTION_BLUEPRINT),
        request,
    )

    assert decision.kind is DecisionKind.CANCEL
    assert decision.next_lifecycle_status is LifecycleStatus.CANCELLED


def test_cancellation_without_both_decisions_blocks():
    request = CancellationRequest(
        reason="",
        client_decision_id="decision_fixture_client_cancel",
        howzero_decision_id="",
    )

    decision = evaluate_cancellation(
        snapshot(EngagementStage.SOLUTION_BLUEPRINT),
        request,
    )

    assert decision.kind is DecisionKind.BLOCK
    assert decision.reasons == ("cancellation_evidence_missing",)


def test_same_decision_cannot_represent_both_cancellation_parties():
    request = CancellationRequest(
        reason="양측 결정을 별도로 기록해야 함",
        client_decision_id="decision_fixture_shared",
        howzero_decision_id="decision_fixture_shared",
    )

    decision = evaluate_cancellation(
        snapshot(EngagementStage.SOLUTION_BLUEPRINT),
        request,
    )

    assert decision.kind is DecisionKind.BLOCK
    assert decision.reasons == ("cancellation_actor_conflict",)


def test_completed_engagement_has_no_next_action():
    decision = evaluate_engagement(
        snapshot(
            EngagementStage.OPERATE_OPTIMIZE,
            lifecycle_status=LifecycleStatus.COMPLETED,
        )
    )

    assert decision.kind is DecisionKind.NO_ACTION
~~~

- [ ] **Step 2: 전환 모듈 부재로 실패하는지 확인**

Run:

~~~bash
uv run --extra dev pytest tests/howzero_ax/test_transitions.py -q
~~~

Expected: `ModuleNotFoundError: No module named 'howzero_ax.transitions'`.

- [ ] **Step 3: 전환 validator 구현**

`src/howzero_ax/transitions.py`를 다음 내용으로 만든다.

~~~python
from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from enum import Enum

from .contract import (
    ApprovalStatus,
    CancellationRequest,
    CheckStatus,
    EngagementSnapshot,
    EngagementStage,
    LifecycleStatus,
    OpportunityTransitionContext,
    OpportunityStage,
    OperationsAction,
    STAGE_APPROVAL_TYPES,
    STAGE_APPROVER_ROLES,
    STAGE_ORDER,
    STAGE_REQUIRED_CHECK_IDS,
    STAGE_SKILLS,
    StageStatus,
)


class DecisionKind(str, Enum):
    ADVANCE = "ADVANCE"
    WAIT = "WAIT"
    BLOCK = "BLOCK"
    CONTINUE = "CONTINUE"
    PAUSE = "PAUSE"
    COMPLETE = "COMPLETE"
    CANCEL = "CANCEL"
    NO_ACTION = "NO_ACTION"


@dataclass(frozen=True)
class OrchestrationDecision:
    kind: DecisionKind
    next_stage: EngagementStage | None
    next_revision: int
    next_lifecycle_status: LifecycleStatus
    required_skill: str | None
    reasons: tuple[str, ...]

    def to_dict(self) -> dict[str, object]:
        return {
            "kind": self.kind.value,
            "next_stage": self.next_stage.value if self.next_stage else None,
            "next_revision": self.next_revision,
            "next_lifecycle_status": self.next_lifecycle_status.value,
            "required_skill": self.required_skill,
            "reasons": list(self.reasons),
        }


OPPORTUNITY_TRANSITIONS = {
    OpportunityStage.NEW: {
        OpportunityStage.QUALIFIED,
        OpportunityStage.LOST,
    },
    OpportunityStage.QUALIFIED: {
        OpportunityStage.DISCOVERY,
        OpportunityStage.LOST,
    },
    OpportunityStage.DISCOVERY: {
        OpportunityStage.PROPOSAL,
        OpportunityStage.LOST,
    },
    OpportunityStage.PROPOSAL: {
        OpportunityStage.WON,
        OpportunityStage.LOST,
    },
    OpportunityStage.LOST: {OpportunityStage.QUALIFIED},
    OpportunityStage.WON: set(),
}


def opportunity_transition_allowed(
    current: OpportunityStage,
    target: OpportunityStage,
    *,
    context: OpportunityTransitionContext | None = None,
) -> bool:
    if target not in OPPORTUNITY_TRANSITIONS[current]:
        return False
    details = context or OpportunityTransitionContext()
    if target is OpportunityStage.LOST:
        if not details.lost_reason.strip() or not details.recontact_on.strip():
            return False
        try:
            date.fromisoformat(details.recontact_on)
        except ValueError:
            return False
    if current is OpportunityStage.LOST:
        return bool(details.reopen_reason.strip())
    if target is OpportunityStage.WON:
        return bool(details.agreement_artifact_ids) and all(
            artifact_id.strip()
            for artifact_id in details.agreement_artifact_ids
        )
    return True


def _decision(
    snapshot: EngagementSnapshot,
    *,
    kind: DecisionKind,
    reasons: tuple[str, ...] = (),
    next_stage: EngagementStage | None = None,
    next_revision: int | None = None,
    next_lifecycle_status: LifecycleStatus | None = None,
) -> OrchestrationDecision:
    stage = next_stage or snapshot.current_stage
    return OrchestrationDecision(
        kind=kind,
        next_stage=next_stage,
        next_revision=next_revision or snapshot.stage_revision,
        next_lifecycle_status=(
            next_lifecycle_status or snapshot.lifecycle_status
        ),
        required_skill=(
            STAGE_SKILLS[stage]
            if kind
            in {
                DecisionKind.ADVANCE,
                DecisionKind.WAIT,
                DecisionKind.BLOCK,
                DecisionKind.CONTINUE,
            }
            else None
        ),
        reasons=reasons,
    )


def evaluate_engagement(
    snapshot: EngagementSnapshot,
) -> OrchestrationDecision:
    if snapshot.lifecycle_status in {
        LifecycleStatus.COMPLETED,
        LifecycleStatus.CANCELLED,
    }:
        return _decision(snapshot, kind=DecisionKind.NO_ACTION)

    if snapshot.lifecycle_status is LifecycleStatus.PAUSED:
        return _decision(
            snapshot,
            kind=DecisionKind.WAIT,
            reasons=("engagement_paused",),
        )

    invalid_resolutions = tuple(
        change
        for change in snapshot.invalidated_dependencies
        if change.resolved and not change.resolution_approval_ids
    )
    if invalid_resolutions:
        return _decision(
            snapshot,
            kind=DecisionKind.BLOCK,
            reasons=tuple(
                "dependency_resolution_evidence_missing:"
                f"{change.stage.value}:r{change.invalidated_revision}"
                for change in invalid_resolutions
            ),
        )

    unresolved_dependencies = tuple(
        change
        for change in snapshot.invalidated_dependencies
        if not change.resolved
    )
    if unresolved_dependencies:
        return _decision(
            snapshot,
            kind=DecisionKind.BLOCK,
            reasons=tuple(
                "dependency_invalidated:"
                f"{change.stage.value}:r{change.invalidated_revision}"
                for change in unresolved_dependencies
            ),
        )

    failed_checks = tuple(
        f"check_failed:{check.check_id}"
        for check in snapshot.checks
        if check.status is CheckStatus.FAIL
    )
    if failed_checks:
        return _decision(
            snapshot,
            kind=DecisionKind.BLOCK,
            reasons=failed_checks,
        )

    passed_required_ids = {
        check.check_id
        for check in snapshot.checks
        if check.required
        and check.status
        in {
            CheckStatus.PASS,
            CheckStatus.NOT_APPLICABLE,
        }
    }
    missing_checks = tuple(
        f"stage_check_missing:{check_id}"
        for check_id in STAGE_REQUIRED_CHECK_IDS[snapshot.current_stage]
        if check_id not in passed_required_ids
    )
    if missing_checks:
        return _decision(
            snapshot,
            kind=DecisionKind.BLOCK,
            reasons=missing_checks,
        )

    if snapshot.stage_status in {
        StageStatus.BLOCKED,
        StageStatus.CHANGES_REQUESTED,
    }:
        return _decision(
            snapshot,
            kind=DecisionKind.BLOCK,
            reasons=(f"stage_{snapshot.stage_status.value.lower()}",),
        )

    expected_type = STAGE_APPROVAL_TYPES[snapshot.current_stage]
    relevant = tuple(
        approval
        for approval in snapshot.approvals
        if approval.stage is snapshot.current_stage
        and approval.stage_revision == snapshot.stage_revision
        and approval.approval_type is expected_type
        and approval.organization_id == snapshot.organization_id
        and bool(approval.approver_membership_id.strip())
    )

    blocking_approvals = tuple(
        f"approval_{approval.status.value.lower()}:{approval.approval_id}"
        for approval in relevant
        if approval.status
        in {
            ApprovalStatus.CHANGES_REQUESTED,
            ApprovalStatus.REJECTED,
        }
    )
    if blocking_approvals:
        return _decision(
            snapshot,
            kind=DecisionKind.BLOCK,
            reasons=blocking_approvals,
        )

    approved_memberships_by_role = {
        role: {
            approval.approver_membership_id.strip()
            for approval in relevant
            if approval.status is ApprovalStatus.APPROVED
            and approval.approver_role is role
        }
        for role in STAGE_APPROVER_ROLES[snapshot.current_stage]
    }
    missing_roles = tuple(
        f"approval_missing:{role.value}"
        for role in STAGE_APPROVER_ROLES[snapshot.current_stage]
        if not approved_memberships_by_role[role]
    )
    if missing_roles:
        return _decision(
            snapshot,
            kind=DecisionKind.WAIT,
            reasons=missing_roles,
        )

    ambiguous_roles = tuple(
        f"approval_actor_ambiguous:{role.value}"
        for role, membership_ids in approved_memberships_by_role.items()
        if len(membership_ids) != 1
    )
    if ambiguous_roles:
        return _decision(
            snapshot,
            kind=DecisionKind.BLOCK,
            reasons=ambiguous_roles,
        )

    selected_memberships = tuple(
        next(iter(approved_memberships_by_role[role]))
        for role in STAGE_APPROVER_ROLES[snapshot.current_stage]
    )
    if len(set(selected_memberships)) != len(selected_memberships):
        return _decision(
            snapshot,
            kind=DecisionKind.BLOCK,
            reasons=("approval_actor_conflict",),
        )

    if snapshot.stage_status is not StageStatus.APPROVED:
        return _decision(
            snapshot,
            kind=DecisionKind.WAIT,
            reasons=("stage_not_approved",),
        )

    if snapshot.current_stage is EngagementStage.OPERATE_OPTIMIZE:
        approved_actions = {
            approval.approved_action
            for approval in relevant
            if approval.status is ApprovalStatus.APPROVED
        }
        if None in approved_actions or not approved_actions:
            return _decision(
                snapshot,
                kind=DecisionKind.WAIT,
                reasons=("operations_action_required",),
            )
        if len(approved_actions) != 1:
            return _decision(
                snapshot,
                kind=DecisionKind.BLOCK,
                reasons=("operations_action_conflict",),
            )
        operations_action = approved_actions.pop()
        if operations_action is OperationsAction.CONTINUE:
            return _decision(
                snapshot,
                kind=DecisionKind.CONTINUE,
                next_stage=EngagementStage.OPERATE_OPTIMIZE,
                next_revision=snapshot.stage_revision + 1,
                next_lifecycle_status=LifecycleStatus.ACTIVE,
            )
        if operations_action is OperationsAction.PAUSE:
            return _decision(
                snapshot,
                kind=DecisionKind.PAUSE,
                next_lifecycle_status=LifecycleStatus.PAUSED,
            )
        return _decision(
            snapshot,
            kind=DecisionKind.COMPLETE,
            next_lifecycle_status=LifecycleStatus.COMPLETED,
        )

    current_index = STAGE_ORDER.index(snapshot.current_stage)
    next_stage = STAGE_ORDER[current_index + 1]
    return _decision(
        snapshot,
        kind=DecisionKind.ADVANCE,
        next_stage=next_stage,
        next_revision=1,
    )


def evaluate_cancellation(
    snapshot: EngagementSnapshot,
    request: CancellationRequest,
) -> OrchestrationDecision:
    if snapshot.lifecycle_status in {
        LifecycleStatus.COMPLETED,
        LifecycleStatus.CANCELLED,
    }:
        return _decision(snapshot, kind=DecisionKind.NO_ACTION)
    if not all(
        (
            request.reason.strip(),
            request.client_decision_id.strip(),
            request.howzero_decision_id.strip(),
        )
    ):
        return _decision(
            snapshot,
            kind=DecisionKind.BLOCK,
            reasons=("cancellation_evidence_missing",),
        )
    if (
        request.client_decision_id.strip()
        == request.howzero_decision_id.strip()
    ):
        return _decision(
            snapshot,
            kind=DecisionKind.BLOCK,
            reasons=("cancellation_actor_conflict",),
        )
    return _decision(
        snapshot,
        kind=DecisionKind.CANCEL,
        reasons=("cancellation_approved",),
        next_lifecycle_status=LifecycleStatus.CANCELLED,
    )
~~~

- [ ] **Step 4: 전환 테스트 통과 확인**

Run:

~~~bash
uv run --extra dev pytest tests/howzero_ax/test_transitions.py -q
~~~

Expected: `30 passed`.

- [ ] **Step 5: 기존 계약 테스트까지 회귀 확인**

Run:

~~~bash
uv run --extra dev pytest tests/howzero_ax/test_contract.py tests/howzero_ax/test_transitions.py -q
~~~

Expected: `36 passed`.

- [ ] **Step 6: 전환 단위 커밋**

~~~bash
git add src/howzero_ax/transitions.py tests/howzero_ax/test_transitions.py
git commit -m "기능: AX 단계 전환 게이트 추가"
~~~

---

### Task 3: 익명 fixture runner

**Files:**

- Create: `src/howzero_ax/fixture_runner.py`
- Create: `tests/howzero_ax/test_fixture_runner.py`

- [ ] **Step 1: 실패하는 runner 테스트 작성**

`tests/howzero_ax/test_fixture_runner.py`를 다음 내용으로 만든다.

~~~python
import json
from pathlib import Path

import pytest

from howzero_ax.fixture_runner import main, run_fixture


FIXTURE_DIR = Path(__file__).parent / "fixtures"


def load(name: str):
    return json.loads((FIXTURE_DIR / name).read_text(encoding="utf-8"))


def test_happy_path_replays_all_nine_stages():
    result = run_fixture(load("pilot-a-happy-path.json"))

    assert result.passed is True
    assert len(result.steps) == 9
    assert [step.decision.kind.value for step in result.steps[:-1]] == [
        "ADVANCE"
    ] * 8
    assert result.steps[-1].decision.kind.value == "COMPLETE"
    assert result.steps[-1].decision.next_lifecycle_status.value == "COMPLETED"


def test_secure_access_failure_is_an_expected_block():
    result = run_fixture(load("pilot-a-secure-access-blocked.json"))

    assert result.passed is True
    assert result.steps[0].decision.kind.value == "BLOCK"
    assert (
        "check_failed:plaintext_secret_absent"
        in result.steps[0].decision.reasons
    )


@pytest.mark.parametrize(
    "field",
    ["password", "apiKey", "db_password", "contact_name"],
)
def test_runner_rejects_forbidden_sensitive_field_names(field):
    fixture = load("pilot-a-happy-path.json")
    fixture[field] = "redacted"

    result = run_fixture(fixture)

    assert result.passed is False
    assert result.errors[0].startswith("fixture_forbidden_field:")


def test_runner_rejects_unknown_fixture_fields():
    fixture = load("pilot-a-happy-path.json")
    fixture["notes"] = "허용 목록 밖의 데이터"

    result = run_fixture(fixture)

    assert result.passed is False
    assert result.errors[0].startswith("contract_error:")
    assert "허용되지 않은 필드" in result.errors[0]


@pytest.mark.parametrize(
    ("value", "reason"),
    [
        ("198.51.100.42", ":ip"),
        ("AbC123" * 5, ":high_entropy_token"),
    ],
)
def test_runner_rejects_sensitive_values(value, reason):
    fixture = load("pilot-a-happy-path.json")
    fixture["scenario_id"] = value

    result = run_fixture(fixture)

    assert result.passed is False
    assert reason in result.errors[0]


def test_runner_requires_synthetic_fixture_id_prefixes():
    fixture = load("pilot-a-happy-path.json")
    fixture["steps"][0]["engagement_id"] = "external_account_identifier"

    result = run_fixture(fixture)

    assert result.passed is False
    assert "eng_fixture_" in result.errors[0]


def test_runner_keeps_engagement_identity_across_steps():
    fixture = load("pilot-a-happy-path.json")
    fixture["steps"][1]["engagement_id"] = "eng_fixture_other"

    result = run_fixture(fixture)

    assert result.passed is False
    assert any("engagement_sequence" in error for error in result.errors)


def test_runner_keeps_organization_identity_across_steps():
    fixture = load("pilot-a-happy-path.json")
    fixture["steps"][1]["organization_id"] = "org_fixture_other"
    for approval in fixture["steps"][1]["approvals"]:
        approval["organization_id"] = "org_fixture_other"

    result = run_fixture(fixture)

    assert result.passed is False
    assert any("organization_sequence" in error for error in result.errors)


def test_cli_prints_json_and_returns_success(capsys):
    exit_code = main([str(FIXTURE_DIR / "pilot-a-happy-path.json")])
    output = json.loads(capsys.readouterr().out)

    assert exit_code == 0
    assert output["passed"] is True
    assert output["scenario_id"] == "pilot-a-happy-path"
~~~

- [ ] **Step 2: runner 모듈 부재로 실패하는지 확인**

Run:

~~~bash
uv run --extra dev pytest tests/howzero_ax/test_fixture_runner.py -q
~~~

Expected: `ModuleNotFoundError: No module named 'howzero_ax.fixture_runner'`.

- [ ] **Step 3: 읽기 전용 runner 구현**

`src/howzero_ax/fixture_runner.py`를 다음 내용으로 만든다.

~~~python
from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Mapping, Sequence

from .contract import (
    CONTRACT_VERSION,
    ApprovalRecord,
    CheckResult,
    ContractError,
    EngagementSnapshot,
    EngagementStage,
    LifecycleStatus,
    STAGE_ORDER,
    StageDependencyChange,
    StageStatus,
    enum_value,
    reject_unknown_fields,
    require_mapping,
    require_positive_int,
    require_text,
)
from .transitions import (
    DecisionKind,
    OrchestrationDecision,
    evaluate_engagement,
)


SENSITIVE_KEY_FRAGMENTS = {
    "password",
    "passwd",
    "apikey",
    "accesstoken",
    "refreshtoken",
    "privatekey",
    "clientsecret",
    "serviceaccount",
    "credential",
    "email",
    "phone",
    "mobile",
    "contactname",
    "fullname",
    "address",
}
EMAIL_PATTERN = re.compile(
    r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b",
    re.IGNORECASE,
)
PHONE_PATTERN = re.compile(r"(?<!\d)01[016789][ -]?\d{3,4}[ -]?\d{4}(?!\d)")
IPV4_PATTERN = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")
JWT_PATTERN = re.compile(
    r"\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b"
)
PRIVATE_KEY_PATTERN = re.compile(
    r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"
)
CREDENTIAL_URL_PATTERN = re.compile(
    r"https?://[^\s/:@]+:[^\s@]+@",
    re.IGNORECASE,
)
HIGH_ENTROPY_TOKEN_PATTERN = re.compile(
    r"\b(?=[A-Za-z0-9_-]{24,}\b)"
    r"(?=[A-Za-z0-9_-]*[A-Z])"
    r"(?=[A-Za-z0-9_-]*[a-z])"
    r"(?=[A-Za-z0-9_-]*\d)"
    r"[A-Za-z0-9_-]+\b"
)


@dataclass(frozen=True)
class FixtureStepResult:
    index: int
    stage: EngagementStage
    decision: OrchestrationDecision
    matched_expectation: bool

    def to_dict(self) -> dict[str, object]:
        return {
            "index": self.index,
            "stage": self.stage.value,
            "decision": self.decision.to_dict(),
            "matched_expectation": self.matched_expectation,
        }


@dataclass(frozen=True)
class FixtureRunResult:
    scenario_id: str
    passed: bool
    steps: tuple[FixtureStepResult, ...]
    errors: tuple[str, ...]

    def to_dict(self) -> dict[str, object]:
        return {
            "scenario_id": self.scenario_id,
            "passed": self.passed,
            "steps": [step.to_dict() for step in self.steps],
            "errors": list(self.errors),
        }


def _sensitive_error(value: object, *, field: str = "fixture") -> str | None:
    if isinstance(value, Mapping):
        for key, child in value.items():
            normalized = re.sub(r"[^a-z0-9]", "", str(key).lower())
            if any(
                fragment in normalized
                for fragment in SENSITIVE_KEY_FRAGMENTS
            ):
                return f"fixture_forbidden_field:{normalized}"
            error = _sensitive_error(child, field=f"{field}.{key}")
            if error:
                return error
        return None
    if isinstance(value, list):
        for index, child in enumerate(value):
            error = _sensitive_error(child, field=f"{field}[{index}]")
            if error:
                return error
        return None
    if isinstance(value, str):
        if EMAIL_PATTERN.search(value):
            return f"fixture_pii_detected:{field}:email"
        if PHONE_PATTERN.search(value):
            return f"fixture_pii_detected:{field}:phone"
        if IPV4_PATTERN.search(value):
            return f"fixture_pii_detected:{field}:ip"
        if JWT_PATTERN.search(value):
            return f"fixture_secret_detected:{field}:jwt"
        if PRIVATE_KEY_PATTERN.search(value):
            return f"fixture_secret_detected:{field}:private_key"
        if CREDENTIAL_URL_PATTERN.search(value):
            return f"fixture_secret_detected:{field}:credential_url"
        if HIGH_ENTROPY_TOKEN_PATTERN.search(value):
            return f"fixture_secret_detected:{field}:high_entropy_token"
    return None


def _require_fixture_id(value: str, prefix: str, field: str) -> None:
    if not value.startswith(prefix):
        raise ContractError(f"{field}: 합성 fixture prefix {prefix}가 필요함")


def _parse_step(data: Mapping[str, object]) -> EngagementSnapshot:
    reject_unknown_fields(
        data,
        {
            "engagement_id",
            "organization_id",
            "lifecycle_status",
            "stage",
            "revision",
            "stage_status",
            "checks",
            "approvals",
            "invalidated_dependencies",
            "expected",
        },
        "step",
    )
    stage = enum_value(EngagementStage, data.get("stage"), "stage")
    revision = require_positive_int(data.get("revision"), "revision")
    checks_value = data.get("checks")
    approvals_value = data.get("approvals")
    dependencies_value = data.get("invalidated_dependencies", [])
    if not isinstance(checks_value, list):
        raise ContractError("checks: 객체 배열이 필요함")
    if not isinstance(approvals_value, list):
        raise ContractError("approvals: 객체 배열이 필요함")
    if not isinstance(dependencies_value, list):
        raise ContractError("invalidated_dependencies: 객체 배열이 필요함")
    dependencies = tuple(
        StageDependencyChange.from_dict(
            require_mapping(item, "invalidated_dependencies[]")
        )
        for item in dependencies_value
    )
    if any(
        STAGE_ORDER.index(change.stage) >= STAGE_ORDER.index(stage)
        for change in dependencies
    ):
        raise ContractError(
            "invalidated_dependencies: 현재 단계보다 앞선 단계만 허용함"
        )
    snapshot = EngagementSnapshot(
        engagement_id=require_text(
            data.get("engagement_id"),
            "engagement_id",
        ),
        organization_id=require_text(
            data.get("organization_id"),
            "organization_id",
        ),
        lifecycle_status=enum_value(
            LifecycleStatus,
            data.get("lifecycle_status", "ACTIVE"),
            "lifecycle_status",
        ),
        current_stage=stage,
        stage_revision=revision,
        stage_status=enum_value(
            StageStatus,
            data.get("stage_status"),
            "stage_status",
        ),
        checks=tuple(
            CheckResult.from_dict(require_mapping(item, "checks[]"))
            for item in checks_value
        ),
        approvals=tuple(
            ApprovalRecord.from_fixture(
                require_mapping(item, "approvals[]"),
                stage=stage,
                stage_revision=revision,
            )
            for item in approvals_value
        ),
        invalidated_dependencies=dependencies,
    )
    _require_fixture_id(
        snapshot.engagement_id,
        "eng_fixture_",
        "engagement_id",
    )
    _require_fixture_id(
        snapshot.organization_id,
        "org_fixture_",
        "organization_id",
    )
    for check in snapshot.checks:
        if not check.checker_version.startswith("fixture-"):
            raise ContractError(
                "checker_version: fixture- prefix가 필요함"
            )
        for artifact_id in check.evidence_artifact_ids:
            _require_fixture_id(
                artifact_id,
                "art_fixture_",
                "evidence_artifact_ids[]",
            )
    for approval in snapshot.approvals:
        _require_fixture_id(
            approval.approval_id,
            "ap_fixture_",
            "approval_id",
        )
        _require_fixture_id(
            approval.approver_membership_id,
            "membership_fixture_",
            "approver_membership_id",
        )
        _require_fixture_id(
            approval.organization_id,
            "org_fixture_",
            "approval.organization_id",
        )
    for change in snapshot.invalidated_dependencies:
        _require_fixture_id(
            change.decision_id,
            "decision_fixture_",
            "dependency_change.decision_id",
        )
        for approval_id in change.resolution_approval_ids:
            _require_fixture_id(
                approval_id,
                "ap_fixture_",
                "dependency_change.resolution_approval_ids[]",
            )
    return snapshot


def _matches_expected(
    decision: OrchestrationDecision,
    expected: Mapping[str, object],
) -> tuple[bool, tuple[str, ...]]:
    reject_unknown_fields(
        expected,
        {
            "kind",
            "next_stage",
            "next_lifecycle_status",
            "reason_contains",
        },
        "expected",
    )
    errors: list[str] = []
    expected_kind = enum_value(DecisionKind, expected.get("kind"), "expected.kind")
    if decision.kind is not expected_kind:
        errors.append(
            f"decision_kind:{decision.kind.value}!={expected_kind.value}"
        )

    expected_stage = expected.get("next_stage")
    if expected_stage is not None:
        parsed_stage = enum_value(
            EngagementStage,
            expected_stage,
            "expected.next_stage",
        )
        if decision.next_stage is not parsed_stage:
            actual = decision.next_stage.value if decision.next_stage else "null"
            errors.append(f"next_stage:{actual}!={parsed_stage.value}")

    expected_lifecycle = expected.get("next_lifecycle_status")
    if expected_lifecycle is not None:
        parsed_lifecycle = enum_value(
            LifecycleStatus,
            expected_lifecycle,
            "expected.next_lifecycle_status",
        )
        if decision.next_lifecycle_status is not parsed_lifecycle:
            errors.append(
                "next_lifecycle_status:"
                f"{decision.next_lifecycle_status.value}!="
                f"{parsed_lifecycle.value}"
            )

    reason_contains = expected.get("reason_contains")
    if reason_contains is not None:
        expected_reason = require_text(
            reason_contains,
            "expected.reason_contains",
        )
        if expected_reason not in decision.reasons:
            errors.append(f"reason_missing:{expected_reason}")

    return not errors, tuple(errors)


def run_fixture(data: object) -> FixtureRunResult:
    sensitive_error = _sensitive_error(data)
    if sensitive_error:
        return FixtureRunResult(
            scenario_id="invalid-fixture",
            passed=False,
            steps=(),
            errors=(sensitive_error,),
        )

    try:
        root = require_mapping(data, "fixture")
        reject_unknown_fields(
            root,
            {"contract_version", "scenario_id", "steps"},
            "fixture",
        )
        scenario_id = require_text(root.get("scenario_id"), "scenario_id")
        version = require_text(root.get("contract_version"), "contract_version")
        if version != CONTRACT_VERSION:
            raise ContractError(f"지원하지 않는 contract_version: {version}")
        steps_value = root.get("steps")
        if not isinstance(steps_value, list) or not steps_value:
            raise ContractError("steps: 한 개 이상의 객체가 필요함")

        results: list[FixtureStepResult] = []
        errors: list[str] = []
        expected_stage: EngagementStage | None = None
        expected_revision: int | None = None
        expected_engagement_id: str | None = None
        expected_organization_id: str | None = None

        for index, raw_step in enumerate(steps_value, start=1):
            step = require_mapping(raw_step, f"steps[{index}]")
            snapshot = _parse_step(step)

            if expected_engagement_id is None:
                expected_engagement_id = snapshot.engagement_id
                expected_organization_id = snapshot.organization_id
            if snapshot.engagement_id != expected_engagement_id:
                errors.append(
                    f"step_{index}:engagement_sequence:"
                    f"{snapshot.engagement_id}!={expected_engagement_id}"
                )
            if snapshot.organization_id != expected_organization_id:
                errors.append(
                    f"step_{index}:organization_sequence:"
                    f"{snapshot.organization_id}!={expected_organization_id}"
                )

            if expected_stage is not None and snapshot.current_stage is not expected_stage:
                errors.append(
                    f"step_{index}:stage_sequence:"
                    f"{snapshot.current_stage.value}!={expected_stage.value}"
                )
            if (
                expected_revision is not None
                and snapshot.stage_revision != expected_revision
            ):
                errors.append(
                    f"step_{index}:revision_sequence:"
                    f"{snapshot.stage_revision}!={expected_revision}"
                )

            decision = evaluate_engagement(snapshot)
            expected = require_mapping(step.get("expected"), "expected")
            matched, step_errors = _matches_expected(decision, expected)
            errors.extend(f"step_{index}:{error}" for error in step_errors)
            results.append(
                FixtureStepResult(
                    index=index,
                    stage=snapshot.current_stage,
                    decision=decision,
                    matched_expectation=matched,
                )
            )

            if decision.kind is DecisionKind.ADVANCE:
                expected_stage = decision.next_stage
                expected_revision = decision.next_revision
            elif decision.kind is DecisionKind.CONTINUE:
                expected_stage = snapshot.current_stage
                expected_revision = decision.next_revision
            else:
                expected_stage = snapshot.current_stage
                expected_revision = snapshot.stage_revision

        return FixtureRunResult(
            scenario_id=scenario_id,
            passed=not errors,
            steps=tuple(results),
            errors=tuple(errors),
        )
    except ContractError as exc:
        return FixtureRunResult(
            scenario_id="invalid-fixture",
            passed=False,
            steps=(),
            errors=(f"contract_error:{exc}",),
        )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="HowZero AX Engagement fixture를 읽기 전용으로 재생합니다."
    )
    parser.add_argument("fixture", type=Path)
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    data = json.loads(args.fixture.read_text(encoding="utf-8"))
    result = run_fixture(data)
    print(json.dumps(result.to_dict(), ensure_ascii=False, indent=2))
    return 0 if result.passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
~~~

- [ ] **Step 4: fixture 파일이 아직 없어 실패하는지 확인**

Run:

~~~bash
uv run --extra dev pytest tests/howzero_ax/test_fixture_runner.py -q
~~~

Expected: `FileNotFoundError`로 실패한다.

- [ ] **Step 5: runner 단위 커밋 전 보류**

fixture와 함께 동작해야 하므로 아직 커밋하지 않는다.

---

### Task 4: 익명화된 파일럿 A 정상·차단 fixture

**Files:**

- Create: `tests/howzero_ax/fixtures/pilot-a-happy-path.json`
- Create: `tests/howzero_ax/fixtures/pilot-a-secure-access-blocked.json`

- [ ] **Step 1: 정상 여정 fixture 작성**

`tests/howzero_ax/fixtures/pilot-a-happy-path.json`을 다음 내용으로 만든다.

~~~json
{
  "contract_version": "howzero.ax.engagement.v1",
  "scenario_id": "pilot-a-happy-path",
  "steps": [
    {
      "engagement_id": "eng_fixture_pilot_a",
      "organization_id": "org_fixture_pilot_a",
      "stage": "INTAKE",
      "revision": 1,
      "stage_status": "APPROVED",
      "checks": [
        {
          "check_id": "intake_goal_scope_owners_complete",
          "required": true,
          "status": "PASS",
          "reason": "",
          "evidence_artifact_ids": ["art_fixture_intake"],
          "checker_version": "fixture-1"
        }
      ],
      "approvals": [
        {
          "approval_id": "ap_fixture_intake_client",
          "approval_type": "STAGE_GATE",
          "approver_role": "CLIENT_OWNER",
          "approver_membership_id": "membership_fixture_client_owner",
          "organization_id": "org_fixture_pilot_a",
          "status": "APPROVED"
        },
        {
          "approval_id": "ap_fixture_intake_howzero",
          "approval_type": "STAGE_GATE",
          "approver_role": "HOWZERO_OWNER",
          "approver_membership_id": "membership_fixture_howzero_owner",
          "organization_id": "org_fixture_pilot_a",
          "status": "APPROVED"
        }
      ],
      "expected": {
        "kind": "ADVANCE",
        "next_stage": "SECURE_ACCESS"
      }
    },
    {
      "engagement_id": "eng_fixture_pilot_a",
      "organization_id": "org_fixture_pilot_a",
      "stage": "SECURE_ACCESS",
      "revision": 1,
      "stage_status": "APPROVED",
      "checks": [
        {
          "check_id": "plaintext_secret_absent",
          "required": true,
          "status": "PASS",
          "reason": "",
          "evidence_artifact_ids": ["art_fixture_security_scan"],
          "checker_version": "fixture-1"
        },
        {
          "check_id": "minimum_access_verified",
          "required": true,
          "status": "PASS",
          "reason": "",
          "evidence_artifact_ids": ["art_fixture_access_scope"],
          "checker_version": "fixture-1"
        }
      ],
      "approvals": [
        {
          "approval_id": "ap_fixture_access_client",
          "approval_type": "STAGE_GATE",
          "approver_role": "CLIENT_SYSTEM_OWNER",
          "approver_membership_id": "membership_fixture_client_system_owner",
          "organization_id": "org_fixture_pilot_a",
          "status": "APPROVED"
        },
        {
          "approval_id": "ap_fixture_access_howzero",
          "approval_type": "STAGE_GATE",
          "approver_role": "HOWZERO_OWNER",
          "approver_membership_id": "membership_fixture_howzero_owner",
          "organization_id": "org_fixture_pilot_a",
          "status": "APPROVED"
        }
      ],
      "expected": {
        "kind": "ADVANCE",
        "next_stage": "CURRENT_STATE_AUDIT"
      }
    },
    {
      "engagement_id": "eng_fixture_pilot_a",
      "organization_id": "org_fixture_pilot_a",
      "stage": "CURRENT_STATE_AUDIT",
      "revision": 1,
      "stage_status": "APPROVED",
      "checks": [
        {
          "check_id": "source_owner_and_gaps_confirmed",
          "required": true,
          "status": "PASS",
          "reason": "",
          "evidence_artifact_ids": ["art_fixture_current_state"],
          "checker_version": "fixture-1"
        }
      ],
      "approvals": [
        {
          "approval_id": "ap_fixture_audit_client",
          "approval_type": "STAGE_GATE",
          "approver_role": "CLIENT_PROCESS_OWNER",
          "approver_membership_id": "membership_fixture_client_process_owner",
          "organization_id": "org_fixture_pilot_a",
          "status": "APPROVED"
        },
        {
          "approval_id": "ap_fixture_audit_howzero",
          "approval_type": "STAGE_GATE",
          "approver_role": "HOWZERO_OWNER",
          "approver_membership_id": "membership_fixture_howzero_owner",
          "organization_id": "org_fixture_pilot_a",
          "status": "APPROVED"
        }
      ],
      "expected": {
        "kind": "ADVANCE",
        "next_stage": "METRIC_CONTRACT"
      }
    },
    {
      "engagement_id": "eng_fixture_pilot_a",
      "organization_id": "org_fixture_pilot_a",
      "stage": "METRIC_CONTRACT",
      "revision": 1,
      "stage_status": "APPROVED",
      "checks": [
        {
          "check_id": "metric_formula_source_tolerance_complete",
          "required": true,
          "status": "PASS",
          "reason": "",
          "evidence_artifact_ids": ["art_fixture_metric_contract"],
          "checker_version": "fixture-1"
        }
      ],
      "approvals": [
        {
          "approval_id": "ap_fixture_metric_client",
          "approval_type": "METRIC_CONTRACT",
          "approver_role": "CLIENT_METRIC_OWNER",
          "approver_membership_id": "membership_fixture_client_metric_owner",
          "organization_id": "org_fixture_pilot_a",
          "status": "APPROVED"
        },
        {
          "approval_id": "ap_fixture_metric_howzero",
          "approval_type": "METRIC_CONTRACT",
          "approver_role": "HOWZERO_DATA_REVIEWER",
          "approver_membership_id": "membership_fixture_howzero_data_reviewer",
          "organization_id": "org_fixture_pilot_a",
          "status": "APPROVED"
        }
      ],
      "expected": {
        "kind": "ADVANCE",
        "next_stage": "SOLUTION_BLUEPRINT"
      }
    },
    {
      "engagement_id": "eng_fixture_pilot_a",
      "organization_id": "org_fixture_pilot_a",
      "stage": "SOLUTION_BLUEPRINT",
      "revision": 1,
      "stage_status": "APPROVED",
      "checks": [
        {
          "check_id": "poc_migration_rollback_uat_defined",
          "required": true,
          "status": "PASS",
          "reason": "",
          "evidence_artifact_ids": ["art_fixture_blueprint"],
          "checker_version": "fixture-1"
        }
      ],
      "approvals": [
        {
          "approval_id": "ap_fixture_blueprint_client",
          "approval_type": "BLUEPRINT",
          "approver_role": "CLIENT_OWNER",
          "approver_membership_id": "membership_fixture_client_owner",
          "organization_id": "org_fixture_pilot_a",
          "status": "APPROVED"
        },
        {
          "approval_id": "ap_fixture_blueprint_howzero",
          "approval_type": "BLUEPRINT",
          "approver_role": "HOWZERO_OWNER",
          "approver_membership_id": "membership_fixture_howzero_owner",
          "organization_id": "org_fixture_pilot_a",
          "status": "APPROVED"
        }
      ],
      "expected": {
        "kind": "ADVANCE",
        "next_stage": "BUILD"
      }
    },
    {
      "engagement_id": "eng_fixture_pilot_a",
      "organization_id": "org_fixture_pilot_a",
      "stage": "BUILD",
      "revision": 1,
      "stage_status": "APPROVED",
      "checks": [
        {
          "check_id": "required_build_issues_reviewed",
          "required": true,
          "status": "PASS",
          "reason": "",
          "evidence_artifact_ids": ["art_fixture_build_review"],
          "checker_version": "fixture-1"
        }
      ],
      "approvals": [
        {
          "approval_id": "ap_fixture_build_howzero",
          "approval_type": "STAGE_GATE",
          "approver_role": "HOWZERO_OWNER",
          "approver_membership_id": "membership_fixture_howzero_owner",
          "organization_id": "org_fixture_pilot_a",
          "status": "APPROVED"
        }
      ],
      "expected": {
        "kind": "ADVANCE",
        "next_stage": "RECONCILE_UAT"
      }
    },
    {
      "engagement_id": "eng_fixture_pilot_a",
      "organization_id": "org_fixture_pilot_a",
      "stage": "RECONCILE_UAT",
      "revision": 1,
      "stage_status": "APPROVED",
      "checks": [
        {
          "check_id": "reconciliation_within_tolerance",
          "required": true,
          "status": "PASS",
          "reason": "",
          "evidence_artifact_ids": ["art_fixture_reconciliation"],
          "checker_version": "fixture-1"
        }
      ],
      "approvals": [
        {
          "approval_id": "ap_fixture_uat_client",
          "approval_type": "UAT_ACCEPTANCE",
          "approver_role": "CLIENT_OWNER",
          "approver_membership_id": "membership_fixture_client_owner",
          "organization_id": "org_fixture_pilot_a",
          "status": "APPROVED"
        },
        {
          "approval_id": "ap_fixture_uat_howzero",
          "approval_type": "UAT_ACCEPTANCE",
          "approver_role": "HOWZERO_QA_REVIEWER",
          "approver_membership_id": "membership_fixture_howzero_qa_reviewer",
          "organization_id": "org_fixture_pilot_a",
          "status": "APPROVED"
        }
      ],
      "expected": {
        "kind": "ADVANCE",
        "next_stage": "CUTOVER_HANDOFF"
      }
    },
    {
      "engagement_id": "eng_fixture_pilot_a",
      "organization_id": "org_fixture_pilot_a",
      "stage": "CUTOVER_HANDOFF",
      "revision": 1,
      "stage_status": "APPROVED",
      "checks": [
        {
          "check_id": "rollback_recovery_and_training_verified",
          "required": true,
          "status": "PASS",
          "reason": "",
          "evidence_artifact_ids": ["art_fixture_handoff"],
          "checker_version": "fixture-1"
        }
      ],
      "approvals": [
        {
          "approval_id": "ap_fixture_handoff_client",
          "approval_type": "HANDOFF",
          "approver_role": "CLIENT_OPERATIONS_OWNER",
          "approver_membership_id": "membership_fixture_client_operations_owner",
          "organization_id": "org_fixture_pilot_a",
          "status": "APPROVED"
        },
        {
          "approval_id": "ap_fixture_handoff_howzero",
          "approval_type": "HANDOFF",
          "approver_role": "HOWZERO_OWNER",
          "approver_membership_id": "membership_fixture_howzero_owner",
          "organization_id": "org_fixture_pilot_a",
          "status": "APPROVED"
        }
      ],
      "expected": {
        "kind": "ADVANCE",
        "next_stage": "OPERATE_OPTIMIZE"
      }
    },
    {
      "engagement_id": "eng_fixture_pilot_a",
      "organization_id": "org_fixture_pilot_a",
      "stage": "OPERATE_OPTIMIZE",
      "revision": 1,
      "stage_status": "APPROVED",
      "checks": [
        {
          "check_id": "operations_review_evidence_complete",
          "required": true,
          "status": "PASS",
          "reason": "",
          "evidence_artifact_ids": ["art_fixture_operations_review"],
          "checker_version": "fixture-1"
        }
      ],
      "approvals": [
        {
          "approval_id": "ap_fixture_operations_client",
          "approval_type": "OPERATIONS_REVIEW",
          "approver_role": "CLIENT_OWNER",
          "approver_membership_id": "membership_fixture_client_owner",
          "organization_id": "org_fixture_pilot_a",
          "status": "APPROVED",
          "approved_action": "COMPLETE"
        },
        {
          "approval_id": "ap_fixture_operations_howzero",
          "approval_type": "OPERATIONS_REVIEW",
          "approver_role": "HOWZERO_OWNER",
          "approver_membership_id": "membership_fixture_howzero_owner",
          "organization_id": "org_fixture_pilot_a",
          "status": "APPROVED",
          "approved_action": "COMPLETE"
        }
      ],
      "expected": {
        "kind": "COMPLETE",
        "next_lifecycle_status": "COMPLETED"
      }
    }
  ]
}
~~~

- [ ] **Step 2: 보안 차단 fixture 작성**

`tests/howzero_ax/fixtures/pilot-a-secure-access-blocked.json`을 다음 내용으로 만든다.

~~~json
{
  "contract_version": "howzero.ax.engagement.v1",
  "scenario_id": "pilot-a-secure-access-blocked",
  "steps": [
    {
      "engagement_id": "eng_fixture_pilot_a_blocked",
      "organization_id": "org_fixture_pilot_a",
      "stage": "SECURE_ACCESS",
      "revision": 1,
      "stage_status": "IN_PROGRESS",
      "checks": [
        {
          "check_id": "plaintext_secret_absent",
          "required": true,
          "status": "FAIL",
          "reason": "원문 값 없이 평문 비밀 미저장 검사 실패 흐름만 재현함",
          "evidence_artifact_ids": ["art_fixture_security_scan_blocked"],
          "checker_version": "fixture-1"
        }
      ],
      "approvals": [],
      "expected": {
        "kind": "BLOCK",
        "reason_contains": "check_failed:plaintext_secret_absent"
      }
    }
  ]
}
~~~

- [ ] **Step 3: runner와 fixture 테스트 통과 확인**

Run:

~~~bash
uv run --extra dev pytest tests/howzero_ax/test_fixture_runner.py -q
~~~

Expected: `13 passed`.

- [ ] **Step 4: CLI 정상·차단 시나리오 직접 재생**

Run:

~~~bash
uv run python -m howzero_ax.fixture_runner tests/howzero_ax/fixtures/pilot-a-happy-path.json
uv run python -m howzero_ax.fixture_runner tests/howzero_ax/fixtures/pilot-a-secure-access-blocked.json
~~~

Expected: 두 명령 모두 exit code 0이며 출력 JSON의 `passed`가 `true`다. 두 번째 명령은 오류가 아니라 “예상된 차단 판단을 정확히 재현한 성공 시나리오”다.

- [ ] **Step 5: fixture에 민감 필드와 PII 패턴이 없는지 검사**

Run:

~~~bash
! rg -n -i '"[^"]*(password|passwd|api[_-]?key|access[_-]?token|refresh[_-]?token|private[_-]?key|client[_-]?secret|service[_-]?account|credential|email|phone|mobile|contact[_-]?name|address)[^"]*"' tests/howzero_ax/fixtures
! rg -n -i '[[:alnum:]._%+-]+@[[:alnum:].-]+\.[[:alpha:]]{2,}|01[016789][ -]?[0-9]{3,4}[ -]?[0-9]{4}' tests/howzero_ax/fixtures
~~~

Expected: 두 명령 모두 출력 없음.

- [ ] **Step 6: runner·fixture 단위 커밋**

~~~bash
git add src/howzero_ax/fixture_runner.py tests/howzero_ax/test_fixture_runner.py tests/howzero_ax/fixtures
git commit -m "기능: AX 익명 여정 fixture 재생기 추가"
~~~

---

### Task 5: fixture 모드 오케스트레이터 스킬

**Files:**

- Create: `.claude/skills/ax-engagement-orchestrator/SKILL.md`
- Create: `.claude/skills/ax-engagement-orchestrator/references/engagement-contract.md`
- Create: `tests/howzero_ax/test_skill_metadata.py`

- [ ] **Step 1: 실패하는 스킬 계약 테스트 작성**

`tests/howzero_ax/test_skill_metadata.py`를 다음 내용으로 만든다.

~~~python
from pathlib import Path

from howzero_ax.contract import CONTRACT_VERSION, STAGE_SKILLS


REPO_ROOT = Path(__file__).resolve().parents[2]
SKILL_ROOT = REPO_ROOT / ".claude" / "skills" / "ax-engagement-orchestrator"


def test_orchestrator_skill_declares_fixture_only_boundary():
    body = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8")

    assert "fixture mode" in body
    assert "운영 DB" in body
    assert "Paperclip" in body
    assert "고객 승인을 대신하지 않는다" in body


def test_orchestrator_names_every_stage_skill():
    body = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8")

    for skill_name in STAGE_SKILLS.values():
        assert skill_name in body


def test_reference_pins_contract_and_runner_command():
    body = (
        SKILL_ROOT / "references" / "engagement-contract.md"
    ).read_text(encoding="utf-8")

    assert CONTRACT_VERSION in body
    assert "uv run python -m howzero_ax.fixture_runner" in body
    assert "NOT_APPLICABLE" in body
    assert "OPERATE_OPTIMIZE" in body
    assert "approver_membership_id" in body
    assert "approved_action" in body
    assert "CANCEL" in body
~~~

- [ ] **Step 2: 스킬 파일 부재로 실패하는지 확인**

Run:

~~~bash
uv run --extra dev pytest tests/howzero_ax/test_skill_metadata.py -q
~~~

Expected: `FileNotFoundError`.

- [ ] **Step 3: 오케스트레이터 원본 스킬 작성**

`.claude/skills/ax-engagement-orchestrator/SKILL.md`를 다음 내용으로 만든다.

~~~markdown
---
name: ax-engagement-orchestrator
description: "HowZero AX 고객 여정, Engagement 단계 판단, 승인 게이트, fixture 재생, 다음 AX 스킬 결정 요청 시 사용. 현재 버전은 운영 DB/API/Paperclip을 변경하지 않는 fixture mode 계약 오케스트레이터다."
---

# AX Engagement Orchestrator

HowZero AX 고객 여정의 현재 단계와 승인·검사 게이트를 판정한다.

## First Read

계약 버전, 상태, 필수 승인자, 판단 결과가 필요하면
`references/engagement-contract.md`를 먼저 읽는다.

## Fixture Mode Boundary

현재 구현은 fixture mode 전용이다.

- JSON fixture를 읽고 전환 판단 JSON을 출력한다.
- 운영 DB, API, BullMQ, Paperclip, 알림, 고객 파일을 변경하지 않는다.
- fixture를 기준 원장으로 취급하지 않는다.
- 실제 비밀값, 개인정보, 원문 대화, 원문 녹취를 fixture에 넣지 않는다.
- 고객 승인을 대신하지 않는다.

운영 Engagement를 실행하라는 요청을 받으면 fixture 결과를 운영 상태처럼
기록하지 말고, 운영 연동 단계가 아직 구현되지 않았다고 명시한다.

## Stage Routing

1. `INTAKE` → `ax-evidence-ingest`
2. `SECURE_ACCESS` → `ax-secure-access`
3. `CURRENT_STATE_AUDIT` → `ax-current-state-audit`
4. `METRIC_CONTRACT` → `ax-metric-contract`
5. `SOLUTION_BLUEPRINT` → `ax-solution-blueprint`
6. `BUILD` → `ax-build-runner`
7. `RECONCILE_UAT` → `ax-qa-reconcile`
8. `CUTOVER_HANDOFF` → `ax-cutover-handoff`
9. `OPERATE_OPTIMIZE` → `ax-operations-review`

이 단계 스킬들은 후속 하위 프로젝트에서 구현한다. 지금은 routing 이름과
공통 계약만 검증한다.

## Workflow

1. 대상 fixture가 `tests/howzero_ax/fixtures/` 아래의 익명 합성 자료인지 확인한다.
2. 정상 여정은 다음 명령으로 읽기 전용 재생한다.

   `uv run python -m howzero_ax.fixture_runner tests/howzero_ax/fixtures/pilot-a-happy-path.json`

   보안 차단 여정은 다음 명령으로 읽기 전용 재생한다.

   `uv run python -m howzero_ax.fixture_runner tests/howzero_ax/fixtures/pilot-a-secure-access-blocked.json`

3. 출력의 `passed`, 각 단계 `decision.kind`, `reasons`,
   `required_skill`을 확인한다.
4. `ADVANCE`면 `next_stage`와 `required_skill`을 보고한다.
5. `WAIT`면 부족한 승인 또는 운영 결정을 보고하고 멈춘다.
6. `BLOCK`이면 실패 검사·변경 요청·거절 사유를 보고하고 멈춘다.
7. `CONTINUE`면 같은 `OPERATE_OPTIMIZE` 단계의 다음 revision을 보고한다.
8. `PAUSE`, `COMPLETE`, `CANCEL`, `NO_ACTION`이면 수명 상태를 보고하고 멈춘다.

## Gate Rules

- caller가 지정한 임의 검사로 통과시키지 않고 단계별 계약의 check ID를 강제한다.
- 필수 check ID가 없거나 `required: true`가 아니면 차단한다.
- 필수 여부와 관계없이 검사 `FAIL`은 차단한다.
- `NOT_APPLICABLE`은 사유와 증거가 있어야 한다.
- 현재 Organization, 현재 단계, 현재 revision의 인증된 Membership 승인만 인정한다.
- 승인 `CHANGES_REQUESTED`와 `REJECTED`는 차단한다.
- 운영 결정은 같은 `OPERATIONS_REVIEW` 승인에 기록된 `approved_action`만 인정한다.
- 필수 역할마다 정확히 한 Membership을 인정하고 서로 다른 역할은 같은 Membership을 공유할 수 없다.
- 이전 단계 revision이 무효화되면 현재 단계는 해소 전까지 차단한다.
- 취소는 고객과 HowZero 양측 Decision ID와 사유가 있어야 한다.
- 한 fixture 여정의 모든 단계는 같은 Engagement ID와 Organization ID를 유지한다.
- 승인과 검사를 모두 통과해도 단계 상태가 `APPROVED`가 아니면 기다린다.
- 첫 릴리스에는 게이트 우회가 없다.

## Completion

fixture 재생 성공은 계약 판정이 기대와 같다는 뜻일 뿐 운영 구축 완료를
뜻하지 않는다. 정상 전체 여정은 9단계를 재생하고 마지막
`OPERATE_OPTIMIZE`에서 승인된 운영 결정으로 끝나야 한다.
~~~

- [ ] **Step 4: 계약 참조 문서 작성**

`.claude/skills/ax-engagement-orchestrator/references/engagement-contract.md`를 다음 내용으로 만든다.

~~~~markdown
# AX Engagement Contract v1

계약 버전: `howzero.ax.engagement.v1`

## 상태 흐름

Opportunity:

`NEW → QUALIFIED → DISCOVERY → PROPOSAL → WON`

- 수주 전 모든 단계는 사유와 ISO 재접촉 일자를 남겨 `LOST`로 갈 수 있다.
- `LOST` 재개는 재개 사유를 남긴 뒤 `QUALIFIED`로만 간다.
- `WON`은 비어 있지 않은 계약 artifact ID가 있을 때만 허용하고 되돌리지 않는다.
- 계약 중단은 서로 다른 고객·HowZero Decision ID와 사유가 있는 Engagement `CANCELLED`다.

Engagement:

`INTAKE → SECURE_ACCESS → CURRENT_STATE_AUDIT → METRIC_CONTRACT → SOLUTION_BLUEPRINT → BUILD → RECONCILE_UAT → CUTOVER_HANDOFF → OPERATE_OPTIMIZE`

수명 상태는 `ACTIVE`, `PAUSED`, `COMPLETED`, `CANCELLED`다.
단계 상태는 `NOT_STARTED`, `IN_PROGRESS`, `BLOCKED`,
`AWAITING_APPROVAL`, `CHANGES_REQUESTED`, `APPROVED`다.

승인 뒤 이전 단계 전제가 바뀌면 해당 stage·revision·Decision ID를
`invalidated_dependencies`에 기록한다. 미해결 항목이 하나라도 있으면
현재 단계는 `BLOCK`이다. 이전 단계 재승인 뒤 `resolved: true`와
`resolution_approval_ids`가 함께 있어야 재개한다.

## 단계별 승인 계약

| 단계 | 승인 유형 | 필수 역할 |
|---|---|---|
| INTAKE | STAGE_GATE | CLIENT_OWNER, HOWZERO_OWNER |
| SECURE_ACCESS | STAGE_GATE | CLIENT_SYSTEM_OWNER, HOWZERO_OWNER |
| CURRENT_STATE_AUDIT | STAGE_GATE | CLIENT_PROCESS_OWNER, HOWZERO_OWNER |
| METRIC_CONTRACT | METRIC_CONTRACT | CLIENT_METRIC_OWNER, HOWZERO_DATA_REVIEWER |
| SOLUTION_BLUEPRINT | BLUEPRINT | CLIENT_OWNER, HOWZERO_OWNER |
| BUILD | STAGE_GATE | HOWZERO_OWNER |
| RECONCILE_UAT | UAT_ACCEPTANCE | CLIENT_OWNER, HOWZERO_QA_REVIEWER |
| CUTOVER_HANDOFF | HANDOFF | CLIENT_OPERATIONS_OWNER, HOWZERO_OWNER |
| OPERATE_OPTIMIZE | OPERATIONS_REVIEW | CLIENT_OWNER, HOWZERO_OWNER |

승인 상태는 `REQUESTED`, `APPROVED`, `CHANGES_REQUESTED`,
`REJECTED`, `CANCELLED`다. 현재 단계와 revision이 같은
`APPROVED`만 게이트를 충족한다.

각 승인에는 `approver_membership_id`와 `organization_id`가 있어야 한다.
snapshot Organization과 다른 승인은 인정하지 않는다. `OPERATIONS_REVIEW`
승인은 `approved_action`에 `CONTINUE`, `PAUSE`, `COMPLETE` 중 하나를 결합하며
필수 승인자들의 action이 다르면 차단한다. 필수 역할마다 승인 Membership은
정확히 하나여야 하고 서로 다른 역할이 같은 Membership ID를 공유할 수 없다.

## 검사 계약

검사 상태는 `PASS`, `FAIL`, `NOT_APPLICABLE`다.

- 모든 검사 결과는 `check_id`, `required`, `status`,
  `evidence_artifact_ids`, `checker_version`을 가진다.
- `FAIL`과 `NOT_APPLICABLE`은 `reason`이 필수다.
- 필수 여부와 관계없이 `FAIL`은 단계 전환을 차단한다.
- `NOT_APPLICABLE`은 사유가 있는 의도적 면제이며 성공값으로 위장하지 않는다.

| 단계 | 코어 필수 check ID |
|---|---|
| INTAKE | intake_goal_scope_owners_complete |
| SECURE_ACCESS | plaintext_secret_absent, minimum_access_verified |
| CURRENT_STATE_AUDIT | source_owner_and_gaps_confirmed |
| METRIC_CONTRACT | metric_formula_source_tolerance_complete |
| SOLUTION_BLUEPRINT | poc_migration_rollback_uat_defined |
| BUILD | required_build_issues_reviewed |
| RECONCILE_UAT | reconciliation_within_tolerance |
| CUTOVER_HANDOFF | rollback_recovery_and_training_verified |
| OPERATE_OPTIMIZE | operations_review_evidence_complete |

후속 단계 스킬은 이 코어 목록을 줄이지 않고 추가 검사만 선언할 수 있다.

## 공통 스킬 입력

~~~json
{
  "contract_version": "howzero.ax.engagement.v1",
  "execution_request_id": "exec_fixture_001",
  "engagement_id": "eng_fixture_pilot_a",
  "organization_id": "org_fixture_pilot_a",
  "stage": "METRIC_CONTRACT",
  "stage_revision": 1,
  "actor_id": "membership_fixture_reviewer",
  "actor_roles": ["HOWZERO_DATA_REVIEWER"],
  "artifact_ids": ["art_fixture_metric_source"],
  "pack_id": "education-commerce",
  "pack_version": "1.0.0"
}
~~~

actor와 artifact는 불투명 ID만 전달한다. 이름, 이메일, 전화번호, 비밀값을
공통 payload에 넣지 않는다.

## 공통 스킬 출력

~~~json
{
  "contract_version": "howzero.ax.engagement.v1",
  "execution_request_id": "exec_fixture_001",
  "skill_name": "ax-metric-contract",
  "status": "AWAITING_APPROVAL",
  "artifact_ids": ["art_fixture_metric_contract"],
  "checks": [
    {
      "check_id": "metric_formula_source_tolerance_complete",
      "required": true,
      "status": "PASS",
      "reason": "",
      "evidence_artifact_ids": ["art_fixture_metric_contract"],
      "checker_version": "fixture-1"
    }
  ],
  "approval_types_requested": ["METRIC_CONTRACT"],
  "blockers": []
}
~~~

스킬 상태는 `SUCCEEDED`, `BLOCKED`, `AWAITING_APPROVAL`,
`FAILED`다. 스킬은 승인을 생성해 달라고 요청할 수 있지만 승인 자체를
대신할 수 없다.

## 오케스트레이터 판단

- `ADVANCE`: 다음 단계와 그 단계의 스킬을 반환한다.
- `WAIT`: 승인, 단계 승인 상태, 운영 결정을 기다린다.
- `BLOCK`: 검사 실패, 변경 요청, 거절, 필수 검사 누락을 반환한다.
- `CONTINUE`: `OPERATE_OPTIMIZE` revision을 올린다.
- `PAUSE`: Engagement 수명을 `PAUSED`로 제안한다.
- `COMPLETE`: Engagement 수명을 `COMPLETED`로 제안한다.
- `CANCEL`: 양측 Decision 증거가 있는 Engagement를 `CANCELLED`로 제안한다.
- `NO_ACTION`: 이미 완료되었거나 취소된 Engagement다.

이 판단은 fixture mode의 순수 결과다. 운영 상태를 직접 변경하지 않는다.

## Fixture 익명화

fixture는 허용된 구조 필드만 받을 수 있다. key 이름은 대소문자와 구분자를
제거해 정규화한 뒤 비밀번호·token·credential·연락처·주소 계열을 거부한다.
이메일, 전화번호, JWT, 개인키 header, URL 내 자격증명, 장문 혼합 token 패턴도
거부한다. 자동 검사를 통과해도 실명·회사명·위치·원문 문장·실제 금액과 건수는
사람이 한 번 더 확인한다.
첫 단계에서 확정한 `engagement_id`와 `organization_id`는 마지막 단계까지
바뀔 수 없다.

## 재생 명령

~~~bash
uv run python -m howzero_ax.fixture_runner tests/howzero_ax/fixtures/pilot-a-happy-path.json
uv run python -m howzero_ax.fixture_runner tests/howzero_ax/fixtures/pilot-a-secure-access-blocked.json
~~~
~~~~

- [ ] **Step 5: 스킬 계약 테스트 통과 확인**

Run:

~~~bash
uv run --extra dev pytest tests/howzero_ax/test_skill_metadata.py -q
~~~

Expected: `3 passed`.

- [ ] **Step 6: 스킬 원본 단위 커밋**

~~~bash
git add .claude/skills/ax-engagement-orchestrator tests/howzero_ax/test_skill_metadata.py
git commit -m "기능: AX Engagement 오케스트레이터 스킬 추가"
~~~

---

### Task 6: AI 메타 동기화 복구와 원본·미러 검증

**Files:**

- Modify: `AGENTS.md`
- Create: `scripts/sync_ai_meta.py`
- Create: `tests/howzero_ax/test_sync_ai_meta.py`
- Generate: `.agents/skills/ax-engagement-orchestrator/**`
- Generate: `docs/ai/skills/ax-engagement-orchestrator/**`

- [ ] **Step 1: 실패하는 동기화 테스트 작성**

`tests/howzero_ax/test_sync_ai_meta.py`를 다음 내용으로 만든다.

~~~python
import subprocess
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
SCRIPT = REPO_ROOT / "scripts" / "sync_ai_meta.py"


def run_sync(root: Path, *args: str):
    assert SCRIPT.exists(), SCRIPT
    return subprocess.run(
        [sys.executable, str(SCRIPT), "--root", str(root), *args],
        check=False,
        capture_output=True,
        text=True,
    )


def test_no_arg_sync_refuses_to_touch_all_skills(tmp_path):
    source = tmp_path / ".claude" / "skills" / "demo" / "SKILL.md"
    source.parent.mkdir(parents=True)
    source.write_text("# demo\n", encoding="utf-8")

    result = run_sync(tmp_path)

    assert result.returncode == 2
    assert not (tmp_path / ".agents").exists()
    assert not (tmp_path / "docs" / "ai").exists()


def test_selected_skill_syncs_to_both_mirrors(tmp_path):
    source = tmp_path / ".claude" / "skills" / "demo" / "SKILL.md"
    source.parent.mkdir(parents=True)
    source.write_text("# demo\n", encoding="utf-8")

    result = run_sync(tmp_path, "--skill", "demo")

    assert result.returncode == 0
    assert (
        tmp_path / ".agents" / "skills" / "demo" / "SKILL.md"
    ).read_bytes() == source.read_bytes()
    assert (
        tmp_path / "docs" / "ai" / "skills" / "demo" / "SKILL.md"
    ).read_bytes() == source.read_bytes()


def test_check_reports_drift_without_mutating(tmp_path):
    source = tmp_path / ".claude" / "skills" / "demo" / "SKILL.md"
    mirror = tmp_path / ".agents" / "skills" / "demo" / "SKILL.md"
    source.parent.mkdir(parents=True)
    mirror.parent.mkdir(parents=True)
    source.write_text("# source\n", encoding="utf-8")
    mirror.write_text("# drift\n", encoding="utf-8")

    result = run_sync(tmp_path, "--skill", "demo", "--check")

    assert result.returncode == 1
    assert "불일치" in result.stdout
    assert mirror.read_text(encoding="utf-8") == "# drift\n"


def test_sync_never_deletes_destination_only_files(tmp_path):
    source = tmp_path / ".claude" / "skills" / "demo" / "SKILL.md"
    extra = tmp_path / ".agents" / "skills" / "demo" / "local-note.md"
    source.parent.mkdir(parents=True)
    extra.parent.mkdir(parents=True)
    source.write_text("# source\n", encoding="utf-8")
    extra.write_text("# preserve\n", encoding="utf-8")

    result = run_sync(tmp_path, "--skill", "demo")

    assert result.returncode == 1
    assert "추가 파일" in result.stdout
    assert extra.read_text(encoding="utf-8") == "# preserve\n"
~~~

- [ ] **Step 2: 동기화 스크립트 부재로 실패하는지 확인**

Run:

~~~bash
uv run --extra dev pytest tests/howzero_ax/test_sync_ai_meta.py -q
~~~

Expected: 네 테스트 모두 subprocess return code 불일치로 실패한다.

- [ ] **Step 3: 최소 동기화 스크립트 구현**

`scripts/sync_ai_meta.py`를 다음 내용으로 만든다.

~~~python
#!/usr/bin/env python3
from __future__ import annotations

import argparse
import shutil
from pathlib import Path
from typing import Sequence


IGNORED_PARTS = {
    ".DS_Store",
    ".git",
    "__pycache__",
    "node_modules",
}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=".claude/skills 원본을 Codex/Cursor 미러로 동기화합니다."
    )
    parser.add_argument(
        "--root",
        type=Path,
        default=Path(__file__).resolve().parents[1],
        help="저장소 루트",
    )
    parser.add_argument(
        "--skill",
        action="append",
        dest="skills",
        required=True,
        help="동기화할 스킬 이름. 반복 가능하며 한 개 이상 필수",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="파일을 쓰지 않고 원본과 미러 일치 여부만 검사",
    )
    return parser


def selected_skill_dirs(
    source_root: Path,
    names: Sequence[str],
) -> tuple[Path, ...]:
    invalid = tuple(name for name in names if Path(name).name != name)
    if invalid:
        raise ValueError(
            "스킬 이름은 단일 디렉터리명이어야 함: "
            + ", ".join(sorted(invalid))
        )
    directories = tuple(source_root / name for name in names)
    missing = tuple(path.name for path in directories if not path.is_dir())
    if missing:
        raise FileNotFoundError(
            "원본 스킬 없음: " + ", ".join(sorted(missing))
        )
    return directories


def source_files(skill_dir: Path) -> tuple[Path, ...]:
    return tuple(
        path
        for path in sorted(skill_dir.rglob("*"))
        if path.is_file() and not any(part in IGNORED_PARTS for part in path.parts)
    )


def destination_only_files(
    destination_skill_dir: Path,
    source_relatives: set[Path],
) -> tuple[Path, ...]:
    if not destination_skill_dir.exists():
        return ()
    return tuple(
        path
        for path in sorted(destination_skill_dir.rglob("*"))
        if path.is_file()
        and not any(part in IGNORED_PARTS for part in path.parts)
        and path.relative_to(destination_skill_dir) not in source_relatives
    )


def sync(
    root: Path,
    *,
    names: Sequence[str],
    check: bool,
) -> int:
    source_root = root / ".claude" / "skills"
    destinations = (
        root / ".agents" / "skills",
        root / "docs" / "ai" / "skills",
    )
    mismatches: list[str] = []
    extra_files: list[str] = []
    copied = 0

    for skill_dir in selected_skill_dirs(source_root, names):
        sources = source_files(skill_dir)
        source_relatives = {
            source.relative_to(skill_dir)
            for source in sources
        }
        for destination_root in destinations:
            destination_skill_dir = destination_root / skill_dir.name
            extra_files.extend(
                str(path.relative_to(root))
                for path in destination_only_files(
                    destination_skill_dir,
                    source_relatives,
                )
            )

        for source in sources:
            relative = source.relative_to(source_root)
            source_bytes = source.read_bytes()
            for destination_root in destinations:
                destination = destination_root / relative
                if destination.exists() and destination.read_bytes() == source_bytes:
                    continue
                if check:
                    mismatches.append(str(destination.relative_to(root)))
                    continue
                destination.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(source, destination)
                copied += 1

    if mismatches:
        for path in mismatches:
            print(f"불일치: {path}")
    if extra_files:
        for path in extra_files:
            print(f"추가 파일 보존: {path}")
    if mismatches or extra_files:
        return 1

    if check:
        print("원본과 미러가 일치합니다.")
    else:
        print(f"동기화 완료: {copied}개 파일")
    return 0


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        return sync(
            args.root.resolve(),
            names=args.skills,
            check=args.check,
        )
    except (FileNotFoundError, ValueError) as exc:
        print(str(exc))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
~~~

- [ ] **Step 4: 동기화 단위 테스트 통과 확인**

Run:

~~~bash
uv run --extra dev pytest tests/howzero_ax/test_sync_ai_meta.py -q
~~~

Expected: `4 passed`.

- [ ] **Step 5: 프로젝트 동기화 규칙을 명시적 스킬 방식으로 수정**

`AGENTS.md`의 기존 동기화 명령 한 줄을 다음 문장으로 교체한다.

~~~markdown
- **동기화 명령**: Claude 메타 수정 후 수정한 스킬 이름을 명시해 `python3 scripts/sync_ai_meta.py --skill ax-engagement-orchestrator`처럼 실행한다. `--skill` 없는 전체 덮어쓰기는 금지한다.
~~~

이 변경은 기존 `.agents/skills`의 Codex 전용 변형을 무인자 명령이 덮어쓰지
못하게 한다.

- [ ] **Step 6: 새 스킬만 두 미러에 생성**

기존 `.agents/skills/**` 미러에는 이 작업과 무관한 미커밋 파일이 있으므로
전체 동기화를 실행하지 않는다.

Run:

~~~bash
uv run python scripts/sync_ai_meta.py --skill ax-engagement-orchestrator
uv run python scripts/sync_ai_meta.py --skill ax-engagement-orchestrator --check
~~~

Expected: 첫 명령은 새 경로의 파일만 복사한다. 두 번째 명령은
`원본과 미러가 일치합니다.`를 출력하고 exit code 0이다.

- [ ] **Step 7: 실제 원본·미러 byte 일치 테스트 추가**

`tests/howzero_ax/test_skill_metadata.py` 끝에 다음 테스트를 추가한다.

~~~python


def test_orchestrator_mirrors_match_source_bytes():
    relative_files = (
        Path("SKILL.md"),
        Path("references/engagement-contract.md"),
    )
    mirror_roots = (
        REPO_ROOT / ".agents" / "skills" / "ax-engagement-orchestrator",
        REPO_ROOT / "docs" / "ai" / "skills" / "ax-engagement-orchestrator",
    )

    for relative in relative_files:
        source = (SKILL_ROOT / relative).read_bytes()
        for mirror_root in mirror_roots:
            assert (mirror_root / relative).read_bytes() == source
~~~

- [ ] **Step 8: 스킬·동기화 테스트 통과 확인**

Run:

~~~bash
uv run --extra dev pytest tests/howzero_ax/test_skill_metadata.py tests/howzero_ax/test_sync_ai_meta.py -q
~~~

Expected: `8 passed`.

- [ ] **Step 9: 동기화 단위 커밋**

관련 경로만 명시해 기존의 다른 `.agents/skills/**` 미커밋 파일을 스테이징하지 않는다.

~~~bash
git add AGENTS.md scripts/sync_ai_meta.py tests/howzero_ax/test_sync_ai_meta.py tests/howzero_ax/test_skill_metadata.py
git add .agents/skills/ax-engagement-orchestrator docs/ai/skills/ax-engagement-orchestrator
git commit -m "도구: AX 스킬 메타 미러 동기화 복구"
~~~

---

### Task 7: 전체 검증과 범위 감사

**Files:**

- Verify only; 새 기능 파일 없음

- [ ] **Step 1: Phase 1 전체 테스트**

Run:

~~~bash
uv run --extra dev pytest tests/howzero_ax -q
~~~

Expected: 모든 테스트 통과.

- [ ] **Step 2: 전체 Python 회귀 테스트**

Run:

~~~bash
uv run --extra dev pytest -q
~~~

Expected: 기존 테스트와 신규 테스트 모두 통과. 기존 환경 의존 테스트가 실패하면
신규 실패와 분리해 명령·오류·필요 환경을 그대로 기록하고, 원인을 숨기지 않는다.

- [ ] **Step 3: 두 fixture CLI 재검증**

Run:

~~~bash
uv run python -m howzero_ax.fixture_runner tests/howzero_ax/fixtures/pilot-a-happy-path.json
uv run python -m howzero_ax.fixture_runner tests/howzero_ax/fixtures/pilot-a-secure-access-blocked.json
~~~

Expected: 정상 fixture는 8개 `ADVANCE` 뒤 `COMPLETE`, 차단 fixture는
`check_failed:plaintext_secret_absent`를 포함한 `BLOCK`, 두 결과 모두
`passed: true`.

- [ ] **Step 4: 민감정보·placeholder 검사**

Run:

~~~bash
! rg -n -i '"[^"]*(password|passwd|api[_-]?key|access[_-]?token|refresh[_-]?token|private[_-]?key|client[_-]?secret|service[_-]?account|credential|email|phone|mobile|contact[_-]?name|address)[^"]*"' tests/howzero_ax/fixtures .claude/skills/ax-engagement-orchestrator docs/ai/skills/ax-engagement-orchestrator
! rg -n '\b(TODO|TBD|FIXME)\b|<placeholder>|<fill-me>' src/howzero_ax tests/howzero_ax .claude/skills/ax-engagement-orchestrator scripts/sync_ai_meta.py
~~~

Expected: 출력 없음.

- [ ] **Step 5: 운영 side effect가 없는지 정적 감사**

Run:

~~~bash
! rg -n 'psycopg|DATABASE_URL|BullMQ|redis|requests\.|httpx\.|subprocess|Paperclip|fetch\(' src/howzero_ax
~~~

Expected: 출력 없음. `Paperclip`은 스킬 문서의 금지 경계에만 있어야 하며 실행
패키지에는 없어야 한다.

- [ ] **Step 6: 변경 범위와 미러 상태 확인**

Run:

~~~bash
uv run python scripts/sync_ai_meta.py --skill ax-engagement-orchestrator --check
git status --short
git diff --check
~~~

Expected:

- 새 AX 계약·테스트·스킬·선택된 미러·동기화 스크립트만 이번 구현 커밋에 포함된다.
- 기존 `ax-web`, zipsaja, 다른 `.agents/skills/**` 변경은 그대로 보존되고 커밋되지 않는다.
- `git diff --check` 출력 없음.

- [ ] **Step 7: 계획 대비 구현 자체 리뷰**

다음을 코드와 테스트에서 직접 확인한다.

- 9개 Engagement 단계 순서가 설계와 동일하다.
- Opportunity `LOST`는 사유·재접촉 일자, 재개는 재개 사유, `WON`은 계약 artifact를 요구한다.
- `LOST` 재개는 `QUALIFIED`만 허용한다.
- caller가 임의 PASS 검사를 만들어 단계별 필수 check ID를 우회할 수 없다.
- 과거 revision 승인을 재사용하지 않는다.
- 다른 Organization 또는 Membership 참조가 없는 승인을 인정하지 않는다.
- 이전 단계 revision 무효화는 해소 전까지 현재 단계를 차단한다.
- 운영 action은 `OPERATIONS_REVIEW` 승인과 결합되고 양측이 같아야 한다.
- `CANCELLED`는 사유와 서로 다른 고객·HowZero Decision ID를 요구한다.
- 검사 실패와 승인 거절·변경 요청을 우회하지 않는다.
- `OPERATE_OPTIMIZE`만 revision 반복을 허용한다.
- fixture는 기준 원장이 아니며 파일을 수정하지 않는다.
- 정상·차단 fixture에 실명, 연락처, 계정 식별자, 실제 금액·건수, 원문 문장, 비밀값이 없다.
- fixture 단계 사이에 Engagement·Organization ID가 바뀌지 않는다.
- 운영 DB/API/Paperclip/BullMQ side effect가 없다.
- 나머지 단계 스킬은 이름만 routing하고 구현하지 않았다.
- `--skill` 없는 메타 동기화는 실행되지 않고 선택 경로의 추가 파일은 숨기지 않는다.

- [ ] **Step 8: 미커밋 보정이 있을 때만 최종 커밋**

~~~bash
git add src/howzero_ax tests/howzero_ax .claude/skills/ax-engagement-orchestrator scripts/sync_ai_meta.py
git add .agents/skills/ax-engagement-orchestrator docs/ai/skills/ax-engagement-orchestrator
git commit -m "테스트: AX Engagement 계약 검증 보강"
~~~

Expected: 보정 변경이 없으면 이 커밋은 만들지 않는다.

## 완료 증거

Phase 1 완료 보고에는 다음만 포함한다.

- 신규 계약 버전과 상태 전환 범위
- 정상·차단 fixture CLI 결과
- `tests/howzero_ax` 결과
- 전체 pytest 결과 또는 환경 의존 실패의 정확한 분리
- 선택된 스킬 원본·미러 일치 결과
- 운영 side effect가 없다는 범위 감사
- 다음 하위 프로젝트가 “진단 스킬 패키지”라는 사실

이 증거만으로 전체 HowZero AX Engagement OS가 완료되었다고 보고하지 않는다.
