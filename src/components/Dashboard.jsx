import React, { useMemo, useRef, useState } from 'react';
import { FileText, Clock, CheckCircle2, AlertCircle, Users, Download, Maximize, Loader2, BarChart3 } from 'lucide-react';
import { DateUtils } from '../utils/DateUtils';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const Dashboard = ({ data }) => {
    const dashboardRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);

    const metrics = useMemo(() => {
        let total = 0;
        let completed = 0;
        let atRisk = 0;
        let overdue = 0;
        const assignees = new Set();
        let totalCost = 0;

        data.forEach(task => {
            if (task.nodeType !== 'task') return;
            total++;

            if (task.progress >= 100) {
                completed++;
            }

            if (task.assignee) {
                assignees.add(String(task.assignee).trim());
            }

            if (task.cost) {
                totalCost += parseInt(task.cost, 10);
            }

            const bounds = DateUtils.getTaskBounds(task);
            const baseline = DateUtils.getBaselineBounds(task);

            if (bounds && baseline && isFinite(bounds.endTime) && isFinite(baseline.baselineEndTime)) {
                if (bounds.endTime > baseline.baselineEndTime) {
                    overdue++;
                } else if (bounds.endTime === baseline.baselineEndTime) {
                    atRisk++;
                }
            }
        });

        const percentComplete = total === 0 ? 0 : Math.round((completed / total) * 100);

        return {
            total,
            completed,
            atRisk,
            overdue,
            assigneeCount: assignees.size,
            percentComplete,
            totalCost
        };
    }, [data]);

    const handleExportPDF = async () => {
        if (!dashboardRef.current) return;
        setIsExporting(true);
        try {
            const canvas = await html2canvas(dashboardRef.current, {
                scale: 2,
                backgroundColor: '#0f172a', // Tailwind slate-950
                ignoreElements: (element) => element.classList.contains('no-export')
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'pt',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save('Executive_Dashboard_Report.pdf');
        } catch (error) {
            console.error("Failed to generate PDF snapshot:", error);
            alert("Failed to export PDF layout.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="p-8 pb-32 max-w-7xl mx-auto dark-theme" ref={dashboardRef}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3 tracking-tight">
                        <FileText className="w-8 h-8 text-indigo-400" />
                        Executive Abstract
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm max-w-2xl leading-relaxed">
                        High-level strategic overview of project trajectory, aggregated resource loads, and
                        calculated baseline deviation metrics.
                    </p>
                </div>

                <button
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="no-export flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {isExporting ? 'Generating...' : 'Export Report'}
                </button>
            </div>

            {/* Top Level KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="Total Tasks"
                    value={metrics.total}
                    subtitle={`${metrics.completed} successfully completed`}
                    icon={<FileText className="text-indigo-400 w-5 h-5" />}
                    trend={`${metrics.percentComplete}% Progress`}
                    trendUp={true}
                    borderClass="border-indigo-500/30"
                />
                <MetricCard
                    title="Active Resources"
                    value={metrics.assigneeCount}
                    subtitle="Unique personnel assigned"
                    icon={<Users className="text-teal-400 w-5 h-5" />}
                    borderClass="border-teal-500/30"
                />
                <MetricCard
                    title="Tasks At Risk"
                    value={metrics.atRisk}
                    subtitle="No remaining baseline buffer"
                    icon={<AlertCircle className="text-amber-400 w-5 h-5" />}
                    trend={metrics.atRisk > 0 ? "Requires Attention" : "Healthy"}
                    trendUp={metrics.atRisk === 0}
                    borderClass={metrics.atRisk > 0 ? "border-amber-500/50" : "border-slate-700"}
                />
                <MetricCard
                    title="Overdue Slippage"
                    value={metrics.overdue}
                    subtitle="Past absolute baseline deadline"
                    icon={<Clock className="text-rose-400 w-5 h-5" />}
                    trend={metrics.overdue > 0 ? "Critical Flaw" : "On Track"}
                    trendUp={metrics.overdue === 0}
                    borderClass={metrics.overdue > 0 ? "border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.1)]" : "border-slate-700"}
                    glowRule={metrics.overdue > 0}
                />
            </div>

            {/* Chart Area Pre-allocation for future expansion */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="col-span-2 bg-slate-800/40 border border-slate-700/60 rounded-xl p-6 h-80 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-teal-400 left-0"></div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-1">Velocity & Burn-down</h3>
                    <p className="text-xs text-slate-400 mb-6">Historical aggregation versus predicted trajectory limits</p>
                    <div className="flex-1 flex items-center justify-center opacity-30 border border-dashed border-slate-600 rounded-lg">
                        <span className="text-slate-400 italic font-medium flex gap-2 items-center">
                            <BarChart3 className="w-5 h-5" /> Charting Module Provisioned
                        </span>
                    </div>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-6 h-80 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-amber-400 to-rose-400 left-0"></div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-1">Financial Aggresion</h3>
                    <p className="text-xs text-slate-400 mb-6">Total computed duration cost impact</p>

                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="text-5xl font-black text-rose-300 drop-shadow-md tracking-tighter mb-2">
                            {metrics.totalCost}
                        </div>
                        <div className="text-sm font-semibold text-rose-400/80 uppercase tracking-widest">
                            Value Score
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, subtitle, icon, trend, trendUp, borderClass, glowRule }) => {
    return (
        <div className={`bg-slate-800/50 rounded-xl p-6 border ${borderClass} flex flex-col transition-all relative overflow-hidden ${glowRule ? 'bg-rose-950/20' : ''}`}>
            {glowRule && <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl pointer-events-none"></div>}

            <div className="flex justify-between items-start mb-4">
                <h3 className="text-slate-400 font-semibold text-sm uppercase tracking-wider">{title}</h3>
                <div className="p-2 bg-slate-900/50 rounded-lg shadow-inner">
                    {icon}
                </div>
            </div>

            <div className="flex items-baseline gap-2 mb-2 relative z-10">
                <span className={`text-4xl font-black tracking-tight ${glowRule ? 'text-rose-400' : 'text-slate-100'}`}>{value}</span>
            </div>

            <p className="text-slate-500 text-xs font-medium">{subtitle}</p>

            {trend && (
                <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center gap-2">
                    {trendUp ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span className={`text-xs font-bold ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {trend}
                    </span>
                </div>
            )}
        </div>
    );
};
