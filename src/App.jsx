import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css'; // Essential ReactFlow styles
import Sidebar from './components/Sidebar';
import CustomNode from './components/CustomNode';
import { logger } from './utils/logger';
import { ProjectDataProcessor } from './utils/projectDataProcessor';
import { LayoutAlgorithm } from './utils/layoutAlgorithm';
import { VisibilityManager } from './utils/visibilityManager';

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

const App = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rawData, setRawData] = useState([]);

  // Phase 3: Derived State Engine
  const [drillState, setDrillState] = useState({
    expandedPhases: new Set(),
    expandedMilestones: new Set(),
  });
  const [activeBreadcrumb, setActiveBreadcrumb] = useState('Waiting for Data...');

  // Core Render Flow using Derived State Pattern
  const renderGraph = useCallback((data, currentDrillState) => {
    logger.info('Deriving graph render from state...');
    const { nodes: visibleNodes, edges: visibleEdges } = VisibilityManager.deriveGraph(data, currentDrillState);
    const { nodes: layoutedNodes, edges: layoutedEdges } = LayoutAlgorithm.applyLayout(visibleNodes, visibleEdges);

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [setNodes, setEdges]);

  const handleFileUpload = useCallback(async (file) => {
    logger.info(`App component received file: ${file.name}`);
    setIsProcessing(true);

    try {
      const processed = await ProjectDataProcessor.processFile(file);
      setRawData(processed.rawData);

      // Initial Load: All collapsed
      const newDrillState = { expandedPhases: new Set(), expandedMilestones: new Set() };
      setDrillState(newDrillState);
      setActiveBreadcrumb('Canvas View (Top Level)');

      renderGraph(processed.rawData, newDrillState);
      logger.info('File fully processed and valid phase graph rendered');
    } catch (error) {
      logger.error('Error during file processing', error);
      alert(`Failed to parse file: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [renderGraph]);

  const handleNodeClick = useCallback((event, node) => {
    if (node.data.nodeType === 'task') return; // Tasks do not expand

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

      renderGraph(rawData, newState);
      return newState;
    });
  }, [rawData, renderGraph]);

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

  return (
    <div className="flex h-screen w-full bg-slate-900 overflow-hidden font-sans">
      {/* Sidebar Component */}
      <Sidebar onFileUpload={handleFileUpload} />

      {/* Main Canvas Area */}
      <div className="flex-1 relative h-full w-full">
        {/* Header / Breadcrumb Placeholder */}
        <header className="absolute top-0 left-0 w-full h-14 bg-slate-900/80 backdrop-blur border-b border-slate-800 z-10 flex items-center px-6">
          <h2 className="text-slate-300 font-medium text-sm tracking-wide transition-all duration-300">
            <span className="text-indigo-400">Project</span>
            <span className="mx-2 text-slate-600">/</span>
            <span className="text-slate-400">{isProcessing ? 'Processing Data...' : activeBreadcrumb}</span>
          </h2>
        </header>

        {/* ReactFlow Canvas */}
        <div className="pt-14 h-full w-full bg-slate-950">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            onNodeMouseEnter={handleNodeMouseEnter}
            onNodeMouseLeave={handleNodeMouseLeave}
            nodeTypes={nodeTypes}
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
        </div>
      </div>
    </div>
  );
};

export default App;
