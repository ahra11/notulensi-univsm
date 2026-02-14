
import React, { useState } from 'react';

interface RegisterProps {
    onNavigate: (page: any) => void;
    onRegisterSuccess: () => void;
}

const Register: React.FC<RegisterProps> = ({ onNavigate, onRegisterSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        nip: '',
        email: '',
        password: '',
        confirmPassword: '',
        category: 'staf', // 'pimpinan' | 'staf'
        position: 'Dosen'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const positions = {
        staf: ['Dosen', 'Staf Administrasi', 'Kepala Lab', 'Sekretaris Prodi'],
        pimpinan: ['Rektor', 'Wakil Rektor', 'Dekan', 'Wakil Dekan', 'Kepala Lembaga', 'Ketua Senat']
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (formData.password !== formData.confirmPassword) {
            setError('Kata sandi tidak cocok.');
            return;
        }

        setIsLoading(true);

        setTimeout(() => {
            const users = JSON.parse(localStorage.getItem('usm_users') || '[]');
            
            if (users.find((u: any) => u.email === formData.email)) {
                setError('Email sudah terdaftar.');
                setIsLoading(false);
                return;
            }

            const newUser = {
                name: formData.name,
                nip: formData.nip,
                email: formData.email,
                password: formData.password,
                category: formData.category,
                role: formData.position,
                isPimpinan: formData.category === 'pimpinan'
            };

            users.push(newUser);
            localStorage.setItem('usm_users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            
            setIsLoading(false);
            onRegisterSuccess();
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-primary/10 overflow-hidden border border-slate-100">
                <div className="p-8 md:p-10">
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="p-4 bg-primary/5 rounded-full mb-4">
                            <span className="material-symbols-outlined text-4xl text-primary">person_add</span>
                        </div>
                        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Daftar Akun Civitas</h1>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">Universitas Sapta Mandiri</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-center">
                            <p className="text-[10px] text-red-600 font-bold uppercase">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap & Gelar</label>
                            <input 
                                required
                                type="text" 
                                placeholder="Contoh: Dr. Aris Subakti, M.T."
                                className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kategori Akun</label>
                                <select 
                                    className="w-full h-12 px-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary text-sm font-medium"
                                    value={formData.category}
                                    onChange={(e) => {
                                        const cat = e.target.value as 'staf' | 'pimpinan';
                                        setFormData({...formData, category: cat, position: positions[cat][0]});
                                    }}
                                >
                                    <option value="staf">Dosen / Staf</option>
                                    <option value="pimpinan">Struktural / Pimpinan</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Jabatan Spesifik</label>
                                <select 
                                    className="w-full h-12 px-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary text-sm font-medium"
                                    value={formData.position}
                                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                                >
                                    {formData.category === 'staf' 
                                        ? positions.staf.map(p => <option key={p} value={p}>{p}</option>)
                                        : positions.pimpinan.map(p => <option key={p} value={p}>{p}</option>)
                                    }
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">NIP / ID</label>
                                <input 
                                    required
                                    type="text" 
                                    placeholder="19850..."
                                    className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium"
                                    value={formData.nip}
                                    onChange={(e) => setFormData({...formData, nip: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email USM</label>
                                <input 
                                    required
                                    type="email" 
                                    placeholder="nama@usm.ac.id"
                                    className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kata Sandi</label>
                                <input 
                                    required
                                    type="password" 
                                    placeholder="••••••••"
                                    className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Konfirmasi</label>
                                <input 
                                    required
                                    type="password" 
                                    placeholder="••••••••"
                                    className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                />
                            </div>
                        </div>

                        <button 
                            disabled={isLoading}
                            className="w-full h-14 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 font-bold text-sm uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center justify-center mt-6"
                        >
                            {isLoading ? (
                                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                "Selesaikan Pendaftaran"
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-slate-500 font-medium">
                            Sudah punya akun?{' '}
                            <button 
                                onClick={() => onNavigate('login')}
                                className="text-primary font-bold hover:underline"
                            >
                                Masuk di sini
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
