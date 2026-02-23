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
                phase.position = { x: 0, y: currentPhaseY };

                const milestones = layoutedNodes.filter(n => n.data.nodeType === 'milestone' && n.data.phase === phase.data.name);

                let currentMilestoneX = milestoneSpacingX;
                let maxTaskYForPhase = currentPhaseY;

                milestones.forEach((milestone) => {
                    milestone.position = { x: currentMilestoneX, y: currentPhaseY };

                    const tasks = layoutedNodes.filter(n => n.data.nodeType === 'task' && n.data.milestone === milestone.data.name && n.data.phase === phase.data.name);

                    let currentTaskY = currentPhaseY + taskSpacingY;

                    tasks.forEach((task) => {
                        task.position = { x: currentMilestoneX, y: currentTaskY };
                        currentTaskY += taskSpacingY;
                    });

                    if (currentTaskY > maxTaskYForPhase) {
                        maxTaskYForPhase = currentTaskY;
                    }

                    currentMilestoneX += milestoneSpacingX;
                });

                // Advance Y position for the next phase to be below the lowest task or milestone of this phase
                currentPhaseY = maxTaskYForPhase + phaseSpacingY;
            });

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
                const sameContext = sourceNode.data.milestone === targetNode.data.milestone &&
                    sourceNode.data.phase === targetNode.data.phase;

                if (sameContext) {
                    return {
                        ...edge,
                        sourceHandle: 'left-source',
                        targetHandle: 'left-target',
                        type: 'smoothstep', // Create a curved loop on the left
                        style: { ...edge.style, strokeWidth: 2 }
                    };
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

                return {
                    ...edge,
                    sourceHandle: bestSource,
                    targetHandle: bestTarget
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
