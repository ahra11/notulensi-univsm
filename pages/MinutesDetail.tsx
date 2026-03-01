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

    // =================================================================
    // FITUR BARU: PENYAPU SPASI OTOMATIS (AUTO-FORMATTER)
    // =================================================================
    const formatTeksResmi = (teks?: string) => {
        if (!teks) return '-';
        return teks
            // 1. Merapikan spasi berlebih (tab/spasi ganda) di tengah kalimat menjadi 1 spasi saja
            .replace(/[ \t]+/g, ' ')
            // 2. Merapikan Enter berlebih. Jika ada 3 enter atau lebih, diringkas jadi maksimal 2 enter (1 baris kosong pemisah paragraf)
            .replace(/(\n\s*){3,}/g, '\n\n')
            // 3. Menghapus spasi kosong yang tidak sengaja terketik di paling awal atau akhir dokumen
            .trim();
    };

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen flex flex-col items-center">
            
            {/* CSS KHUSUS CETAK */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { size: A4; margin: 1.5cm 2cm; }
                    body, html { background: white !important; }
                    .no-print { display: none !important; }
                    
                    /* Rahasia agar Kop Surat muncul di setiap halaman */
                    table.print-wrapper { width: 100%; border-collapse: collapse; border: none; }
                    thead.print-header { display: table-header-group; }
                    tbody.print-body { display: table-row-group; }
                    
                    /* Membersihkan gaya bawaan aplikasi saat dicetak */
                    .main-container { 
                        box-shadow: none !important; 
                        border: none !important; 
                        padding: 0 !important; 
                        background: white !important;
                    }
                    
                    .print-area {
                        font-family: 'Times New Roman', Times, serif !important; 
                        color: black !important;
                    }
                    
                    .print-blue { color: #0000FF !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    .break-page { break-before: page; padding-top: 20px; }
                    .break-inside-avoid { page-break-inside: avoid; break-inside: avoid; }
                }
            `}} />

            {/* BAR MENU (Hanya muncul di layar laptop) */}
            <div className="w-full max-w-4xl flex justify-between items-center mb-6 no-print">
                <button onClick={() => onNavigate('history')} className="text-[#252859] font-bold flex items-center gap-2 hover:bg-[#252859]/10 px-4 py-2 rounded-xl transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span> Kembali ke Arsip
                </button>
                <button onClick={handlePrint} className="bg-[#252859] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-black transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">print</span> Cetak Notulensi
                </button>
            </div>

            {/* CONTAINER TAMPILAN LAYAR */}
            <div className="main-container w-full max-w-4xl bg-white p-10 md:p-12 rounded-[2rem] shadow-xl border border-slate-200">
                
                {/* STRUKTUR TABEL (AGAR KOP SURAT MUNCUL DI SEMUA HALAMAN KERTAS) */}
                <table className="print-wrapper print-area text-black w-full text-left">
                    
                    {/* --- KOP SURAT (Diletakkan di THEAD agar otomatis berulang) --- */}
                    <thead className="print-header">
                        <tr>
                            <td className="pb-6">
                                <div className="flex items-center justify-between pb-1">
                                    {/* LOGO KAMPUS */}
                                    <div className="w-[110px] flex-shrink-0 mr-4">
                                        <img 
                                            src="/logo-usm.png" 
                                            alt="Logo Universitas Sapta Mandiri" 
                                            className="w-full h-auto object-contain"
                                        />
                                    </div>

                                    {/* TEKS KOP SURAT */}
                                    <div className="flex-1 text-center pr-6">
                                        <div className="text-[12pt] leading-tight mb-1 font-normal">YAYASAN SAPTA BAKTI PENDIDIKAN</div>
                                        <div className="text-[22pt] font-bold leading-none mb-1.5 font-serif" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                                            UNIVERSITAS SAPTA MANDIRI
                                        </div>
                                        <div className="text-[14pt] font-bold leading-tight mb-2">SK Pendirian No. 661 / E/O/2024</div>
                                        
                                        {/* Ukuran huruf diperkecil menjadi 9pt */}
                                        <div className="text-[9pt] leading-snug">
                                            Kampus I : JL. A. Yani RT.07 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel
                                        </div>
                                        <div className="text-[9pt] leading-snug">
                                            Kampus II : JL. A. Yani KM. 5 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel
                                        </div>
                                        <div className="text-[9pt] leading-snug">
                                            Telp/Fax (0526) 209 5962 CP: 0877 7687 7462 Kode Pos : 71618
                                        </div>
                                        <div className="text-[9pt] leading-snug mt-0.5">
                                            Website : <span className="print-blue text-blue-700 underline">www.univsm.ac.id</span> Email : <span className="print-blue text-blue-700 underline">info@univsm.ac.id</span>
                                        </div>
                                    </div>
                                </div>

                                {/* GARIS GANDA KOP SURAT */}
                                <div className="w-full border-t-[4px] border-black mt-3"></div>
                                <div className="w-full border-t-[1px] border-black mt-[2px]"></div>
                            </td>
                        </tr>
                    </thead>

                    {/* --- ISI NOTULENSI --- */}
                    <tbody className="print-body">
                        <tr>
                            <td>
                                {/* JUDUL NOTULENSI */}
                                <div className="text-center mb-8">
                                    <h2 className="text-[14pt] font-bold uppercase underline">NOTULENSI RAPAT</h2>
                                    <p className="text-[12pt] font-normal mt-1">Nomor: {currentMinute.id || '...'} /NOT/REK/2026</p>
                                </div>

                                {/* HEADER PEMBAHASAN */}
                                <div className="space-y-4 mb-8 text-[12pt]">
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
                                </div>

                                {/* HASIL PEMBAHASAN */}
                                <div className="mt-4 mb-16">
                                    <p className="font-bold mb-3 uppercase text-[12pt]">Hasil Pembahasan:</p>
                                    {/* MENGGUNAKAN AUTO-FORMATTER DI SINI */}
                                    <div className="whitespace-pre-wrap text-justify text-[12pt] leading-[1.8]">
                                        {formatTeksResmi(currentMinute.content)}
                                    </div>
                                </div>

                                {/* AREA TANDA TANGAN */}
                                <table className="w-full text-center text-[12pt] border-none break-inside-avoid mb-10">
                                    <tbody>
                                        <tr>
                                            {/* Kolom Kiri: Notulis */}
                                            <td className="w-1/2 align-top pb-24 font-normal">
                                                <br/><br/>{/* Menyesuaikan tinggi dengan tulisan Paringin di kanan */}
                                                Notulis,
                                            </td>
                                            {/* Kolom Kanan: Rektor */}
                                            <td className="w-1/2 align-top pb-24 font-normal">
                                                Paringin, {currentMinute.date ? new Date(currentMinute.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '_________________'}<br/>
                                                Mengesahkan,<br/>
                                                Rektor
                                            </td>
                                        </tr>
                                        <tr>
                                            {/* Kolom Kiri: Nama Notulis */}
                                            <td className="w-1/2 align-bottom">
                                                <span className="font-bold uppercase">( {currentMinute.submittedBy || '_________________________'} )</span>
                                            </td>
                                            {/* Kolom Kanan: Nama Rektor */}
                                            <td className="w-1/2 align-bottom">
                                                <span className="underline font-bold uppercase text-[12pt]">ABDUL HAMID, S.Kom., M.M., M.Kom</span><br/>
                                                <span className="text-[12pt] font-normal">NIP. 1121069301</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* --- HALAMAN LAMPIRAN DOKUMENTASI --- */}
                                {currentMinute.documentation && currentMinute.documentation.length > 0 && (
                                    <div className="break-page break-inside-avoid w-full">
                                        <h3 className="text-center font-bold uppercase underline mb-8 text-[14pt]">LAMPIRAN DOKUMENTASI</h3>
                                        <div className="grid grid-cols-2 gap-6 pb-10">
                                            {currentMinute.documentation.map((img, i) => (
                                                <div key={i} className="border-2 border-slate-200 p-2 bg-white break-inside-avoid shadow-sm">
                                                    <img src={img} alt={`Dokumentasi ${i+1}`} className="w-full h-auto object-contain rounded" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
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
