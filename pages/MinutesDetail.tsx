import React from 'react';
import { Minute, Page } from '../types';

interface MinutesDetailProps {
    minute: Minute;
    onNavigate: (page: Page) => void;
}

const MinutesDetail: React.FC<MinutesDetailProps> = ({ minute, onNavigate }) => {
    const discussionPoints = typeof minute.content === 'string' 
        ? minute.content.split('\n').filter(p => p.trim())
        : (minute.content || []);

    // ID File dari Google Drive Anda
    const fileId = "1EOW7ThAe7HIXfuL1R9BPxMxiCKGHc6r8";
    const logoUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

    return (
        <div className="min-h-screen bg-slate-100/50 print:bg-white pb-24 print:pb-0 font-serif relative">
            
            {/* Action Bar (Hanya muncul di layar, hilang saat diprint) */}
            <div className="fixed top-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-2 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl no-print z-[100] transition-all hover:scale-[1.02]">
                <button 
                    onClick={() => onNavigate('history')} 
                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
                >
                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest">Kembali</span>
                </button>
                
                <div className="w-px h-8 bg-slate-200 mx-1"></div>
                
                <button 
                    onClick={() => window.print()} 
                    className="flex items-center gap-3 px-8 py-2.5 bg-slate-900 text-white rounded-xl shadow-lg shadow-black/20 hover:bg-black active:scale-95 transition-all"
                >
                    <span className="material-symbols-outlined text-xl">print</span>
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.2em]">Cetak Dokumen</span>
                </button>
            </div>

            {/* Container Dokumen (A4) */}
            <div className="max-w-[210mm] mx-auto bg-white shadow-2xl md:my-16 p-[15mm] md:p-[20mm] print:shadow-none print:m-0 print:p-0">
                
                {/* Official USM Letterhead (Sesuai Gambar Terbaru) */}
                <div className="flex items-center gap-5 pb-2 mb-8 border-b-[4px] border-black border-double">
                    <img 
                        src={logoUrl} 
                        alt="Logo UNIVSM" 
                        className="h-28 w-auto object-contain shrink-0" 
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/3070/3070014.png";
                        }}
                    />
                    
                    <div className="flex-1 text-center pr-4">
                        <h2 className="text-[12pt] font-normal leading-tight uppercase" style={{ fontFamily: 'Times New Roman, serif' }}>
                            YAYASAN SAPTA BAKTI PENDIDIKAN
                        </h2>
                        <h1 className="text-[20pt] font-bold leading-tight uppercase tracking-tight" style={{ fontFamily: 'Times New Roman, serif' }}>
                            UNIVERSITAS SAPTA MANDIRI
                        </h1>
                        <h3 className="text-[13pt] font-bold leading-tight mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                            SK Pendirian No. 661 / E/O/2024
                        </h3>
                        
                        <div className="text-[8.5pt] leading-tight font-normal" style={{ fontFamily: 'Times New Roman, serif' }}>
                            <p>Kampus I : JL. A. Yani RT.07 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel</p>
                            <p>Kampus II : JL. A. Yani KM. 5 Kel. Batu Piring Kec. Paringin Selatan Kab. Balangan Kalsel</p>
                            <p>Telp/Fax (0526) 209 5962 CP: 0877 7687 7462 Kode Pos : 71618</p>
                            <p className="mt-0.5">
                                Website : <span className="text-blue-700 underline">www.univsm.ac.id</span> Email : <span className="text-blue-700 underline">info@univsm.ac.id</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Judul Notulensi */}
                <div className="text-center mb-10">
                    <h3 className="text-[14pt] font-bold uppercase underline decoration-[1.5pt] underline-offset-4">NOTULENSI RAPAT</h3>
                    <p className="text-[11pt] mt-1.5 font-medium">Nomor: {minute.id}/UNIVSM/BAA/{new Date().getFullYear()}</p>
                </div>

                {/* Metadata Rapat */}
                <div className="grid grid-cols-1 gap-y-2 mb-12 text-[11pt]">
                    <div className="flex items-start">
                        <span className="font-bold w-44 shrink-0">Nama Kegiatan</span>
                        <span className="w-4 shrink-0">:</span>
                        <span className="font-bold uppercase text-slate-900">{minute.title}</span>
                    </div>
                    <div className="flex items-start">
                        <span className="font-bold w-44 shrink-0">Agenda Utama</span>
                        <span className="w-4 shrink-0">:</span>
                        <span className="font-medium italic text-slate-800">{minute.agenda || 'Koordinasi Internal'}</span>
                    </div>
                    <div className="flex items-start">
                        <span className="font-bold w-44 shrink-0">Hari / Tanggal</span>
                        <span className="w-4 shrink-0">:</span>
                        <span className="font-medium">{minute.date}</span>
                    </div>
                    <div className="flex items-start">
                        <span className="font-bold w-44 shrink-0">Tempat / Lokasi</span>
                        <span className="w-4 shrink-0">:</span>
                        <span className="font-medium">{minute.location || 'Kampus UNIVSM'}</span>
                    </div>
                </div>

                {/* Konten / Isi Notulensi */}
                <div className="min-h-[450px] border-t border-slate-50 pt-8 mb-16">
                    <h4 className="text-[11pt] font-bold uppercase tracking-wider mb-6">RINGKASAN HASIL PEMBAHASAN:</h4>
                    <div className="space-y-6 text-[11.5pt] leading-relaxed text-black text-justify">
                        {discussionPoints.map((text, i) => (
                            <div key={i} className="flex gap-5">
                                <span className="font-bold shrink-0">{i + 1}.</span>
                                <p>{text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bagian Tanda Tangan */}
                <div className="grid grid-cols-2 gap-32 text-[11pt]">
                    <div className="text-center">
                        <p className="font-bold mb-32 uppercase tracking-tighter">MENGETAHUI / MENGESAHKAN,</p>
                        <div className="border-t-[1.5pt] border-black pt-2 inline-block min-w-[240px]">
                            <p className="font-bold uppercase">{minute.signedBy || '( ........................................ )'}</p>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="font-bold mb-32 uppercase tracking-tighter">NOTULIS / PENYUSUN,</p>
                        <div className="border-t-[1.5pt] border-black pt-2 inline-block min-w-[240px]">
                            <p className="font-bold uppercase">{minute.submittedBy}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS Print & Global Overrides */}
            <style>{`
                @media print {
                    @page { 
                        margin: 1.5cm; 
                        size: A4; 
                    }
                    .no-print { display: none !important; }
                    body { background: white !important; padding: 0 !important; }
                    .border-double { border-bottom-style: double !important; }
                    img { filter: grayscale(100%) contrast(1.2) !important; }
                }
                .border-double {
                    border-bottom-style: double;
                }
            `}</style>
        </div>
    );
};

export default MinutesDetail;
