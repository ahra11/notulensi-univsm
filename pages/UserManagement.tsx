import React, { useState, useEffect } from 'react';
import { User, UserRole, Page } from '../types';

interface UserManagementProps {
    onNavigate: (page: Page) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onNavigate }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'STAF' as UserRole, nip: '' });
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    useEffect(() => {
        if (currentUser.role !== 'SUPER_ADMIN') {
            onNavigate('dashboard');
        } else {
            const savedUsers = JSON.parse(localStorage.getItem('usm_users') || '[]');
            setUsers(savedUsers);
        }
    }, [currentUser, onNavigate]);

    // FITUR: Tambah User Manual
    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        const userToAdd: User = {
            id: `U-${Date.now()}`,
            ...newUser
        };
        const updatedUsers = [...users, userToAdd];
        setUsers(updatedUsers);
        localStorage.setItem('usm_users', JSON.stringify(updatedUsers));
        setNewUser({ name: '', email: '', password: '', role: 'STAF', nip: '' });
        setShowAddForm(false);
        alert('User berhasil ditambahkan!');
    };

    const handleUpdateUser = (id: string, field: keyof User, value: string) => {
        const updatedUsers = users.map(user => 
            user.id === id ? { ...user, [field]: value } : user
        );
        setUsers(updatedUsers);
        localStorage.setItem('usm_users', JSON.stringify(updatedUsers));
    };

    const handleResetPassword = (id: string, userName: string) => {
        const newPassword = window.prompt(`Masukkan Password Baru untuk ${userName}:`);
        if (newPassword && newPassword.length >= 4) {
            handleUpdateUser(id, 'password', newPassword);
            navigator.clipboard.writeText(newPassword);
            alert(`Password berhasil direset dan disalin ke clipboard!`);
        }
    };

    const handleDeleteUser = (id: string) => {
        if (window.confirm('Hapus pengguna ini?')) {
            const updatedUsers = users.filter(user => user.id !== id);
            setUsers(updatedUsers);
            localStorage.setItem('usm_users', JSON.stringify(updatedUsers));
        }
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
                    <p className="text-sm text-slate-500 font-medium italic">Administrator: {currentUser.name}</p>
                </div>
                
                <div className="flex gap-2">
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#252859] text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-900/20 hover:brightness-110 transition-all"
                    >
                        <span className="material-symbols-outlined text-sm">{showAddForm ? 'close' : 'person_add'}</span>
                        {showAddForm ? 'Batal' : 'Tambah User'}
                    </button>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input 
                            type="text"
                            placeholder="Cari civitas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm w-full md:w-56 focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* FORM TAMBAH USER MANUAL */}
            {showAddForm && (
                <div className="mb-8 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 animate-in zoom-in-95 duration-300">
                    <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input required type="text" placeholder="Nama Lengkap" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="p-3 bg-slate-50 border-none rounded-xl text-sm" />
                        <input required type="email" placeholder="Email (info@univsm.ac.id)" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="p-3 bg-slate-50 border-none rounded-xl text-sm" />
                        <input required type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="p-3 bg-slate-50 border-none rounded-xl text-sm" />
                        <input type="text" placeholder="NIP (Opsional)" value={newUser.nip} onChange={e => setNewUser({...newUser, nip: e.target.value})} className="p-3 bg-slate-50 border-none rounded-xl text-sm" />
                        <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})} className="p-3 bg-slate-50 border-none rounded-xl text-sm font-bold uppercase">
                            <option value="STAF">STAF</option>
                            <option value="SEKRETARIS">SEKRETARIS</option>
                            <option value="PIMPINAN">PIMPINAN</option>
                            <option value="SUPER_ADMIN">SUPER ADMIN</option>
                        </select>
                        <button type="submit" className="bg-[#252859] text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-black transition-all">Simpan User Baru</button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                            <th className="px-6 py-4">Data Civitas (Klik untuk Edit)</th>
                            <th className="px-6 py-4 text-center">Peran</th>
                            <th className="px-6 py-4 text-center">Tindakan Admin</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-[#252859] text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0">
                                            {user.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col w-full gap-1">
                                            <input type="text" value={user.name} onChange={(e) => handleUpdateUser(user.id, 'name', e.target.value)} className="text-sm font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0 w-full" />
                                            <input type="text" value={user.nip || ''} onChange={(e) => handleUpdateUser(user.id, 'nip', e.target.value)} className="text-[10px] text-slate-400 font-bold uppercase bg-transparent border-none p-0 focus:ring-0 w-full" placeholder="Klik untuk isi NIP..." />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <select value={user.role} onChange={(e) => handleUpdateUser(user.id, 'role', e.target.value)} className="text-[10px] font-black uppercase py-1.5 px-3 rounded-full border-none bg-slate-100 cursor-pointer">
                                        <option value="SUPER_ADMIN">SUPER ADMIN</option>
                                        <option value="PIMPINAN">PIMPINAN</option>
                                        <option value="SEKRETARIS">SEKRETARIS</option>
                                        <option value="STAF">STAF</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => handleResetPassword(user.id, user.name)} className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white rounded-xl hover:bg-black transition-all text-[9px] font-black uppercase tracking-wider">
                                            <span className="material-symbols-outlined text-sm">content_copy</span>
                                            Reset & Salin
                                        </button>
                                        <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><span className="material-symbols-outlined text-lg">delete</span></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
