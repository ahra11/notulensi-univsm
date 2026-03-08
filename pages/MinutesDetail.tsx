import React, { useState, useEffect, useRef } from 'react';
import { Minute, Page } from '../types';
import { SpreadsheetService } from '../services/spreadsheet';
import logoUSM from '../logo-usm.png';

const MinutesDetail: React.FC<{ minute: Minute | null; onNavigate: (p: Page) => void }> = ({ minute, onNavigate }) => {
    const [currentMinute, setCurrentMinute] = useState<Minute | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{"name":"Pimpinan"}');

    useEffect(() => {
        if (minute) setCurrentMinute(minute);
    }, [minute]);

    // ==========================================
    // LOGIKA PENGAMBILAN GAMBAR (DIRECT FROM TEXT)
    // Menarik langsung apa pun teks yang ada di sel Spreadsheet
    // ==========================================
    const renderImageSource = (rawText: string) => {
        if (!rawText || typeof rawText !== 'string') return '';
        
        const text = rawText.trim();

        // Jika data mengandung link Drive, kita bantu konversi agar bisa tampil di browser
        if (text.includes('drive.google.com')) {
            const idMatch = text.match(/[-\w]{25,}/);
            if (idMatch) return `https://drive.google.com/uc?export=view&id=${idMatch[0]}`;
        }

        // Jika bukan Drive, maka ambil teks mentah (bisa berupa URL gambar lain atau base64)
        return text;
    };

    const formatResmiTanggal = (raw: string) => {
        if (!raw) return '-';
        try {
            const dateOnly = String(raw).split('T')[0];
            const d = new Date(dateOnly);
            if (isNaN(d.getTime())) return raw;
            return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        } catch (e) { return raw; }
    };

    const getDocs = () => {
        if (!currentMinute?.documentation) return [];
        if (Array.isArray(currentMinute.documentation)) return currentMinute.documentation;
        try { 
            const parsed = JSON.parse(String(currentMinute.documentation));
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) { 
            return [String(currentMinute.documentation)]; 
        }
    };

    const docsImages = getDocs();

    // LOGIKA TANDA TANGAN
    const startDrawing = (e: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        ctx?.beginPath(); ctx?.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e: any) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const rect = canvas?.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - (rect?.left || 0);
        const y = (e.touches ? e.touches[0].clientY : e.clientY) - (rect?.top || 0);
        if (ctx) { ctx.lineWidth = 2.5; ctx.strokeStyle = '#00008B'; ctx.lineTo(x, y); ctx.stroke(); }
    };

    const submitVerify = async () => {
        if (!currentMinute || !canvasRef.current) return;
        const signatureBase64 = canvasRef.current.toDataURL('image/jpeg', 0.4);
        setIsVerifying(true);
        try {
            const payload = { id: currentMinute.id, signedBy: currentUser.name, signedAt: new Date().toLocaleString('id-ID'), signature: signatureBase64, status: 'SIGNED', actionType: 'verify' };
            const res = await SpreadsheetService.postToCloud(payload);
            if (res.success) {
                setCurrentMinute({ ...currentMinute, status: 'SIGNED' as any, signature: signatureBase64, signedBy: currentUser.name });
                setShowSignaturePad(false);
                alert("Notulensi Berhasil Disahkan!");
            }
        } catch (e) { alert("Gagal mengesahkan."); } finally { setIsVerifying(false); }
    };

    if (!currentMinute) return <div className="p-10 text-center font-bold">Memuat dokumen...</div>;

    return (
        <div className="p-4 md:p-10 bg-slate-100 min-h-screen flex flex-col items-center">
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { size: A4 portrait; margin: 15mm; }
                    .no-print { display: none !important; }
                    .main-container { box-shadow: none !important; border: none !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; }
                    .print-area { font-family: 'Times New Roman', Times, serif !important; color: black !important; line-height: 1.4; font-size: 12pt; }
                    .kop-line-thick { border-bottom: 3.5pt solid black !important; width: 100% !important; margin-top: 5px !important; }
                    .kop-line-thin { border-bottom: 1pt solid black !important; width: 100% !important; margin-top: 2px !important; margin-bottom: 25px !important; }
                    .break-page { page-break-before: always !important; }
                }
                .kop-line-thick { border-bottom: 4px solid black; width: 100%; margin-top: 5px; }
                .kop-line-thin { border-bottom: 1.5px solid black; width: 100%; margin-top: 2px; margin-bottom: 25px; }
            `}} />

            <div className="w-full max-w-4xl flex justify-between mb-6 no-print">
                <button onClick={() => onNavigate('history')} className="font-bold flex items-center gap-2 hover:underline"><span className="material-symbols-outlined">arrow_back</span> Kembali</button>
                <div className="flex gap-2">
                    {currentMinute.status !== 'SIGNED' && <button onClick={() => setShowSignaturePad(true)} className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg">Sahkan</button>}
                    <button onClick={() => window.print()} className="bg-[#252859] text-white px-6 py-2 rounded-xl font-bold shadow-lg">Cetak / PDF</button>
                </div>
            </div>

            <div className="main-container w-full max-w-4xl bg-white shadow-2xl border p-10 md:p-16">
                <div className="print-area">
                    
                    {/* KOP SURAT LENGKAP UNIVERSITAS SAPTA MANDIRI */}
                    <div className="flex items-center">
                        <div className="w-[125px] mr-5 flex-shrink-0">
                            <img src={logoUSM} className="w-full h-auto" alt="Logo USM" />
                        </div>
                        <div className="flex-1 text-center pr-10">
                            <div className="text-[12pt] leading-tight">YAYASAN SAPTA BAKTI PENDIDIKAN</div>
                            <div className="text-[22pt] font-black my-1 leading-none uppercase">UNIVERSITAS SAPTA MANDIRI</div>
                            <div className="text-[14pt] font-bold mb-2">SK Pendirian No. 661 / E/O/2024</div>
                            <div className="text-[9.5pt] leading-tight">Kampus I : JL. A. Yani RT.07 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel</div>
                            <div className="text-[9.5pt] leading-tight">Kampus II : JL. A. Yani KM. 5 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel</div>
                            <div className="text-[8.5pt] mt-1 font-bold">Telp/Fax (0526) 209 5962 CP: 0877 7687 7462 Kode Pos : 71618</div>
                            <div className="text-[8.5pt] font-bold">Website : www.univsm.ac.id | Email : info@univsm.ac.id</div>
                        </div>
                    </div>
                    <div className="kop-line-thick"></div>
                    <div className="kop-line-thin"></div>

                    <div className="text-center mb-8">
                        <h2 className="text-[16pt] font-bold underline uppercase">NOTULENSI RAPAT</h2>
                        <p className="text-[12pt]">Nomor: {currentMinute.id} /NOT/REK/2026</p>
                    </div>

                    <div className="space-y-3 mb-10 text-[12pt]">
                        <div className="flex"><span className="w-36 flex-shrink-0">Kegiatan</span><span className="mr-3">:</span><span className="font-bold uppercase flex-1">{currentMinute.title}</span></div>
                        <div className="flex"><span className="w-36 flex-shrink-0">Hari / Tanggal</span><span className="mr-3">:</span><span className="flex-1">{formatResmiTanggal(currentMinute.date)}</span></div>
                        <div className="flex"><span className="w-36 flex-shrink-0">Tempat</span><span className="mr-3">:</span><span className="flex-1">{currentMinute.location}</span></div>
                    </div>

                    <div className="mb-12">
                        <p className="font-bold underline mb-4 uppercase">Hasil Pembahasan:</p>
                        <div className="whitespace-pre-wrap text-justify leading-relaxed">{currentMinute.content}</div>
                    </div>

                    {/* AREA TANDA TANGAN (SINKRON SEJAJAR) */}
                    <table className="w-full border-none mt-20" style={{ tableLayout: 'fixed' }}>
                        <tbody>
                            <tr>
                                <td className="text-center" style={{ verticalAlign: 'top', width: '50%', paddingBottom: '90px' }}>
                                    Notulis,
                                </td>
                                <td className="text-center" style={{ verticalAlign: 'top', width: '50%' }}>
                                    Paringin, {formatResmiTanggal(currentMinute.date)}<br/>
                                    Mengesahkan,<br/>Rektor
                                    <div className="h-28 flex items-center justify-center my-2">
                                        {currentMinute.signature && (
                                            <img src={renderImageSource(currentMinute.signature)} className="h-full object-contain" alt="Tanda Tangan" />
                                        )}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="text-center">
                                    <span className="font-bold uppercase text-[12pt]">({currentMinute.submittedBy || '_________________________'})</span>
                                </td>
                                <td className="text-center">
                                    <span className="font-bold uppercase text-[12pt] underline">
                                        {currentMinute.signedBy || 'ABDUL HAMID, S.Kom., M.M., M.Kom'}
                                    </span><br/>
                                    <span className="text-[10pt]">NIP. 1121069301</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* LAMPIRAN DOKUMENTASI */}
                    {docsImages.length > 0 && (
                        <div className="break-page mt-24 pt-10 border-t border-dashed border-slate-300">
                            <h3 className="text-center font-bold underline mb-10 uppercase text-[14pt]">LAMPIRAN DOKUMENTASI</h3>
                            <div className="grid grid-cols-2 gap-8">
                                {docsImages.map((img: any, i: number) => (
                                    <div key={i} className="border-2 border-slate-100 p-2 bg-slate-50 flex items-center justify-center h-[380px] shadow-sm">
                                        <img 
                                            src={renderImageSource(img)} 
                                            className="max-h-full max-w-full object-contain" 
                                            alt={`Lampiran ${i+1}`}
                                            onError={(e) => {
                                                console.error("Gagal memuat gambar dari sel spreadsheet:", img);
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Signature Pad */}
            {showSignaturePad && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm no-print p-4">
                    <div className="bg-white p-6 rounded-3xl max-w-lg w-full shadow-2xl">
                        <h3 className="text-xl font-bold mb-4 text-center">Tanda Tangan Pimpinan</h3>
                        <div className="border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden bg-white mb-6">
                            <canvas 
                                ref={canvasRef} 
                                width={400} 
                                height={200} 
                                className="w-full h-[200px] cursor-crosshair bg-white"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={() => setIsDrawing(false)}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={() => setIsDrawing(false)}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowSignaturePad(false)} className="px-5 py-2 bg-slate-100 rounded-xl font-bold">Batal</button>
                            <button onClick={submitVerify} disabled={isVerifying} className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold">Sahkan</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MinutesDetail;
