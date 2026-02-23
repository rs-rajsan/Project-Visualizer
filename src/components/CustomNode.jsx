import React, { memo } from 'react';
import { Handle, Position, useStore } from 'reactflow';
import { Calendar, User, CheckCircle2, Link } from 'lucide-react';
import clsx from 'clsx'; // Utility to construct conditional class names efficiently

// Extract zoom level from global ReactFlow store (to prevent needless prop drilling)
const zoomSelector = (s) => s.transform[2];

const CustomNode = ({ data, selected }) => {
    const zoom = useStore(zoomSelector);

    // Zoom thresholds Level-of-Detail (LOD)
    // Tiny: < 0.4
    // Medium: 0.4 - 0.8
    // Large: > 0.8
    const isTiny = zoom < 0.4;
    const isLarge = zoom > 0.8;

    // Phase 1 basic theming (DRY). Phase 4 will expand this context properly.
    const getThemeClasses = () => {
        if (data.nodeType === 'task') return 'bg-cyan-50 border-cyan-400 text-cyan-950 shadow-sm'; // Task explicit theme
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
            <div className={clsx("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all", getThemeClasses(), selected && 'ring-2 ring-teal-400 scale-125')}>
                <Handle type="target" position={Position.Top} id="top-target" className="opacity-0" />
                <Handle type="target" position={Position.Left} id="left-target" className="opacity-0" />
                <span className="text-[8px] font-bold">{data.id}</span>
                <Handle type="source" position={Position.Bottom} id="bottom-source" className="opacity-0" />
                <Handle type="source" position={Position.Right} id="right-source" className="opacity-0" />
            </div>
        );
    }

    return (
        <div
            className={clsx(
                "relative w-[105px] h-[55px] overflow-hidden border-2 rounded-xl transition-all duration-300",
                getThemeClasses(),
                data.nodeType !== 'task' ? 'cursor-pointer hover:shadow-lg' : 'cursor-default',
                selected ? 'ring-2 ring-teal-400 border-teal-500 scale-105' : 'hover:scale-[1.02]'
            )}
        >
            {/* Target Handles */}
            <Handle type="target" position={Position.Top} id="top-target" className="w-2 h-2 border-2 left-1/2 -mt-[1px]" style={{ background: '#fff' }} />
            <Handle type="target" position={Position.Left} id="left-target" className="w-2 h-2 border-2 top-1/2 -ml-[1px]" style={{ background: '#fff' }} />

            <div className="p-1.5">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-[8px] font-bold uppercase tracking-wider opacity-70 truncate max-w-[50px]">
                        {data.nodeType === 'phase' ? 'PH: ' : data.nodeType === 'milestone' ? 'MS: ' : ''}{data.id}
                    </span>
                    <div className="flex items-center gap-2">
                        {data.nodeType !== 'task' && data.childCount > 0 && (
                            <div className="flex items-center gap-0.5 text-[8px] font-medium opacity-80 bg-white/20 px-1 rounded" title={`${data.childCount} Items`}>
                                {data.childCount} {data.nodeType === 'phase' ? 'MS' : 'Tasks'}
                            </div>
                        )}
                        {data.nodeType === 'task' && data.dependencies && (
                            <div className="flex items-center gap-0.5 text-[8px] font-medium opacity-80" title={`${String(data.dependencies).split(',').filter(Boolean).length} Dependencies`}>
                                <Link className="w-2 h-2 text-indigo-500" />
                                {String(data.dependencies).split(',').map(d => d.trim()).filter(Boolean).length}
                            </div>
                        )}
                        {data.progress && data.nodeType === 'task' && (
                            <div className="flex items-center gap-0.5 text-[8px] font-medium opacity-80">
                                <CheckCircle2 className="w-2 h-2 text-emerald-600" />
                                {data.progress}
                            </div>
                        )}
                    </div>
                </div>

                <h3 className="font-bold text-[10px] leading-tight mb-1 truncate" title={data.name}>
                    {data.name}
                </h3>

                {data.nodeType !== 'task' && (
                    <div className="text-[8px] font-semibold opacity-60 mt-1 flex items-center justify-between">
                        <span>{data.isExpanded ? 'Collapse' : 'Expand'}</span>
                        <span className="bg-black/10 px-1 py-0.5 rounded text-[6px]">Group</span>
                    </div>
                )}

                {/* Extended Details - Rendered dynamically via Lod at high zoom levels */}
                {isLarge && data.nodeType === 'task' && (
                    <div className="mt-1.5 pt-1.5 border-t border-black/10 flex flex-col gap-1 text-[8px]">
                        {data.assignee && (
                            <div className="flex items-center gap-1.5 opacity-80">
                                <User className="w-2 h-2 text-slate-500" />
                                <span className="truncate">{data.assignee}</span>
                            </div>
                        )}
                        {data.startDate && (
                            <div className="flex items-center gap-1.5 opacity-80">
                                <Calendar className="w-2 h-2 text-slate-500" />
                                <span>{data.startDate} {data.cost && `(${data.cost})`}</span>
                            </div>
                        )}
                        {data.milestone && (
                            <div className="flex items-center gap-1.5 opacity-80">
                                <span className="w-1 h-1 rounded-full bg-current" />
                                <span className="truncate">{data.milestone}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Source Handles */}
            <Handle type="source" position={Position.Bottom} id="bottom-source" className="w-2 h-2 border-2 left-1/2 -mb-[1px]" style={{ background: '#fff' }} />
            <Handle type="source" position={Position.Right} id="right-source" className="w-2 h-2 border-2 top-1/2 -mr-[1px]" style={{ background: '#fff' }} />
        </div>
    );
};

// Memoize node for significant rendering speed increases on arrays.
export default memo(CustomNode);
