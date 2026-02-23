import React, { useMemo } from 'react';
import { getSmoothStepPath, useViewport } from 'reactflow';

export default function SmartEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    data,
    markerEnd,
    selected,
}) {
    const { zoom } = useViewport();
    // Use useMemo to avoid recalculating complex paths on every frame
    const edgePath = useMemo(() => {
        // 1. Intra-Milestone Incremental Offsets (Left Side)
        if (data?.routingType === 'intra' && data?.busOffset) {
            const offset = data.busOffset;
            // Manhattan loop pushing left
            const midX = Math.min(sourceX, targetX) - offset;
            return `M ${sourceX},${sourceY} L ${midX},${sourceY} L ${midX},${targetY} L ${targetX},${targetY}`;
        }

        // 2. Inter-Milestone Edge Bundling (Bus Logic)
        if (data?.bundleKey && data?.bundleIndex) {
            // Shared Bus X is midway between milestones
            const busX = (sourceX + targetX) / 2;

            return `M ${sourceX},${sourceY} 
              L ${busX - 20},${sourceY} 
              Q ${busX},${sourceY} ${busX},${sourceY + (targetY - sourceY) / 2}
              T ${busX + 20},${targetY} 
              L ${targetX},${targetY}`;
        }

        // 3. Fallback to standard SmoothStep
        const [path] = getSmoothStepPath({
            sourceX,
            sourceY,
            targetX,
            targetY,
            sourcePosition,
            targetPosition,
            borderRadius: 16,
        });
        return path;

    }, [sourceX, sourceY, targetX, targetY, data]);

    // Interactive Focus State Logic
    const isActive = selected || data?.isHighlighted;
    const distance = data?.distance || 0;

    // Calculate Opacity based on distance and state
    // Long background connections (dist > 500) become semi-transparent
    const finalOpacity = useMemo(() => {
        // LOD Control: Level of Detail based on Zoom
        if (data?.isSummary) {
            // Summary lines only appear when zoomed out
            return zoom < 0.6 ? 0.8 : 0;
        } else {
            // Standard lines disappear when zoomed out to reduce noise
            if (zoom < 0.6) return 0;

            // Standard path distance-based dimming
            if (isActive) return 1;
            if (distance > 500) return 0.25;
            if (distance > 200) return 0.6;
            return 1;
        }
    }, [isActive, distance, zoom, data?.isSummary]);

    // Apply Shadow Glow on Select/Active
    const finalStyle = {
        ...style,
        strokeWidth: isActive ? 3 : (style.strokeWidth || 2),
        transition: 'stroke-width 0.3s, stroke 0.3s, opacity 0.3s, filter 0.3s',
        opacity: finalOpacity,
        filter: isActive ? `drop-shadow(0 0 8px ${style.stroke || '#2dd4bf'})` : 'none',
    };

    return (
        <>
            <path
                id={id}
                style={finalStyle}
                className="react-flow__edge-path"
                d={edgePath}
                markerEnd={markerEnd}
            />
            {/* Milestone Blocker Dot (Special Hand-off Indicator) */}
            {data?.isMilestoneBlocker && (
                <circle
                    cx={sourceX}
                    cy={sourceY}
                    r={4}
                    fill={style.stroke || '#94a3b8'}
                    style={{ opacity: finalOpacity, transition: 'opacity 0.3s' }}
                />
            )}
        </>
    );
}
