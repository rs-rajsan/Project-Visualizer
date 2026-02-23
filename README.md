# Project-Flow Visualizer

A sophisticated project dependency visualization and management tool built with **React**, **React Flow**, and **Tailwind CSS**. 

## 🚀 Key Features

- **Multi-View Visualization**: 
    - **Network Graph**: Advanced hierarchical layout with interactive Phase/Milestone drill-down.
    - **Gantt Chart**: Precise timeline view with integrated progress tracking and grouping.
- **Dynamic Interaction Engine**:
    - **Drag-to-Connect**: Create project dependencies directly on the graph with high-visibility interactive handles.
    - **Timeline Shifting**: Drag-and-drop Gantt bars to adjust task dates with automatic day-delta calculation.
- **Smart Data Processing**:
    - **Fuzzy Header Mapping**: Intelligent import from CSV and Excel (XLSX) regardless of column naming conventions.
    - **Level of Detail (LOD) Zoom**: Dynamic visual density that adapts based on the viewport scale.
- **Enterprise Ready**:
    - **Full Data Export**: Export your updated project state back to CSV or Excel.
    - **Adapter-Based Integrations**: Pre-architected abstract interface for Jira and MS Project connectivity.
- **Centralized Tracing**: Native request tracing framework integrated across all core services for maximum debuggability.

## 🛠 Tech Stack

- **Framework**: React 18+ (Vite)
- **Graph Engine**: React Flow
- **Styling**: Tailwind CSS / Vanilla CSS
- **Data Parsing**: PapaParse (CSV), SheetJS (Excel)
- **Icons**: Lucide React
- **Logging**: Custom Singleton with Request Tracing

## 📐 Architectural Principles

This project strictly adheres to modern software engineering standards:
- **SOLID**: Each utility (VisibilityManager, LayoutAlgorithm, ExportService) has a single, well-defined responsibility.
- **DRY (Don't Repeat Yourself)**: Shared logic is consolidated into modular utility classes.
- **Design Patterns**: 
    - **Strategy Pattern** for file parsing.
    - **Adapter Pattern** for PM tool integrations.
    - **Singleton Pattern** for logging and state orchestration.

## 📦 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Dev Server**:
   ```bash
   npm run dev
   ```

3. **Usage**:
   - Refer to `USER_GUIDE.md` for data schema requirements and interaction tips.

---

*Built with ❤️ by Antigravity (Advanced Agentic Coding)*
