import React, { useState, useEffect } from 'react';
import { X, Sparkles, Key, FileText, Loader2, Copy, CheckCircle2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import ReactMarkdown from 'react-markdown';
import { logger } from '../utils/logger';

export const AIAssistantModal = ({ isOpen, onClose, projectData = [] }) => {
    const [apiKeys, setApiKeys] = useState(() => {
        try {
            const saved = localStorage.getItem('project-flow-ai-keys');
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error(e);
        }
        return { gemini: '', openai: '' };
    });
    const [selectedModel, setSelectedModel] = useState('gemini');
    const [isConfigured, setIsConfigured] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [report, setReport] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [copied, setCopied] = useState(false);

    // Reset state on open if no report exists
    useEffect(() => {
        if (isOpen && !report) {
            setErrorMsg('');
        }
    }, [isOpen, report]);

    const handleGenerate = async () => {
        const currentKey = apiKeys[selectedModel];
        if (!currentKey) {
            setErrorMsg(`${selectedModel === 'gemini' ? 'Google Gemini' : 'OpenAI'} API Key is required.`);
            return;
        }

        // Save keys
        localStorage.setItem('project-flow-ai-keys', JSON.stringify(apiKeys));

        const traceId = logger.startTrace({ action: 'generate_ai_report', taskCount: projectData.length, model: selectedModel });

        setIsGenerating(true);
        setErrorMsg('');
        setIsConfigured(true);

        try {
            // Compress data payload to save tokens and improve AI focus
            const compressedData = projectData.map(t => ({
                id: t.id,
                name: t.name,
                phase: t.phase || 'Unphased',
                start: t.startDate || t.startTime || 'Unknown',
                end: t.endDate || t.endTime || 'Unknown',
                progress: t.progress || '0%',
                assignee: t.assignee || 'Unassigned',
                deps: t.dependencies || 'None'
            }));

            let text = '';

            const prompt = `
You are an expert Enterprise Project Management AI Analyst. 
Analyze the following project data (provided in JSON).

Your goals:
1. Summarize the overall health and timeline of the project in 2 concise paragraphs.
2. Identify the top 3 highest-risk tasks (e.g., highly dependent, delayed, or missing assignees) and explain why.
3. Propose 2 immediate, actionable mitigations the Project Manager should take to optimize the schedule.

Do NOT simply parrot the JSON back. Provide high-level, executive insights.
Format your entire response in professional Markdown. Use headings, bold text, and bullet points where appropriate.

Project Data:
${JSON.stringify(compressedData, null, 2)}
`;

            if (selectedModel === 'gemini') {
                const genAI = new GoogleGenerativeAI(currentKey);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                text = response.text();
            } else {
                const openai = new OpenAI({ apiKey: currentKey, dangerouslyAllowBrowser: true });
                const completion = await openai.chat.completions.create({
                    messages: [
                        { role: "system", content: "You are an expert Enterprise Project Management AI Analyst.\nYour goals:\n1. Summarize the overall health and timeline of the project in 2 concise paragraphs.\n2. Identify the top 3 highest-risk tasks (e.g., highly dependent, delayed, or missing assignees) and explain why.\n3. Propose 2 immediate, actionable mitigations the Project Manager should take to optimize the schedule.\n\nDo NOT simply parrot the JSON back. Provide high-level, executive insights.\nFormat your entire response in professional Markdown. Use headings, bold text, and bullet points where appropriate." },
                        { role: "user", content: `Analyze the following project data (provided in JSON):\n\n${JSON.stringify(compressedData, null, 2)}` }
                    ],
                    model: "gpt-4o",
                });
                text = completion.choices[0].message.content;
            }

            logger.info('Successfully generated AI report', { traceId });
            setReport(text);
        } catch (error) {
            logger.error("AI Generation Failed", error);
            setErrorMsg(error.message || 'Failed to generate report. Please verify your API key.');
            setIsConfigured(false);
        } finally {
            setIsGenerating(false);
            logger.endTrace();
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(report);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden relative">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-800/30 shrink-0">
                    <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                        <Sparkles className={`w-5 h-5 ${selectedModel === 'gemini' ? 'text-amber-400' : 'text-emerald-400'}`} />
                        AI Health Analyst
                    </h2>
                    <div className="flex items-center gap-2">
                        {report && !isGenerating && (
                            <button
                                onClick={copyToClipboard}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors border border-slate-700"
                            >
                                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                                {copied ? 'Copied!' : 'Copy Report'}
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-800"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 relative">

                    {/* Setup / Config View */}
                    {!isConfigured && !report && !isGenerating && (
                        <div className="space-y-6 max-w-md mx-auto py-8">
                            <div className="text-center space-y-2">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 border ${selectedModel === 'gemini' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                                    <Sparkles className={`w-6 h-6 ${selectedModel === 'gemini' ? 'text-amber-400' : 'text-emerald-400'}`} />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-200">Generate Executive Insights</h3>
                                <p className="text-sm text-slate-400">
                                    Connect to {selectedModel === 'gemini' ? 'Google Gemini' : 'OpenAI'} to instantly analyze your timeline, detect critical path risks, and generate actionable mitigations.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">AI Provider</label>
                                    <select
                                        value={selectedModel}
                                        onChange={(e) => setSelectedModel(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner mb-4"
                                    >
                                        <option value="gemini">Google Gemini 1.5 Pro</option>
                                        <option value="openai">OpenAI GPT-4o</option>
                                    </select>

                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{selectedModel === 'gemini' ? 'Gemini' : 'OpenAI'} API Key</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Key className="h-4 w-4 text-slate-500" />
                                        </div>
                                        <input
                                            type="password"
                                            value={apiKeys[selectedModel]}
                                            onChange={(e) => setApiKeys({ ...apiKeys, [selectedModel]: e.target.value })}
                                            placeholder={selectedModel === 'gemini' ? "AIzaSy..." : "sk-..."}
                                            className={`w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none transition-colors shadow-inner ${selectedModel === 'gemini' ? 'focus:border-amber-500' : 'focus:border-emerald-500'}`}
                                        />
                                    </div>
                                    <p className="mt-2 text-right">
                                        {selectedModel === 'gemini' ? (
                                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[10px] text-amber-400 hover:underline">
                                                Get a free Gemini API Key →
                                            </a>
                                        ) : (
                                            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-[10px] text-emerald-400 hover:underline">
                                                Get an OpenAI API Key →
                                            </a>
                                        )}
                                    </p>
                                </div>

                                {errorMsg && (
                                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs">
                                        {errorMsg}
                                    </div>
                                )}

                                <button
                                    onClick={handleGenerate}
                                    disabled={!apiKeys[selectedModel] || projectData.length === 0}
                                    className={`w-full py-2.5 text-white font-semibold rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${selectedModel === 'gemini' ? 'bg-amber-600 hover:bg-amber-500 shadow-[0_0_15px_rgba(217,119,6,0.2)]' : 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]'}`}
                                >
                                    <FileText className="w-4 h-4" />
                                    Analyze {projectData.length} Tasks
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Loading View */}
                    {isGenerating && (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <Loader2 className={`w-10 h-10 animate-spin ${selectedModel === 'gemini' ? 'text-amber-400' : 'text-emerald-400'}`} />
                            <h3 className={`text-lg font-semibold animate-pulse ${selectedModel === 'gemini' ? 'text-amber-100' : 'text-emerald-100'}`}>Analyzing Project Graph...</h3>
                            <p className="text-sm text-slate-400 max-w-sm text-center">
                                Processing {projectData.length} tasks, dependencies, and resource allocations through the neural network.
                            </p>
                        </div>
                    )}

                    {/* Report View */}
                    {report && !isGenerating && (
                        <div className={`prose prose-invert prose-slate prose-a:text-indigo-400 prose-strong:text-slate-200 max-w-none animate-in slide-in-from-bottom-4 duration-500 ${selectedModel === 'gemini' ? 'prose-h3:text-amber-400' : 'prose-h3:text-emerald-400'}`}>
                            <ReactMarkdown>{report}</ReactMarkdown>
                        </div>
                    )}
                </div>

                {report && !isGenerating && (
                    <div className="p-4 border-t border-slate-800 bg-slate-900 shrink-0 flex justify-between items-center">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Sparkles className={`w-3 h-3 ${selectedModel === 'gemini' ? 'text-amber-500/50' : 'text-emerald-500/50'}`} />
                            AI-generated insights may be inaccurate. Verify with project teams.
                        </span>
                        <button
                            onClick={() => { setReport(''); setIsConfigured(false); }}
                            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                        >
                            Start New Analysis
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
