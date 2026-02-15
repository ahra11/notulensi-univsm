import React, { useState, useEffect } from 'react';
import { Page, Minute } from '../types';
import { SpreadsheetService } from '../services/spreadsheet';

interface MinutesFormProps {
    onNavigate: (page: Page, data?: any) => void;
    initialData?: Minute | null;
}

const MinutesForm: React.FC<MinutesFormProps> = ({ onNavigate, initialData }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Minute>>({
        title: '',
        date: new Date().toISOString().split('T')[0], // Default tanggal hari ini
        location: '',
        agenda: '',
        content: '',
        documentation: [], 
        status: 'DRAFT'
    });

    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    // Handle Unggah Gambar Dokumentasi
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

        const minuteData: Minute = {
            id: initialData?.id || `M-${Date.now()}`,
            submittedBy: user.name,
            createdAt: new Date().toISOString(),
            ...formData as Minute
        };

        try {
            if (initialData) {
                await SpreadsheetService.updateMinute(minuteData.id, minuteData);
            } else {
                await SpreadsheetService.saveMinute(minuteData);
            }
            alert('Notulensi berhasil disimpan ke Cloud!');
            onNavigate('history');
        } catch (error) {
            alert('Gagal menyimpan. Pastikan koneksi internet stabil.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {initialData ? 'Edit Notulensi' : 'Buat Notulensi Baru'}
                </h1>
                <p className="text-sm text-slate-500 font-medium italic">Penyusun: {user.name}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
                {/* Baris 1: Judul, Tanggal, dan Lokasi */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1 md:col-span-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Judul Rapat</label>
                        <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#252859] transition-all" placeholder="Judul Rapat..." />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Tanggal Rapat</label>
                        <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#252859] transition-all" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Lokasi</label>
                        <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#252859] transition-all" placeholder="Ruang Rapat..." />
                    </div>
                </div>

                {/* Agenda */}
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Agenda Rapat</label>
                    <textarea required value={formData.agenda} onChange={e => setFormData({...formData, agenda: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm min-h-[100px] focus:ring-2 focus:ring-[#252859]" placeholder="Tuliskan poin-poin agenda rapat..." />
                </div>

                {/* Isi Notulensi */}
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Hasil Pembahasan</label>
                    <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm min-h-[250px] focus:ring-2 focus:ring-[#252859]" placeholder="Detail hasil pembahasan dan keputusan..." />
                </div>

                {/* Dokumentasi */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Dokumentasi (Lampiran Foto)</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {formData.documentation?.map((img, index) => (
                            <div key={index} className="relative group aspect-video rounded-xl overflow-hidden shadow-sm border border-slate-100">
                                <img src={img} className="w-full h-full object-cover" alt="Preview" />
                                <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                            </div>
                        ))}
                        <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-slate-200 hover:border-[#252859] hover:bg-slate-50 cursor-pointer transition-all text-slate-400">
                            <span className="material-symbols-outlined text-2xl">add_a_photo</span>
                            <span className="text-[9px] font-bold mt-1 uppercase">Tambah</span>
                            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                        </label>
                    </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex gap-3 pt-6">
                    <button type="submit" disabled={isLoading} className="flex-1 py-4 bg-[#252859] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-900/20 hover:brightness-110 active:scale-[0.98] transition-all">
                        {isLoading ? 'Menyambungkan ke Cloud...' : (initialData ? 'Update Notulensi' : 'Simpan Notulensi')}
                    </button>
                    <button type="button" onClick={() => onNavigate('dashboard')} className="px-8 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Batal</button>
                </div>
            </form>
        </div>
    );
};

export default MinutesForm;
