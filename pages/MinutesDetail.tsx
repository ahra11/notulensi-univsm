import React, { useState, useEffect, useRef } from 'react';
import { Minute, Page } from '../types';
import { SpreadsheetService } from '../services/spreadsheet';
import logoUSM from '../logo-usm.png';

const MinutesDetail: React.FC<{ minute: Minute; onNavigate: (p: Page) => void }> = ({ minute, onNavigate }) => {
    const [currentMinute, setCurrentMinute] = useState<Minute | null>(null);
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
                const updatedData = { ...currentMinute, status: 'SIGNED' as any, signedBy: currentUser.name, signature: signatureBase64 };
                setCurrentMinute(updatedData);
                
                try {
                    // Coba perbarui memori, tapi jangan biarkan error merusak aplikasi
                    const cache = JSON.parse(localStorage.getItem('usm_minutes_cache') || '[]');
                    const newCache = cache.map((m: any) => m.id === currentMinute.id ? updatedData : m);
                    localStorage.setItem('usm_minutes_cache', JSON.stringify(newCache));
                } catch (e) {
                    console.warn("Memori penuh, tapi data sukses di cloud.");
                }

                setShowSignaturePad(false);
                alert("Notulensi Berhasil Disahkan!");
            } else {
                throw new Error("Ditolak Server Google Sheets.");
            }
        } catch (error: any) {
            alert("GAGAL MENGESAHKAN!\n\nPeriksa koneksi atau URL Script Anda.\nDetail: " + error.message);
        } finally { setIsVerifying(false); }
    };

    // ==========================================
    // PERBAIKAN: LAYAR ANTI-MACET (TOMBOL KEMBALI)
    // ==========================================
    if (!currentMinute || !currentMinute.id) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full border border-slate-100">
                    <span className="material-symbols-outlined text-6xl text-amber-500 mb-4 block">warning</span>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Dokumen Gagal Dimuat</h2>
                    <p className="text-slate-500 text-sm mb-6">Terjadi gangguan saat membaca data. Jangan khawatir, arsip Anda aman di Server.</p>
                    <button onClick={() => onNavigate('history')} className="px-6 py-3 bg-[#252859] text-white rounded-xl font-bold w-full hover:bg-indigo-900 transition-all">
                        Kembali ke Arsip
                    </button>
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
                <button onClick={() => onNavigate('history')} className="text-[#252859] font-bold flex items-center gap-
