import React, { useState, useEffect } from 'react';
import { Minute, Page } from '../types';

const MinutesDetail: React.FC<{ minute: Minute; onNavigate: (p: Page) => void }> = ({ minute, onNavigate }) => {
    const [currentMinute, setCurrentMinute] = useState<Minute>(minute);

    useEffect(() => {
        setCurrentMinute(minute);
    }, [minute]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-4 md:p-8">
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { size: A4; margin: 1.5cm; }
                    .no-print { display: none !important; }
                    body { background: white !important; -webkit-print-color-adjust: exact; }
                    .print-area { display: block !important; border: none !important; box-shadow: none !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
                    .header-kop { text-align: center; border-bottom: 4px double black; padding-bottom: 10px; margin-bottom: 20px; }
                    .break-page { break-before: page; }
                }
            `}} />

            <div className="flex justify-between items-center mb-6 no-print">
                <button onClick={() => onNavigate('history')} className="text-[#252859] font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined">arrow_back</span> Kembali ke Arsip
                </button>
                <button onClick={handlePrint} className="bg-[#252859] text-white px-6 py-2 rounded-xl font-bold shadow-lg">
                    Cetak Notulensi Resmi
                </button>
            </div>

            <div className="print-area bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100">
                {/* KOP SURAT YAYASAN */}
                <div className="header-kop flex flex-col items-center">
                    <h3 className="text-[14pt] font-bold uppercase">YAYASAN SAPTA BAKTI PENDIDIKAN</h3>
                    <h1 className="text-[18pt] font-black uppercase tracking-tighter">UNIVERSITAS SAPTA MANDIRI</h1>
                    <p className="text-[9pt] italic">SK Pendirian No. 661 / E / O / 2024</p>
                    <p className="text-[8pt]">JL. A. Yani RT.07 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel</p>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-[16pt] font-bold uppercase underline">NOTULENSI RAPAT</h2>
                    <p className="text-sm font-bold mt-2">Nomor: {currentMinute.id || '000'}/NOT/REK/2026</p>
                </div>

                <div className="space-y-4 mb-10 text-[11pt]">
                    <div className="grid grid-cols-[150px_20px_1fr]">
                        <span className="font-bold">Kegiatan</span><span>:</span><span className="uppercase">{currentMinute.title}</span>
                    </div>
                    <div className="grid grid-cols-[150px_20px_1fr]">
                        <span className="font-bold">Hari / Tanggal</span><span>:</span><span>{currentMinute.date}</span>
                    </div>
                    <div className="grid grid-cols-[150px_20px_1fr]">
                        <span className="font-bold">Tempat</span><span>:</span><span>{currentMinute.location}</span>
                    </div>
                    <div className="mt-8">
                        <p className="font-bold mb-2 uppercase underline">Hasil Pembahasan:</p>
                        <div className="whitespace-pre-wrap leading-relaxed text-justify">{currentMinute.content}</div>
                    </div>
                </div>

                <div className="mt-20 grid grid-cols-2 text-center text-[11pt]">
                    <div>
                        <p className="mb-24 font-bold uppercase">Notulis,</p>
                        <p className="underline font-bold uppercase italic">( _________________ )</p>
                        <p className="text-[9pt] mt-1">{currentMinute.submittedBy || 'Staf USM'}</p>
                    </div>
                    <div>
                        <p className="mb-4">Paringin, {currentMinute.date}</p>
                        <p className="mb-20 font-bold uppercase leading-tight">Mengesahkan,<br/>Rektor</p>
                        <p className="underline font-bold uppercase">( _________________ )</p>
                        <p className="text-sm font-bold mt-1 uppercase">ABDUL HAMID, S.Kom., M.M., M.Kom</p>
                    </div>
                </div>

                {/* LAMPIRAN DOKUMENTASI (Halaman Baru saat Cetak) */}
                {currentMinute.documentation && currentMinute.documentation.length > 0 && (
                    <div className="break-page pt-10">
                        <h3 className="text-center font-bold uppercase underline mb-8">LAMPIRAN DOKUMENTASI</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {currentMinute.documentation.map((img, i) => (
                                <div key={i} className="border-4 border-slate-100 p-2 shadow-sm bg-white">
                                    <img src={img} alt="dok" className="w-full h-56 object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MinutesDetail;
