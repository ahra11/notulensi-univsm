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

    // FITUR: Rekaman Suara
    const handleVoiceRecording = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return alert("Gunakan Google Chrome untuk fitur suara.");
        
        const recognition = new SpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setFormData(prev => ({ ...prev, content: prev.content + " " + transcript }));
        };
        recognition.start();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const minuteData = { id: initialData?.id || `M-${Date.now()}`, submittedBy: user.name, createdAt: new Date().toISOString(), ...formData };
        try {
            await SpreadsheetService.saveMinute(minuteData);
            alert('Notulensi Berhasil Disimpan!');
            onNavigate('history');
        } catch (error) {
            alert('Gagal Simpan. Cek Koneksi.');
        } finally { setIsLoading(false); }
    };

    return (
        <div className="p-4 md:p-8 animate-in fade-in duration-500">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black text-[#252859]">Notulensi Baru</h1>
                    <p className="text-sm text-slate-400 italic">Penyusun: {user.name}</p>
                </div>
                <button type="button" onClick={() => {
                    const ut = new SpeechSynthesisUtterance(formData.content);
                    ut.lang = 'id-ID'; window.speechSynthesis.speak(ut);
                }} className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:text-[#252859] transition-all">
                    <span className="material-symbols-outlined">volume_up</span>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
                {/* Baris 1: Informasi Utama */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Judul Rapat</label>
                        <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#252859]" placeholder="Contoh: Rapat Senat" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Tanggal</label>
                        <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#252859]" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Lokasi</label>
                        <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#252859]" placeholder="Gedung A / Zoom" />
                    </div>
                </div>

                {/* Agenda */}
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Agenda Rapat</label>
                    <textarea required value={formData.agenda} onChange={e => setFormData({...formData, agenda: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm min-h-[80px]" placeholder="Poin-poin pembahasan..." />
                </div>

                {/* Hasil Pembahasan + Mic */}
                <div className="space-y-1 relative">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Hasil Pembahasan (Gunakan Mic Jika Perlu)</label>
                    <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-[2rem] text-sm min-h-[250px] focus:ring-2 focus:ring-[#252859]" placeholder="Tuliskan detail rapat di sini..." />
                    <button type="button" onClick={handleVoiceRecording} className={`absolute bottom-6 right-6 size-12 rounded-full flex items-center justify-center shadow-lg transition-all ${isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-[#252859] text-white hover:scale-110'}`}>
                        <span className="material-symbols-outlined text-xl">{isListening ? 'mic' : 'mic_none'}</span>
                    </button>
                </div>

                <button type="submit" disabled={isLoading} className="w-full py-5 bg-[#252859] text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:brightness-110 transition-all">
                    {isLoading ? 'Menyimpan...' : 'Simpan Notulensi ke Cloud'}
                </button>
            </form>
        </div>
    );
};

export default MinutesForm;
