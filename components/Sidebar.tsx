import React, { useState, useEffect } from 'react';
import { Page, UserRole } from '../types';

interface SidebarProps {
    activePage: Page;
    onNavigate: (page: Page) => void;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, onLogout }) => {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) setUser(JSON.parse(userJson));
    }, []);

    // Konfigurasi Navigasi: 'users' hanya untuk SUPER_ADMIN
    const allNavItems = [
        { id: 'dashboard', label: 'Beranda', icon: 'home', roles: ['SUPER_ADMIN', 'PIMPINAN', 'SEKRETARIS', 'STAF'] },
        { id: 'schedules', label: 'Jadwal Rapat', icon: 'calendar_today', roles: ['SUPER_ADMIN', 'PIMPINAN', 'SEKRETARIS', 'STAF'] },
        { id: 'history', label: 'Arsip Notulensi', icon: 'history', roles: ['SUPER_ADMIN', 'PIMPINAN', 'SEKRETARIS', 'STAF'] },
        // KHUSUS: Hanya SUPER_ADMIN yang bisa melihat Manajemen User
        { id: 'users', label: 'Manajemen User', icon: 'group', roles: ['SUPER_ADMIN'] }, 
        { id: 'reports', label: 'Laporan & Statistik', icon: 'bar_chart', roles: ['SUPER_ADMIN', 'PIMPINAN'] },
        { id: 'profile', label: 'Profil Saya', icon: 'account_circle', roles: ['SUPER_ADMIN', 'PIMPINAN', 'SEKRETARIS', 'STAF'] },
    ];

    const filteredNavItems = allNavItems.filter(item => 
        user && item.roles.includes(user.role as UserRole)
    );

    const getInitials = (name: string) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <aside className="fixed left-0 top-0 h-full w-64 lg:w-72 bg-white border-r border-slate-100 flex flex-col z-50">
            {/* Header Sidebar sesuai Gambar */}
            <div className="p-6">
                <div className="flex flex-col mb-8">
                    <h1 className="text-slate-900 font-black leading-tight text-xs uppercase tracking-tighter">
                        Universitas Sapta Mandiri
                    </h1>
                    <div className="flex items-center gap-1">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                            Portal Notulensi Digital
                        </p>
                        {/* Indikator Role Dinamis */}
                        {user?.role === 'SUPER_ADMIN' && (
                            <span className="text-[8px] font-black text-red-500 uppercase italic">● Admin</span>
                        )}
                        {user?.role === 'PIMPINAN' && (
                            <span className="text-[8px] font-black text-amber-500 uppercase italic">● Pimpinan</span>
                        )}
                    </div>
                </div>

                {/* Tombol Action Utama */}
                <button 
                    onClick={() => onNavigate('form')}
                    className="w-full flex items-center justify-center gap-3 py-3.5 bg-[#252859] text-white rounded-xl shadow-lg shadow-indigo-900/20 font-bold text-[11px] uppercase tracking-widest hover:brightness-110 transition-all active:scale-95 mb-10"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    <span>Notulensi Baru</span>
                </button>

                {/* Navigasi List */}
                <nav className="space-y-1">
                    {filteredNavItems.map((item) => {
                        const isActive = activePage === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id as Page)}
                                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                                    isActive 
                                    ? 'bg-[#252859] text-white shadow-md' 
                                    : 'text-slate-500 hover:bg-slate-50'
                                }`}
                            >
                                <span className={`material-symbols-outlined text-xl ${isActive ? 'material-symbols-fill' : ''}`}>
                                    {item.icon}
                                </span>
                                <span className="text-[13px] font-bold">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* User Profile Section di Bawah Sidebar */}
            <div className="mt-auto p-4 border-t border-slate-50 bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className={`size-10 rounded-full flex items-center justify-center font-black text-xs shadow-sm 
                        ${user?.role === 'SUPER_ADMIN' ? 'bg-red-500 text-white' : 'bg-[#252859] text-white'}`}>
                        {user ? getInitials(user.name) : 'USM'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-slate-900 truncate">
                            {user ? user.name : 'Memuat...'}
                        </p>
                        <p className="text-[9px] text-slate-400 font-black uppercase truncate">
                            {user ? user.role.replace('_', ' ') : 'Civitas USM'}
                        </p>
                    </div>
                    <button 
                        onClick={onLogout}
                        className="material-symbols-outlined text-slate-300 hover:text-red-500 transition-colors text-lg"
                    >
                        logout
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
