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
 
 ## **Phase 7: Timeline & Gantt Visualization** (Completed)
 
 ### 7.1 Gantt Component 🟢
 - [x] Create `GanttChart.jsx` (SVG-based implementation).
 - [x] Implement robust date parsing (`Start` + `Duration` or `Start` + `End`).
 - [x] Auto-calculate project duration and scale.
 
 ### 7.2 Interactive Hierarchy 🟢
 - [x] Implement `expanded` state for Phases and Milestones.
 - [x] Default state: **Phases Collapsed**.
 - [x] Hierarchical Indentation (Phase -> Milestone -> Task).
 
 ### 7.3 Advanced UI Features 🟢
 - [x] **2D Scrolling**: Sticky Headers (Date Scale) and Sticky Columns (Task Names).
 - [x] **Weekend Highlighting**: Vertical shading for Sat/Sun.
 - [x] **Theme Integration**: Dark/Light mode support.

 ### 7.4 Advanced Dependency Differentiation �
 - [x] **Semantic Color Encoding**: Assign colors based on relationship types (Intra-Milestone, Inter-Milestone, Inter-Phase) with synced arrow markers.
 - [x] **Physical Routing Refinements**: Implemented Edge Bundling for inter-milestone paths and Incremental Offsets for left-side intra-milestone connections via the new `SmartEdge` component.
 
 🎯 Key Enhancements:
 🚉 1. Incremental Offsets (Vertical Bus)
Problem Solved: Previously, multiple dependencies within the same milestone would sit directly on top of each other on the left side, making it impossible to count or trace them.
Solution: I've implemented a programmatic offset logic. If a milestone has 5 internal dependencies, the first one bends 20px to the left, the second 40px, the third 60px, and so on.
Visual Result: These now appear as a neat series of concentric "loops" on the left side of the task stack, completely eliminating visual overlap.
🖇️ 2. Edge Bundling (Inter-Milestone Bus)
Problem Solved: High-density "Spaghetti" where many lines independently cross the screen between two different milestones.
Solution: I created a "Bus Channeling" logic. For any group of edges traveling between the same two milestones, they now converge towards a shared central "Bus X" point, travel together in a tight bundle, and then branch out elegantly using smooth Quadratic Bezier curves as they approach their targets.
Visual Result: This transforms chaotic cross-graph lines into organized "cable runs," making the high-level architecture of your project much clearer.
🧠 3. The 

SmartEdge
 Component
To make this possible, I built and registered a custom 

SmartEdge.jsx
 engine. It dynamically detects the relationship type (Intra vs. Inter) and calculates specialized SVG paths that standard React Flow edges cannot provide.

The implementation plan has been updated to mark this phase as completed. You can see these clean, bundled routes immediately by loading a project with cross-milestone dependencies! What should we tackle next?

 - [x] **Interactive "Focus" States**: Implemented dynamic rendering with distance-based opacity (fading long-range edges) and Neon Shadow Glows (`drop-shadow`) for the active/selected dependency chain.
 Opacity Gradient by Distance:
 🎯 Key Enhancements:
Smart Fading: The system now programmatically calculates the Euclidean distance of every connection.
Logistics: Short, local connections remain solid, but long-range "background" dependencies (cross-phase or cross-project) now automatically fade to 25% opacity.
Focus: This removes the "cobweb" look of complex projects, allowing you to focus on immediate task clusters until you zoom in or select a specific path.
Neon Shadow Glows:

When a task is clicked or a critical path is toggled, I've added a CSS drop-shadow(0 0 8px [color]) filter to the active edges.
This creates a "Laser Highlight" effect where the active dependency chain literally glows and "pops" forward in 3D space, separating itself from the dimmed background.
Adaptive Animation:

Logic Cleanup: I have disabled the constant animation for general logic edges.
Directional Intent: Moving "dash" animations are now reserved exclusively for the Critical Path or the currently selected Task Trace. Stationary lines represent stable project logic; moving lines represent your current "potential path of impact."

 - [x] **Advanced Line Markers**: Differentiating "Standard Dependency" vs "Milestone Blocker" using source-point dots for cross-milestone handoffs. Implemented variable `strokeWidth` based on task importance/cost.
 🎯 Key Enhancements:
Endpoint Variance (Milestone Blockers):

Logic: I have introduced a "High-Stakes Handoff" detector. Any logical dependency that crosses from one milestone group to another is now tagged as a Milestone Blocker.
Visual Marker: These specific edges now feature a Solid Circle (Dot) at their starting point in addition to the standard arrowhead. This provides an immediate visual cue for critical project handoffs that span different workstreams.
Line Weight by Flow (Importance Scaling):

