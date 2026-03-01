import React, { useState, useEffect, useRef } from 'react';
import { Minute, Page } from '../types';
import { SpreadsheetService } from '../services/spreadsheet';
import logoUSM from '../logo-usm.png';

const MinutesDetail: React.FC<{ minute: Minute; onNavigate: (p: Page) => void }> = ({ minute, onNavigate }) => {
    const [currentMinute, setCurrentMinute] = useState<Minute>(minute);
    const [isVerifying, setIsVerifying] = useState(false);
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    const [signatureMethod, setSignatureMethod] = useState<'draw' | 'upload'>('draw');
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    useEffect(() => {
        setCurrentMinute(minute);
    }, [minute]);

    const handlePrint = () => { window.print(); };

    const formatTeksResmi = (teks?: string) => {
        if (!teks) return '-';
        return teks.replace(/[ \t]+/g, ' ').replace(/(\n\s*){3,}/g, '\n\n').trim();
    };

    // --- LOGIKA DRAWING ---
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
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#00008B';
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    };

    // --- LOGIKA UPLOAD ---
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                // Kita masukkan ke canvas agar ukurannya seragam
                const img = new Image();
                img.onload = () => {
                    const canvas = canvasRef.current;
                    const ctx = canvas?.getContext('2d');
                    if (ctx && canvas) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    }
                };
                img.src = base64String;
            };
            reader.readAsDataURL(file);
        }
    };

    const submitVerify = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const signatureBase64 = canvas.toDataURL('image/png');

        setIsVerifying(true);
        try {
            await SpreadsheetService.postToCloud({
                id: currentMinute.id,
                signedBy: currentUser.name,
                signedAt: new Date().toLocaleString('id-ID'),
                signature: signatureBase64,
                status: 'SIGNED',
                actionType: 'verify'
            });
            setCurrentMinute(prev => ({ ...prev, status: 'SIGNED', signedBy: currentUser.name, signature: signatureBase64 }));
            setShowSignaturePad(false);
            alert("Berhasil disahkan!");
        } catch (error) {
            alert("Gagal mengesahkan.");
        } finally { setIsVerifying(false); }
    };

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen flex flex-col items-center">
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { size: A4; margin: 0; }
                    body { margin: 1.5cm 2cm; background: white !important; }
                    .no-print { display: none !important; }
                    .print-area { display: table !important; width: 100% !important; font-family: 'Times New Roman', serif !important; }
                    
                    /* CSS FORCE HEADER REPEAT */
                    thead { display: table-header-group !important; }
                    tfoot { display: table-footer-group !important; }
                    tr { page-break-inside: avoid !important; }
                }
            `}} />

            {/* MODAL TTD DUA OPSI */}
            {showSignaturePad && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 no-print">
                    <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-lg w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Opsi Tanda Tangan</h3>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                <button onClick={() => setSignatureMethod('draw')} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${signatureMethod === 'draw' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}>Gores</button>
                                <button onClick={() => setSignatureMethod('upload')} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${signatureMethod === 'upload' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}>Upload</button>
                            </div>
                        </div>
                        
                        <div className="relative border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 mb-4 h-[200px] flex items-center justify-center overflow-hidden">
                            <canvas ref={canvasRef} width={400} height={200} className="w-full h-full bg-white cursor-crosshair" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={() => setIsDrawing(false)} />
                            {signatureMethod === 'upload' && (
                                <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-4">
                                    <button onClick={() => fileInputRef.current?.click()} className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold mb-2">Pilih File TTD (PNG/JPG)</button>
                                    <p className="text-[10px] text-slate-400">Pastikan background TTD transparan/putih</p>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between gap-3">
                            <button onClick={() => { const ctx = canvasRef.current?.getContext('2d'); ctx?.clearRect(0,0,400,200); }} className="text-red-500 font-bold text-sm">Hapus</button>
                            <div className="flex gap-2">
                                <button onClick={() => setShowSignaturePad(false)} className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold">Batal</button>
                                <button onClick={submitVerify} disabled={isVerifying} className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold">Simpan & Sahkan</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full max-w-4xl flex justify-between mb-6 no-print">
                <button onClick={() => onNavigate('history')} className="font-bold flex items-center gap-2"><span className="material-symbols-outlined">arrow_back</span> Kembali</button>
                <div className="flex gap-2">
                    {(currentUser.role === 'PIMPINAN' || currentUser.role === 'SUPER_ADMIN') && currentMinute.status !== 'SIGNED' && (
                        <button onClick={() => setShowSignaturePad(true)} className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-900/20"><span className="material-symbols-outlined">draw</span> Sahkan & TTD</button>
                    )}
                    <button onClick={handlePrint} className="bg-[#252859] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-900/20"><span className="material-symbols-outlined">print</span> Cetak</button>
                </div>
            </div>

            <div className="w-full max-w-4xl bg-white p-12 rounded-[2rem] shadow-xl border border-slate-200">
                <table className="print-area w-full border-none">
                    <thead className="print-header">
                        <tr>
                            <td className="pb-6">
                                <div className="flex items-center justify-between pb-1">
                                    <div className="w-[110px] mr-4"><img src={logoUSM} className="w-full h-auto object-contain" /></div>
                                    <div className="flex-1 text-center pr-6">
                                        <div className="text-[12pt] mb-1">YAYASAN SAPTA BAKTI PENDIDIKAN</div>
                                        <div className="text-[22pt] font-bold mb-1.5">UNIVERSITAS SAPTA MANDIRI</div>
                                        <div className="text-[14pt] font-bold mb-2">SK Pendirian No. 661 / E/O/2024</div>
                                        <div className="text-[9pt] leading-tight">Kampus I : JL. A. Yani RT.07 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel</div>
                                        <div className="text-[9pt] leading-tight">Kampus II : JL. A. Yani KM. 5 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel</div>
                                        <div className="text-[9pt] leading-tight">Telp/Fax (0526) 209 5962 CP: 0877 7687 7462 Kode Pos : 71618</div>
                                        <div className="text-[9pt] mt-0.5">Website : <span className="print-blue underline">www.univsm.ac.id</span> Email : <span className="print-blue underline">info@univsm.ac.id</span></div>
                                    </div>
                                </div>
                                <div className="w-full border-t-[4px] border-black mt-3"></div>
                                <div className="w-full border-t-[1px] border-black mt-[2px]"></div>
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <div className="text-center my-8"><h2 className="text-[14pt] font-bold uppercase underline">NOTULENSI RAPAT</h2><p className="text-[12pt] mt-1">Nomor: {currentMinute.id || '...'} /NOT/REK/2026</p></div>
                                <div className="space-y-4 mb-8 text-[12pt]">
                                    <div className="grid grid-cols-[160px_20px_1fr]"><span>Kegiatan</span><span>:</span><span className="uppercase font-bold">{currentMinute.title}</span></div>
                                    <div className="grid grid-cols-[160px_20px_1fr]"><span>Hari / Tanggal</span><span>:</span><span>{currentMinute.date ? new Date(currentMinute.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</span></div>
                                    <div className="grid grid-cols-[160px_20px_1fr]"><span>Tempat</span><span>:</span><span>{currentMinute.location || '-'}</span></div>
                                </div>
                                <div className="mb-16"><p className="font-bold mb-3 uppercase">Hasil Pembahasan:</p><div className="whitespace-pre-wrap text-justify leading-[1.8]">{formatTeksResmi(currentMinute.content)}</div></div>
                                <table className="w-full text-center text-[12pt] mb-10">
                                    <tbody>
                                        <tr>
                                            <td className="w-1/2 align-top pb-24">Notulis,</td>
                                            <td className="w-1/2 align-top">Paringin, {currentMinute.date ? new Date(currentMinute.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '_________________'}<br/>Mengesahkan,<br/>Rektor
                                                {currentMinute.signature && <div className="h-[80px] flex items-center justify-center my-2"><img src={currentMinute.signature} className="h-[80px] object-contain" /></div>}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-bold uppercase">( {currentMinute.submittedBy || '_________________________'} )</td>
                                            <td><span className="underline font-bold uppercase">{currentMinute.signedBy || 'ABDUL HAMID, S.Kom., M.M., M.Kom'}</span><br/>NIP. 1121069301</td>
                                        </tr>
                                    </tbody>
                                </table>
                                {currentMinute.documentation && currentMinute.documentation.length > 0 && (
                                    <div className="break-page"><h3 className="text-center font-bold underline mb-8">LAMPIRAN DOKUMENTASI</h3><div className="grid grid-cols-2 gap-6">{currentMinute.documentation.map((img, i) => (<div key={i} className="border-2 p-2 break-inside-avoid"><img src={img} className="w-full h-auto" /></div>))}</div></div>
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
