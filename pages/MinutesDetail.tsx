import React, { useState, useEffect, useRef } from 'react';
import { Minute, Page } from '../types';
import { SpreadsheetService } from '../services/spreadsheet';
import logoUSM from '../logo-usm.png';

/**
 * KOMPONEN DETAIL NOTULENSI - UNIVERSITAS SAPTA MANDIRI
 * Versi: 3.5.0 (Full Security & Print Optimized)
 */
const MinutesDetail: React.FC<{ minute: Minute | null; onNavigate: (p: Page) => void }> = ({ minute, onNavigate }) => {
    // --- 1. STATE MANAGEMENT ---
    const [currentMinute, setCurrentMinute] = useState<Minute | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    
    // REFRESH CANVAS REF
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // AMBIL DATA USER DARI STORAGE
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{"name":"Pimpinan USM", "role":"PIMPINAN"}');

    // SYNC DATA DARI PROPS KE STATE
    useEffect(() => {
        if (minute) {
            setCurrentMinute(minute);
        }
    }, [minute]);

    // --- 2. LOGIKA RENDER GAMBAR (HYBRID ENGINE) ---
    /**
     * Fungsi ini mendeteksi segala jenis input dari Spreadsheet:
     * - Base64 (Teks panjang data:image...)
     * - Link Google Drive (https://drive.google...)
     * - ID Google Drive (Karakter acak 33 digit)
     */
    const getFinalImageSource = (rawData: any) => {
        if (!rawData) return '';
        const text = String(rawData).trim();

        // JIKA BASE64 (Data yang Bapak kirim tadi)
        if (text.startsWith('data:image')) {
            return text;
        }

        // JIKA LINK GOOGLE DRIVE
        if (text.includes('drive.google.com')) {
            const idMatch = text.match(/[-\w]{25,}/);
            if (idMatch) return `https://drive.google.com/uc?export=view&id=${idMatch[0]}`;
        }

        // JIKA HANYA BERISI ID DRIVE SAJA
        if (text.length >= 25 && !text.includes(' ') && !text.includes('http')) {
            return `https://drive.google.com/uc?export=view&id=${text}`;
        }

        // DEFAULT: KEMBALIKAN APA ADANYA (URL BIASA)
        return text;
    };

    // --- 3. FORMATTER DATA ---
    const formatResmiTanggal = (raw: string) => {
        if (!raw) return '-';
        try {
            // Bersihkan format ISO T00:00:00.000Z jika ada
            const cleanDate = String(raw).split('T')[0];
            return new Date(cleanDate).toLocaleDateString('id-ID', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
        } catch (e) { return raw; }
    };

    const getDocumentationArray = () => {
        if (!currentMinute?.documentation) return [];
        // Jika sudah berbentuk Array (dari memori)
        if (Array.isArray(currentMinute.documentation)) return currentMinute.documentation;
        
        // Jika berbentuk string (dari Spreadsheet)
        try {
            const parsed = JSON.parse(String(currentMinute.documentation));
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
            // Jika string tunggal (bukan JSON)
            return [String(currentMinute.documentation)];
        }
    };

    const docImages = getDocumentationArray();

    // --- 4. LOGIKA SIGNATURE (TTD) ---
    const startDrawing = (e: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        ctx?.beginPath();
        ctx?.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e: any) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const rect = canvas?.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - (rect?.left || 0);
        const y = (e.touches ? e.touches[0].clientY : e.clientY) - (rect?.top || 0);
        if (ctx) {
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#000080'; // Navy Blue TTD
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    };

    const submitVerify = async () => {
        if (!currentMinute || !canvasRef.current) return;
        const signatureBase64 = canvasRef.current.toDataURL('image/jpeg', 0.5);
        setIsVerifying(true);
        try {
            const payload = { 
                id: currentMinute.id, 
                signedBy: currentUser.name, 
                signedAt: new Date().toLocaleString('id-ID'), 
                signature: signatureBase64, 
                status: 'SIGNED', 
                actionType: 'verify' 
            };
            const res = await SpreadsheetService.postToCloud(payload);
            if (res.success) {
                setCurrentMinute({ ...currentMinute, status: 'SIGNED' as any, signature: signatureBase64, signedBy: currentUser.name });
                setShowSignaturePad(false);
                alert("Dokumen Berhasil Disahkan Secara Digital!");
            }
        } catch (e) {
            alert("Gagal menghubungi server Google.");
        } finally {
            setIsVerifying(false);
        }
    };

    if (!currentMinute) return <div className="p-20 text-center font-bold text-[#252859]">SEDANG MEMUAT ARSIP...</div>;

    return (
        <div className="p-4 md:p-10 bg-slate-50 min-h-screen flex flex-col items-center">
            {/* --- CSS KHUSUS PRINT --- */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { size: A4 portrait; margin: 15mm; }
                    .no-print { display: none !important; }
                    .main-container { box-shadow: none !important; border: none !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; }
                    .print-area { font-family: 'Times New Roman', Times, serif !important; color: black !important; line-height: 1.5; font-size: 12pt; }
                    .kop-line-thick { border-bottom: 3.5pt solid black !important; width: 100% !important; margin-top: 5px !important; }
                    .kop-line-thin { border-bottom: 1pt solid black !important; width: 100% !important; margin-top: 2px !important; margin-bottom: 25px !important; }
                    .break-page { page-break-before: always !important; }
                    .signature-table { width: 100% !important; table-layout: fixed !important; border-collapse: collapse !important; border: none !important; }
                    .signature-table td { vertical-align: top !important; text-align: center !important; border: none !important; }
                }
                .kop-line-thick { border-bottom: 4px solid black; width: 100%; margin-top: 5px; }
                .kop-line-thin { border-bottom: 1.5px solid black; width: 100%; margin-top: 2px; margin-bottom: 25px; }
            `}} />

            {/* --- TOMBOL NAVIGASI (HANYA LAYAR) --- */}
            <div className="w-full max-w-4xl flex justify-between mb-6 no-print">
                <button onClick={() => onNavigate('history')} className="flex items-center gap-2 font-bold text-[#252859] hover:underline transition-all">
                    <span className="material-symbols-outlined">arrow_back</span> Kembali ke Daftar Arsip
                </button>
                <div className="flex gap-2">
                    {currentMinute.status !== 'SIGNED' && (
                        <button onClick={() => setShowSignaturePad(true)} className="bg-green-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:brightness-110 transition-all">
                            Sahkan Dokumen
                        </button>
                    )}
                    <button onClick={() => window.print()} className="bg-[#252859] text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:brightness-125 transition-all">
                        Cetak Notulensi
                    </button>
                </div>
            </div>

            {/* --- KERTAS KERJA UTAMA --- */}
            <div className="main-container w-full max-w-4xl bg-white shadow-2xl border border-slate-200 p-8 md:p-14 mb-20 rounded-[0.5rem] md:rounded-[2.5rem]">
                <div className="print-area">
                    
                    {/* KOP SURAT RESMI UNIVERSITAS SAPTA MANDIRI */}
                    <div className="flex items-center">
                        <div className="w-[125px] mr-6 flex-shrink-0">
                            <img src={logoUSM} className="w-full h-auto object-contain" alt="Logo USM" />
                        </div>
                        <div className="flex-1 text-center pr-10">
                            <div className="text-[12pt] font-normal leading-tight">YAYASAN SAPTA BAKTI PENDIDIKAN</div>
                            <div className="text-[22pt] font-black my-1 leading-none uppercase tracking-tight">UNIVERSITAS SAPTA MANDIRI</div>
                            <div className="text-[14pt] font-bold mb-2">SK Pendirian No. 661 / E/O/2024</div>
                            <div className="text-[9.5pt] leading-tight font-medium">Kampus I : JL. A. Yani RT.07 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel</div>
                            <div className="text-[9.5pt] leading-tight font-medium">Kampus II : JL. A. Yani KM. 5 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel</div>
                            <div className="text-[8.5pt] mt-1 font-bold">
                                Telp/Fax (0526) 209 5962 CP: 0877 7687 7462 Kode Pos : 71618
                            </div>
                            <div className="text-[8.5pt] font-bold">
                                Website : <span className="text-blue-800 underline">www.univsm.ac.id</span> Email : <span className="text-blue-800 underline">info@univsm.ac.id</span>
                            </div>
                        </div>
                    </div>

                    {/* GARIS PEMBATAS KOP GANDA */}
                    <div className="kop-line-thick"></div>
                    <div className="kop-line-thin"></div>

                    {/* JUDUL DAN NOMOR SURAT */}
                    <div className="text-center mb-10">
                        <h2 className="text-[16pt] font-bold underline uppercase tracking-widest">NOTULENSI RAPAT</h2>
                        <p className="text-[12pt] mt-1">Nomor: {currentMinute.id || '...'} /NOT/REK/2026</p>
                    </div>

                    {/* DETAIL KEGIATAN */}
                    <div className="space-y-4 mb-10 text-[12pt]">
                        <div className="flex"><span className="w-44 flex-shrink-0">Kegiatan / Agenda</span><span className="mr-4">:</span><span className="font-bold uppercase flex-1">{currentMinute.title}</span></div>
                        <div className="flex"><span className="w-44 flex-shrink-0">Hari / Tanggal</span><span className="mr-4">:</span><span className="flex-1">{formatResmiTanggal(currentMinute.date)}</span></div>
                        <div className="flex"><span className="w-44 flex-shrink-0">Tempat Pelaksanaan</span><span className="mr-4">:</span><span className="flex-1">{currentMinute.location || '-'}</span></div>
                    </div>

                    {/* HASIL PEMBAHASAN */}
                    <div className="mb-14">
                        <p className="font-bold underline mb-5 uppercase text-[12pt]">Hasil Pembahasan & Kesimpulan:</p>
                        <div className="whitespace-pre-wrap text-justify leading-relaxed text-[12pt] min-h-[300px]">
                            {currentMinute.content}
                        </div>
                    </div>

                    {/* AREA TANDA TANGAN (TABLE SEJAJAR FIX) */}
                    <table className="signature-table mt-10" style={{ width: '100%', tableLayout: 'fixed' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '50%', textAlign: 'center', verticalAlign: 'top', paddingBottom: '90px' }}>
                                    <div className="text-[12pt]">Notulis,</div>
                                </td>
                                <td style={{ width: '50%', textAlign: 'center', verticalAlign: 'top' }}>
                                    <div className="text-[12pt] mb-1">
                                        Paringin, {formatResmiTanggal(currentMinute.date)}<br/>
                                        Mengesahkan, Rektor
                                    </div>
                                    <div className="h-32 flex items-center justify-center my-2">
                                        {currentMinute.signature && (
                                            <img src={getFinalImageSource(currentMinute.signature)} className="h-full object-contain" alt="TTD Pengesahan" />
                                        )}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ textAlign: 'center' }}>
                                    <div className="font-bold uppercase text-[12pt]">({currentMinute.submittedBy || '_________________'})</div>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div className="font-bold uppercase text-[12pt] underline">
                                        {currentMinute.signedBy || 'ABDUL HAMID, S.Kom., M.M., M.Kom'}
                                    </div>
                                    <div className="text-[10pt] font-normal leading-tight mt-1">NIK. 7 1 1018 210693</div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* LAMPIRAN DOKUMENTASI (PADA HALAMAN BARU SAAT PRINT) */}
                    {docImages.length > 0 && (
                        <div className="break-page mt-24 pt-10 border-t border-dashed border-slate-300">
                            <h3 className="text-center font-bold underline mb-12 uppercase text-[14pt]">LAMPIRAN DOKUMENTASI KEGIATAN</h3>
                            <div className="grid grid-cols-2 gap-8">
                                {docImages.map((img: any, i: number) => (
                                    <div key={i} className="border-2 border-slate-100 p-2 bg-slate-50 flex items-center justify-center h-[380px] shadow-sm rounded-[1.5rem] overflow-hidden">
                                        <img 
                                            src={getFinalImageSource(img)} 
                                            className="max-h-full max-w-full object-contain" 
                                            alt={`Dokumentasi ${i+1}`}
                                            onError={(e) => {
                                                console.error("Gambar tidak terbaca:", img);
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL TANDA TANGAN (HANYA MUNCUL SAAT KLIK SAHKAN) */}
            {showSignaturePad && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm no-print p-4">
                    <div className="bg-white p-8 rounded-[2.5rem] max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300">
                        <h3 className="text-2xl font-black mb-1 text-center text-[#252859]">Bubuhkan Tanda Tangan</h3>
                        <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">Pastikan Goresan Terbaca Jelas</p>
                        
                        <div className="border-2 border-dashed border-slate-200 rounded-[2rem] overflow-hidden bg-slate-50 mb-8">
                            <canvas 
                                ref={canvasRef} 
                                width={400} 
                                height={220} 
                                className="w-full h-[220px] cursor-crosshair"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={() => setIsDrawing(false)}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={() => setIsDrawing(false)}
                            />
                        </div>

                        <div className="flex justify-between items-center gap-4">
                            <button 
                                onClick={() => {
                                    const ctx = canvasRef.current?.getContext('2d');
                                    if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                                }} 
                                className="text-red-500 font-bold hover:underline px-2"
                            >
                                Ulangi Goresan
                            </button>
                            <div className="flex gap-2">
                                <button onClick={() => setShowSignaturePad(false)} className="px-6 py-3 bg-slate-100 rounded-2xl font-bold">Batal</button>
                                <button onClick={submitVerify} disabled={isVerifying} className="px-8 py-3 bg-green-600 text-white rounded-2xl font-bold shadow-lg">
                                    {isVerifying ? 'Proses...' : 'Simpan & Sahkan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MinutesDetail;
