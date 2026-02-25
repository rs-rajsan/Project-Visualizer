import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { Users } from 'lucide-react';
import { logger } from '../utils/logger';

const CollaborationContext = createContext(null);

// Random vibrant colors for users
const CURSOR_COLORS = [
    '#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6',
    '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6',
    '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#f97316'
];

export const CollaborationProvider = ({ children, roomId = 'project-flow-enterprise-demo' }) => {
    const [provider, setProvider] = useState(null);
    const [awareness, setAwareness] = useState(null);
    const [users, setUsers] = useState(new Map());
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const traceId = logger.startTrace({ action: 'init_multiplayer', roomId });
        logger.info(`Initializing Multiplayer Session. Room: ${roomId}`, { traceId });

        // Use Yjs document to handle shared state
        const ydoc = new Y.Doc();

        // Connect to a robust, public signaling server for zero-config demonstration
        // In full production, this would point to a private Node.js or PartyKit server
        const wsProvider = new WebsocketProvider('wss://demos.yjs.dev/ws', roomId, ydoc);

        /* eslint-disable react-hooks/set-state-in-effect */
        setProvider(wsProvider);
        setAwareness(wsProvider.awareness);
        /* eslint-enable react-hooks/set-state-in-effect */

        // Assign a random identity to the current local tab
        const randomColor = CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
        const randomName = 'User_' + Math.floor(Math.random() * 999);

        wsProvider.awareness.setLocalStateField('user', {
            name: randomName,
            color: randomColor,
        });

        // Listen for connections
        wsProvider.on('status', event => {
            setIsConnected(event.status === 'connected');
            if (event.status === 'connected') {
                logger.info('Multiplayer WebSocket Connected', { traceId });
                logger.endTrace(); // Ends the initialization trace
            }
        });

        // Listen for peer awareness changes (mouse moves, joins, leaves)
        wsProvider.awareness.on('change', () => {
            const states = wsProvider.awareness.getStates();
            setUsers(new Map(states));
        });

        return () => {
            wsProvider.destroy();
            ydoc.destroy();
        };
    }, [roomId]);

    // Global Mouse Listener for broadcasting position
    useEffect(() => {
        if (!awareness) return;

        let frameId;
        const handleMouseMove = (e) => {
            // Throttle broadcasting to requestAnimationFrame for performance
            cancelAnimationFrame(frameId);
            frameId = requestAnimationFrame(() => {
                awareness.setLocalStateField('cursor', {
                    x: e.clientX,
                    y: e.clientY
                });
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(frameId);
        };
    }, [awareness]);

    return (
        <CollaborationContext.Provider value={{ provider, awareness, users, isConnected }}>
            {children}
            <LiveCursors users={users} localClientId={awareness?.clientID} />
            <ActiveUsersBadge users={users} isConnected={isConnected} />
        </CollaborationContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCollaboration = () => useContext(CollaborationContext);

/**
 * Renders the absolute positioned cursors for all active peers
 */
const LiveCursors = ({ users, localClientId }) => {
    return (
        <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
            {Array.from(users.entries()).map(([clientId, state]) => {
                // Don't render our own cursor, and ensure they have position data
                if (clientId === localClientId || !state.cursor || !state.user) return null;

                const { x, y } = state.cursor;
                const { color, name } = state.user;

                return (
                    <div
                        key={clientId}
                        className="absolute flex items-start justify-start transition-all duration-[50ms] ease-linear"
                        style={{
                            transform: `translate(${x}px, ${y}px)`,
                            color: color
                        }}

                    >
                        {/* Custom SVG Arrow for the specific user color */}
                        <svg
                            width="24" height="24" viewBox="0 0 24 24"
                            fill="currentColor"
                            stroke="white"
                            strokeWidth="1.5"
                            xmlns="http://www.w3.org/2000/svg"
                            className="drop-shadow-lg drop-shadow-[0_0_8px_rgba(0,0,0,0.5)] -mt-1 -ml-1 flex-shrink-0"
                            style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
                        >
                            <path d="M5.65376 21.1597L1.10091 3.5186C0.589882 1.53811 2.37929 -0.106571 4.3168 0.563065L22.9578 7.00832C24.9383 7.69343 25.176 10.4633 23.3855 11.986L16.208 18.0898C15.897 18.3543 15.698 18.7302 15.6599 19.1419L14.7749 28.7107C14.57 30.9258 11.6669 31.6253 10.3732 29.7735L5.65376 21.1597Z" />
                        </svg>

                        {/* Nametag */}
                        <div
                            className="bg-slate-900 border text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xl whitespace-nowrap opacity-90 backdrop-blur-sm -ml-1 mt-4"
                            style={{ borderColor: color }}
                        >
                            {name}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

/**
 * Small UI Widget indicating how many users are in the room
 */
const ActiveUsersBadge = ({ users, isConnected }) => {
    // Determine active users (ignoring entirely empty connections from previous sessions that haven't timed out)
    const activeCount = Array.from(users.values()).filter(state => state.user).length;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-full px-3 py-1.5 shadow-lg">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></div>
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {activeCount} {activeCount === 1 ? 'Editor' : 'Editors'}
            </span>

            {/* Show avatar bubbles for up to 3 peers */}
            <div className="flex -space-x-1.5 ml-1">
                {Array.from(users.values())
                    .filter(state => state.user)
                    .slice(0, 3)
                    .map((state, i) => (
                        <div
                            key={i}
                            className="w-5 h-5 rounded-full border border-slate-900 flex items-center justify-center text-[8px] font-bold text-white shadow-sm"
                            style={{ backgroundColor: state.user.color }}
                            title={state.user.name}
                        >
                            {state.user.name.charAt(0)}
                        </div>
                    ))}
            </div>
        </div>
    );
};
