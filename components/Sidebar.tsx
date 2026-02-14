
import React, { useState, useEffect } from 'react';
import { Page } from '../types';

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

    const navItems = [
        { id: 'dashboard', label: 'Beranda', icon: 'home' },
        { id: 'history', label: 'Arsip Notulensi', icon: 'history' },
        { id: 'reports', label: 'Laporan & Statistik', icon: 'bar_chart' },
        { id: 'profile', label: 'Profil Saya', icon: 'account_circle' },
    ];

    const getInitials = (name: string) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <aside className="fixed left-0 top-0 h-full w-64 lg:w-72 bg-white border-r border-slate-100 flex flex-col z-50">
            <div className="p-6">
                <div className="flex flex-col gap-1 mb-10">
                    <h1 className="text-primary font-bold leading-tight text-sm uppercase tracking-tight">Universitas Sapta Mandiri</h1>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                        Portal Notulensi Digital 
                        {user?.isPimpinan && <span className="text-amber-500 ml-1">● Pimpinan</span>}
                    </p>
                </div>

                <button 
                    onClick={() => onNavigate('form')}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 font-bold text-sm uppercase tracking-widest hover:brightness-110 transition-all active:scale-95 mb-10"
                >
                    <span className="material-symbols-outlined">add</span>
                    <span>Notulensi Baru</span>
                </button>

                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = activePage === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id as Page)}
                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${
                                    isActive 
                                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                                    : 'text-slate-500 hover:bg-slate-50'
                                }`}
                            >
                                <span className={`material-symbols-outlined ${isActive ? 'material-symbols-fill' : ''}`}>
                                    {item.icon}
                                </span>
                                <span className="text-sm font-semibold">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-slate-50">
                <div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-50">
                    <div className={`size-10 rounded-full flex items-center justify-center font-bold text-xs shadow-inner ${user?.isPimpinan ? 'bg-amber-500 text-white' : 'bg-primary text-white'}`}>
                        {user ? getInitials(user.name) : 'USM'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{user ? user.name : 'Memuat...'}</p>
                        <p className="text-[10px] text-slate-400 font-medium truncate">{user ? user.role : 'Civitas USM'}</p>
                    </div>
                    <button 
                        onClick={onLogout}
                        className="material-symbols-outlined text-slate-300 hover:text-red-500 transition-colors"
                    >
                        logout
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
