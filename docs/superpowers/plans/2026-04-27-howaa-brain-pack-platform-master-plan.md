# Howaa Brain Pack Platform Master Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:writing-plans` again before implementing each phase. This document is the master plan, not the final task-by-task implementation checklist. Each phase must become its own execution plan with checkbox steps before code changes.

**Goal:** Build a SSH-hosted Howaa system where each human or AI actor can have company/project/card-specific instructions, knowledge sources, rubrics, examples, memory, and execution history.

**Architecture:** Use the database as the source of truth, generate runtime instruction files such as `AGENTS.md` and `CLAUDE.md` into isolated execution folders, and connect Obsidian/Markdown/NotebookLM-style sources through a searchable Brain Pack layer. The system treats people and AIs as equal `Actor`s, then resolves their rules and knowledge at execution time.

**Tech Stack:** Next.js or Vite React UI, Node/Express backend, Drizzle/Postgres, pgvector, Redis or BullMQ, SSH worker runtime, OpenAI/Claude/Codex-compatible model adapters, optional NotebookLM connector.

---

## 0. Product Definition

### Core idea

Howaa should not treat AI as a separate chatbot. It should treat AI like a worker who has instructions, skills, permissions, memory, and a brain.

### System model

- `Actor` means a human or AI worker.
- `Instruction` means how the actor should behave.
- `Brain Source` means what the actor knows.
- `Rubric` means how the actor judges quality.
- `Example` means what good or bad output looks like.
- `Memory` means what happened before and what worked.
- `Run` means one concrete AI or human-assisted execution.

### Example use case

봉하늘님 has a viral-pattern brain. 용팀장님 has a selling-truth brain. A translation AI combines both brains to turn viral references into selling content ideas, scripts, thumbnails, and CTAs.

---

## 1. Target Architecture

### Runtime layout on SSH

```text
/srv/howaa/
├── app/
│   ├── frontend/
│   ├── backend/
│   └── worker/
├── data/
│   ├── companies/
│   ├── vaults/
│   ├── uploads/
│   └── runs/
├── postgres/
├── redis/
└── logs/
```

### Execution folder layout

```text
/srv/howaa/data/runs/run_123/
├── AGENTS.md
├── CLAUDE.md
├── task.md
├── context/
│   ├── company.md
│   ├── project.md
│   ├── actor.md
│   ├── card.md
│   └── citations.json
└── output/
    ├── result.md
    ├── artifacts.json
    └── activity.json
```

### Instruction priority

```text
Platform Instruction
Company Instruction
Brand Instruction
Project Instruction
Actor Instruction
Card Instruction
Run Instruction
```

### Non-negotiable rule

Lower-level instructions can add specificity, but cannot override higher-level safety, privacy, company, or permission rules.

---

## 2. Data Model Plan

### Shared types

Target files:

- `packages/shared/src/types/actors.ts`
- `packages/shared/src/types/brain-packs.ts`
- `packages/shared/src/types/instructions.ts`
- `packages/shared/src/types/runs.ts`
- `packages/shared/src/validators/brain-packs.ts`
- `packages/shared/src/validators/instructions.ts`
- `packages/shared/src/validators/runs.ts`

### Database schema

Target files:

- `packages/db/src/schema/actors.ts`
- `packages/db/src/schema/actor_instruction_versions.ts`
- `packages/db/src/schema/brain_packs.ts`
- `packages/db/src/schema/brain_sources.ts`
- `packages/db/src/schema/brain_documents.ts`
- `packages/db/src/schema/brain_chunks.ts`
- `packages/db/src/schema/brain_embeddings.ts`
- `packages/db/src/schema/actor_rubrics.ts`
- `packages/db/src/schema/actor_examples.ts`
- `packages/db/src/schema/instruction_resolution_runs.ts`
- `packages/db/src/schema/agent_execution_runs.ts`
- `packages/db/src/schema/agent_execution_artifacts.ts`
- `packages/db/src/schema/agent_execution_citations.ts`

### Required entities

```text
Actor
BrainPack
BrainSource
BrainDocument
BrainChunk
ActorRubric
ActorExample
InstructionVersion
InstructionResolutionRun
AgentExecutionRun
AgentExecutionArtifact
AgentExecutionCitation
```

### Required ownership rules

