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
            {/* CSS KHUSUS CETAK: Rahasia agar format font, spasi, dan margin sempurna di kertas A4 */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { size: A4; margin: 1.5cm 2cm; }
                    body, html { background: white !important; }
                    .no-print { display: none !important; }
                    
                    /* Reset semua style aplikasi agar kertas benar-benar putih bersih */
                    .print-area { 
                        display: block !important; 
                        border: none !important; 
                        box-shadow: none !important; 
                        border-radius: 0 !important;
                        width: 100% !important; 
                        margin: 0 !important; 
                        padding: 0 !important; 
                        background: white !important;
                        font-family: 'Times New Roman', Times, serif !important; 
                        color: black !important;
                    }
                    
                    /* Warna biru khusus untuk link saat dicetak berwarna */
                    .print-blue { color: #0000FF !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    .break-page { break-before: page; padding-top: 20px; }
                }
            `}} />

            {/* BAR MENU (Hanya muncul di layar laptop, hilang saat dicetak) */}
            <div className="flex justify-between items-center mb-6 no-print max-w-4xl mx-auto">
                <button onClick={() => onNavigate('history')} className="text-[#252859] font-bold flex items-center gap-2 hover:bg-[#252859]/10 px-4 py-2 rounded-xl transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span> Kembali ke Arsip
                </button>
                <button onClick={handlePrint} className="bg-[#252859] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-black transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">print</span> Cetak Notulensi
                </button>
            </div>

            {/* ======================================================= */}
            {/* AREA UTAMA YANG AKAN DICETAK (KERTAS A4) */}
            {/* ======================================================= */}
            <div className="print-area max-w-4xl mx-auto bg-white p-10 md:p-12 rounded-[2rem] shadow-xl border border-slate-200 font-serif text-black">
                
                {/* --- KOP SURAT YAYASAN (DIJAMIN IDENTIK DENGAN ASLI) --- */}
                <div className="flex items-center justify-between pb-1">
                    {/* LOGO KAMPUS */}
                    <div className="w-[110px] flex-shrink-0 mr-4">
                        <img 
                            src="/logo-usm.png" 
                            alt="Logo Universitas Sapta Mandiri" 
                            className="w-full h-auto object-contain"
                            onError={(e) => {
                                // Jika logo belum masuk folder public, tampilkan peringatan ini di layar (tidak ikut kecetak jika dibenerin)
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                        />
                        <div className="hidden w-24 h-24 border-2 border-red-500 text-red-500 flex items-center justify-center font-bold text-[10px] text-center p-2 rounded no-print">
                            LOGO BELUM ADA DI FOLDER PUBLIC
                        </div>
                    </div>

                    {/* TEKS KOP SURAT TENGAH */}
                    <div className="flex-1 text-center pr-6">
                        <div className="text-[12pt] leading-tight mb-1 font-normal">YAYASAN SAPTA BAKTI PENDIDIKAN</div>
                        <div className="text-[22pt] font-bold leading-none mb-1.5 font-serif" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                            UNIVERSITAS SAPTA MANDIRI
                        </div>
                        <div className="text-[14pt] font-bold leading-tight mb-2">SK Pendirian No. 661 / E/O/2024</div>
                        
                        <div className="text-[11pt] leading-snug">
                            Kampus I : JL. A. Yani RT.07 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel
                        </div>
                        <div className="text-[11pt] leading-snug">
                            Kampus II : JL. A. Yani KM. 5 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel
                        </div>
                        <div className="text-[11pt] leading-snug">
                            Telp/Fax (0526) 209 5962 CP: 0877 7687 7462 Kode Pos : 71618
                        </div>
                        <div className="text-[11pt] leading-snug mt-0.5">
                            Website : <span className="print-blue text-blue-700 underline">www.univsm.ac.id</span> Email : <span className="print-blue text-blue-700 underline">info@univsm.ac.id</span>
                        </div>
                    </div>
                </div>

                {/* GARIS GANDA KOP SURAT (Tebal di atas, Tipis di bawah) */}
                <div className="w-full border-t-[4px] border-black mt-3"></div>
                <div className="w-full border-t-[1px] border-black mt-[2px] mb-8"></div>

                {/* JUDUL NOTULENSI */}
                <div className="text-center mb-8">
                    <h2 className="text-[14pt] font-bold uppercase underline">NOTULENSI RAPAT</h2>
                    <p className="text-[12pt] font-normal mt-1">Nomor: {currentMinute.id || '...'} /NOT/REK/2026</p>
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
                        <p className="text-[12pt] font-normal mt-1">NIP. 1121069301</p>
                    </div>
                </div>

                {/* --- HALAMAN LAMPIRAN DOKUMENTASI --- */}
                {currentMinute.documentation && currentMinute.documentation.length > 0 && (
                    <div className="break-page pt-10">
                        <h3 className="text-center font-bold uppercase underline mb-8 text-[14pt]">LAMPIRAN DOKUMENTASI</h3>
                        <div className="grid grid-cols-2 gap-6">
                            {currentMinute.documentation.map((img, i) => (
                                <div key={i} className="border-2 border-slate-200 p-2 bg-white break-inside-avoid shadow-sm">
                                    <img src={img} alt={`Dokumentasi ${i+1}`} className="w-full h-auto object-contain rounded" />
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
