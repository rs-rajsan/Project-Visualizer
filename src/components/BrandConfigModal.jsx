import React, { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Palette, CheckCircle2 } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { logger } from '../utils/logger';

export const BrandConfigModal = ({ isOpen, onClose }) => {
    const { themeConfig, updateTheme } = useTheme();
    const [primary, setPrimary] = useState(themeConfig.primaryColor || '#6366f1');
    const [secondary, setSecondary] = useState(themeConfig.secondaryColor || '#14b8a6');
    const [previewLogo, setPreviewLogo] = useState(themeConfig.logoUrl);
    const fileInputRef = useRef(null);
    const [saved, setSaved] = useState(false);

    // Sync state if external changes happen
    useEffect(() => {
        if (isOpen) {
            /* eslint-disable react-hooks/set-state-in-effect */
            setPrimary(themeConfig.primaryColor || '#6366f1');
            setSecondary(themeConfig.secondaryColor || '#14b8a6');
            setPreviewLogo(themeConfig.logoUrl);
            setSaved(false);
            /* eslint-enable react-hooks/set-state-in-effect */
        }
    }, [isOpen, themeConfig]);

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const traceId = logger.startTrace({ action: 'upload_brand_logo', fileName: file.name, fileSize: file.size });

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewLogo(reader.result);
            logger.info('Logo processed and loaded', { traceId });
            logger.endTrace();
        };
        reader.onerror = (error) => {
            logger.error('Failed to read logo file', error);
            logger.endTrace();
        };
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        updateTheme({
            primaryColor: primary,
            secondaryColor: secondary,
            logoUrl: previewLogo
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        setTimeout(() => onClose(), 800); // Wait a bit then auto close
    };

    const handleRemoveLogo = () => {
        setPreviewLogo(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden relative">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-800/30 shrink-0">
                    <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                        <Palette className="w-5 h-5 text-indigo-400" />
                        Enterprise Branding Profile
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-800"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Corporate Logo
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-lg bg-slate-950 border border-slate-800 shadow-inner flex flex-col items-center justify-center relative overflow-hidden group">
                                {previewLogo ? (
                                    <>
                                        <img src={previewLogo} alt="Corporate Logo" className="w-full h-full object-contain p-2" />
                                        <button
                                            onClick={handleRemoveLogo}
                                            className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-rose-400 font-bold transition-opacity"
                                        >
                                            Remove
                                        </button>
                                    </>
                                ) : (
                                    <ImageIcon className="w-8 h-8 text-slate-600 mb-1" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-slate-500 mb-2">Upload a transparent PNG to appear on generated executive exports.</p>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded border border-slate-700 transition-colors"
                                >
                                    Browse Files
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/png, image/svg+xml, image/jpeg"
                                    onChange={handleLogoUpload}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-800">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Primary Brand Action Color (Hex)</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={primary}
                                    onChange={(e) => setPrimary(e.target.value)}
                                    className="w-10 h-10 rounded-md cursor-pointer border border-slate-700 bg-slate-950"
                                />
                                <input
                                    type="text"
                                    value={primary}
                                    onChange={(e) => setPrimary(e.target.value)}
                                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                                />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">Replaces system Indigo for major UI buttons and PDF headers.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Secondary Highlight Color (Hex)</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={secondary}
                                    onChange={(e) => setSecondary(e.target.value)}
                                    className="w-10 h-10 rounded-md cursor-pointer border border-slate-700 bg-slate-950"
                                />
                                <input
                                    type="text"
                                    value={secondary}
                                    onChange={(e) => setSecondary(e.target.value)}
                                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                                />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">Replaces system Teal accents and metric sparks.</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-sm transition-all shadow-md flex items-center gap-2"
                        // In theme integration, we make this button color track the brand-primary root CSS via inline style or tailwind variable
                        style={{ backgroundColor: primary }}
                    >
                        {saved ? <CheckCircle2 className="w-4 h-4" /> : null}
                        {saved ? 'Saved!' : 'Apply Brand Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
};
