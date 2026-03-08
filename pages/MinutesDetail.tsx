import React, { useState, useEffect, useRef } from 'react';
import { Minute, Page } from '../types';
import { SpreadsheetService } from '../services/spreadsheet';
import logoUSM from '../logo-usm.png';

const MinutesDetail: React.FC<{ minute: Minute | null; onNavigate: (p: Page) => void }> = ({ minute, onNavigate }) => {
    const [currentMinute, setCurrentMinute] = useState<Minute | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    const [signatureMethod, setSignatureMethod] = useState<'draw' | 'upload'>('draw');
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Default data pimpinan jika memori kosong
    let currentUser = { name: 'ABDUL HAMID, S.Kom., M.M., M.Kom', role: 'PIMPINAN' };
    try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) currentUser = JSON.parse(storedUser);
    } catch (e) {
        console.warn("Memori User Kosong");
    }

    useEffect(() => {
        if (minute) setCurrentMinute(minute);
    }, [minute]);

    // ==========================================
    // LOGIKA PINTAR PEMBACA GAMBAR (HYBRID SYSTEM)
    // Mendukung Data Lama (Sheets) & Data Baru (Drive)
    // ==========================================
    const renderSmartImage = (data: string) => {
        if (!data || typeof data !== 'string') return '';

        // 1. Jika data berupa Base64 (Data Lama langsung dari Spreadsheet)
        if (data.startsWith('data:image')) {
            return data;
        }

        // 2. Jika data berupa Link Google Drive (Data Baru)
        if (data.includes('drive.google.com')) {
            // Ekstrak ID File secara paksa menggunakan Regex
            const idMatch = data.match(/[-\w]{25,}/);
            if (idMatch && idMatch[0]) {
                return `https://drive.google.com/uc?export=view&id=${idMatch[0]}`;
            }
        }

        // 3. Jika link url biasa
        return data;
    };

    const handlePrint = () => { window.print(); };

    const formatTeksResmi = (teks?: string) => {
        if (!teks) return '-';
        return String(teks).replace(/[ \t]+/g, ' ').replace(/(\n\s*){3,}/g, '\n\n').trim();
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

    // ==========================================
    // LOGIKA TANDA TANGAN (CANVAS SYSTEM)
    // ==========================================
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
            ctx.lineWidth = 2.5; 
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#00008B'; 
            ctx.lineTo(x, y); 
            ctx.stroke(); 
        }
    };

    const submitVerify = async () => {
        if (!currentMinute || !canvasRef.current) return;
        const signatureBase64 = canvasRef.current.toDataURL('image/jpeg', 0.4);
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
                alert("Notulensi Berhasil Disahkan!");
            }
        } catch (e) { 
            alert("Gagal mengesahkan notulensi."); 
        } finally { 
            setIsVerifying(false); 
        }
    };

    if (!currentMinute) return <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest">Memuat Dokumen...</div>;

    return (
        <div className="p-4 md:p-10 bg-slate-100 min-h-screen flex flex-col items-center">
            {/* CSS KHUSUS CETAK DAN LAYOUT */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { size: A4 portrait; margin: 15mm; }
                    .no-print { display: none !important; }
                    .main-container { box-shadow: none !important; border: none !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; }
                    .print-area { font-family: 'Times New Roman', Times, serif !important; color: black !important; line-height: 1.4; font-size: 12pt; }
                    
                    /* GARIS KOP SURAT STANDAR NEGARA */
                    .kop-line-thick { border-bottom: 3.5pt solid black !important; width: 100% !important; margin-top: 5px !important; }
                    .kop-line-thin { border-bottom: 1pt solid black !important; width: 100% !important; margin-top: 2px !important; margin-bottom: 25px !important; }
                    
                    img { max-width: 100%; display: block; }
                    .break-page { page-break-before: always !important; break-before: page !important; }
                    .signature-table td { vertical-align: top; }
                }
                
                .kop-line-thick { border-bottom: 4px solid black; width: 100%; margin-top: 5px; }
                .kop-line-thin { border-bottom: 1.5px solid black; width: 100%; margin-top: 2px; margin-bottom: 25px; }
            `}} />

            {/* BAR NAVIGASI ATAS */}
            <div className="w-full max-w-4xl flex justify-between mb-6 no-print">
                <button onClick={() => onNavigate('history')} className="bg-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm border border-slate-200 hover:bg-slate-50 transition-all text-[#252859]">
                    <span className="material-symbols-outlined">arrow_back</span> Kembali ke Arsip
                </button>
                <div className="flex gap-3">
                    {(currentUser.role === 'PIMPINAN' || currentUser.role === 'SUPER_ADMIN') && currentMinute.status !== 'SIGNED' && (
                        <button onClick={() => setShowSignaturePad(true)} className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-green-700 transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined">verified</span> Sahkan
                        </button>
                    )}
                    <button onClick={handlePrint} className="bg-[#252859] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg flex items-center gap-2 hover:bg-black transition-all">
                        <span className="material-symbols-outlined">print</span> Cetak / PDF
                    </button>
                </div>
            </div>

            {/* KERTAS PUTIH UTAMA */}
            <div className="main-container w-full max-w-4xl bg-white shadow-2xl border border-slate-200 p-10 md:p-16 rounded-[0.5rem] md:rounded-[2rem]">
                <div className="print-area">
                    
                    {/* KOP SURAT LENGKAP UNIVERSITAS SAPTA MANDIRI */}
                    <div className="flex items-center">
                        <div className="w-[125px] mr-6 flex-shrink-0">
                            <img src={logoUSM} className="w-full h-auto" alt="Logo USM" />
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
                                Website : <span className="text-blue-700 underline italic">www.univsm.ac.id</span> Email : <span className="text-blue-700 underline italic">info@univsm.ac.id</span>
                            </div>
                        </div>
                    </div>

                    {/* GARIS PEMBATAS GANDA */}
                    <div className="kop-line-thick"></div>
                    <div className="kop-line-thin"></div>

                    {/* JUDUL DAN NOMOR SURAT */}
                    <div className="text-center mb-10">
                        <h2 className="text-[16pt] font-bold underline uppercase tracking-wide">NOTULENSI RAPAT</h2>
                        <p className="text-[12pt] mt-1">Nomor: {currentMinute.id || '...'} /NOT/REK/2026</p>
                    </div>

                    {/* INFORMASI KEGIATAN */}
                    <div className="space-y-3 mb-10 text-[12pt]">
                        <div className="flex"><span className="w-40 flex-shrink-0">Kegiatan</span><span className="mr-3">:</span><span className="font-bold uppercase flex-1">{currentMinute.title}</span></div>
                        <div className="flex"><span className="w-40 flex-shrink-0">Hari / Tanggal</span><span className="mr-3">:</span><span className="flex-1">{formatResmiTanggal(currentMinute.date)}</span></div>
                        <div className="flex"><span className="w-40 flex-shrink-0">Tempat</span><span className="mr-3">:</span><span className="flex-1">{currentMinute.location}</span></div>
                    </div>

                    {/* HASIL PEMBAHASAN */}
                    <div className="mb-14">
                        <p className="font-bold underline mb-4 uppercase text-[12pt]">Hasil Pembahasan:</p>
                        <div className="whitespace-pre-wrap text-justify leading-relaxed text-[12pt] min-h-[200px]">
                            {formatTeksResmi(currentMinute.content)}
                        </div>
                    </div>

                    {/* AREA TANDA TANGAN (NOTULIS & REKTOR) */}
                    <table className="w-full border-none signature-table mt-12">
                        <tbody>
                            <tr>
                                <td className="w-1/2 text-center pb-24 text-[12pt]">Notulis,</td>
                                <td className="w-1/2 text-center text-[12pt]">
                                    Paringin, {formatResmiTanggal(currentMinute.date)}<br/>
                                    Mengesahkan,<br/>Rektor
                                    <div className="h-28 flex items-center justify-center my-2">
                                        {currentMinute.signature && (
                                            <img src={renderSmartImage(currentMinute.signature)} className="h-full object-contain" alt="TTD Rektor" />
                                        )}
                                    </div>
                                </td>
                            </tr>
                            <tr className="font-bold uppercase text-[12pt]">
                                <td className="text-center">({currentMinute.submittedBy || '_________________________'})</td>
                                <td className="text-center">
                                    <span className="underline">{currentMinute.signedBy || 'ABDUL HAMID, S.Kom., M.M., M.Kom'}</span><br/>
                                    <span className="font-normal normal-case text-[10pt]">NIP. 1121069301</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* LAMPIRAN DOKUMENTASI (FOTO) */}
                    {docsImages.length > 0 && (
                        <div className="break-page mt-24 pt-10 border-t border-dashed border-slate-300">
                            <h3 className="text-center font-bold underline mb-10 uppercase text-[14pt]">LAMPIRAN DOKUMENTASI</h3>
                            <div className="grid grid-cols-2 gap-8">
                                {docsImages.map((img: any, i: number) => (
                                    <div key={i} className="border-2 border-slate-100 p-2 bg-slate-50 flex items-center justify-center h-[380px] shadow-sm rounded-lg overflow-hidden">
                                        <img 
                                            src={renderSmartImage(img)} 
                                            className="max-h-full max-w-full object-contain" 
                                            alt={`Dokumentasi Rapat ${i+1}`}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                console.error("Gagal load gambar:", img);
                                                target.style.display = 'none'; // Sembunyikan jika rusak agar tidak merusak layout
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL SIGNATURE PAD (HANYA MUNCUL SAAT KLIK SAHKAN) */}
            {showSignaturePad && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm no-print p-4">
                    <div className="bg-white p-8 rounded-[2.5rem] max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300">
                        <h3 className="text-2xl font-black mb-2 text-center text-[#252859]">Pengesahan Digital</h3>
                        <p className="text-center text-slate-400 text-sm mb-6 uppercase font-bold tracking-widest">Gunakan Jari atau Stylus</p>
                        
                        <div className="border-2 border-dashed border-slate-200 rounded-3xl overflow-hidden bg-white mb-8 relative">
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
                                Hapus
                            </button>
                            <div className="flex gap-2">
                                <button onClick={() => setShowSignaturePad(false)} className="px-6 py-3 bg-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-200 transition-all">Batal</button>
                                <button onClick={submitVerify} disabled={isVerifying} className="px-8 py-3 bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-900/20 hover:bg-green-700 transition-all">
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
