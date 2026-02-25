import React, { useState, useEffect } from 'react';
import { X, Server, Key, Mail, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { JiraIntegration } from '../utils/PMIntegration';
import { logger } from '../utils/logger';

export const JiraConfigModal = ({ isOpen, onClose, onImport }) => {
    const [config, setConfig] = useState({ url: '', email: '', apiToken: '' });
    const [status, setStatus] = useState('idle'); // 'idle', 'authenticating', 'authenticated', 'error'
    const [errorMsg, setErrorMsg] = useState('');
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [jiraClient, setJiraClient] = useState(null);

    // Reset when opened
    useEffect(() => {
        if (isOpen) {
            setStatus('idle');
            setErrorMsg('');
            setProjects([]);
            setSelectedProject('');
            setIsImporting(false);
        }
    }, [isOpen]);

    const handleAuthenticate = async () => {
        if (!config.url || !config.email || !config.apiToken) {
            setErrorMsg('All fields are required.');
            setStatus('error');
            return;
        }

        setStatus('authenticating');
        setErrorMsg('');

        try {
            const client = new JiraIntegration(config);
            const success = await client.authenticate();

            if (success) {
                setStatus('authenticated');
                setJiraClient(client);

                // Fetch projects immediately after auth
                const projList = await client.fetchProjects();
                setProjects(projList);
                if (projList.length > 0) {
                    setSelectedProject(projList[0].key);
                }
            } else {
                setStatus('error');
                setErrorMsg('Authentication failed. Check your credentials.');
            }
        } catch (error) {
            logger.error("Jira Authentication error", error);
            setStatus('error');
            setErrorMsg(error.message || 'An error occurred during authentication.');
        }
    };

    const handleImport = async () => {
        if (!jiraClient || !selectedProject) return;

        setIsImporting(true);
        setErrorMsg('');
        try {
            const projectData = await jiraClient.fetchProjectData(selectedProject);
            onImport(projectData.rawData);
            onClose();
        } catch (error) {
            logger.error("Jira Import error", error);
            setErrorMsg('Failed to import project data. Please try again.');
        } finally {
            setIsImporting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-800/50">
                    <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                        <Server className="w-5 h-5 text-indigo-400" />
                        Jira Enterprise Sync
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">

                    {/* Connection Config Phase */}
                    <div className={`space-y-4 transition-opacity duration-300 ${status === 'authenticated' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Jira Domain URL</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Server className="h-4 w-4 text-slate-500" />
                                </div>
                                <input
                                    type="text"
                                    value={config.url}
                                    onChange={(e) => setConfig({ ...config, url: e.target.value })}
                                    placeholder="https://your-domain.atlassian.net"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Account Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-slate-500" />
                                </div>
                                <input
                                    type="email"
                                    value={config.email}
                                    onChange={(e) => setConfig({ ...config, email: e.target.value })}
                                    placeholder="user@company.com"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">API Token</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Key className="h-4 w-4 text-slate-500" />
                                </div>
                                <input
                                    type="password"
                                    value={config.apiToken}
                                    onChange={(e) => setConfig({ ...config, apiToken: e.target.value })}
                                    placeholder="Paste your Jira API Token"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>
                            <p className="mt-1 flex justify-end">
                                <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noreferrer" className="text-[10px] text-indigo-400 hover:underline">
                                    Generate an API Token →
                                </a>
                            </p>
                        </div>

                        <button
                            onClick={handleAuthenticate}
                            disabled={status === 'authenticating' || status === 'authenticated'}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {status === 'authenticating' ? (
                                <><RefreshCw className="w-4 h-4 animate-spin" /> Authenticating...</>
                            ) : status === 'authenticated' ? (
                                <><CheckCircle2 className="w-4 h-4 text-teal-300" /> Authenticated</>
                            ) : (
                                'Connect to Jira'
                            )}
                        </button>
                    </div>

                    {/* Status Feedback */}
                    {status === 'error' && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start gap-2 text-rose-300 text-sm">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <p>{errorMsg}</p>
                        </div>
                    )}

                    {/* Import Phase (Only visible when authenticated) */}
                    {status === 'authenticated' && (
                        <div className="pt-4 border-t border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <label className="block text-xs font-semibold text-teal-400 uppercase tracking-wider mb-2">Select Project to Sync</label>
                            <select
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                                className="w-full bg-slate-950 border border-teal-500/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-400 transition-colors appearance-none"
                            >
                                {projects.map(p => (
                                    <option key={p.id} value={p.key}>{p.name} ({p.key})</option>
                                ))}
                            </select>

                            <button
                                onClick={handleImport}
                                disabled={isImporting || !selectedProject}
                                className="w-full mt-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(20,184,166,0.2)]"
                            >
                                {isImporting ? (
                                    <><RefreshCw className="w-4 h-4 animate-spin" /> Syncing Live Data...</>
                                ) : (
                                    <><Server className="w-4 h-4" /> Import Project Board</>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
