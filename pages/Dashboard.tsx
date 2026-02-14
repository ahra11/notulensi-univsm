
import React, { useState, useEffect } from 'react';
import { Page, MinutesStatus, Minute } from '../types';
import { SpreadsheetService } from '../services/spreadsheet';

interface DashboardProps {
    onNavigate: (page: Page, data?: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    const [user, setUser] = useState<any>(null);
    const [recentMinutes, setRecentMinutes] = useState<Minute[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) {
            setUser(JSON.parse(userJson));
        }
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await SpreadsheetService.fetchAll();
            setRecentMinutes(data.slice(0, 3));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinMeet = () => {
        // Mengarahkan ke Google Meet. Menggunakan authuser parameter sebagai petunjuk sesi
        // jika browser login dengan banyak akun.
        const meetBaseUrl = "https://meet.google.com/new";
        window.open(meetBaseUrl, "_blank");
    };

    return (
        <div className="pb-24 md:pb-10">
            <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 md:px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="md:hidden">
                        <span className="material-symbols-outlined text-primary text-3xl">account_balance</span>
                    </div>
                    <div className="block">
                        <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight leading-none">Dashboard Beranda</h1>
                        <p className="text-[10px] md:text-xs text-slate-400 font-medium mt-0.5">Sistem Notulensi Digital USM</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={loadData} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
                        <span className={`material-symbols-outlined ${isLoading ? 'animate-spin' : ''}`}>refresh</span>
                    </button>
                    <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                    </button>
                </div>
            </header>

            <div className="max-w-6xl mx-auto">
                <div className="px-5 md:px-8 pt-6 md:pt-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Halo, {user?.name || 'Pengguna'}</h2>
                    <p className="text-slate-500 text-sm md:text-base mt-1">
                        {isLoading ? 'Sedang mensinkronkan data cloud...' : `Anda memiliki ${recentMinutes.length} aktivitas terbaru.`}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-5 md:px-8 mt-8">
                    <div className="lg:col-span-8 space-y-10">
                        <section>
                            <h3 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Akses Cepat</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <button 
                                    onClick={() => onNavigate('form')}
                                    className="flex flex-col md:flex-row items-center gap-3 p-5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 transition-all hover:brightness-110 hover:translate-y-[-2px] active:scale-95 group"
                                >
                                    <div className="bg-white/20 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-2xl">add_circle</span>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <span className="text-xs font-bold block">Notulensi Baru</span>
                                        <span className="text-[10px] opacity-70 hidden md:block">Catat rapat baru</span>
                                    </div>
                                </button>
                                <button 
                                    onClick={handleJoinMeet}
                                    className="flex flex-col md:flex-row items-center gap-3 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm transition-all hover:bg-slate-50 hover:translate-y-[-2px] active:scale-95 group"
                                >
                                    <div className="bg-primary/5 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-primary text-2xl">video_camera_front</span>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <span className="text-xs font-bold text-slate-700 block">Gabung Rapat</span>
                                        <span className="text-[10px] text-slate-400 hidden md:block">Buka Google Meet</span>
                                    </div>
                                </button>
                                <button 
                                    onClick={() => onNavigate('history')}
                                    className="flex flex-col md:flex-row items-center gap-3 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm transition-all hover:bg-slate-50 hover:translate-y-[-2px] active:scale-95 group"
                                >
                                    <div className="bg-primary/5 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-primary text-2xl">search</span>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <span className="text-xs font-bold text-slate-700 block">Cari Dokumen</span>
                                        <span className="text-[10px] text-slate-400 hidden md:block">Arsip lama</span>
                                    </div>
                                </button>
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-slate-900">Notulensi Terakhir</h3>
                                <button onClick={() => onNavigate('history')} className="text-[10px] text-primary font-bold uppercase tracking-wider">Tampilkan Semua</button>
                            </div>
                            
                            {isLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-2xl"></div>)}
                                </div>
                            ) : recentMinutes.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
                                    {recentMinutes.map((item) => (
                                        <div 
                                            key={item.id}
                                            onClick={() => onNavigate('detail', item)}
                                            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:border-primary/20 hover:shadow-md cursor-pointer group"
                                        >
                                            <div className={`size-12 rounded-xl flex items-center justify-center transition-colors ${
                                                item.status === MinutesStatus.SIGNED ? 'bg-green-50 text-green-600' :
                                                item.status === MinutesStatus.DRAFT ? 'bg-amber-50 text-amber-600' : 'bg-primary/5 text-primary'
                                            }`}>
                                                <span className="material-symbols-outlined">
                                                    {item.status === MinutesStatus.SIGNED ? 'verified_user' :
                                                     item.status === MinutesStatus.DRAFT ? 'edit_note' : 'task_alt'}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-sm text-slate-900 truncate">{item.title}</h4>
                                                <p className="text-[10px] text-slate-400 mt-0.5">{item.date} • {item.updatedAt}</p>
                                            </div>
                                            <div className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                                item.status === MinutesStatus.SIGNED ? 'bg-green-100 text-green-700' :
                                                item.status === MinutesStatus.DRAFT ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'
                                            }`}>
                                                {item.status}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-slate-400 text-sm font-medium">Belum ada notulensi yang tersimpan.</p>
                                    <button onClick={() => onNavigate('form')} className="text-primary text-xs font-bold mt-2 hover:underline">Buat Sekarang</button>
                                </div>
                            )}
                        </section>
                    </div>

                    <div className="lg:col-span-4">
                        <section className="bg-slate-50/50 md:bg-white rounded-3xl md:p-6 md:border md:border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-lg font-bold text-slate-900">Jadwal Rapat</h3>
                                <button className="size-8 rounded-full bg-primary/5 text-primary flex items-center justify-center hover:bg-primary/10 transition-colors">
                                    <span className="material-symbols-outlined text-lg">calendar_month</span>
                                </button>
                            </div>
                            <div className="p-6 text-center">
                                <span className="material-symbols-outlined text-4xl text-slate-200">event_busy</span>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Tidak ada rapat hari ini</p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
