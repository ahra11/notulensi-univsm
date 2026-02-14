
import React, { useState, useEffect, useMemo } from 'react';
import { Page, Minute, MinutesStatus } from '../types';
import { SpreadsheetService } from '../services/spreadsheet';

interface HistoryProps {
    onNavigate: (page: Page, data?: any) => void;
}

const History: React.FC<HistoryProps> = ({ onNavigate }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [allHistoryItems, setAllHistoryItems] = useState<Minute[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setIsLoading(true);
        try {
            const data = await SpreadsheetService.fetchAll();
            setAllHistoryItems(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredItems = useMemo(() => {
        return allHistoryItems.filter(item => 
            item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.content?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allHistoryItems, searchQuery]);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Apakah Anda yakin ingin menghapus dokumen ini secara permanen dari cloud?")) return;
        
        setIsDeleting(id);
        try {
            await SpreadsheetService.deleteData(id);
            // Update UI secara instan (Optimistic UI)
            setAllHistoryItems(prev => prev.filter(item => item.id !== id));
            alert("Dokumen berhasil dihapus dari cloud.");
        } catch (error) {
            alert("Gagal menghapus dokumen. Periksa koneksi internet Anda.");
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
                        <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Sistem Manajemen Dokumen Terpusat</p>
                    </div>
                    <button onClick={loadHistory} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                        <span className={`material-symbols-outlined text-slate-400 ${isLoading ? 'animate-spin' : ''}`}>sync</span>
                    </button>
                </div>

                <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-primary transition-colors">search</span>
                    <input 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white text-sm transition-all outline-none" 
                        placeholder="Cari judul rapat, isi pembahasan, atau agenda..." 
                        type="text" 
                    />
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-5 md:px-8 mt-10">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-48 bg-slate-200 animate-pulse rounded-3xl"></div>
                        ))}
                    </div>
                ) : filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((item) => (
                            <div 
                                key={item.id}
                                onClick={() => onNavigate('detail', item)}
                                className="group bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer relative"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                                        item.status === MinutesStatus.SIGNED ? 'bg-green-100 text-green-700' : 
                                        item.status === MinutesStatus.DRAFT ? 'bg-amber-100 text-amber-700' : 'bg-primary/5 text-primary'
                                    }`}>
                                        {item.status}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={(e) => handleEdit(item, e)}
                                            className="size-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100"
                                            title="Edit Notulensi"
                                        >
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                        </button>
                                        <button 
                                            onClick={(e) => handleDelete(item.id, e)}
                                            disabled={isDeleting === item.id}
                                            className="size-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100"
                                            title="Hapus Permanen"
                                        >
                                            {isDeleting === item.id ? <div className="size-3 border-2 border-red-400 border-t-red-600 rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-sm">delete</span>}
                                        </button>
                                    </div>
                                </div>
                                
                                <h3 className="text-base font-bold text-slate-900 group-hover:text-primary leading-tight transition-colors mb-2 line-clamp-2">{item.title}</h3>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs">calendar_today</span>
                                        {item.date ? new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Tanpa Tanggal'}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs">location_on</span>
                                        {item.location || 'Kampus Utama'}
                                    </p>
                                    <p className="text-[9px] text-slate-300 font-medium truncate mt-2">Update: {item.updatedAt}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-32 text-center">
                        <span className="material-symbols-outlined text-6xl text-slate-100">folder_open</span>
                        <p className="text-slate-400 font-bold mt-4 uppercase tracking-widest text-xs">
                            {searchQuery ? 'Tidak ada hasil untuk pencarian ini' : 'Belum ada arsip notulensi tersimpan'}
                        </p>
                        {!searchQuery && (
                            <button onClick={() => onNavigate('form')} className="mt-4 px-6 py-2 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20">
                                Buat Notulensi Baru
                            </button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default History;
