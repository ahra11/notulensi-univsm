
import React, { useState } from 'react';
import { Minute, Page, MinutesStatus } from '../types';
import { GoogleGenAI } from "@google/genai";
import Logo from '../components/Logo';

interface MinutesDetailProps {
    minute: Minute;
    onNavigate: (page: Page) => void;
}

const MinutesDetail: React.FC<MinutesDetailProps> = ({ minute, onNavigate }) => {
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const meetingTitle = minute.title || 'Rapat Koordinasi Universitas';
    const agendaContent = "Evaluasi capaian kinerja institusi dan penyelarasan program kerja strategis.";
    const discussionPoints = minute.content || [
        'Optimalisasi penggunaan sumber daya digital kampus.',
        'Peningkatan mutu layanan akademik melalui integrasi sistem baru.',
        'Persiapan visitasi akreditasi internasional prodi unggulan.'
    ];

    const handleGenerateAISummary = async () => {
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Buatkan ringkasan eksekutif formal dalam 3 poin untuk rapat: ${meetingTitle}. Isi pembahasan: ${discussionPoints.join(', ')}`;
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });
            setAiSummary(response.text || "Ringkasan berhasil dibuat.");
        } catch (error) {
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExportTxt = () => {
        const content = `UNIVERSITAS SAPTA MANDIRI (UNIVSM)\nNOTULENSI RESMI\n\nJUDUL: ${meetingTitle}\nTANGGAL: ${minute.date}\n\n${discussionPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Notulen_UNIVSM_${minute.id}.txt`;
        link.click();
    };

    return (
        <div className="pb-32 md:pb-10 bg-white min-h-screen">
            {/* Navigasi - Sembunyi saat Print */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 px-4 md:px-8 py-4 flex items-center justify-between no-print">
                <div className="flex items-center gap-3">
                    <button onClick={() => onNavigate('history')} className="flex items-center justify-center size-10 rounded-full hover:bg-slate-50 transition-colors">
                        <span className="material-symbols-outlined text-slate-900">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-sm font-bold">Detail Dokumen</h1>
                        <p className="text-[9px] text-primary font-bold uppercase tracking-widest">Arsip Digital UNIVSM</p>
                    </div>
                </div>
                <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-black/10">
                    <span className="material-symbols-outlined text-lg">print</span> Cetak Laporan
                </button>
            </header>

            {/* KOP SURAT RESMI (Hanya Muncul saat Print) */}
            <div className="hidden print:block mb-8 border-b-4 border-black pb-6 text-center">
                <div className="flex items-center justify-center mb-4">
                    <Logo className="h-20 w-auto" bw={true} />
                </div>
                <h1 className="text-2xl font-black uppercase tracking-tight">Universitas Sapta Mandiri</h1>
                <p className="text-xs font-bold tracking-[0.2em] mb-1">BIRO ADMINISTRASI UMUM DAN KEPEGAWAIAN</p>
                <p className="text-[10px] text-slate-600 italic">Jl. Pendidikan No. 123, Kampus Terpadu UNIVSM, Indonesia</p>
            </div>

            <div className="max-w-5xl mx-auto px-6 md:px-12 py-10 print:py-0">
                <div className="space-y-10">
                    <section className="border-b border-slate-100 pb-8 print:border-none">
                        <h2 className="text-3xl font-black text-slate-900 leading-tight mb-4 print:text-2xl">
                            {meetingTitle}
                        </h2>
                        <div className="flex gap-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg text-primary print:hidden">event_available</span>
                                <span>{minute.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg text-primary print:hidden">verified</span>
                                <span className="text-green-600">Terverifikasi Digital</span>
                            </div>
                        </div>
                    </section>

                    <section className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 no-print">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                <span className="material-symbols-outlined">auto_awesome</span> Ringkasan Kecerdasan Buatan
                            </h3>
                            {!aiSummary && (
                                <button onClick={handleGenerateAISummary} className="px-4 py-1.5 bg-primary text-white text-[10px] font-bold uppercase rounded-lg">Buat Ringkasan</button>
                            )}
                        </div>
                        {aiSummary && <p className="text-slate-700 leading-relaxed italic">"{aiSummary}"</p>}
                    </section>

                    <section className="print:mt-8">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-6 print:text-black">Daftar Pembahasan & Keputusan:</h3>
                        <ul className="space-y-6">
                            {discussionPoints.map((text, i) => (
                                <li key={i} className="flex gap-6 items-start">
                                    <span className="size-8 shrink-0 bg-slate-900 text-white flex items-center justify-center rounded-xl text-xs font-bold print:bg-white print:text-black print:border print:border-black">{i+1}</span>
                                    <p className="text-base text-slate-700 leading-relaxed pt-1 print:text-black">{text}</p>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Tanda Tangan (Sangat penting saat di-print) */}
                    <section className="hidden print:grid grid-cols-2 gap-20 mt-20 pt-10">
                        <div className="text-center">
                            <p className="text-xs mb-16 uppercase font-bold tracking-widest">Pimpinan Rapat,</p>
                            <p className="font-bold border-b border-black inline-block px-4">Dr. Aris Wahyudi, M.T.</p>
                            <p className="text-[10px] mt-1 uppercase">NIP. 198504122010121003</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs mb-16 uppercase font-bold tracking-widest">Notulis,</p>
                            <p className="font-bold border-b border-black inline-block px-4">Administrasi Akademik</p>
                            <p className="text-[10px] mt-1 uppercase">Sistem Notulensi Digital</p>
                        </div>
                    </section>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { font-family: 'Times New Roman', serif; background: white !important; }
                    .print\\:block { display: block !important; }
                    @page { margin: 2cm; }
                }
            `}</style>
        </div>
    );
};

export default MinutesDetail;