Dynamic Sizing: I have linked the edge's strokeWidth to the Cost of the task it originates from.
Visual Scale: High-cost, significant tasks now produce thicker, bolder dependency lines, while minor sub-tasks use sleek, hair-thin connections. This allows you to visually weigh the "gravity" of different dependency paths at a glance.
Marker-End Sync:

Standard internal dependencies use Closed Arrows for a clean look, while cross-milestone blockers use Open Arrows (with the new Dot at the start) to signal their unique status in the project logic.

  - [x] **"Lens" or "Zone" Dimming**: Implemented zoom-based Level of Detail (LOD) control. Task-to-task dependency lines are automatically hidden at low zoom levels (<0.6) and replaced by thick, high-level Milestone Summary edges to maintain visual clarity.
 
 🔍 Zoom-Based Level of Detail (LOD) control:
Dynamic Clutter Reduction:

Zooms Out (< 0.6): The system automatically hides the hundreds of individual task-to-task logical lines. This prevents the "spiderweb" effect when viewing the entire project from a distance.
Milestone Summary Lines: In their place, I have introduced Thick Amber Summary Edges that connect the Milestones themselves. These represent the high-level flow of the project, showing you how entire workstreams relate to each other without geting lost in the weeds.
Seamless Transition:

Zooms In (>= 0.6): As you dive back into a specific phase, the thick summary lines fade away, and the precise, individual task dependencies gracefully reappear.
Stability: I've optimized the 

SmartEdge
 component using React Flow's useViewport hook to ensure these transitions are buttery smooth even in massive project graphs.
Intelligent Visibility:

The summary lines only appear if there is at least one logical dependency crossing between those milestones.
All existing features like Neon Glows, Edge Bundling, and Importance Weighting still work perfectly within this new LOD system.

### 7.5 Architectural Refinement & Security (Completed) 🟢
- [x] **SOLID Logic Extraction**: Moved complex BFS dependency tracing from `App.jsx` into `VisibilityManager.calculateTrace` to ensure single responsibility.
- [x] **Centralized Request Tracing**: Integrated `logger.startTrace` into the core `renderGraph` cycle. Every UI update is now linked to a unique trace ID for easier debugging of complex layout states.
- [x] **Secure Logging Policy**: Verified and scrubbed all instances of `console.log`. The application strictly uses the centralized `Logger` framework to prevent metadata leakage in production.

Analysis of the 3 Items:
SOLID Logic Extraction (Maintainability)

Need: Without this, 

App.jsx
 was becoming a "God Object," handling both React UI state and complex graph-traversal math (BFS).
Status: Implemented. I moved the tracing logic to VisibilityManager.calculateTrace.
Benefit: If you ever want to add more complex logic (like "upstream only" vs "downstream only" tracing), you now have a single, isolated place to edit it without risking breaks to the UI component.
Centralized Request Tracing (Observability)

Need: In a reactive graph with many moving parts (drilling, zooming, filtering), bugs can be hard to reproduce.
Status: Implemented. I integrated logger.startTrace into the renderGraph cycle.
Benefit: Your logs now show exactly how long a specific layout took and what the state was for that specific frame. It's the difference between "The graph didn't load" and "Trace ID #492 failed during Layout calculation for Phase X."
Secure Logging Policy (Security/Compliance)

Need: You explicitly mentioned that browser console.log is a security risk.
Status: Implemented & Verified. I scrubbed the code and enforced the Logger framework.
Benefit: This ensures that sensitive project data (like task names or costs) doesn't end up leaked in a user's browser console while still giving developers the info they need via your centralized log.

---

## **Phase 8: Robustness & Architectural Refactoring** (Completed) 🟢

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

8.1 Consolidated State Management — Completed
Your 

App.jsx
 currently uses a "Single Source of Truth" pattern centered around the renderGraph orchestrator.
All graph derivations (visibility, layout, and dependency tracing) are consolidated into this single logical flow, preventing the "race conditions" and overlapping useEffect triggers that were present in earlier versions.
8.2 Decoupled Logic (Visibility Manager) — Completed
I have already created 

src/utils/visibilityManager.js
.
It successfully uses Set-based filtering (expandedPhases, expandedMilestones) to decide exactly which nodes should appear on screen.
It enforces the hierarchical rule: A task is only visible if its parent Milestone is expanded, and a Milestone is only visible if its parent Phase is expanded.
8.3 State Synchronization — Completed
The graph derivations are perfectly synced with user interactions (clicking a node to expand/collapse or select).
Note on Implementation: While the plan mentions a variable called tasksWithVisibleDeps, the current final implementation is actually more efficient: I am deriving the logical edges on-the-fly inside 

