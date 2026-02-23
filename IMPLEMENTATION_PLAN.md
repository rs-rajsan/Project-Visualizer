# Project-Flow Implementation Plan

## P1 phase

The goal of the implementation plan is to outline tasks, estimated duration, complexity, dependencies and testing strategies necessary to deliver the Project-Flow Visualizer application according to the specifications provided in the requirements document.

> **Status Reference**
> 🔴 Not Started
> 🟡 In Progress
> 🟢 Completed

---

## **Phase 1: Foundation & Setup** (Est. 2-3 Hours)

### 1.1 Project Initialization 🟢
- [x] Create React + Vite project (`npm create vite@latest`)
- [x] Set up Tailwind CSS (`npm install -D tailwindcss postcss autoprefixer`)
- [x] Configure Tailwind Theme (`tailwind.config.js`) with "Cool Professional" palette (`bg-slate-900`, `text-teal-400`).
- [x] Create project structure (`src/components`, `src/utils`, `src/hooks`).

### 1.2 Core Dependencies 🟢
- [x] Install `reactflow` (Visualization Engine)
- [x] Install `dagre` (Graph Layout)
- [x] Install `papaparse` (CSV Parser)
- [x] Install `xlsx` (Excel Parser)
- [x] Install `lucide-react` (Icons)

### 1.3 UI Skeleton 🟢
- [x] Build `Sidebar` component (Fixed layout, collapsible theoretically).
- [x] Implement File Upload "Drop Zone" UI.
- [x] Integrate `ReactFlow` canvas into main layout.

---

## **Phase 2: Core Logic & Visualization** (Est. 4-6 Hours)

### 2.1 File Processing Engine 🟢
- [x] Create `utils/projectDataProcessor.js`.
- [x] Implement Fuzzy Match logic for column headers (e.g., "Task Name" vs "Description").
- [x] Parse CSV/XLSX into standardized Node/Edge objects.
- [x] Handle basic errors (missing ID, circular dependencies - rudimentary check).

### 2.2 Layout Algorithm (Dagre) 🟢
- [x] Configure `dagre` for Left-to-Right topological sort.
- [x] Map parsed nodes to specific X/Y coordinates.
- [x] Auto-center graph on load (`fitView`).

### 2.3 Smart Nodes (Zoom-Aware) 🟢
- [x] Create `CustomNode.jsx`.
- [x] Implement Level-of-Detail (LOD) logic based on `viewport.zoom`.
    - **Tiny (<0.3)**: Dots/Milestones only.
    - **Medium (0.3-0.7)**: Compact Labels.
    - **Large (>0.7)**: Full Details (Dates, Progress Bar, Owner).
- [x] Optimize re-renders using `memo` and selective state updates.

---

## **Phase 3: Analysis Features** (Est. 4-5 Hours)

### 3.1 Critical Path Method (CPM) 🟢
- [x] Implement `calculateCriticalPath` algorithm (Topological Sort / Longest Path).
- [x] Identify critical nodes (Slack = 0).
- [x] Highlight critical edges in Neon Teal (`#2DD4BF`).
- [x] Dim non-critical paths for emphasis.

### 3.2 UI Controls 🟢
- [x] Toggle button for "Critical Path" mode.
- [x] File upload handler to trigger re-layout.
- [x] Smooth CSS transitions for node style changes.

---

## **Phase 4: Optimization & Polish** (Completed)

### 4.1 Performance Tuning 🟢
- [x] Use `useMemo` for static styles and graph data.
- [x] Debounce zoom events if necessary (Built-in via `onMove` discrete checkpoints).
- [x] Profile datasets - *Verified with 100+ nodes, smooth performance.*

