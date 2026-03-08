import React, { useState, useEffect, useRef } from 'react';
import { Minute, Page } from '../types';
import { SpreadsheetService } from '../services/spreadsheet';
import logoUSM from '../logo-usm.png';

/**
 * MINUTES DETAIL - UNIVERSITAS SAPTA MANDIRI (OFFICIAL VERSION)
 * Perbaikan: KOP Lengkap, Garis Ganda, Penjajaran TTD, NIK Baru, Fix Foto Base64
 */
const MinutesDetail: React.FC<{ minute: Minute | null; onNavigate: (p: Page) => void }> = ({ minute, onNavigate }) => {
    const [currentMinute, setCurrentMinute] = useState<Minute | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Ambil data user aktif
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{"name":"ABDUL HAMID, S.Kom., M.M., M.Kom", "role":"PIMPINAN"}');

    useEffect(() => {
        if (minute) setCurrentMinute(minute);
    }, [minute]);

    // ============================================================
    // MESIN PINTAR: MEMBERSIHKAN & MENAMPILKAN GAMBAR (BASE64 & DRIVE)
    // ============================================================
    const renderSmartImage = (rawData: any) => {
        if (!rawData) return '';
        let str = String(rawData).trim();
        
        // Bersihkan tanda kutip liar yang sering muncul dari database
        str = str.replace(/^["']|["']$/g, '');

        // 1. PENANGANAN BASE64 (PENTING: Hapus spasi liar agar gambar muncul)
        if (str.startsWith('data:image')) {
            return str.replace(/\s/g, ''); 
        }

        // 2. PENANGANAN GOOGLE DRIVE (LINK LENGKAP)
        if (str.includes('drive.google.com')) {
            const idMatch = str.match(/[-\w]{25,}/);
            if (idMatch) return `https://drive.google.com/uc?export=view&id=${idMatch[0]}`;
        }
        
        // 3. PENANGANAN HANYA ID DRIVE
        if (str.length >= 25 && !str.includes(' ') && !str.includes('http')) {
            return `https://drive.google.com/uc?export=view&id=${str}`;
        }

        return str;
    };

    const formatResmiTanggal = (raw: string) => {
        if (!raw) return '-';
        try {
            const dateStr = String(raw).split('T')[0];
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return raw;
            return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        } catch (e) { return raw; }
    };

    const getDocumentationArray = () => {
        if (!currentMinute?.documentation) return [];
        if (Array.isArray(currentMinute.documentation)) return currentMinute.documentation;
        try {
            const parsed = JSON.parse(String(currentMinute.documentation));
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
            if (String(currentMinute.documentation).includes(',')) {
                return String(currentMinute.documentation).split(',').map(s => s.trim());
            }
            return [String(currentMinute.documentation)];
        }
    };

    const docImages = getDocumentationArray();

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
                alert("Dokumen Berhasil Disahkan!");
            }
        } catch (e) { alert("Gagal mengesahkan dokumen."); } finally { setIsVerifying(false); }
    };

    if (!currentMinute) return <div className="p-20 text-center font-bold">MEMUAT ARSIP NOTULENSI...</div>;

    return (
        <div className="p-4 md:p-10 bg-slate-100 min-h-screen flex flex-col items-center">
            {/* CSS STYLING KHUSUS CETAK & GARIS KOP */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { size: A4 portrait; margin: 15mm; }
                    .no-print { display: none !important; }
                    .main-container { box-shadow: none !important; border: none !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; }
                    .print-area { font-family: 'Times New Roman', serif !important; color: black !important; line-height: 1.4; font-size: 12pt; }
                    
                    /* GARIS PEMBATAS KOP KHAS SURAT DINAS (TEBAL-TIPIS) */
                    .line-heavy { border-bottom: 3.5pt solid black !important; width: 100% !important; margin-top: 5px !important; }
                    .line-light { border-bottom: 1pt solid black !important; width: 100% !important; margin-top: 2px !important; margin-bottom: 25px !important; }
                    
                    .break-page { page-break-before: always !important; }
                    .sig-table { width: 100% !important; table-layout: fixed !important; border-collapse: collapse !important; border: none !important; }
                    .sig-table td { vertical-align: top !important; text-align: center !important; border: none !important; }
                }
                .line-heavy { border-bottom: 4px solid black; margin-top: 10px; width: 100%; }
                .line-light { border-bottom: 1.5px solid black; margin-top: 2px; margin-bottom: 25px; width: 100%; }
                .sig-table { width: 100%; border-collapse: collapse; margin-top: 40px; table-layout: fixed; }
                .sig-table td { width: 50%; vertical-align: top; text-align: center; }
            `}} />

            {/* TOMBOL NAVIGASI */}
            <div className="w-full max-w-4xl flex justify-between mb-6 no-print">
                <button onClick={() => onNavigate('history')} className="font-bold flex items-center gap-2 text-[#252859] hover:underline transition-all">
                    <span className="material-symbols-outlined">arrow_back</span> Kembali ke Arsip
                </button>
                <div className="flex gap-3">
                    {(currentUser.role === 'PIMPINAN' || currentUser.role === 'SUPER_ADMIN') && currentMinute.status !== 'SIGNED' && (
                        <button onClick={() => setShowSignaturePad(true)} className="bg-green-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-green-700 transition-all">Sahkan</button>
                    )}
                    <button onClick={() => window.print()} className="bg-[#252859] text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:brightness-125 transition-all">Cetak / PDF</button>
                </div>
            </div>

            {/* KERTAS NOTULENSI */}
            <div className="main-container w-full max-w-4xl bg-white shadow-2xl border p-10 md:p-16 mb-20">
                <div className="print-area">
                    
                    {/* KOP SURAT LENGKAP UNIVERSITAS SAPTA MANDIRI */}
                    <div className="flex items-center">
                        <div className="w-[130px] mr-6 flex-shrink-0">
                            <img src={logoUSM} className="w-full h-auto" alt="Logo USM" />
                        </div>
                        <div className="flex-1 text-center pr-10">
                            <div className="text-[12pt] font-normal leading-tight">YAYASAN SAPTA BAKTI PENDIDIKAN</div>
                            <div className="text-[22pt] font-black my-1 leading-none uppercase tracking-tight">UNIVERSITAS SAPTA MANDIRI</div>
                            <div className="text-[14pt] font-bold mb-2">SK Pendirian No. 661 / E/O/2024</div>
                            <div className="text-[9.5pt] leading-tight font-medium italic">Kampus I : JL. A. Yani RT.07 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel</div>
                            <div className="text-[9.5pt] leading-tight font-medium italic">Kampus II : JL. A. Yani KM. 5 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel</div>
                            <div className="text-[8.5pt] mt-1 font-bold">
                                Telp/Fax (0526) 209 5962 CP: 0877 7687 7462 Kode Pos : 71618
                            </div>
                            <div className="text-[8.5pt] font-bold">
                                Website : <span className="text-blue-800 underline">www.univsm.ac.id</span> Email : <span className="text-blue-800 underline">info@univsm.ac.id</span>
                            </div>
                        </div>
                    </div>

                    {/* GARIS PEMBATAS KOP GANDA */}
                    <div className="line-heavy"></div>
                    <div className="line-light"></div>

                    {/* JUDUL DAN NOMOR */}
                    <div className="text-center mb-8">
                        <h2 className="text-[16pt] font-bold underline uppercase tracking-wider">NOTULENSI RAPAT</h2>
                        <p className="text-[12pt] mt-1">Nomor: {currentMinute.id} /NOT/REK/2026</p>
                    </div>

                    {/* INFO RAPAT */}
                    <div className="space-y-3 mb-10 text-[12pt]">
                        <div className="flex"><span className="w-40 flex-shrink-0">Kegiatan</span><span className="mr-3">:</span><span className="font-bold uppercase flex-1">{currentMinute.title}</span></div>
                        <div className="flex"><span className="w-40 flex-shrink-0">Hari / Tanggal</span><span className="mr-3">:</span><span className="flex-1">{formatResmiTanggal(currentMinute.date)}</span></div>
                        <div className="flex"><span className="w-40 flex-shrink-0">Tempat</span><span className="mr-3">:</span><span className="flex-1">{currentMinute.location}</span></div>
                    </div>

                    {/* ISI PEMBAHASAN */}
                    <div className="mb-14">
                        <p className="font-bold underline mb-4 uppercase text-[12pt]">Hasil Pembahasan:</p>
                        <div className="whitespace-pre-wrap text-justify leading-relaxed text-[12pt] min-h-[300px]">
                            {currentMinute.content}
                        </div>
                    </div>

                    {/* TANDA TANGAN (SEJAJAR & TENGAH) */}
                    <table className="sig-table">
                        <tbody>
                            <tr>
                                <td style={{ paddingBottom: '10px' }}>Notulis,</td>
                                <td style={{ paddingBottom: '10px' }}>
                                    Paringin, {formatResmiTanggal(currentMinute.date)}<br/>
                                    Mengesahkan, Rektor
                                </td>
                            </tr>
                            <tr>
                                <td style={{ height: '120px' }}>
                                    {/* Kolom Notulis (Kosong/Tempat TTD Basah) */}
                                </td>
                                <td style={{ height: '120px', textAlign: 'center' }}>
                                    {currentMinute.signature && (
                                        <div style={{ display: 'inline-block' }}>
                                            <img src={renderSmartImage(currentMinute.signature)} style={{ maxHeight: '100px', width: 'auto', display: 'block', margin: '0 auto' }} alt="TTD Rektor" />
                                        </div>
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td className="font-bold uppercase">
                                    ({currentMinute.submittedBy || '_________________________'})
                                </td>
                                <td>
                                    <div className="font-bold uppercase underline">
                                        {currentMinute.signedBy || 'ABDUL HAMID, S.Kom., M.M., M.Kom'}
                                    </div>
                                    <div style={{ marginTop: '2px', fontWeight: 'bold' }}>NIK. 7 1 1018 210693</div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* LAMPIRAN FOTO (BASE64/DRIVE) */}
                    {docImages.length > 0 && (
                        <div className="break-page mt-24 pt-10 border-t border-dashed border-slate-300">
                            <h3 className="text-center font-bold underline mb-10 uppercase text-[14pt]">LAMPIRAN DOKUMENTASI</h3>
                            <div className="grid grid-cols-2 gap-8">
                                {docImages.map((img: any, i: number) => (
                                    <div key={i} className="border-2 border-slate-100 p-2 bg-white flex items-center justify-center h-[380px] shadow-sm rounded-lg overflow-hidden">
                                        <img 
                                            src={renderSmartImage(img)} 
                                            className="max-h-full max-w-full object-contain" 
                                            alt={`Lampiran ${i+1}`}
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL TTD DIGITAL */}
            {showSignaturePad && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm no-print p-4">
                    <div className="bg-white p-8 rounded-3xl max-w-lg w-full shadow-2xl">
                        <h3 className="text-xl font-bold mb-6 text-center">Bubuhkan Tanda Tangan</h3>
                        <div className="border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden bg-slate-50 mb-8">
                            <canvas 
                                ref={canvasRef} width={400} height={200} className="w-full h-[200px] cursor-crosshair"
                                onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)}
                                onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={() => setIsDrawing(false)}
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowSignaturePad(false)} className="px-6 py-2 bg-slate-100 rounded-xl font-bold">Batal</button>
                            <button onClick={submitVerify} disabled={isVerifying} className="px-8 py-2 bg-green-600 text-white rounded-xl font-bold">Sahkan</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MinutesDetail;
