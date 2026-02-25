import React, { useCallback, useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, Network, List, Download, Users, Filter, ChevronDown } from 'lucide-react';
import { logger } from '../utils/logger';

const Sidebar = ({
    onFileUpload,
    viewMode,
    setViewMode,
    onExportCSV,
    onExportExcel,
    assignees = [],
    selectedAssignee = null,
    onAssigneeFilter,
    onBaselineUpload
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const baselineInputRef = useRef(null);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const processFile = useCallback((file) => {
        if (!file) return;

        // Start Request Trace for File Upload flow
        const traceId = logger.startTrace({ action: 'file_upload', fileName: file.name, fileSize: file.size });
        logger.info(`Starting upload processing for file: ${file.name}`);

        try {
            if (onFileUpload) {
                onFileUpload(file);
            }
            logger.info('File upload processed successfully via callback');
        } catch (error) {
            logger.error('Failed to process file during callback execution', error);
        } finally {
            logger.endTrace();
        }
    }, [onFileUpload]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        } else {
            logger.warn('Drop event triggered but no valid file found in dataTransfer');
        }
    }, [processFile]);

    const handleFileSelect = useCallback((e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            processFile(files[0]);
            // Reset input value to allow the same file to be selected consecutively if needed
            e.target.value = null;
        } else {
            logger.warn('File input triggered but no valid file selected');
        }
    }, [processFile]);

    const handleBaselineSelect = useCallback((e) => {
        const files = e.target.files;
        if (files && files.length > 0 && onBaselineUpload) {
            onBaselineUpload(files[0]);
            e.target.value = null;
        }
    }, [onBaselineUpload]);

    return (
        <aside className="w-80 h-full bg-slate-900 border-r border-slate-800 flex flex-col p-6 text-slate-100 flex-shrink-0">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <FileSpreadsheet className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
                        Project-Flow
                    </h1>
                    <p className="text-xs text-slate-400 font-medium">Visualizer</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    Data Import
                </h2>

                {/* Drop Zone */}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
            border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center 
            cursor-pointer transition-all duration-300 ease-in-out group
            ${isDragging
                            ? 'border-teal-400 bg-teal-400/10 scale-[1.02]'
                            : 'border-slate-700 bg-slate-800/50 hover:border-indigo-500 hover:bg-indigo-500/10'}
          `}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        onChange={handleFileSelect}
                    />
                    <div className="p-3 bg-slate-800 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <UploadCloud className={`w-6 h-6 ${isDragging ? 'text-teal-400' : 'text-indigo-400'}`} />
                    </div>
                    <p className="text-sm font-semibold text-slate-200 mb-1">
                        {isDragging ? 'Drop file to upload' : 'Click or Drag & Drop'}
                    </p>
                    <p className="text-xs text-slate-400">
                        CSV, XLSX, or XLS
                    </p>
                </div>

                {/* Baseline Upload Button */}
                <div className="mt-3">
                    <input
                        type="file"
                        ref={baselineInputRef}
                        className="hidden"
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        onChange={handleBaselineSelect}
                    />
                    <button
                        onClick={() => baselineInputRef.current?.click()}
                        className="w-full text-[10px] uppercase tracking-wider font-semibold text-slate-500 hover:text-slate-300 py-1.5 px-2 rounded border border-slate-800 hover:border-slate-600 bg-slate-900/50 hover:bg-slate-800 transition-all text-center flex items-center justify-center gap-1.5"
                        title="Upload a historical projection to compare against the current timeline."
                    >
                        <FileSpreadsheet className="w-3 h-3" />
                        Compare Baseline
                    </button>
                </div>

                <div className="mt-8">
                    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                        View Mode
                    </h2>
                    <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700 flex-wrap lg:flex-nowrap gap-1">
                        <button
                            onClick={() => setViewMode('network')}
                            className={`flex-1 min-w-[60px] flex items-center justify-center gap-1.5 py-2 px-1 text-[10px] font-bold rounded-md transition-all ${viewMode === 'network' ? 'bg-indigo-500/20 text-indigo-300 shadow-sm border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
                        >
                            <Network className="w-3.5 h-3.5" />
                            Graph
                        </button>
                        <button
                            onClick={() => setViewMode('gantt')}
                            className={`flex-1 min-w-[60px] flex items-center justify-center gap-1.5 py-2 px-1 text-[10px] font-bold rounded-md transition-all ${viewMode === 'gantt' ? 'bg-teal-500/20 text-teal-300 shadow-sm border border-teal-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
                        >
                            <List className="w-3.5 h-3.5" />
                            Gantt
                        </button>
                        <button
                            onClick={() => setViewMode('resources')}
                            className={`flex-1 min-w-[60px] flex items-center justify-center gap-1.5 py-2 px-1 text-[10px] font-bold rounded-md transition-all ${viewMode === 'resources' ? 'bg-orange-500/20 text-orange-300 shadow-sm border border-orange-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
                        >
                            <Users className="w-3.5 h-3.5" />
                            Resources
                        </button>
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Filter className="w-3 h-3 text-indigo-400" />
                        Assignee Filter
                    </h2>
                    <div className="relative">
                        <select
                            value={selectedAssignee || ''}
                            onChange={(e) => onAssigneeFilter(e.target.value || null)}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2.5 px-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer hover:bg-slate-700/50 transition-colors"
                        >
                            <option value="">All Assignees</option>
                            {assignees.map(person => (
                                <option key={person} value={person}>{person}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                        Export Data
                    </h2>
                    <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                        <button
                            onClick={onExportCSV}
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-md transition-all text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/30"
                        >
                            <Download className="w-3.5 h-3.5" />
                            CSV
                        </button>
                        <button
                            onClick={onExportExcel}
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-md transition-all text-slate-400 hover:text-teal-300 hover:bg-teal-500/10 border border-transparent hover:border-teal-500/30"
                        >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            Excel
                        </button>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-lg text-sm text-slate-300 shadow-inner">
                        <p className="mb-2 font-medium text-slate-200 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-teal-400"></span> Usage Guide
                        </p>
                        Upload a structured file containing Project Names, Milestones, and Task Descriptions.
                        Refer to <code className="text-xs bg-slate-900 px-1 py-0.5 rounded text-indigo-300">USER_GUIDE.md</code> for proper schema formatting.
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default React.memo(Sidebar);
