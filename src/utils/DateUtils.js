export class DateUtils {
    /**
     * Parse a date string into a Date object.
     * @param {string|Date} dateStr 
     * @returns {Date}
     */
    static parseDate(dateStr) {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return isFinite(date.getTime()) ? date : null;
    }

    /**
     * Get start and end dates for a task, considering cost/duration if end date is missing.
     * @param {Object} task 
     * @returns {Object} { start, end, startTime, endTime }
     */
    static getTaskBounds(task) {
        let start = this.parseDate(task.startDate) || new Date();
        let end = this.parseDate(task.endDate);

        if (!end && task.cost) {
            // Assume cost is duration in days
            end = new Date(start);
            end.setDate(end.getDate() + parseInt(task.cost, 10));
        } else if (!end) {
            end = new Date(start);
        }

        return {
            start,
            end,
            startTime: start.getTime(),
            endTime: end.getTime()
        };
    }

    /**
     * Get start and end dates for a task's baseline if available.
     * @param {Object} task 
     * @returns {Object|null} { baselineStart, baselineEnd, baselineStartTime, baselineEndTime }
     */
    static getBaselineBounds(task) {
        if (!task.baselineStartDate) return null;
        let start = this.parseDate(task.baselineStartDate);
        if (!start) return null;

        let end = this.parseDate(task.baselineEndDate);
        if (!end && task.baselineCost) {
            end = new Date(start);
            end.setDate(end.getDate() + parseInt(task.baselineCost, 10));
        } else if (!end) {
            end = new Date(start);
        }

        return {
            baselineStart: start,
            baselineEnd: end,
            baselineStartTime: start.getTime(),
            baselineEndTime: end.getTime()
        };
    }

    /**
     * Format date as YYYY-MM-DD
     * @param {Date} date 
     */
    static formatDate(date) {
        if (!date) return '';
        return date.toISOString().split('T')[0];
    }

    /**
     * Get all dates between start and end (inclusive)
     * @param {Date} start 
     * @param {Date} end 
     * @returns {Array<string>} Array of date strings (YYYY-MM-DD)
     */
    static getDateRangeStrings(start, end) {
        const dates = [];
        let current = new Date(start);
        current.setHours(0, 0, 0, 0);
        const finish = new Date(end);
        finish.setHours(0, 0, 0, 0);

        while (current <= finish) {
            dates.push(this.formatDate(current));
            current.setDate(current.getDate() + 1);
        }
        return dates;
    }
}
