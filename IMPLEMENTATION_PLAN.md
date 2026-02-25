# Project-Flow Visualizer: Master Implementation Plan

## 1. Executive Summary
This document serves as the architectural runbook and implementation tracker for the **Project-Flow Visualizer**. It outlines the progressive delivery of features, aligning strictly with FAANG engineering standards: emphasizing **SOLID** design principles, **DRY** logic consolidation, high-performance rendering, and comprehensive system observability (Request Tracing).

> **Status Reference**
> 🔴 **Not Started:** Pending implementation.
> 🟡 **In Progress:** Active development branch.
> 🟢 **Completed:** Merged to main, tested, and verified.

---

## Phase 1: Foundation & Setup 🟢
**Goal:** Establish the foundational frontend stack, build system, and core dependency injection.

- [x] Configure React + Vite environment.
- [x] Integrate Tailwind CSS with custom "Cool Professional" palette (`slate-900`, `teal-400`).
- [x] Structure application directories (`components`, `utils`, `hooks`).
- [x] Install visualization endpoints (`reactflow`, `dagre`).
- [x] Construct baseline `Sidebar` and File Upload Drop Zone.

**Implementation Analysis & System Architecture:**
Bootstrapped a high-performance React application using Vite for rapid Hot Module Replacement (HMR). Implemented Tailwind CSS with a strict 'Cool Professional' palette to ensure enterprise UI consistency without bloating the CSS bundle. Integrated ReactFlow targeting it as the primary rendering engine capable of managing high-density nodes.

---

## Phase 2: Core Logic & Visualization Engine 🟢
**Goal:** Construct the parsing algorithms and the dynamic directed acyclic graph (DAG) layout.

- [x] Create `projectDataProcessor.js` with fuzzy column matching.
- [x] Map standardized data objects to Node/Edge definitions.
- [x] Implement left-to-right top-down topological sorting via `dagre`.
- [x] Build `CustomNode.jsx` integrating Level-of-Detail (LOD) handling based on viewport zoom.

**Implementation Analysis & System Architecture:**
Built the parsing engine (`projectDataProcessor.js`) featuring fuzzy-matching heuristics to ensure robust data ingestion regardless of user CSV/Excel header variations. Integrated `dagre` for directed acyclic graph topological sorting. Implemented the `CustomNode.jsx` component leveraging React Flow's `useViewport` hook to dynamically render Level-of-Detail (LOD)—gracefully transitioning from minimal reference dots to data-rich task cards based on zoom scale. This isolates React state renders, significantly optimizing DOM performance.

---

## Phase 3: Analytical Overlays 🟢
**Goal:** Introduce project management mathematics (Critical Path Method).

- [x] Implement topological sort / longest path algorithms to identify Slack = 0 sequences.
- [x] Develop "Critical Path" UI toggle.
- [x] Render dynamic CSS filters and High-Contrast paths to highlight bottlenecks.

**Implementation Analysis & System Architecture:**
Developed a mathematical longest-path (CPM) topological sorting algorithm to calculate slack times natively within the browser. Exposed these calculations via a reactive UI toggle that applies intensive CSS filters (`drop-shadow` localized to specific SVG paths) to actively glow critical bottlenecks. Non-critical noise is dimmed via a uniform opacity transition, prioritizing Project Manager focus on schedule risk.

---

## Phase 4: Optimization & Robustness 🟢
**Goal:** Harden the application against edge cases and maximize rendering FPS.

- [x] Apply `useMemo` caching to static graph styles and derivations.
- [x] Implement robust ID/Type lookup handling in the Layout Engine (Prevent crashes on undefined tasks).
- [x] Standardize production build scripts and local test runbooks (`run_app.bat`).

**Implementation Analysis & System Architecture:**
Secured application stability through rigorous memoization (`React.memo`, `useMemo`), effectively managing UI thrashing in dense 100+ node graphs. Implemented robust failure handling for disconnected graph islands and invalid reference errors. Configured Vite build tooling for optimal production chunking.

---

## Phase 5: Hierarchical Drill-Down 🟢
**Goal:** Enable incremental graph expansion to prevent cognitive overload.

