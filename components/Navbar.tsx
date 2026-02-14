
import React from 'react';
import { Page } from '../types';

interface NavbarProps {
    activePage: Page;
    onNavigate: (page: Page) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activePage, onNavigate }) => {
    const navItems = [
        { id: 'dashboard', label: 'Beranda', icon: 'home' },
        { id: 'history', label: 'Riwayat', icon: 'history' },
        { id: 'profile', label: 'Profil', icon: 'account_circle' },
    ];

    return (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-slate-100 flex justify-around items-center px-6 py-3 pb-6 z-50 no-print">
            {navItems.map((item) => {
                const isActive = activePage === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id as Page)}
                        className={`flex flex-col items-center gap-1 transition-colors ${
                            isActive ? 'text-primary' : 'text-slate-400'
                        }`}
                    >
                        <span className={`material-symbols-outlined ${isActive ? 'material-symbols-fill' : ''}`}>
                            {item.icon}
                        </span>
                        <span className="text-[10px] font-medium leading-none">{item.label}</span>
                    </button>
                );
            })}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2">
                <button 
                    onClick={() => onNavigate('form')}
                    className="size-14 bg-primary text-white rounded-full shadow-lg shadow-primary/40 flex items-center justify-center active:scale-95 transition-transform"
                >
                    <span className="material-symbols-outlined text-3xl">add</span>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
