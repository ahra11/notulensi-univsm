import React, { useState, useEffect } from 'react';
import { User, UserRole, Page } from '../types';

interface UserManagementProps {
    onNavigate: (page: Page) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onNavigate }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    // PROTEKSI HALAMAN: Hanya Super Admin yang boleh masuk
    useEffect(() => {
        if (currentUser.role !== 'SUPER_ADMIN') {
            onNavigate('dashboard');
        } else {
            const savedUsers = JSON.parse(localStorage.getItem('usm_users') || '[]');
            setUsers(savedUsers);
        }
    }, [currentUser, onNavigate]);

    const handleDeleteUser = (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
            const updatedUsers = users.filter(user => user.id !== id);
            setUsers(updatedUsers);
            localStorage.setItem('usm_users', JSON.stringify(updatedUsers));
        }
    };

    const handleUpdateRole = (id: string, newRole: UserRole) => {
        const updatedUsers = users.map(user => 
            user.id === id ? { ...user, role: newRole } : user
        );
        setUsers(updatedUsers);
        localStorage.setItem('usm_users', JSON.stringify(updatedUsers));
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (currentUser.role !== 'SUPER_ADMIN') return null;

    return (
        <div className="p-4 md:p-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manajemen Pengguna</h1>
                    <p className="text-sm text-slate-500 font-medium">Kelola akses dan peran civitas Universitas Sapta Mandiri</p>
                </div>
                
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                    <input 
                        type="text"
                        placeholder="Cari nama atau email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm w-full md:w-64 focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                    />
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                                <th className="px-6 py-4">Nama Civitas</th>
                                <th className="px-6 py-4">Email / NIP</th>
                                <th className="px-6 py-4">Peran (Role)</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                {user.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-slate-600 font-medium">{user.email}</span>
                                            <span className="text-[10px] text-slate-400 uppercase font-bold">{user.nip || 'NIP Belum Diatur'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select 
                                            value={user.role}
                                            onChange={(e) => handleUpdateRole(user.id, e.target.value as UserRole)}
                                            className={`text-[10px] font-bold uppercase py-1.5 px-3 rounded-full border-none focus:ring-2 focus:ring-primary cursor-pointer transition-all
                                                ${user.role === 'SUPER_ADMIN' ? 'bg-red-50 text-red-600' : 
                                                  user.role === 'PIMPINAN' ? 'bg-amber-50 text-amber-600' : 
                                                  'bg-slate-100 text-slate-600'}`}
                                        >
                                            <option value="SUPER_ADMIN">SUPER ADMIN</option>
                                            <option value="PIMPINAN">PIMPINAN</option>
                                            <option value="SEKRETARIS">SEKRETARIS</option>
                                            <option value="STAF">STAF</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="Hapus Pengguna"
                                            >
                                                <span className="material-symbols-outlined text-xl">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">group_off</span>
                                        <p className="text-sm text-slate-400 font-medium">Tidak ada pengguna ditemukan.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
