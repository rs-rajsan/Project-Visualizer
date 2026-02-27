# Implementation Plan: Hierarchical Multi-Agent System (MAS)

This plan outlines the migration from a single-agent AI Analyst to a sophisticated, hierarchical multi-agent framework to increase precision and observability.

## Phase 1: Core Infrastructure & Orchestration
**Goal**: Establish the communication layer and specialized utility for agent management.

1. **Create `src/utils/AgentOrchestrator.js`**:
   - Primary class for managing individual agent instances.
   - Implement `decomposedAudit()` to split requests into departmental tasks.
   - Implement `parallelDispatch()` to fire multiple Worker agents simultaneously.
2. **Define Agent Registry (`src/config/agentConfig.js`)**:
   - Store specialized **System Prompts** for each agent type (Logic Auditor, Schedule Auditor, etc.).
   - Define input/output schemas for inter-agent communication.
3. **Enhance Tracing Logic**:
   - Update `src/utils/logger.js` to support `agent_handover` traces.
   - Attach unique IDs to every agent-to-agent message.

## Phase 2: Building Specialized Worker Agents
**Goal**: Implement the granular reasoning units.

1. **Topology Workers**:
   - Logic Auditor: Implement loop/cycle detection prompt logic.
   - Critical Path Auditor: Enhance CPM calculation triggers.
2. **Resource Workers**:
   - Allocation Auditor: Connect heat-map data to AI reasoning.
   - Gaps Auditor: Prompt logic for analyzing idle resource periods.
3. **Data & Export Workers**:
   - Export Validator: Logic to audit final CSV/PPTX payloads against source project data.
   - Brand Formatter: Check for logo/HEX compliance in generated reports.

## Phase 3: Supervisor Layer & Synthesis
**Goal**: Implement the "Audit & Aggregate" tier.

1. **Departmental Supervisors**:
   - Create logic to merge multiple Worker outputs into a single Departmental Summary.
   - Implement conflict resolution (e.g., if Logic Auditor and Schedule Auditor disagree on a date).
2. **Chief AI Synthesis**:
   - Refactor the primary model prompt to act as the **Chief Orchestrator**.
   - Input: Summaries from Supervisors.
   - Output: Final formatted Executive Markdown Report.

## Phase 4: Observability & Governance
**Goal**: Integration of the "Black Box" monitoring agent.

1. **MAS Observability Agent**:
   - Create a dedicated monitor that watches the `AgentOrchestrator` lifecycle.
   - Record "Reasoning Traces" to `MAS_ACTIVITY.log`.
   - Alerting logic for model timeouts or formatting failures.

## Phase 5: UI/UX Enhancements
**Goal**: Visualize the agentic process to the user.

1. **Refactor `AIAssistantModal.jsx`**:
   - Replace single-call logic with the new Orchestrator flow.
   - Add a "Live Agent Board" showing which agents are currently active (e.g., "Topology Supervisor: Analyzing Graph...").
2. **Audit Log Export**:
   - Allow power users to download the `MAS_ACTIVITY.log` for transparency into the AI's "thought process."

---

## 🛠 Tech Stack Details
- **Orchestration**: Custom JavaScript logic (native performance over heavy frameworks).
- **Models**: Unified interface supporting Google Gemini 1.5 Pro (Synthesis/Supervisors) and GPT-4o-mini / Gemini Flash (Workers).
- **Storage**: Browser Local Storage for API keys and temporary trace logs.
