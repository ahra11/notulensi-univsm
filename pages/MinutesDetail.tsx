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

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{"name":"Pimpinan USM", "role":"PIMPINAN"}');

    useEffect(() => {
        if (minute) setCurrentMinute(minute);
    }, [minute]);

    // MESIN PINTAR UNTUK MEMUNCULKAN FOTO (BASE64 & DRIVE)
    const renderSmartImage = (data: any) => {
        if (!data) return '';
        let str = String(data).trim();
        str = str.replace(/^["']|["']$/g, '');

        // PERBAIKAN: Hapus semua spasi/newline agar Base64 terbaca browser
        if (str.startsWith('data:image')) {
            return str.replace(/\s/g, ''); 
        }

        if (str.includes('drive.google.com')) {
            const idMatch = str.match(/[-\w]{25,}/);
            if (idMatch) return `https://drive.google.com/uc?export=view&id=${idMatch[0]}`;
        }
        
        if (str.length >= 25 && !str.includes(' ')) {
            return `https://drive.google.com/uc?export=view&id=${str}`;
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
            return [String(currentMinute.documentation)];
        }
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

    if (!currentMinute) return <div className="p-20 text-center font-bold">Memuat...</div>;

    return (
        <div className="p-4 md:p-10 bg-slate-50 min-h-screen flex flex-col items-center">
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { size: A4 portrait; margin: 15mm; }
                    .no-print { display: none !important; }
                    .main-container { box-shadow: none !important; border: none !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; }
                    .print-area { font-family: 'Times New Roman', Times, serif !important; color: black !important; line-height: 1.5; font-size: 12pt; }
                    .line-double { border-bottom: 3pt double black !important; margin-top: 5px !important; margin-bottom: 20px !important; }
                    .break-page { page-break-before: always !important; }
                }
                .line-double { border-bottom: 4px double black; margin-top: 10px; margin-bottom: 25px; width: 100%; }
                .sig-table { width: 100%; border-collapse: collapse; margin-top: 40px; table-layout: fixed; }
                .sig-table td { vertical-align: top; text-align: center; width: 50%; }
            `}} />

            <div className="w-full max-w-4xl flex justify-between mb-8 no-print">
                <button onClick={() => onNavigate('history')} className="font-bold flex items-center gap-2 text-[#252859]"><span className="material-symbols-outlined">arrow_back</span> Kembali</button>
                <div className="flex gap-3">
                    {currentMinute.status !== 'SIGNED' && <button onClick={() => setShowSignaturePad(true)} className="bg-green-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg">Sahkan</button>}
                    <button onClick={() => window.print()} className="bg-[#252859] text-white px-8 py-3 rounded-2xl font-bold shadow-lg">Cetak PDF</button>
                </div>
            </div>

            <div className="main-container w-full max-w-4xl bg-white shadow-2xl border p-10 md:p-16">
                <div className="print-area">
                    {/* KOP SURAT */}
                    <div className="flex items-center">
                        <div className="w-[125px] mr-6 flex-shrink-0"><img src={logoUSM} className="w-full h-auto" /></div>
                        <div className="flex-1 text-center pr-10">
                            <div className="text-[12pt]">YAYASAN SAPTA BAKTI PENDIDIKAN</div>
                            <div className="text-[22pt] font-black my-1 uppercase">UNIVERSITAS SAPTA MANDIRI</div>
                            <div className="text-[12pt] font-bold mb-2">SK Pendirian No. 661 / E/O/2024</div>
                            <div className="text-[9pt]">Kampus I : JL. A. Yani RT.07 Paringin Selatan Balangan | Kampus II : JL. A. Yani KM. 5 Paringin Selatan</div>
                            <div className="text-[8pt] mt-1">Telp/Fax (0526) 209 5962 | Web: www.univsm.ac.id | Email: info@univsm.ac.id</div>
                        </div>
                    </div>
                    <div className="line-double"></div>

                    <div className="text-center mb-8">
                        <h2 className="text-[16pt] font-bold underline uppercase">NOTULENSI RAPAT</h2>
                        <p className="text-[12pt]">Nomor: {currentMinute.id} /NOT/REK/2026</p>
                    </div>

                    <div className="space-y-3 mb-10">
                        <div className="flex"><span className="w-40 font-bold">Kegiatan</span><span className="mr-3">:</span><span className="uppercase flex-1">{currentMinute.title}</span></div>
                        <div className="flex"><span className="w-40 font-bold">Hari / Tanggal</span><span className="mr-3">:</span><span>{formatResmiTanggal(currentMinute.date)}</span></div>
                        <div className="flex"><span className="w-40 font-bold">Tempat</span><span className="mr-3">:</span><span>{currentMinute.location}</span></div>
                    </div>

                    <div className="mb-14">
                        <p className="font-bold underline mb-4">HASIL PEMBAHASAN:</p>
                        <div className="whitespace-pre-wrap text-justify">{currentMinute.content}</div>
                    </div>

                    {/* TANDA TANGAN SEJAJAR */}
                    <table className="sig-table">
                        <tbody>
                            <tr>
                                <td style={{ paddingBottom: '20px' }}>Notulis,</td>
                                <td style={{ paddingBottom: '20px' }}>
                                    Paringin, {formatResmiTanggal(currentMinute.date)}<br/>
                                    Mengesahkan, Rektor
                                </td>
                            </tr>
                            <tr>
                                <td style={{ height: '120px' }}></td>
                                <td style={{ height: '120px' }} className="flex items-center justify-center">
                                    {currentMinute.signature && (
                                        <img src={renderSmartImage(currentMinute.signature)} className="max-h-[100px] object-contain" />
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td className="font-bold uppercase">({currentMinute.submittedBy || '_________________'})</td>
                                <td>
                                    <span className="font-bold uppercase underline">{currentMinute.signedBy || 'ABDUL HAMID, S.Kom., M.M., M.Kom'}</span><br/>
                                    <span>NIK. 7 1 1018 210693</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* LAMPIRAN DOKUMENTASI */}
                    {getDocsArray().length > 0 && (
                        <div className="break-page mt-24 pt-10 border-t border-dashed">
                            <h3 className="text-center font-bold underline mb-10 uppercase">LAMPIRAN DOKUMENTASI</h3>
                            <div className="grid grid-cols-2 gap-6">
                                {getDocsArray().map((img: any, i: number) => (
                                    <div key={i} className="border p-2 bg-white flex items-center justify-center h-[350px]">
                                        <img src={renderSmartImage(img)} className="max-h-full max-w-full object-contain" alt="Lampiran" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL TTD */}
            {showSignaturePad && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 no-print">
                    <div className="bg-white p-8 rounded-3xl max-w-lg w-full">
                        <canvas ref={canvasRef} width={400} height={200} className="border-2 border-dashed w-full bg-slate-50 mb-6" 
                            onMouseDown={() => setIsDrawing(true)} 
                            onMouseMove={(e) => {
                                if (!isDrawing) return;
                                const ctx = canvasRef.current?.getContext('2d');
                                const rect = canvasRef.current?.getBoundingClientRect();
                                if (ctx && rect) { ctx.lineWidth = 2; ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top); ctx.stroke(); }
                            }} onMouseUp={() => setIsDrawing(false)} />
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