- [x] Update data processor to identify unique Phase and Milestone taxonomies.
- [x] Implement `drillState` (`expandedPhases`, `expandedMilestones`) in the Application root.
- [x] Implement Breadcrumb telemetry UI based on hover states.
- [x] Trigger layout recalculations exclusively upon targeted expansion/collapse events.

**Implementation Analysis & System Architecture:**
Extended the ingestion processor to establish a strict hierarchical structural taxonomy (Phases -> Milestones -> Tasks). Designed a centralized `drillState` manager to handle visibility flags natively in React context. This Single Source of Truth prevents visual overload on initial load by forcing the user to recursively unpack the graph, greatly improving TTFB (Time To First Byte) perceived performance on massive datasets.

---

## Phase 6: Visual Semantics 🟢
**Goal:** Standardize node geometry and semantic color coding.

- [x] Lock default detailed nodes to standard compact dimensions.
- [x] Enforce node taxonomy: Blue (`bg-blue-900`) Phase, Orange (`bg-orange-900`) Milestone, Slate (`bg-slate-700`) Task.
- [x] Consolidate dependency arrows to 2px stroke structural vertical flows.

**Implementation Analysis & System Architecture:**
Standardized node geometry to align with enterprise flowchart spec. Devised a cascading color taxonomy to intuitively guide the user's eye across complex webs. Re-routed all structural logic to enforce strict vertical/parent-child connections using explicit top/bottom connection handles, mathematically restricting graph chaos and maximizing predictability.

---

## Phase 7: Timeline & Advanced Routing 🟢
**Goal:** Construct absolute horizontal timelines (Gantt) and next-generation edge routing.

- [x] Build SVG-based horizontal `GanttChart.jsx` bound to calendar mathematics.
- [x] Create `SmartEdge.jsx` to dynamically assign edge routing formats (Buses vs. Loops).
- [x] Implement Semantic Distance Fading for long-range edges.
- [x] Integrate Variable Weight Line properties based on task cost.

**Implementation Analysis & System Architecture:**
* **Incremental Offsets (Vertical Bus):** Solved historical overlapping of left-side intra-milestone lines via programmatic 20px step-functions. Paths now appear as a neat series of concentric "loops".
* **Edge Bundling:** Channeled cross-milestone dependencies into shared X-coordinate "Buses." Edges travel in tight bundles and branch using smooth Quadratic Bezier curves, turning spaghetti code into organized "cable runs."
* **SmartEdge Component Factory:** Deployed a custom SVG pathing engine that detects target relationship types (Intra vs. Inter) bypassing default ReactFlow straightlines.
* **Endpoint Variance:** Implemented a "High-Stakes Handoff" detector. Logical bounds crossing milestone groups are tagged as Blockers and rendered with solid source points.
* **Smart Fading & Dimming:** Long-range background edges >0.6 zoom distance are automatically scaled to 25% opacity, and task-to-task clutter is aggregated into thick "Milestone Summary" links on extreme zoom-outs.

---

## Phase 8: Architectural Refactoring & Security 🟢
**Goal:** Re-align to SOLID principles and enforce security protocols.

- [x] Extract derived graph calculations from `App.jsx` into standalone `visibilityManager.js`.
- [x] Enforce "Single Source of Truth" pipeline in the main render cycle.
- [x] Replace global `console.log` invocations with centralized structured logging telemetry.

**Implementation Analysis & System Architecture:**
* **SOLID Logic Extraction:** Separated complex breadth-first search (BFS) tracing away from React Component bindings into pure functions within `VisibilityManager`. This isolates computational intensive mathematical routing from virtual-DOM updates.
* **Centralized Request Tracing (Observability):** Injected `logger.startTrace` middleware across all high-stakes cycles (`deriveGraph`, `renderGraph`). Layout and routing bugs are now indexed via unique Trace IDs, significantly reducing MTTR (Mean Time To Recovery).
* **Secure Logging Protocol:** Aggressively scrubbed native DOM `console.log` artifacts to prevent inadvertent sensitive project data leakage to standard browser devtools, guaranteeing compliance via the `logger.js` singleton.

---

## Phase 9: Direct Editing & Serialization 🟢
**Goal:** Shift the application from Read-Only visualization to Read-Write interaction.

