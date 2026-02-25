import React, { memo } from 'react';
import { Handle, Position, useStore } from 'reactflow';
import { Calendar, User, CheckCircle2, Link } from 'lucide-react';
import clsx from 'clsx'; // Utility to construct conditional class names efficiently
import { DateUtils } from '../utils/DateUtils';

// Extract zoom level from global ReactFlow store (to prevent needless prop drilling)
const zoomSelector = (s) => s.transform[2];

const CustomNode = ({ data, selected }) => {
    const zoom = useStore(zoomSelector);

    // Zoom thresholds Level-of-Detail (LOD)
    // Tiny: < 0.4
    // Medium: 0.4 - 0.8
    // Large: > 0.8
    const isTiny = zoom < 0.4;

    // Determine if task is delayed versus baseline
    let isDelayed = false;
    if (data.nodeType === 'task') {
        const bounds = DateUtils.getTaskBounds(data);
        const baseline = DateUtils.getBaselineBounds(data);
        if (bounds && baseline && isFinite(bounds.endTime) && isFinite(baseline.baselineEndTime)) {
            if (bounds.endTime > baseline.baselineEndTime) {
                isDelayed = true;
            }
        }
    }

    // Phase 1 basic theming (DRY). Phase 4 will expand this context properly.
    const getThemeClasses = () => {
        if (data.snowTicket) return 'bg-rose-50 border-rose-600 text-rose-950 shadow-[0_0_15px_rgba(225,29,72,0.6)] animate-pulse'; // SNOW Blocker

        if (data.nodeType === 'task') {
            if (isDelayed) return 'bg-rose-50 border-rose-500 text-rose-950 shadow-rose-500/30';
            return 'bg-cyan-50 border-cyan-400 text-cyan-950 shadow-sm'; // Task explicit theme
        }
        const p = data.nodeType === 'phase' ? 'phase' : data.nodeType === 'milestone' ? 'milestone' : (data.phase ? String(data.phase).toLowerCase() : '');
        if (p.includes('phase')) return 'bg-indigo-50 border-indigo-400 text-indigo-950 shadow-indigo-500/20';
        if (p.includes('milestone')) return 'bg-orange-50 border-orange-400 text-orange-950 shadow-orange-500/20';
        if (p.includes('planning') || p.includes('design')) return 'bg-indigo-50 border-indigo-200 text-indigo-950 shadow-sm';
        if (p.includes('exec') || p.includes('implement')) return 'bg-orange-50 border-orange-200 text-orange-950 shadow-sm';
        return 'bg-slate-50 border-slate-300 text-slate-950 shadow-sm';
    };

    if (isTiny) {
        // Minimalist Lod map
        return (
            <div className={clsx("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer", getThemeClasses(), (selected || data.isHighlighted) && 'ring-2 ring-teal-400 scale-125')}>
                <Handle type="target" position={Position.Top} id="top-target" className="opacity-0" />
                <Handle type="target" position={Position.Bottom} id="bottom-target" className="opacity-0" />
                <Handle type="target" position={Position.Left} id="left-target" className="opacity-0" />
                <Handle type="target" position={Position.Right} id="right-target" className="opacity-0" />
                <span className="text-[8px] font-bold">{data.id}</span>
                <Handle type="source" position={Position.Top} id="top-source" className="opacity-0" />
                <Handle type="source" position={Position.Bottom} id="bottom-source" className="opacity-0" />
                <Handle type="source" position={Position.Left} id="left-source" className="opacity-0" />
                <Handle type="source" position={Position.Right} id="right-source" className="opacity-0" />
            </div>
        );
    }

    return (
        <div
            className={clsx(
                "relative w-[105px] h-[55px] overflow-hidden border-2 rounded-xl transition-all duration-300 cursor-pointer hover:shadow-lg",
                getThemeClasses(),
                selected || data.isHighlighted ? 'ring-2 ring-teal-400 border-teal-500 scale-105' : 'hover:scale-[1.02]'
            )}
        >
            {/* Target Handles */}
            <Handle
                type="target"
                position={Position.Top}
                id="top-target"
                className="w-3 h-3 border-2 border-white -mt-1.5 transition-all hover:scale-150 hover:bg-teal-400 z-50"
                style={{ background: '#fff' }}
            />
            <Handle type="target" position={Position.Bottom} id="bottom-target" className="opacity-0 bottom-0 left-1/2" />
            <Handle
                type="target"
                position={Position.Left}
                id="left-target"
                className="w-3 h-3 border-2 border-white -ml-1.5 transition-all hover:scale-150 hover:bg-teal-400 z-50"
                style={{ background: '#fff' }}
            />
            <Handle type="target" position={Position.Right} id="right-target" className="opacity-0 top-1/2 right-0" />

            <div className="p-1.5 h-full flex flex-col justify-center">
                <div className="flex justify-between items-start mb-0.5">
                    <span className="text-[7px] font-bold uppercase tracking-wider opacity-60 truncate max-w-[40px]">
                        {data.nodeType === 'phase' ? 'PH: ' : data.nodeType === 'milestone' ? 'MS: ' : ''}{data.id}
                    </span>
                    <div className="flex items-center gap-1.5">
                        {data.nodeType === 'task' && data.dependencies && (
                            <div className="flex items-center gap-0.5 text-[7px] font-medium opacity-70">
                                <Link className="w-1.5 h-1.5 text-indigo-500" />
                                {String(data.dependencies).split(',').filter(Boolean).length}
                            </div>
                        )}
                        {data.snowTicket && (
                            <div className="flex items-center gap-0.5 text-[7px] font-bold text-rose-600 bg-rose-100 px-1 rounded-sm border border-rose-200">
                                SNOW: {data.snowTicket}
                            </div>
                        )}
                        {data.progress && data.nodeType === 'task' && (
                            <div className="flex items-center gap-0.5 text-[7px] font-medium opacity-70">
                                <CheckCircle2 className="w-1.5 h-1.5 text-emerald-600" />
                                {data.progress}
                            </div>
                        )}
                    </div>
                </div>

                <h3 className="font-bold text-[9px] leading-tight mb-0.5 truncate" title={data.name}>
                    {data.name}
                </h3>

                {data.nodeType !== 'task' && (
                    <div className="text-[7px] font-semibold opacity-60 mt-0.5 flex items-center justify-between">
                        <span>{data.isExpanded ? 'Collapse' : 'Expand'}</span>
                        <span className="bg-black/5 px-1 py-0.2 rounded text-[5px]">Group</span>
                    </div>
                )}
            </div>

            {/* Source Handles */}
            <Handle type="source" position={Position.Top} id="top-source" className="opacity-0 top-0 left-1/2" />
            <Handle
                type="source"
                position={Position.Bottom}
                id="bottom-source"
                className="w-3 h-3 border-2 border-white -mb-1.5 transition-all hover:scale-150 hover:bg-teal-400 z-50"
                style={{ background: '#fff' }}
            />
            <Handle type="source" position={Position.Left} id="left-source" className="opacity-0 top-1/2 left-0" />
            <Handle
                type="source"
                position={Position.Right}
                id="right-source"
                className="w-3 h-3 border-2 border-white -mr-1.5 transition-all hover:scale-150 hover:bg-teal-400 z-50"
                style={{ background: '#fff' }}
            />
        </div>
    );
};

// Memoize node for significant rendering speed increases on arrays.
export default memo(CustomNode);
