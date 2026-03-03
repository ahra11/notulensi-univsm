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
        loadHistoryData();
    }, []);

    const loadHistoryData = async () => {
        // Hapus paksa memori lama yang berisi foto raksasa
        localStorage.removeItem('usm_minutes_cache'); 
        console.log("Memori cache lama yang rusak berhasil dibersihkan.");

        try {
            const freshData = await SpreadsheetService.fetchAllMinutes();
            setMinutes([...freshData].sort((a, b) => b.id.localeCompare(a.id)));
            
            // Simpan cache baru yang sudah ringan
            try {
                localStorage.setItem('usm_minutes_cache', JSON.stringify(freshData));
            } catch (e) {
                console.warn("Memori laptop masih terdeteksi penuh, melewati penyimpanan cache...");
            }
        } catch (error) {
            console.error("Gagal menarik data terbaru:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation(); 
        
        if (window.confirm("Peringatan: Anda akan menghapus dokumen ini secara permanen dari server. Lanjutkan?")) {
            setIsLoading(true);
            try {
                const response = await SpreadsheetService.deleteData(id);
                
                if (response && response.success === false) {
                    throw new Error(response.message || "Ditolak oleh Server Google");
                }
                
                const newMinutes = minutes.filter(m => m.id !== id);
                setMinutes(newMinutes);
                
                try {
                    localStorage.setItem('usm_minutes_cache', JSON.stringify(newMinutes));
                } catch (e) { 
                    console.warn("Abaikan peringatan memori penuh, Cloud sudah berhasil terhapus."); 
                }

                alert("Dokumen berhasil dihapus secara permanen.");
            } catch (error: any) {
                console.error(error);
                alert("GAGAL MENGHAPUS!\n\nPesan Error: " + (error.message || "Gagal menghubungi server."));
            } finally {
                setIsLoading(false);
            }
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
                            type="text" placeholder="Cari judul rapat..." 
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
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
                                <tr key={meeting.id} className="hover:bg-slate-
