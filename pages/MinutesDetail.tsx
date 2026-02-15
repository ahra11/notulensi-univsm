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

    useEffect(() => {
        setCurrentMinute(minute);
    }, [minute]);

    const handleVerify = async () => {
        if (!window.confirm('Verifikasi notulensi ini dengan tanda tangan digital Anda?')) return;

        setIsVerifying(true);
        try {
            await SpreadsheetService.verifyMinute(currentMinute.id, user.name);
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
        } finally {
            setIsVerifying(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 print:hidden">
                <button 
                    onClick={() => onNavigate('history')}
                    className="flex items-center gap-2 text-slate-400 hover:text-[#252859] transition-colors font-bold text-sm"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Kembali ke Arsip
                </button>

                <div className="flex gap-2">
                    {user.role === 'PIMPINAN' && currentMinute.status !== 'SIGNED' && (
                        <button 
                            disabled={isVerifying}
                            onClick={handleVerify}
                            className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/20"
                        >
                            <span className="material-symbols-outlined text-sm">{isVerifying ? 'sync' : 'verified_user'}</span>
                            {isVerifying ? 'Memproses...' : 'Verifikasi & Tanda Tangan'}
                        </button>
                    )}
                    
                    <button 
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#252859] text-white rounded-xl font-bold text-xs"
                    >
                        <span className="material-symbols-outlined text-sm">print</span>
                        Cetak PDF
                    </button>
                </div>
            </div>

            {/* AREA CETAK */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden print:border-none print:shadow-none print:rounded-none">
                
                {/* Kop Surat Institusi */}
                <div className="hidden print:flex flex-row items-center justify-center border-b-4 border-double border-slate-900 pb-4 mb-8 text-center">
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black uppercase tracking-tight">Universitas Sapta Mandiri</h1>
                        <p className="text-[10px] font-bold">Portal Notulensi Digital - Kabupaten Balangan</p>
                    </div>
                </div>

                {/* Header Dokumen */}
                <div className="p-8 md:p-12 border-b border-slate-50 bg-slate-50/30 print:bg-transparent print:p-0 print:mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-slate-900 print:text-2xl">{currentMinute.title}</h2>
                            <p className="text-slate-500 font-bold uppercase text-[10px]">
                                {currentMinute.date} | {currentMinute.location}
                            </p>
                        </div>
                        
                        {currentMinute.status === 'SIGNED' && (
                            <div className="flex items-center gap-4 p-4 border-2 border-green-500/20 rounded-3xl bg-green-50/50 print:border-green-600">
                                <div>
                                    <p className="text-[8px] font-black text-green-600 uppercase">Verified Digitally By</p>
                                    <p className="text-xs font-black text-slate-800">{currentMinute.signedBy}</p>
                                    <p className="text-[8px] text-slate-400 font-bold">{currentMinute.signedAt}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Konten Utama */}
                <div className="p-8 md:p-12 space-y-10 print:p-0">
                    <section>
                        <h3 className="text-[10px] font-black text-[#252859] uppercase tracking-[0.2em] mb-4 border-l-4 border-[#252859] pl-3">Agenda Rapat</h3>
                        <div className="text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{currentMinute.agenda}</div>
                    </section>

                    <section>
                        <h3 className="text-[10px] font-black text-[#252859] uppercase tracking-[0.2em] mb-4 border-l-4 border-[#252859] pl-3">Hasil Pembahasan</h3>
                        <div className="text-slate-600 leading-loose whitespace-pre-wrap">{currentMinute.content}</div>
                    </section>

                    {/* BAGIAN DOKUMENTASI (BARU) */}
                    {currentMinute.documentation && currentMinute.documentation.length > 0 && (
                        <section className="print:break-before-page pt-10">
                            <h3 className="text-[10px] font-black text-[#252859] uppercase tracking-[0.2em] mb-4 border-l-4 border-[#252859] pl-3">Dokumentasi Kegiatan</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {currentMinute.documentation.map((img, index) => (
                                    <div key={index} className="aspect-video rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                                        <img src={img} alt={`Dokumentasi ${index + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Footer Tanda Tangan */}
                    <div className="pt-20 flex justify-between items-start gap-12 print:mt-10">
                        <div className="text-center min-w-[150px]">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-16">Notulis</p>
                            <p className="text-sm font-bold text-slate-900 border-b border-slate-900 pb-1">{currentMinute.submittedBy}</p>
                        </div>

                        <div className="text-center min-w-[150px]">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-16">Mengesahkan, Rektor</p>
                            {currentMinute.status === 'SIGNED' ? (
                                <div className="flex flex-col items-center">
                                    <p className="text-sm font-bold text-slate-900 border-b border-slate-900 pb-1">{currentMinute.signedBy}</p>
                                    <p className="text-[7px] text-green-600 font-black italic mt-1 uppercase">Digital Signature Verified</p>
                                </div>
                            ) : (
                                <div className="h-10 border-b border-dashed border-slate-300 w-full"></div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body { background: white !important; }
                    .print\\:hidden { display: none !important; }
                    .print\\:break-before-page { break-before: page; }
                    @page { margin: 2cm; }
                }
            `}} />
        </div>
    );
};

export default MinutesDetail;
