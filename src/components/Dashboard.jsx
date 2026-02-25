import React, { useMemo, useRef, useState } from 'react';
import { FileText, Clock, CheckCircle2, AlertCircle, Users, Download, Maximize, Loader2, BarChart3 } from 'lucide-react';
import { DateUtils } from '../utils/DateUtils';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useTheme } from './ThemeProvider';

export const Dashboard = ({ data }) => {
    const dashboardRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);
    const { themeConfig } = useTheme();

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

    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        let minDate = Infinity;
        let maxDate = -Infinity;
        const validTasks = [];

        data.forEach(task => {
            if (task.nodeType !== 'task') return;
            const bounds = DateUtils.getTaskBounds(task);
            const baseline = DateUtils.getBaselineBounds(task);

            if (bounds && isFinite(bounds.endTime)) {
                minDate = Math.min(minDate, bounds.startTime || bounds.endTime);
                maxDate = Math.max(maxDate, bounds.endTime);
                validTasks.push({ ...task, bounds, baseline });
            }
        });

        if (minDate === Infinity || maxDate === -Infinity) return [];

        const dayMs = 1000 * 60 * 60 * 24;
        const result = [];
        const totalTasks = validTasks.length;

        for (let time = minDate; time <= maxDate + (dayMs * 2); time += dayMs) {
            let dailyActualCost = 0;
            let dailyBaselineCost = 0;
            let completedTasks = 0;
            let idealCompletedTasks = 0;

            validTasks.forEach(task => {
                const cost = parseInt(task.cost, 10) || 0;

                if (task.bounds.endTime <= time) {
                    dailyActualCost += cost;
                    completedTasks++;
                }

                if (task.baseline && task.baseline.baselineEndTime <= time) {
                    dailyBaselineCost += cost;
                    idealCompletedTasks++;
                } else if (!task.baseline && task.bounds.endTime <= time) { // fallback
                    dailyBaselineCost += cost;
                    idealCompletedTasks++;
                }
            });

            result.push({
                date: new Date(time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                timestamp: time,
                ActualCost: dailyActualCost,
                BaselineCost: dailyBaselineCost,
                RemainingTasks: totalTasks - completedTasks,
                IdealRemaining: totalTasks - idealCompletedTasks
            });
        }

        // Optimize data points to prevent chart lag if too many days (e.g. > 45)
        if (result.length > 45) {
            const step = Math.ceil(result.length / 30);
            return result.filter((_, i) => i % step === 0 || i === result.length - 1);
        }

        return result;
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
                        {themeConfig?.logoUrl ? (
                            <img src={themeConfig.logoUrl} alt="Logo" className="max-h-12 object-contain" />
                        ) : (
                            <FileText className="w-8 h-8" style={{ color: 'var(--brand-primary, #818cf8)' }} />
                        )}
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
                    icon={<FileText className="w-5 h-5" style={{ color: 'var(--brand-primary, #818cf8)' }} />}
                    trend={`${metrics.percentComplete}% Progress`}
                    trendUp={true}
                    borderClass="border-slate-700/50"
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

            {/* Advanced Graphical Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Burn-down Chart */}
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-6 h-96 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-teal-500 to-indigo-400 left-0"></div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-1">Agile Sprint Burn-down</h3>
                    <p className="text-xs text-slate-400 mb-6">Task completion velocity: Actual remaining vs Ideal trajectory</p>
                    <div className="flex-1 w-full h-full min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickMargin={10} />
                                <YAxis stroke="#94a3b8" fontSize={10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc', fontSize: '12px', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                <Line type="stepAfter" dataKey="RemainingTasks" name="Actual Remaining" stroke="#38bdf8" strokeWidth={3} dot={false} />
                                <Line type="linear" dataKey="IdealRemaining" name="Ideal Remaining" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* S-Curve Chart */}
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-6 h-96 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-amber-400 to-rose-400 left-0"></div>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-200 mb-1">Executive S-Curve</h3>
                            <p className="text-xs text-slate-400 mb-6">Cumulative value aggregation: Earned Value vs Planned Value</p>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-black text-rose-300 drop-shadow-md">{metrics.totalCost}</span>
                            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Total Val.</p>
                        </div>
                    </div>

                    <div className="flex-1 w-full h-full min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickMargin={10} />
                                <YAxis stroke="#94a3b8" fontSize={10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc', fontSize: '12px', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                <Area type="monotone" dataKey="ActualCost" name="Earned Value (Actual CF)" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.2} strokeWidth={3} />
                                <Area type="monotone" dataKey="BaselineCost" name="Planned Value (Baseline)" stroke="#f43f5e" fill="transparent" strokeWidth={2} strokeDasharray="4 4" />
                            </AreaChart>
                        </ResponsiveContainer>
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
