import React, { useState, useEffect, useRef } from 'react';
import { Minute, Page } from '../types';
import { SpreadsheetService } from '../services/spreadsheet';

const MinutesDetail: React.FC<{ minute: Minute; onNavigate: (p: Page) => void }> = ({ minute, onNavigate }) => {
    const [currentMinute, setCurrentMinute] = useState<Minute>(minute);
    const [isVerifying, setIsVerifying] = useState(false);
    
    // STATE UNTUK KANVAS TANDA TANGAN
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    useEffect(() => {
        setCurrentMinute(minute);
    }, [minute]);

    const handlePrint = () => {
        window.print();
    };

    const formatTeksResmi = (teks?: string) => {
        if (!teks) return '-';
        return teks
            .replace(/[ \t]+/g, ' ')
            .replace(/(\n\s*){3,}/g, '\n\n')
            .trim();
    };

    // =================================================================
    // LOGIKA KANVAS TANDA TANGAN (MOUSE & TOUCH)
    // =================================================================
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        ctx.beginPath();
        ctx.moveTo(clientX - rect.left, clientY - rect.top);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#00008B'; // Tinta warna biru tua (resmi)
        ctx.lineTo(clientX - rect.left, clientY - rect.top);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    // =================================================================
    // PROSES PENGESAHAN & SIMPAN KE CLOUD
    // =================================================================
    const submitSignatureAndVerify = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Mengubah coretan kanvas menjadi data teks panjang (Base64 Image)
        const signatureBase64 = canvas.toDataURL('image/png');
        
        // Validasi apakah kanvas masih kosong
        const blank = document.createElement('canvas');
        blank.width = canvas.width;
        blank.height = canvas.height;
        if (signatureBase64 === blank.toDataURL()) {
            alert("Silakan bubuhkan tanda tangan Anda terlebih dahulu!");
            return;
        }

        setIsVerifying(true);
        try {
            // Kita bypass fungsi verify biasa agar bisa mengirim signature sekaligus
            await SpreadsheetService.postToCloud({
                id: currentMinute.id,
                signedBy: currentUser.name,
                signedAt: new Date().toLocaleString('id-ID'),
                signature: signatureBase64,
                status: 'SIGNED',
                actionType: 'verify'
            });
            
            setCurrentMinute(prev => ({
                ...prev,
                status: 'SIGNED',
                signedBy: currentUser.name,
                signature: signatureBase64
            }));
            
            setShowSignaturePad(false);
            alert("Tanda tangan berhasil disimpan & Notulensi disahkan!");
        } catch (error) {
            console.error(error);
            alert("Gagal mengesahkan notulensi. Periksa koneksi internet Anda.");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen flex flex-col items-center">
            
            {/* CSS KHUSUS CETAK */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { size: A4; margin: 1.5cm 2cm; }
                    body, html { background: white !important; }
                    .no-print { display: none !important; }
                    table.print-wrapper { width: 100%; border-collapse: collapse; border: none; }
                    thead.print-header { display: table-header-group; }
                    tbody.print-body { display: table-row-group; }
                    .main-container { box-shadow: none !important; border: none !important; padding: 0 !important; background: white !important; }
                    .print-area { font-family: 'Times New Roman', Times, serif !important; color: black !important; }
                    .print-blue { color: #0000FF !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    .break-page { break-before: page; padding-top: 20px; }
                    .break-inside-avoid { page-break-inside: avoid; break-inside: avoid; }
                }
            `}} />

            {/* MODAL POP-UP KANVAS TANDA TANGAN */}
            {showSignaturePad && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 no-print">
                    <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-lg w-full">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Tanda Tangan Pengesahan</h3>
                        <p className="text-sm text-slate-500 mb-6">Silakan bubuhkan tanda tangan digital Anda di dalam kotak di bawah ini.</p>
                        
                        {/* KOTAK MENGGAMBAR TANDA TANGAN */}
                        <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 overflow-hidden touch-none mb-4">
                            <canvas 
                                ref={canvasRef}
                                width={400}
                                height={200}
                                className="w-full h-auto cursor-crosshair bg-white"
                                style={{ touchAction: 'none' }}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                            />
                        </div>

                        <div className="flex justify-between items-center gap-4">
                            <button onClick={clearCanvas} className="text-slate-500 hover:text-red-500 font-bold text-sm px-4 py-2 transition-colors">
                                Ulangi (Hapus)
                            </button>
                            <div className="flex gap-2">
                                <button onClick={() => setShowSignaturePad(false)} className="px-5 py-2.5 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold text-sm transition-colors">
                                    Batal
                                </button>
                                <button onClick={submitSignatureAndVerify} disabled={isVerifying} className="px-5 py-2.5 rounded-xl text-white bg-green-600 hover:bg-green-700 font-bold text-sm shadow-lg shadow-green-900/20 transition-colors flex items-center gap-2">
                                    {isVerifying ? 'Menyimpan...' : 'Simpan & Sahkan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* BAR MENU */}
            <div className="w-full max-w-4xl flex justify-between items-center mb-6 no-print">
                <button onClick={() => onNavigate('history')} className="text-[#252859] font-bold flex items-center gap-2 hover:bg-[#252859]/10 px-4 py-2 rounded-xl transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span> Kembali ke Arsip
                </button>
                
                <div className="flex gap-2">
                    {(currentUser.role === 'PIMPINAN' || currentUser.role === 'SUPER_ADMIN') && currentMinute.status !== 'SIGNED' && (
                        <button 
                            onClick={() => setShowSignaturePad(true)} 
                            className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-900/20 hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">draw</span> 
                            Sahkan & TTD
                        </button>
                    )}
                    
                    <button onClick={handlePrint} className="bg-[#252859] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-900/20 hover:bg-black transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">print</span> Cetak Notulensi
                    </button>
                </div>
            </div>

            {/* CONTAINER TAMPILAN LAYAR */}
            <div className="main-container w-full max-w-4xl bg-white p-10 md:p-12 rounded-[2rem] shadow-xl border border-slate-200">
                <table className="print-wrapper print-area text-black w-full text-left">
                    <thead className="print-header">
                        <tr>
                            <td className="pb-6">
                                <div className="flex items-center justify-between pb-1">
                                    <div className="w-[110px] flex-shrink-0 mr-4">
                                        <img src="/logo-usm.png" alt="Logo Universitas Sapta Mandiri" className="w-full h-auto object-contain" />
                                    </div>
                                    <div className="flex-1 text-center pr-6">
                                        <div className="text-[12pt] leading-tight mb-1 font-normal">YAYASAN SAPTA BAKTI PENDIDIKAN</div>
                                        <div className="text-[22pt] font-bold leading-none mb-1.5 font-serif" style={{ fontFamily: "'Times New Roman', Times, serif" }}>UNIVERSITAS SAPTA MANDIRI</div>
                                        <div className="text-[14pt] font-bold leading-tight mb-2">SK Pendirian No. 661 / E/O/2024</div>
                                        <div className="text-[9pt] leading-snug">Kampus I : JL. A. Yani RT.07 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel</div>
                                        <div className="text-[9pt] leading-snug">Kampus II : JL. A. Yani KM. 5 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel</div>
                                        <div className="text-[9pt] leading-snug">Telp/Fax (0526) 209 5962 CP: 0877 7687 7462 Kode Pos : 71618</div>
                                        <div className="text-[9pt] leading-snug mt-0.5">Website : <span className="print-blue text-blue-700 underline">www.univsm.ac.id</span> Email : <span className="print-blue text-blue-700 underline">info@univsm.ac.id</span></div>
                                    </div>
                                </div>
                                <div className="w-full border-t-[4px] border-black mt-3"></div>
                                <div className="w-full border-t-[1px] border-black mt-[2px]"></div>
                            </td>
                        </tr>
                    </thead>

                    <tbody className="print-body">
                        <tr>
                            <td>
                                <div className="text-center mb-8">
                                    <h2 className="text-[14pt] font-bold uppercase underline">NOTULENSI RAPAT</h2>
                                    <p className="text-[12pt] font-normal mt-1">Nomor: {currentMinute.id || '...'} /NOT/REK/2026</p>
                                </div>

                                <div className="space-y-4 mb-8 text-[12pt]">
                                    <div className="grid grid-cols-[160px_20px_1fr]"><span className="font-normal">Kegiatan</span><span>:</span><span className="uppercase font-bold">{currentMinute.title}</span></div>
                                    <div className="grid grid-cols-[160px_20px_1fr]"><span className="font-normal">Hari / Tanggal</span><span>:</span><span>{currentMinute.date ? new Date(currentMinute.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</span></div>
                                    <div className="grid grid-cols-[160px_20px_1fr]"><span className="font-normal">Tempat</span><span>:</span><span>{currentMinute.location || '-'}</span></div>
                                </div>

                                <div className="mt-4 mb-16">
                                    <p className="font-bold mb-3 uppercase text-[12pt]">Hasil Pembahasan:</p>
                                    <div className="whitespace-pre-wrap text-justify text-[12pt] leading-[1.8]">
                                        {formatTeksResmi(currentMinute.content)}
                                    </div>
                                </div>

                                {/* AREA TANDA TANGAN (Dengan Gambar TTD jika sudah ada) */}
                                <table className="w-full text-center text-[12pt] border-none break-inside-avoid mb-10">
                                    <tbody>
                                        <tr>
                                            <td className="w-1/2 align-top pt-4 font-normal">
                                                <br/><br/>
                                                Notulis,
                                                {/* Ruang kosong untuk tinggi sejajar */}
                                                <div className="h-[80px]"></div>
                                            </td>
                                            <td className="w-1/2 align-top font-normal">
                                                Paringin, {currentMinute.date ? new Date(currentMinute.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '_________________'}<br/>
                                                Mengesahkan,<br/>Rektor
                                                {/* MENAMPILKAN GAMBAR TANDA TANGAN JIKA ADA */}
                                                {currentMinute.signature ? (
                                                    <div className="h-[80px] flex items-center justify-center my-2">
                                                        <img src={currentMinute.signature} alt="Tanda Tangan" className="h-[80px] object-contain" />
                                                    </div>
                                                ) : (
                                                    <div className="h-[80px] my-2"></div>
                                                )}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="w-1/2 align-bottom"><span className="font-bold uppercase">( {currentMinute.submittedBy || '_________________________'} )</span></td>
                                            <td className="w-1/2 align-bottom">
                                                <span className="underline font-bold uppercase text-[12pt]">
                                                    {currentMinute.status === 'SIGNED' && currentMinute.signedBy ? currentMinute.signedBy : 'ABDUL HAMID, S.Kom., M.M., M.Kom'}
                                                </span><br/>
                                                <span className="text-[12pt] font-normal">NIP. 1121069301</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* --- HALAMAN LAMPIRAN DOKUMENTASI --- */}
                                {currentMinute.documentation && currentMinute.documentation.length > 0 && (
                                    <div className="break-page break-inside-avoid w-full">
                                        <h3 className="text-center font-bold uppercase underline mb-8 text-[14pt]">LAMPIRAN DOKUMENTASI</h3>
                                        <div className="grid grid-cols-2 gap-6 pb-10">
                                            {currentMinute.documentation.map((img, i) => (
                                                <div key={i} className="border-2 border-slate-200 p-2 bg-white break-inside-avoid shadow-sm">
                                                    <img src={img} alt={`Dokumentasi ${i+1}`} className="w-full h-auto object-contain rounded" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MinutesDetail;
