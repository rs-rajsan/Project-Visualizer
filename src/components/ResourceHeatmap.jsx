import React, { useMemo } from 'react';
import { WorkloadManager } from '../utils/WorkloadManager';
import { logger } from '../utils/logger';
import clsx from 'clsx';
import { User, AlertTriangle } from 'lucide-react';

export const ResourceHeatmap = ({ data }) => {
    const { assigneeStats, allDates } = useMemo(() => {
        return WorkloadManager.calculateDailyWorkload(data);
    }, [data]);

    const getLoadColor = (load) => {
        if (load === 0) return 'bg-slate-800/20';
        if (load <= 0.5) return 'bg-emerald-500/40 text-emerald-200';
        if (load <= 1.0) return 'bg-teal-500/60 text-white';
        if (load <= 1.5) return 'bg-orange-500/80 text-white';
        return 'bg-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.4)] text-white font-bold animate-pulse';
    };

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
                Upload project data to view resource allocation heatmap.
            </div>
        );
    }

    return (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-400" />
                        Resource Workload Heatmap
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                        Daily allocation across all team members. Red indicates over-allocation ({'>'}1.0 units).
                    </p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500/40"></span> Low
                        <span className="w-2 h-2 rounded-full bg-teal-500/60"></span> Balanced
                        <span className="w-2 h-2 rounded-full bg-rose-600"></span> Overloaded
                    </div>
                </div>
            </div>

            {/* Matrix */}
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-950/50">
                            <th className="sticky left-0 z-10 p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/80 backdrop-blur-md min-w-[160px] border-r border-slate-800">
                                Assignee
                            </th>
                            {allDates.map(dateStr => {
                                const date = new Date(dateStr);
                                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                return (
                                    <th
                                        key={dateStr}
                                        className={clsx(
                                            "p-2 text-[10px] font-medium border-r border-slate-800 min-w-[36px]",
                                            isWeekend ? "text-slate-600 bg-slate-900/40" : "text-slate-400"
                                        )}
                                    >
                                        <div className="flex flex-col items-center">
                                            <span>{date.toLocaleDateString('en-US', { month: 'short' })}</span>
                                            <span className="font-black text-slate-200">{date.getDate()}</span>
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(assigneeStats).map(([assignee, stats]) => (
                            <tr key={assignee} className="border-b border-slate-800 group hover:bg-slate-800/20 transition-colors">
                                <td className="sticky left-0 z-10 p-4 bg-slate-900 group-hover:bg-slate-800 transition-colors border-r border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 border border-slate-700 shadow-inner">
                                            {assignee.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="truncate">
                                            <div className="text-sm font-semibold text-slate-200">{assignee}</div>
                                            <div className="text-[10px] text-slate-500">{stats.totalTasks} Tasks Total</div>
                                        </div>
                                    </div>
                                </td>
                                {allDates.map(dateStr => {
                                    const load = stats.dailyLoad[dateStr] || 0;
                                    return (
                                        <td
                                            key={dateStr}
                                            className={clsx(
                                                "p-0 border-r border-slate-800/50 transition-all duration-300 relative group/cell",
                                                getLoadColor(load)
                                            )}
                                        >
                                            <div className="h-12 w-full flex items-center justify-center text-[10px]">
                                                {load > 0 && <span>{(load * 100).toFixed(0)}%</span>}

                                                {/* Tooltip on Hover */}
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-slate-800 text-white rounded shadow-2xl opacity-0 group-hover/cell:opacity-100 transition-opacity z-50 pointer-events-none text-xs whitespace-nowrap border border-slate-700">
                                                    {dateStr}: {load.toFixed(1)} Units allocated
                                                    {load > 1.0 && <div className="text-rose-400 flex items-center gap-1 mt-1 font-bold">
                                                        <AlertTriangle className="w-3 h-3" /> Over-allocated
                                                    </div>}
                                                </div>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
