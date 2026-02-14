
import React, { useState, useEffect } from 'react';
import { Page } from '../types';

interface ProfileProps {
    onNavigate: (page: Page) => void;
    onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onNavigate, onLogout }) => {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) {
            setUser(JSON.parse(userJson));
        }
    }, []);

    const getInitials = (name: string) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    if (!user) return <div className="p-10 text-center">Memuat profil...</div>;

    return (
        <div className="pb-32 md:pb-10 bg-white min-h-screen">
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 h-16 px-4 md:px-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => onNavigate('dashboard')} className="md:hidden size-10 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-600">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-bold">Profil & Akun</h1>
                </div>
                <button 
                    onClick={onLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-100 transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">logout</span> Logout
                </button>
            </header>

            <div className="max-w-6xl mx-auto px-5 py-10 md:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    <div className="lg:col-span-4 flex flex-col items-center text-center">
                        <div className="relative mb-8 group">
                            <div className={`size-40 md:size-48 rounded-full border-8 border-white shadow-2xl flex items-center justify-center text-white text-5xl font-bold ring-8 ring-primary/5 transition-all ${user.isPimpinan ? 'bg-accent-gold' : 'bg-primary'}`}>
                                {getInitials(user.name)}
                            </div>
                            {user.isPimpinan && (
                                <div className="absolute -top-2 -right-2 bg-accent-gold text-primary p-2 rounded-full shadow-lg border-2 border-white">
                                    <span className="material-symbols-outlined text-xl material-symbols-fill">workspace_premium</span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">{user.name}</h2>
                            <div className="flex flex-col items-center gap-2 pt-2">
                                <span className={`font-bold text-[10px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full ${user.isPimpinan ? 'bg-amber-100 text-amber-700' : 'bg-primary/5 text-primary'}`}>
                                    {user.isPimpinan ? 'Level Pimpinan' : 'Level Staf / Dosen'}
                                </span>
                                <span className="text-slate-600 font-semibold flex items-center gap-2 mt-2">
                                    <span className="material-symbols-outlined text-primary text-lg">badge</span> {user.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8 space-y-10">
                        <section>
                            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                                <span className="size-2 bg-primary rounded-full"></span> Detail Kepegawaian
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-lg transition-all">
                                    <span className="material-symbols-outlined text-primary mb-3">alternate_email</span>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Email Resmi</p>
                                    <p className="text-sm font-bold text-slate-800">{user.email}</p>
                                </div>
                                <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-lg transition-all">
                                    <span className="material-symbols-outlined text-primary mb-3">verified</span>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Status Verifikasi</p>
                                    <p className="text-sm font-bold text-slate-800">{user.isPimpinan ? 'Pejabat Struktural' : 'Anggota Aktif'}</p>
                                </div>
                                <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-lg transition-all md:col-span-2">
                                    <span className="material-symbols-outlined text-primary mb-3">apartment</span>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Institusi & Lokasi</p>
                                    <p className="text-sm font-bold text-slate-800">Universitas Sapta Mandiri</p>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                        Jl. A. Yani Km 1,5 Depan, Lingsir, Kec. Paringin Selatan, Kabupaten Balangan, Kalimantan Selatan 71618
                                    </p>
                                </div>
                                <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-lg transition-all md:col-span-2">
                                    <span className="material-symbols-outlined text-primary mb-3">fingerprint</span>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">NIP / ID Civitas</p>
                                    <p className="text-sm font-bold text-slate-800">{user.nip}</p>
                                </div>
                            </div>
                        </section>

                        <section className="bg-primary/5 rounded-3xl p-8 border border-primary/10">
                            <div className="flex items-start gap-4">
                                <span className="material-symbols-outlined text-primary text-3xl">info</span>
                                <div>
                                    <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Akses Akun</h4>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        Sebagai {user.isPimpinan ? 'seorang pimpinan' : 'staf akademika'}, akun Anda memiliki akses untuk {user.isPimpinan ? 'menandatangani dan memverifikasi secara sah setiap notulensi rapat yang diajukan dalam lingkup unit kerja Anda.' : 'membuat draf notulensi, mencatat rapat, dan mengajukan tanda tangan digital kepada pimpinan terkait.'}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
