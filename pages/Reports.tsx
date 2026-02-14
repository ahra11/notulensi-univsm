
import React, { useState, useEffect, useMemo } from 'react';
import { Page, Minute, MinutesStatus } from '../types';
import { SpreadsheetService } from '../services/spreadsheet';

interface ReportsProps {
    onNavigate: (page: Page) => void;
}

const Reports: React.FC<ReportsProps> = ({ onNavigate }) => {
    const [minutes, setMinutes] = useState<Minute[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await SpreadsheetService.fetchAll();
            setMinutes(data);
        } catch (error) {
            console.error("Gagal memuat data laporan:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 1. Hitung Statistik Utama
    const stats = useMemo(() => {
        const total = minutes.length;
        const draft = minutes.filter(m => m.status === MinutesStatus.DRAFT).length;
        const signed = minutes.filter(m => m.status === MinutesStatus.SIGNED).length;
        
        return [
            { label: 'Total Rapat', value: total.toString(), icon: 'groups', color: 'bg-primary' },
            { label: 'Draft', value: draft.toString(), icon: 'edit_document', color: 'bg-amber-500' },
            { label: 'Tandatangan', value: signed.toString(), icon: 'verified', color: 'bg-green-500' },
        ];
    }, [minutes]);

    // 2. Hitung Data Grafik Bulanan (4 Bulan Terakhir)
    const monthlyActivity = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
        const currentMonth = new Date().getMonth();
        const lastFourMonths = [];

        for (let i = 3; i >= 0; i--) {
            const mIdx = (currentMonth - i + 12) % 12;
            lastFourMonths.push({ month: months[mIdx], count: 0, index: mIdx });
        }

        minutes.forEach(m => {
            if (!m.date) return;
            const mDate = new Date(m.date);
            const mIdx = mDate.getMonth();
            const found = lastFourMonths.find(f => f.index === mIdx);
            if (found) found.count++;
        });

        const maxCount = Math.max(...lastFourMonths.map(f => f.count), 1);
        return lastFourMonths.map(f => ({
            ...f,
            percent: `${(f.count / maxCount) * 100}%`
        }));
    }, [minutes]);

    // 3. Hitung Kontributor Teraktif
    const topContributors = useMemo(() => {
        const groups: Record<string, { name: string, total: number, signed: number }> = {};
        
        minutes.forEach(m => {
            const name = m.submittedBy || 'Anonim';
            if (!groups[name]) groups[name] = { name, total: 0, signed: 0 };
            groups[name].total++;
            if (m.status === MinutesStatus.SIGNED) groups[name].signed++;
        });

        return Object.values(groups)
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);
    }, [minutes]);

    return (
        <div className="pb-32 md:pb-10 min-h-screen bg-white">
            <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 md:px-8 py-6 flex items-center justify-between no-print">
                <div className="flex items-center gap-3">
                    <button onClick={() => onNavigate('dashboard')} className="md:hidden size-10 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-600">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Laporan & Statistik</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Monitor Performa Digital UNIVSM</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={loadData} className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">
                        <span className={`material-symbols-outlined ${isLoading ? 'animate-spin' : ''}`}>sync</span>
                    </button>
                    <button onClick={() => window.print()} className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-lg">download</span> Unduh PDF
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-5 md:px-8 py-10 space-y-12">
                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {stats.map((s, i) => (
                        <div key={i} className="p-6 md:p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:bg-white hover:shadow-xl transition-all">
                            <div className={`size-14 md:size-16 rounded-2xl ${s.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                <span className="material-symbols-outlined text-2xl md:text-3xl">{s.icon}</span>
                            </div>
                            <div>
                                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{s.label}</p>
                                <p className="text-2xl md:text-3xl font-black text-slate-900">{isLoading ? '...' : s.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Graph Area */}
                <section className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <span className="size-2 bg-primary rounded-full"></span> Aktivitas Rapat Bulanan
                        </h2>
                        <span className="text-[10px] font-bold text-primary bg-primary/5 px-4 py-1.5 rounded-full uppercase tracking-widest">Data Real-time</span>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-4 bg-slate-50/50 p-6 md:p-10 rounded-[3rem] border border-slate-100">
                        {monthlyActivity.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                <div className="text-[10px] font-bold text-slate-400 uppercase opacity-0 group-hover:opacity-100 transition-opacity">{d.count}</div>
                                <div 
                                    className="w-full max-w-[40px] bg-primary rounded-t-xl transition-all duration-700 shadow-lg shadow-primary/10 relative" 
                                    style={{ height: isLoading ? '0%' : d.percent }}
                                >
                                    <div className="absolute inset-0 bg-white/10 rounded-t-xl opacity-0 group-hover:opacity-100"></div>
                                </div>
                                <div className="text-[10px] md:text-xs font-bold text-slate-900">{d.month}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Table View */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <span className="size-2 bg-green-500 rounded-full"></span> Kontributor Teraktif
                        </h2>
                    </div>
                    <div className="overflow-hidden border border-slate-100 rounded-[2rem] bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/80 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-5 font-bold text-slate-400 uppercase tracking-widest text-[9px]">Nama Civitas</th>
                                        <th className="px-6 py-5 font-bold text-slate-400 uppercase tracking-widest text-[9px]">Total Notulen</th>
                                        <th className="px-6 py-5 font-bold text-slate-400 uppercase tracking-widest text-[9px]">Tingkat Verifikasi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {isLoading ? (
                                        [1, 2, 3].map(i => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={3} className="px-6 py-4 h-12 bg-slate-50/50"></td>
                                            </tr>
                                        ))
                                    ) : topContributors.length > 0 ? (
                                        topContributors.map((row, i) => (
                                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-slate-700">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">
                                                            {row.name.charAt(0)}
                                                        </div>
                                                        {row.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 font-medium">{row.total} Dokumen</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full max-w-[100px] overflow-hidden">
                                                            <div 
                                                                className="h-full bg-green-500 rounded-full" 
                                                                style={{ width: `${(row.signed / row.total) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-green-600 font-bold text-[10px]">
                                                            {Math.round((row.signed / row.total) * 100)}%
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-10 text-center text-slate-400 italic text-xs">
                                                Belum ada data kontribusi yang tersedia.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Reports;
