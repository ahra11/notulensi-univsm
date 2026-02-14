
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
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) setUser(JSON.parse(userJson));
    }, []);

    const meetingTitle = minute.title || 'Rapat Koordinasi Universitas';
    const discussionPoints = typeof minute.content === 'string' 
        ? minute.content.split('\n').filter(p => p.trim())
        : (minute.content || []);

    const decodeBase64 = (base64: string) => {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    };

    const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
        const dataInt16 = new Int16Array(data.buffer);
        const frameCount = dataInt16.length / numChannels;
        const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
        for (let channel = 0; channel < numChannels; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let i = 0; i < frameCount; i++) {
                channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
            }
        }
        return buffer;
    };

    const handleTTS = async () => {
        if (isSpeaking) return;
        setIsSpeaking(true);
        try {
            const textToRead = aiSummary || discussionPoints.join('. ');
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: `Bacakan notulensi berikut dengan tenang: ${textToRead}` }] }],
                config: {
                    responseModalities: ["AUDIO"],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Kore' },
                        },
                    },
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), audioContext, 24000, 1);
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                source.onended = () => setIsSpeaking(false);
                source.start();
            } else {
                setIsSpeaking(false);
            }
        } catch (error) {
            console.error("TTS Error:", error);
            setIsSpeaking(false);
        }
    };

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
        if (!confirm("Konfirmasi Verifikasi Digital?")) return;

        setIsVerifying(true);
        try {
            await SpreadsheetService.verifyMinute(minute.id, user.name);
            onNavigate('history');
        } catch (error) {
            alert("Gagal memverifikasi.");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/30 print:bg-white pb-20">
            {/* Action Header - Hidden on Print */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 md:px-8 py-4 flex items-center justify-between no-print shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => onNavigate('history')} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-600 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-sm font-bold text-slate-900">Detail & Cetak Notulensi</h1>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest">SiNotulen Digital System</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleTTS} disabled={isSpeaking} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${isSpeaking ? 'bg-amber-100 text-amber-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                        <span className={`material-symbols-outlined text-lg ${isSpeaking ? 'animate-pulse' : ''}`}>volume_up</span>
                        {isSpeaking ? 'Membaca...' : 'Dengarkan'}
                    </button>
                    {user?.isPimpinan && minute.status !== MinutesStatus.SIGNED && (
                        <button onClick={handleVerify} disabled={isVerifying} className="bg-green-600 text-white px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-green-700 shadow-lg shadow-green-200">
                            {isVerifying ? 'Proses...' : 'Verifikasi'}
                        </button>
                    )}
                    <button onClick={() => window.print()} className="bg-primary text-white px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-900 shadow-lg shadow-primary/20 flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">print</span> Cetak PDF
                    </button>
                </div>
            </header>

            {/* Document Content */}
            <div className="max-w-4xl mx-auto bg-white shadow-2xl shadow-primary/5 mt-8 md:my-12 p-8 md:p-16 print:m-0 print:p-0 print:shadow-none">
                
                {/* Official Letterhead (Kop Surat) */}
                <div className="flex items-center gap-6 pb-6 mb-8 border-b-[3px] border-black border-double">
                    <div className="size-24 shrink-0">
                        <Logo className="h-20" bw={true} />
                    </div>
                    <div className="text-center flex-1 pr-12">
                        <h2 className="text-xl font-black uppercase leading-tight">Universitas Sapta Mandiri</h2>
                        <p className="text-[10px] font-bold tracking-[0.2em] mb-1">BIRO ADMINISTRASI UMUM DAN AKADEMIK</p>
                        <p className="text-[9px] font-medium leading-relaxed italic">
                            Jalan A. Yani Km 1,5 Depan, Lingsir, Kec. Paringin Selatan, <br/>
                            Kabupaten Balangan, Kalimantan Selatan 71618 | Email: info@univsm.ac.id
                        </p>
                    </div>
                </div>

                {/* Document Title */}
                <div className="text-center mb-10">
                    <h3 className="text-lg font-bold uppercase underline decoration-2 underline-offset-4">NOTULENSI RAPAT</h3>
                    <p className="text-xs font-medium mt-1">Nomor: {minute.id}/UNIVSM/NR/{new Date().getFullYear()}</p>
                </div>

                {/* Meta Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-12 mb-10 text-xs bg-slate-50 p-6 rounded-2xl border border-slate-100 print:bg-transparent print:p-0 print:border-none">
                    <div className="flex gap-4">
                        <span className="font-bold w-24 shrink-0">Agenda Rapat</span>
                        <span className="text-slate-700">: {meetingTitle}</span>
                    </div>
                    <div className="flex gap-4">
                        <span className="font-bold w-24 shrink-0">Hari/Tanggal</span>
                        <span className="text-slate-700">: {minute.date}</span>
                    </div>
                    <div className="flex gap-4">
                        <span className="font-bold w-24 shrink-0">Tempat</span>
                        <span className="text-slate-700">: {minute.location || 'Kampus Utama'}</span>
                    </div>
                    <div className="flex gap-4">
                        <span className="font-bold w-24 shrink-0">Status Dokumen</span>
                        <span className={`font-bold uppercase ${minute.status === MinutesStatus.SIGNED ? 'text-green-600' : 'text-amber-600'}`}>
                            : {minute.status}
                        </span>
                    </div>
                    {minute.meetLink && (
                        <div className="flex gap-4 md:col-span-2">
                            <span className="font-bold w-24 shrink-0">Link Virtual</span>
                            <span className="text-blue-600 underline">: {minute.meetLink}</span>
                        </div>
                    )}
                </div>

                {/* AI Summary Section - No Print unless toggled */}
                {aiSummary && (
                    <div className="mb-10 p-6 bg-primary/5 rounded-2xl border border-primary/10 no-print">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">auto_awesome</span> Ringkasan Eksekutif AI
                        </h4>
                        <p className="text-xs text-slate-700 leading-relaxed italic">"{aiSummary}"</p>
                    </div>
                )}
                {!aiSummary && (
                    <button onClick={handleGenerateAISummary} disabled={isGenerating} className="mb-10 w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-colors no-print">
                        {isGenerating ? 'Menghasilkan Ringkasan...' : '+ Buat Ringkasan AI'}
                    </button>
                )}

                {/* Main Content */}
                <div className="space-y-8 min-h-[400px]">
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 print:text-black">Hasil Pembahasan:</h4>
                    <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-800 print:text-black">
                        {discussionPoints.length > 0 ? (
                            <ul className="list-none p-0 space-y-4">
                                {discussionPoints.map((text, i) => (
                                    <li key={i} className="flex gap-4">
                                        <span className="font-bold shrink-0">{i + 1}.</span>
                                        <p>{text}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="italic text-slate-400">Belum ada rincian pembahasan yang dicatat.</p>
                        )}
                    </div>
                </div>

                {/* Signature Area */}
                <div className="mt-20 grid grid-cols-2 gap-20">
                    <div className="text-center">
                        <p className="text-xs font-bold mb-20 uppercase tracking-widest">Mengetahui/Mengesahkan,</p>
                        {minute.status === MinutesStatus.SIGNED ? (
                            <div className="space-y-1">
                                <p className="font-black text-sm border-b border-black inline-block px-4">{minute.signedBy}</p>
                                <p className="text-[8px] text-green-600 font-bold uppercase tracking-widest">Verified Digital Signature</p>
                                <p className="text-[7px] text-slate-400">{minute.signedAt}</p>
                            </div>
                        ) : (
                            <div className="h-10 border-b border-slate-100 w-48 mx-auto italic text-[8px] text-slate-300">Belum Diverifikasi</div>
                        )}
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-bold mb-20 uppercase tracking-widest">Notulis,</p>
                        <p className="font-black text-sm border-b border-black inline-block px-4">{minute.submittedBy || 'Civitas Akademika'}</p>
                    </div>
                </div>

                {/* Attachment Section (Lampiran) - Always on new page when printing */}
                {minute.documentation && minute.documentation.length > 0 && (
                    <div className="mt-16 pt-16 border-t border-slate-100 print:page-break-before-always">
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-6 print:text-black">Lampiran I: Dokumentasi Rapat</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {minute.documentation.map((img, idx) => (
                                <div key={idx} className="aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-sm print:border-black print:rounded-none">
                                    <img src={img} alt={`Lampiran ${idx + 1}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <p className="text-[9px] text-slate-400 mt-4 italic print:text-black">Gambar di atas merupakan bagian tidak terpisahkan dari dokumen notulensi ini.</p>
                    </div>
                )}
            </div>

            <style>{`
                @media print {
                    @page { margin: 2cm; size: A4; }
                    .no-print { display: none !important; }
                    body { background: white !important; -webkit-print-color-adjust: exact; }
                    * { color: black !important; font-family: 'Times New Roman', serif !important; }
                    .print\\:page-break-before-always { page-break-before: always; }
                    ul { list-style-type: none; }
                }
            `}</style>
        </div>
    );
};

export default MinutesDetail;
