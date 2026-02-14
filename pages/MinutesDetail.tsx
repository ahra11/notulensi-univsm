
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

    const meetingTitle = minute.title || 'Rapat Koordinasi';
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
                contents: [{ parts: [{ text: `Bacakan notulensi berikut: ${textToRead}` }] }],
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
            console.error(error);
            setIsSpeaking(false);
        }
    };

    const handleGenerateAISummary = async () => {
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Ringkas rapat: ${meetingTitle}. Isi: ${discussionPoints.join(', ')}`;
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });
            setAiSummary(response.text || "Selesai.");
        } catch (error) {
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleVerify = async () => {
        if (!user?.isPimpinan) return;
        if (!confirm("Verifikasi dokumen?")) return;
        setIsVerifying(true);
        try {
            await SpreadsheetService.verifyMinute(minute.id, user.name);
            onNavigate('history');
        } catch (error) {
            alert("Gagal.");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 print:bg-white pb-20 print:pb-0">
            
            {/* Minimalist Floating Controls - UI Only */}
            <div className="fixed top-6 right-6 flex flex-col gap-3 no-print z-[100]">
                <button onClick={() => onNavigate('history')} className="size-12 bg-white shadow-xl rounded-full flex items-center justify-center text-slate-600 hover:text-primary transition-all active:scale-95 border border-slate-100">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <button onClick={handleTTS} disabled={isSpeaking} className={`size-12 shadow-xl rounded-full flex items-center justify-center transition-all active:scale-95 border ${isSpeaking ? 'bg-amber-500 text-white' : 'bg-white text-amber-600 border-amber-50'}`}>
                    <span className={`material-symbols-outlined ${isSpeaking ? 'animate-pulse' : ''}`}>volume_up</span>
                </button>
                {user?.isPimpinan && minute.status !== MinutesStatus.SIGNED && (
                    <button onClick={handleVerify} disabled={isVerifying} className="size-12 bg-green-600 text-white shadow-xl rounded-full flex items-center justify-center hover:bg-green-700 transition-all active:scale-95">
                        <span className="material-symbols-outlined">{isVerifying ? 'sync' : 'verified'}</span>
                    </button>
                )}
                <button onClick={() => window.print()} className="size-12 bg-primary text-white shadow-xl rounded-full flex items-center justify-center hover:bg-slate-900 transition-all active:scale-95">
                    <span className="material-symbols-outlined">print</span>
                </button>
            </div>

            {/* Document Body */}
            <div className="max-w-4xl mx-auto bg-white shadow-sm mt-0 md:mt-10 p-8 md:p-16 print:p-0 print:m-0 print:shadow-none">
                
                {/* Official Letterhead */}
                <div className="flex items-center gap-6 pb-4 mb-8 border-b-[3px] border-black border-double">
                    <div className="size-20 shrink-0">
                        <Logo className="h-16" bw={true} />
                    </div>
                    <div className="text-center flex-1 pr-12">
                        <h2 className="text-lg font-black uppercase tracking-tight leading-none">Universitas Sapta Mandiri</h2>
                        <p className="text-[9px] font-bold tracking-[0.1em] mt-1 mb-1">BIRO ADMINISTRASI UMUM DAN AKADEMIK</p>
                        <p className="text-[8px] font-medium leading-tight italic">
                            Jalan A. Yani Km 1,5 Depan, Lingsir, Kec. Paringin Selatan, Kabupaten Balangan, Kalimantan Selatan 71618<br/>
                            Email: info@univsm.ac.id | Website: www.univsm.ac.id
                        </p>
                    </div>
                </div>

                {/* Document Title Section */}
                <div className="text-center mb-10">
                    <h3 className="text-base font-bold uppercase underline decoration-1 underline-offset-4">NOTULENSI RAPAT</h3>
                    <p className="text-[10px] font-medium mt-1">Nomor: {minute.id}/UNIVSM/NR/{new Date().getFullYear()}</p>
                </div>

                {/* Meta Grid */}
                <div className="space-y-2 mb-10 text-[11px] leading-relaxed">
                    <div className="flex gap-4">
                        <span className="font-bold w-28 shrink-0">Agenda Rapat</span>
                        <span>: {meetingTitle}</span>
                    </div>
                    <div className="flex gap-4">
                        <span className="font-bold w-28 shrink-0">Hari/Tanggal</span>
                        <span>: {minute.date}</span>
                    </div>
                    <div className="flex gap-4">
                        <span className="font-bold w-28 shrink-0">Tempat</span>
                        <span>: {minute.location || 'Kampus Utama'}</span>
                    </div>
                    <div className="flex gap-4">
                        <span className="font-bold w-28 shrink-0">Status Dokumen</span>
                        <span className="font-bold uppercase">: {minute.status}</span>
                    </div>
                    <div className="flex gap-4">
                        <span className="font-bold w-28 shrink-0">Link Virtual</span>
                        <span>: {minute.meetLink || '-'}</span>
                    </div>
                </div>

                {/* AI Summary - UI Only */}
                {aiSummary && (
                    <div className="mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-100 no-print">
                        <h4 className="text-[9px] font-bold uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">auto_awesome</span> Ringkasan AI
                        </h4>
                        <p className="text-[11px] text-slate-600 italic">"{aiSummary}"</p>
                    </div>
                )}

                {/* Discussion Content */}
                <div className="min-h-[300px] mb-16">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest mb-4">HASIL PEMBAHASAN:</h4>
                    <div className="space-y-4 text-[12px] leading-relaxed text-black">
                        {discussionPoints.length > 0 ? (
                            <ul className="list-none p-0 m-0 space-y-3">
                                {discussionPoints.map((text, i) => (
                                    <li key={i} className="flex gap-4">
                                        <span className="font-bold shrink-0">{i + 1}.</span>
                                        <p>{text}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="italic text-slate-400">Belum ada rincian pembahasan.</p>
                        )}
                    </div>
                </div>

                {/* Signature Block */}
                <div className="grid grid-cols-2 gap-20 text-[11px]">
                    <div className="text-center">
                        <p className="font-bold mb-20 uppercase">MENGETAHUI/MENGESAHKAN,</p>
                        <div className="space-y-1">
                            <p className="font-bold border-b border-black inline-block min-w-[150px]">{minute.signedBy || '( .............................. )'}</p>
                            {minute.status === MinutesStatus.SIGNED && (
                                <>
                                    <p className="text-[8px] text-green-600 font-bold uppercase tracking-widest">VERIFIED DIGITAL SIGNATURE</p>
                                    <p className="text-[7px] text-slate-400">{minute.signedAt}</p>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="font-bold mb-20 uppercase">NOTULIS,</p>
                        <p className="font-bold border-b border-black inline-block min-w-[150px]">{minute.submittedBy || 'Civitas Akademika'}</p>
                    </div>
                </div>

                {/* Attachment Page (Lampiran) */}
                {minute.documentation && minute.documentation.length > 0 && (
                    <div className="mt-16 pt-16 border-t border-slate-100 print:page-break-before-always">
                        <h4 className="text-[12px] font-bold uppercase tracking-widest mb-8 text-center underline">LAMPIRAN I: DOKUMENTASI RAPAT</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {minute.documentation.map((img, idx) => (
                                <div key={idx} className="aspect-video border border-slate-300 overflow-hidden bg-slate-50">
                                    <img src={img} alt={`Lampiran ${idx + 1}`} className="w-full h-full object-contain" />
                                </div>
                            ))}
                        </div>
                        <p className="text-[9px] mt-6 italic text-center text-slate-500">
                            Gambar di atas merupakan bagian tidak terpisahkan dari dokumen notulensi ini.
                        </p>
                    </div>
                )}
            </div>

            <style>{`
                @media print {
                    @page { 
                        margin: 1.5cm; 
                        size: A4; 
                    }
                    * { 
                        color: black !important; 
                        font-family: 'Times New Roman', serif !important; 
                    }
                    .print\\:page-break-before-always { 
                        page-break-before: always; 
                    }
                    .no-print { display: none !important; }
                    ul { list-style-type: none; }
                }
            `}</style>
        </div>
    );
};

export default MinutesDetail;
