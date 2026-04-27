# Content Card AI Collaboration + Brain Pack Master Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:brainstorming` before changing behavior, `superpowers:writing-plans` before implementation, `superpowers:systematic-debugging` for bugs, `superpowers:verification-before-completion` before claiming completion, and `superpowers:requesting-code-review` before merging major work. This is a master planning document, not an execution checklist.

**Goal:** Make one content card become the collaboration room where humans and AIs can be added as equal actors, work together, use actor-specific Brain Packs, and later execute on SSH through a DB + `.md` instruction hierarchy.

**Architecture:** Store actors, assignments, brain packs, instructions, sources, and runs in DB as the source of truth. Generate `.md` runtime context files such as `AGENTS.md`, `CLAUDE.md`, `actor.md`, `card.md`, and `brain.md` into isolated SSH run folders when AI work starts. Keep content-card collaboration usable first, then add Obsidian/Markdown indexing, Paperclip-style agent hiring, and CLI execution later.

**Tech Stack:** React UI, Node/Express backend, Drizzle/Postgres, optional pgvector, file-based `.md` context layer, Paperclip-style actor registry, future SSH worker runtime, OpenAI/Claude/Codex adapters.

---

## 1. Product Shape

### Core product decision

The content card is not just a task card. It is the smallest collaboration room.

A content card should contain:

- The content idea and current stage.
- Human assignees.
- AI assignees.
- Actor-specific roles.
- Brain Packs used for the work.
- A conversation and activity timeline.
- Outputs such as topic, hook, thumbnail, script, caption, CTA, assets, and review notes.
- Linked tasks and approvals.
- Execution history.

### Mental model

```text
Content Card
= Mini project room
= Human + AI collaboration surface
= Instruction and Brain Pack execution target
```

### Target user experience

A marketer opens one content card and can do these actions without leaving the card:

- Add 봉하늘님 as viral reviewer.
- Add 용팀장님 as selling reviewer.
- Add a Translation AI as AI worker.
- Edit each actor's role on this card.
- Attach Brain Packs.
- Upload or link `.md` knowledge files.
- Ask the AI to create/refine content.
- See why the AI made each suggestion.
- Approve, reject, or revise outputs.

---

## 2. Required Features

### Feature 1: Add AI and human assignees inside a content card

The card detail page needs a `Collaborators` area.

Required actions:

- Add existing human member.
- Add existing AI actor.
- Invite or create a new AI actor from a Paperclip-style actor registry.
- Set card-specific role.
- Remove from card.
- Change permission level.

Required actor roles for MVP:

```text
Owner
Planner
Viral Reviewer
Selling Reviewer
Script Writer
Editor
Designer
Publisher
AI Worker
AI Reviewer
```

Required permission levels:

```text
view
comment
suggest
execute
approve
admin
```

### Feature 2: Collaborate with AI while making one content

The card needs an AI collaboration panel.

Required actions:

- Ask AI to analyze the current card.
- Ask AI to generate a topic/hook/script/thumbnail/CTA.
- Ask AI to revise based on comments.
- Ask AI to compare options.
- Ask AI to create tasks from the current output.
- Ask AI to summarize decisions.

Required output format:

```text
Suggested output
Reasoning summary
Used actors
Used Brain Packs
Used sources
Score table
Next recommended tasks
Approval request
```

### Feature 3: Actor-specific Brain Pack management

Every AI actor can have its own Brain Pack.

A Brain Pack contains:

```text
Instruction
Knowledge Sources
Rubrics
Examples
Memory
Permissions
Execution Settings
```

Required actions:

- Create Brain Pack.
- Edit Brain Pack.
- Version Brain Pack.
- Attach Brain Pack to actor.
- Attach Brain Pack to a content card.
- Upload `.md` files.
- Link existing `.md` folder or Obsidian folder.
- Add manual snippets.
- Add good/bad examples.
- Add scoring rubric.

### Feature 4: Paperclip-style actor registry

Howaa should reuse the Paperclip mental model: agents are workers that can be listed, assigned, configured, and later executed.

Required registry fields:

```text
Actor name
Actor type: human | ai
Role template
Default instruction
Default Brain Pack
Skills
Allowed tools
Autonomy level
Budget limit
Approval requirements
Status
```

Required actions:

- Browse available AI actors.
- Add actor to card.
- Clone actor for this company.
- Edit actor instruction.
- Edit skills.
- Attach Brain Pack.
- Disable actor.

### Feature 5: DB + `.md` hierarchy for future SSH execution

DB remains the source of truth. `.md` files are generated runtime context.

Required instruction hierarchy:

```text
Platform Instruction
Company Instruction
Brand Instruction
Project Instruction
Content Card Instruction
Actor Instruction
Brain Pack Instruction
Run Instruction
```

Generated SSH run folder:

```text
/srv/howaa/runs/run_123/
├── AGENTS.md
├── CLAUDE.md
├── task.md
├── context/
│   ├── platform.md
│   ├── company.md
│   ├── brand.md
│   ├── project.md
│   ├── card.md
│   ├── actor.md
│   ├── brain.md
│   ├── sources.md
│   └── permissions.md
└── output/
    ├── result.md
    ├── artifacts.json
    ├── citations.json
    └── activity.json
```

