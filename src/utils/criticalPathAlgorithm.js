import { logger } from './logger';

export class CriticalPathAlgorithm {
    /**
     * Calculates the critical path for a given set of raw tasks.
     * Uses Forward Pass and Backward Pass to determine task slack.
     * @param {Array<Object>} rawData 
     * @returns {Object} { criticalTaskIds: Set<string>, criticalEdges: Set<string> }
     */
    static calculate(rawData) {
        const traceId = logger.startTrace({ action: 'cpm_calculate' });

        try {
            const tasks = {};
            const predecessors = {};
            const successors = {};

            // Initialize data structures
            rawData.forEach(task => {
                const id = String(task.id).trim();
                const cost = parseFloat(task.cost) || 1; // Default to 1 if no valid duration

                tasks[id] = { id, cost, ES: 0, EF: 0, LS: 0, LF: 0, slack: 0 };
                predecessors[id] = new Set();
                successors[id] = new Set();
            });

            // Map dependencies
            rawData.forEach(task => {
                const targetId = String(task.id).trim();
                if (task.dependencies) {
                    const deps = String(task.dependencies).split(',').map(d => d.trim()).filter(Boolean);
                    deps.forEach(sourceId => {
                        if (tasks[sourceId]) {
                            predecessors[targetId].add(sourceId);
                            successors[sourceId].add(targetId);
                        }
                    });
                }
            });

            // Topological Sort
            const inDegree = {};
            const queue = [];
            const sortedNodes = [];

            Object.keys(tasks).forEach(id => {
                inDegree[id] = predecessors[id].size;
                if (inDegree[id] === 0) {
                    queue.push(id);
                }
            });

            while (queue.length > 0) {
                const current = queue.shift();
                sortedNodes.push(current);

                successors[current].forEach(succ => {
                    inDegree[succ]--;
                    if (inDegree[succ] === 0) {
                        queue.push(succ);
                    }
                });
            }

            if (sortedNodes.length !== Object.keys(tasks).length) {
                logger.warn('Cyclic dependency detected! CPM might skip nodes.', { traceId });
                // Fallback: return empty sets to prevent hard crashes
                return { criticalTaskIds: new Set(), criticalEdges: new Set() };
            }

            // Forward Pass: Calculate Early Start (ES) and Early Finish (EF)
            sortedNodes.forEach(id => {
                let maxES = 0;
                predecessors[id].forEach(pred => {
                    if (tasks[pred].EF > maxES) {
                        maxES = tasks[pred].EF;
                    }
                });
                tasks[id].ES = maxES;
                tasks[id].EF = maxES + tasks[id].cost;
            });

            // Find project duration
            let projectDuration = 0;
            Object.values(tasks).forEach(t => {
                if (t.EF > projectDuration) {
                    projectDuration = t.EF;
                }
            });

            // Backward Pass: Calculate Late Finish (LF) and Late Start (LS)
            // Reverse topological order
            for (let i = sortedNodes.length - 1; i >= 0; i--) {
                const id = sortedNodes[i];
                let minLF = projectDuration;

                if (successors[id].size > 0) {
                    minLF = Infinity;
                    successors[id].forEach(succ => {
                        if (tasks[succ].LS < minLF) {
                            minLF = tasks[succ].LS;
                        }
                    });
                }

                tasks[id].LF = minLF;
                tasks[id].LS = minLF - tasks[id].cost;
                tasks[id].slack = tasks[id].LS - tasks[id].ES;
            }

            // Identify Critical Path
            const criticalTaskIds = new Set();
            const criticalEdges = new Set();

            Object.values(tasks).forEach(t => {
                // To mitigate floating point issues, use a small epsilon
                if (Math.abs(t.slack) < 0.001) {
                    criticalTaskIds.add(t.id);
                }
            });

            // Identify exactly which edges connect the critical path cleanly
            Object.keys(tasks).forEach(targetId => {
                if (criticalTaskIds.has(targetId)) {
                    predecessors[targetId].forEach(sourceId => {
                        if (criticalTaskIds.has(sourceId)) {
                            // Check if this edge is strictly the driving path
                            if (Math.abs(tasks[sourceId].EF - tasks[targetId].ES) < 0.001) {
                                criticalEdges.add(`e-logic-${sourceId}-${targetId}`);
                            }
                        }
                    });
                }
            });

            logger.info(`CPM calculated. ${criticalTaskIds.size} critical tasks found.`, { traceId });
            return { criticalTaskIds, criticalEdges };
        } catch (error) {
            logger.error('CPM Algorithm Failed', error);
            return { criticalTaskIds: new Set(), criticalEdges: new Set() };
        } finally {
            logger.endTrace();
        }
    }
}
