
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Page, Minute, MinutesStatus } from '../types';
import Logo from '../components/Logo';

interface HistoryProps {
    onNavigate: (page: Page, data?: any) => void;
}

const History: React.FC<HistoryProps> = ({ onNavigate }) => {
    const [filter, setFilter] = useState('Semua');
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    
    const searchInputRef = useRef<HTMLInputElement>(null);

    const allHistoryItems: Minute[] = useMemo(() => [
        { id: '101', title: 'Rapat Koordinasi Akademik Semester Ganjil', date: '2023-10-12', status: MinutesStatus.SIGNED, updatedAt: '09:00' },
        { id: '102', title: 'Evaluasi Kurikulum Informatika 2024', date: '2023-10-05', status: MinutesStatus.FINALIZED, updatedAt: '14:00' },
        { id: '103', title: 'Sosialisasi Program Pertukaran Mahasiswa', date: '2023-10-01', status: MinutesStatus.SIGNED, updatedAt: '11:00' },
        { id: '901', title: 'Pembahasan Anggaran Hibah Penelitian', date: '2023-09-28', status: MinutesStatus.SIGNED, updatedAt: '10:30' },
        { id: '902', title: 'Rapat Kerja Tahunan Universitas', date: '2023-09-15', status: MinutesStatus.SIGNED, updatedAt: '08:00' }
    ], []);

    const filteredItems = useMemo(() => {
        return allHistoryItems.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = filter === 'Semua' || 
                                   (filter === 'Tertandatangani' && item.status === MinutesStatus.SIGNED) ||
                                   (filter === 'Final' && item.status === MinutesStatus.FINALIZED) ||
                                   (filter === 'Draft' && item.status === MinutesStatus.DRAFT);
            
            const itemDate = new Date(item.date);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;
            const matchesDate = (!start || itemDate >= start) && (!end || itemDate <= end);

            return matchesSearch && matchesCategory && matchesDate;
        });
    }, [allHistoryItems, searchQuery, filter, startDate, endDate]);

    const groupedData = useMemo(() => {
        const groups: { [key: string]: Minute[] } = {};
        filteredItems.forEach(item => {
            const date = new Date(item.date);
            const monthYear = date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
            if (!groups[monthYear]) groups[monthYear] = [];
            groups[monthYear].push(item);
        });
        return Object.entries(groups).map(([month, items]) => ({ month, items }));
    }, [filteredItems]);

    return (
        <div className="pb-32 md:pb-10 min-h-screen bg-slate-50/30">
            <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 md:px-8 pt-6 pb-4 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="md:hidden">
                            <span className="material-symbols-outlined text-primary text-3xl">history</span>
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight leading-none">Arsip Notulensi</h1>
                            <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Dokumen Resmi Universitas</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 items-center">
                    <div className="flex gap-2 w-full">
                        <div className="relative flex-1 group">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-primary transition-colors">search</span>
                            <input 
                                ref={searchInputRef}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-12 pl-10 pr-16 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white text-sm transition-all outline-none" 
                                placeholder="Cari judul rapat..." 
                                type="text" 
                            />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-5 md:px-8 mt-10 space-y-12">
                {groupedData.map((group) => (
                    <div key={group.month}>
                        <div className="flex items-center gap-4 mb-6">
                            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-[0.2em]">{group.month}</h2>
                            <div className="flex-1 h-px bg-slate-100"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {group.items.map((item) => (
                                <div 
                                    key={item.id}
                                    onClick={() => onNavigate('detail', item)}
                                    className="group bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer"
                                >
                                    <h3 className="text-base font-bold text-slate-900 group-hover:text-primary leading-tight transition-colors mb-4 line-clamp-2">{item.title}</h3>
                                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-tight">
                                        {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
};

export default History;
