import React, { useState, useEffect, useRef } from 'react';
import { Minute, Page } from '../types';
import { SpreadsheetService } from '../services/spreadsheet';
import logoUSM from '../logo-usm.png';

/**
 * KOMPONEN NOTULENSI RESMI - UNIVERSITAS SAPTA MANDIRI
 * Perbaikan: Dukungan Penuh Base64, Penjajaran Tanda Tangan, KOP Lengkap & Garis Ganda
 */
const MinutesDetail: React.FC<{ minute: Minute | null; onNavigate: (p: Page) => void }> = ({ minute, onNavigate }) => {
    const [currentMinute, setCurrentMinute] = useState<Minute | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{"name":"Pimpinan USM", "role":"PIMPINAN"}');

    useEffect(() => {
        if (minute) setCurrentMinute(minute);
    }, [minute]);

    // ==========================================
    // MESIN PINTAR RENDER GAMBAR (SUPPORT BASE64)
    // ==========================================
    const renderSmartImage = (data: any) => {
        if (!data) return '';
        let str = String(data).trim();
        
        // Hapus tanda kutip jika terbawa dari spreadsheet
        str = str.replace(/^["']|["']$/g, '');

        // 1. JIKA FORMAT BASE64 (Seperti yang Bapak kirim)
        if (str.startsWith('data:image')) {
            // Bersihkan spasi atau karakter ilegal jika ada
            return str.replace(/\s/g, ''); 
        }

        // 2. JIKA FORMAT GOOGLE DRIVE (Untuk masa depan)
        if (str.includes('drive.google.com')) {
            const idMatch = str.match(/[-\w]{25,}/);
            if (idMatch) return `https://drive.google.com/uc?export=view&id=${idMatch[0]}`;
        }

        return str;
    };

    const formatResmiTanggal = (raw: string) => {
        if (!raw) return '-';
        try {
            const d = new Date(String(raw).split('T')[0]);
            return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        } catch (e) { return raw; }
    };

    const getDocsArray = () => {
        if (!currentMinute?.documentation) return [];
        if (Array.isArray(currentMinute.documentation)) return currentMinute.documentation;
        try {
            const parsed = JSON.parse(String(currentMinute.documentation));
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
            // Jika data di sel spreadsheet dipisah koma
            if (String(currentMinute.documentation).includes(',')) {
                return String(currentMinute.documentation).split(',').map(s => s.trim());
            }
            return [String(currentMinute.documentation)];
        }
    };

    const docImages = getDocsArray();

    // LOGIKA TANDA TANGAN CANVAS
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
        if (ctx) { ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.strokeStyle = '#000080'; ctx.lineTo(x, y); ctx.stroke(); }
    };

    const submitVerify = async () => {
        if (!currentMinute || !canvasRef.current) return;
        const signatureBase64 = canvasRef.current.toDataURL('image/jpeg', 0.5);
        setIsVerifying(true);
        try {
            const payload = { id: currentMinute.id, signedBy: currentUser.name, signedAt: new Date().toLocaleString('id-ID'), signature: signatureBase64, status: 'SIGNED', actionType: 'verify' };
            const res = await SpreadsheetService.postToCloud(payload);
            if (res.success) {
                setCurrentMinute({ ...currentMinute, status: 'SIGNED' as any, signature: signatureBase64, signedBy: currentUser.name });
                setShowSignaturePad(false);
                alert("Berhasil Disahkan!");
            }
        } catch (e) { alert("Gagal!"); } finally { setIsVerifying(false); }
    };

    if (!currentMinute) return <div className="p-20 text-center font-bold">Memuat Arsip Universitas...</div>;

    return (
        <div className="p-4 md:p-10 bg-slate-50 min-h-screen flex flex-col items-center">
            {/* CSS STYLING UNTUK TAMPILAN CETAK DAN LAYOUT KOP */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { size: A4 portrait; margin: 15mm; }
                    .no-print { display: none !important; }
                    .main-container { box-shadow: none !important; border: none !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; }
                    .print-area { font-family: 'Times New Roman', Times, serif !important; color: black !important; line-height: 1.5; font-size: 12pt; }
                    
                    /* GARIS PEMBATAS KOP KHAS SURAT DINAS */
                    .line-double { border-bottom: 3px solid black; margin-top: 5px; position: relative; }
                    .line-double::after { content: ""; display: block; border-bottom: 1px solid black; margin-top: 2px; }
                    
                    .break-page { page-break-before: always !important; }
                    .sig-cell { width: 50% !important; vertical-align: top !important; text-align: center !important; }
                }
                .line-double { border-bottom: 4px solid black; margin-top: 10px; margin-bottom: 25px; position: relative; width: 100%; }
                .line-double::after { content: ""; display: block; border-bottom: 1.5px solid black; margin-top: 2px; }
                .sig-table { width: 100%; border-collapse: collapse; margin-top: 30px; }
                .sig-table td { width: 50%; vertical-align: top; text-align: center; }
            `}} />

            {/* NAVIGASI TOMBOL */}
            <div className="w-full max-w-4xl flex justify-between mb-8 no-print">
                <button onClick={() => onNavigate('history')} className="flex items-center gap-2 font-bold text-[#252859] hover:underline">
                    <span className="material-symbols-outlined">arrow_back</span> Kembali ke Arsip
                </button>
                <div className="flex gap-3">
                    {currentMinute.status !== 'SIGNED' && (
                        <button onClick={() => setShowSignaturePad(true)} className="bg-green-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-green-700">Sahkan</button>
                    )}
                    <button onClick={() => window.print()} className="bg-[#252859] text-white px-8 py-3 rounded-2xl font-bold shadow-lg">Cetak / PDF</button>
                </div>
            </div>

            {/* DOKUMEN UTAMA */}
            <div className="main-container w-full max-w-4xl bg-white shadow-2xl border p-10 md:p-16 mb-20">
                <div className="print-area">
                    
                    {/* KOP SURAT LENGKAP KAMPUS I & II */}
                    <div className="flex items-center">
                        <div className="w-[125px] mr-6 flex-shrink-0">
                            <img src={logoUSM} className="w-full h-auto" alt="Logo USM" />
                        </div>
                        <div className="flex-1 text-center pr-10">
                            <div className="text-[12pt] font-normal leading-tight">YAYASAN SAPTA BAKTI PENDIDIKAN</div>
                            <div className="text-[22pt] font-black my-1 leading-none uppercase">UNIVERSITAS SAPTA MANDIRI</div>
                            <div className="text-[12pt] font-bold mb-2">SK Pendirian No. 661 / E/O/2024</div>
                            <div className="text-[9pt] leading-tight">Kampus I : JL. A. Yani RT.07 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel</div>
                            <div className="text-[9pt] leading-tight">Kampus II : JL. A. Yani KM. 5 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel</div>
                            <div className="text-[8pt] mt-1">Telp/Fax (0526) 209 5962 CP: 0877 7687 7462 Kode Pos : 71618</div>
                            <div className="text-[8pt]">Website : <span className="text-blue-700 underline">www.univsm.ac.id</span> Email : <span className="text-blue-700 underline">info@univsm.ac.id</span></div>
                        </div>
                    </div>

                    {/* GARIS PEMBATAS KOP */}
                    <div className="line-double"></div>

                    {/* JUDUL NOTULENSI */}
                    <div className="text-center mb-10">
                        <h2 className="text-[16pt] font-bold underline uppercase">NOTULENSI RAPAT</h2>
                        <p className="text-[12pt]">Nomor: {currentMinute.id || '...'} /NOT/REK/2026</p>
                    </div>

                    {/* INFORMASI RAPAT */}
                    <div className="space-y-3 mb-10 text-[12pt]">
                        <div className="flex"><span className="w-40 flex-shrink-0">Kegiatan</span><span className="mr-3">:</span><span className="font-bold uppercase flex-1">{currentMinute.title}</span></div>
                        <div className="flex"><span className="w-40 flex-shrink-0">Hari / Tanggal</span><span className="mr-3">:</span><span>{formatResmiTanggal(currentMinute.date)}</span></div>
                        <div className="flex"><span className="w-40 flex-shrink-0">Tempat</span><span className="mr-3">:</span><span>{currentMinute.location}</span></div>
                    </div>

                    {/* ISI PEMBAHASAN */}
                    <div className="mb-14">
                        <p className="font-bold underline mb-4 uppercase text-[12pt]">Hasil Pembahasan:</p>
                        <div className="whitespace-pre-wrap text-justify leading-relaxed text-[12pt] min-h-[250px]">
                            {currentMinute.content}
                        </div>
                    </div>

                    {/* AREA TANDA TANGAN (TABLE FIX SEJAJAR) */}
                    <table className="sig-table">
                        <tbody>
                            <tr>
                                {/* KOLOM KIRI: NOTULIS */}
                                <td className="sig-cell">
                                    <div className="mb-20">Notulis,</div>
                                    <div className="h-28"></div> {/* Spasi agar sejajar dengan TTD Rektor */}
                                    <div className="font-bold uppercase">({currentMinute.submittedBy || '_________________'})</div>
                                </td>

                                {/* KOLOM KANAN: REKTOR */}
                                <td className="sig-cell">
                                    <div className="mb-2">
                                        Paringin, {formatResmiTanggal(currentMinute.date)}<br/>
                                        Mengesahkan, Rektor
                                    </div>
                                    <div className="h-28 flex items-center justify-center my-2">
                                        {currentMinute.signature && (
                                            <img src={renderSmartImage(currentMinute.signature)} className="h-full object-contain" alt="TTD Rektor" />
                                        )}
                                    </div>
                                    <div className="font-bold uppercase underline">
                                        {currentMinute.signedBy || 'ABDUL HAMID, S.Kom., M.M., M.Kom'}
                                    </div>
                                    <div className="text-[10pt]">NIK. 7 1 1018 210693</div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* LAMPIRAN DOKUMENTASI (FOTO BASE64) */}
                    {docImages.length > 0 && (
                        <div className="break-page mt-24 pt-10 border-t border-dashed border-slate-300">
                            <h3 className="text-center font-bold underline mb-12 uppercase text-[14pt]">LAMPIRAN DOKUMENTASI KEGIATAN</h3>
                            <div className="grid grid-cols-2 gap-8">
                                {docImages.map((img: any, i: number) => (
                                    <div key={i} className="border-2 border-slate-100 p-2 bg-slate-50 flex items-center justify-center h-[380px] shadow-sm overflow-hidden">
                                        <img 
                                            src={renderSmartImage(img)} 
                                            className="max-h-full max-w-full object-contain" 
                                            alt={`Lampiran ${i+1}`}
                                            onError={(e) => {
                                                console.error("Gagal load gambar Base64:", i);
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL TANDA TANGAN DIGITAL */}
            {showSignaturePad && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm no-print">
                    <div className="bg-white p-8 rounded-3xl max-w-lg w-full shadow-2xl">
                        <h3 className="text-xl font-bold mb-6 text-center text-[#252859]">Bubuhkan Tanda Tangan</h3>
                        <div className="border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden bg-slate-50 mb-8">
                            <canvas 
                                ref={canvasRef} width={400} height={200} className="w-full h-[200px] cursor-crosshair"
                                onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)}
                                onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={() => setIsDrawing(false)}
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowSignaturePad(false)} className="px-6 py-2 bg-slate-100 rounded-xl font-bold">Batal</button>
                            <button onClick={submitVerify} disabled={isVerifying} className="px-8 py-2 bg-green-600 text-white rounded-xl font-bold">
                                {isVerifying ? 'Proses...' : 'Simpan & Sahkan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MinutesDetail;
