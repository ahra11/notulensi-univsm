import React, { useState, useEffect } from 'react';
import { Page, Minute } from '../types';
import { SpreadsheetService } from '../services/spreadsheet';

interface HistoryProps {
    onNavigate: (page: Page, data?: any) => void;
}

const History: React.FC<HistoryProps> = ({ onNavigate }) => {
    const [minutes, setMinutes] = useState<Minute[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadHistoryData();
    }, []);

    const loadHistoryData = async () => {
        // 1. TAMPILKAN CACHE LANGSUNG AGAR TIDAK LAMBAT
        const cached = JSON.parse(localStorage.getItem('usm_minutes_cache') || '[]');
        if (cached.length > 0) {
            setMinutes([...cached].sort((a, b) => b.id.localeCompare(a.id)));
        }

        // 2. SINKRONISASI LATAR BELAKANG
        try {
            const freshData = await SpreadsheetService.fetchAllMinutes();
            setMinutes([...freshData].sort((a, b) => b.id.localeCompare(a.id)));
        } catch (error) {
            console.error("Gagal menarik data terbaru:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredMinutes = minutes.filter(m => 
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (m.location && m.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Arsip Notulensi</h1>
                        {isLoading && <div className="size-4 border-2 border-[#252859] border-t-transparent rounded-full animate-spin"></div>}
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Riwayat seluruh dokumen rapat Universitas Sapta Mandiri</p>
                </div>

                <div className="flex gap-4 items-center w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                        <input 
                            type="text" 
                            placeholder="Cari judul rapat..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#252859] focus:border-none transition-all text-sm font-medium shadow-sm"
                        />
                    </div>
                    <button onClick={() => onNavigate('dashboard')} className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                        <span className="material-symbols-outlined">home</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Informasi Rapat</th>
                                <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">Waktu & Tempat</th>
                                <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredMinutes.length > 0 ? filteredMinutes.map((meeting) => (
                                <tr key={meeting.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-5">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest ${
                                            meeting.status === 'SIGNED' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                            <span className="material-symbols-outlined text-[14px]">
                                                {meeting.status === 'SIGNED' ? 'verified' : 'edit_document'}
                                            </span>
                                            {meeting.status === 'SIGNED' ? 'Disahkan' : 'Draft'}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <p className="font-bold text-slate-900 mb-1 group-hover:text-[#252859] transition-colors">{meeting.title}</p>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <span>{meeting.id}</span>
                                            <span className="size-1 bg-slate-200 rounded-full"></span>
                                            <span>Oleh: {meeting.submittedBy}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 hidden md:table-cell">
                                        <div className="flex flex-col gap-1 text-xs text-slate-500 font-medium">
                                            <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[14px] text-slate-400">calendar_today</span> {meeting.date}</div>
                                            <div className="flex items-center gap-2 truncate max-w-[200px]"><span className="material-symbols-outlined text-[14px] text-slate-400">location_on</span> {meeting.location || '-'}</div>
                                        </div>
                                    </td>
                                    <td className="p-5 text-right">
                                        <button 
                                            onClick={() => onNavigate('detail', meeting)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-[#252859] hover:bg-[#252859] hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                                        >
                                            Buka Dokumen
                                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="p-10 text-center">
                                        <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <span className="material-symbols-outlined text-2xl text-slate-300">search_off</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-900">Data tidak ditemukan</p>
                                        <p className="text-xs text-slate-500 mt-1">Belum ada notulensi atau pencarian tidak cocok.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default History;
