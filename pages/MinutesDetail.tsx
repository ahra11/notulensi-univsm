import React, { useState, useEffect } from 'react';
import { Minute, Page } from '../types';
import { SpreadsheetService } from '../services/spreadsheet';

const MinutesDetail: React.FC<{ minute: Minute; onNavigate: (p: Page) => void }> = ({ minute, onNavigate }) => {
    const [currentMinute, setCurrentMinute] = useState<Minute>(minute);
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-4 md:p-8">
            {/* CSS KHUSUS: Inilah rahasia agar Kop Yayasan muncul dan tombol hilang saat dicetak */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { size: A4; margin: 2cm; }
                    .no-print { display: none !important; }
                    body { background: white !important; font-family: "Times New Roman", serif; }
                    .print-area { display: block !important; border: none !important; box-shadow: none !important; width: 100% !important; }
                    .header-kop { display: flex !important; flex-direction: column; align-items: center; border-bottom: 3px solid black; padding-bottom: 5px; margin-bottom: 5px; }
                }
                .print-only { display: none; }
            `}} />

            {/* Tombol Navigasi (Hilang saat cetak) */}
            <div className="flex justify-between items-center mb-6 no-print">
                <button onClick={() => onNavigate('history')} className="text-[#252859] font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined">arrow_back</span> Kembali
                </button>
                <button onClick={handlePrint} className="bg-[#252859] text-white px-6 py-2 rounded-xl font-bold shadow-lg">
                    Cetak Notulensi Resmi
                </button>
            </div>

            {/* CONTAINER UTAMA (Yang akan dicetak) */}
            <div className="print-area bg-white p-10 rounded-[2rem] shadow-sm border">
                
                {/* KOP SURAT YAYASAN */}
                <div className="header-kop flex flex-col items-center text-center mb-6">
                    <h3 className="text-lg font-bold uppercase leading-tight">YAYASAN SAPTA BAKTI PENDIDIKAN</h3>
                    <h1 className="text-2xl font-black uppercase leading-tight">UNIVERSITAS SAPTA MANDIRI</h1>
                    <p className="text-[10px] italic">JL. A. Yani RT.07 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel</p>
                    <div className="w-full h-[1px] bg-black mt-2"></div>
                </div>

                {/* ISI NOTULENSI */}
                <div className="text-center mb-8">
                    <h2 className="text-xl font-bold uppercase underline">NOTULENSI RAPAT</h2>
                    <p className="text-sm font-bold mt-2">Nomor: {currentMinute.id}/NOT/REK/2026</p>
                </div>

                <div className="space-y-4 mb-10">
                    <p><strong>Kegiatan:</strong> {currentMinute.title}</p>
                    <p><strong>Tanggal:</strong> {currentMinute.date}</p>
                    <div className="mt-6">
                        <p className="font-bold mb-2 uppercase">Hasil Pembahasan:</p>
                        <div className="whitespace-pre-wrap leading-relaxed text-justify italic">{currentMinute.content}</div>
                    </div>
                </div>

                {/* AREA TANDA TANGAN */}
                <div className="mt-20 grid grid-cols-2 text-center">
                    <div>
                        <p className="mb-20 font-bold uppercase">Notulis,</p>
                        <p className="underline font-bold uppercase italic">( _________________ )</p>
                    </div>
                    <div>
                        <p className="mb-20 font-bold uppercase">Mengesahkan, Rektor</p>
                        <p className="underline font-bold uppercase tracking-tighter">( _________________ )</p>
                        <p className="text-xs font-bold mt-1">ABDUL HAMID, S.Kom., M.M., M.Kom</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MinutesDetail;
