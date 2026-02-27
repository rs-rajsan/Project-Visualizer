# Project-Flow Visualizer: Official User Guide

## Overview

Welcome to **Project-Flow Visualizer**, a next-generation, enterprise-grade project visualization engine. Project-Flow transforms raw, tabular project data (CSV/Excel) and Microsoft Project exports (XML) into highly interactive, synchronized visual representations. 

This guide provides step-by-step instructions on how to leverage all the modules and features within the application.

---

## 1. Getting Started: Importing Data

Before you can visualize your project, you need data. You have two options:

### Option A: Use the Sandbox
If you just want to explore the application without providing real data:
1. Look at the top-right corner of the top navigation bar.
2. Click the **"Sandbox Active"** toggle if it is available, or load data via the AI/Jira mocks. (Note: A built-in sandbox mock graph will automatically populate if activated).

### Option B: Import Your Own Project File
If you have a real project plan:
1. Locate the **Data Import** zone in the top-left Sidebar.
2. Drag and drop your `.csv`, `.xls`, `.xlsx`, or `.xml` file directly onto the dashed area, OR click the cloud icon to open your file browser.
3. The engine uses fuzzy-matching to read headers (e.g., `Task ID`, `Dependencies`, `Start Date`, `Assignee`). Ensure your file has at least these basic columns.
4. Your project network graph will instantly render in the main canvas.

---

## 2. Navigating the Core Views

You can toggle between different visual representations of your project using the **View Mode** switcher located in the lower left Sidebar block.

### View 1: The Network Graph (Default)
The Network Graph is an infinite canvas featuring a Smart Edge Router.
* **To drill down into details:** Click on any wide Phase or Milestone node. It will "explode" to reveal its constituent tasks.
* **To view macro vs micro links:** Simply use your mouse wheel to zoom in and out. 
  * Zooming out hides messy task links and shows thick milestone-to-milestone dependencies.
  * Zooming in reveals individual task links and granular metadata.
* **To manually reposition nodes:** Click and hold any node, then drag it to a custom position on the canvas. The engine will remember this layout.
* **To draw new dependencies:** Hover over a task node until you see the small teal handles appear on its borders. Click a handle and drag a line to another task.
* **To remove dependencies:** Click directly on any dependency line (it will glow), then press your `Delete` or `Backspace` key.

### View 2: The Gantt Chart
A horizontal timeline strictly bound to your structural hierarchy.
* **To adjust task dates:** Click and hold the center of any horizontal task block and slide it Left or Right to adjust its absolute Start/End dates. The timeline will update live.

### View 3: Resource Workload Heatmap
A high-density matrix visualizing team capacity over the project lifecycle.
* **To identify bottlenecks:** Look for cells highlighted in **Orange** (Heavily Loaded, 101-150%) or **Pulsing Rose** (Critically Over-Allocated, >150%). 
* **To see specific load data:** Hover your mouse over any glowing cell to trigger a tooltip showing exact allocation parameters.

### View 4: Executive Dashboard
A high-level graphical reporting layer utilizing Recharts.
* **To review performance:** Click the "Dashboard" tab to see real-time calculated KPIs like 'Overdue Slippage' and tabular data.
* **To analyze momentum:** Review the automatically generated **Agile Sprint Burn-down** (actual vs ideal trajectory) and the **Executive S-Curve** (Earned Value vs Planned Value).

---

## 3. Global Filtering & Analysis

These tools sit universally across all views and help you slice the data.

### Finding the Critical Path
1. Look at the top navigation bar.
2. Click the **"Critical Path Off"** toggle button.
3. The engine will instantly calculate the longest logical path (CPM). Critical nodes and their connecting chains will glow in Neon Rose across the Graph and Gantt.

### Filtering by Assignee
1. Locate the **Assignee Filter** dropdown midway down the left Sidebar.
2. Click the dropdown and select a specific team member.
3. The Graph, Gantt, and Heatmap will instantly isolate to show *only* the responsibilities assigned to that individual.

### Filtering by Status
1. Under the Assignee filter, find the **Status Filter** pills.
2. Click **Overdue** to highlight tasks that have missed their baseline deadline.
3. Click **At Risk** to highlight tasks with zero remaining baseline buffer.

