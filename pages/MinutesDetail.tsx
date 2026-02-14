
import React, { useState, useEffect } from 'react';
import { Minute, Page, MinutesStatus } from '../types';
import { GoogleGenAI } from "@google/genai";
import { SpreadsheetService } from '../services/spreadsheet';
import Logo from '../components/Logo';

interface MinutesDetailProps {
    minute: Minute;
    onNavigate: (page: Page) => void;
}

const MinutesDetail: React.FC<MinutesDetailProps> = ({ minute, onNavigate }) => {
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) setUser(JSON.parse(userJson));
    }, []);

    const meetingTitle = minute.title || 'Rapat Koordinasi Universitas';
    const discussionPoints = typeof minute.content === 'string' 
        ? minute.content.split('\n').filter(p => p.trim())
        : (minute.content || []);

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

    const handleVerify = async () => {
        if (!user?.isPimpinan) return;
        if (!confirm("Apakah Anda yakin ingin melakukan verifikasi digital pada notulensi ini?")) return;

        setIsVerifying(true);
        try {
            await SpreadsheetService.verifyMinute(minute.id, user.name);
            alert("Verifikasi Berhasil! Dokumen telah tertandatangani secara sah.");
            onNavigate('history');
        } catch (error) {
            alert("Gagal melakukan verifikasi.");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleOpenMeet = () => {
        if (minute.meetLink) {
            window.open(minute.meetLink, "_blank");
        }
    };

    return (
        <div className="pb-32 md:pb-10 bg-white min-h-screen">
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
                <div className="flex gap-2">
                    {minute.meetLink && (
                        <button 
                            onClick={handleOpenMeet}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100"
                        >
                            <span className="material-symbols-outlined text-lg">videocam</span>
                            Buka Meet
                        </button>
                    )}
                    {user?.isPimpinan && minute.status !== MinutesStatus.SIGNED && (
                        <button 
                            onClick={handleVerify}
                            disabled={isVerifying}
                            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-200"
                        >
                            {isVerifying ? <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-lg">verified</span>}
                            Verifikasi Sah
                        </button>
                    )}
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-black/10">
                        <span className="material-symbols-outlined text-lg">print</span> Cetak
                    </button>
                </div>
            </header>

            {/* KOP SURAT RESMI */}
            <div className="hidden print:block mb-8 border-b-4 border-black pb-6">
                <div className="flex items-center gap-8 mb-4">
                    <div className="h-28 w-auto">
                        <Logo className="h-full" bw={true} />
                    </div>
                    <div className="text-center flex-1 pr-32">
                        <h1 className="text-2xl font-black uppercase tracking-tight">Universitas Sapta Mandiri</h1>
                        <p className="text-xs font-bold tracking-[0.2em] mb-1">BIRO ADMINISTRASI UMUM DAN KEPEGAWAIAN</p>
                        <p className="text-[10px] font-medium italic">
                            Jalan A. Yani Km 1,5 Depan, Lingsir, Kec. Paringin Selatan, <br/>
                            Kabupaten Balangan, Kalimantan Selatan 71618
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 md:px-12 py-10 print:py-0">
                <div className="space-y-10">
                    <section className="border-b border-slate-100 pb-8 print:border-none">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-3xl font-black text-slate-900 leading-tight print:text-2xl flex-1">
                                {meetingTitle}
                            </h2>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest print:border print:border-black ${
                                minute.status === MinutesStatus.SIGNED ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                                {minute.status}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg text-primary print:hidden">event_available</span>
                                <span>{minute.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg text-primary print:hidden">location_on</span>
                                <span>{minute.location || 'Kampus Utama'}</span>
                            </div>
                            {minute.meetLink && (
                                <div className="flex items-center gap-2 text-blue-600 print:hidden">
                                    <span className="material-symbols-outlined text-lg">videocam</span>
                                    <span className="lowercase font-medium">{minute.meetLink}</span>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 no-print">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                <span className="material-symbols-outlined">auto_awesome</span> Ringkasan AI
                            </h3>
                            {!aiSummary && (
                                <button onClick={handleGenerateAISummary} disabled={isGenerating} className="px-4 py-1.5 bg-primary text-white text-[10px] font-bold uppercase rounded-lg">
                                    {isGenerating ? 'Membuat...' : 'Buat Ringkasan'}
                                </button>
                            )}
                        </div>
                        {aiSummary && <p className="text-slate-700 leading-relaxed italic">"{aiSummary}"</p>}
                    </section>

                    <section className="print:mt-8">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-6 print:text-black">Pembahasan Rapat:</h3>
                        <div className="prose prose-slate max-w-none">
                            {discussionPoints.length > 0 ? (
                                <ul className="space-y-6 list-none p-0">
                                    {discussionPoints.map((text, i) => (
                                        <li key={i} className="flex gap-6 items-start">
                                            <span className="size-8 shrink-0 bg-slate-900 text-white flex items-center justify-center rounded-xl text-xs font-bold print:border print:border-black print:bg-white print:text-black">{i+1}</span>
                                            <p className="text-base text-slate-700 leading-relaxed pt-1 print:text-black">{text}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-500 italic">Tidak ada konten pembahasan.</p>
                            )}
                        </div>
                    </section>

                    {minute.documentation && minute.documentation.length > 0 && (
                        <section className="no-print">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Dokumentasi & Screenshot:</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {minute.documentation.map((img, idx) => (
                                    <div key={idx} className="aspect-video rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                                        <img src={img} alt="doc" className="w-full h-full object-cover hover:scale-105 transition-transform cursor-zoom-in" onClick={() => window.open(img, '_blank')} />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="hidden print:grid grid-cols-2 gap-20 mt-20 pt-10">
                        <div className="text-center">
                            <p className="text-xs mb-16 uppercase font-bold tracking-widest">Tanda Tangan Pimpinan,</p>
                            {minute.status === MinutesStatus.SIGNED ? (
                                <div className="space-y-2">
                                    <p className="font-bold border-b border-black inline-block px-4">{minute.signedBy || 'Dr. Aris Wahyudi, M.T.'}</p>
                                    <p className="text-[9px] uppercase text-green-600 font-bold">Terverifikasi Digital via SiNotulen</p>
                                    <p className="text-[8px] text-slate-400">{minute.signedAt}</p>
                                </div>
                            ) : (
                                <div className="h-10"></div>
                            )}
                        </div>
                        <div className="text-center">
                            <p className="text-xs mb-16 uppercase font-bold tracking-widest">Notulis,</p>
                            <p className="font-bold border-b border-black inline-block px-4">{minute.submittedBy || 'Civitas Akademika'}</p>
                        </div>
                    </section>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { font-family: 'Times New Roman', serif; background: white !important; }
                    .print\\:block { display: block !important; }
                    @page { margin: 1.5cm; }
                }
            `}</style>
        </div>
    );
};

export default MinutesDetail;