deriveGraph
 by checking the intersection of rawData dependencies with the visibleTaskIds Set. This ensures you never see a leading line to a hidden task.
Summary: Your current architecture is already SOLID-compliant and fully decoupled. Phase 8 is stable and live in your main branch.


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

9.1 Smart Dependency Visualization — Completed
Theme-Aware Palettes: The system uses a vibrant, high-contrast palette (Cyan for intra-group, Orange/Yellow for inter-group) that is specifically optimized for your dark-themed canvas. 🟢
Smart Edge Router: Your routing engine has evolved into a sophisticated "Best-Path" system. Instead of rigid rules, I implemented a Dynamic Anchor Search in LayoutAlgorithm.js that iterates through Top, Bottom, Left, and Right handles to find the mathematically shortest path. 🟢
Intra-Milestone Specialized Routing: For tasks within the same milestone, I implemented "Left-Side Specialized Routing" with incremental offsets. This is an upgrade over simple bottom-loops, as it allows you to see 10+ parallel dependencies without them overlapping. 🟢
Auto-Draw Logic: This is handled via the Derived State Engine. As soon as you click a Milestone to expand it, the 

VisibilityManager
 detects the new tasks and automatically calculates and draws all logical dependencies for you in real-time. 🟢
9.2 Progress & Data Maturity — Completed
USER_GUIDE.md: This document is present in your root directory and provides the standardized mapping for your CSV/Excel imports. 🟢
Progress Bars: In the Gantt View, I have integrated progress overlays into the task blocks. They use a sleek cyan-400/30 background to show precisely how much of a task is finished. 🟢
Percent Complete Detection: The 

projectDataProcessor.js
 includes a fuzzy header mapping for progress, and the 

GanttChart
 component uses parseInt to safely extract values like "50%", "50", or "75" to drive the visual bars. 🟢
Gantt Filtering Fix: I've ensured that the Gantt chart honors the drillState. Tasks are grouped strictly by their Milestone and Phase parents, ensuring that even complex chained dependencies stay organized under their correct headers. 🟢
Conclusion: Phase 9 is stable, fully integrated with your architectural refactoring from Phase 8, and is live in your main branch. The system is now extremely robust at handling complex project data.
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

### 10.1 Drag-and-Drop Interaction 🟢
- [x] **Graph Dependency Creation**: Implemented `onConnect` with high-visibility interactive handles. Dragging between nodes creates real dependencies in `rawData`.
- [x] **Gantt Date Adjustments**: Implemented mouse-drag handlers on Gantt bars to shift `startDate` and `endDate` via pixel-to-day conversion.
- [x] **Dependency Deletion**: Integrated `onEdgesDelete` to allow removal of dependencies via GUI (Select + Delete key).
- [x] **Persistent Layout Overrides**: Updated `LayoutAlgorithm` and `App.jsx` to store and respect manual node repositioning (drags stick).

🎮 New Interactive Features:
Direct Dependency Editing (Graph):

Drag-to-Connect: I've added high-visibility, teal-glowing handles to all nodes. You can now drag between them to create logical dependencies. This update writes directly to your rawData and persists.
Visual Deletion: Select any logical dependency line and high-light it, then press Backspace or Delete. The dependency is instantly removed from the task's data structure.
Timeline Manipulation (Gantt):

Live Date Shifting: You can now grab any task bar in the Gantt chart and slide it across the timeline.
Intelligent Snapping: As you drag, the system calculates the "Day Delta" based on your movement. Releasing the bar updates the startDate and endDate of that task in the master dataset.
Sticky Layouts:

Persistent Repositioning: If you drag a node in the Network view, it now stays where you put it. I've updated the Layout Algorithm to respect manual user overrides, so your custom organization is preserved even after drill-down toggles.
Security & Best Practices:

All interactions are wrapped in the high-performance Single Source of Truth model.
No logs are written to the browser console; everything uses the centralized Logger tracing framework.

🛠️ Changes:
Code (App.jsx): Explicitly configured the deleteKeyCode prop in the React Flow component to support both ['Backspace', 'Delete']. This ensures a seamless experience across Windows, Mac, and different keyboard preferences.
Implementation Plan: Updated the description in section 10.1 to reflect the use of the Delete key as the primary interaction for removing logical dependencies.

### 10.2 Data Export 🟢
- [x] **ExportService.js**: Created a dedicated service to serialize the `rawData` state into downloadable formats.
- [x] **Cross-Format Support**: Implemented CSV export via `papaparse` and Excel (.xlsx) export via `xlsx`.
- [x] **Sidebar Integration**: Integrated "Export Data" buttons into the Sidebar with appropriate icon triggers.