---

## 4. Advanced Enterprise Features

Project-Flow includes heavy-duty integrations for PMOs.

### Setting up your Brand Profile
You can force exported dashboards to inherit your company's actual colors and logo.
1. In the Sidebar, click the **Brand Profile** button (indicated by a Palette icon).
2. A configuration modal will open. 
3. Click **Browse Files** to upload your company's transparent PNG or SVG logo.
4. Use the color pickers to inject your primary brand hex code and secondary highlight hex code.
5. Click **Apply Brand Settings**. The dashboard and all future exports will now natively utilize these styles.

### Live Jira Sync
1. In the Sidebar, click the **Live Jira** button.
2. Enter your Jira Domain URL, Account Email, and API Token.
3. (This connects the visualization engine to a live Atlassian environment if configured on the backend).

### Compare Baseline
1. In the Sidebar under Data Import, click **Compare Baseline**.
2. Upload a previous version of your project plan (CSV/Excel).
3. The engine will overlay the historical projection against your current timeline. Task blocks in the Gantt chart will display their "baseline shadow", allowing you to view slippage natively.

### AI Health Analyst (Agentic AI)
1. In the Sidebar, click the amber **AI Report** button.
2. When the modal opens, select your preferred AI Provider from the dropdown (**Google Gemini 1.5 Pro** or **OpenAI GPT-4o**).
3. Paste in your respective API key (this is securely stored in your local browser storage).
4. Click **Analyze Tasks**. 
5. **How it works (Agentic Reasoning)**:
   - The system activates a specialized **AI Analyst Agent**.
   - This agent performs **Graph Reasoning**: it consumes your project's dependency structure, compresses it for efficiency, and identifies hidden risk factors like dependency bottlenecks or resource gaps.
   - It generates a professional, 3-paragraph executive mitigation plan based on its autonomous analysis of your specific data.
6. Click **Copy Report** to copy the markdown to your clipboard.

### Real-Time Multiplayer
The system is natively instrumented with a `Yjs` WebSocket engine. If you are connected to a team server, coworkers accessing the same URL will automatically join your session. You will see colored cursors floating across the screen representing where they are currently looking.

---

## 5. Exporting Reports

Once you have customized the view or adjusted dates, you can snapshot and export the data.

### Exporting Raw Data (CSV/Excel)
1. Locate the **Export Data** section at the very bottom of the Sidebar.
2. Click **CSV** or **Excel**. The file downloaded will reflect the *current* state of the project, meaning any manual drag-and-drop date adjustments or dependency modifications you made in the app are preserved.

### Exporting the Dashboard (PDF, PPTX, Gamma)
1. Navigate to the **Dashboard** view via the View Mode tab.
2. In the top right corner of the Dashboard, you'll see a cluster of export tools:
   * **Export PDF**: Click this to trigger a high-fidelity image capture. A professionally formatted PDF abstract will download securely via your browser.
   * **Export PPTX**: Click this to utilize the native `pptxgenjs` engine. A 3-slide, fully editable PowerPoint document will download. It will natively embed your custom Brand Profile color/logo, tabular shapes, and the Recharts graphics.
   * **Export to Gamma**: Click this to generate a highly structured Markdown file (`.md`). You can import this file directly into [Gamma App](https://gamma.app) via their "Import from Document" flow to instantly synthesize a beautifully designed, AI-generated slide deck based on your project's KPIs.

---

## 💻 Architecture Notes (For Developers)

For a comprehensive visual breakdown and explanation of the system, see the **[Architecture Documentation](./docs/architecture/ARCHITECTURE.md)**.

Project-Flow relies on strict **SOLID/DRY principles**:
1. **Derived State Engine**: `App.jsx` acts purely as an orchestrator. All filtering, layout, and topological sorting map dynamically purely off a single `rawData` array and `drillState`.
2. **Trace Telemetry**: `console.log()` is explicitly prohibited. All metadata actions flow through `logger.startTrace` to ensure secure, measurable, and easily debugged profiling cycles.
