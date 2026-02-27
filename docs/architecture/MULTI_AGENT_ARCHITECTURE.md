# Hierarchical Multi-Agent System (MAS) Architecture

This document outlines the transition of the Project-Flow Visualizer from a single-agent architecture to a highly granular, hierarchical **Supervisor-Worker Agent** framework.

## 1. Architectural Philosophy
To achieve maximum precision and eliminate hallucination, we move away from "monolithic prompts" to a **highly specialized hierarchy**.
- **The Worker Principle**: Every "ground-level" agent has one, and only one, measurable task.
- **The Supervisor Principle**: Supervisors do not perform analysis; they audit, aggregate, and route data between specialists.
- **The Orchestrator Principle**: The Chief AI coordinates the final delivery and maintains the user's strategic context.

---

## 2. The Agent Hierarchy

### Level 1: Chief AI Orchestrator
*   **Role**: Final Synthesis & User Interface.
*   **Key Responsibilities**:
    *   Interpreting user intent (e.g., "Why is my project late?").
    *   Decomposing high-level questions into department-specific tasks.
    *   Synthesizing sub-reports into a cohesive Executive Dashboard.

### Level 2: Departmental Supervisors
#### A. Visual Topology Supervisor
*   **Coordinates**: Graph Worker, Gantt Worker.
*   **Function**: Ensures the visual representation matches the logical data structure.

#### B. Resource & Performance Supervisor
*   **Coordinates**: Workload Worker, KPI Worker.
*   **Function**: Audits the "human" and "financial" health of the project.

#### C. Data Integrity Supervisor
*   **Coordinates**: Schema Worker, Integrity Worker.
*   **Function**: Validates input data and manages the "fuzzy" mapping consistency.

#### D. Reporting & Export Supervisor
*   **Coordinates**: Formatting Worker, Data Integrity (Export) Worker.
*   **Function**: Manages the high-fidelity generation of CSV, Excel, Markdown, and PPTX reports.

### Level 4: Observability & Governance
*   **Role**: System Monitor & Flight Recorder.
*   **Key Responsibilities**:
    - **Handoff Tracking**: Records the flow of data between Orchestrator, Supervisors, and Workers.
    - **Anomaly Detection**: Flags when an agent's response time exceeds thresholds or when output formatting is invalid.
    - **Communication Audit**: Documents the logic reasoning used for specific project insights for later debugging.

### Level 3: Ground-Level Worker Agents (Detailed Tasks)

Each worker is a specialized prompt/model instance with a single responsibility:

| Agent Name | Single Task Focus | Granular Output |
| :--- | :--- | :--- |
| **Logic Auditor** | Detect topological loops/cycles. | List of illegal dependency IDs + resolution path. |
| **Schedule Auditor** | Compare dependencies against dates. | Highlight "Date Paradoxes" (e.g., child starts before parent). |
| **Criticality Auditor** | Calculate the Critical Path (CPM). | List of "Zero-Buffer" tasks that threaten the deadline. |
| **Allocation Auditor** | Search for >100% resource spikes. | Breakdown of specific days/individuals over-capacity. |
| **Gaps Auditor** | Identify "Bench Time" (under-utilization). | Suggestions for task reassignment during idle periods. |
| **Financial Auditor** | Calculate Earned Value vs. Burn Rate. | Project "S-Curve" health score. |
| **Metadata Auditor** | Check for missing descriptions/assignees. | List of "Informational Gaps" needed for full analysis. |
| **Brand Formatter** | Check export files for brand alignment. | Verification of logo placement and HEX color consistency. |
| **Export Validator** | Verify data accuracy in exported files. | Comparison of app state vs. final export payload. |
| **Trace Logger** | Record inter-agent communication packets. | Granular payload logs for "Why did X happen?". |
| **Error Monitor** | Watch for model timeouts/hallucinations. | Real-time alerts and terminal error summaries. |

---

### Level 4: Cross-Cutting Observability Agent
*   **Role**: System Monitor & Flight Recorder.
*   **Key Responsibilities**:
    - **Handoff Tracking**: Records the flow of data between Orchestrator, Supervisors, and Workers.
    - **Anomaly Detection**: Flags when an agent's response time exceeds thresholds or when output formatting is invalid.
    - **Centralized Log Synthesis**: Collates errors from all layers into a single, searchable `MAS_ACTIVITY.log`.
    - **Communication Audit**: Documents the logic reasoning used for specific project insights for later debugging.

---

## 4. Communication & Orchestration Flow

1.  **Request Initiation**: User requests a "Full Health Audit" or "Dashboard Export."
2.  **Top-Down Routing**: Chief AI assigns tasks to Domain Supervisors (Visual, Resource, Integrity, or Reporting).
3.  **Worker Tasking**: Each Supervisor triggers their Ground-Level Workers in parallel.
4.  **Bottom-Up Aggregation**:
    *   **Worker** submits a 1-specific-detail report to the **Supervisor**.
    *   **Supervisor** audits the worker reports for contradictions and merges them into a "Departmental Summary."
    *   **Chief AI** merges the Departmental Summaries into the "Executive Report."
5.  **Audit Recording**: The **Observability Agent** captures the entire trace for system performance optimization.

---

## 5. Technical Implementation Strategy (Proposal)

*   **Prompt Isolation**: Each Worker agent uses a custom System Prompt that explicitly forbids it from discussing topics outside its niche.
*   **Internal Handoffs**: Using a JSON-based messaging format (e.g., `WorkerResponse` schema) to ensure seamless data flow between levels.
*   **State Management**: The **Chief AI** maintains a "Shared Memory Space" where all worker outputs are cached for cross-departmental correlation (e.g., matching a "Logic Error" with its "Resource Impact").

---

*This architecture ensures that no single AI model is tasked with "doing everything," thereby increasing the reliability and depth of every insight provided by the Project-Flow Visualizer.*
