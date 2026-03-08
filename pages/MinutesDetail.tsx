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

    let currentUser = { name: 'ABDUL HAMID, S.Kom., M.M., M.Kom', role: 'PIMPINAN' };
    try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) currentUser = JSON.parse(storedUser);
    } catch (e) {}

    useEffect(() => {
        if (minute) setCurrentMinute(minute);
    }, [minute]);

    // 1. PEMBACA TANGGAL ANTI-ISO (MENCEGAH 2026-03-01T...)
    const formatResmiTanggal = (rawDate: string) => {
        if (!rawDate) return '-';
        try {
            const dateStr = String(rawDate).split('T')[0];
            const d = new Date(dateStr);
            return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        } catch (e) { return rawDate; }
    };

    // 2. KONVERTER LINK DRIVE KE GAMBAR (AGAR FOTO MUNCUL)
    const getDirectImg = (url: string) => {
        if (!url) return '';
        const link = String(url);
        if (link.includes('drive.google.com')) {
            const match = link.match(/[-\w]{25,}/);
            if (match) return `https://drive.google.com/uc?export=view&id=${match[0]}`;
        }
        return link; 
    };

    const handlePrint = () => { window.print(); };

    const getDocumentationImages = () => {
        if (!currentMinute || !currentMinute.documentation) return [];
        if (Array.isArray(currentMinute.documentation)) return currentMinute.documentation;
        try { 
            const parsed = JSON.parse(String(currentMinute.documentation));
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) { 
            return [String(currentMinute.documentation)];
        }
    };

    const docsImages = getDocumentationImages();

    // LOGIKA TANDA TANGAN (Sama seperti sebelumnya)
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
            const response = await SpreadsheetService.postToCloud(payload);
            if (response.success) {
                setCurrentMinute({ ...currentMinute, status: 'SIGNED' as any, signature: signatureBase64 });
                setShowSignaturePad(false);
                alert("Berhasil Disahkan!");
            }
        } catch (error) { alert("Gagal!"); } finally { setIsVerifying(false); }
    };

    if (!currentMinute) return <div className="p-10 text-center">Memuat...</div>;

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen flex flex-col items-center">
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { size: A4 portrait; margin: 15mm; }
                    .no-print { display: none !important; }
                    .main-container { box-shadow: none !important; border: none !important; padding: 0 !important; width: 100% !important; }
                    .print-area { font-family: 'Times New Roman', serif !important; }
                }
            `}} />

            {/* Tombol Navigasi */}
            <div className="w-full max-w-4xl flex justify-between mb-6 no-print">
                <button onClick={() => onNavigate('history')} className="font-bold flex items-center gap-2"><span className="material-symbols-outlined">arrow_back</span> Kembali</button>
                <div className="flex gap-2">
                    {currentMinute.status !== 'SIGNED' && <button onClick={() => setShowSignaturePad(true)} className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold">Sahkan</button>}
                    <button onClick={handlePrint} className="bg-[#252859] text-white px-6 py-2 rounded-xl font-bold">Cetak PDF</button>
                </div>
            </div>

            {/* Dokumen Notulensi */}
            <div className="main-container w-full max-w-4xl bg-white shadow-2xl border p-8 md:p-16">
                <div className="print-area">
                    {/* KOP SURAT */}
                    <div className="flex items-center border-b-[4px] border-black pb-4 mb-8">
                        <img src={logoUSM} className="w-24 mr-6" />
                        <div className="flex-1 text-center pr-10">
                            <h3 className="text-lg">YAYASAN SAPTA BAKTI PENDIDIKAN</h3>
                            <h1 className="text-3xl font-black">UNIVERSITAS SAPTA MANDIRI</h1>
                            <p className="text-xs">Kampus I: JL. A. Yani RT.07 Kel. Batu Piring Paringin Selatan Balangan</p>
                        </div>
                    </div>

                    <div className="text-center mb-10">
                        <h2 className="text-xl font-bold underline uppercase">NOTULENSI RAPAT</h2>
                        <p>Nomor: {currentMinute.id} /NOT/REK/2026</p>
                    </div>

                    <div className="space-y-3 mb-10">
                        <div className="grid grid-cols-[150px_10px_1fr]"><span>Kegiatan</span><span>:</span><span className="font-bold uppercase">{currentMinute.title}</span></div>
                        <div className="grid grid-cols-[150px_10px_1fr]"><span>Hari / Tanggal</span><span>:</span><span>{formatResmiTanggal(currentMinute.date)}</span></div>
                        <div className="grid grid-cols-[150px_10px_1fr]"><span>Tempat</span><span>:</span><span>{currentMinute.location}</span></div>
                    </div>

                    <div className="mb-12">
                        <p className="font-bold underline mb-4">HASIL PEMBAHASAN:</p>
                        <div className="whitespace-pre-wrap leading-relaxed text-justify">{currentMinute.content}</div>
                    </div>

                    {/* Tanda Tangan */}
                    <table className="w-full">
                        <tbody>
                            <tr>
                                <td className="w-1/2 pb-24 text-center">Notulis,</td>
                                <td className="w-1/2 text-center">
                                    Paringin, {formatResmiTanggal(currentMinute.date)}<br/>
                                    Mengesahkan, Rektor
                                    <div className="h-20 flex items-center justify-center">
                                        {currentMinute.signature && <img src={getDirectImg(currentMinute.signature)} className="h-20 object-contain" />}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="text-center font-bold">({currentMinute.submittedBy})</td>
                                <td className="text-center font-bold underline uppercase">{currentMinute.signedBy || 'ABDUL HAMID, S.Kom., M.M., M.Kom'}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Lampiran Foto */}
                    {docsImages.length > 0 && (
                        <div className="mt-20 pt-10 border-t border-dashed">
                            <h3 className="text-center font-bold underline mb-10 uppercase">LAMPIRAN DOKUMENTASI</h3>
                            <div className="grid grid-cols-2 gap-6">
                                {docsImages.map((img, i) => (
                                    <div key={i} className="border p-2 bg-slate-50 flex items-center justify-center min-h-[250px]">
                                        <img src={getDirectImg(img)} className="max-w-full max-h-[400px] object-contain" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Signature Pad Modal (no-print) */}
            {showSignaturePad && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 no-print">
                    <div className="bg-white p-6 rounded-3xl max-w-lg w-full">
                        <h3 className="text-lg font-bold mb-4 text-center">Bubuhkan Tanda Tangan</h3>
                        <canvas ref={canvasRef} width={400} height={200} className="border-2 border-dashed w-full bg-white mb-4" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)} />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowSignaturePad(false)} className="px-4 py-2 bg-slate-100 rounded-lg">Batal</button>
                            <button onClick={submitVerify} className="px-4 py-2 bg-green-600 text-white rounded-lg">Simpan & Sahkan</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MinutesDetail;