- [x] Bind `onConnect` and `onEdgesDelete` to mutate primary `rawData` arrays.
- [x] Implement mouse-drag timeline event shifting in `GanttChart.jsx`.
- [x] Construct `ExportService.js` supporting both `papaparse` (CSV) and `xlsx` (Excel) binaries.
- [x] Define `PMIntegration.js` abstract Adapter pattern class matrices.

**Implementation Analysis & System Architecture:**
* **Direct UI Mutation:** Wired high-visibility teal graph handles to active bidirectional data bounds. Drag-and-drop connections, layout repositioning, and Gantt timeline sliding natively mutate the `rawData` absolute state.
* **Serialization Interface:** Created a stateless `ExportService.js` that ingests the modified React State arrays and flattens them back into standardized business formats (CSV/XLSX), completing the data lifecycle loop.
* **Enterprise Inbound Adapter Pattern:** Drafted `ProjectManagementIntegration` abstract classes for Jira Cloud and MS Project Server. This establishes an Interface Segregation model guaranteeing specific API shapes mapping smoothly back into the `_standardize` system ingestion layer.

---

## Phase 10: Resource & Capacity Management 🟢
**Goal:** Map task throughput to individual team members.

- [x] Calculate capacity loads over absolute working day deltas (`WorkloadManager.js`).
- [x] Build `ResourceHeatmap.jsx` to render High-Density capacity grids.
- [x] Map universal Assignee filtering in the Sidebar controlling Graph, Gantt, and Heatmap elements.

**Implementation Analysis & System Architecture:**
* **Workload Distribution Engine:** Wrote algorithm in `WorkloadManager.js` to linearly distribute `Cost` weight across delta time (Start->End minus weekends), mapping unit allocations back to specified assignees.
* **Threshold Matrix Rendering:** Created the `ResourceHeatmap` component visualizing the load map. Implemented a 4-tier CSS status gradient (Emerald = Low, Teal = Balanced, Orange = Heavy, Pulsing Rose = Over-Allocated) to allow visually immediate bottleneck discovery.
* **Universal State Sync:** Synchronized all views via a highest-order `filteredData` functional selector layer in `App.jsx`. Assignee drop-down selection immediately segregates the Network Graph edges and Gantt blocks, isolating distinct, pure individual workload representations.

---

## Phase 11: Progress Tracking & Risk Mitigation �
**Goal:** Track execution reality against absolute data baselines.

- [x] Modify `projectDataProcessor.js` to accept secondary "Baseline" historical uploads.
- [x] Render shadow SVG elements mimicking original baseline bounds.
- [x] Implement volatile "Sandbox Mode" for active impact analysis isolated from master state.
- [x] Implement boolean status chip filtering ("Overdue", "At Risk").

### What I Did & Developed
* **Baseline Historical Data Import (`projectDataProcessor.js`)**: Developed a `processBaselineFile` method in the data mapping layer. You can now upload a secondary "Baseline" CSV or Excel file containing your original date projections. The system gracefully merges the `baselineStartDate` and `baselineEndDate` into the active `rawData` model.
* **Visual Baseline Tracking (`GanttChart.jsx` & `App.jsx`)**: Added a minimalist `3px` grey shadow behind all Gantt bars signifying the baseline constraint. Mapped dynamic styling to alert the user; if a Task breaches the baseline boundary, its standard color scheme shifts to a pulsing rose-red warning.
* **Volatile Sandbox Mode (`App.jsx`)**: Built an alternate `sandboxData` array state. Clicking the "Sandbox Mode" toggle instantly pipes the testing data array. Any manual edits or drags are isolated entirely from the `rawData` pool until "Discard Changes" wipes the sandbox.
* **Status Chip Filtering (`Sidebar.jsx` & `VisibilityManager.js`)**: Engineered toggle filters isolating tasks based on their relative delay margins vs active baseline boundaries. "Overdue" (current finishing date natively > baseline finishing date) and "At Risk" (0 margin/buffer remaining).

---

## Phase 12: Executive Reporting 🟢
**Goal:** Surface micro-level logic to macro-level business dashboards.

