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

## Application Interactions (Phase 1, 2 & 3)
- Navigating the UI features a clean `Light-on-Dark` aesthetic.
- The **Sidebar DropZone** captures file drag & drop interactivity for either CSV or complete Excel/`.xlsx` files.
- The system automatically parses your headers based on a built-in Fuzzy Match algorithm (e.g. `task no` equals `id`).
- It seamlessly integrates with a central logger framework allowing engineers to debug request traces natively.
- **Level of Detail (LOD) Zoom:** The nodes update their visual density based on your zoom scale. Zoom out significantly to only see minimal dots and connections (`<0.4x`). Zoom in standard (`~1x`) to see standard labels. Zoom in closely (`>0.8x`) to view dynamic sub-information like Start Dates, Assignees, and progress checkmarks natively.
- **0% Overlap Algorithmic Layout:** The system utilizes `Dagre` layout routing to guarantee elements do not overlap sequentially upon upload.
- **Expandable Hierarchy:** The main canvas is fully interactive. Clicking on a `Phase` node expands its relative `Milestones`. Clicking a `Milestone` exposes all corresponding granular `Tasks` and logic lines.
- **Dynamic Breadcrumbs:** Hovering over any element in the canvas natively calculates your view path updating the global app header with exact phase locations.

## For Developers: Advanced Logging
The application relies strictly on centralized logging provided by the `logger.js` singleton. Use the `logger` interface instead of `console.log()` across application domains.

1. **Imports:** `import { logger } from './utils/logger';`
2. **Features:** Every major user flow utilizes Trace IDs generated automatically via `logger.startTrace()`. Wait to trigger this function when logical chains begin spanning across multi-component trees.
3. **Log Levels:** Uses standard `debug, info, warn, error`.
