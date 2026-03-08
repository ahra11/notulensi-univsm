import React, { useState, useEffect, useRef } from 'react';
import { Minute, Page } from '../types';
import { SpreadsheetService } from '../services/spreadsheet';
import logoUSM from '../logo-usm.png';

const MinutesDetail: React.FC<{ minute: Minute | null; onNavigate: (p: Page) => void }> = ({ minute, onNavigate }) => {
    const [currentMinute, setCurrentMinute] = useState<Minute | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{"name":"ABDUL HAMID, S.Kom., M.M., M.Kom", "role":"PIMPINAN"}');

    useEffect(() => {
        if (minute) setCurrentMinute(minute);
    }, [minute]);

    const renderSmartImage = (rawData: any) => {
        if (!rawData) return '';
        let str = String(rawData).trim().replace(/^["']|["']$/g, '');
        if (str.startsWith('data:image')) return str.replace(/[\r\n\s]+/g, ''); 
        if (str.includes('drive.google.com')) {
            const idMatch = str.match(/[-\w]{25,}/);
            if (idMatch) return `https://drive.google.com/uc?export=view&id=${idMatch[0]}`;
        }
        if (str.length >= 25 && !str.includes(' ') && !str.includes('http')) return `https://drive.google.com/uc?export=view&id=${str}`;
        return str;
    };

    const getDocumentationArray = () => {
        if (!currentMinute?.documentation) return [];
        let docData = currentMinute.documentation;
        if (Array.isArray(docData)) return docData;
        let docStr = String(docData).trim();
        try {
            const parsed = JSON.parse(docStr);
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
            if (docStr.startsWith('data:image')) return [docStr];
            if (docStr.includes(',') && !docStr.includes('base64')) return docStr.split(',').map(s => s.trim());
            return [docStr];
        }
    };

    const docImages = getDocumentationArray();

    const formatResmiTanggal = (raw: string) => {
        if (!raw) return '-';
        try {
            const d = new Date(String(raw).split('T')[0]);
            return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        } catch (e) { return raw; }
    };

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

    if (!currentMinute) return <div className="p-20 text-center font-bold text-slate-400">MEMUAT DOKUMEN...</div>;

    return (
        <div className="p-4 md:p-10 bg-slate-50 min-h-screen flex flex-col items-center">
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { size: A4 portrait; margin: 15mm; }
                    .no-print { display: none !important; }
                    .main-container { box-shadow: none !important; border: none !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; }
                    .print-area { font-family: 'Times New Roman', serif !important; color: black !important; line-height: 1.5; font-size: 11pt; }
                    .kop-line-heavy { border-bottom: 3pt solid black !important; width: 100% !important; margin-top: 4px !important; }
                    .kop-line-light { border-bottom: 1pt solid black !important; width: 100% !important; margin-top: 2px !important; margin-bottom: 20px !important; }
                    .break-page { page-break-before: always !important; }
                }
                .kop-line-heavy { border-bottom: 4px solid black; width: 100%; margin-top: 4px; }
                .kop-line-light { border-bottom: 1px solid black; width: 100%; margin-top: 2px; margin-bottom: 20px; }
            `}} />

            <div className="w-full max-w-4xl flex justify-between mb-6 no-print">
                <button onClick={() => onNavigate('history')} className="font-bold flex items-center gap-2 text-[#252859] hover:underline">
                    <span className="material-symbols-outlined">arrow_back</span> Kembali
                </button>
                <div className="flex gap-2">
                    {currentMinute.status !== 'SIGNED' && (
                        <button onClick={() => setShowSignaturePad(true)} className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg">Sahkan</button>
                    )}
                    <button onClick={() => window.print()} className="bg-[#252859] text-white px-6 py-2 rounded-xl font-bold shadow-lg">Cetak PDF</button>
                </div>
            </div>

            <div className="main-container w-full max-w-4xl bg-white shadow-xl border border-slate-200 p-8 md:p-14 mb-20">
                <div className="print-area">
                    
                    <div className="flex items-center">
                        <div className="w-[110px] mr-5 flex-shrink-0"><img src={logoUSM} className="w-full h-auto object-contain" alt="Logo USM" /></div>
                        <div className="flex-1 text-center pr-6" style={{ lineHeight: '1.15' }}>
                            <div style={{ fontSize: '11.5pt', fontWeight: 'normal' }}>YAYASAN SAPTA BAKTI PENDIDIKAN</div>
                            <div style={{ fontSize: '20pt', fontWeight: '900', margin: '2px 0', letterSpacing: '0.5px' }}>UNIVERSITAS SAPTA MANDIRI</div>
                            <div style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '5px' }}>SK Pendirian No. 661 / E/O/2024</div>
                            <div style={{ fontSize: '9pt' }}>Kampus I : JL. A. Yani RT.07 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel</div>
                            <div style={{ fontSize: '9pt' }}>Kampus II : JL. A. Yani KM. 5 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel</div>
                            <div style={{ fontSize: '8pt', fontWeight: 'bold', marginTop: '3px' }}>Telp/Fax (0526) 209 5962 CP: 0877 7687 7462 Kode Pos : 71618</div>
                            <div style={{ fontSize: '8pt', fontWeight: 'bold' }}>Website : <span style={{color: 'blue', textDecoration: 'underline'}}>www.univsm.ac.id</span> Email : <span style={{color: 'blue', textDecoration: 'underline'}}>info@univsm.ac.id</span></div>
                        </div>
                    </div>
                    <div className="kop-line-heavy"></div><div className="kop-line-light"></div>

                    <div className="text-center mb-8">
                        <h2 className="text-[14pt] font-bold underline uppercase tracking-widest">NOTULENSI RAPAT</h2>
                        <p className="text-[11.5pt] mt-1">Nomor: {currentMinute.id} /NOT/REK/2026</p>
                    </div>

                    <div className="space-y-2 mb-8 text-[11.5pt]">
                        <div className="flex"><span className="w-40 flex-shrink-0">Kegiatan</span><span className="mr-3">:</span><span className="font-bold uppercase flex-1">{currentMinute.title}</span></div>
                        <div className="flex"><span className="w-40 flex-shrink-0">Hari / Tanggal</span><span className="mr-3">:</span><span className="flex-1">{formatResmiTanggal(currentMinute.date)}</span></div>
                        <div className="flex"><span className="w-40 flex-shrink-0">Tempat</span><span className="mr-3">:</span><span className="flex-1">{currentMinute.location}</span></div>
                    </div>

                    <div className="mb-10">
                        <p className="font-bold underline mb-3 uppercase text-[11.5pt]">Hasil Pembahasan:</p>
                        <div className="whitespace-pre-wrap text-justify leading-relaxed text-[11.5pt] min-h-[200px]">{currentMinute.content}</div>
                    </div>

                    <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', border: 'none' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '50%', textAlign: 'center', verticalAlign: 'top', paddingBottom: '90px' }}>
                                    <div style={{ fontSize: '11.5pt' }}>Notulis,</div>
                                </td>
                                <td style={{ width: '50%', textAlign: 'center', verticalAlign: 'top' }}>
                                    <div style={{ fontSize: '11.5pt', marginBottom: '4px' }}>
                                        Paringin, {formatResmiTanggal(currentMinute.date)}<br/>
                                        Mengesahkan, Rektor
                                    </div>
                                    <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0' }}>
                                        {currentMinute.signature && (
                                            <img src={renderSmartImage(currentMinute.signature)} style={{ maxHeight: '90px', width: 'auto', objectFit: 'contain' }} alt="TTD Rektor" />
                                        )}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ textAlign: 'center', verticalAlign: 'top' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '11.5pt', textTransform: 'uppercase' }}>
                                        ({currentMinute.submittedBy || '_________________________'})
                                    </div>
                                </td>
                                <td style={{ textAlign: 'center', verticalAlign: 'top' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '11.5pt', textTransform: 'uppercase', textDecoration: 'underline' }}>
                                        {currentMinute.signedBy || 'ABDUL HAMID, S.Kom., M.M., M.Kom'}
                                    </div>
                                    <div style={{ fontSize: '10pt', fontWeight: 'bold', marginTop: '2px' }}>
                                        NIK. 7 1 1018 210693
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* LAMPIRAN DOKUMENTASI DENGAN PENDETEKSI KERUSAKAN */}
                    {docImages.length > 0 && (
                        <div className="break-page mt-24 pt-10 border-t border-dashed border-slate-300">
                            <h3 className="text-center font-bold underline mb-10 uppercase text-[13pt]">LAMPIRAN DOKUMENTASI</h3>
                            <div className="grid grid-cols-2 gap-6">
                                {docImages.map((img: any, i: number) => (
                                    <div key={i} className="border-2 border-slate-100 p-2 bg-slate-50 flex flex-col items-center justify-center h-[350px] shadow-sm rounded-lg overflow-hidden relative">
                                        <img 
                                            src={renderSmartImage(img)} 
                                            className="max-h-full max-w-full object-contain" 
                                            alt={`Dokumentasi ${i+1}`}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none'; // Sembunyikan img yang rusak
                                                // Tampilkan pesan error
                                                if (target.nextElementSibling) {
                                                    (target.nextElementSibling as HTMLElement).style.display = 'flex';
                                                }
                                            }}
                                        />
                                        {/* PESAN ERROR MUNCUL JIKA GAMBAR TERPOTONG DI DATABASE */}
                                        <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', color: '#ef4444', textAlign: 'center', padding: '20px' }}>
                                            <span className="material-symbols-outlined text-4xl mb-2">broken_image</span>
                                            <p className="font-bold text-sm">Gagal Memuat Gambar</p>
                                            <p className="text-xs text-slate-500 mt-2">Data gambar terpotong oleh sistem database (melebihi batas 50.000 karakter). File asli tidak dapat dipulihkan.</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL TTD DIGITAL */}
            {showSignaturePad && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm no-print p-4">
                    <div className="bg-white p-8 rounded-[2rem] max-w-lg w-full shadow-2xl">
                        <h3 className="text-2xl font-black mb-6 text-center text-[#252859]">Bubuhkan Tanda Tangan</h3>
                        <div className="border-2 border-dashed border-slate-200 rounded-[1.5rem] overflow-hidden bg-slate-50 mb-8 relative">
                            <canvas 
                                ref={canvasRef} width={400} height={200} className="w-full h-[200px] cursor-crosshair"
                                onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)}
                                onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={() => setIsDrawing(false)}
                            />
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <button 
                                onClick={() => {
                                    const ctx = canvasRef.current?.getContext('2d');
                                    if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                                }} 
                                className="text-red-500 font-bold hover:underline px-2"
                            >Hapus</button>
                            <div className="flex gap-2">
                                <button onClick={() => setShowSignaturePad(false)} className="px-6 py-3 bg-slate-100 rounded-xl font-bold text-slate-600">Batal</button>
                                <button onClick={submitVerify} disabled={isVerifying} className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg">
                                    {isVerifying ? 'Proses...' : 'Sahkan'}
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
