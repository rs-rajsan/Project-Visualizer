# Project-Flow Visualizer - User Guide

## Introduction
Welcome to Project-Flow Visualizer. This application allows you to simply upload a standard CSV or Excel document containing project tracking data, and instantly parse it into an interactive flowchart and dependency tracking UI.

## Formatting Your Data
Before starting, ensure your CSV or Excel (`.xlsx`) data matches one of the universally accepted standards below for project dependency imports.
*The application uses **fuzzy-matching** for column headers, so variations are generally acceptable.*

### Required Columns:
- **ID:** The unique identifier for each task in your project.
- **Name / Task Name:** The descriptive, short name of the task.
- **Dependencies / Predecessors:** A comma-separated list of IDs this task critically relies on to begin (e.g. `1,4,5`).

### Optional Columns:
- **Phase:** The high-level grouping of the task (e.g., "Planning", "Execution").
- **Milestone:** Sub-groupings under a phase logic (e.g., "M1 Architecture").
- **Cost/Effort:** An integer denoting duration length or budget size.
- **Start Date:** Preferred format `YYYY-MM-DD`.
- **Assignee:** Target member on your team handling the effort.
- **Progress:** A percentage or decimal indicating completeness (e.g. `%10`, `10%`, `.1`).

### Example CSV Format

```csv
ID,Task Name,Phase,Milestone,Predecessors,Start Date
1,Setup Repo,1. Foundation,Frontend,,2025-01-01
2,Setup CI/CD,1. Foundation,Backend,1,2025-01-02
3,Landing Page UI,2. Core Logic,Frontend,,2025-01-05
4,Integrate Backend,2. Core Logic,Integration,2,3,2025-01-07
```

## Application Interactions (Latest Features)
- **Interactive Dependency Editing:**
    - **Connect Nodes:** In the Graph view, drag from the bottom or right handles of a node to a target node handle to create a new dependency.
    - **Delete Dependencies:** Select an edge in the Graph view and press the `Delete` or `Backspace` key to remove the relationship permanently.
- **Gantt Timeline Management:**
    - **Drag-to-Shift:** Grab any task bar in the Gantt Chart and slide it horizontally to adjust the `Start` and `End` dates. The system calculates the shift in days automatically.
- **Data Exporting:**
    - Download your updated project data at any time via the **Sidebar Export** buttons. Supports both **CSV** and **Excel (.xlsx)** formats.
- **Persistent Layouts:** Manual node repositioning in the Graph view is now "sticky"—the system remembers your custom organization even when switching views or expanding/collapsing groups.
- **Level of Detail (LOD) Zoom:** The nodes update their visual density based on your zoom scale.
    - **Tiny (<0.4x):** Minimal dots for high-level structure.
    - **Standard (~1x):** Full labels and status icons.
    - **Detailed (>0.8x):** Expanded task details including Assignees and Date strings.
- **Cross-View Synchronization:** All changes made via drag-and-drop in either the Graph or Gantt view are instantly reflected across the entire application and the exported data sets.

## For Developers: Best Practices
This project is built to enterprise standards:
1. **SOLID Refactoring:** Logic for Visibility, Layout, and Export is decoupled into standalone services.
2. **Centralized Tracing:** Every major action from file upload to graph render is associated with a unique Trace ID in the `logger`.
3. **PM Integration Interface:** Developers can extend `PMIntegration.js` to add more connectors (e.g., Jira, Trello) using the provided abstract contract.
