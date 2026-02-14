
import React, { useState, useMemo, useEffect } from 'react';
import { Page, Minute, MinutesStatus } from '../types';
import { SpreadsheetService } from '../services/spreadsheet';

interface HistoryProps {
    onNavigate: (page: Page, data?: any) => void;
}

const History: React.FC<HistoryProps> = ({ onNavigate }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) setUser(JSON.parse(userJson));
    }, []);

    // Simulasi data dari state lokal untuk demo, idealnya di-fetch dari SpreadsheetService.fetchAll()
    const allHistoryItems: Minute[] = useMemo(() => [
        { id: '101', title: 'Rapat Koordinasi Akademik Semester Ganjil', date: '2023-10-12', status: MinutesStatus.SIGNED, updatedAt: '09:00', location: 'Ruang Senat', content: 'Pembahasan kurikulum baru\nEvaluasi dosen\nPersiapan wisuda' },
        { id: '102', title: 'Evaluasi Kurikulum Informatika 2024', date: '2023-10-05', status: MinutesStatus.FINALIZED, updatedAt: '14:00', location: 'Lab Komputer', content: 'Integrasi AI di kurikulum' },
        { id: '103', title: 'Sosialisasi Program Pertukaran Mahasiswa', date: '2023-10-01', status: MinutesStatus.SIGNED, updatedAt: '11:00', location: 'Zoom Meeting', content: 'Pelepasan 50 mahasiswa' },
        { id: '901', title: 'Pembahasan Anggaran Hibah Penelitian', date: '2023-09-28', status: MinutesStatus.DRAFT, updatedAt: '10:30', location: 'Gedung Rektorat', content: 'Draf anggaran awal' }
    ], []);

    const filteredItems = useMemo(() => {
        return allHistoryItems.filter(item => 
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allHistoryItems, searchQuery]);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Hapus dokumen ini secara permanen?")) return;
        
        setIsDeleting(id);
        try {
            await SpreadsheetService.deleteData(id);
            alert("Dokumen berhasil dihapus dari cloud.");
            // Refresh logic di sini
        } catch (error) {
            alert("Gagal menghapus.");
        } finally {
            setIsDeleting(null);
        }
    };

    const handleEdit = (item: Minute, e: React.MouseEvent) => {
        e.stopPropagation();
        onNavigate('form', item);
    };

    return (
        <div className="pb-32 md:pb-10 min-h-screen bg-slate-50/30">
            <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 md:px-8 pt-6 pb-4 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight leading-none">Arsip Notulensi</h1>
                        <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Sistem Manajemen Dokumen</p>
                    </div>
                </div>

                <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-primary transition-colors">search</span>
                    <input 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white text-sm transition-all outline-none" 
                        placeholder="Cari judul rapat atau agenda..." 
                        type="text" 
                    />
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-5 md:px-8 mt-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                        <div 
                            key={item.id}
                            onClick={() => onNavigate('detail', item)}
                            className="group bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer relative"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                                    item.status === MinutesStatus.SIGNED ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                    {item.status}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={(e) => handleEdit(item, e)}
                                        className="size-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100"
                                    >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                    </button>
                                    <button 
                                        onClick={(e) => handleDelete(item.id, e)}
                                        disabled={isDeleting === item.id}
                                        className="size-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100"
                                    >
                                        {isDeleting === item.id ? <div className="size-3 border-2 border-red-400 border-t-red-600 rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-sm">delete</span>}
                                    </button>
                                </div>
                            </div>
                            
                            <h3 className="text-base font-bold text-slate-900 group-hover:text-primary leading-tight transition-colors mb-2 line-clamp-2">{item.title}</h3>
                            <div className="space-y-1">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">calendar_today</span>
                                    {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">location_on</span>
                                    {item.location || 'Kampus Utama'}
                                </p>
                            </div>
                        </div>
                    ))}
                    {filteredItems.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <span className="material-symbols-outlined text-6xl text-slate-200">folder_open</span>
                            <p className="text-slate-400 font-bold mt-4 uppercase tracking-widest text-xs">Tidak ada data ditemukan</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default History;
