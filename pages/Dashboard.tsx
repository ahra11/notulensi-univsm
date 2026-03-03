import React, { useState, useEffect } from 'react';
import { Page, Minute, Schedule } from '../types';
import { SpreadsheetService } from '../services/spreadsheet';

interface DashboardProps {
    onNavigate: (page: Page, data?: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    const [stats, setStats] = useState({ total: 0, signed: 0, draft: 0 });
    const [recentMeetings, setRecentMeetings] = useState<Minute[]>([]);
    const [upcomingSchedules, setUpcomingSchedules] = useState<Schedule[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        const cachedMinutes = JSON.parse(localStorage.getItem('usm_minutes_cache') || '[]');
        const cachedSchedules = JSON.parse(localStorage.getItem('usm_schedules') || '[]');
        updateDisplay(cachedMinutes, cachedSchedules);

        try {
            const [freshMinutes, freshSchedules] = await Promise.all([
                SpreadsheetService.fetchAllMinutes(),
                SpreadsheetService.getSchedules()
            ]);
            updateDisplay(freshMinutes, freshSchedules);
        } catch (error) {
            console.error("Gagal sinkronisasi otomatis:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateDisplay = (minutes: Minute[], schedules: Schedule[]) => {
        const sortedMinutes = [...minutes].sort((a, b) => b.id.localeCompare(a.id));
        
        // PENDETEKSI WAKTU: Filter hanya rapat yang belum lewat waktunya
        const now = new Date();
        const upcomingOnly = schedules.filter(sch => {
            if (!sch.date || !sch.time) return true;
            const schDate = new Date(`${sch.date}T${sch.time}`);
            return schDate >= now; // Hanya ambil yang masih di masa depan
        });

        // Urutkan jadwal terdekat dari hari ini
        const sortedSchedules = [...upcomingOnly].sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

        setStats({
            total: minutes.length,
            signed: minutes.filter(m => m.status === 'SIGNED').length,
            draft: minutes.filter(m => m.status === 'DRAFT').length
        });
        setRecentMeetings(sortedMinutes.slice(0, 3));
        setUpcomingSchedules(sortedSchedules.slice(0, 3));
    };

    const renderLocation = (loc: string) => {
        if (!loc) return '-';
        const isLink = loc.includes('meet.google.com') || loc.includes('zoom.us') || loc.includes('http');
        
        if (isLink) {
            let finalUrl = loc;
            if (loc.includes('meet.google.com') && !loc.includes('http')) {
                finalUrl = 'https://' + loc;
            }
            return (
                <a href={finalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 hover:underline">
                    <span className="material-symbols-outlined text-[14px]">videocam</span>
                    Gabung Rapat Online
                </a>
            );
        }
        return <span className="truncate">{loc}</span>;
    };

    return (
        <div className="p-4 md:p-8 animate-in fade-in duration-700">
            <div className="mb-10 bg-[#252859] p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20">
                <div className="relative z-10">
                    <h1 className="text-2xl md:text-3xl font-black mb-2 flex items-center gap-3">
                        Selamat Datang, {currentUser.name}!
                        {isLoading && <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                    </h1>
                    <p className="text-indigo-200 text-sm font-medium italic">Portal Digital Universitas Sapta Mandiri • {currentUser.role}</p>
                </div>
                <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[12rem] opacity-10 rotate-12">school</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:border-primary/20 transition-colors">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Notulensi</p>
                    <h2 className="text-3xl font-black text-slate-900">{stats.total}</h2>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:border-green-200 transition-colors">
                    <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-1">Sudah Disahkan</p>
                    <h2 className="text-3xl font-black text-green-600">{stats.signed}</h2>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:border-amber-200 transition-colors">
                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Draft Notulensi</p>
                    <h2 className="text-3xl font-black text-amber-600">{stats.draft}</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            Agenda Mendatang
                            <span className="bg-primary/10 text-primary text-[10px] px-2 py-1 rounded-lg">{upcomingSchedules.length}</span>
                        </h2>
                        <button onClick={() => onNavigate('schedules')} className="text-xs font-bold text-[#252859] hover:underline uppercase tracking-widest">Lihat Semua</button>
                    </div>
                    <div className="space-y-4">
                        {upcomingSchedules.length > 0 ? upcomingSchedules.map(sch => (
                            <div key={sch.id} className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center gap-4 hover:shadow-lg hover:border-primary/10 transition-all group">
                                <div className="size-12 bg-indigo-50 text-[#252859] group-hover:bg-primary group-hover:text-white rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors">
                                    <span className="material-symbols-outlined">calendar_month</span>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <h4 className="font-bold text-slate-900 truncate group-hover:text-primary transition-colors">{sch.title}</h4>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{sch.date}</p>
                                        <span className="size-1 bg-slate-200 rounded-full"></span>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{sch.time} WIB</p>
                                    </div>
                                    <div className="text-xs mt-1">
                                        {renderLocation(sch.location)}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center text-slate-400">
                                <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
                                <p className="text-xs font-bold uppercase tracking-widest">Belum ada agenda rapat terdekat</p>
                            </div>
                        )}
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Notulensi Terakhir</h2>
                        <button onClick={() => onNavigate('history')} className="text-xs font-bold text-[#252859] hover:underline uppercase tracking-widest">Lihat Semua</button>
                    </div>
                    <div className="space-y-4">
                        {recentMeetings.length > 0 ? recentMeetings.map(meeting => (
                            <div key={meeting.id} onClick={() => onNavigate('detail', meeting)} className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center justify-between hover:shadow-lg hover:border-primary/10 transition-all cursor-pointer group">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="size-12 bg-slate-50 text-slate-400 group-hover:bg-[#252859] group-hover:text-white rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors">
                                        <span className="material-symbols-outlined">description</span>
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="font-bold text-slate-900 truncate group-hover:text-primary transition-colors">{meeting.title}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{meeting.date}</p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-slate-300 group-hover:text-[#252859] transition-colors group-hover:translate-x-1">arrow_forward_ios</span>
                            </div>
                        )) : (
                            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center text-slate-400">
                                <span className="material-symbols-outlined text-4xl mb-2">folder_open</span>
                                <p className="text-xs font-bold uppercase tracking-widest">Belum ada notulensi</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
