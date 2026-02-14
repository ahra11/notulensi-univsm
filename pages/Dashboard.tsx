
import React, { useState, useEffect } from 'react';
import { Page, MinutesStatus, Minute } from '../types';

interface DashboardProps {
    onNavigate: (page: Page, data?: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    const [userName, setUserName] = useState('Pengguna');

    useEffect(() => {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) {
            const user = JSON.parse(userJson);
            setUserName(user.name);
        }
    }, []);

    const recentMinutes: Minute[] = [
        {
            id: '1',
            title: 'Audit Keuangan Semester Ganjil',
            date: '12 Okt 2023',
            status: MinutesStatus.SIGNED,
            updatedAt: '08:30',
        },
        {
            id: '2',
            title: 'Evaluasi Mahasiswa Berprestasi',
            date: '11 Okt 2023',
            status: MinutesStatus.FINALIZED,
            updatedAt: 'Kemarin',
        },
        {
            id: '3',
            title: 'Perencanaan Dies Natalis ke-74',
            date: 'Kemarin',
            status: MinutesStatus.DRAFT,
            updatedAt: 'Kemarin',
        }
    ];

    const upcomingMeetings = [
        {
            id: 'm1',
            title: 'Rapat Senat Akademik',
            date: 'Hari Ini',
            time: '10:00 - 12:30 WIB',
            location: 'Ruang Sidang Utama',
            status: 'Mulai dalam 15m'
        },
        {
            id: 'm2',
            title: 'Review Kurikulum MBKM',
            date: 'Besok',
            time: '09:00 - 11:00 WIB',
            location: 'Zoom Meeting',
            status: 'Terjadwal'
        }
    ];

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
                    <div className="hidden lg:flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                        <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
                        <input type="text" placeholder="Cari dokumen..." className="bg-transparent border-none text-xs focus:ring-0 w-32 xl:w-48 p-0" />
                    </div>
                    <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                    </button>
                </div>
            </header>

            <div className="max-w-6xl mx-auto">
                <div className="px-5 md:px-8 pt-6 md:pt-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Halo, {userName}</h2>
                    <p className="text-slate-500 text-sm md:text-base mt-1">Anda memiliki <span className="text-primary font-bold">{upcomingMeetings.length} rapat</span> terjadwal hari ini.</p>
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
                                <button className="flex flex-col md:flex-row items-center gap-3 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm transition-all hover:bg-slate-50 hover:translate-y-[-2px] active:scale-95 group">
                                    <div className="bg-primary/5 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-primary text-2xl">video_camera_front</span>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <span className="text-xs font-bold text-slate-700 block">Gabung Rapat</span>
                                        <span className="text-[10px] text-slate-400 hidden md:block">Meeting online</span>
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
                            <div className="space-y-4">
                                {upcomingMeetings.map((meeting) => (
                                    <div key={meeting.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md group">
                                        <div className={`absolute top-0 left-0 w-1.5 h-full ${meeting.date === 'Hari Ini' ? 'bg-primary' : 'bg-slate-300'}`}></div>
                                        <h4 className="font-bold text-sm text-slate-900 mb-3">{meeting.title}</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                                <span className="material-symbols-outlined text-base">schedule</span>
                                                {meeting.time}
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                                <span className="material-symbols-outlined text-base">location_on</span>
                                                {meeting.location}
                                            </div>
                                        </div>
                                        <div className="mt-5 flex items-center justify-between">
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => (
                                                    <img key={i} className="size-7 rounded-full ring-2 ring-white" src={`https://picsum.photos/seed/${meeting.id + i}/48/48`} alt="Participant" />
                                                ))}
                                            </div>
                                            <button className="px-4 py-2 bg-primary text-white text-[10px] font-bold uppercase rounded-lg shadow-md shadow-primary/10 hover:brightness-110 transition-all">
                                                Hadir
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
