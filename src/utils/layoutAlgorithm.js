import { logger } from './logger';

export class LayoutAlgorithm {
    /**
     * Applies custom layout aligning Phases TB and Milestones RL from each Phase.
     */
    static applyLayout(nodes, edges) {
        const traceId = logger.startTrace({ action: 'apply_custom_layout', nodeCount: nodes.length, edgeCount: edges.length });

        try {
            const phaseSpacingY = 150;
            const milestoneSpacingX = 200;
            const taskSpacingY = 80;

            let currentPhaseY = 0;

            const layoutedNodes = [...nodes];

            // Iterate over phases maintaining order
            const phases = layoutedNodes.filter(n => n.data.nodeType === 'phase');

            phases.forEach((phase) => {
                // Only calculate position if not already set (User Override support)
                if (!phase.position || (phase.position.x === 0 && phase.position.y === 0)) {
                    phase.position = { x: 0, y: currentPhaseY };
                }

                const milestones = layoutedNodes.filter(n => n.data.nodeType === 'milestone' && n.data.phase === phase.data.name);

                let currentMilestoneX = milestoneSpacingX;
                let maxTaskYForPhase = phase.position.y;

                milestones.forEach((milestone) => {
                    if (!milestone.position || (milestone.position.x === 0 && milestone.position.y === 0)) {
                        milestone.position = { x: currentMilestoneX, y: phase.position.y };
                    }

                    const tasks = layoutedNodes.filter(n => n.data.nodeType === 'task' && n.data.milestone === milestone.data.name && n.data.phase === phase.data.name);

                    let currentTaskY = milestone.position.y + taskSpacingY;

                    tasks.forEach((task) => {
                        if (!task.position || (task.position.x === 0 && task.position.y === 0)) {
                            task.position = { x: milestone.position.x, y: currentTaskY };
                        }
                        currentTaskY += taskSpacingY;
                    });

                    if (currentTaskY > maxTaskYForPhase) {
                        maxTaskYForPhase = currentTaskY;
                    }

                    currentMilestoneX += milestoneSpacingX;
                });

                // Advance Y position for the next phase
                currentPhaseY = Math.max(currentPhaseY, maxTaskYForPhase) + phaseSpacingY;
            });

            // 3. Physical Routing Refinements: Tracking for Bundling and Offsets
            const intraMilestoneCounts = {}; // Track how many left-side connections per group
            const milestonePairEdges = {};   // Track edges between same milestone pairs

            // Dynamically route edges to use the shortest straight-line distance handles
            const layoutedEdges = edges.map(edge => {
                // We only dynamically route the logical dependency connections, leave rigid structural edges alone.
                if (!edge.id.startsWith('e-logic-')) return edge;

                const sourceNode = layoutedNodes.find(n => n.id === edge.source);
                const targetNode = layoutedNodes.find(n => n.id === edge.target);

                if (!sourceNode || !targetNode) return edge;

                const sPos = sourceNode.position;
                const tPos = targetNode.position;

                // SPECIAL RULE: Intra-milestone dependencies use the LEFT side to connect
                // This applies to logical edges (e-logic-*) between tasks/milestones in the same group.
                const sameMilestone = sourceNode.data.milestone === targetNode.data.milestone &&
                    sourceNode.data.phase === targetNode.data.phase;

                // Define semantic colors based on User Suggestions
                const COLORS = {
                    INTRA_GROUP: '#22d3ee', // Cyan 400 (Tasks within same Milestone)
                    INTER_GROUP: '#fbbf24', // Yellow 400 (Crosses Milestone or Phase)
                };

                // Use vibrancy and distinct line styles
                let edgeColor = COLORS.INTER_GROUP;
                let strokeDasharray = sameMilestone ? '0 0' : '5 5'; // Solid for Intra, Dashed for Inter-group transitions

                // Get color from Source Node Theme (Source-Based Coloring)
                const getSourceColor = (node) => {
                    if (node.data.nodeType === 'task') return '#22d3ee'; // Cyan 400
                    if (node.data.nodeType === 'phase') return '#818cf8'; // Indigo 400
                    if (node.data.nodeType === 'milestone') return '#fb923c'; // Orange 400
                    return '#94a3b8';
                };

                // Final color decision: User preferred Cyan/Yellow, 
                // but let's blend with Source-Based Coloring:
                // If it's inter-group, the Yellow stands out. If it's intra-group, it follows the source theme (Cyan).
                const sourceColor = getSourceColor(sourceNode);
                edgeColor = sameMilestone ? sourceColor : COLORS.INTER_GROUP;

                if (sameMilestone) {
                    const ctxKey = `${sourceNode.data.phase}-${sourceNode.data.milestone}`;
                    const edgeIndex = intraMilestoneCounts[ctxKey] || 0;
                    intraMilestoneCounts[ctxKey] = edgeIndex + 1;
                    const busOffset = 10 + (edgeIndex * 5); // 10px, 15px, 20px...

                    const distance = Math.abs(targetNode.position.y - sourceNode.position.y) + busOffset;

                    return {
                        ...edge,
                        sourceHandle: 'left-source',
                        targetHandle: 'left-target',
                        type: 'smart', // Custom routing for offsets/bundling
                        // Pass the custom offset to the edge data for potential custom edge usage
                        // or use it in the path calculation if we were fully custom.
                        // For now, we'll use it to slightly vary the strokeWidth or add to data.
                        data: { ...edge.data, busOffset, routingType: 'intra', distance },
                        style: { ...edge.style, stroke: edgeColor, strokeWidth: 2, strokeDasharray },
                        markerEnd: { ...edge.markerEnd, color: edgeColor }
                    };
                }

                // Prepare for Edge Bundling logic
                const sourceM = sourceNode.data.milestone ? `m-${sourceNode.data.phase}-${sourceNode.data.milestone}` : sourceNode.id;
                const targetM = targetNode.data.milestone ? `m-${targetNode.data.phase}-${targetNode.data.milestone}` : targetNode.id;
                if (sourceM !== targetM) {
                    const bundleKey = `${sourceM}->${targetM}`;
                    milestonePairEdges[bundleKey] = (milestonePairEdges[bundleKey] || 0) + 1;
                    edge.data = { ...edge.data, bundleIndex: milestonePairEdges[bundleKey], bundleKey };
                }

                // Node dimensions are approx 105 width by 55 height. 
                const anchors = {
                    top: { offset: { x: 52, y: 0 }, id: 'top' },
                    bottom: { offset: { x: 52, y: 55 }, id: 'bottom' },
                    left: { offset: { x: 0, y: 27 }, id: 'left' },
                    right: { offset: { x: 105, y: 27 }, id: 'right' }
                };

                let minDistance = Infinity;
                let bestSource = edge.sourceHandle || 'right-source';
                let bestTarget = edge.targetHandle || 'left-target';

                for (const sKey of Object.keys(anchors)) {
                    for (const tKey of Object.keys(anchors)) {
                        const sx = sPos.x + anchors[sKey].offset.x;
                        const sy = sPos.y + anchors[sKey].offset.y;
                        const tx = tPos.x + anchors[tKey].offset.x;
                        const ty = tPos.y + anchors[tKey].offset.y;

                        const dist = Math.sqrt(Math.pow(tx - sx, 2) + Math.pow(ty - sy, 2));
                        if (dist < minDistance) {
                            minDistance = dist;
                            bestSource = `${sKey}-source`;
                            bestTarget = `${tKey}-target`;
                        }
                    }
                }

                // Final Styling: Use importance for line weight
                const baseWidth = edge.data?.importance ? (1.5 + edge.data.importance * 0.5) : 2;
                const finalStrokeWidth = sameMilestone ? 2 : baseWidth; // Keep intra-milestone consistent

                return {
                    ...edge,
                    type: 'smart',
                    sourceHandle: bestSource,
                    targetHandle: bestTarget,
                    data: { ...edge.data, distance: minDistance },
                    style: { ...edge.style, stroke: edgeColor, strokeWidth: finalStrokeWidth, strokeDasharray },
                    markerEnd: { ...edge.markerEnd, color: edgeColor }
                };
            });

            logger.info('Custom layout and dynamic shortest-path routing completed successfully', { traceId });
            return { nodes: layoutedNodes, edges: layoutedEdges };
        } catch (error) {
            logger.error('Custom layout algorithm failed', error);
            return { nodes, edges };
        } finally {
            logger.endTrace();
        }
    }
}
