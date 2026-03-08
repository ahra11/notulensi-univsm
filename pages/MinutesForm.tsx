import React, { useState, useEffect, useRef } from 'react';
import { Page, Minute } from '../types';
import { SpreadsheetService } from '../services/spreadsheet';

const MinutesForm: React.FC<{ onNavigate: (page: Page, data?: any) => void; initialData?: Minute | null }> = ({ onNavigate, initialData }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    
    // Referensi untuk mesin pendeteksi suara
    const recognitionRef = useRef<any>(null);

    const [formData, setFormData] = useState<Partial<Minute>>({
        title: '',
        date: new Date().toISOString().split('T')[0],
        location: '',
        agenda: '',
        content: '',
        documentation: [], 
        gdriveLink: '', 
        status: 'DRAFT'
    });

    let user = { name: 'Staf USM' };
    try {
        user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    } catch (e) {
        console.warn("Memori user kosong");
    }

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                documentation: Array.isArray(initialData.documentation) ? initialData.documentation : []
            });
        }

        // INIT: Mesin Perekam Suara (Speech to Text)
        const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = false; // Hanya ambil teks yang sudah pasti (final)
            recognition.lang = 'id-ID'; // Setting ke Bahasa Indonesia

            recognition.onresult = (event: any) => {
                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        currentTranscript += event.results[i][0].transcript + '. ';
                    }
                }
                
                if (currentTranscript) {
                    // Gabungkan teks lama dengan teks baru hasil rekaman
                    setFormData(prev => ({
                        ...prev,
                        content: (prev.content ? prev.content + ' ' : '') + currentTranscript.trim()
                    }));
                }
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, [initialData]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (e) {
                console.error("Gagal memulai rekaman", e);
            }
        }
    };

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 300; 
                    const MAX_HEIGHT = 300;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                    } else {
                        if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    
                    if (ctx) {
                        ctx.fillStyle = "#FFFFFF";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0, width, height);
                    }

                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.3);
                    resolve(compressedDataUrl);
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const currentLength = formData.documentation?.length || 0;
        
        if (files.length + currentLength > 4) {
            alert("MAKSIMAL 4 FOTO!\n\nMohon batasi lampiran maksimal 4 foto saja agar tidak ditolak oleh server.");
            return;
        }

        setIsUploading(true);
        try {
            const allowedNewFiles = 4 - currentLength;
            const compressedImages = await Promise.all(
                Array.from(files).slice(0, allowedNewFiles).map(file => compressImage(file))
            );

            setFormData(prev => ({
                ...prev,
                documentation: [...(prev.documentation || []), ...compressedImages]
            }));
        } catch (error) {
            alert("Gagal memproses gambar.");
        } finally {
            setIsUploading(false);
            if (e.target) e.target.value = ''; 
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            documentation: prev.documentation?.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        const minuteData = { 
            id: initialData?.id || `M-${Date.now()}`, 
            submittedBy: initialData?.submittedBy || user.name, 
            createdAt: initialData?.createdAt || new Date().toISOString(), 
            ...formData 
        };

        const payload = {
            ...minuteData,
            actionType: initialData ? 'update' : 'create'
        };

        try {
            const response = await SpreadsheetService.postToCloud(payload);
            if (response && response.success === false) {
                throw new Error(response.message || response.error || "Ditolak Google Sheets.");
            }
            alert(initialData ? 'Penyelamatan Data Arsip Berhasil Diperbarui!' : 'Notulensi & Dokumentasi Berhasil Disimpan!');
            
            localStorage.removeItem('usm_minutes_cache'); 
            
            onNavigate('history');
        } catch (error: any) {
            alert('GAGAL SIMPAN KE SERVER!\n\nPastikan URL Google Script sudah benar di file spreadsheet.ts.\n\nPenyebab: ' + error.message);
        } finally { setIsLoading(false); }
    };

    return (
        <div className="p-4 md:p-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-black text-[#252859]">
                    {initialData ? 'Edit & Pulihkan Arsip' : 'Notulensi & Dokumentasi'}
                </h1>
                {initialData && <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-xl text-xs font-bold">Mode Edit Dokumen</span>}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#252859] outline-none transition-all shadow-sm" placeholder="Judul Rapat" />
                    <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#252859] outline-none transition-all shadow-sm" />
                    <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#252859] outline-none transition-all shadow-sm" placeholder="Lokasi" />
                </div>

                <div className="relative">
                    <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#252859] outline-none transition-all shadow-sm min-h-[200px]" placeholder="Hasil Pembahasan (Ketik manual atau gunakan Mikrofon di pojok kanan bawah)..." />
                    
                    {/* TOMBOL MIKROFON (SPEECH TO TEXT) */}
                    {recognitionRef.current && (
                        <button 
                            type="button" 
                            onClick={toggleListening} 
                            className={`absolute bottom-4 right-4 p-4 rounded-full flex items-center justify-center transition-all shadow-lg border border-transparent ${isListening ? 'bg-red-500 text-white animate-pulse border-red-300' : 'bg-slate-100 text-slate-500 hover:bg-[#252859] hover:text-white'}`}
                            title={isListening ? "Hentikan Rekaman" : "Mulai Dikte Suara (Speech to Text)"}
                        >
                            <span className="material-symbols-outlined">{isListening ? 'mic_off' : 'mic'}</span>
                        </button>
                    )}
                </div>

                <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Tautan Ekstra (Opsional)</label>
                    <input type="url" value={formData.gdriveLink || ''} onChange={e => setFormData({...formData, gdriveLink: e.target.value})} className="w-full mt-1 p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#252859] outline-none transition-all shadow-sm" placeholder="Link Google Drive untuk file besar / Video rapat..." />
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Lampiran Foto (Maksimal 4 Foto)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.documentation?.map((img, index) => (
                            <div key={index} className="relative group aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                                <img src={img} className="w-full h-full object-cover" alt="Preview" />
                                <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-red-500/90 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-600">
                                    <span className="material-symbols-outlined text-xs">delete</span>
                                </button>
                            </div>
                        ))}
                        
                        {(formData.documentation?.length || 0) < 4 && (
                            <label className={`flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed ${isUploading ? 'border-amber-300 bg-amber-50 text-amber-500' : 'border-slate-300 hover:border-[#252859] bg-slate-50 hover:bg-[#252859]/5 text-slate-400 hover:text-[#252859]'} cursor-pointer transition-all`}>
                                {isUploading ? (
                                    <>
                                        <div className="size-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                        <span className="text-[9px] font-bold uppercase tracking-widest">Memproses...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-2xl mb-1">add_a_photo</span>
                                        <span className="text-[9px] font-bold uppercase tracking-widest">Unggah Foto</span>
                                    </>
                                )}
                                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={isUploading} />
                            </label>
                        )}
                    </div>
                </div>

                <button type="submit" disabled={isLoading || isUploading} className="w-full py-5 bg-[#252859] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? 'Menyimpan Data ke Server...' : (initialData ? 'Perbarui Arsip Lama' : 'Simpan Notulensi & Foto')}
                </button>
            </form>
        </div>
    );
};

export default MinutesForm;