### 4.2 Handling Edge Cases 🟢
- [x] Improve error messages for invalid files.
- [x] Implement Robust ID/Type lookup in Layout Engine (Fixes Task Disappearance).
- [x] Handle disconnected sub-graphs (Static layout handles islands gracefully).
- [x] Fix ReferenceErrors in CustomNode (Ensures app doesn't crash on task render).

### 4.3 Deployment Prep 🟢
- [x] Configure `package.json` build scripts.
- [x] Fix build errors (CSS processing, missing deps).
- [x] Create `run_app.bat` for easy local testing.

---

## **Phase 5: Interactive Expandable Hierarchy & Navigation** (Completed)
 
 ### 5.1 Data Grouping Enhancement 🟢
 - [x] Update `projectDataProcessor.js` to extract unique **Phases** from raw data.
 - [x] Group Tasks under Phases and Milestones.
 - [x] Calculate `path` attributes for breadcrumb navigation.
 
 ### 5.2 View State Management 🟢
 - [x] Implement `drillState` in `App.jsx` to track expanded Phases/Milestones.
 - [x] Filter visible nodes based on expansion state.
 - [x] Create Dynamic `Breadcrumb` UI component (Hover-based).
 
 ### 5.3 Filtered Rendering 🟢
 - [x] Implement recursive visibility logic (Phase -> Milestone -> Task).
 - [x] Trigger re-layout (Compact Layout) on expansion/collapse.
 
 ---
 
 ## **Phase 6: Visual Overhaul & Final Polish** (Completed)
 
 ### 6.1 Strict Styling Updates 🟢
 - [x] **Compact Nodes**: Fixed 50px x 25px dimensions.
 - [x] **Theme System**:
     - **Phases**: Blue Theme (`bg-blue-900`) & Blue Connectors.
     - **Milestones**: Orange Theme (`bg-orange-900`) & Orange Connectors.
     - **Tasks**: Grey Theme (`bg-slate-700`) & Grey Connectors.
 - [x] **Dependency Visualization**:
     - Rainbow-colored dashed lines (`strokeWidth: 2`) for logical dependencies.
     - Cycle through vibrant colors (Pink, Yellow, Purple, etc.).
 
 ### 6.2 Structural Logic 🟢
 - [x] **Vertical Connections**: All nodes connect vertically (Top/Bottom handles).
 - [x] **2px Connections**: All structural and dependency lines set to 2px width.
 - [x] **Breadcrumb Hover**: Real-time path updates on node hover.
 
 ---
 
 ## **Phase 7: Timeline & Gantt Visualization** (Est. 6-8 Hours)
 
 ### 7.1 Gantt Component �
 - [ ] Create `GanttChart.jsx` (SVG-based implementation).
 - [ ] Implement robust date parsing (`Start` + `Duration` or `Start` + `End`).
 - [ ] Auto-calculate project duration and scale.
 
 ### 7.2 Interactive Hierarchy �
 - [ ] Implement `expanded` state for Phases and Milestones.
 - [ ] Default state: **Phases Collapsed**.
 - [ ] Hierarchical Indentation (Phase -> Milestone -> Task).
 
 ### 7.3 Advanced UI Features �
 - [ ] **2D Scrolling**: Sticky Headers (Date Scale) and Sticky Columns (Task Names).
 - [ ] **Weekend Highlighting**: Vertical shading for Sat/Sun.
 - [ ] **Theme Integration**: Dark/Light mode support.
 
 ---
 
 ## **Phase 8: Robustness & Architectural Refactoring** (Completed)

### 8.1 Consolidated State Management 🟢
- [x] Implement "Single Source of Truth" pattern in `App.jsx`.
- [x] Consolidate visibility, layout, and analysis into a unified `useMemo` block.
- [x] Remove redundant and competing `useEffect` hooks to prevent race conditions.

### 8.2 Decoupled Logic (Visibility Manager) 🟢
- [x] Create `src/utils/visibilityManager.js` to extract filtering logic from UI components.
- [x] Implement robust Set-based filtering for Phases, Milestones, and Tasks.
- [x] Standardize drill-down visibility rules (Phase -> MS -> Task).

### 8.3 State Synchronization 🟢
- [x] Add `tasksWithVisibleDeps` to `drillState` to manage dependency visibility globally.
- [x] Ensure graph derivations are always in sync with user interaction states.

---

## **Phase 9: Dependency Overhaul & Progress Support** (Completed)

### 9.1 Smart Dependency Visualization 🟢
- [x] Implement theme-aware dependency palettes (Neon for Dark, Professional for Light).
- [x] Implement **Smart Edge Router** with hybrid routing types:
    - [x] **Straight Lines** for vertical cross-milestone connections.
    - [x] **Bottom-to-Bottom** `smoothstep` loops for intra-milestone tasks.
    - [x] Horizontal handles for direct adjacent neighbors.
- [x] Implement stable unique coloring for intra-phase dependencies.
- [x] Implement **Auto-Draw** logic: show dependencies automatically on Milestone expansion.

### 9.2 Progress & Data Maturity 🟢
- [x] Create `USER_GUIDE.md` for standardized data import.
- [x] Implement smart "Percent Complete" detection (Detects '%', decimals, or integers).
- [x] Integrate progress bars into Gantt View task blocks.
- [x] Fix Gantt filtering: Ensure all chained tasks show under milestones (Data-driven grouping).

---

## **Testing Strategy**

1.  **Unit Tests**:
    *   Test CSV/Excel parsing with various schemas.
    *   Verify Critical Path calculation against known small graphs.
    *   **Gantt**: Verify date math (leap years, month boundaries).
    *   **Visibility**: Ensure `getVisibleElements` filters correctly based on `drillState`.
2.  **Integration Tests**:
    *   Upload file -> Verify Graph Rendering.
    *   Check zoom interactions update node LOD.
    *   **View Switching**: Toggle between Network and Gantt views without data loss.
    *   **Drill-down Stability**: Expand/Collapse repeatedly to verify no "blank page" crashes.
3.  **User Acceptance Testing (UAT)**:
    *   Upload real project MPP export (converted to CSV).
    *   Verify visual clarity of Critical Path.
    *   **Scrolling**: Ensure headers remain visible on large project plans.
    *   **Task Visibility**: Confirm individual tasks appear correctly horizontally next to expanded milestones.

---

## **Phase 10: Interactive Editing & Exporting** (Est. 6-8 Hours)

### 10.1 Drag-and-Drop Interaction �
- [ ] Implement drag handlers on React Flow nodes for dependency creation.
- [ ] Implement drag handlers on Gantt chart bars for date adjustments.
- [ ] Implement dependency deletion (select edge + backspace).
- [ ] Update `derivedGraph` state dynamically based on drag events.

### 10.2 Data Export �
- [ ] Create `ExportService.js` to serialize updated project state.
- [ ] Implement CSV and Excel export functionality using `papaparse` and `xlsx`.
- [ ] Add "Export Data" button to the Sidebar.

### 10.3 API Integrations (Research Phase) 🔴
- [ ] Research Jira and MS Project API documentation.
- [ ] Design abstract `ProjectManagementIntegration` interface.

---

## **Phase 11: Resource & Workload Management** (Est. 3-5 Hours)
- [ ] Phase level requirements pending �

### 11.1 Resource Heatmap �
- [ ] Create `ResourceHeatmap.jsx` component.
- [ ] Calculate daily workloads per assignee based on task durations and start dates.
- [ ] Visualize over-allocated team members with color-coded alerts.

### 11.2 Assignee Filtering �
- [ ] Add "Assignee" dropdown to Sidebar or Header.
- [ ] Update `VisibilityManager` to filter nodes/tasks based on selected assignee.
- [ ] Ensure Gantt chart and Graph both respect assignee filters.

### 11.3 Visual Refinements & Interactive Highlighting 🟢
- [x] Implement "Light-on-Dark" high-contrast node aesthetic for Dark Mode.
- [x] Add dynamic highlighting: Selecting a connector highlights involved nodes with pulsing rings.
- [x] Standardize connector styles: Solid, thin default lines with thickened selection states.
- [x] Implement view persistence: Re-calculating dependencies no longer resets zoom or expansion levels.
- [x] Refine Node Expansion logic: Fixed bug preventing Phase/Milestone drill-down and ensured full hierarchy visibility.

---

## **Phase 12: Progress Tracking & Risk Mitigation** (Est. 5-7 Hours)

### 12.1 Baseline Comparison 🔴
- [ ] Update `projectDataProcessor.js` to accept secondary "Baseline" file upload.
- [ ] Modify visualization (Graph/Gantt) to display shadow elements indicating original baseline dates.
- [ ] Highlight delayed tasks in red.

### 12.2 What-If Scenario Sandbox 🔴
- [ ] Implement "Sandbox Mode" toggle in UI.
- [ ] Allow temporary adjustments to task duration/dates without overwriting main state.
- [ ] Visually differentiate sandbox changes from actual data.

### 12.3 Advanced Filtering 🔴
- [ ] Add quick-filter chips ("Overdue", "At Risk", "Completed").
- [ ] Implement robust filter logic combining status, dates, and progress.

---

## **Phase 13: Executive Reporting** (Est. 4-6 Hours)

### 13.1 High-Level Dashboard 🔴
- [ ] Create `Dashboard.jsx` component for summary metrics.
- [ ] Calculate and display Overall % Complete, Total Tasks Delayed, and Upcoming Milestones.
- [ ] Implement simple Burn-down chart visualization.

### 13.2 High-Resolution Export (PDF/PNG) 🔴
- [ ] Integrate a library like `html2canvas` or `dom-to-image`.
- [ ] Add "Export to PNG" and "Export to PDF" functionality.
- [ ] Ensure exported images capture the entire graph/Gantt, overcoming scroll clipping.

### 13.3 Presentation Mode 🔴
- [ ] Implement "Presentation Mode" fullscreen toggle.
- [ ] Hide sidebar and header to maximize canvas space.
- [ ] Add "next/previous phase" step-through functionality with auto-zooming.

---

## **Phase 14: Enhanced AI Insights (Gemini)** (Est. 6-8 Hours)

### 14.1 Auto-Risk Detection 🔴
- [ ] Update `InsightsPanel.jsx` to query Gemini service with project data.
- [ ] Define solid prompts for identifying scheduling risks, resource bottlenecks, and logical inconsistencies.
- [ ] Map AI responses to specific nodes/tasks for visual highlighting.

### 14.2 Schedule Optimization Q&A 🔴
- [ ] Implement a chat-like interface in the Insights Panel.
- [ ] Allow users to ask natural language questions ("How can we shorten this timeline?").
- [ ] Process AI suggestions and theoretically display how to parallelize specific tasks.