- Every `Actor` belongs to a `companyId`.
- Every `BrainPack` belongs to a `companyId`.
- Every `BrainSource` belongs to a `companyId`.
- Every execution run must store the resolved instruction versions used.
- Every generated content result must store the brain versions used.

---

## 3. Backend Plan

### Services

Target files:

- `server/src/services/actors.ts`
- `server/src/services/brain-packs.ts`
- `server/src/services/brain-sources.ts`
- `server/src/services/instruction-resolver.ts`
- `server/src/services/brain-indexer.ts`
- `server/src/services/brain-search.ts`
- `server/src/services/agent-runner.ts`
- `server/src/services/content-generation.ts`

### Routes

Target files:

- `server/src/routes/actors.ts`
- `server/src/routes/brain-packs.ts`
- `server/src/routes/brain-sources.ts`
- `server/src/routes/instruction-resolution.ts`
- `server/src/routes/agent-runs.ts`
- `server/src/routes/content-brain-generation.ts`

### API groups

```text
GET    /companies/:companyId/actors
POST   /companies/:companyId/actors
GET    /companies/:companyId/actors/:actorId/brain-packs
POST   /companies/:companyId/actors/:actorId/brain-packs
GET    /companies/:companyId/brain-sources
POST   /companies/:companyId/brain-sources
POST   /companies/:companyId/brain-sources/:sourceId/index
POST   /companies/:companyId/instruction-resolution/preview
POST   /companies/:companyId/agent-runs
GET    /companies/:companyId/agent-runs/:runId
POST   /companies/:companyId/content/:contentId/generate-from-brain
```

### Instruction resolver responsibility

The resolver must combine platform, company, brand, project, actor, card, and run instructions into one deterministic bundle.

### Brain search responsibility

The brain search service must retrieve relevant chunks from Obsidian, Markdown, uploaded documents, past decisions, and approved examples.

### Agent runner responsibility

The agent runner must create an isolated run folder, write instruction files, execute the selected adapter, capture output, and persist artifacts.

---

## 4. Frontend Plan

### Actor UI

Target files:

- `ui/src/pages/ActorsPage.tsx`
- `ui/src/components/actors/ActorList.tsx`
- `ui/src/components/actors/ActorDetail.tsx`
- `ui/src/components/actors/ActorProfileForm.tsx`

### Brain Pack UI

Target files:

- `ui/src/components/brain/BrainPackTabs.tsx`
- `ui/src/components/brain/InstructionEditor.tsx`
- `ui/src/components/brain/KnowledgeSourcesPanel.tsx`
- `ui/src/components/brain/RubricEditor.tsx`
- `ui/src/components/brain/ExamplesPanel.tsx`
- `ui/src/components/brain/MemoryPanel.tsx`
- `ui/src/components/brain/BrainVersionHistory.tsx`

### Content card UI

Target files:

- `ui/src/components/content/BrainGenerationPanel.tsx`
- `ui/src/components/content/BrainRunTimeline.tsx`
- `ui/src/components/content/BrainCitationsPanel.tsx`
- `ui/src/components/content/BrainScoreCard.tsx`

### Required UI behaviors

- Actor detail shows profile, instructions, skills, brain sources, rubrics, examples, memory, permissions, and runs.
- Content detail shows which actors and brain versions were used.
- A marketer can press `Brain 기반 생성` on a card.
- The result shows viral score, selling score, conversion score, citations, and suggested next tasks.
- The user can approve, reject, or request revision.

---

## 5. Brain Pack Design

### 봉하늘 Viral Brain

```text
Purpose: Find and explain viral video patterns.
Instruction: Do not judge selling correctness.
Knowledge: Viral videos, hooks, thumbnails, comments, retention patterns.
Rubric: Stop power, emotional trigger, clarity, repeatability.
Output: Viral Pattern Card.
```

### 용팀장 Selling Brain

```text
Purpose: Validate whether the content reflects real seller pain.
Instruction: Reject shallow, false, or non-actionable marketing claims.
Knowledge: Seller pain points, category knowledge, sales objections, CTA offers.
Rubric: Real pain, revenue connection, operational relevance, CTA fit.
Output: Selling Truth Card.
```

### Translation AI Brain

```text
Purpose: Translate viral patterns into seller-facing content.
Instruction: Combine viral pattern and selling truth without inventing unsupported claims.
Knowledge: Viral Brain outputs, Selling Brain outputs, proven content examples.
Rubric: Viral score, selling score, conversion score.
Output: Topic, hook, thumbnail, script, CTA, score table.
```

