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

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await SpreadsheetService.fetchAllMinutes();
            // Urutkan dari yang terbaru
            setMinutes([...data].sort((a, b) => b.id.localeCompare(a.id)));
        } catch (error) {
            console.error("Gagal memuat arsip", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus notulensi ini secara permanen?')) {
            setIsLoading(true);
            try {
                await SpreadsheetService.deleteData(id);
                setMinutes(minutes.filter(m => m.id !== id));
                alert('Arsip berhasil dihapus!');
            } catch (error) {
                alert('Gagal menghapus arsip.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const filteredMinutes = minutes.filter(m => 
        m.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-[#252859] tracking-tight">Arsip Notulensi</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Kelola dan lihat riwayat dokumen rapat</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchData} className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all">
                        <span className={`material-symbols-outlined ${isLoading ? 'animate-spin' : ''}`}>sync</span>
                    </button>
                    <div className="relative flex-1 md:w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input 
                            type="text" placeholder="Cari judul rapat..." 
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#252859] transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="size-8 border-4 border-[#252859]/20 border-t-[#252859] rounded-full animate-spin"></div>
                    </div>
                )}
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                                <th className="px-6 py-4">Informasi Kegiatan</th>
                                <th className="px-6 py-4">Tanggal</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredMinutes.length > 0 ? filteredMinutes.map((minute) => (
                                <tr key={minute.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-slate-700">{minute.title}</p>
                                        <p className="text-[10px] text-slate-500 uppercase flex items-center gap-1 mt-1">
                                            <span className="material-symbols-outlined text-[12px]">location_on</span>
                                            {minute.location || '-'}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-500">{minute.date}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-widest ${minute.status === 'SIGNED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {minute.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => onNavigate('detail', minute)} className="px-4 py-2 bg-[#252859] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all">
                                                Lihat
                                            </button>
                                            {(currentUser.role === 'SUPER_ADMIN' || currentUser.name === minute.submittedBy) && (
                                                <button onClick={() => onNavigate('form', minute)} className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-[#252859] hover:text-white transition-all">
                                                    <span className="material-symbols-outlined text-[16px]">edit</span>
                                                </button>
                                            )}
                                            {(currentUser.role === 'SUPER_ADMIN') && (
                                                <button onClick={() => handleDelete(minute.id)} className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">
                                        Tidak ada arsip yang ditemukan.
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
