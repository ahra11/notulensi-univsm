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
        documentation: [], // Kolom untuk menyimpan gambar Base64
        status: 'DRAFT'
    });

    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

    useEffect(() => {
        if (initialData) setFormData(initialData);
    }, [initialData]);

    // FUNGSI UNGGAL GAMBAR (DOKUMENTASI)
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const fileArray = Array.from(files);
            fileArray.forEach(file => {
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
            submittedBy: user.name, 
            createdAt: new Date().toISOString(), 
            ...formData 
        };
        try {
            await SpreadsheetService.saveMinute(minuteData);
            alert('Notulensi & Dokumentasi Berhasil Disimpan!');
            onNavigate('history');
        } catch (error) {
            alert('Gagal Simpan. Periksa Koneksi Internet.');
        } finally { setIsLoading(false); }
    };

    return (
        <div className="p-4 md:p-8 animate-in fade-in duration-500">
            <h1 className="text-2xl font-black text-[#252859] mb-8">Notulensi & Dokumentasi</h1>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
                {/* Input Teks (Judul, Tanggal, Lokasi) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="p-4 bg-slate-50 rounded-2xl text-sm" placeholder="Judul Rapat" />
                    <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="p-4 bg-slate-50 rounded-2xl text-sm" />
                    <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="p-4 bg-slate-50 rounded-2xl text-sm" placeholder="Lokasi" />
                </div>

                <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl text-sm min-h-[200px]" placeholder="Hasil Pembahasan..." />

                {/* --- BAGIAN DOKUMENTASI GAMBAR --- */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Lampiran Foto Kegiatan</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.documentation?.map((img, index) => (
                            <div key={index} className="relative group aspect-video rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                                <img src={img} className="w-full h-full object-cover" alt="Preview" />
                                <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                    <span className="material-symbols-outlined text-xs">delete</span>
                                </button>
                            </div>
                        ))}
                        <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-slate-200 hover:border-[#252859] cursor-pointer text-slate-400 transition-all">
                            <span className="material-symbols-outlined text-2xl">add_a_photo</span>
                            <span className="text-[9px] font-bold mt-1 uppercase">Unggah Foto</span>
                            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                        </label>
                    </div>
                </div>

                <button type="submit" disabled={isLoading} className="w-full py-5 bg-[#252859] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">
                    {isLoading ? 'Mengunggah Data...' : 'Simpan Notulensi & Foto'}
                </button>
            </form>
        </div>
    );
};

export default MinutesForm;
