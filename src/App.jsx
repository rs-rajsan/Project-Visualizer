import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css'; // Essential ReactFlow styles
import Sidebar from './components/Sidebar';
import CustomNode from './components/CustomNode';
import SmartEdge from './components/SmartEdge';
import { GanttChart } from './components/GanttChart';
import { ResourceHeatmap } from './components/ResourceHeatmap';
import { logger } from './utils/logger';
import { ProjectDataProcessor } from './utils/projectDataProcessor';
import { LayoutAlgorithm } from './utils/layoutAlgorithm';
import { VisibilityManager } from './utils/visibilityManager';
import { CriticalPathAlgorithm } from './utils/criticalPathAlgorithm';
import { ExportService } from './utils/exportService';

// Initial dummy elements for placeholder canvas
const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Upload Data via Sidebar' },
    position: { x: 250, y: 50 },
    className: 'bg-indigo-50 border-2 border-indigo-400 text-indigo-950 font-bold p-4 rounded shadow-lg'
  }
];
const initialEdges = [];

const nodeTypes = {
  customTask: CustomNode,
};

const edgeTypes = {
  smart: SmartEdge,
};

const App = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rawData, setRawData] = useState([]);
  const [sandboxData, setSandboxData] = useState([]);
  const [isSandboxMode, setIsSandboxMode] = useState(false);

  // The active visual state depends on sandbox toggle
  const activeData = isSandboxMode ? sandboxData : rawData;

  // Phase 3: Derived State Engine
  const [drillState, setDrillState] = useState({
    expandedPhases: new Set(),
    expandedMilestones: new Set(),
  });
  const [userPositions, setUserPositions] = useState({}); // Stores manual drags
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showCriticalPath, setShowCriticalPath] = useState(false);
  const [viewMode, setViewMode] = useState('network'); // 'network' | 'gantt' | 'resources'
  const [assigneeFilter, setAssigneeFilter] = useState(null);
  const [activeBreadcrumb, setActiveBreadcrumb] = useState('Waiting for Data...');

  // Core Render Flow using Derived State Pattern
  const renderGraph = useCallback((data, currentDrillState, activeTaskId = null, existingUserPositions = userPositions, currentAssigneeFilter = assigneeFilter) => {
    const traceId = logger.startTrace({ action: 'render_graph', activeTaskId, filter: currentAssigneeFilter });

    try {
      let { nodes: visibleNodes, edges: visibleEdges } = VisibilityManager.deriveGraph(data, currentDrillState, { assignee: currentAssigneeFilter });

      // Apply user overrides before layout
      visibleNodes = visibleNodes.map(node => {
        if (existingUserPositions[node.id]) {
          return { ...node, position: existingUserPositions[node.id] };
        }
        return node;
      });

      let { nodes: layoutedNodes, edges: layoutedEdges } = LayoutAlgorithm.applyLayout(visibleNodes, visibleEdges);

      let activeNodes = new Set();
      let activeEdges = new Set();
      let displayMode = 'normal'; // 'normal', 'taskTrace', 'criticalPath'

      if (activeTaskId) {
        displayMode = 'taskTrace';
        const trace = VisibilityManager.calculateTrace(visibleNodes, visibleEdges, activeTaskId);
        activeNodes = trace.activeNodes;
        activeEdges = trace.activeEdges;
      } else if (showCriticalPath) {
        displayMode = 'criticalPath';
        const cpm = CriticalPathAlgorithm.calculate(data);
        activeNodes = cpm.criticalTaskIds;
        activeEdges = cpm.criticalEdges;
      }

      if (displayMode !== 'normal') {
        const isCritical = displayMode === 'criticalPath';
        const edgeColor = isCritical ? '#f43f5e' : '#2dd4bf'; // Neon Rose for CPM, Teal for Trace

        layoutedNodes = layoutedNodes.map(n => {
          const isTask = n.data.nodeType === 'task';
          const isHighlighted = activeNodes.has(n.id);
          const opacity = isHighlighted ? 1 : 0.2;

          return {
            ...n,
            style: { ...n.style, opacity },
            data: { ...n.data, isHighlighted }
          };
        });

        layoutedEdges = layoutedEdges.map(e => {
          if (activeEdges.has(e.id)) {
            return {
              ...e,
              style: { ...e.style, stroke: edgeColor, strokeWidth: 3 },
              animated: true,
              zIndex: 10,
              data: { ...e.data, isHighlighted: true },
              markerEnd: { ...e.markerEnd, color: edgeColor }
            };
          }
          return { ...e, style: { ...e.style, opacity: 0.1 } };
        });
      }

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    } catch (error) {
      logger.error('View render failure', error);
    } finally {
      logger.endTrace();
    }
  }, [setNodes, setEdges, showCriticalPath, drillState, userPositions, assigneeFilter]);

  const handleFileUpload = useCallback(async (file) => {
    logger.info(`App component received file: ${file.name}`);
    setIsProcessing(true);

    try {
      const processed = await ProjectDataProcessor.processFile(file);
      setRawData(processed.rawData);
      setIsSandboxMode(false);
      setSandboxData([]);

      // Initial Load: All collapsed
      const newDrillState = { expandedPhases: new Set(), expandedMilestones: new Set() };
      setDrillState(newDrillState);
      setSelectedTaskId(null);
      setActiveBreadcrumb('Canvas View (Top Level)');

      renderGraph(processed.rawData, newDrillState, null);
      logger.info('File fully processed and valid phase graph rendered');
    } catch (error) {
      logger.error('Error during file processing', error);
      alert(`Failed to parse file: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [renderGraph]);

  const handleBaselineUpload = useCallback(async (file) => {
    logger.info(`App component received baseline file: ${file.name}`);
    setIsProcessing(true);

    try {
      const updatedRawData = await ProjectDataProcessor.processBaselineFile(file, activeData);

      if (isSandboxMode) {
        setSandboxData(updatedRawData);
      } else {
        setRawData(updatedRawData);
      }

      // Re-render graph while keeping drill state
      setDrillState(prev => {
        renderGraph(updatedRawData, prev, selectedTaskId);
        return prev;
      });
      logger.info('Baseline fully merged and graph re-rendered');
    } catch (error) {
      logger.error('Error during baseline processing', error);
      alert(`Failed to parse baseline file: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [activeData, isSandboxMode, selectedTaskId, renderGraph]);

  const handleNodeClick = useCallback((event, node) => {
    if (node.data.nodeType === 'task') {
      setSelectedTaskId(prev => {
        const newSelected = prev === node.id ? null : node.id;
        renderGraph(activeData, drillState, newSelected);
        return newSelected;
      });
      return;
    }

    setDrillState(prev => {
      const newState = {
        expandedPhases: new Set(prev.expandedPhases),
        expandedMilestones: new Set(prev.expandedMilestones)
      };

      if (node.data.nodeType === 'phase') {
        if (newState.expandedPhases.has(node.data.name)) {
          newState.expandedPhases.delete(node.data.name);
          logger.debug(`Collapsed Phase: ${node.data.name}`);
        } else {
          newState.expandedPhases.add(node.data.name);
          logger.debug(`Expanded Phase: ${node.data.name}`);
        }
      } else if (node.data.nodeType === 'milestone') {
        if (newState.expandedMilestones.has(node.data.name)) {
          newState.expandedMilestones.delete(node.data.name);
          logger.debug(`Collapsed Milestone: ${node.data.name}`);
        } else {
          newState.expandedMilestones.add(node.data.name);
          logger.debug(`Expanded Milestone: ${node.data.name}`);
        }
      }

      renderGraph(activeData, newState, selectedTaskId);
      return newState;
    });
  }, [activeData, drillState, selectedTaskId, renderGraph]);

  const onConnect = useCallback((params) => {
    logger.info('Creating new dependency', params);
    const targetDataSetter = isSandboxMode ? setSandboxData : setRawData;
    targetDataSetter(prev => {
      const newData = [...prev];
      // Target task is the one receiving the connection
      const targetTask = newData.find(t => String(t.id) === params.target);
      if (targetTask) {
        const currentDeps = targetTask.dependencies ? String(targetTask.dependencies).split(',').map(d => d.trim()).filter(Boolean) : [];
        if (!currentDeps.includes(params.source)) {
          currentDeps.push(params.source);
          targetTask.dependencies = currentDeps.join(', ');
          logger.debug(`Updated dependencies for task ${targetTask.id}: ${targetTask.dependencies}`);
        }
      }
      // Re-render graph with new data
      setTimeout(() => renderGraph(newData, drillState, selectedTaskId), 0);
      return newData;
    });
  }, [drillState, selectedTaskId, isSandboxMode, renderGraph]);

  const onEdgesDelete = useCallback((edgesToDelete) => {
    logger.info('Deleting edges', edgesToDelete);
    const targetDataSetter = isSandboxMode ? setSandboxData : setRawData;
    targetDataSetter(prev => {
      const newData = prev.map(task => {
        const newTask = { ...task };
        const logicalEdges = edgesToDelete.filter(e => e.id.startsWith('e-logic-'));

        logicalEdges.forEach(edge => {
          if (String(newTask.id) === edge.target) {
            const currentDeps = newTask.dependencies ? String(newTask.dependencies).split(',').map(d => d.trim()).filter(Boolean) : [];
            const filteredDeps = currentDeps.filter(d => d !== edge.source);
            newTask.dependencies = filteredDeps.join(', ');
          }
        });
        return newTask;
      });

      setTimeout(() => renderGraph(newData, drillState, selectedTaskId), 0);
      return newData;
    });
  }, [drillState, selectedTaskId, isSandboxMode, renderGraph]);

  const handleTaskUpdate = useCallback((taskId, dayDelta) => {
    logger.info(`Updating task ${taskId} by ${dayDelta} days`);
    const targetDataSetter = isSandboxMode ? setSandboxData : setRawData;
    targetDataSetter(prev => {
      const newData = prev.map(task => {
        if (String(task.id) === taskId) {
          const newTask = { ...task };

          if (newTask.startDate) {
            const start = new Date(newTask.startDate);
            start.setDate(start.getDate() + dayDelta);
            newTask.startDate = start.toISOString().split('T')[0];
          }

          if (newTask.endDate) {
            const end = new Date(newTask.endDate);
            end.setDate(end.getDate() + dayDelta);
            newTask.endDate = end.toISOString().split('T')[0];
          }

          return newTask;
        }
        return task;
      });

      setTimeout(() => renderGraph(newData, drillState, selectedTaskId), 0);
      return newData;
    });
  }, [drillState, selectedTaskId, isSandboxMode, renderGraph]);

  const handleNodesChange = useCallback((changes) => {
    // Capture manual position changes
    changes.forEach(change => {
      if (change.type === 'position' && change.position) {
        setUserPositions(prev => ({
          ...prev,
          [change.id]: change.position
        }));
      }
    });
    onNodesChange(changes);
  }, [onNodesChange]);

  const handleExportCSV = useCallback(() => {
    ExportService.exportToCSV(activeData, 'project_data_export.csv');
  }, [activeData]);

  const handleExportExcel = useCallback(() => {
    ExportService.exportToExcel(activeData, 'project_data_export.xlsx');
  }, [activeData]);

  const handlePaneClick = useCallback(() => {
    if (selectedTaskId) {
      setSelectedTaskId(null);
      renderGraph(activeData, drillState, null);
    }
  }, [activeData, drillState, selectedTaskId, renderGraph]);

  const handleNodeMouseEnter = useCallback((event, node) => {
    let path = '';
    if (node.data.nodeType === 'phase') {
      path = `Phase: ${node.data.name}`;
    } else if (node.data.nodeType === 'milestone') {
      path = `Phase: ${node.data.phase} > Milestone: ${node.data.name}`;
    } else if (node.data.nodeType === 'task') {
      path = `Phase: ${node.data.phase} > Milestone: ${node.data.milestone} > Task: ${node.data.name}`;
    }
    setActiveBreadcrumb(path || 'Canvas View');
  }, []);

  const handleNodeMouseLeave = useCallback(() => {
    setActiveBreadcrumb('Canvas View');
  }, []);

  // React to Critical Path toggles automatically
  useEffect(() => {
    if (activeData.length > 0) {
      renderGraph(activeData, drillState, selectedTaskId, userPositions, assigneeFilter);
    }
  }, [activeData, drillState, selectedTaskId, showCriticalPath, assigneeFilter, userPositions, renderGraph]);

  const uniqueAssignees = useMemo(() => {
    const assignees = new Set();
    activeData.forEach(task => {
      if (task.assignee) assignees.add(String(task.assignee).trim());
    });
    return Array.from(assignees).filter(Boolean).sort();
  }, [activeData]);

  const filteredData = useMemo(() => {
    if (!assigneeFilter) return activeData;
    return activeData.filter(t => String(t.assignee).trim() === assigneeFilter);
  }, [activeData, assigneeFilter]);

  return (
    <div className="flex h-screen w-full bg-slate-900 overflow-hidden font-sans">
      {/* Sidebar Component */}
      <Sidebar
        onFileUpload={handleFileUpload}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onExportCSV={handleExportCSV}
        onExportExcel={handleExportExcel}
        assignees={uniqueAssignees}
        selectedAssignee={assigneeFilter}
        onAssigneeFilter={setAssigneeFilter}
        onBaselineUpload={handleBaselineUpload}
      />

      {/* Main Canvas Area */}
      <div className="flex-1 relative h-full w-full">
        {/* Header / Breadcrumb Placeholder */}
        <header className="absolute top-0 left-0 w-full h-14 bg-slate-900/80 backdrop-blur border-b border-slate-800 z-10 flex items-center justify-between px-6">
          <h2 className="text-slate-300 font-medium text-sm tracking-wide transition-all duration-300">
            <span className="text-indigo-400">Project</span>
            <span className="mx-2 text-slate-600">/</span>
            <span className="text-slate-400">{isProcessing ? 'Processing Data...' : activeBreadcrumb}</span>
          </h2>

          <div className="flex items-center gap-4">
            {isSandboxMode && (
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest bg-amber-400/10 border border-amber-400/20 px-2 py-1 rounded">
                Sandbox Active
              </span>
            )}
            <button
              onClick={() => {
                if (!isSandboxMode) {
                  setSandboxData(rawData.map(task => ({ ...task })));
                  setIsSandboxMode(true);
                } else {
                  setIsSandboxMode(false);
                  setSandboxData([]);
                  renderGraph(rawData, drillState, selectedTaskId);
                }
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${isSandboxMode ? 'bg-amber-500 text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.5)] hover:bg-amber-400' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            >
              {isSandboxMode ? 'Discard Changes' : 'Sandbox Mode'}
            </button>

            <button
              onClick={() => setShowCriticalPath(prev => !prev)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${showCriticalPath ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            >
              Critical Path {showCriticalPath ? 'On' : 'Off'}
            </button>
          </div>
        </header>

        {/* Main Workspace Area */}
        <div className="pt-14 h-full w-full bg-slate-950 overflow-auto custom-scrollbar">
          {viewMode === 'gantt' ? (
            <GanttChart
              data={filteredData}
              drillState={drillState}
              onTogglePhase={(p) => handleNodeClick(null, { data: { nodeType: 'phase', name: p } })}
              onToggleMilestone={(m) => handleNodeClick(null, { data: { nodeType: 'milestone', name: m } })}
              onTaskUpdate={handleTaskUpdate}
            />
          ) : viewMode === 'resources' ? (
            <div className="p-6">
              <ResourceHeatmap data={filteredData} />
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onEdgesDelete={onEdgesDelete}
              onNodeClick={handleNodeClick}
              onPaneClick={handlePaneClick}
              onNodeMouseEnter={handleNodeMouseEnter}
              onNodeMouseLeave={handleNodeMouseLeave}
              deleteKeyCode={['Backspace', 'Delete']}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              attributionPosition="bottom-right"
              className="dark-theme"
              minZoom={0.1}
              maxZoom={2}
            >
              <Background color="#1e293b" gap={16} size={1} />
              <Controls className="fill-slate-400 text-slate-400 bg-slate-800 border-slate-700 hover:bg-slate-700" />
              <MiniMap
                nodeColor={(n) => {
                  if (n.type === 'customTask') return '#818cf8';
                  return '#cbd5e1';
                }}
                maskColor="rgba(15, 23, 42, 0.7)"
                className="bg-slate-900"
              />
            </ReactFlow>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
