import React, { useState, useEffect, useRef } from 'react';
import { Minute, Page } from '../types';
import { SpreadsheetService } from '../services/spreadsheet';
import { useReactToPrint } from 'react-to-print';
import PrintTemplate from '../components/PrintTemplate';

interface MinutesDetailProps {
    minute: Minute;
    onNavigate: (page: Page, data?: any) => void;
}

const MinutesDetail: React.FC<MinutesDetailProps> = ({ minute, onNavigate }) => {
    const [isVerifying, setIsVerifying] = useState(false);
    const [currentMinute, setCurrentMinute] = useState<Minute>(minute);
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setCurrentMinute(minute);
    }, [minute]);

    // FUNGSI CETAK: Ini yang memanggil Kop Surat Yayasan di PrintTemplate
    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: `Notulensi_USM_${currentMinute.id}`,
    });

    const handleVerify = async () => {
        if (!window.confirm('Sahkan notulensi ini secara resmi?')) return;
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
            alert('Notulensi berhasil disahkan!');
        } catch (error) {
            alert("Gagal sinkron ke Cloud.");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ACTION BAR (Hanya muncul di layar laptop) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
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
                            {isVerifying ? 'Memproses...' : 'Sahkan & Tanda Tangan'}
                        </button>
                    )}
                    
                    <button 
                        onClick={() => handlePrint()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#252859] text-white rounded-xl font-bold text-xs"
                    >
                        <span className="material-symbols-outlined text-sm">print</span>
                        Cetak PDF Resmi
                    </button>
                </div>
            </div>

            {/* --- TAMPILAN DASHBOARD LAYAR --- */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-10">
                <div className="p-8 md:p-12 border-b border-slate-50 bg-slate-50/30">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <span className="px-3 py-1 bg-blue-100 text-[#252859] text-[9px] font-black rounded-full uppercase">Detail Notulensi</span>
                            <h2 className="text-3xl font-black text-slate-900">{currentMinute.title}</h2>
                            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">{currentMinute.date} | {currentMinute.location}</p>
                        </div>
                        {currentMinute.status === 'SIGNED' && (
                            <div className="p-4 border-2 border-green-500/20 rounded-3xl bg-green-50/50 flex items-center gap-3">
                                <span className="material-symbols-outlined text-green-600">verified</span>
                                <div>
                                    <p className="text-[8px] font-black text-green-600 uppercase">Status: Disahkan</p>
                                    <p className="text-xs font-black text-slate-800">{currentMinute.signedBy}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-8 md:p-12 space-y-10">
                    <section>
                        <h3 className="text-[10px] font-black text-[#252859] uppercase tracking-[0.2em] mb-4 border-l-4 border-[#252859] pl-3 text-sm">Agenda</h3>
                        <div className="text-slate-700 whitespace-pre-wrap font-medium">{currentMinute.agenda}</div>
                    </section>

                    <section>
                        <h3 className="text-[10px] font-black text-[#252859] uppercase tracking-[0.2em] mb-4 border-l-4 border-[#252859] pl-3 text-sm">Hasil Pembahasan</h3>
                        <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">{currentMinute.content}</div>
                    </section>

                    {/* LAMPIRAN DOKUMENTASI DI LAYAR */}
                    {currentMinute.documentation && currentMinute.documentation.length > 0 && (
                        <section className="pt-6 border-t border-slate-100">
                            <h3 className="text-[10px] font-black text-[#252859] uppercase tracking-[0.2em] mb-4">Lampiran Dokumentasi</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {currentMinute.documentation.map((img, i) => (
                                    <div key={i} className="aspect-square rounded-2xl overflow-hidden border">
                                        <img src={img} className="w-full h-full object-cover" alt="dok" />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {/* --- AREA RENDER TERSEMBUNYI (Format Kop Resmi Yayasan) --- */}
            <div style={{ display: 'none' }}>
                <div ref={printRef}>
                    {/* Komponen ini yang berisi teks "YAYASAN SAPTA BAKTI PENDIDIKAN" */}
                    <PrintTemplate data={currentMinute} />
                </div>
            </div>
        </div>
    );
};

export default MinutesDetail;
