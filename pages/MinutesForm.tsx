import React, { useState, useEffect, useRef } from 'react';
import { Minute, Page } from '../types';
import { SpreadsheetService } from '../services/spreadsheet';
import logoUSM from '../logo-usm.png';

const MinutesDetail: React.FC<{ minute: Minute; onNavigate: (p: Page) => void }> = ({ minute, onNavigate }) => {
    const [currentMinute, setCurrentMinute] = useState<any | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    const [signatureMethod, setSignatureMethod] = useState<'draw' | 'upload'>('draw');
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    useEffect(() => {
        if (minute) setCurrentMinute(minute);
    }, [minute]);

    const handlePrint = () => { window.print(); };

    const formatTeksResmi = (teks?: string) => {
        if (!teks) return '-';
        return String(teks).replace(/[ \t]+/g, ' ').replace(/(\n\s*){3,}/g, '\n\n').trim();
    };

    const getDocumentationImages = () => {
        if (!currentMinute || !currentMinute.documentation) return [];
        if (Array.isArray(currentMinute.documentation)) return currentMinute.documentation;
        try { return JSON.parse(String(currentMinute.documentation)); } 
        catch (error) { return []; }
    };

    const docsImages = getDocumentationImages();

    // --- LOGIKA TANDA TANGAN ---
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

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = canvasRef.current;
                    const ctx = canvas?.getContext('2d');
                    if (ctx && canvas) {
                        ctx.fillStyle = "#FFFFFF";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 50, 10, 300, 180); 
                    }
                };
                img.src = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx && canvas) {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    };

    const submitVerify = async () => {
        if (!currentMinute) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Kompresi tanda tangan agar tidak error
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            ctx.drawImage(canvas, 0, 0);
        }
        
        const signatureBase64 = tempCanvas.toDataURL('image/jpeg', 0.4);

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

            const response = await SpreadsheetService.postToCloud(payload);
            
            if (response.success) {
                const updatedData = { ...currentMinute, status: 'SIGNED', signedBy: currentUser.name, signature: signatureBase64 };
                setCurrentMinute(updatedData);
                
                const cache = JSON.parse(localStorage.getItem('usm_minutes_cache') || '[]');
                const newCache = cache.map((m: any) => m.id === currentMinute.id ? updatedData : m);
                localStorage.setItem('usm_minutes_cache', JSON.stringify(newCache));

                setShowSignaturePad(false);
                alert("Notulensi Berhasil Disahkan!");
            } else {
                throw new Error("Ditolak Server Google Sheets (Cek URL Web App).");
            }
        } catch (error: any) {
            alert("GAGAL MENGESAHKAN!\n\nPastikan Anda sudah mengklik 'Terapkan Versi Baru' di Google Apps Script.\nError Server: " + error.message);
        } finally { setIsVerifying(false); }
    };

    if (!currentMinute) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-10 border-4 border-[#252859] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[#252859] font-bold animate-pulse">Menyiapkan Dokumen...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen flex flex-col items-center">
            
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { size: A4 portrait; margin: 15mm; }
                    body, html { margin: 0 !important; padding: 0 !important; background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    .no-print { display: none !important; }
                    .main-container { box-shadow: none !important; border: none !important; width: 100% !important; max-width: 100% !important; padding: 0 !important; margin: 0 !important; border-radius: 0 !important; }
                    .print-wrapper { display: table; width: 100%; border-collapse: collapse; }
                    .print-header { display: table-header-group; }
                    .print-body { display: table-row-group; }
                    .break-inside-avoid { page-break-inside: avoid !important; break-inside: avoid !important; }
                    .break-page { page-break-before: always !important; break-before: page !important; padding-top: 5mm; }
                    .print-area { font-family: 'Times New Roman', Times, serif !important; color: black !important; }
                    .text-small { font-size: 9pt !important; line-height: 1.2 !important; }
                    .print-blue { color: #0000FF !important; }
                    tr, td { page-break-inside: avoid !important; }
                    a { text-decoration: none !important; color: #0000FF !important; }
                }
            `}} />

            {/* MODAL TANDA TANGAN */}
            {showSignaturePad && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 no-print">
                    <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-lg w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Pengesahan Pimpinan</h3>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                <button onClick={() => setSignatureMethod('draw')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${signatureMethod === 'draw' ? 'bg-white shadow-sm text-[#252859]' : 'text-slate-400'}`}>Gores</button>
                                <button onClick={() => setSignatureMethod('upload')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${signatureMethod === 'upload' ? 'bg-white shadow-sm text-[#252859]' : 'text-slate-400'}`}>Upload</button>
                            </div>
                        </div>
                        
                        <div className="relative border-2 border-dashed border-slate-200 rounded-2xl mb-6 h-[220px] overflow-hidden bg-white">
                            <canvas ref={canvasRef} width={400} height={200} className="w-full h-full bg-white cursor-crosshair" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={() => setIsDrawing(false)} />
                            {signatureMethod === 'upload' && (
                                <div className="absolute inset-0 bg-white flex flex-col items-center justify-center">
                                    <button onClick={() => fileInputRef.current?.click()} className="bg-[#252859]/10 text-[#252859] px-6 py-2 rounded-xl font-bold text-sm mb-2 hover:bg-[#252859]/20 transition-all">Pilih File TTD</button>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Format PNG / JPG</p>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center">
                            <button onClick={clearCanvas} className="text-red-500 font-bold text-sm hover:underline">Hapus Coretan</button>
                            <div className="flex gap-2">
                                <button onClick={() => setShowSignaturePad(false)} className="px-5 py-2.5 bg-slate-100 rounded-xl text-sm font-bold">Batal</button>
                                <button onClick={submitVerify} disabled={isVerifying} className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-900/20">{isVerifying ? 'Menyimpan...' : 'Simpan & Sahkan'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* BAR MENU */}
            <div className="w-full max-w-4xl flex justify-between items-center mb-6 no-print">
                <button onClick={() => onNavigate('history')} className="text-[#252859] font-bold flex items-center gap-2 hover:underline"><span className="material-symbols-outlined">arrow_back</span> Kembali</button>
                <div className="flex gap-2">
                    {(currentUser.role === 'PIMPINAN' || currentUser.role === 'SUPER_ADMIN') && currentMinute.status !== 'SIGNED' && (
                        <button onClick={() => setShowSignaturePad(true)} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg"><span className="material-symbols-outlined">verified</span> Sahkan Notulensi</button>
                    )}
                    <button onClick={handlePrint} className="bg-[#252859] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg"><span className="material-symbols-outlined">print</span> Cetak</button>
                </div>
            </div>

            <div className="main-container w-full max-w-4xl bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden px-2 md:px-8 py-8">
                <table className="print-wrapper print-area w-full text-black">
                    <thead className="print-header">
                        <tr>
                            <td>
                                <div className="pb-4">
                                    <div className="flex items-center justify-between pb-1">
                                        <div className="w-[110px] mr-4"><img src={logoUSM} className="w-full h-auto object-contain" /></div>
                                        <div className="flex-1 text-center pr-6">
                                            <div className="text-[12pt] font-normal leading-tight">YAYASAN SAPTA BAKTI PENDIDIKAN</div>
                                            <div className="text-[22pt] font-bold leading-none my-1">UNIVERSITAS SAPTA MANDIRI</div>
                                            <div className="text-[14pt] font-bold mb-2">SK Pendirian No. 661 / E/O/2024</div>
                                            <div className="text-small">Kampus I : JL. A. Yani RT.07 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel</div>
                                            <div className="text-small">Kampus II : JL. A. Yani KM. 5 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel</div>
                                            <div className="text-small">Telp/Fax (0526) 209 5962 CP: 0877 7687 7462 Kode Pos : 71618</div>
                                            <div className="text-small mt-0.5">Website : <span className="print-blue underline">www.univsm.ac.id</span> Email : <span className="print-blue underline">info@univsm.ac.id</span></div>
                                        </div>
                                    </div>
                                    <div className="w-full border-t-[4px] border-black mt-3"></div>
                                    <div className="w-full border-t-[1px] border-black mt-[2px]"></div>
                                </div>
                            </td>
                        </tr>
                    </thead>

                    <tbody className="print-body">
                        <tr>
                            <td>
                                <div>
                                    <div className="text-center my-6">
                                        <h2 className="text-[14pt] font-bold uppercase underline">NOTULENSI RAPAT</h2>
                                        <p className="text-[12pt] mt-1">Nomor: {currentMinute.id || '...'} /NOT/REK/2026</p>
                                    </div>

                                    <div className="space-y-4 mb-8 text-[12pt]">
                                        <div className="grid grid-cols-[160px_20px_1fr] break-inside-avoid"><span>Kegiatan</span><span>:</span><span className="uppercase font-bold">{currentMinute.title}</span></div>
                                        <div className="grid grid-cols-[160px_20px_1fr] break-inside-avoid"><span>Hari / Tanggal</span><span>:</span><span>{currentMinute.date ? new Date(currentMinute.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</span></div>
                                        <div className="grid grid-cols-[160px_20px_1fr] break-inside-avoid"><span>Tempat</span><span>:</span><span>{currentMinute.location || '-'}</span></div>
                                    </div>

                                    <div className="mb-10">
                                        <p className="font-bold mb-3 uppercase text-[12pt]">Hasil Pembahasan:</p>
                                        <div className="whitespace-pre-wrap text-justify leading-[1.8] text-[12pt]">
                                            {formatTeksResmi(currentMinute.content)}
                                        </div>
                                    </div>

                                    {/* FITUR BARU: MUNCULKAN LINK GDRIVE JIKA ADA */}
                                    {currentMinute.gdriveLink && (
                                        <div className="mb-10 break-inside-avoid p-4 border border-blue-100 bg-blue-50/30 rounded-xl">
                                            <p className="font-bold mb-2 uppercase text-[11pt] text-slate-700">Tautan Lampiran Ekstra (Google Drive / Lainnya):</p>
                                            <a href={currentMinute.gdriveLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline text-[11pt] break-all flex items-start gap-2">
                                                <span className="material-symbols-outlined text-[14pt] mt-0.5">link</span>
                                                {currentMinute.gdriveLink}
                                            </a>
                                        </div>
                                    )}

                                    <table className="w-full text-center text-[12pt] border-none mb-10 break-inside-avoid">
                                        <tbody>
                                            <tr>
                                                <td className="w-1/2 align-top pb-24 font-normal"><br/><br/>Notulis,</td>
                                                <td className="w-1/2 align-top font-normal">
                                                    Paringin, {currentMinute.date ? new Date(currentMinute.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '_________________'}<br/>
                                                    Mengesahkan,<br/>Rektor
                                                    {currentMinute.signature && (
                                                        <div className="h-[80px] flex items-center justify-center my-1">
                                                            <img src={currentMinute.signature} className="h-[80px] object-contain" />
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="font-bold uppercase">( {currentMinute.submittedBy || '_________________________'} )</td>
                                                <td>
                                                    <span className="underline font-bold uppercase">{currentMinute.signedBy || 'ABDUL HAMID, S.Kom., M.M., M.Kom'}</span><br/>
                                                    NIP. 1121069301
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    {/* PREVIEW FOTO KETIKA DIBUKA ATAU DICETAK */}
                                    {docsImages && docsImages.length > 0 && (
                                        <div className="break-page pt-4">
                                            <h3 className="text-center font-bold uppercase underline mb-6">LAMPIRAN DOKUMENTASI</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                {docsImages.map((img: string, i: number) => (
                                                    <div key={i} className="border-2 border-slate-200 p-2 break-inside-avoid shadow-sm flex items-center justify-center bg-slate-50 min-h-[200px]">
                                                        <img src={img} className="max-w-full h-auto object-contain max-h-[350px] mix-blend-multiply" alt={`Lampiran ${i+1}`} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MinutesDetail;
