import React, { useMemo, useState, useCallback } from 'react';
import clsx from 'clsx';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { logger } from '../utils/logger';
import { DateUtils } from '../utils/DateUtils';

export const GanttChart = ({ data, drillState, onTogglePhase, onToggleMilestone, onTaskUpdate }) => {
    const [dragInfo, setDragInfo] = useState(null); // { id, startX, currentX }

    // 1. Process Data & Calculate Bounds
    const { items, minDate, maxDate } = useMemo(() => {
        logger.startTrace({ action: 'process_gantt_data', rowCount: data.length });
        try {
            let earliest = new Date('2099-01-01').getTime();
            let latest = new Date('1970-01-01').getTime();

            const tasksWithDates = data.map(task => {
                const bounds = DateUtils.getTaskBounds(task);
                const baselineBounds = DateUtils.getBaselineBounds(task);

                const startTime = bounds.startTime;
                const endTime = bounds.endTime;

                if (!isNaN(startTime) && startTime < earliest) earliest = startTime;
                if (!isNaN(endTime) && endTime > latest) latest = endTime;

                if (baselineBounds) {
                    if (!isNaN(baselineBounds.baselineStartTime) && baselineBounds.baselineStartTime < earliest) earliest = baselineBounds.baselineStartTime;
                    if (!isNaN(baselineBounds.baselineEndTime) && baselineBounds.baselineEndTime > latest) latest = baselineBounds.baselineEndTime;
                }

                return { ...task, ...bounds, ...(baselineBounds || {}) };
            });

            if (earliest > latest) {
                earliest = new Date().getTime();
                latest = earliest + (7 * 24 * 60 * 60 * 1000); // 1 week default
            } else {
                // Add a padding of 2 days on each side
                earliest -= (2 * 24 * 60 * 60 * 1000);
                latest += (2 * 24 * 60 * 60 * 1000);
            }

            // 2. Group into Rows to honor drillState
            const rows = [];
            const phases = {};

            tasksWithDates.forEach(task => {
                const pName = task.phase || 'Unphased';
                const mName = task.milestone || 'Unmilestoned';
                if (!phases[pName]) phases[pName] = { name: pName, milestones: {}, min: Infinity, max: -Infinity };
                if (!phases[pName].milestones[mName]) phases[pName].milestones[mName] = { name: mName, tasks: [], min: Infinity, max: -Infinity };
                phases[pName].milestones[mName].tasks.push(task);

                // Compute phase & milestone boundaries
                if (task.startTime < phases[pName].min) phases[pName].min = task.startTime;
                if (task.endTime > phases[pName].max) phases[pName].max = task.endTime;
                if (task.startTime < phases[pName].milestones[mName].min) phases[pName].milestones[mName].min = task.startTime;
                if (task.endTime > phases[pName].milestones[mName].max) phases[pName].milestones[mName].max = task.endTime;
            });

            // Flatten into rows based on drillState visibility
            Object.values(phases).forEach(phase => {
                rows.push({
                    id: `p-${phase.name}`,
                    type: 'phase',
                    name: phase.name,
                    startTime: phase.min,
                    endTime: phase.max,
                    isExpanded: drillState.expandedPhases.has(phase.name)
                });

                if (drillState.expandedPhases.has(phase.name)) {
                    Object.values(phase.milestones).forEach(milestone => {
                        rows.push({
                            id: `m-${phase.name}-${milestone.name}`,
                            type: 'milestone',
                            name: milestone.name,
                            phase: phase.name,
                            startTime: milestone.min,
                            endTime: milestone.max,
                            isExpanded: drillState.expandedMilestones.has(milestone.name)
                        });

                        if (drillState.expandedMilestones.has(milestone.name)) {
                            milestone.tasks.forEach(task => {
                                rows.push({
                                    id: `t-${task.id}`,
                                    type: 'task',
                                    name: task.name,
                                    startTime: task.startTime,
                                    endTime: task.endTime,
                                    progress: task.progress,
                                    baselineStartTime: task.baselineStartTime,
                                    baselineEndTime: task.baselineEndTime
                                });
                            });
                        }
                    });
                }
            });

            return { items: rows, minDate: earliest, maxDate: latest };
        } catch (error) {
            logger.error('Failed to process Gantt data', error);
            return { items: [], minDate: new Date().getTime(), maxDate: new Date().getTime() };
        } finally {
            logger.endTrace();
        }
    }, [data, drillState]);

    const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));
    const dayWidth = 40; // Pixels per day
    const chartWidth = totalDays * dayWidth;

    const handleMouseDown = (e, item) => {
        if (item.type !== 'task') return;
        setDragInfo({
            id: item.id,
            startX: e.clientX,
            currentX: e.clientX
        });
    };

    const handleMouseMove = useCallback((e) => {
        if (!dragInfo) return;
        setDragInfo(prev => ({ ...prev, currentX: e.clientX }));
    }, [dragInfo]);

    const handleMouseUp = useCallback(() => {
        if (!dragInfo) return;

        const deltaX = dragInfo.currentX - dragInfo.startX;
        const dayDelta = Math.round(deltaX / dayWidth);

        if (dayDelta !== 0) {
            // Find the task ID (strip the 't-' prefix we added in rows flatten)
            const taskId = dragInfo.id.replace('t-', '');
            onTaskUpdate(taskId, dayDelta);
        }

        setDragInfo(null);
    }, [dragInfo, onTaskUpdate]);

    const getBaselineStyles = (item) => {
        if (!isFinite(item.baselineStartTime) || !isFinite(item.baselineEndTime)) return null;
        let left = ((item.baselineStartTime - minDate) / (1000 * 60 * 60 * 24)) * dayWidth;
        let width = Math.max(((item.baselineEndTime - item.baselineStartTime) / (1000 * 60 * 60 * 24)) * dayWidth, 10);
        return { left: `${left}px`, width: `${width}px` };
    };

    const getPositionStyles = (item) => {
        const startTime = item.startTime;
        const endTime = item.endTime;

        let left = ((startTime - minDate) / (1000 * 60 * 60 * 24)) * dayWidth;
        let width = Math.max(((endTime - startTime) / (1000 * 60 * 60 * 24)) * dayWidth, 10);

        if (dragInfo && dragInfo.id === item.id) {
            const dragDelta = dragInfo.currentX - dragInfo.startX;
            left += dragDelta;
        }

        return { left: `${left}px`, width: `${width}px` };
    };

    // Generate an array of dates for the header
    const headerDates = useMemo(() => {
        const dates = [];
        let current = new Date(minDate);
        for (let i = 0; i < totalDays; i++) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        return dates;
    }, [minDate, totalDays]);

    if (data.length === 0) {
        return <div className="p-8 text-slate-400">Waiting for data to render Gantt View...</div>;
    }

    return (
        <div className="flex h-full w-full bg-slate-900 overflow-hidden text-sm">
            {/* Sidebar - Task List */}
            <div className="w-80 border-r border-slate-700 bg-slate-800 flex-shrink-0 flex flex-col z-20">
                <div className="h-12 border-b border-slate-700 flex items-center px-4 font-bold text-slate-300 bg-slate-800/90 shadow sticky top-0">
                    Task Name
                </div>
                <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar">
                    {items.map((item) => (
                        <div
                            key={`${item.id}-list`}
                            className={clsx(
                                "h-10 border-b border-slate-700/50 flex items-center px-2 cursor-pointer transition-colors hover:bg-slate-700/50",
                                item.type === 'phase' ? 'bg-slate-800 font-bold text-indigo-300' :
                                    item.type === 'milestone' ? 'bg-slate-800/80 font-semibold text-orange-300 pl-6' :
                                        'text-slate-200 pl-10 text-xs'
                            )}
                            onClick={() => {
                                if (item.type === 'phase') onTogglePhase(item.name);
                                if (item.type === 'milestone') onToggleMilestone(item.name);
                            }}
                        >
                            {item.type !== 'task' && (
                                <div className="mr-2">
                                    {item.isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </div>
                            )}
                            <span className="truncate">{item.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Gantt Canvas */}
            <div
                className="flex-1 overflow-auto bg-slate-950 relative hide-scrollbar select-none"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div style={{ width: `${chartWidth}px` }}>
                    {/* Timeline Header */}
                    <div className="h-12 border-b border-slate-700 bg-slate-900/90 shadow sticky top-0 z-10 flex">
                        {headerDates.map((date, i) => {
                            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                            return (
                                <div
                                    key={i}
                                    className={clsx(
                                        "flex-shrink-0 flex flex-col items-center justify-center border-r border-slate-800/50 text-[10px]",
                                        isWeekend ? 'bg-slate-800/30 text-slate-500' : 'text-slate-400'
                                    )}
                                    style={{ width: `${dayWidth}px` }}
                                >
                                    <span className="font-bold">{date.getDate()}</span>
                                    <span>{date.toLocaleDateString('en-US', { month: 'short' })}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Grid and Bars */}
                    <div className="relative">
                        {/* Background Grid */}
                        <div className="absolute top-0 left-0 h-full flex pointer-events-none">
                            {headerDates.map((date, i) => {
                                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                return (
                                    <div
                                        key={`grid-${i}`}
                                        className={clsx(
                                            "flex-shrink-0 border-r border-slate-800/20",
                                            isWeekend ? 'bg-slate-800/10' : ''
                                        )}
                                        style={{ width: `${dayWidth}px` }}
                                    />
                                );
                            })}
                        </div>

                        {/* Task Rows */}
                        {items.map((item) => {
                            const baselineStyles = getBaselineStyles(item);

                            // Check if overdue against baseline
                            let isDelayed = false;
                            if (item.type === 'task' && baselineStyles && isFinite(item.endTime)) {
                                if (item.endTime > item.baselineEndTime) {
                                    isDelayed = true;
                                }
                            }

                            return (
                                <div key={`${item.id}-bar`} className="h-10 border-b border-transparent relative group hover:bg-slate-800/20 transition-colors">
                                    {/* Baseline Shadow Block */}
                                    {baselineStyles && (
                                        <div
                                            className={clsx(
                                                "absolute top-1/2 -mt-3.5 h-[3px] rounded-sm opacity-50 pointer-events-none",
                                                item.type === 'phase' ? 'bg-indigo-300' :
                                                    item.type === 'milestone' ? 'bg-orange-300' :
                                                        'bg-slate-400'
                                            )}
                                            style={baselineStyles}
                                            title="Original Baseline Projection"
                                        />
                                    )}

                                    {/* Main Task Block */}
                                    {isFinite(item.startTime) && isFinite(item.endTime) && (
                                        <div
                                            onMouseDown={(e) => handleMouseDown(e, item)}
                                            className={clsx(
                                                "absolute top-1/2 -translate-y-1/2 h-6 rounded-md shadow flex items-center px-2 overflow-hidden",
                                                item.type === 'phase' ? 'bg-indigo-600/80 border border-indigo-500' :
                                                    item.type === 'milestone' ? 'bg-orange-600/80 border border-orange-500 h-5' :
                                                        (isDelayed ? 'bg-rose-600/80 border border-rose-500 h-4 cursor-grab active:cursor-grabbing transform transition-transform duration-75'
                                                            : 'bg-cyan-600/60 border border-cyan-500 h-4 cursor-grab active:cursor-grabbing transform transition-transform duration-75'),
                                                dragInfo?.id === item.id ? (isDelayed ? 'z-30 scale-105 shadow-xl !bg-rose-500 opacity-100' : 'z-30 scale-105 shadow-xl !bg-cyan-500 opacity-100') : ''
                                            )}
                                            style={getPositionStyles(item)}
                                        >
                                            {/* Progress Overlay */}
                                            {item.type === 'task' && item.progress && (
                                                <div
                                                    className={clsx(
                                                        "absolute left-0 top-0 h-full pointer-events-none",
                                                        isDelayed ? "bg-rose-400/30" : "bg-cyan-400/30"
                                                    )}
                                                    style={{ width: `${parseInt(item.progress, 10) || 0}%` }}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GanttChart;