Important rule:

```text
The DB owns the truth.
The `.md` layer is a reproducible runtime snapshot.
```

---

## 3. Content Card Detail UX

### Recommended tab structure

```text
개요
협업자
AI 작업
산출물
업무
대화/활동
승인
Brain/고급
```

### 개요 tab

Shows:

- Title.
- Stage.
- Content type.
- Goal.
- Target customer.
- Current brief.
- Current owner.
- Latest decision summary.

### 협업자 tab

Shows:

- Human collaborators.
- AI collaborators.
- Role on this card.
- Permission level.
- Brain Pack attached.
- Status.

Primary actions:

```text
+ 담당자 추가
+ AI 추가
역할 수정
권한 수정
Brain Pack 연결
```

### AI 작업 tab

Shows:

- Prompt composer.
- Quick actions.
- Actor selector.
- Brain Pack selector.
- Generated result.
- Score table.
- Source/citation list.

Quick actions:

```text
바이럴 분석
셀링 검수
주제 10개 생성
훅/썸네일 생성
스크립트 생성
CTA 생성
리뷰 반영
업무로 쪼개기
```

### 산출물 tab

Shows:

- Topic.
- Hook.
- Thumbnail copy.
- Script.
- Caption.
- CTA.
- Asset checklist.
- Export history.

### 업무 tab

Shows:

- Linked tasks.
- Stage-generated tasks.
- Human tasks.
- AI tasks.
- Blockers.

### 대화/활동 tab

Shows:

- Human comments.
- AI messages.
- Decisions.
- Stage moves.
- Brain Pack version changes.
- Run history.

### 승인 tab

Shows:

- Viral approval.
- Selling approval.
- Script approval.
- Publish approval.
- Who approved what.

### Brain/고급 tab

Shows:

- Final resolved instruction preview.
- Used Brain Pack versions.
- Used source files.
- Runtime `.md` snapshot preview.
- Execution settings.
- Audit log.

---

## 4. Actor and Brain Pack Model

### Actor model

```text
Actor
- id
- companyId
- type: human | ai
- displayName
- roleTitle
- avatar
- defaultBrainPackId
- defaultInstructionVersionId
- skills
- tools
- autonomyLevel
- status
```

### Content collaborator model

```text
ContentCollaborator
- id
- companyId
- contentItemId
- actorId
- roleOnCard
- permissionLevel
- brainPackId
- addedByUserId
- status
```

### Brain Pack model

```text
BrainPack
- id
- companyId
- actorId
- name
- purpose
- instructionCurrentVersionId
- status
```

### Brain source model

```text
BrainSource
- id
- companyId
- brainPackId
- sourceType: markdown | obsidian_folder | upload | snippet | notebooklm | past_result
- title
- pathOrUrl
- contentHash
- indexStatus
- status
```

### Brain run model

```text
ContentBrainRun
- id
- companyId
- contentItemId
- requestedByUserId
- primaryActorId
- actorIds
- brainPackVersionIds
- runType
- status
- inputSnapshot
- resolvedInstructionSnapshot
- outputSnapshot
- scoreSnapshot
- citationSnapshot
```

---

## 5. 봉하늘님 + 용팀장님 Example Flow

### Step 1: Add actors to card

```text
Card: AI로 상품명 30개 뽑아도 안 팔리는 이유

Collaborators:
- 봉하늘님: Viral Reviewer
- 용팀장님: Selling Reviewer
- Translation AI: AI Worker
- 편집자: Editor
```

### Step 2: Attach Brain Packs

```text
봉하늘님 Brain Pack:
- Viral hooks
- Thumbnail patterns
- Comment emotion notes
- Short-form reference analysis

용팀장님 Brain Pack:
- Seller pain notes
- Product-name SEO knowledge
- Seller consultation examples
- CTA templates

Translation AI Brain Pack:
- Viral-to-selling translation examples
- Output format rules
- Scoring rubric
```

### Step 3: AI collaboration

```text
User clicks: 바이럴 구조를 셀링 콘텐츠로 번역

System does:
1. Resolve card instructions
2. Load 봉하늘 Brain Pack
3. Load 용팀장 Brain Pack
4. Ask Translation AI to map viral pattern to seller pain
5. Generate topic, hook, script, CTA
6. Return score table and citations
```

### Step 4: Approval

```text
봉하늘님 approves viral pattern.
용팀장님 approves selling truth.
Editor approves production readiness.
```

---

## 6. Superpowers Workflow Mapping

### Brainstorming

Use before designing new collaboration behavior, AI actions, Brain Pack surfaces, or content workflow changes.

### Writing Plans

Use before implementing each phase.

### Test-Driven Development

Use for backend services, validators, instruction resolver, and permission checks.

### Systematic Debugging

Use when card state, actor permissions, AI run output, or source retrieval behaves unexpectedly.

### Verification Before Completion

Use before saying a phase is complete.

### Requesting Code Review

Use before merging major collaboration, AI execution, or permission changes.

