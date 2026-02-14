
import React, { useState, useRef, useEffect } from 'react';
import { Page, Minute } from '../types';
import { GoogleGenAI } from "@google/genai";
import { SpreadsheetService } from '../services/spreadsheet';

interface MinutesFormProps {
    onNavigate: (page: Page) => void;
    initialData?: Minute | null;
}

const MinutesForm: React.FC<MinutesFormProps> = ({ onNavigate, initialData }) => {
    const [title, setTitle] = useState(initialData?.title || "");
    const [location, setLocation] = useState(initialData?.location || "");
    const [date, setDate] = useState(initialData?.date || "");
    const [notulensi, setNotulensi] = useState(initialData?.content || "");
    const [meetLink, setMeetLink] = useState(initialData?.meetLink || "");
    const [documentation, setDocumentation] = useState<string[]>(initialData?.documentation || []);
    
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const isEditMode = !!initialData;

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };
            
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(audioBlob);
                setRecordedAudioUrl(url);
                await transcribeAudio(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };
            
            mediaRecorder.start();
            setIsRecording(true);
            setStatusMessage("Merekam...");
        } catch (err) {
            alert("Gagal mengakses mikrofon.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setStatusMessage("Menyiapkan transkripsi...");
        }
    };

    const transcribeAudio = async (audioBlob: Blob) => {
        setIsTranscribing(true);
        setStatusMessage("AI sedang memproses suara (Flash Mode)...");
        try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = (reader.result as string).split(',')[1];
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                
                // Gunakan prompt yang lebih singkat untuk kecepatan
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: {
                        parts: [
                            { text: "Transkripsikan audio rapat ini ke teks Bahasa Indonesia formal secara instan. Langsung ke inti pembicaraan." },
                            { inlineData: { mimeType: 'audio/webm', data: base64Audio } }
                        ]
                    }
                });
                
                const text = response.text || "";
                setNotulensi(prev => prev + (prev ? "\n\n" : "") + text);
                setIsTranscribing(false);
                setStatusMessage("Selesai!");
                setTimeout(() => setStatusMessage(""), 2000);
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
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setDocumentation(prev => [...prev, base64]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setDocumentation(prev => prev.filter((_, i) => i !== index));
    };

    const handleFormSubmit = async () => {
        if (!title || !notulensi) {
            alert("Judul dan Pembahasan tidak boleh kosong.");
            return;
        }

        setIsSubmitting(true);
        setStatusMessage(isEditMode ? "Memperbarui Data..." : "Menyinkronkan ke Cloud...");
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const payload = {
            id: initialData?.id || Date.now().toString(),
            title,
            location,
            date,
            content: notulensi,
            meetLink,
            documentation,
            submittedBy: initialData?.submittedBy || currentUser.name || "Anonim",
            updatedAt: new Date().toLocaleString('id-ID'),
            status: initialData?.status || 'DRAFT'
        };

        try {
            if (isEditMode) {
                await SpreadsheetService.updateData(payload.id, payload);
            } else {
                await SpreadsheetService.saveData(payload);
            }
            setStatusMessage("Berhasil disimpan!");
            setTimeout(() => onNavigate('history'), 1500);
        } catch (error) {
            alert("Gagal terhubung ke database.");
            setStatusMessage("");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="pb-32 md:pb-10 bg-slate-50/50 md:bg-white min-h-screen">
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-primary/5 px-4 md:px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => onNavigate('dashboard')} className="flex items-center justify-center size-10 rounded-full hover:bg-slate-50 transition-colors">
                        <span className="material-symbols-outlined text-slate-900">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-lg md:text-xl font-bold tracking-tight">{isEditMode ? 'Edit Notulensi' : 'Buat Notulensi'}</h1>
                        <span className="text-[9px] block text-green-600 font-bold uppercase tracking-widest -mt-0.5">Database Online Terhubung</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {statusMessage && (
                        <span className="hidden md:block text-[10px] font-bold text-primary bg-primary/5 px-3 py-1 rounded-full animate-pulse uppercase tracking-wider">
                            {statusMessage}
                        </span>
                    )}
                    <button 
                        onClick={handleFormSubmit}
                        disabled={isSubmitting}
                        className="bg-primary text-white px-6 md:px-8 py-2.5 rounded-xl shadow-lg shadow-primary/20 font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-sm">save</span>}
                        {isSubmitting ? 'Proses...' : (isEditMode ? 'Simpan Perubahan' : 'Simpan')}
                    </button>
                </div>
            </header>

            <div className="max-w-4xl mx-auto p-4 md:p-10 space-y-8">
                <section className="bg-white p-6 rounded-[2rem] border border-primary/5 shadow-2xl shadow-primary/5 space-y-6">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-base">info</span> Data Identitas Rapat
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Agenda / Rapat</label>
                            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full h-14 rounded-2xl border-slate-100 focus:ring-primary/20 focus:border-primary text-sm bg-slate-50/50 transition-all" placeholder="Misal: Rapat Peninjauan Kurikulum..." type="text" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tempat / Ruang</label>
                            <input value={location} onChange={e => setLocation(e.target.value)} className="w-full h-14 rounded-2xl border-slate-100 focus:ring-primary/20 focus:border-primary text-sm bg-slate-50/50" placeholder="Ruang Sidang 1..." type="text" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Waktu Pelaksanaan</label>
                            <input value={date} onChange={e => setDate(e.target.value)} className="w-full h-14 rounded-2xl border-slate-100 focus:ring-primary/20 focus:border-primary text-sm bg-slate-50/50" type="date" />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tautan Google Meet</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 text-lg">link</span>
                                <input value={meetLink} onChange={e => setMeetLink(e.target.value)} className="w-full h-14 pl-12 rounded-2xl border-slate-100 focus:ring-primary/20 focus:border-primary text-sm bg-slate-50/50" placeholder="https://meet.google.com/abc-defg-hij" type="url" />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white p-6 rounded-[2rem] border border-primary/5 shadow-2xl shadow-primary/5 space-y-6">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">description</span> Konten Notulensi
                        </h2>
                        <div className="flex items-center gap-2">
                            {isTranscribing && <div className="size-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>}
                            <button 
                                type="button"
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-md active:scale-95 ${isRecording ? 'bg-red-500 text-white shadow-red-200' : 'bg-primary/5 text-primary shadow-primary/5'}`}
                            >
                                <span className="material-symbols-outlined text-lg">{isRecording ? 'stop_circle' : 'mic'}</span>
                                {isRecording ? 'Selesai Rekam' : 'Input Suara'}
                            </button>
                        </div>
                    </div>

                    {recordedAudioUrl && (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Hasil Rekaman Terakhir:</span>
                            <audio src={recordedAudioUrl} controls className="w-full h-10" />
                        </div>
                    )}

                    <textarea 
                        value={notulensi}
                        onChange={(e) => setNotulensi(e.target.value)}
                        className="w-full p-6 rounded-[2rem] border-slate-100 focus:ring-primary/20 focus:border-primary text-sm resize-none bg-slate-50/50 leading-relaxed min-h-[400px]" 
                        placeholder="Tuliskan detail pembahasan di sini..." 
                    />
                </section>

                <section className="bg-white p-6 rounded-[2rem] border border-primary/5 shadow-2xl shadow-primary/5 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">photo_library</span> Screenshot & Dokumentasi
                        </h2>
                        <label className="cursor-pointer bg-primary/5 text-primary px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 transition-colors">
                            <span className="material-symbols-outlined text-sm align-middle mr-1">upload</span> Unggah Gambar
                            <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                        </label>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {documentation.map((img, idx) => (
                            <div key={idx} className="relative group aspect-video rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                                <img src={img} alt={`dok-${idx}`} className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-1 right-1 size-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <span className="material-symbols-outlined text-xs">close</span>
                                </button>
                            </div>
                        ))}
                        {documentation.length === 0 && (
                            <div className="col-span-full py-10 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                                <span className="material-symbols-outlined text-4xl text-slate-200">add_photo_alternate</span>
                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2">Belum ada screenshot rapat</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default MinutesForm;
