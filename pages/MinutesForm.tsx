
import React, { useState, useRef, useEffect } from 'react';
import { Page, Minute } from '../types';
import { GoogleGenAI, Modality } from "@google/genai";
import { SpreadsheetService } from '../services/spreadsheet';

interface MinutesFormProps {
    onNavigate: (page: Page) => void;
    initialData?: Minute | null;
}

const MinutesForm: React.FC<MinutesFormProps> = ({ onNavigate, initialData }) => {
    const [title, setTitle] = useState(initialData?.title || "");
    const [agenda, setAgenda] = useState(initialData?.agenda || "");
    const [location, setLocation] = useState(initialData?.location || "");
    const [date, setDate] = useState(initialData?.date || "");
    const [notulensi, setNotulensi] = useState(initialData?.content || "");
    const [meetLink, setMeetLink] = useState(initialData?.meetLink || "");
    const [bottomDocumentation, setDocumentation] = useState<string[]>(initialData?.documentation || []);
    
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    // Use any[] to avoid naming conflict with @google/genai's internal Blob type
    const audioChunksRef = useRef<any[]>([]);

    const isEditMode = !!initialData;

    // Manual base64 decoding as per @google/genai guidelines
    const decodeBase64 = (base64: string) => {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    };

    // Manual audio decoding for raw PCM data as per @google/genai guidelines
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
        if (!notulensi || isSpeaking) return;
        setIsSpeaking(true);
        setStatusMessage("Menyiapkan suara AI...");
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: `Bacakan hasil rapat ini: ${notulensi.substring(0, 1000)}` }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
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
                source.onended = () => {
                    setIsSpeaking(false);
                    setStatusMessage("");
                };
                source.start();
                setStatusMessage("Memutar teks...");
            }
        } catch (error) {
            console.error(error);
            setIsSpeaking(false);
            setStatusMessage("Gagal memutar suara.");
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
            mediaRecorder.onstop = async () => {
                // Use the native browser Blob constructor
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(audioBlob);
                setRecordedAudioUrl(url);
                await transcribeAudio(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };
            mediaRecorder.start();
            setIsRecording(true);
            setStatusMessage("Merekam...");
        } catch (err) { alert("Gagal mengakses mikrofon."); }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    // Use any to bypass conflict between native Blob and @google/genai's internal Blob type
    const transcribeAudio = async (audioBlob: any) => {
        setIsTranscribing(true);
        setStatusMessage("AI sedang merangkum hasil rapat...");
        try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const readerResult = reader.result as string;
                const base64Audio = readerResult.split(',')[1] || "";
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: {
                        parts: [
                            { text: "Transkripsikan audio rapat ini ke poin-poin pembahasan formal Bahasa Indonesia." },
                            { inlineData: { mimeType: 'audio/webm', data: base64Audio } }
                        ]
                    }
                });
                const text = response.text || "";
                setNotulensi(prev => prev + (prev ? "\n\n" : "") + text);
                setIsTranscribing(false);
                setStatusMessage("Selesai!");
            };
        } catch (error) {
            setIsTranscribing(false);
            setStatusMessage("Gagal transkripsi AI.");
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => setDocumentation(prev => [...prev, reader.result as string]);
            reader.readAsDataURL(file);
        });
    };

    const handleFormSubmit = async () => {
        if (!title || !notulensi) { alert("Judul dan Pembahasan tidak boleh kosong."); return; }
        setIsSubmitting(true);
        setStatusMessage("Menyimpan ke Database...");
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const payload = {
            id: initialData?.id || Date.now().toString(),
            title,
            agenda,
            location,
            date,
            content: notulensi,
            meetLink,
            documentation: bottomDocumentation,
            submittedBy: initialData?.submittedBy || currentUser.name || "Staf USM",
            updatedAt: new Date().toLocaleString('id-ID'),
            status: initialData?.status || 'DRAFT'
        };
        try {
            if (isEditMode) await SpreadsheetService.updateData(payload.id, payload);
            else await SpreadsheetService.saveData(payload);
            onNavigate('history');
        } catch (error) { alert("Gagal terhubung ke database."); }
        finally { setIsSubmitting(false); }
    };

    return (
        <div className="pb-32 md:pb-10 bg-slate-50 min-h-screen">
            <header className="sticky top-0 z-50 bg-white border-b border-primary/5 px-4 md:px-8 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => onNavigate('dashboard')} className="size-10 rounded-full hover:bg-slate-50 flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-lg font-bold">{isEditMode ? 'Edit Dokumen' : 'Input Notulensi Baru'}</h1>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Portal Akademik USM</p>
                    </div>
                </div>
                <button 
                    onClick={handleFormSubmit}
                    disabled={isSubmitting}
                    className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
                >
                    {isSubmitting ? <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-sm">save</span>}
                    {isSubmitting ? 'Proses...' : 'Simpan'}
                </button>
            </header>

            <div className="max-w-4xl mx-auto p-4 md:p-10 space-y-8">
                {/* Section Identity */}
                <section className="bg-white p-6 md:p-8 rounded-[2rem] border border-primary/5 shadow-xl shadow-primary/5 space-y-6">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">info</span> Detail Pelaksanaan Rapat
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Agenda / Judul Rapat</label>
                            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full h-14 rounded-2xl border-slate-100 bg-slate-50/30 focus:ring-primary focus:border-primary text-sm" placeholder="Misal: Rapat Koordinasi Kurikulum" type="text" />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Agenda Pembahasan (Poin Utama)</label>
                            <input value={agenda} onChange={e => setAgenda(e.target.value)} className="w-full h-14 rounded-2xl border-slate-100 bg-slate-50/30 focus:ring-primary focus:border-primary text-sm" placeholder="1. Evaluasi RPS, 2. Pembagian Jadwal, ..." type="text" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tempat / Ruang</label>
                            <input value={location} onChange={e => setLocation(e.target.value)} className="w-full h-14 rounded-2xl border-slate-100 bg-slate-50/30 text-sm" placeholder="Gedung A R.302" type="text" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tanggal Rapat</label>
                            <input value={date} onChange={e => setDate(e.target.value)} className="w-full h-14 rounded-2xl border-slate-100 bg-slate-50/30 text-sm" type="date" />
                        </div>
                    </div>
                </section>

                {/* Section Content */}
                <section className="bg-white p-6 md:p-8 rounded-[2rem] border border-primary/5 shadow-xl shadow-primary/5 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">description</span> Hasil Pembahasan Rapat
                        </h2>
                        <div className="flex items-center gap-2">
                            <button onClick={handleTTS} disabled={isSpeaking || !notulensi} className={`p-2.5 rounded-xl transition-all ${isSpeaking ? 'bg-amber-500 text-white animate-pulse' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`} title="Dengarkan Review Suara AI">
                                <span className="material-symbols-outlined">volume_up</span>
                            </button>
                            <button onClick={isRecording ? stopRecording : startRecording} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-primary/5 text-primary hover:bg-primary/10'}`}>
                                <span className="material-symbols-outlined text-lg">{isRecording ? 'stop' : 'mic'}</span>
                                {isRecording ? 'Berhenti' : 'Input Suara'}
                            </button>
                        </div>
                    </div>
                    {statusMessage && <div className="text-[10px] font-bold text-primary animate-pulse uppercase text-center bg-primary/5 py-2 rounded-lg">{statusMessage}</div>}
                    <textarea 
                        value={notulensi}
                        onChange={(e) => setNotulensi(e.target.value)}
                        className="w-full p-6 rounded-[2rem] border-slate-100 bg-slate-50/30 focus:ring-primary text-sm min-h-[400px] leading-relaxed" 
                        placeholder="Tuliskan butir-butir hasil rapat secara detail..." 
                    />
                </section>

                {/* Section Documentation */}
                <section className="bg-white p-6 md:p-8 rounded-[2rem] border border-primary/5 shadow-xl shadow-primary/5 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">photo_library</span> Lampiran Dokumentasi
                        </h2>
                        <label className="cursor-pointer bg-primary/5 text-primary px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 transition-colors">
                            <span className="material-symbols-outlined text-sm align-middle mr-1">add_photo_alternate</span> Tambah Gambar
                            <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                        </label>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {bottomDocumentation.map((img, idx) => (
                            <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-100">
                                <img src={img} className="w-full h-full object-cover" alt="Lampiran" />
                                <button onClick={() => setDocumentation(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full size-6 flex items-center justify-center shadow-lg"><span className="material-symbols-outlined text-xs">close</span></button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default MinutesForm;