### Dispatching Parallel Agents

Use only when independent workstreams exist, such as UI components, DB schema, and backend service implementation.

---

## 7. Phased Plan

### Phase 1: Content card collaborators

Goal:

```text
Inside one content card, add/remove humans and AIs as collaborators.
```

Deliverables:

- Collaborators tab.
- Add human modal.
- Add AI modal.
- Role on card.
- Permission level.
- Activity event when collaborator changes.

Exit criteria:

- A user can open a content card and add a human or AI collaborator.
- The card shows who is responsible for what.
- Collaborator data is company-scoped.

### Phase 2: Actor registry and Paperclip-style AI assignment

Goal:

```text
Reuse the Paperclip-style worker registry so AI workers can be assigned and configured.
```

Deliverables:

- Actor registry page or modal.
- Existing AI actors list.
- Clone/add actor to company.
- Assign actor to card.
- Edit actor profile.

Exit criteria:

- A user can choose an AI worker from a registry and add it to a card.
- The selected AI keeps its role, skills, and default instruction.

### Phase 3: Brain Pack CRUD

Goal:

```text
Each AI actor can have editable Brain Packs.
```

Deliverables:

- Brain Pack tab in actor detail.
- Instruction editor.
- Rubric editor.
- Examples editor.
- Manual source snippets.
- `.md` upload support.
- Version history.

Exit criteria:

- A user can create and edit a Brain Pack for an AI actor.
- A Brain Pack can be attached to a card collaborator.
- Changes create versions, not silent overwrites.

### Phase 4: AI collaboration inside card

Goal:

```text
The user can collaborate with AI inside the content card while making one content.
```

Deliverables:

- AI 작업 tab.
- Quick action buttons.
- Prompt composer.
- Actor selector.
- Brain Pack selector.
- Generated output panel.
- Score and source panel.

Exit criteria:

- A user can ask an AI collaborator to generate/refine content.
- The result appears inside the card.
- The result records actor, Brain Pack, source, and instruction versions.

### Phase 5: DB + `.md` instruction hierarchy

Goal:

```text
Prepare the system for SSH execution by generating reproducible runtime `.md` files.
```

Deliverables:

- Instruction resolver.
- Runtime snapshot generator.
- Preview final instruction.
- Generated `AGENTS.md`, `CLAUDE.md`, `task.md`, and context files.
- Run archive.

Exit criteria:

- A card AI run can produce a folder-like `.md` snapshot.
- The snapshot contains the exact rules and context used.
- The same run can be replayed later.

### Phase 6: Markdown and Obsidian source indexing

Goal:

```text
Let `.md` sources become searchable Brain Pack knowledge.
```

Deliverables:

- Markdown source registration.
- Obsidian folder registration.
- File extraction.
- Chunking.
- Search.
- Later: pgvector embeddings.

Exit criteria:

- A Brain Pack can use `.md` notes as knowledge.
- AI output can cite the source note.

### Phase 7: SSH worker execution

Goal:

```text
Run AI tasks on SSH through isolated folders.
```

Deliverables:

- Queue.
- Worker.
- Run folder creator.
- API adapter.
- Later: Codex/Claude CLI adapters.
- Output capture.

Exit criteria:

- A card run can execute asynchronously.
- Output and artifacts return to the content card.

---

## 8. MVP Cut

Build first:

```text
Phase 1
Phase 2 basic
Phase 3 basic
Phase 4 basic
Phase 5 preview only
```

Do not build first:

```text
Full Obsidian sync
pgvector embeddings
NotebookLM automation
Codex CLI execution
Claude Code CLI execution
Autonomous AI hiring
```

Reason:

```text
The product value is not external automation first.
The product value is whether one content card can coordinate humans, AIs, roles, Brain Packs, and approvals clearly.
```

---

## 9. Implementation Plan Split

This master plan should be split into these execution plans:

```text
1. content-card-collaborators-foundation.md
2. actor-registry-ai-assignment.md
3. brain-pack-crud-and-versioning.md
4. card-ai-collaboration-runs.md
5. instruction-resolver-md-runtime.md
6. markdown-obsidian-brain-sources.md
7. ssh-worker-runtime.md
```

Each plan should be written with `superpowers:writing-plans` before implementation.

---

## 10. Key Risks

### Risk 1: Card UI becomes too complex

Mitigation:

```text
Use tabs. Show only active stage actions. Keep AI quick actions contextual.
```

### Risk 2: AI output becomes untraceable

Mitigation:

```text
Every run stores actor IDs, Brain Pack versions, source citations, and resolved instruction snapshot.
```

### Risk 3: Brain Pack becomes messy storage

Mitigation:

```text
Separate Instruction, Knowledge, Rubric, Examples, and Memory. Do not dump all notes into one prompt.
```

### Risk 4: Permission leaks across companies

Mitigation:

```text
Every actor, source, Brain Pack, and run is company-scoped. Retrieval must filter by companyId first.
```

### Risk 5: SSH execution comes too early

Mitigation:

```text
Build runtime `.md` preview before actual SSH execution. Only execute after snapshots are stable.
```
