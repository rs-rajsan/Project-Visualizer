import React, { useCallback, useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet } from 'lucide-react';
import { logger } from '../utils/logger';

const Sidebar = ({ onFileUpload }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

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
