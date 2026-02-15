import React, { useState, useEffect, useRef } from 'react';
import { Minute, Page } from '../types';
import { SpreadsheetService } from '../services/spreadsheet';
import { useReactToPrint } from 'react-to-print';
import PrintTemplate from '../components/PrintTemplate'; // Pastikan import ini ada

interface MinutesDetailProps {
    minute: Minute;
    onNavigate: (page: Page, data?: any) => void;
}

const MinutesDetail: React.FC<MinutesDetailProps> = ({ minute, onNavigate }) => {
    const [isVerifying, setIsVerifying] = useState(false);
    const [currentMinute, setCurrentMinute] = useState<Minute>(minute);
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // Reference untuk area cetak
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setCurrentMinute(minute);
    }, [minute]);

    // FUNGSI CETAK: Memanggil format Kop Resmi Yayasan
    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: `Notulensi_USM_${currentMinute.id}`,
    });

    const handleVerify = async () => {
        if (!window.confirm('Sahkan notulensi ini secara resmi melalui sistem?')) return;

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
            alert("Gagal sinkron ke Cloud. Silakan periksa koneksi.");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ACTION BAR (Hanya di Layar) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <button 
                    onClick={() => onNavigate('history')}
                    className="flex items-center gap-2 text-slate-400 hover:text-[#252859] transition-colors font-bold text-sm"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Kembali ke Arsip
                </button>

                <div className="flex gap-2">
                    {/* Tombol Sahkan (Khusus Pimpinan) */}
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
                    
                    {/* Tombol Cetak PDF Resmi */}
                    <button 
                        onClick={() => handlePrint()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#252859] text-white rounded-xl font-bold text-xs shadow-lg shadow-[#252859]/20"
                    >
                        <span className="material-symbols-outlined text-sm">print</span>
                        Cetak PDF Resmi
                    </button>
                </div>
            </div>

            {/* --- TAMPILAN DASHBOARD (Untuk Dilihat di Layar) --- */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 md:p-12 border-b border-slate-50 bg-slate-50/30">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                        <div className="space-y-2">
                            <span className="px-3 py-1 bg-blue-100 text-[#252859] text-[9px] font-black rounded-full">NOTULENSI RAPAT</span>
                            <h2 className="text-3xl font-black text-slate-900 leading-tight">{currentMinute.title}</h2>
                            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                                {currentMinute.date} | {currentMinute.location}
                            </p>
                        </div>
                        
                        {currentMinute.status === 'SIGNED' ? (
                            <div className="flex items-center gap-4 p-4 border-2 border-green-500/20 rounded-3xl bg-green-50/50">
                                <span className="material-symbols-outlined text-green-600">verified</span>
                                <div>
                                    <p className="text-[8px] font-black text-green-600 uppercase italic">Telah Disahkan Oleh Rektor</p>
                                    <p className="text-xs font-black text-slate-800">{currentMinute.signedBy}</p>
                                    <p className="text-[8px] text-slate-400 font-bold">{currentMinute.signedAt}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="px-4 py-2 bg-slate-100 text-slate-400 text-[10px] font-black rounded-full uppercase italic">
                                Belum Disahkan
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-8 md:p-12 space-y-10">
                    <section>
                        <h3 className="text-[10px] font-black text-[#252859] uppercase tracking-[0.2em] mb-4 border-l-4 border-[#252859] pl-3">Agenda Rapat</h3>
                        <div className="text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{currentMinute.agenda}</div>
                    </section>

                    <section>
                        <h3 className="text-[10px] font-black text-[#252859] uppercase tracking-[0.2em] mb-4 border-l-4 border-[#252859] pl-3">Hasil Pembahasan</h3>
                        <div className="text-slate-600 leading-loose whitespace-pre-wrap">{currentMinute.content}</div>
                    </section>
                </div>
            </div>

            {/* --- AREA RENDER TERSEMBUNYI (Khusus Untuk Cetak Kop Resmi) --- */}
            <div style={{ display: 'none' }}>
                <div ref={printRef}>
                    <PrintTemplate data={currentMinute} />
                </div>
            </div>
        </div>
    );
};

export default MinutesDetail;
