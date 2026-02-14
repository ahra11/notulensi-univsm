
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

    const logoBootUrl = "https://univsm.ac.id/wp-content/uploads/2023/08/cropped-logo-univsm-1.png";

    return (
        <div className="min-h-screen bg-slate-100/50 print:bg-white pb-24 print:pb-0 font-serif relative">
            
            {/* Elegant Floating Action Bar - Only Screen View */}
            <div className="fixed bottom-10 md:bottom-auto md:top-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-2 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl no-print z-[100] transition-all hover:scale-[1.02]">
                <button 
                    onClick={() => onNavigate('history')} 
                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
                >
                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.1em]">Kembali</span>
                </button>
                
                <div className="w-px h-8 bg-slate-200 mx-1"></div>
                
                <button 
                    onClick={() => window.print()} 
                    className="flex items-center gap-3 px-8 py-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                >
                    <span className="material-symbols-outlined text-xl">print</span>
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.2em]">Cetak Notulensi</span>
                </button>
            </div>

            {/* Document Body */}
            <div className="max-w-[210mm] mx-auto bg-white shadow-2xl md:my-16 p-[15mm] md:p-[20mm] print:shadow-none print:m-0 print:p-0">
                
                {/* Official USM Letterhead */}
                <div className="flex items-start justify-between pb-4 mb-8 border-b-[1.5pt] border-black border-double">
                    <div className="flex gap-5 items-start w-1/3">
                        <img src={logoBootUrl} alt="UNIVSM Logo" className="h-16 w-auto object-contain grayscale" />
                        <div className="flex flex-col">
                            <h2 className="text-sm font-black leading-none">UNIVSM</h2>
                            <p className="text-[7pt] font-bold uppercase tracking-tighter mt-1">Universitas</p>
                            <p className="text-[7pt] font-bold uppercase tracking-tighter leading-none">Sapta Mandiri</p>
                            <p className="text-[5pt] font-medium leading-none mt-1 opacity-70">KNOWLEDGE, INTEGRITY, & INNOVATION</p>
                        </div>
                    </div>
                    <div className="text-right flex-1">
                        <h1 className="text-sm font-black uppercase tracking-tight">Universitas Sapta Mandiri</h1>
                        <p className="text-[8pt] font-bold uppercase tracking-widest mt-1">BIRO ADMINISTRASI UMUM DAN AKADEMIK</p>
                        <p className="text-[7pt] font-medium leading-tight italic mt-1.5">
                            Jalan A. Yani Km 1,5 Depan, Lingsir, Kec. Paringin Selatan,<br/>
                            Kabupaten Balangan, Kalimantan Selatan 71618 | Email: info@univsm.ac.id
                        </p>
                    </div>
                </div>

                {/* Doc Title & Number */}
                <div className="text-center mb-12">
                    <h3 className="text-[13pt] font-bold uppercase underline decoration-[1.5pt] underline-offset-8">NOTULENSI RAPAT</h3>
                    <p className="text-[9pt] font-medium mt-3">Nomor: {minute.id}/UNIVSM/NR/{new Date().getFullYear()}</p>
                </div>

                {/* Formal Metadata Table */}
                <div className="space-y-2 mb-12 text-[10pt]">
                    <div className="flex items-start">
                        <span className="font-bold w-40 shrink-0">Agenda Rapat</span>
                        <span className="w-4 shrink-0">:</span>
                        <span className="font-bold text-slate-800">{minute.agenda || 'Pelaksanaan Rapat Rutin'}</span>
                    </div>
                    <div className="flex items-start">
                        <span className="font-bold w-40 shrink-0">Nama Agenda/Kegiatan</span>
                        <span className="w-4 shrink-0">:</span>
                        <span className="font-medium">{minute.title}</span>
                    </div>
                    <div className="flex items-start">
                        <span className="font-bold w-40 shrink-0">Hari/Tanggal</span>
                        <span className="w-4 shrink-0">:</span>
                        <span className="font-medium">{minute.date}</span>
                    </div>
                    <div className="flex items-start">
                        <span className="font-bold w-40 shrink-0">Tempat</span>
                        <span className="w-4 shrink-0">:</span>
                        <span className="font-medium">{minute.location || 'Kampus UNIVSM'}</span>
                    </div>
                    <div className="flex items-start">
                        <span className="font-bold w-40 shrink-0">Status Dokumen</span>
                        <span className="w-4 shrink-0">:</span>
                        <span className="font-bold uppercase tracking-widest text-primary">{minute.status}</span>
                    </div>
                    <div className="flex items-start">
                        <span className="font-bold w-40 shrink-0">Link Virtual</span>
                        <span className="w-4 shrink-0">:</span>
                        <span className="font-medium">{minute.meetLink ? minute.meetLink : '-'}</span>
                    </div>
                    <div className="flex items-start">
                        <span className="font-bold w-40 shrink-0">Notulis (Pembuat)</span>
                        <span className="w-4 shrink-0">:</span>
                        <span className="font-bold uppercase italic">{minute.submittedBy}</span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="min-h-[450px]">
                    <h4 className="text-[10pt] font-bold uppercase tracking-[0.1em] mb-6 border-b border-black/10 pb-2">HASIL PEMBAHASAN:</h4>
                    <div className="space-y-6 text-[11pt] leading-relaxed text-black text-justify">
                        {discussionPoints.length > 0 ? (
                            <ul className="list-none p-0 m-0 space-y-4">
                                {discussionPoints.map((text, i) => (
                                    <li key={i} className="flex gap-5">
                                        <span className="font-bold shrink-0">{i + 1}.</span>
                                        <p>{text}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="italic text-slate-400">Pembahasan belum diinput.</p>
                        )}
                    </div>
                </div>

                {/* Signature Panel */}
                <div className="mt-24 grid grid-cols-2 gap-24 text-[10pt]">
                    <div className="text-center">
                        <p className="font-bold mb-28 uppercase tracking-widest">MENGETAHUI/MENGESAHKAN,</p>
                        <div className="border-t border-black pt-2 inline-block min-w-[220px]">
                            <p className="font-bold uppercase">{minute.signedBy || '( ........................................ )'}</p>
                            {minute.status === MinutesStatus.SIGNED && (
                                <p className="text-[6pt] text-slate-500 font-bold uppercase mt-1 italic">Electronically Verified: {minute.signedAt}</p>
                            )}
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="font-bold mb-28 uppercase tracking-widest">NOTULIS,</p>
                        <div className="border-t border-black pt-2 inline-block min-w-[220px]">
                            <p className="font-bold uppercase">{minute.submittedBy}</p>
                        </div>
                    </div>
                </div>

                {/* Attachments */}
                {minute.documentation && minute.documentation.length > 0 && (
                    <div className="mt-20 pt-12 border-t-[0.5pt] border-slate-300 print:page-break-before-always">
                        <h4 className="text-[11pt] font-bold uppercase tracking-[0.2em] mb-10 text-center underline underline-offset-8">LAMPIRAN: DOKUMENTASI KEGIATAN</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {minute.documentation.map((img, idx) => (
                                <div key={idx} className="border-[0.5pt] border-black p-1.5 shadow-sm">
                                    <img src={img} alt={`Lampiran ${idx + 1}`} className="w-full h-auto" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @media screen {
                    .font-serif { font-family: 'Times New Roman', Times, serif; }
                }
                @media print {
                    @page { margin: 2.5cm; size: A4; }
                    body { background: white !important; padding: 0 !important; margin: 0 !important; }
                    * { color: black !important; font-family: 'Times New Roman', serif !important; }
                    ul { list-style: none; }
                    .no-print { display: none !important; }
                    .print\\:page-break-before-always { page-break-before: always; }
                }
            `}</style>
        </div>
    );
};

export default MinutesDetail;
