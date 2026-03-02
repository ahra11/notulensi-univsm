import React, { useState, useEffect } from 'react';
import { Page, Schedule } from '../types';
import { SpreadsheetService } from '../services/spreadsheet';

interface SchedulesProps {
    onNavigate: (page: Page) => void;
}

const Schedules: React.FC<SchedulesProps> = ({ onNavigate }) => {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    const [formData, setFormData] = useState({
        title: '', date: '', time: '', location: '', agenda: ''
    });

    // MENARIK JADWAL DARI GOOGLE SHEETS SAAT HALAMAN DIBUKA
    useEffect(() => {
        loadSchedules();
    }, []);

    const loadSchedules = async () => {
        setIsLoading(true);
        try {
            const data = await SpreadsheetService.getSchedules();
            setSchedules(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // MENGIRIM JADWAL BARU KE GOOGLE SHEETS
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        const newSchedule: Schedule = {
            id: `SCH-${Date.now()}`,
            ...formData,
            status: 'UPCOMING',
            createdBy: currentUser.name
        };

        try {
            await SpreadsheetService.addSchedule(newSchedule);
            const updatedSchedules = [newSchedule, ...schedules];
            setSchedules(updatedSchedules);
            
            setFormData({ title: '', date: '', time: '', location: '', agenda: '' });
            setIsFormOpen(false);
            alert("Jadwal berhasil dipublikasikan ke seluruh Civitas!");
        } catch (error) {
            alert("Gagal menyimpan jadwal ke Cloud.");
        } finally {
            setIsLoading(false);
        }
    };

    // MENGHAPUS JADWAL DARI GOOGLE SHEETS
    const handleDelete = async (id: string) => {
        if (window.confirm('Hapus jadwal rapat ini untuk semua orang?')) {
            setIsLoading(true);
            try {
                await SpreadsheetService.deleteSchedule(id);
                setSchedules(schedules.filter(s => s.id !== id));
            } catch (error) {
                alert("Gagal menghapus jadwal.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* BAGIAN ATAS (TETAP SAMA) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Penjadwalan Rapat</h1>
                        {isLoading && <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Atur dan pantau agenda pertemuan civitas USM (Global Sync)</p>
                </div>

                <div className="flex gap-2">
                    <button onClick={loadSchedules} className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all">
                        <span className="material-symbols-outlined">sync</span>
                    </button>
                    <button 
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#252859] text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-indigo-900/20 hover:brightness-110 transition-all"
                    >
                        <span className="material-symbols-outlined">{isFormOpen ? 'close' : 'calendar_add_on'}</span>
                        {isFormOpen ? 'Batal' : 'Buat Jadwal Baru'}
                    </button>
                </div>
            </div>

            {/* FORM INPUT (TETAP SAMA) */}
            {isFormOpen && (
                <div className="mb-10 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl animate-in zoom-in-95 duration-300">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Kegiatan / Rapat</label>
                            <input required type="text" placeholder="Contoh: Rapat Koordinasi PMB" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#252859] transition-all text-sm font-medium" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tanggal</label>
                            <input required type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#252859] transition-all text-sm font-medium" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Waktu</label>
                            <input required type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#252859] transition-all text-sm font-medium" />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Lokasi atau Tautan Meet</label>
                            <input required type="text" placeholder="Gedung Rektorat Lt. 2 / meet.google.com/..." value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#252859] transition-all text-sm font-medium" />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Agenda Pembahasan</label>
                            <textarea required placeholder="Tuliskan poin-poin agenda..." value={formData.agenda} onChange={(e) => setFormData({...formData, agenda: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#252859] transition-all text-sm font-medium min-h-[120px]" />
                        </div>
                        <div className="md:col-span-2">
                            <button disabled={isLoading} type="submit" className="w-full py-4 bg-[#252859] text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50">
                                {isLoading ? 'Menyimpan ke Cloud...' : 'Simpan dan Publikasikan Jadwal'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* DAFTAR JADWAL */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schedules.length > 0 ? schedules.map((schedule) => (
                    <div key={schedule.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                                <span className="material-symbols-outlined text-2xl">event</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full uppercase">
                                    {schedule.status || 'UPCOMING'}
                                </span>
                                {/* HANYA PEMBUAT JADWAL ATAU SUPER ADMIN YANG BISA MENGHAPUS */}
                                {(currentUser.role === 'SUPER_ADMIN' || currentUser.name === schedule.createdBy) && (
                                    <button onClick={() => handleDelete(schedule.id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                                        <span className="material-symbols-outlined text-xl">delete</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{schedule.title}</h3>
                        
                        <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-2 text-slate-500">
                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                <span className="text-xs font-medium">{schedule.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                                <span className="material-symbols-outlined text-sm">schedule</span>
                                <span className="text-xs font-medium">{schedule.time} WIB</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                                <span className="material-symbols-outlined text-sm">location_on</span>
                                <span className="text-xs font-medium truncate">{schedule.location}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Dibuat Oleh</span>
                                <span className="text-[10px] font-bold text-slate-700">{schedule.createdBy}</span>
                            </div>
                            <button onClick={() => onNavigate('form')} className="size-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-[#252859] hover:text-white transition-all" title="Buat Notulensi dari Jadwal ini">
                                <span className="material-symbols-outlined text-sm">edit_note</span>
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-20 text-center">
                        <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-4xl text-slate-200">calendar_today</span>
                        </div>
                        <p className="text-slate-400 font-medium">Belum ada jadwal rapat mendatang.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Schedules;
