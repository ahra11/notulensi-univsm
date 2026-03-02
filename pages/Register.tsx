import React, { useState } from 'react';
import { SpreadsheetService } from '../services/spreadsheet';
import logoUSM from '../logo-usm.png'; 

interface RegisterProps {
    onNavigate: (page: any) => void;
}

const Register: React.FC<RegisterProps> = ({ onNavigate }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'STAF', // Default role
        nip: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const newUser = {
            id: `USR-${Date.now()}`,
            ...formData
        };

        try {
            // 1. Simpan akun ke Google Sheets
            await SpreadsheetService.addUser(newUser);

            // 2. Suntikkan akun baru ke memori lokal agar LANGSUNG BISA LOGIN
            const currentUsers = JSON.parse(localStorage.getItem('usm_users') || '[]');
            currentUsers.push(newUser);
            localStorage.setItem('usm_users', JSON.stringify(currentUsers));

            alert("Pendaftaran berhasil! Akun Anda sudah aktif dan bisa digunakan untuk Login.");
            onNavigate('login');
        } catch (error) {
            console.error(error);
            alert("Gagal mendaftarkan akun. Periksa koneksi internet Anda.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-primary/10 overflow-hidden border border-slate-100">
                <div className="p-8 md:p-10">
                    <div className="flex flex-col items-center text-center mb-8">
                        <img src={logoUSM} alt="Logo" className="h-20 w-auto object-contain mb-4 drop-shadow-md" />
                        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Pendaftaran Akun</h1>
                        <p className="text-xs text-primary font-bold uppercase tracking-widest mt-1">Sistem Notulensi USM</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap & Gelar</label>
                            <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#252859] transition-all text-sm font-medium" placeholder="Contoh: Dr. Budi Santoso, M.Kom" />
                        </div>
                        
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nomor Induk Pegawai (NIP)</label>
                            <input type="text" value={formData.nip} onChange={(e) => setFormData({...formData, nip: e.target.value})} className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#252859] transition-all text-sm font-medium" placeholder="Opsional" />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Civitas</label>
                            <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#252859] transition-all text-sm font-medium" placeholder="nama@univsm.ac.id" />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kata Sandi</label>
                            <input required type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#252859] transition-all text-sm font-medium" placeholder="Minimal 6 karakter" />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Jabatan / Peran Akses</label>
                            <select required value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#252859] transition-all text-sm font-bold text-slate-700">
                                <option value="STAF">Staf / Dosen</option>
                                <option value="SEKRETARIS">Sekretaris (Notulis)</option>
                                {/* Akses Pimpinan dan Super Admin sengaja disembunyikan dari pendaftaran umum untuk keamanan */}
                            </select>
                        </div>

                        <button disabled={isLoading} className="w-full h-12 mt-4 bg-[#252859] text-white rounded-xl shadow-lg shadow-indigo-900/20 font-bold text-sm uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50">
                            {isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-slate-500 font-medium">
                            Sudah punya akun?{' '}
                            <button onClick={() => onNavigate('login')} className="text-[#252859] font-bold hover:underline">Masuk di sini</button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
