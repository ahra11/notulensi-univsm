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
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
            {/* CSS KHUSUS CETAK: Rahasia agar format font Serif dan Warna Biru muncul di kertas */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { size: A4; margin: 1.5cm 2cm; }
                    .no-print { display: none !important; }
                    body { background: white !important; font-family: 'Times New Roman', Times, serif !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    .print-area { display: block !important; border: none !important; box-shadow: none !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
                    .break-page { break-before: page; padding-top: 20px; }
                    .print-blue { color: #0000FF !important; }
                }
            `}} />

            {/* BAR MENU (Hanya muncul di layar) */}
            <div className="flex justify-between items-center mb-6 no-print max-w-4xl mx-auto">
                <button onClick={() => onNavigate('history')} className="text-[#252859] font-bold flex items-center gap-2 hover:bg-[#252859]/10 px-4 py-2 rounded-xl transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span> Kembali ke Arsip
                </button>
                <button onClick={handlePrint} className="bg-[#252859] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-900/20 hover:bg-black transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">print</span> Cetak Notulensi
                </button>
            </div>

            {/* ======================================================= */}
            {/* AREA UTAMA YANG AKAN DICETAK (KERTAS A4) */}
            {/* ======================================================= */}
            <div className="print-area max-w-4xl mx-auto bg-white p-10 md:p-12 rounded-[2rem] shadow-xl border border-slate-100 font-serif text-black">
                
                {/* --- KOP SURAT YAYASAN (SESUAI GAMBAR) --- */}
                <div className="w-full flex items-center justify-between mb-2">
                    {/* LOGO KAMPUS DARI FOLDER PUBLIC */}
                    <div className="w-[110px] h-[110px] flex-shrink-0 flex items-center justify-center mr-4">
                        <img 
                            src="/logo-usm.png" 
                            alt="Logo Universitas Sapta Mandiri" 
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                        />
                        <div className="hidden w-24 h-24 border-2 border-black flex items-center justify-center font-bold text-xs text-center">
                            LOGO<br/>USM
                        </div>
                    </div>

                    {/* TEKS KOP SURAT TENGAH */}
                    <div className="flex-1 text-center flex flex-col items-center justify-center">
                        <div className="text-[12pt] leading-tight mb-0.5 font-normal">YAYASAN SAPTA BAKTI PENDIDIKAN</div>
                        <div className="text-[20pt] font-bold leading-none mb-1">UNIVERSITAS SAPTA MANDIRI</div>
                        <div className="text-[14pt] font-bold leading-tight mb-2">SK Pendirian No. 661 / E/O/2024</div>
                        <div className="text-[10.5pt] leading-tight mb-0.5">Kampus I : JL. A. Yani RT.07 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel</div>
                        <div className="text-[10.5pt] leading-tight mb-0.5">Kampus II : JL. A. Yani KM. 5 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel</div>
                        <div className="text-[10.5pt] leading-tight mb-0.5">Telp/Fax (0526) 209 5962 CP: 0877 7687 7462 Kode Pos : 71618</div>
                        <div className="text-[10.5pt] leading-tight">
                            Website : <span className="print-blue text-blue-700 underline">www.univsm.ac.id</span> Email : <span className="print-blue text-blue-700 underline">info@univsm.ac.id</span>
                        </div>
                    </div>
                </div>

                {/* GARIS GANDA KOP SURAT (Tebal di atas, Tipis di bawah) */}
                <div className="w-full border-t-[3px] border-black mb-[2px]"></div>
                <div className="w-full border-t-[1px] border-black mb-8"></div>

                {/* JUDUL NOTULENSI */}
                <div className="text-center mb-8">
                    <h2 className="text-[16pt] font-bold uppercase underline">NOTULENSI RAPAT</h2>
                    <p className="text-[11pt] font-normal mt-1">Nomor: {currentMinute.id || '...'} /NOT/REK/2026</p>
                </div>

                {/* ISI PEMBAHASAN */}
                <div className="space-y-4 mb-12 text-[12pt]">
                    <div className="grid grid-cols-[160px_20px_1fr]">
                        <span className="font-normal">Kegiatan</span><span>:</span><span className="uppercase font-bold">{currentMinute.title}</span>
                    </div>
                    <div className="grid grid-cols-[160px_20px_1fr]">
                        <span className="font-normal">Hari / Tanggal</span><span>:</span>
                        <span>
                            {currentMinute.date ? new Date(currentMinute.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                        </span>
                    </div>
                    <div className="grid grid-cols-[160px_20px_1fr]">
                        <span className="font-normal">Tempat</span><span>:</span><span>{currentMinute.location || '-'}</span>
                    </div>
                    <div className="mt-8 pt-4">
                        <p className="font-bold mb-3 uppercase">Hasil Pembahasan:</p>
                        <div className="whitespace-pre-wrap leading-relaxed text-justify">{currentMinute.content}</div>
                    </div>
                </div>

                {/* AREA TANDA TANGAN RAPI */}
                <div className="mt-20 grid grid-cols-2 text-center text-[12pt] break-inside-avoid">
                    <div>
                        <p className="mb-24 font-normal">Notulis,</p>
                        <p className="font-bold uppercase">( {currentMinute.submittedBy || '_________________________'} )</p>
                    </div>
                    <div>
                        <p className="mb-4">
                            Paringin, {currentMinute.date ? new Date(currentMinute.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '_________________'}
                        </p>
                        <p className="mb-20 font-normal leading-tight">Mengesahkan,<br/>Rektor</p>
                        <p className="underline font-bold uppercase text-[12pt]">ABDUL HAMID, S.Kom., M.M., M.Kom</p>
                        <p className="text-[11pt] font-normal mt-1">NIP. 1121069301</p>
                    </div>
                </div>

                {/* --- HALAMAN LAMPIRAN (OTOMATIS PINDAH KERTAS) --- */}
                {currentMinute.documentation && currentMinute.documentation.length > 0 && (
                    <div className="break-page pt-10">
                        <h3 className="text-center font-bold uppercase underline mb-8 text-[14pt]">LAMPIRAN DOKUMENTASI</h3>
                        <div className="grid grid-cols-2 gap-6">
                            {currentMinute.documentation.map((img, i) => (
                                <div key={i} className="border border-slate-300 p-2 shadow-sm bg-white break-inside-avoid">
                                    <img src={img} alt={`Dokumentasi ${i+1}`} className="w-full h-auto object-cover rounded" />
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
