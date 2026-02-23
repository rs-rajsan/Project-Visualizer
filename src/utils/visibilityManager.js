import { logger } from './logger';
import { MarkerType } from 'reactflow';

export class VisibilityManager {
    /**
     * Derives visible nodes and edges based on raw standardized data and expansion state.
     * @param {Array<Object>} rawData 
     * @param {Object} drillState - { expandedPhases: Set<string>, expandedMilestones: Set<string> }
     * @returns {Object} { nodes, edges }
     */
    static deriveGraph(rawData, drillState) {
        const traceId = logger.startTrace({ action: 'derive_graph' });

        try {
            const nodes = [];
            const edges = [];

            // Group data by Phase -> Milestone -> Task
            const phases = {};
            const ungroupedTasks = [];

            rawData.forEach(task => {
                const phaseName = task.phase || 'Unphased';
                const milestoneName = task.milestone || 'Unmilestoned';

                if (!phases[phaseName]) {
                    phases[phaseName] = { name: phaseName, id: `phase-${phaseName}`, milestones: {} };
                }

                if (!phases[phaseName].milestones[milestoneName]) {
                    phases[phaseName].milestones[milestoneName] = {
                        name: milestoneName,
                        id: `milestone-${phaseName}-${milestoneName}`,
                        tasks: []
                    };
                }

                phases[phaseName].milestones[milestoneName].tasks.push(task);
            });

            // Create visible elements
            const phaseList = Object.values(phases);
            phaseList.forEach((phase, pIndex) => {
                const isPhaseExpanded = drillState.expandedPhases.has(phase.name);

                // Add Phase Node
                nodes.push({
                    id: phase.id,
                    type: 'customTask',
                    data: {
                        id: phase.id,
                        name: phase.name,
                        label: phase.name,
                        phase: 'Phase',
                        isExpanded: isPhaseExpanded,
                        nodeType: 'phase',
                        childCount: Object.keys(phase.milestones).length
                    },
                    position: { x: 0, y: 0 }
                });

                // Link phases sequentially for structural backbone
                if (pIndex > 0) {
                    const prevPhase = phaseList[pIndex - 1];
                    edges.push({
                        id: `e-struct-${prevPhase.id}-${phase.id}`,
                        source: prevPhase.id,
                        target: phase.id,
                        sourceHandle: 'bottom-source',
                        targetHandle: 'top-target',
                        type: 'straight',
                        style: { stroke: '#475569', strokeWidth: 2, strokeDasharray: '3 3' },
                        markerEnd: { type: MarkerType.ArrowClosed, color: '#475569' },
                        animated: false
                    });
                }

                if (isPhaseExpanded) {
                    Object.values(phase.milestones).forEach((milestone, mIndex) => {
                        const isMilestoneExpanded = drillState.expandedMilestones.has(milestone.name);

                        // Add Milestone Node
                        nodes.push({
                            id: milestone.id,
                            type: 'customTask',
                            data: {
                                id: milestone.id,
                                name: milestone.name,
                                label: milestone.name,
                                milestone: milestone.name,
                                phase: phase.name,
                                isExpanded: isMilestoneExpanded,
                                nodeType: 'milestone',
                                childCount: milestone.tasks.length
                            },
                            position: { x: 0, y: 0 }
                        });

                        // Structural Edge from Phase to Milestone
                        edges.push({
                            id: `e-${phase.id}-${milestone.id}`,
                            source: phase.id,
                            target: milestone.id,
                            sourceHandle: 'right-source',
                            targetHandle: 'left-target',
                            type: 'straight',
                            style: { stroke: '#818cf8', strokeWidth: 2, strokeDasharray: '5 5' },
                            markerEnd: { type: MarkerType.ArrowClosed, color: '#818cf8' },
                            animated: false
                        });

                        if (isMilestoneExpanded) {
                            milestone.tasks.forEach(task => {
                                // Add Task Node
                                nodes.push({
                                    id: String(task.id),
                                    type: 'customTask',
                                    data: {
                                        ...task,
                                        label: task.name,
                                        nodeType: 'task'
                                    },
                                    position: { x: 0, y: 0 }
                                });

                                // Structural Edge from Milestone to Task
                                edges.push({
                                    id: `e-${milestone.id}-${task.id}`,
                                    source: milestone.id,
                                    target: String(task.id),
                                    sourceHandle: 'bottom-source',
                                    targetHandle: 'top-target',
                                    type: 'straight',
                                    style: { stroke: '#fb923c', strokeWidth: 2, strokeDasharray: '5 5' },
                                    markerEnd: { type: MarkerType.ArrowClosed, color: '#fb923c' },
                                    animated: false
                                });
                            });
                        }
                    });
                }
            });

            // Logical Dependencies between active nodes
            const visibleTaskIds = new Set(nodes.filter(n => n.data.nodeType === 'task').map(n => n.id));
            const milestoneSummaryLinks = new Set();

            rawData.forEach(task => {
                if (!visibleTaskIds.has(String(task.id))) return;

                const depsRaw = task.dependencies;
                if (depsRaw) {
                    const deps = String(depsRaw).split(',').map(d => d.trim()).filter(Boolean);
                    deps.forEach(sourceId => {
                        if (visibleTaskIds.has(sourceId)) {
                            const sourceTask = rawData.find(t => String(t.id) === sourceId);
                            const isCrossMilestone = sourceTask && sourceTask.milestone !== task.milestone;

                            const importance = task.cost ? Math.min(5, Math.max(1, parseInt(task.cost, 10) / 10)) : 1;

                            edges.push({
                                id: `e-logic-${sourceId}-${task.id}`,
                                source: sourceId,
                                target: String(task.id),
                                sourceHandle: 'right-source',
                                targetHandle: 'right-target',
                                type: 'smart', // Use custom SmartEdge
                                animated: false,
                                data: {
                                    isMilestoneBlocker: isCrossMilestone,
                                    importance,
                                    isSummary: false
                                },
                                style: { stroke: '#94a3b8', strokeWidth: 2 },
                                markerEnd: {
                                    type: isCrossMilestone ? MarkerType.Arrow : MarkerType.ArrowClosed,
                                    color: '#94a3b8'
                                }
                            });

                            // Summary Links logic
                            if (isCrossMilestone && sourceTask.milestone && task.milestone) {
                                const sMId = `milestone-${sourceTask.phase || 'Unphased'}-${sourceTask.milestone}`;
                                const tMId = `milestone-${task.phase || 'Unphased'}-${task.milestone}`;
                                const sKey = `${sMId}->${tMId}`;

                                if (!milestoneSummaryLinks.has(sKey)) {
                                    milestoneSummaryLinks.add(sKey);
                                    edges.push({
                                        id: `e-summary-${sKey}`,
                                        source: sMId,
                                        target: tMId,
                                        sourceHandle: 'right-source',
                                        targetHandle: 'left-target',
                                        type: 'smart',
                                        data: { isSummary: true },
                                        style: { stroke: '#fbbf24', strokeWidth: 4 },
                                        markerEnd: { type: MarkerType.ArrowClosed, color: '#fbbf24' }
                                    });
                                }
                            }
                        }
                    });
                }
            });

            logger.info(`Derived graph: ${nodes.length} nodes, ${edges.length} edges`, { traceId });
            return { nodes, edges };
        } catch (error) {
            logger.error('Failed to derive graph', error);
            return { nodes: [], edges: [] };
        } finally {
            logger.endTrace();
        }
    }

    /**
     * Calculates the active path (precursors and successors) for a given taskId.
     * Uses BFS traversal through logic edges.
     */
    static calculateTrace(nodes, edges, activeTaskId) {
        const activeNodes = new Set([activeTaskId]);
        const activeEdges = new Set();

        let added = true;
        while (added) {
            added = false;
            edges.forEach(edge => {
                if (edge.id.startsWith('e-logic-')) {
                    if (activeNodes.has(edge.source) && !activeNodes.has(edge.target)) {
                        activeNodes.add(edge.target);
                        activeEdges.add(edge.id);
                        added = true;
                    } else if (activeNodes.has(edge.target) && !activeNodes.has(edge.source)) {
                        activeNodes.add(edge.source);
                        activeEdges.add(edge.id);
                        added = true;
                    } else if (activeNodes.has(edge.source) && activeNodes.has(edge.target)) {
                        if (!activeEdges.has(edge.id)) {
                            activeEdges.add(edge.id);
                            added = true;
                        }
                    }
                }
            });
        }

        return { activeNodes, activeEdges };
    }
}