---

## 6. Knowledge Source Plan

### Obsidian integration

Use Obsidian as a local-first knowledge vault. The server indexes Markdown files into chunks and embeddings.

### NotebookLM integration

Treat NotebookLM as an optional external research connector, not the source of truth.

### Supported source types

```text
Markdown folder
Uploaded PDF
Uploaded CSV
Uploaded text file
YouTube reference metadata
Manual note
Past content result
NotebookLM notebook reference
```

### Source ingestion flow

```text
Source registered
Document extracted
Document chunked
Embedding generated
Chunks linked to Brain Pack
Searchable context available to runs
```

---

## 7. AI Execution Plan

### Run flow

```text
User clicks generate
Server resolves instructions
Server searches relevant brain chunks
Server creates isolated run folder
Server writes AGENTS.md and task.md
Worker executes selected adapter
Worker writes result and artifacts
Server stores citations and activity
UI shows result with evidence
User approves or requests revision
```

### Adapter options

```text
OpenAI API adapter
Claude API adapter
Codex CLI adapter on SSH
Claude Code CLI adapter on SSH
NotebookLM connector
```

### First implementation adapter

Use API-based adapter first because it is easier to control, log, and permission. Add CLI adapters after the instruction folder model is stable.

---

## 8. Security and Permissions

### Required constraints

- Users can only access their own company data.
- Actors can only use Brain Packs allowed by company and role.
- AI cannot access another company's Obsidian vault.
- Run folders must be isolated per execution.
- Generated instruction files must not include unauthorized sources.
- Every generated answer must keep source references when brain knowledge is used.

### Permission model

```text
Company scope
Project scope
Actor scope
Brain source scope
Run scope
Approval scope
```

---

## 9. Phase Roadmap

### Phase 1: Brain Pack foundation

Goal: Store and manage Actor instructions, rubrics, examples, and brain metadata.

Deliverables:

- Database schema for Brain Packs.
- Shared types and validators.
- Actor Brain UI.
- Instruction version history.
- Manual knowledge source registration.

Exit criteria:

- A user can create 봉하늘 Brain and 용팀장 Brain.
- A user can edit instructions and save versions.
- A user can add rubrics and examples.
- Content cards can display selected Brain Pack versions.

### Phase 2: Obsidian and Markdown indexing

Goal: Turn local knowledge folders into searchable brain sources.

Deliverables:

- Markdown ingestion service.
- Chunking service.
- pgvector embedding storage.
- Brain search API.
- Source indexing UI.

Exit criteria:

- A user can connect an Obsidian folder.
- The server can index Markdown notes.
- A run can retrieve relevant source chunks.
- Search results show source file and heading.

### Phase 3: Instruction resolver and run folders

Goal: Generate `AGENTS.md`-style runtime files per execution.

Deliverables:

- Instruction resolver service.
- Instruction preview endpoint.
- Run folder generator.
- Runtime context manifest.
- Execution audit log.

Exit criteria:

- A user can preview final resolved instruction.
- The system can create an isolated run folder.
- The run folder includes company, project, actor, card, and retrieved context files.

### Phase 4: AI content generation from Brain Packs

Goal: Generate content ideas using 봉하늘 Brain, 용팀장 Brain, and Translation AI Brain.

Deliverables:

- Content generation API.
- Brain-based prompt builder.
- Viral Pattern Card output.
- Selling Truth Card output.
- Translated Content Brief output.
- Score table.
- Citation panel.

Exit criteria:

- A content card can generate a topic, hook, thumbnail, script, and CTA.
- The output includes viral score, selling score, and conversion score.
- The output shows which brain versions and sources were used.

### Phase 5: Human approval workflow

Goal: Keep humans as final owners of judgment.

Deliverables:

- Approval states.
- Revision requests.
- Actor assignment.
- Activity timeline.
- Review comments.

Exit criteria:

- 봉하늘님 can approve or reject viral analysis.
- 용팀장님 can approve or reject selling truth.
- AI can revise based on feedback.
- Final output requires explicit approval before production.

### Phase 6: Worker runtime on SSH

Goal: Run background jobs reliably on the SSH server.

Deliverables:

