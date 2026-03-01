import React, { useState } from 'react';
import { SpreadsheetService } from '../services/spreadsheet';

// LOGO TETAP MENGGUNAKAN IMPORT ASLI BAPAK
import logoUSM from '../logo-usm.png'; 

interface LoginProps {
    onLogin: () => void;
    onNavigate: (page: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // 1. Ambil data dari memori laptop
            let users = JSON.parse(localStorage.getItem('usm_users') || '[]');
            
            // 2. Jika memori kosong, paksa tarik dari Google Sheets
            if (users.length === 0) {
                console.log("Menarik data pengguna dari Cloud...");
                users = await SpreadsheetService.getUsers();
            }

            // 3. Pintu Darurat Super Admin (Agar Rektor selalu bisa masuk)
            if (email === 'info@univsm.ac.id' && password === 'admin123') {
                const adminUser = { 
                    id: 'SA-01',
                    name: 'Administrator Utama', 
                    role: 'SUPER_ADMIN', 
                    email: 'info@univsm.ac.id',
                    nip: 'ADMIN-USM'
                };
                localStorage.setItem('currentUser', JSON.stringify(adminUser));
                onLogin();
                return;
            }

            // 4. Cek kecocokan (menggunakan .trim() agar kebal terhadap spasi tidak sengaja)
            const user = users.find((u: any) => 
                String(u.email).trim() === email.trim() && 
                String(u.password).trim() === password.trim()
            );

            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                onLogin();
            } else {
                // Tarikan paksa terakhir jika ternyata akun baru saja didaftarkan
                const freshUsers = await SpreadsheetService.getUsers();
                const freshUser = freshUsers.find((u: any) => 
                    String(u.email).trim() === email.trim() && 
                    String(u.password).trim() === password.trim()
                );

                if (freshUser) {
                    localStorage.setItem('currentUser', JSON.stringify(freshUser));
                    onLogin();
                } else {
                    setError('Email atau kata sandi salah. Pastikan akun sudah terdaftar di sistem.');
                }
            }
        } catch (err) {
            console.error("Terjadi kesalahan saat login:", err);
            setError('Terjadi kesalahan jaringan. Silakan coba beberapa saat lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-primary/10 overflow-hidden border border-slate-100">
                <div className="p-8 md:p-12">
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="mb-6">
                            {/* PEMANGGILAN LOGO TETAP SEPERTI ASLINYA */}
                            <img 
                                src={logoUSM} 
                                alt="Logo Universitas Sapta Mandiri" 
                                className="h-28 w-auto object-contain drop-shadow-md"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/3070/3070014.png";
                                }}
                            />
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Portal Notulensi</h1>
                        <p className="text-sm text-primary font-bold uppercase tracking-widest mt-1">Universitas Sapta Mandiri</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-center">
                            <p className="text-[10px] text-red-600 font-bold uppercase">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Civitas</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">mail</span>
                                <input 
                                    required
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="info@univsm.ac.id"
                                    className="w-full h-14 pl-12 pr-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kata Sandi</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">lock</span>
                                <input 
                                    required
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-14 pl-12 pr-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium"
                                />
                            </div>
                        </div>

                        <button 
                            disabled={isLoading}
                            className="w-full h-14 bg-[#252859] text-white rounded-2xl shadow-xl shadow-indigo-900/20 font-bold text-sm uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>Masuk Ke Sistem <span className="material-symbols-outlined text-xl">login</span></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-slate-500 font-medium">
                            Belum memiliki akses?{' '}
                            <button 
                                onClick={() => onNavigate('register')}
                                className="text-primary font-bold hover:underline"
                            >
                                Daftar Akun
                            </button>
                        </p>
                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-50 text-center">
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mb-1">Lokasi Kampus</p>
                        <p className="text-[9px] text-slate-400 leading-tight">
                            Jalan A. Yani Km 1,5 Depan, Lingsir, Kec. Paringin Selatan, <br/>
                            Kabupaten Balangan, Kalimantan Selatan 71618
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
