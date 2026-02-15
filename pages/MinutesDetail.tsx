
import React from 'react';
import { Minute, Page, MinutesStatus } from '../types';

interface MinutesDetailProps {
    minute: Minute;
    onNavigate: (page: Page) => void;
}

const MinutesDetail: React.FC<MinutesDetailProps> = ({ minute, onNavigate }) => {
    const discussionPoints = typeof minute.content === 'string' 
        ? minute.content.split('\n').filter(p => p.trim())
        : (minute.content || []);

    // Gunakan URL yang sama dengan komponen Logo
    const logoUrl = "https://drive.google.com/file/d/1EOW7ThAe7HIXfuL1R9BPxMxiCKGHc6r8/view?usp=sharing";

    return (
        <div className="min-h-screen bg-slate-100/50 print:bg-white pb-24 print:pb-0 font-serif relative">
            
            {/* Elegant Floating Action Bar */}
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

            {/* Document Body */}
            <div className="max-w-[210mm] mx-auto bg-white shadow-2xl md:my-16 p-[15mm] md:p-[20mm] print:shadow-none print:m-0 print:p-0">
                
                {/* Official USM Letterhead */}
                <div className="flex items-center justify-between pb-6 mb-8 border-b-[2pt] border-black border-double">
                    <div className="flex gap-6 items-center w-full">
                        <img 
                            src={logoUrl} 
                            alt="Logo UNIVSM" 
                            className="h-20 w-auto object-contain grayscale contrast-125 brightness-90" 
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/3070/3070014.png";
                            }}
                        />
                        <div className="flex-1 text-center pr-10">
                            <h1 className="text-lg font-black uppercase tracking-normal leading-tight">YAYASAN SAPTA BAKTI PENDIDIKAN</h1>
                            <h1 className="text-xl font-black uppercase tracking-tight leading-tight">UNIVERSITAS SAPTA MANDIRI</h1>
                            <p className="text-[7.5pt] font-medium leading-tight italic mt-2 border-t border-black/10 pt-1">
                                Kampus Utama: Jalan A. Yani Km 1,5 Depan, Lingsir, Kec. Paringin Selatan,<br/>
                                Kabupaten Balangan, Kalimantan Selatan 71618 | Website: www.univsm.ac.id
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content of Document */}
                <div className="text-center mb-12">
                    <h3 className="text-[13pt] font-bold uppercase underline decoration-[1.5pt] underline-offset-8">NOTULENSI RAPAT</h3>
                    <p className="text-[10pt] font-medium mt-3">Nomor: {minute.id}/UNIVSM/BAA/{new Date().getFullYear()}</p>
                </div>

                <div className="grid grid-cols-1 gap-y-1.5 mb-12 text-[10.5pt]">
                    <div className="flex items-start">
                        <span className="font-bold w-44 shrink-0">Nama Kegiatan</span>
                        <span className="w-4 shrink-0">:</span>
                        <span className="font-bold text-slate-800 uppercase">{minute.title}</span>
                    </div>
                    <div className="flex items-start">
                        <span className="font-bold w-44 shrink-0">Agenda Utama</span>
                        <span className="w-4 shrink-0">:</span>
                        <span className="font-medium italic text-slate-700">{minute.agenda || 'Koordinasi Internal'}</span>
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

                <div className="min-h-[500px] border-t border-slate-100 pt-8">
                    <h4 className="text-[11pt] font-bold uppercase tracking-[0.1em] mb-6">RINGKASAN HASIL PEMBAHASAN:</h4>
                    <div className="space-y-6 text-[11.5pt] leading-relaxed text-black text-justify">
                        {discussionPoints.map((text, i) => (
                            <div key={i} className="flex gap-5">
                                <span className="font-bold shrink-0">{i + 1}.</span>
                                <p>{text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-28 grid grid-cols-2 gap-32 text-[10.5pt]">
                    <div className="text-center">
                        <p className="font-bold mb-32 uppercase tracking-tighter">MENGETAHUI / MENGESAHKAN,</p>
                        <div className="border-t-[1.2pt] border-black pt-2 inline-block min-w-[240px]">
                            <p className="font-bold uppercase">{minute.signedBy || '( ........................................ )'}</p>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="font-bold mb-32 uppercase tracking-tighter">NOTULIS / PENYUSUN,</p>
                        <div className="border-t-[1.2pt] border-black pt-2 inline-block min-w-[240px]">
                            <p className="font-bold uppercase">{minute.submittedBy}</p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    @page { margin: 2cm; size: A4; }
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    img { filter: grayscale(100%) contrast(1.2); }
                }
            `}</style>
        </div>
    );
};

export default MinutesDetail;
