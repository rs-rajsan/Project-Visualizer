import { logger } from './logger';
import { DateUtils } from './DateUtils';

export class WorkloadManager {
    /**
     * Calculates daily workload per assignee.
     * @param {Array<Object>} tasks - Standardized task data
     * @returns {Object} { assigneeStats: Object, allDates: Array<string> }
     */
    static calculateDailyWorkload(tasks) {
        const traceId = logger.startTrace({ action: 'calculate_workload', taskCount: tasks.length });
        try {
            const assigneeStats = {};
            let globalEarliest = Infinity;
            let globalLatest = -Infinity;

            // 1. Calculate individual task loads and track date bounds
            tasks.forEach(task => {
                const assignee = task.assignee || 'Unassigned';
                const bounds = DateUtils.getTaskBounds(task);

                if (bounds.startTime < globalEarliest) globalEarliest = bounds.startTime;
                if (bounds.endTime > globalLatest) globalLatest = bounds.endTime;

                const days = DateUtils.getDateRangeStrings(bounds.start, bounds.end);
                const loadPerDay = 1 / (days.length || 1); // Simple load model: 1 unit distributed over duration

                if (!assigneeStats[assignee]) {
                    assigneeStats[assignee] = {
                        totalTasks: 0,
                        dailyLoad: {} // Date string -> Load value
                    };
                }

                assigneeStats[assignee].totalTasks += 1;
                days.forEach(dayStr => {
                    assigneeStats[assignee].dailyLoad[dayStr] = (assigneeStats[assignee].dailyLoad[dayStr] || 0) + loadPerDay;
                });
            });

            // 2. Generate all dates in project scope for visualization consistency
            const allDates = (globalEarliest === Infinity)
                ? []
                : DateUtils.getDateRangeStrings(new Date(globalEarliest), new Date(globalLatest));

            logger.info('Workload calculation completed', { traceId, assigneeCount: Object.keys(assigneeStats).length });
            return { assigneeStats, allDates };

        } catch (error) {
            logger.error('Failed to calculate daily workload', error);
            return { assigneeStats: {}, allDates: [] };
        } finally {
            logger.endTrace();
        }
    }
}
