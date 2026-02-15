import React, { useState, useEffect } from 'react';
import { Page, Minute } from '../types';
import { SpreadsheetService } from '../services/spreadsheet';

const MinutesForm: React.FC<{ onNavigate: (page: Page, data?: any) => void; initialData?: Minute | null }> = ({ onNavigate, initialData }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [formData, setFormData] = useState<Partial<Minute>>({
        title: '',
        date: new Date().toISOString().split('T')[0],
        location: '',
        agenda: '',
        content: '',
        documentation: [],
        status: 'DRAFT'
    });

    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

    useEffect(() => {
        if (initialData) setFormData(initialData);
    }, [initialData]);

    // FITUR REKAM SUARA (Voice-to-Text)
    const handleVoiceRecording = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Browser ini tidak mendukung perekaman suara. Gunakan Google Chrome.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setFormData(prev => ({
                ...prev,
                content: prev.content + (prev.content ? ' ' : '') + transcript
            }));
        };
        recognition.start();
    };

    // FITUR BACAKAN TEKS (Text-to-Speech)
    const handleSpeak = (text: string) => {
        if (!text) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        window.speechSynthesis.speak(utterance);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFormData(prev => ({
                        ...prev,
                        documentation: [...(prev.documentation || []), reader.result as string]
                    }));
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const minuteData: Minute = {
            id: initialData?.id || `M-${Date.now()}`,
            submittedBy: user.name,
            createdAt: new Date().toISOString(),
            ...formData as Minute
        };

        try {
            initialData ? await SpreadsheetService.updateMinute(minuteData.id, minuteData) : await SpreadsheetService.saveMinute(minuteData);
            alert('Berhasil disimpan!');
            onNavigate('history');
        } catch (error) {
            alert('Gagal simpan ke cloud.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 animate-in fade-in duration-500">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{initialData ? 'Edit Notulensi' : 'Notulensi Baru'}</h1>
                    <p className="text-sm text-slate-500 italic">Penyusun: {user.name}</p>
                </div>
                {/* TOMBOL SPEAKER (Text-to-Speech) */}
                <button 
                    type="button"
                    onClick={() => handleSpeak(formData.content || '')}
                    className="p-3 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:text-[#252859] hover:bg-slate-50 transition-all shadow-sm"
                    title="Dengarkan Isi Notulensi"
                >
                    <span className="material-symbols-outlined">volume_up</span>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="p-4 bg-slate-50 border-none rounded-2xl text-sm" placeholder="Judul Rapat" />
                    <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="p-4 bg-slate-50 border-none rounded-2xl text-sm" />
                    <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="p-4 bg-slate-50 border-none rounded-2xl text-sm" placeholder="Lokasi" />
                </div>

                <div className="relative">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Hasil Pembahasan</label>
                    <textarea 
                        required 
                        value={formData.content} 
                        onChange={e => setFormData({...formData, content: e.target.value})} 
                        className="w-full p-6 bg-slate-50 border-none rounded-[2rem] text-sm min-h-[300px] focus:ring-2 focus:ring-[#252859]" 
                        placeholder="Tuliskan hasil rapat di sini..." 
                    />
                    
                    {/* TOMBOL MIKROFON (Voice-to-Text) */}
                    <button 
                        type="button"
                        onClick={handleVoiceRecording}
                        className={`absolute bottom-6 right-6 size-14 rounded-full flex items-center justify-center shadow-2xl transition-all ${isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-[#252859] text-white hover:scale-110'}`}
                    >
                        <span className="material-symbols-outlined text-2xl">{isListening ? 'mic' : 'mic_none'}</span>
                    </button>
                </div>

                {/* Dokumentasi */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Dokumentasi</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {formData.documentation?.map((img, index) => (
                            <div key={index} className="aspect-video rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                                <img src={img} className="w-full h-full object-cover" alt="Preview" />
                            </div>
                        ))}
                        <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-slate-200 hover:border-[#252859] cursor-pointer text-slate-400">
                            <span className="material-symbols-outlined">add_a_photo</span>
                            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                        </label>
                    </div>
                </div>

                <button type="submit" disabled={isLoading} className="w-full py-4 bg-[#252859] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-900/20 hover:brightness-110">
                    {isLoading ? 'Menyimpan...' : 'Simpan Notulensi ke Cloud'}
                </button>
            </form>
        </div>
    );
};

export default MinutesForm;
