# Project-Flow Visualizer: Official User Guide

## Overview

Welcome to **Project-Flow Visualizer**, a next-generation, enterprise-grade project visualization engine. Project-Flow transforms raw, tabular project data (CSV/Excel) and Microsoft Project exports (XML) into highly interactive, synchronized visual representations. 

Designed with a focus on **Level of Detail (LOD)**, **Resource Workload Management**, and **Interactive Editing**, this tool empowers Project Managers to intuitively navigate, edit, and optimize complex workflows in real-time.

---

## 🚀 Key Capabilities

1. **Intelligent Network Graph**: Visualizes topological dependencies with a zoom-aware Level of Detail (LOD) engine. 
2. **Interactive Gantt Chart**: A timeline-driven view supporting drag-and-drop schedule manipulation.
3. **Resource Heatmap matrix**: Real-time capacity planning and over-allocation detection.
4. **Universal State Sync**: Edits, filters, or expansions applied in one view instantly propagate across the entire application.
5. **Bidirectional Data Flow**: Import via CSV/XLSX/XML, visually edit the project, and export the exact state back to standard formats.

---

## 📅 Data Schema Requirements

Before importing, ensure your `.csv`, `.xls`, `.xlsx`, or `.xml` (MS Project export) files align with standard project schemas. The parsing engine uses **fuzzy-matching** for resilience on tabular data, and parses MS Project XML hierarchy natively.

### Required Fields
| Field Type      | Example Headers                 | Description |
|-----------------|---------------------------------|-------------|
| **Identifier**  | `ID`, `Task ID`, `Key`          | Unique string/number for the task. |
| **Name**        | `Name`, `Task Name`, `Summary`  | Short, descriptive title of the work item. |
| **Dependency**  | `Predecessors`, `Dependencies`  | Comma-separated list of IDs this task relies on (e.g., `1, 4, 12`). |

### Recommended Fields (For Advanced Features)
| Field Type      | Example Headers                 | Description |
|-----------------|---------------------------------|-------------|
| **Phase**       | `Phase`, `Epic`, `Stage`        | The macro-grouping for the task (Level 1 hierarchy). |
| **Milestone**   | `Milestone`, `Sprint`           | The micro-grouping for the task (Level 2 hierarchy). |
| **Dates**       | `Start Date`, `End Date`        | Timeline constraints. Preferred format: `YYYY-MM-DD`. |
| **Cost/Effort** | `Cost`, `Duration`, `Estimate`  | Numeric value driving task length (if End Date is missing) and link thickness. |
| **Assignee**    | `Assignee`, `Owner`, `Resource` | Individual responsible for the task. Drives Heatmap and filtering. |
| **Progress**    | `Progress`, `% Complete`        | Completion ratio. Accepts values like `%10`, `10%`, or `0.1`. |

---

## 🛠️ Feature Interactions

### 1. The Network Graph
The Network Graph is an infinite canvas featuring a Smart Edge Router that prevents visual clutter automatically.

* **Dynamic Expansion**: Click on any Phase or Milestone node to drill down and reveal its constituent tasks and logical chains.
* **Level of Detail (LOD) Zoom**:
  * *Macro View (< 0.6x)*: Task-level links fade out, replaced by thick, high-level **Summary Dependencies** connecting entire Milestones.
  * *Micro View (>= 0.6x)*: Individual task-level dependencies fade in. Nodes reveal full metadata (Progress, Dates, Assignees) upon extreme zoom.
* **Draw Dependencies**: Grab a teal handle on the Right/Bottom of any task node and drag it to another task to create a new dependency.
* **Remove Dependencies**: Click to select any dependency line (it will glow), then press the `Delete` or `Backspace` key.
* **Sticky Positioning**: Drag a node to a custom position on the canvas; the layout engine will respect and remember your override.

### 2. The Gantt Chart
A horizontal timeline strictly bound to your structural hierarchy (Phase > Milestone > Task).

* **Shift Timelines**: Grab any horizontal task block and slide it Left or Right to adjust its absolute Start/End dates.
* **Progress Visibility**: A solid cyan background bar denotes the raw percentage of completion for that task.

### 3. Resource Workload Heatmap
A high-density matrix visualizing team capacity over the project lifecycle.

* **Load Calculation**: The engine distributes a task's duration weight evenly across its active working days.
* **Color-Coded Capacity**: 
  * 🟢 **Emerald**: Low Allocation (< 50%)
  * 🔵 **Teal**: Balanced (50 - 100%)
  * 🟠 **Orange**: Heavily Loaded (101 - 150%)
  * 🔴 **Pulsing Rose**: Critically Over-Allocated (> 150%)
* **Context Tooltips**: Hover over any heatmap cell to see the exact allocation units and date string.

### 4. Global Filtering & Analysis
* **Critical Path (CPM) Toggle**: Click the "Critical Path" button in the global header to instantly calculate the longest logical path. Critical nodes and chains will glow in Neon Rose.
* **Assignee Isolation**: Use the Sidebar dropdown to filter by team member. This seamlessly filters the Graph, Gantt, and Heatmap components to reflect only the selected individual's responsibilities.
* **Data Export**: Click **CSV** or **Excel** in the Sidebar to download a snapshot of your project's *current* state, including any drag-and-drop edits you made.

### 5. Advanced Enterprise Tools
* **AI Health Analyst**: Click the **AI Report** button in the sidebar to generate a 3-paragraph executive summary detailing critical path risks and mitigations using Google Gemini.
* **Graphical Dashboard**: Navigate to the Dashboard view to see live Recharts visualizations for **Agile Sprint Burn-down** and an **Executive S-Curve** tracking actual costs versus baseline plans.
* **Real-time Multiplayer**: By default, Project-Flow utilizes a `Yjs` WebSockets engine. Coworkers opening the same session will have live, real-time cursors visible on the screen. 
* **Enterprise Branding**: Click **Brand Profile** to upload your own corporate logo and alter the primary/secondary UI colors. Any PDF exported natively assumes these styles.

---

## 💻 Architecture Notes (For Developers)

Project-Flow relies on strict **SOLID/DRY principles**:

1. **Derived State Engine**: `App.jsx` acts purely as an orchestrator. All filtering, layout, and topological sorting map dynamically purely off a single `rawData` array and `drillState`.
2. **Abstract PM Integrations**: See `src/utils/PMIntegration.js`. Future engineers can implement standard enterprise integrations (e.g., Jira Cloud, MS Project Server) by consuming the `ProjectManagementIntegration` Adapter pattern.
3. **Trace Telemetry**: `console.log()` is explicitly prohibited. All metadata actions flow through `logger.startTrace` to ensure secure, measurable, and easily debugged profiling cycles.

---
*Generated internally for Project-Flow Visualizer Operations.*

JIRA Integration:

Jira Sync Button: I located the "Sync with Jira" button in the left sidebar under the "Compare Baseline" button. It is styled with an indigo border and background as expected.
Modal Functionality:
Trigger: Clicking the "Sync with Jira" button successfully triggered the "Jira Enterprise Sync" modal.
Input Fields: I verified that the modal contains the required fields:
Jira Domain URL (with placeholder https://your-domain.atlassian.net)
Account Email (with placeholder user@company.com)
API Token (with placeholder Paste your Jira API Token)
Dismissal: I clicked the 'X' button in the top-right corner of the modal, and it dismissed correctly, returning the UI to its previous state.
