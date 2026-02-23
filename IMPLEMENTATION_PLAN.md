# Project-Flow Visualizer - Implementation Plan

## Overview
The goal of the implementation plan is to outline tasks, estimated duration, complexity, dependencies and testing strategies necessary to deliver the Project-Flow Visualizer application according to the specifications provided in the requirements document.

---

## **Phase 1: Foundation & Setup**
**Goal:** Initialize the project repository, configure core tools, and build the initial UI skeleton.
**Estimated Duration:** 2-3 Hours

| Task | Description | Complexity | Dependencies | Status |
| :--- | :--- | :--- | :--- | :--- |
| **1.1 Project Init** | Create React + Vite project, configure "Cool Professional" theme. | Low | None | 🟢 |
| **1.2 Core Dependencies** | Install `reactflow`, `dagre`, `papaparse`, `xlsx`, `lucide-react`. | Low | 1.1 | 🟢 |
| **1.3 UI Skeleton** | Build `Sidebar` component, File Upload "Drop Zone", and placeholder. | Medium | 1.2 | 🟢 |

**Testing Strategy:** Unit test basic component rendering; verify Tailwind classes apply correctly.

---

## **Phase 2: Core Logic & Visualization**
**Goal:** Implement file parsing and the core visualization engine using React Flow and Dagre.
**Estimated Duration:** 4-6 Hours

| Task | Description | Complexity | Dependencies | Status |
| :--- | :--- | :--- | :--- | :--- |
| **2.1 File Processing Engine** | Implement Smart Parsing (CSV/XLSX) with fuzzy matching mapping to standardized Node/Edge objects. | High | 1.3 | 🟢 |
| **2.2 Layout Algorithm** | Configure `dagre` for Left-to-Right layout ensuring 0% whitespace overlap. | High | 2.1 | 🟢 |
| **2.3 Smart Nodes (Zoom-Aware)**| Create CustomNodes with Level-of-Detail (LOD) logic based on viewport zoom (Tiny/Medium/Large). | High | 2.2 | 🟢 |

**Testing Strategy:** Unit test data parser with malformed files. Test topological graph sorting.

---

## **Phase 3: Interactive Expandable Hierarchy & Navigation**
**Goal:** Create an interactive drill-down interface from Phases to Milestones to Tasks.
**Estimated Duration:** 5-7 Hours

| Task | Description | Complexity | Dependencies | Status |
| :--- | :--- | :--- | :--- | :--- |
| **3.1 Data Grouping** | Extract unique Phases/Milestones, assigning correct hierarchy levels. | Medium | 2.1 | 🟢 |
| **3.2 View State Manager** | Build Derived State Engine to handle node drill-down expansion (`Single Source of Truth`). | High | 3.1 | 🟢 |
| **3.3 Breadcrumb Navigation**| Build breadcrumb top-bar that updates on current node context. | Low | 3.2 | 🟢 |

**Testing Strategy:** Integration test drill-down stability; verify graph auto-layouts correctly upon expand/collapse.

---

## **Phase 4: Smart Dependency Visualization & Styling**
**Goal:** Implement complex line-routing and styling rules for connectors based on user interactions.
**Estimated Duration:** 4-6 Hours

| Task | Description | Complexity | Dependencies |
| :--- | :--- | :--- | :--- |
| **4.1 Dynamic Routing logic** | `smoothstep` (Intra), `straight` (Vertical), Horizontal handles (Adjacent). | High | 2.3 |
| **4.2 Visual Selection** | Clicking edges triggers Indigo Ring + Scale Up on nodes natively. | Medium | 4.1 |
| **4.3 Node Aesthetics** | High-contrast "Light-on-Dark" nodes (Phase=Indigo, Milestone=Orange, Task=Slate). | Low | 3.2 |

**Testing Strategy:** Visual regression testing; verify correct handle connection logic locally.

---

## **Phase 5: Analysis Tools (Critical Path)**
**Goal:** Provide algorithms to contextually find and highlight the project's critical path.
**Estimated Duration:** 3-4 Hours

| Task | Description | Complexity | Dependencies |
| :--- | :--- | :--- | :--- |
| **5.1 CPM Algorithm** | Calculate slack/longest path dynamically on the dataset. | High | 2.1 |
| **5.2 Highlight UI** | Highlight critical nodes/edges in Neon Teal, dim non-critical parts. | Medium | 5.1 |

**Testing Strategy:** Test CPM against known datasets; verify performance metrics on >100 nodes.

---

## **Phase 6: Timeline Visualization (Gantt Chart)**
**Goal:** Provide alternative time-scaled visualization of project data.
**Estimated Duration:** 6-8 Hours

| Task | Description | Complexity | Dependencies |
| :--- | :--- | :--- | :--- |
| **6.1 Interactive Gantt View** | Toggle modes, hierarchical display with Expand/Collapse synced to graph. | High | 3.2 |
| **6.2 Date Handling** | Parse dates securely, handle weekends (highlighting) and derive durations. | Medium | 2.1 |
| **6.3 Gantt Interactions**| Responsive 2D scroll, drag-to-reschedule support. | High | 6.1 |

**Testing Strategy:** Date-math testing (leap years, missing inputs). Cross-view state persistence testing.

---

## **Phase 7: Resource & Workload Management**
**Goal:** Monitor active team resources across all tasks.
**Estimated Duration:** 3-5 Hours

| Task | Description | Complexity | Dependencies |
| :--- | :--- | :--- | :--- |
| **7.1 Assignee Filtering** | Global dropdown interacting with Visibility Manager to focus views. | Medium | 3.2 |
| **7.2 Resource Heatmap** | Matrix view mapping task counts/days, alerting (>2 tasks). | Medium | 6.2 |

**Testing Strategy:** Verify filter updates graph/Gantt dynamically; boundary test heatmap counters.

---

## **Phase 8: Future Roadmap Foundation**
**Goal:** Architect application to easily accept Phases 10-14 updates.
**Estimated Duration:** 2-3 Hours

| Task | Description | Complexity | Dependencies |
| :--- | :--- | :--- | :--- |
| **8.1 Export Services** | Boilerplate export APIs (CSV/XLSX, initial integration hooks). | Low | 2.1 |
| **8.2 State Extensibility**| Structuring state stores for future What-If Scenario overlays. | Medium | 3.2 |

**Testing Strategy:** Unit test basic exporter format outputs.

---

## **Overall Testing & Quality Assurance Strategies**
1. **Unit Tests (Jest/Vitest)**: Core utilities, date math functions, CPM logic, CSV fuzzy merging.
2. **Component Tests (React Testing Library)**: View State isolation, visibility manager actions.
3. **Integration Tests**: Upload -> Render Graph -> Expand Phase -> Toggle Gantt cycle. Ensure single source of truth holds.
4. **Performance Tests**: Audit capabilities using sets up to 300+ nodes. Ensure CSS transitions do not produce repaints.
5. **UAT (User Acceptance Testing)**: Testing against irregular real-world Excel formats to ensure fuzzy parsing degrades gracefully.