- Redis or BullMQ queue.
- Worker process.
- Agent adapter interface.
- OpenAI or Claude API adapter.
- Run status polling.
- Error capture.

Exit criteria:

- Long-running generation does not block the web request.
- Failed runs show actionable error messages.
- Completed runs persist artifacts and citations.

### Phase 7: CLI agent adapters

Goal: Let Codex or Claude Code operate inside generated run folders.

Deliverables:

- Codex CLI adapter.
- Claude Code CLI adapter.
- Runtime folder permission policy.
- Execution timeout policy.
- Output parser.

Exit criteria:

- The system can generate a folder with `AGENTS.md`.
- Codex or Claude Code can run against that folder.
- The result is captured back into Howaa.

### Phase 8: NotebookLM connector

Goal: Use NotebookLM as an optional research assistant.

Deliverables:

- Notebook registry.
- Source sync metadata.
- NotebookLM ask connector.
- Research result importer.
- Citation mapping.

Exit criteria:

- A user can attach a NotebookLM notebook reference.
- A run can query NotebookLM with explicit notebook ID.
- NotebookLM output is stored as external research, not as trusted source of truth.

### Phase 9: Performance memory

Goal: Learn from published content performance.

Deliverables:

- Performance result model.
- Content score history.
- Winning pattern memory.
- Failed pattern memory.
- Brain Pack feedback loop.

Exit criteria:

- A published content card can store views, saves, comments, CTR, leads, and conversion.
- The system can compare planned scores with actual results.
- Future generations can retrieve winning and failed examples.

---

## 10. Recommended Implementation Order

### First build

```text
Phase 1
Phase 3
Phase 4 without embeddings
Phase 5
```

### Then add knowledge search

```text
Phase 2
Phase 6
Phase 9
```

### Then add advanced external tools

```text
Phase 7
Phase 8
```

### Reason

Do not start with NotebookLM or Codex CLI automation. First prove that Brain Packs, instruction resolution, and human approval produce better content. External connectors should come after the core judgment system works.

---

## 11. MVP Scope

### Must have

- Actor Brain Pack CRUD.
- Instruction versioning.
- Rubric and examples.
- Manual source snippets.
- Instruction resolver preview.
- Brain-based content generation.
- Scores and citations.
- Human approval.

### Not in MVP

- Full Obsidian auto-sync.
- NotebookLM automation.
- Codex CLI execution.
- Autonomous AI hiring.
- Multi-agent parallel execution.
- Automatic social media publishing.

### MVP success criteria

- 봉하늘님의 바이럴 판단 기준을 매번 설명하지 않아도 AI가 같은 구조로 분석한다.
- 용팀장님의 셀링 판단 기준을 매번 설명하지 않아도 AI가 같은 구조로 검수한다.
- 콘텐츠 카드 하나에서 주제, 훅, 썸네일, 스크립트, CTA 초안이 생성된다.
- 생성 결과에 왜 그렇게 판단했는지 근거와 점수가 붙는다.
- 사람은 처음부터 다시 쓰는 것이 아니라 승인, 수정, 반려를 한다.

---

## 12. Phase 1 Detailed Plan Request

The next document should be:

```text
docs/superpowers/plans/2026-04-27-howaa-brain-pack-foundation.md
```

That plan should implement only:

```text
Brain Pack schema
Shared types
Validators
Backend CRUD
Actor Brain UI
Instruction version history
Rubric and examples UI
Content card brain-version display
```

The implementation should not include:

```text
Embeddings
NotebookLM
Codex CLI
Claude Code CLI
Worker queue
Autonomous hiring
```

---

## 13. Self-Review

Spec coverage:

- Actor as human or AI is covered.
- User-specific and company-specific instruction management is covered.
- AGENTS.md and CLAUDE.md runtime generation is covered.
- Obsidian and NotebookLM roles are separated.
- 봉하늘님 and 용팀장님 Brain Pack examples are covered.
- Content generation, scoring, citations, and approval are covered.

Scope check:

- This is too large for one implementation plan.
- The correct next step is a detailed Phase 1 plan.

Risk check:

- The largest risk is trying to automate external tools before the Brain Pack model is stable.
- The second largest risk is dumping uncurated Obsidian notes into prompts.
- The third largest risk is missing company-level permissions during retrieval.

Decision:

- Build Brain Pack foundation first.
- Add Obsidian search second.
- Add CLI and NotebookLM connectors later.
