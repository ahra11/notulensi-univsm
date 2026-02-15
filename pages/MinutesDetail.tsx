import React, { useState, useEffect } from 'react';
import { Minute, Page } from '../types';
import { SpreadsheetService } from '../services/spreadsheet';

interface MinutesDetailProps {
    minute: Minute;
    onNavigate: (page: Page, data?: any) => void;
}

const MinutesDetail: React.FC<MinutesDetailProps> = ({ minute, onNavigate }) => {
    const [isVerifying, setIsVerifying] = useState(false);
    const [currentMinute, setCurrentMinute] = useState<Minute>(minute);
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

    // Sinkronisasi data terbaru jika ada perubahan status
    useEffect(() => {
        setCurrentMinute(minute);
    }, [minute]);

    const handleVerify = async () => {
        if (!window.confirm('Apakah Anda yakin ingin memverifikasi notulensi ini? Tindakan ini akan membubuhkan tanda tangan digital Anda.')) return;

        setIsVerifying(true);
        try {
            // Memanggil service untuk verifikasi ke Cloud (Google Sheets)
            await SpreadsheetService.verifyMinute(currentMinute.id, user.name);
            
            // Update tampilan lokal
            const updated: Minute = {
                ...currentMinute,
                status: 'SIGNED' as any,
                signedBy: user.name,
                signedAt: new Date().toLocaleString('id-ID')
            };
            setCurrentMinute(updated);
            alert('Notulensi berhasil diverifikasi secara digital!');
        } catch (error) {
            console.error("Gagal verifikasi:", error);
            alert('Terjadi kesalahan saat menyambungkan ke server Cloud.');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <button 
                    onClick={() => onNavigate('history')}
                    className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-bold text-sm"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Kembali ke Arsip
                </button>

                <div className="flex gap-2">
                    {/* Tombol Khusus Rektor / Pimpinan untuk Verifikasi */}
                    {user.role === 'PIMPINAN' && currentMinute.status !== 'SIGNED' && (
                        <button 
                            disabled={isVerifying}
                            onClick={handleVerify}
                            className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all"
                        >
                            <span className="material-symbols-outlined text-sm">
                                {isVerifying ? 'sync' : 'verified_user'}
                            </span>
                            {isVerifying ? 'Memproses...' : 'Verifikasi & Tanda Tangan'}
                        </button>
                    )}
                    
                    <button className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all">
                        <span className="material-symbols-outlined text-xl">print</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                {/* Header Dokumen */}
                <div className="p-8 md:p-12 border-b border-slate-50 bg-slate-50/30">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                        <div className="space-y-2">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                currentMinute.status === 'SIGNED' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                                ● {currentMinute.status}
                            </span>
                            <h1 className="text-3xl font-black text-slate-900 leading-tight">{currentMinute.title}</h1>
                            <p className="text-slate-400 font-medium">{currentMinute.date} • {currentMinute.location}</p>
                        </div>
                        
                        {/* Stempel Digital jika sudah Signed */}
                        {currentMinute.status === 'SIGNED' && (
                            <div className="flex items-center gap-4 p-4 border-2 border-green-500/20 rounded-3xl bg-green-50/50 animate-in zoom-in-95">
                                <span className="material-symbols-outlined text-4xl text-green-500">verified</span>
                                <div>
                                    <p className="text-[8px] font-black text-green-600 uppercase tracking-tighter">Verified Digitally By</p>
                                    <p className="text-xs font-black text-slate-800">{currentMinute.signedBy}</p>
                                    <p className="text-[8px] text-slate-400 font-bold">{currentMinute.signedAt}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Konten Notulensi */}
                <div className="p-8 md:p-12 space-y-10">
                    <section>
                        <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Agenda Rapat</h2>
                        <div className="text-slate-700 leading-relaxed font-medium">
                            {currentMinute.agenda || 'Tidak ada agenda yang dicatat.'}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Hasil Pembahasan</h2>
                        <div className="prose prose-slate max-w-none text-slate-600 leading-loose">
                            {currentMinute.content || 'Isi notulensi belum tersedia.'}
                        </div>
                    </section>

                    {/* Footer Dokumen */}
                    <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-end gap-8">
                        <div className="space-y-1">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Disusun Oleh</p>
                            <p className="text-sm font-bold text-slate-800">{currentMinute.submittedBy || 'Sekretaris Rektorat'}</p>
                        </div>
                        
                        <div className="text-right space-y-2">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Tanda Tangan Digital Pimpinan</p>
                            {currentMinute.status === 'SIGNED' ? (
                                <div className="py-2 px-6 bg-slate-900 text-white rounded-xl text-[10px] font-black italic tracking-widest">
                                    SIGNED ELECTRONICALLY
                                </div>
                            ) : (
                                <p className="text-[10px] text-slate-300 italic">Menunggu Verifikasi...</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MinutesDetail;
