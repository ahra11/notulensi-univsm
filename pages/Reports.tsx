
import React from 'react';
import { Page } from '../types';

interface ReportsProps {
    onNavigate: (page: Page) => void;
}

const Reports: React.FC<ReportsProps> = ({ onNavigate }) => {
    const stats = [
        { label: 'Total Rapat', value: '42', icon: 'groups', color: 'bg-blue-500' },
        { label: 'Draft', value: '8', icon: 'edit_document', color: 'bg-amber-500' },
        { label: 'Tandatangan', value: '34', icon: 'verified', color: 'bg-green-500' },
    ];

    const monthlyData = [
        { month: 'Jul', count: 12, percent: '40%' },
        { month: 'Agt', count: 15, percent: '50%' },
        { month: 'Sep', count: 22, percent: '75%' },
        { month: 'Okt', count: 30, percent: '100%' },
    ];

    return (
        <div className="pb-32 md:pb-10 min-h-screen bg-white">
            <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-8 py-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Laporan & Statistik</h1>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Monitor Performa Digital UNIVSM</p>
                </div>
                <button onClick={() => window.print()} className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">download</span> Unduh PDF
                </button>
            </header>

            <main className="max-w-6xl mx-auto px-8 py-10 space-y-12">
                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((s, i) => (
                        <div key={i} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
                            <div className={`size-16 rounded-2xl ${s.color} text-white flex items-center justify-center shadow-lg`}>
                                <span className="material-symbols-outlined text-3xl">{s.icon}</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{s.label}</p>
                                <p className="text-3xl font-black text-slate-900">{s.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Graph Area */}
                <section className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold">Aktivitas Rapat Bulanan</h2>
                        <span className="text-xs font-bold text-primary bg-primary/5 px-4 py-1.5 rounded-full uppercase tracking-widest">Tahun Akademik 2023/2024</span>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-4 bg-slate-50/50 p-8 rounded-[3rem] border border-slate-100">
                        {monthlyData.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4">
                                <div className="text-[10px] font-bold text-slate-400 uppercase">{d.count}</div>
                                <div 
                                    className="w-full bg-primary rounded-xl transition-all duration-1000 shadow-lg shadow-primary/20" 
                                    style={{ height: d.percent }}
                                ></div>
                                <div className="text-xs font-bold text-slate-900">{d.month}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Table View */}
                <section>
                    <h2 className="text-lg font-bold mb-6">Unit Kerja Teraktif</h2>
                    <div className="overflow-hidden border border-slate-100 rounded-[2rem]">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Unit Kerja</th>
                                    <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Total Notulen</th>
                                    <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Tersertifikasi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {[
                                    { unit: 'Fakultas Teknologi Informasi', total: 18, sign: 15 },
                                    { unit: 'Biro Administrasi Umum', total: 12, sign: 10 },
                                    { unit: 'Lembaga Penjaminan Mutu', total: 8, sign: 8 },
                                    { unit: 'Senat Akademik', total: 4, sign: 1 },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-700">{row.unit}</td>
                                        <td className="px-6 py-4 text-slate-500 font-medium">{row.total}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-green-600 font-bold">
                                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                                {Math.round((row.sign / row.total) * 100)}%
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Reports;
