
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
        <div className="min-h-screen bg-slate-100/50 print:bg-white pb-20 print:pb-0 font-serif">
            
            {/* Minimalist UI Controls - Discrete & Non-distracting */}
            <div className="fixed top-4 left-4 flex gap-2 no-print z-[100] opacity-30 hover:opacity-100 transition-opacity">
                <button onClick={() => onNavigate('history')} className="bg-white border border-slate-200 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">arrow_back</span> Kembali
                </button>
                <button onClick={() => window.print()} className="bg-primary text-white px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">print</span> Cetak
                </button>
            </div>

            {/* Document Layout - Optimized for Print & Visual Match */}
            <div className="max-w-[210mm] mx-auto bg-white shadow-xl md:my-8 p-[15mm] md:p-[20mm] print:shadow-none print:m-0 print:p-0">
                
                {/* Official Letterhead - Matching Reference Image */}
                <div className="flex items-start justify-between pb-4 mb-6 border-b-[1.5pt] border-black border-double">
                    <div className="flex gap-4 items-start w-1/3">
                        <img src={logoBootUrl} alt="Logo" className="h-16 w-auto object-contain grayscale" />
                    </div>
                    <div className="text-right flex-1">
                        <h1 className="text-sm font-black uppercase tracking-tight">Universitas Sapta Mandiri</h1>
                        <p className="text-[7pt] font-medium leading-tight italic mt-1">
                            Jalan A. Yani Km 1,5 Depan, Lingsir, Kec. Paringin Selatan,<br/>
                            Kabupaten Balangan, Kalimantan Selatan 71618 | Email: info@univsm.ac.id
                        </p>
                    </div>
                </div>

                {/* Document Title */}
                <div className="text-center mb-10">
                    <h3 className="text-[12pt] font-bold uppercase underline decoration-[1.5pt] underline-offset-4">NOTULENSI RAPAT</h3>
                    <p className="text-[9pt] font-medium mt-1">Nomor: {minute.id}/UNIVSM/NR/{new Date().getFullYear()}</p>
                </div>

                {/* Metadata Table-style */}
                <div className="space-y-1.5 mb-10 text-[10pt]">
                    <div className="flex">
                        <span className="font-bold w-36 shrink-0">Agenda Rapat</span>
                        <span className="w-4 shrink-0">:</span>
                        <span className="font-medium">{minute.title || 'Rapat'}</span>
                    </div>
                    <div className="flex">
                        <span className="font-bold w-36 shrink-0">Hari/Tanggal</span>
                        <span className="w-4 shrink-0">:</span>
                        <span className="font-medium">{minute.date}</span>
                    </div>
                    <div className="flex">
                        <span className="font-bold w-36 shrink-0">Tempat</span>
                        <span className="w-4 shrink-0">:</span>
                        <span className="font-medium">{minute.location || 'Rapat'}</span>
                    </div>
                    <div className="flex">
                        <span className="font-bold w-36 shrink-0">Status Dokumen</span>
                        <span className="w-4 shrink-0">:</span>
                        <span className="font-bold uppercase">{minute.status}</span>
                    </div>
                    <div className="flex">
                        <span className="font-bold w-36 shrink-0">Link Virtual</span>
                        <span className="w-4 shrink-0">:</span>
                        <span className="font-medium underline">_</span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="min-h-[400px]">
                    <h4 className="text-[10pt] font-bold uppercase tracking-widest mb-6">HASIL PEMBAHASAN:</h4>
                    <div className="space-y-6 text-[11pt] leading-relaxed text-black">
                        {discussionPoints.length > 0 ? (
                            <ul className="list-none p-0 m-0 space-y-4">
                                {discussionPoints.map((text, i) => (
                                    <li key={i} className="flex gap-4">
                                        <span className="font-bold shrink-0">{i + 1}.</span>
                                        <p className="text-justify">{text}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="italic text-slate-400">Belum ada rincian pembahasan.</p>
                        )}
                    </div>
                </div>

                {/* Signatures */}
                <div className="mt-24 grid grid-cols-2 gap-20 text-[10pt]">
                    <div className="text-center">
                        <p className="font-bold mb-24 uppercase">MENGETAHUI/MENGESAHKAN,</p>
                        <div className="border-t border-black pt-1 inline-block min-w-[180px]">
                            <p className="font-bold uppercase">{minute.signedBy || 'Pimpinan'}</p>
                            {minute.status === MinutesStatus.SIGNED && (
                                <p className="text-[6pt] text-slate-500 font-bold uppercase">Digitally Verified: {minute.signedAt}</p>
                            )}
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="font-bold mb-24 uppercase">NOTULIS,</p>
                        <div className="border-t border-black pt-1 inline-block min-w-[180px]">
                            <p className="font-bold uppercase">{minute.submittedBy || 'Notulis'}</p>
                        </div>
                    </div>
                </div>

                {/* Attachments - Always Forced to New Page in Print */}
                {minute.documentation && minute.documentation.length > 0 && (
                    <div className="mt-16 pt-10 border-t border-slate-100 print:page-break-before-always">
                        <h4 className="text-[11pt] font-bold uppercase tracking-widest mb-8 text-center underline">LAMPIRAN I: DOKUMENTASI RAPAT</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {minute.documentation.map((img, idx) => (
                                <div key={idx} className="border border-black p-1 bg-white">
                                    <img src={img} alt={`Lampiran ${idx + 1}`} className="w-full h-auto" />
                                </div>
                            ))}
                        </div>
                        <p className="text-[8pt] mt-6 italic text-center">
                            Gambar di atas merupakan bagian tidak terpisahkan dari dokumen notulensi ini.
                        </p>
                    </div>
                )}
            </div>

            <style>{`
                @media screen {
                    .font-serif { font-family: 'Times New Roman', Times, serif; }
                }
                @media print {
                    @page { margin: 2cm; size: A4; }
                    body { background: white !important; padding: 0 !important; }
                    * { color: black !important; font-family: 'Times New Roman', serif !important; }
                    .print\\:page-break-before-always { page-break-before: always; }
                    ul { list-style: none; }
                    .no-print { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default MinutesDetail;