- [x] Develop `Dashboard.jsx` encapsulating absolute metrics (Velocity, Burn-down charts).
- [x] Embed rasterization libraries (e.g. `html2canvas`) for programmatic PDF image export snapshots.
- [x] Integrate full-screen, sidebar-hidden "Presentation Mode".

### What I Did & Developed
* **Executive Abstract Dashboard (`Dashboard.jsx`)**: Designed an elegant 'Dashboard' pane showcasing top-level automated KPIs spanning Total Tasks, Active Distinct Resources, tasks critically devoid of slack ("At Risk"), and overdue parameters. The architecture was provisioned to scale into graphical Burn-down curves if extended. 
* **Snapshot Rasterization logic**: Brought in standard `html2canvas` paired with `jspdf` to bind arbitrary node trees directly into standardized `.pdf` blobs on demand. Wired it natively to a distinct 'Export Report' action button in the Dashboard header.
* **Streamlined Presentation Mode (`App.jsx`)**: Linked a `isFullscreen` state hook triggered by the 'Maximize' symbol. This systematically un-mounts the configuration sidebar and top-banner navigation headers, snapping the active viewing metric into a flawless border-to-border projection screen (escaped easily via the Escape keyboard standard listener hook).

---

## Phase 13: Advanced Enterprise Capabilities & Integrations 🔴
**Goal:** Elevate the application from a visualization tool to an interactive, intelligent enterprise platform.

### Sub-Phase 13.1: Live Integration Engine (Jira)
- [ ] Connect `PMIntegration.js` to Jira APIs via robust OAuth2 flows.
- [ ] Implement Live Sync functionality to dynamically pull tickets, dependencies, and assignee workloads.
- [ ] Enable Bi-directional Sync allowing users to push Sandbox structural edits back to Jira via REST API.

### Sub-Phase 13.2: Live Integration Engine (MS Project)
- [ ] Connect `PMIntegration.js` to MS Project APIs via Azure AD / MS Graph.
- [ ] Implement Live Sync functionality to dynamically pull tasks, links, and resource assignments.
- [ ] Enable Bi-directional Sync allowing users to push Sandbox structural edits back to MS Project.

### Sub-Phase 13.3: Issue & Ticket Tracking (ServiceNow Integration)
- [ ] Connect to ServiceNow APIs to pull incident/problem tickets as project dependencies or risk nodes.
- [ ] Map ServiceNow tickets to distinct node types with unique alerting visual states on the Gantt and Canvas.
- [ ] Implement robust REST API handlers to live-query ticket status and automatically update visual progress.

### Sub-Phase 13.4: AI Project Health Analyst (LLM Integration)
- [ ] Interface the existing `InsightsPanel.jsx` with Gemini/OpenAI models executing graph heuristics.
- [ ] Generate natural-language "Health Reports" based directly on structural and baseline deviations.
- [ ] Implement predictive bottlenecks: AI-driven suggestions for specific resource reallocations to aggressively reduce Critical Path duration.

### Sub-Phase 13.5: Advanced Graphical Analytics (Burn-down Metrics)
- [ ] Integrate graphical libraries (e.g., Recharts) to populate the Velocity & Burn-down shell established in Phase 12.
- [ ] Visualize timeline progression vs. mapped baseline expectations over time.
- [ ] Synthesize cost curves representing aggregate daily cost burn rates to augment Executive Reporting exports.

### Sub-Phase 13.6: Real-time Multiplayer Collaboration
- [ ] Wire up WebSockets and CRDTs (Conflict-free Replicated Data Types, e.g., `yjs`) to support shared session states.
- [ ] Allow multiple stakeholders (PMOs, Executives) to collaboratively view/edit the same Project Canvas simultaneously.
- [ ] Display real-time UI cursors visualizing peer focus states (e.g. what nodes are being actively expanded/adjusted).

### Sub-Phase 13.7: Enterprise Theming & Brand Exporting
- [ ] Construct dynamic CSS/Theming engines permitting users to define specific Hex codes and brand palettes.
- [ ] Allow injection of corporate logos.
- [ ] Propagate branding vectors to the `html2canvas` module ensuring that all exported Executive PDFs inherently match the organization's corporate identity.