📥 New Export Features:
ExportService.js:
I've built a centralized service in 

src/utils/ExportService.js
 that takes your active project data and converts it into standard business formats.
CSV Export:
Using papaparse, the system accurately flattens your current project state (including any drag-and-drop adjustments) into a clean CSV file.
Excel (.xlsx) Export:
Leveraging the xlsx library, you can now export your project data as a professional Excel workbook, making it ready for distribution to stakeholders.
UI/UX Integration:
New "Export Data" Section: I've added a dedicated section in the Sidebar with sleek, theme-aligned buttons for one-click downloading.
Visual Consistency: The export buttons use the same design language as the View Mode toggles, maintaining a premium look and feel.
📝 Technical Note:
I've ensured casing consistency in the filenames and imports to satisfy the build system's strict requirements (ExportService.js).
The system now serves as a full-circle tool: Import -> Visualize -> Edit -> Export.
Phase 10.2 is now marked as Completed (🟢).

The next step in the plan is Phase 10.3: API Integrations (Research Phase). Would you like me to begin the research on Jira and MS Project API documentation to prepare for the integration?

### 10.3 API Integrations (Research Phase) �
- [x] **API Research**: Conducted deep dive into Jira Cloud REST API (JQL-based issue search) and MS Project Online REST API (`TaskLinks` for dependencies).
- [x] **Abstract Interface**: Created `PMIntegration.js` defining a standard `ProjectManagementIntegration` base class with skeleton implementations for `JiraIntegration` and `MSProjectIntegration`.
- [x] **Standardization Layer**: Included `_standardize` interface to map external schemas (Jira Issues/Project Tasks) into the internal `Project-Flow` format.

🔍 Research Summary:
Jira Cloud REST API:

Data Fetching: Primarily uses the /rest/api/3/search endpoint combined with JQL (Jira Query Language) to pull project issues.
Dependencies: Handled through "Issue Links". Our integration will need to map these link types (e.g., "blocks", "is blocked by") into direction-aware edges.
Custom Fields: Progress and Dates often reside in custom fields, requiring our Standardization Layer to handle flexible mapping.
MS Project Online REST API:

Structural Fidelity: Uses /_api/ProjectServer with dedicated Tasks and TaskLinks endpoints.
Native Dependencies: Very closely matches our internal model. TaskLinks provides DependencyType (FS, SS, etc.) and Lag data, which we can eventually use for advanced Gantt logic.
🏗️ Architectural Foundation:
I have created 

src/utils/PMIntegration.js
, which implements the Adapter Design Pattern:


ProjectManagementIntegration
 (Abstract Class): Defines the strict contract (

authenticate
, 

fetchProjects
, 

fetchProjectData
) that all future integrations must follow.
Skeleton Implementations: Provided baseline classes for both 

JiraIntegration
 and 

MSProjectIntegration
, ready for API-key integration.
Standardization Layer: Included a blueprint for mapping external tool schemas into the Project-Flow unified data format, ensuring that "Imported" data works perfectly with our Network and Gantt views.
Phase 10.3 is now marked as Completed (🟢).

The core requirements for Phase 10 are now finished. We have achieved:

Drag-and-Drop editing.
Full Export to CSV/Excel.
Architectural Readiness for Enterprise API connections.
What is our next objective? Would you like to refine any of these interactions, or move toward final polish and deployment?
### 10.4 Architectural Review — Completed 🟢
- [x] **SOLID Audit**: Verified that all core utilities (`VisibilityManager`, `LayoutAlgorithm`, `ExportService`) follow Single Responsibility.
- [x] **DRY Implementation**: Consolidated repetitive mapping and math logic into centralized helpers.
- [x] **Centralized Tracing**: Verified `logger.startTrace` implementation across all high-level components and services, ensuring unified debuggability.
- [x] **Documentation Sync**: Updated `README.md` and `USER_GUIDE.md` to reflect the latest enterprise-standard architecture.

---

## **Phase 11: Resource & Workload Management** (Est. 3-5 Hours)
*Design Principle: Use **SOLID Pattern** to extend `VisibilityManager` for resource filtering. Ensure **DRY logic** for daily delta calculations.*

### 11.1 Resource Heatmap 🔴
- [ ] Create `ResourceHeatmap.jsx` (Follows data-driven render pattern).
- [ ] Implement central logic to calculate daily workloads (Reuses existing `projectDataProcessor` date math).
- [ ] Integrate **Centralized Tracing** for heatmap rendering and calculation cycles.

### 11.2 Assignee Filtering 🔴
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
