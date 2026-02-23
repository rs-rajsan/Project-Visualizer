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

            logger.info('Custom layout applied successfully', { traceId });
            return { nodes: layoutedNodes, edges };
        } catch (error) {
            logger.error('Custom layout algorithm failed', error);
            return { nodes, edges };
        } finally {
            logger.endTrace();
        }
    }
}
